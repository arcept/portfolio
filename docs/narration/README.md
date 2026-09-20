# Narration: how it fits into this repo

This folder is the narration kit for the Placement Hub case study, moved into the repo. **To replace the script or the
audio, follow [`WORKFLOW.md`](WORKFLOW.md)** (write `script.md`, make the audio on the ElevenLabs website, then run
`npm run narration:script` / `narration:align` / `narration:publish`). Everything below the line is the kit's own README,
unchanged (it still describes the standalone layout, and the API-based renderers).

| What | Where |
|---|---|
| Script (source of truth for the words) | `docs/narration/script.md` (you edit this); `script.json` is generated from it |
| Served audio | `public/case-studies/placement-hub/narration/narration.mp3` (kept only there; `out/narration.mp3` from a re-render goes here) |
| Served timeline | `public/case-studies/placement-hub/narration/narration.json` (the published copy of what `narrate.py align` writes to the git-ignored `out/`) |
| Player core (no UI) | `components/narration/`: `timeline.mjs`, `validate.mjs`, `controller.mjs`, `lyric.mjs`, `NarrationProvider.js` |
| Player UI | `NarrationPlayer.js` (+ `NarrationPlayerShell.js`, `NarrationTranscript.js`), `NarrationUI.js` (open state, "Listen" trigger, per-section button), `NarrationDock.js` (slide-over / sheet and mini bar), `ListenToSection.js`, `narration.css` |
| Mounted on | `app/case-study-placement/page.js` (providers, trigger in the hero, panel and mini bar) and `sections.js` (a "Listen to this part" button per section) |
| Reference prototype and screenshots | `docs/narration/reference/` and `player/` — a behavioural spec, not code to paste |
| Original brief | `claude-code-brief_narration-player.md` |

**Commands**
- `npm run test:narration` — unit tests for the timeline, validator, controller and highlight (Node's built-in runner).
- `npm run test:narration:tools` — tests for the script/alignment tooling (Python).
- `npm run narration:script`, `narration:align -- <mp3>`, `narration:publish` — the script → audio → page workflow (see WORKFLOW.md).
- `node scripts/verify-narration.mjs` — a real-browser check of the whole flow on the running page (open/close, focus, mini bar,
  per-section buttons, deep link, remembered position, phone, reduced motion, JavaScript off). It needs `playwright-core` in
  the folder you run it from (`npm i playwright-core` in a scratch dir); Playwright is not a repo dependency.
- `npm run validate:narration` — checks the served `narration.json` against the script, the page's section ids and the mp3's
  measured duration. Run it after every re-render.

**Changing the words**: see WORKFLOW.md. Edit `script.md` (never `script.json` or the words in `narration.json`: the validator
fails if the text drifts from the script).

**Anchors** are this page's real section ids (`problem`, `evidence`, `reframing`, `leadership`, `product`, `handover`,
`launch`), not the `s1`–`s7` the kit shipped with. They are metadata only and were changed without re-rendering. If you re-render
from the kit's own `script.json` the anchors stay as they are here; if you replace `script.json` with an older copy, change them
back.

---

# Narration kit: Placement Portal case study

One script in, one player out. Swap the voice engine without touching the player.

    script.json ──► render_kokoro.py      ─┐
                    render_elevenlabs.py  ─┴─► narration.mp3 + narration.json ──► build_player.py ──► page with player

`narration.json` is the contract: chapters → paragraphs → sentences → words, each with start/end seconds.
Any renderer that writes it works with `build_player.py`.

## Edit the script
`script.json` holds the text. Rules that keep the highlight aligned:
- Write for the ear: numbers spelled out ("fifty-one point five"), no symbols, short sentences.
- The transcript on the page is exactly this text. To change how something is *said* without changing how it
  *reads*, add it to `"pronounce"` (e.g. `"Sanya": "Sahn-ya"`). One word maps to one word, no spaces.
- Chapters map to the page: `"anchor": "s3"` links to the section with `id="s3"` (the builder adds those ids).
- Post-launch results are deliberately not narrated: section 07 of the page still holds placeholder figures.
  When verified numbers land, add a paragraph to the `launch` chapter and re-render.

## Route 1: Kokoro (free, local, unlimited)
    pip install -r requirements.txt          # plus ffmpeg on PATH
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
    python render_kokoro.py                  # writes out/narration.mp3 + out/narration.json (about 3 min for 4 min of audio)
Use the full-precision `kokoro-v1.0.onnx`. The int8 file produced near-silent audio in testing.
Voice is `am_michael`; try `--voice am_adam`, `--speed 1.05`, etc.
Word timing here is estimated (sentence boundaries are exact; words are placed by phoneme length and snapped to real pauses).

## Route 2: ElevenLabs (later)
    pip install -r requirements.txt
    export ELEVENLABS_API_KEY=...            # free account is enough
    python render_elevenlabs.py --list-voices
    python render_elevenlabs.py --voice-id <ID> --only 1     # about 250 credits: check the sound and the timing
    python render_elevenlabs.py --voice-id <ID>              # full run, about 3,650 credits, asks first
- Credits: free plan is about 10,000 a month, 1 per character on `eleven_multilingual_v2`. The script prints
  what it needs vs. what you have and stops if short. Every paragraph response is cached in
  `out_elevenlabs/cache/`, so re-running unchanged text costs nothing; only edited paragraphs are re-billed.
- Terms: the free plan is non-commercial and requires attribution. The player footer names the engine
  automatically. If the page is used to win paid work, check ElevenLabs' terms or use a paid plan.
- Timing is exact: their `/with-timestamps` endpoint returns per-character times.
- Not yet run against the live API (no access from where it was written). It was tested against a mock
  that returns the documented response shape. If `pcm_24000` is refused on your plan, add `--format mp3_44100_128`.

## Build the page
    python build_player.py --narration out/narration.json --audio out/narration.mp3 \
                           --page case-study.html --out-dir dist
Outputs `dist/case-study-with-narration.html` and `dist/narration-player.html`.
For ElevenLabs use `--narration out_elevenlabs/narration.json --audio out_elevenlabs/narration.mp3`.

## Publishing notes (Claude artifacts)
- The audio is inlined as a base64 data URI (about 2 to 3 MB). A published artifact cannot load audio or call any
  API from another host, so pre-rendering is the only route.
- Do not use the artifact "assets" capability for the mp3: it makes the page organisation-only, not public.
