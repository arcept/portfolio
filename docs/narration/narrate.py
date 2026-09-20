#!/usr/bin/env python3
"""narrate.py — from a written script and an MP3 you made on the ElevenLabs website, to the narration on the page.

    script.md ──(script)──► script.json + for-elevenlabs.txt        paste the text into ElevenLabs, export an MP3
    your.mp3  ──(align)───► out/narration.json + out/narration.mp3   works out when every word is spoken
    out/*     ──(publish)─► public/case-studies/placement-hub/narration/

Commands (see WORKFLOW.md for the whole story):

    python3 docs/narration/narrate.py script
    docs/narration/.venv/bin/python docs/narration/narrate.py align ~/Downloads/my-export.mp3 --voice "Adam"
    python3 docs/narration/narrate.py publish

`align` needs the speech tools in docs/narration/.venv (stable-ts, which uses OpenAI's Whisper) and ffmpeg. It runs
entirely on this Mac: nothing is uploaded. It aligns YOUR script to the audio rather than transcribing the audio,
so the words on the page are always exactly the words you wrote. A second pass listens to the audio anyway and
tells you where the voice skipped, added or changed a word, which is the thing to catch before publishing.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
PUBLIC = REPO / "public" / "case-studies" / "placement-hub" / "narration"
OUT = HERE / "out"
sys.path.insert(0, str(HERE))

import narrate_lib as L  # noqa: E402
from common import assemble_narration, save_json, spoken_word  # noqa: E402  (the kit's own helpers)


# ----------------------------------------------------------------------------- helpers

def read_script(md_path):
    md = Path(md_path)
    if not md.exists():
        sys.exit(f"{md} not found. Write your script there (see WORKFLOW.md).")
    try:
        return L.parse_markdown_script(md.read_text(encoding="utf-8"))
    except ValueError as err:
        sys.exit(f"script.md: {err}")


def write_script_json(script):
    save_json(script, HERE / "script.json")


def probe_duration(path):
    """Length of an audio file in seconds, measured (ffprobe, else macOS afinfo)."""
    try:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
        return float(out.stdout.strip())
    except (FileNotFoundError, subprocess.CalledProcessError, ValueError):
        pass
    try:
        out = subprocess.run(["afinfo", str(path)], capture_output=True, text=True, check=True).stdout
        return float(re.search(r"estimated duration:\s*([\d.]+)", out).group(1))
    except Exception:
        sys.exit("Could not measure the audio's length: install ffmpeg (brew install ffmpeg).")


def run_node_validator(narration_path, script_path):
    if not shutil.which("node"):
        print("(node not found: skipping scripts/validate-narration.mjs)")
        return True
    result = subprocess.run(
        ["node", str(REPO / "scripts" / "validate-narration.mjs"), "--narration", str(narration_path), "--script", str(script_path)],
        capture_output=True, text=True, cwd=REPO,
    )
    print(result.stdout.rstrip())
    if result.stderr.strip():
        print(result.stderr.rstrip())
    return result.returncode == 0


# ----------------------------------------------------------------------------- script

def cmd_script(args):
    script = read_script(args.md)
    write_script_json(script)
    stats = L.script_stats(script)

    plain = L.plain_text_for_voice(script)
    (HERE / "for-elevenlabs.txt").write_text(plain, encoding="utf-8")
    pron = script.get("pronounce") or {}
    if pron:
        spoken = L.plain_text_for_voice(script, spoken=True, pronounce_fn=lambda w: spoken_word(w, pron))
        (HERE / "for-elevenlabs-spoken.txt").write_text(spoken, encoding="utf-8")

    m, s = divmod(stats["estimated_seconds"], 60)
    print(f'Script: "{script["title"]}"')
    print(f'  {stats["chapters"]} chapters, {stats["paragraphs"]} paragraphs, {stats["words"]} words, {stats["characters"]} characters')
    print(f"  about {m}:{s:02d} spoken at a normal pace (an estimate; the real length is the audio's)")
    print(f'  ElevenLabs credits: about {stats["characters"]} (1 per character on the standard model; a free account has ~10,000 a month)')
    print()
    for ch in script["chapters"]:
        print(f'  {ch["id"]:<12} anchor={ch["anchor"]:<12} {len(ch["paragraphs"])} paragraph(s)  “{ch["label"]}”')
    warnings = L.lint_script(script)
    if warnings:
        print("\nWorth a look (these never block anything):")
        for w in warnings:
            print("  -", w)
    print("\nWrote:")
    print("  docs/narration/script.json            (what the tools read)")
    print("  docs/narration/for-elevenlabs.txt     (paste this into ElevenLabs: no headings, so nothing extra is read aloud)")
    if pron:
        print("  docs/narration/for-elevenlabs-spoken.txt  (same, with your pronunciation overrides written in)")
    print("\nNext: generate the audio on the ElevenLabs website, export the MP3, then run `align` (see WORKFLOW.md).")


# ----------------------------------------------------------------------------- align

def cmd_align(args):
    try:
        import stable_whisper
    except ImportError:
        sys.exit("The speech tools are not available in this Python. Run this command with the project's environment:\n"
                 "  docs/narration/.venv/bin/python docs/narration/narrate.py align <your.mp3>\n"
                 "(set it up once with: python3 -m venv docs/narration/.venv && docs/narration/.venv/bin/pip install stable-ts, and brew install ffmpeg)")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is needed to read the audio: brew install ffmpeg")

    src = Path(args.audio).expanduser()
    if not src.exists():
        sys.exit(f"{src} not found")

    script = read_script(args.md)
    write_script_json(script)
    out = Path(args.out).expanduser()
    out.mkdir(parents=True, exist_ok=True)
    final = out / "narration.mp3"

    # The audio that ships is the audio that is aligned, so its length and timings can never disagree.
    if args.compress:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", "-b:a", "64k", str(final)], check=True)
        print(f"Compressed to mono 64 kbps: {src.stat().st_size / 1e6:.1f} MB -> {final.stat().st_size / 1e6:.1f} MB")
    else:
        shutil.copyfile(src, final)
    duration = probe_duration(final)
    version = hashlib.sha1(final.read_bytes()).hexdigest()[:10]

    words = L.script_words(script)
    units = L.build_units_from_script(script)
    print(f"Script: {len(words)} words in {len(units)} sentences. Audio: {duration:.1f}s. Loading the '{args.model}' model (the first run downloads it)…")
    model = stable_whisper.load_model(args.model, device="cpu")

    t0 = time.time()
    print("Aligning your script to the audio…")
    result = model.align(str(final), " ".join(words), language="en", verbose=None)
    heard_timed = [(w.word.strip(), w.start, w.end, getattr(w, "probability", 1.0) or 0.0) for seg in result.segments for w in seg.words]
    print(f"  done in {time.time() - t0:.0f}s: {len(heard_timed)} timed words for {len(words)} script words")

    times = L.map_words_to_script(words, heard_timed)
    shaped = L.shape_timings(units, times)
    meta = {
        "engine": args.engine or script.get("engine") or "elevenlabs",
        "voice": args.voice or script.get("voice") or "",
        "audio": "narration.mp3",
        "duration": round(duration, 3),
        "version": version,
    }
    narration = assemble_narration(script, units, shaped, meta)
    save_json(narration, out / "narration.json")

    text_issues = []
    if not args.fast:
        t0 = time.time()
        print("Listening to the audio as well, to check the voice read your words…")
        heard = model.transcribe(str(final), language="en", verbose=None)
        heard_words, heard_times = [], []
        for seg in heard.segments:
            for w in seg.words:
                for piece in w.word.split():
                    heard_words.append(piece)
                    heard_times.append((w.start, w.end))
        heard_words, heard_times = L.merge_split_numbers(heard_words, heard_times)
        speech = [(t["start"], t["end"]) for t in shaped]
        text_issues = L.compare_text(words, heard_words, heard_times=heard_times, speech_spans=speech, evidence=times)
        print(f"  done in {time.time() - t0:.0f}s")

    notes = L.quality_report(units, shaped, words, text_issues, raw_times=times)
    (out / "alignment-report.txt").write_text("\n".join(notes) + ("\n" if notes else ""), encoding="utf-8")

    print(f"\nWrote {out}/narration.json and narration.mp3  (engine {meta['engine']}, voice “{meta['voice']}”, version {version})")
    print()
    if notes:
        print(f"REVIEW — {len(notes)} thing(s) to look at (full list: {out}/alignment-report.txt):")
        for n in notes[:25]:
            print("  ", n)
        if len(notes) > 25:
            print(f"   … and {len(notes) - 25} more")
        print("\nTEXT notes: listen to that spot. If the voice really skipped or changed words, regenerate that paragraph on ElevenLabs.")
        print("TIME / GAP notes are about pacing (a long pause, a very quick stretch): fine unless it sounds wrong.")
    else:
        print("Nothing stands out: every word was found and timed sensibly.")
    print("\nSchema check:")
    ok = run_node_validator(out / "narration.json", HERE / "script.json")
    print("\nNext: `publish` copies these into the site." if ok else "\nFix the errors above before publishing.")
    sys.exit(0 if ok else 1)


# ----------------------------------------------------------------------------- publish

def cmd_publish(args):
    out = Path(args.out).expanduser()
    src_json, src_mp3 = out / "narration.json", out / "narration.mp3"
    if not src_json.exists() or not src_mp3.exists():
        sys.exit("Nothing to publish: run `align` first (docs/narration/out/narration.json and narration.mp3).")
    narration = json.loads(src_json.read_text(encoding="utf-8"))
    print("Checking before publishing…")
    if not run_node_validator(src_json, HERE / "script.json"):
        sys.exit("Not published: fix the errors above first.")

    # Per-section "Listen to this part" buttons are placed by hand in sections.js: keep them in step with the chapters.
    page = REPO / "app" / "case-study-placement" / "sections.js"
    if page.exists():
        buttons = set(re.findall(r'<ListenToSection id="([\w-]+)"', page.read_text(encoding="utf-8")))
        chapters = {c["id"] for c in narration["chapters"] if c["anchor"] != "top"}
        for gone in sorted(buttons - chapters):
            print(f'  warning: sections.js has a "Listen to this part" button for "{gone}", but the narration has no such chapter (the button will not show).')
        for new in sorted(chapters - buttons):
            print(f'  warning: the narration has a chapter "{new}" with no "Listen to this part" button in sections.js.')

    dest = Path(args.to).expanduser()
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src_json, dest / "narration.json")
    shutil.copyfile(src_mp3, dest / "narration.mp3")
    where = dest.relative_to(REPO) if REPO in dest.parents else dest
    print(f"\nPublished to {where}/  ({narration['engine']}, {narration['voice'] or 'voice not named'}, {narration['duration']}s)")
    print("Now: look at it on the page (open the panel, or /case-study-placement?listen=1), run `npm run validate:narration`,")
    print("and commit docs/narration/script.md, script.json and the two files under public/.")


# ----------------------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("script", help="read script.md; write script.json and the text to paste into ElevenLabs")
    s.add_argument("--md", default=str(HERE / "script.md"))
    s.set_defaults(fn=cmd_script)

    a = sub.add_parser("align", help="align script.md to an exported MP3; write out/narration.json")
    a.add_argument("audio", help="the MP3 exported from ElevenLabs")
    a.add_argument("--md", default=str(HERE / "script.md"))
    a.add_argument("--engine", help="names the voice engine in the page's disclosure (default: from script.md, else elevenlabs)")
    a.add_argument("--voice", help="the voice's name, for the record")
    a.add_argument("--model", default="small.en", help="Whisper model: base.en (faster), small.en (default, about 45 s for 4 minutes), medium.en (slower, sharper)")
    a.add_argument("--compress", action="store_true", help="re-encode to mono 64 kbps (about half the size) before aligning")
    a.add_argument("--out", default=str(OUT), help="where to write narration.json and narration.mp3 (default: docs/narration/out)")
    a.add_argument("--fast", action="store_true", help="skip the second pass that checks the voice read your words")
    a.set_defaults(fn=cmd_align)

    b = sub.add_parser("publish", help="validate out/ and copy it into public/")
    b.add_argument("--out", default=str(OUT))
    b.add_argument("--to", default=str(PUBLIC), help="where to publish (default: the site's public/ folder; use another folder to rehearse)")
    b.set_defaults(fn=cmd_publish)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
