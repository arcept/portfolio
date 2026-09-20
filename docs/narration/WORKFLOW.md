# Replacing the narration: script → ElevenLabs → the page

You write the script and make the audio on the ElevenLabs website. The tools here do the rest: work out when
every word is spoken, check the voice read your words, and put both files on the site. The player itself needs no
changes.

```
 script.md ──[1 script]──► for-elevenlabs.txt ──► ElevenLabs website ──► your.mp3
                                                                              │
 page  ◄──[3 publish]── out/narration.json + .mp3 ◄──[2 align]───────────────┘
```

## Once: set-up (already done on this Mac)

- `brew install ffmpeg`
- `python3 -m venv docs/narration/.venv && docs/narration/.venv/bin/pip install stable-ts`

`.venv/` is git-ignored, so on another computer you repeat those two lines. The first `align` also downloads a speech
model (about 460 MB) once. Nothing you write or record is ever uploaded: alignment runs on your Mac.

## 1. Write the script

Edit **`docs/narration/script.md`**. One `## Heading` per chapter, paragraphs separated by a blank line:

```
---
title: Making Placement Visible: the short version
engine: elevenlabs
voice: Adam                      ← the voice's name; the page's footer names the engine from `engine`
pronounce:
  Sanya: Sahn-ya                 ← optional: a word the voice gets wrong → how to spell it for the voice
---

## Intro {id=intro anchor=top}
Learners at Novatr bought placement support…

## The problem {id=problem}
A learner finishing a Novatr course…
```

- The heading text is the chapter's **label** on the player (never read aloud).
- `id` is the chapter's id and `anchor` the page section it belongs to. They are normally the same and match the
  section ids on the page (`problem`, `evidence`, …). `anchor=top` is for the intro, which belongs to no section.
- **Write for the ear**: spell numbers out ("fifty-one point five"), no symbols (%, &, /), short sentences.
  `script` warns about digits, symbols and very long sentences.
- Whatever you write is exactly what the reader sees, word for word, in the transcript.

Then:

```
npm run narration:script
```

This checks the script and prints its size (chapters, words, characters, roughly how long it will run, and the
ElevenLabs credits it needs), and writes:

| File | What it is |
|---|---|
| `docs/narration/for-elevenlabs.txt` | the text to paste into ElevenLabs: paragraphs and chapters only, no headings, so nothing extra is read aloud |
| `docs/narration/for-elevenlabs-spoken.txt` | the same with your `pronounce:` spellings written in (only if you have any) |
| `docs/narration/script.json` | what the tools read (regenerated from `script.md`; don't edit it) |

## 2. Make the audio on ElevenLabs

On the website: paste `for-elevenlabs.txt`, choose the voice and settings, generate, listen, and **export the MP3**.
Practical notes:

- Export **one MP3 for the whole script**. If you regenerate part of it, export the whole thing again: the timing
  step needs the finished file.
- Listen for names and terms (Novatr, Retool, ECAT, Sanya). If one is wrong, add it under `pronounce:` in
  `script.md`, run `narration:script` again, and paste `for-elevenlabs-spoken.txt` instead.
- Note the voice's name; you'll give it to `align`.
- **Terms**: ElevenLabs' free plan is non-commercial and requires attribution (the player's footer already names the
  engine). If this portfolio is used to win paid work, check their current terms or use a paid plan.

## 3. Align, check, publish

```
npm run narration:align -- ~/Downloads/your-export.mp3 --srt ~/Downloads/your-export.srt --voice "Adam"
```

**Also export the subtitles (SRT) from ElevenLabs and pass them with `--srt`.** They tell the aligner roughly where each
few seconds of speech is, so every short clip is timed on its own and a slip can't carry further than that clip. Without
them the whole recording is timed in one go, which can put a sentence several seconds out; the report flags that, but
`--srt` prevents it. (Sentence times differ from the SRT by up to about a second, since ElevenLabs' cue edges are only
approximate; that is normal.) Skip the AAF export: it is for video editors and carries no word timing.

(Add `--engine elevenlabs` if `script.md` doesn't say; `--compress` shrinks the file to mono 64 kbps, about half the
size; `--model medium.en` is slower and sharper; `--fast` skips the listening pass.) It takes about a minute and:

1. copies your MP3 to `docs/narration/out/narration.mp3` (the file that ships is the file that was timed);
2. **aligns your script to the audio**, giving every word a start and end time, and writes `out/narration.json`;
3. **listens to the audio too** and compares it with your script;
4. prints anything worth reviewing and runs the same schema check the site build uses.

Reading the report:

- **"Nothing stands out"**: publish.
- **`TEXT the voice skipped “…”`**: the recording is missing words from your script. Regenerate that paragraph and
  export again. (It only reports content that is really missing or different: digits versus spelled-out numbers,
  "Novator" for Novatr, and dropped little words are ignored.)
- **`TEXT the voice seems to say “…”`**: a word replaced by something unlike it. Listen there.
- **`TEXT extra words heard`**: speech-to-text sometimes imagines words; listen before deciding.
- **`TIME … unsure` / `squeezed`**: the aligner could not find a stretch of the script in the audio (often the same
  cause as a skipped sentence).
- **`GAP`**: a long silence between sentences. Fine if you meant it.

Then:

```
npm run narration:publish
```

It re-checks everything, copies `narration.json` and `narration.mp3` into
`public/case-studies/placement-hub/narration/`, and warns if a chapter has no "Listen to this part" button (or a
button has no chapter). New audio gets a new version in the URL, so nobody is served the old audio from a cache.

## 4. Look, then commit

- Open the page, press "Listen to the short version", and listen to a few places, especially wherever the
  report pointed. Try `/case-study-placement?listen=1&t=62` too.
- `npm run validate:narration` and `node scripts/verify-narration.mjs` (needs `playwright-core`; see the README).
- Commit `docs/narration/script.md`, `script.json` and the two files under `public/`. (`out/` is only a local work area and git ignores it; the copies under `public/` are the ones that ship.)

## If the structure changes

The chapters must line up with the page's sections. If you add, remove or rename a chapter:

- its `id`/`anchor` must be a real section id (the validator fails otherwise);
- a "Listen to this part" button is placed by hand in `app/case-study-placement/sections.js`
  (`headerAction={<ListenToSection id="…" />}`): add or remove it to match (`publish` tells you which);
- the numbers on the player (01, 02…) follow the order of the chapters that have a section, so they match the page.

## How accurate is the timing?

On the current recording, checked against the exact sentence times the Kokoro renderer produced: the median
sentence starts within 60 ms of the truth, 95% within 0.27 s, worst 0.6 s. That is well inside what a
word-by-word highlight needs. Individual word times inside a sentence are estimates by any method.
A recording with one sentence cut out is reported, by name, in the review.

## Files

| | |
|---|---|
| `script.md` | your script (the only file you edit) |
| `narrate.py` | the commands: `script`, `align`, `publish` |
| `narrate_lib.py`, `test_narrate.py` | the logic and its tests (`npm run test:narration:tools`) |
| `out/` | the last `align` result (`narration.json`, `narration.mp3`, `alignment-report.txt`) |
| `.venv/` | the speech tools (git-ignored) |
| everything else | the original kit (`render_kokoro.py`, `render_elevenlabs.py` for the API route, `reference/`, `player/`) |
