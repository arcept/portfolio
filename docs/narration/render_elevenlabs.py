#!/usr/bin/env python3
"""Render narration.mp3 + narration.json with ElevenLabs, in the same format the Kokoro renderer writes,
so build_player.py needs no changes.

Setup:
    pip install requests numpy
    export ELEVENLABS_API_KEY=...        # elevenlabs.io > profile > API keys (free account is fine)
    # ffmpeg must be on PATH

Typical run:
    python render_elevenlabs.py --list-voices          # find a voice_id you like
    python render_elevenlabs.py --voice-id <ID> --only 2   # cheap test: first 2 paragraphs only
    python render_elevenlabs.py --voice-id <ID>            # full render (asks before spending credits)

Credit safety:
  * Prints characters needed vs. credits left on your account before it spends anything, and stops if short.
  * Every paragraph response is cached in out_elevenlabs/cache/. Re-running with unchanged text, voice and
    settings costs 0 credits. Only paragraphs you edited are re-generated.
  * Free plan: ~10,000 credits/month, 1 credit per character on eleven_multilingual_v2 (this script's
    default). The full script is about 3,700 characters. The free plan requires attribution and is
    non-commercial; the player footer already names the engine. Check ElevenLabs' current terms.

How timing works: the /with-timestamps endpoint returns audio plus the start and end time of every
character. Each word's time is the time of its first and last character, so the highlight is exact.
This script has not been run against the live API from the sandbox it was written in. Do a
--only 1 run first (about 200 credits) and look at the printed timing sanity check.
"""
import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys

import numpy as np
import requests

from common import assemble_narration, build_units, load_script, save_json

API = "https://api.elevenlabs.io"
SR = 24000
GAP_PARAGRAPH, GAP_CHAPTER, LEAD_IN, TAIL = 0.60, 1.00, 0.35, 0.60
# Adam (a premade voice). Confirm with --list-voices; premade voices work on free accounts via the API.
DEFAULT_VOICE = "pNInz6obpgDQGcFmaJgB"


def headers():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("Set ELEVENLABS_API_KEY first.")
    return {"xi-api-key": key, "Content-Type": "application/json"}


def list_voices():
    r = requests.get(f"{API}/v1/voices", headers=headers(), timeout=30)
    r.raise_for_status()
    for v in r.json().get("voices", []):
        labels = v.get("labels", {}) or {}
        print(f'{v["voice_id"]}  {v["name"]:<22} {v.get("category", ""):<10} '
              f'{labels.get("accent", "")} {labels.get("gender", "")} {labels.get("descriptive", "")}')


def credits_left():
    try:
        r = requests.get(f"{API}/v1/user/subscription", headers=headers(), timeout=30)
        r.raise_for_status()
        j = r.json()
        return j["character_limit"] - j["character_count"], j.get("tier", "?")
    except Exception as e:  # not fatal
        print("(could not read credit balance:", e, ")")
        return None, "?"


def decode(audio_bytes, fmt):
    """-> float32 mono array at SR."""
    if fmt.startswith("pcm_"):
        rate = int(fmt.split("_")[1])
        x = np.frombuffer(audio_bytes, dtype="<i2").astype(np.float32) / 32768.0
        if rate == SR:
            return x
        audio_bytes, fmt = x.tobytes(), "f32le"
        cmd = ["ffmpeg", "-loglevel", "error", "-f", "f32le", "-ar", str(rate), "-ac", "1", "-i", "pipe:0",
               "-f", "f32le", "-ar", str(SR), "-ac", "1", "pipe:1"]
        return np.frombuffer(subprocess.run(cmd, input=audio_bytes, capture_output=True, check=True).stdout, dtype="<f4")
    cmd = ["ffmpeg", "-loglevel", "error", "-i", "pipe:0", "-f", "f32le", "-ar", str(SR), "-ac", "1", "pipe:1"]
    return np.frombuffer(subprocess.run(cmd, input=audio_bytes, capture_output=True, check=True).stdout, dtype="<f4")


