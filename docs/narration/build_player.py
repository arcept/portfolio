#!/usr/bin/env python3
"""Build the narration player from narration.json + narration.mp3.

    python build_player.py --narration out/narration.json --audio out/narration.mp3 \
                           --page case-study.html --out-dir dist

Writes:
  dist/narration-player.html          the player alone, in the case study's design tokens (for review)
  dist/case-study-with-narration.html your case-study page with the player inserted under the masthead
                                      and id="s1".."s7" added to the sections (so "Go to section" works)

The audio is inlined as a data: URI, because a published Claude artifact cannot load
files or call APIs from anywhere else. A 4-minute mono mp3 is about 2 to 3 MB.
"""
import argparse
import base64
import html
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))

ENGINE_LABEL = {
    "kokoro": "Kokoro, an open-source voice model",
    "elevenlabs": "ElevenLabs",
}


def fmt(t):
    t = int(round(t))
    return f"{t // 60}:{t % 60:02d}"


def esc(s):
    return html.escape(s, quote=True)


def build_fragment(narr, audio_b64):
    dur = narr["duration"]
    chapters = narr["chapters"]

    chips, ticks, transcript = [], [], []
    for ch in chapters:
        chips.append(f'<button type="button" class="nar-chip">{esc(ch["label"])}</button>')
        if ch["start"] and ch["start"] > 1:
            ticks.append(f'<i style="left:{ch["start"] / dur * 100:.2f}%"></i>')
        m = re.fullmatch(r"s(\d+)", ch.get("anchor", ""))
        num = f'<b>{int(m.group(1)):02d}</b> ' if m else ""
        link = f'<a href="#{esc(ch["anchor"])}">Go to section</a>' if m else ""
        paras = []
        for par in ch["paragraphs"]:
            sents = []
            for s in par["sentences"]:
                ws = " ".join(
                    f'<span class="w" data-s="{w["s"]}" data-e="{w["e"]}">{esc(w["t"])}</span>'
                    for w in s["words"])
                sents.append(f'<span class="ts" data-ci="{chapters.index(ch)}">{ws}</span>')
            paras.append(f'<p class="tp">{" ".join(sents)}</p>')
        transcript.append(
            f'<div class="tc" data-start="{ch["start"]}"><div class="tc-h"><span>{num}{esc(ch["label"])}</span>{link}</div>'
            + "".join(paras) + "</div>")

    engine = ENGINE_LABEL.get(narr.get("engine"), narr.get("engine", "AI"))
    play_icons = ('<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>'
                  '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>')
    return f"""
<div class="nar" id="nar" data-duration="{dur}" data-title="{esc(narr.get('title', ''))}">
  <div class="nar-top">
    <button type="button" class="nar-play" aria-label="Play narration">{play_icons}</button>
    <div>
      <p class="nar-title">Listen to the short version</p>
      <p class="nar-sub">{fmt(dur)} &middot; read along, or select any word to jump to it</p>
    </div>
    <div class="nar-ctl">
      <button type="button" class="nar-btn" data-act="back" aria-label="Back 10 seconds">&minus;10s</button>
      <button type="button" class="nar-btn" data-act="fwd" aria-label="Forward 10 seconds">+10s</button>
      <button type="button" class="nar-btn" data-act="speed" aria-label="Playback speed 1 times">1&times;</button>
    </div>
  </div>
  <div class="nar-scrub">
    <input type="range" class="nar-range" min="0" max="1000" value="0" step="1" aria-label="Seek narration">
    <div class="nar-ticks" aria-hidden="true">{''.join(ticks)}</div>
  </div>
  <div class="nar-times"><span class="t-now">0:00</span><span class="t-end">{fmt(dur)}</span></div>
  <div class="nar-chips" role="group" aria-label="Chapters">{''.join(chips)}</div>
  <div class="nar-read">
    <div class="nar-panel" tabindex="0" role="region" aria-label="Transcript of the narration">{''.join(transcript)}</div>
    <button type="button" class="nar-follow" hidden>Follow along</button>
  </div>
  <div class="nar-foot">
    <span>AI-generated voice ({esc(engine)}), reading a shortened version of this page.</span>
    <button type="button" data-act="expand" aria-expanded="false">Expand transcript</button>
  </div>
  <div class="nar-mini" hidden>
    <button type="button" class="nar-play" aria-label="Play narration">{play_icons}</button>
    <button type="button" class="now" aria-label="Back to the player"><b>Narration</b><span></span></button>
    <span class="t">0:00</span>
    <div class="bar"><i></i></div>
  </div>
  <audio preload="metadata" src="data:audio/mpeg;base64,{audio_b64}"></audio>
</div>"""


def read(p):
    with open(os.path.join(HERE, "player", p), encoding="utf-8") as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--narration", default="out/narration.json")
    ap.add_argument("--audio", default="out/narration.mp3")
    ap.add_argument("--page", default=None, help="your existing case-study HTML (optional)")
    ap.add_argument("--out-dir", default="dist")
    a = ap.parse_args()

    with open(a.narration, encoding="utf-8") as f:
        narr = json.load(f)
    with open(a.audio, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    frag = build_fragment(narr, b64)
    css, js = read("player.css"), read("player.js")
    block = f"<style>\n{css}</style>{frag}\n<script>\n{js}</script>\n"
    os.makedirs(a.out_dir, exist_ok=True)

    # --- integrated page ---
    if a.page:
        with open(a.page, encoding="utf-8") as f:
            page = f.read()
        page = re.sub(r"<!-- (\d+) -->\s*<section>", lambda m: f'<section id="s{m.group(1)}">', page)
        page = page.replace('<header class="masthead">', '<header class="masthead" id="top">', 1)
        if "</header>" not in page:
            raise SystemExit("Could not find </header> in the page to insert the player after.")
        page = page.replace("</header>", "</header>\n" + block, 1)
        out = os.path.join(a.out_dir, "case-study-with-narration.html")
        with open(out, "w", encoding="utf-8") as f:
            f.write(page)
        print("wrote", out, f"{os.path.getsize(out) / 1e6:.2f} MB")

        # tokens for the standalone preview come from the page itself
        i = page.find("<style>\n:root{")
        j = page.find("*{box-sizing:border-box}", i)
        tokens = page[i + len("<style>\n"):j] if i > -1 and j > -1 else ""
        fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis[^>]+>', page)
        fonts = fonts.group(0) if fonts else ""
    else:
        tokens, fonts = "", ""

    # --- standalone preview ---
    standalone = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Narration player</title>{fonts}
<style>
{tokens}
*{{box-sizing:border-box}}
body{{margin:0; background:var(--ground); color:var(--ink); font-family:var(--serif); -webkit-font-smoothing:antialiased}}
.wrap{{max-width:1130px; margin:0 auto; padding:44px 20px 120px}}
a{{color:var(--amber)}}
:focus-visible{{outline:2px solid var(--amber-mark); outline-offset:3px}}
</style></head><body><div class="wrap">
{block}
</div></body></html>"""
    out = os.path.join(a.out_dir, "narration-player.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(standalone)
    print("wrote", out, f"{os.path.getsize(out) / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
