#!/usr/bin/env python3
"""Render narration.mp3 + narration.json with Kokoro (free, local, no account).

Setup (once):
    pip install kokoro-onnx soundfile numpy
    # model files (full-precision; the int8 file gave near-silent output in testing):
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
    # ffmpeg must be on PATH

Run:
    python render_kokoro.py                       # voice am_michael, speed 1.0
    python render_kokoro.py --voice af_heart --speed 1.05
"""
import argparse
import subprocess
import sys
import time

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from common import assemble_narration, build_units, load_script, save_json

SR = 24000
GAP_SENTENCE, GAP_PARAGRAPH, GAP_CHAPTER = 0.30, 0.60, 1.00
LEAD_IN, TAIL = 0.35, 0.60
FRAME = int(SR * 0.010)  # 10 ms frames

# extra "time weight" (in phoneme units) a punctuation mark adds after a word
PUNCT_WEIGHT = {",": 2.2, ";": 3.0, ":": 3.0, "—": 3.0, "–": 2.0}


def frame_rms(x):
    n = len(x) // FRAME
    if n == 0:
        return np.zeros(1)
    return np.sqrt((x[: n * FRAME].reshape(n, FRAME) ** 2).mean(axis=1))


def trim(x):
    """Trim leading/trailing silence, keep 25 ms of pad. Returns (audio, first_frame_offset_s)."""
    r = frame_rms(x)
    thr = max(0.004, 0.06 * np.percentile(r, 90))
    voiced = np.where(r > thr)[0]
    if len(voiced) == 0:
        return x, 0.0
    a = max(0, voiced[0] * FRAME - int(0.025 * SR))
    b = min(len(x), (voiced[-1] + 1) * FRAME + int(0.025 * SR))
    return x[a:b], a / SR


def internal_gaps(x):
    """Silent stretches (>= 60 ms) inside a trimmed sentence -> list of (start_s, end_s)."""
    r = frame_rms(x)
    thr = max(0.004, 0.06 * np.percentile(r, 90))
    quiet = r <= thr
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) >= 6 and i > 3 and j < len(quiet) - 3:
                gaps.append((i * 0.010, j * 0.010))
            i = j
        else:
            i += 1
    return gaps


def word_weights(k, words, lang):
    weights, breaks = [], []
    for i, w in enumerate(words):
        core = "".join(ch for ch in w if ch.isalnum() or ch in "'’-")
        try:
            ph = k.tokenizer.phonemize(core.replace("’", "'"), lang) if core else ""
        except Exception:
            ph = core
        weights.append(max(2.0, float(len(ph))))
        tail = w[-1] if w else ""
        if tail in PUNCT_WEIGHT and i < len(words) - 1:
            breaks.append(i)  # a pause is expected after word i
    return weights, breaks


def time_words(k, unit_words, audio, lang):
    """Return [(start,end)] per word, relative to the start of the trimmed sentence audio."""
    dur = len(audio) / SR
    weights, breaks = word_weights(k, unit_words, lang)
    gaps = internal_gaps(audio)

    def spread(idxs, t0, t1):
        wsum = sum(weights[i] for i in idxs) or 1.0
        t, out = t0, {}
        for i in idxs:
            d = (t1 - t0) * weights[i] / wsum
            out[i] = (t, t + d)
            t += d
        return out

    n = len(unit_words)
    # Preferred: snap punctuation breaks to real silences when the counts line up.
    if breaks and len(gaps) >= len(breaks):
        chosen = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(breaks)])
        segs, start_i, t0 = [], 0, 0.0
        for b, g in zip(breaks, chosen):
            segs.append((list(range(start_i, b + 1)), t0, g[0]))
            start_i, t0 = b + 1, g[1]
        segs.append((list(range(start_i, n)), t0, dur))
        res = {}
        for idxs, a, b in segs:
            if idxs:
                res.update(spread(idxs, a, max(b, a + 0.05)))
        # word ends stretch to the next word's start so the highlight never has holes
        out = [res[i] for i in range(n)]
        return out, "snapped"
    # Fallback: weights only (punctuation pauses folded into the word before them).
    w2 = list(weights)
    for i, w in enumerate(unit_words):
        if w and w[-1] in PUNCT_WEIGHT and i < n - 1:
            w2[i] += PUNCT_WEIGHT[w[-1]]
    tot = sum(w2)
    t, out = 0.0, []
    for i in range(n):
        d = dur * w2[i] / tot
        out.append((t, t + d))
        t += d
    return out, "weighted"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", default="script.json")
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--lang", default="en-us")
    ap.add_argument("--model", default="kokoro-v1.0.onnx")
    ap.add_argument("--voices", default="voices-v1.0.bin")
    ap.add_argument("--out", default="out")
    args = ap.parse_args()

    import os
    os.makedirs(args.out, exist_ok=True)
    script = load_script(args.script)
    units = build_units(script)
    k = Kokoro(args.model, args.voices)

    chunks, timings, modes = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)], [], []
    cursor = LEAD_IN
    t_start = time.time()
    for n, u in enumerate(units):
        audio, _ = k.create(u["say"], voice=args.voice, speed=args.speed, lang=args.lang)
        audio = audio.astype(np.float32)
        audio, _ = trim(audio)
        rel, mode = time_words(k, u["words"], audio, args.lang)
        modes.append(mode)
        timings.append({
            "start": cursor, "end": cursor + len(audio) / SR,
            "words": [(cursor + a, cursor + b) for a, b in rel],
        })
        chunks.append(audio)
        cursor += len(audio) / SR
        # gap after this sentence
        nxt = units[n + 1] if n + 1 < len(units) else None
        if nxt is None:
            gap = TAIL
        elif nxt["ci"] != u["ci"]:
            gap = GAP_CHAPTER
        elif nxt["pi"] != u["pi"]:
            gap = GAP_PARAGRAPH
        else:
            gap = GAP_SENTENCE
        chunks.append(np.zeros(int(gap * SR), dtype=np.float32))
        cursor += gap
        print(f"[{n + 1}/{len(units)}] {cursor:6.1f}s  {mode:8s} {u['text'][:60]}", flush=True)

    # make every word end where the next word begins (no holes in the highlight)
    flat = [(ti, wi) for ti, t in enumerate(timings) for wi in range(len(t["words"]))]
    for (ta, wa), (tb, wb) in zip(flat, flat[1:]):
        if ta == tb:
            s, _ = timings[ta]["words"][wa]
            timings[ta]["words"][wa] = (s, timings[tb]["words"][wb][0])

    full = np.concatenate(chunks)
    wav = f"{args.out}/narration_raw.wav"
    sf.write(wav, full, SR)
    mp3 = f"{args.out}/narration.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", wav,
        "-af", "highpass=f=70,acompressor=threshold=-21dB:ratio=2.5:attack=8:release=120:makeup=2,"
               "loudnorm=I=-16:TP=-1.5:LRA=9",
        "-ac", "1", "-ar", "24000", "-b:a", "64k", mp3], check=True)

    dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).decode())
    meta = {"engine": "kokoro", "voice": args.voice, "speed": args.speed,
            "audio": "narration.mp3", "duration": round(dur, 3)}
    save_json(assemble_narration(script, units, timings, meta), f"{args.out}/narration.json")
    snapped = modes.count("snapped")
    print(f"\nDone. {dur:.1f}s ({int(dur // 60)}:{int(dur % 60):02d}), rendered in {time.time() - t_start:.0f}s. "
          f"Word timing: {snapped} sentences snapped to real pauses, {len(modes) - snapped} weighted.")


if __name__ == "__main__":
    sys.exit(main())