def tts_paragraph(text, prev_text, next_text, args, cache_dir):
    """One with-timestamps call, cached on disk. Returns the parsed JSON response."""
    settings = {"stability": args.stability, "similarity_boost": args.similarity,
                "style": args.style, "use_speaker_boost": True}
    key = hashlib.sha256(json.dumps([text, args.voice_id, args.model, args.format, settings],
                                    sort_keys=True).encode()).hexdigest()[:20]
    path = os.path.join(cache_dir, f"{key}.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f), True
    body = {"text": text, "model_id": args.model, "voice_settings": settings}
    if prev_text:
        body["previous_text"] = prev_text
    if next_text:
        body["next_text"] = next_text
    r = requests.post(f"{API}/v1/text-to-speech/{args.voice_id}/with-timestamps",
                      params={"output_format": args.format}, headers=headers(), json=body, timeout=180)
    if r.status_code != 200:
        sys.exit(f"ElevenLabs error {r.status_code}: {r.text[:500]}")
    j = r.json()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(j, f)
    return j, False


def words_from_alignment(par_text, al, n_words):
    """Map per-character timings onto the paragraph's space-separated words.
    Exact when ElevenLabs echoes our text unchanged (it should: the script is already spelled out for speech)."""
    chars = al["characters"]
    st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
    exact = "".join(chars) == par_text
    if not exact:
        print("  note: alignment text differs from the input; using a proportional mapping for this paragraph")
    L, out, i = len(chars), [], 0
    for w in par_text.split(" "):
        if exact:
            a, b = i, i + len(w) - 1
        else:
            a = min(L - 1, round(i * L / len(par_text)))
            b = min(L - 1, max(a, round((i + len(w) - 1) * L / len(par_text))))
        out.append((st[a], en[b]))
        i += len(w) + 1
    assert len(out) == n_words, "word count mismatch between script and alignment"
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", default="script.json")
    ap.add_argument("--voice-id", default=os.environ.get("ELEVENLABS_VOICE_ID", DEFAULT_VOICE))
    ap.add_argument("--model", default="eleven_multilingual_v2")
    ap.add_argument("--format", default="pcm_24000", help="fallback if rejected: mp3_44100_128")
    ap.add_argument("--stability", type=float, default=0.5)
    ap.add_argument("--similarity", type=float, default=0.75)
    ap.add_argument("--style", type=float, default=0.0)
    ap.add_argument("--only", type=int, default=0, help="render only the first N paragraphs (cheap test)")
    ap.add_argument("--list-voices", action="store_true")
    ap.add_argument("--yes", action="store_true", help="skip the confirmation prompt")
    ap.add_argument("--out", default="out_elevenlabs")
    args = ap.parse_args()

    if args.list_voices:
        return list_voices()

    script = load_script(args.script)
    units = build_units(script)

    # group sentence units into paragraphs (one API call each, for natural prosody across sentences)
    pars = []
    for u in units:
        if not pars or (pars[-1]["ci"], pars[-1]["pi"]) != (u["ci"], u["pi"]):
            pars.append({"ci": u["ci"], "pi": u["pi"], "units": []})
        pars[-1]["units"].append(u)
    for p in pars:
        p["text"] = " ".join(u["say"] for u in p["units"])
    if args.only:
        pars = pars[: args.only]
        keep = {(p["ci"], p["pi"]) for p in pars}
        units = [u for u in units if (u["ci"], u["pi"]) in keep]

    chars = sum(len(p["text"]) for p in pars)
    left, tier = credits_left()
    print(f"{len(pars)} paragraphs, {chars} characters (about {chars} credits on {args.model}). "
          f"Plan: {tier}. Credits left: {left if left is not None else 'unknown'}.")
    if left is not None and chars > left:
        sys.exit("Not enough credits left for this run. Use --only N, or wait for the monthly reset. "
                 "(Cached paragraphs are free, so re-runs of unchanged text cost nothing.)")
    if not args.yes and input("Proceed? [y/N] ").strip().lower() != "y":
        return

    cache = os.path.join(args.out, "cache")
    os.makedirs(cache, exist_ok=True)

    chunks, timings, cursor = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)], [], LEAD_IN
    spent = 0
    for n, p in enumerate(pars):
        prev_t = pars[n - 1]["text"][-300:] if n else None
        next_t = pars[n + 1]["text"][:300] if n + 1 < len(pars) else None
        j, hit = tts_paragraph(p["text"], prev_t, next_t, args, cache)
        spent += 0 if hit else len(p["text"])
        audio = decode(base64.b64decode(j["audio_base64"]), args.format)
        al = j.get("alignment") or j["normalized_alignment"]
        flat_words = [w for u in p["units"] for w in u["words"]]
        wt = words_from_alignment(p["text"], al, len(flat_words))
        k = 0
        for u in p["units"]:
            ws = [(cursor + a, cursor + b) for a, b in wt[k:k + len(u["words"])]]
            k += len(u["words"])
            timings.append({"start": ws[0][0], "end": ws[-1][1], "words": ws})
        chunks.append(audio)
        cursor += len(audio) / SR
        nxt = pars[n + 1] if n + 1 < len(pars) else None
        gap = TAIL if nxt is None else (GAP_CHAPTER if nxt["ci"] != p["ci"] else GAP_PARAGRAPH)
        chunks.append(np.zeros(int(gap * SR), dtype=np.float32))
        cursor += gap
        print(f"[{n + 1}/{len(pars)}] {cursor:6.1f}s {'cache' if hit else 'API  '} {p['text'][:56]}...")

    # each word ends where the next begins (inside a paragraph) so the highlight has no holes
    flat = [(ti, wi) for ti, t in enumerate(timings) for wi in range(len(t["words"]))]
    par_of = [(u["ci"], u["pi"]) for u in units]
    for (ta, wa), (tb, wb) in zip(flat, flat[1:]):
        if par_of[ta] == par_of[tb]:
            s, _ = timings[ta]["words"][wa]
            timings[ta]["words"][wa] = (s, timings[tb]["words"][wb][0])

    os.makedirs(args.out, exist_ok=True)
    raw = os.path.join(args.out, "narration_raw.f32")
    np.concatenate(chunks).astype("<f4").tofile(raw)
    mp3 = os.path.join(args.out, "narration.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", raw,
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ac", "1", "-b:a", "96k", mp3], check=True)
    dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).decode())
    meta = {"engine": "elevenlabs", "voice": args.voice_id, "model": args.model,
            "audio": "narration.mp3", "duration": round(dur, 3)}
    save_json(assemble_narration(script, units, timings, meta), os.path.join(args.out, "narration.json"))
    print(f"\nDone: {dur:.1f}s. Credits spent this run: about {spent}. "
          f"Now: python build_player.py --narration {args.out}/narration.json --audio {args.out}/narration.mp3 --page <your page>")


if __name__ == "__main__":
    main()
