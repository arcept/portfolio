# Brief for Claude Code: narrated "short version" player for the Placement Portal case study

**Owner:** Manik (arcept.in) · **Case study:** Novatr Placement Portal, 2024
**Status of inputs:** narration script, audio (Kokoro voice) and word-level timings already exist. This brief is about building the player *inside the real case-study repo*. It is not about generating audio.

---

## 0. How to use this brief

**Paste this as your opening message to Claude Code:**

> Read the brief I've saved at `<path to claude-code-brief_narration-player.md>` and unpack `narration-kit.zip` as it describes. Do steps 1 and 2 of section 12 only: inspect the repo, report what you found, then ask me the section 8 decisions as multiple-choice questions. Do not write player code until I have answered.

**Rules for Claude Code**
1. Inspect before assuming. The stack, component library, routing and design tokens below are *likely*, not confirmed. Verify against the repo and its `CLAUDE.md` files.
2. Ask, don't guess, on the decisions in section 8. Offer options with a recommendation. Manik answers faster from choices than from open questions.
3. Keep turns short. End each turn with the next concrete decision or action.
4. Never put an invented number into any content. The narration text is fixed; see section 9.
5. Conserve tokens on any Figma work; this task should not need Figma.

---

## 1. Goal and non-goals

**Goal.** A reader can listen to a ~4-minute narrated version of the whole case study while the transcript highlights word by word (lyrics-player style), and can jump around by chapter or by clicking a word.

**Non-goals**
- No text-to-speech at runtime. Audio is pre-rendered; the player only plays a static file.
- No backend, analytics or runtime network calls beyond fetching the site's own static `narration.mp3` and `narration.json`.
- Do not redesign the case study. The player must feel native to it.
- Do not rewrite the narration. Text changes go through the script and a re-render (section 10).
- Do not build ElevenLabs integration into the site. It only changes the two data files (section 10).

---

## 2. What already exists

Manik will give you `narration-kit.zip`. Unpack it to **`tools/narration/`** (or wherever the repo keeps tooling; confirm with Manik). Contents:

| Path | What it is |
|---|---|
| `out/narration.mp3` | Rendered audio, 4:07, mono, 64 kbps, about 2 MB. Voice `am_michael` (Kokoro). |
| `out/narration.json` | Timeline: chapters, paragraphs, sentences, words, each with start/end seconds. **This is the contract.** |
| `script.json` | Source text. Chapters map to case-study sections. Includes a pronunciation map (spoken-only overrides). |
| `narration-script.md` | The script as a readable document. |
| `render_kokoro.py` / `render_elevenlabs.py` | Renderers. Both write the same two output files. Not needed for the player build. |
| `build_player.py`, `player/player.css`, `player/player.js` | **Reference implementation**: a vanilla JS single-file player used in a prototype. Read it as a behavioural spec. |
| `reference/narration-player.html` | The prototype, runnable in a browser. Open it and press play. |
| `reference/screenshots/` | Desktop light, dark, mid-sentence highlight, mini bar, mobile. Fonts are fallbacks in these images. |
| `README.md` | How to re-render and rebuild. |

The prototype's markup and CSS were written for a self-contained HTML artifact. **Do not paste it into the repo.** Re-implement in the repo's own stack and conventions, and keep the behaviour listed in section 4.

---

## 3. Data contract: `narration.json`

```ts
export interface Narration {
  engine: 'kokoro' | 'elevenlabs' | string;
  voice: string;
  audio: string;            // file name, e.g. "narration.mp3"
  duration: number;         // seconds, measured from the final mp3
  title: string;
  chapters: Chapter[];
}
export interface Chapter {
  id: string;               // "intro" | "problem" | "evidence" | "reframing" | "leadership" | "product" | "handover" | "launch"
  label: string;            // shown on the chapter chips
  anchor: string;           // "top" or a section id: "s1" .. "s7"
  start: number; end: number;
  paragraphs: { sentences: Sentence[] }[];
}
export interface Sentence { start: number; end: number; words: Word[]; }
export interface Word { t: string; s: number; e: number; }   // text, start, end (seconds)
```

**Invariants the player can rely on** (and a validator should enforce, see section 11):
- `s` is non-decreasing across the whole file; `e >= s`.
- Inside a sentence, each word's `e` equals the next word's `s`. Between sentences there is a real silence gap (0.3 s within a paragraph, 0.6 s between paragraphs, 1.0 s between chapters).
- `t` is the display text, punctuation attached. Whitespace-joining words gives the sentence exactly as written.
- `chapters[i].start` is the first word's `s`. Chapter chips seek to `start - 0.05`.
- Timings are relative to the start of `narration.mp3`.
- With Kokoro, sentence boundaries are exact and word boundaries inside a sentence are estimated. With ElevenLabs they are exact. The player must not care which.

**Anchors.** The script assumes the case study has sections with ids `s1` to `s7`: problem, evidence, reframing, leadership, product, handover, launch. **Verify this against the real repo first.** If the section list or order differs, `anchor` and `label` can be edited in `narration.json` and `script.json` without re-rendering audio (they are metadata). If the *content* of a section differs materially from what the narration says, stop and tell Manik; the script needs revising and re-rendering.

---

## 4. Behaviour spec (must-haves)

Derived from the working prototype. Numbers are what was tested.

**Playback**
- One `<audio>` element per page. No autoplay, ever. Start only from a user gesture.
- Speeds: 1×, 1.25×, 1.5× (cycle button). Skip back/forward 10 s. Scrubber with a tick at each chapter start.
- Duration shown comes from `narration.json`, not from the audio element (some browsers report NaN or Infinity early).
- End of audio: return to a replayable state, keep the transcript at the end.
- If the audio fails to load, say so in one line and leave the transcript readable.

**Lyric-style transcript** (the memorable part; spend care here)
- Find the active word with a binary search: the last word whose `s <= currentTime`. It is "active" only while `currentTime < e + 0.03`.
- Drive it from `requestAnimationFrame` while playing (not `timeupdate`, which fires about 4 times a second). While paused, sync on `seeked` and `timeupdate`.
- Four visual states, using existing tokens:
  - Future sentences: muted (ink-3).
  - Sentences already read: secondary (ink-2).
  - Current sentence: full ink; words already spoken inside it turn amber.
  - Active word: amber, weight 500, with a 2 px underline that fills left to right using a CSS custom property (`--f`, 0 to 100) updated each frame on that one element.
- Performance: about 590 words. Do **not** re-render the word list per frame. Update by toggling classes or one CSS variable on the affected elements (refs, or a memoised `Word` component that never re-renders on time). Full re-mark is only needed on seek.
- Clicking any word seeks to that word's start and plays.
- Transcript is real text in the DOM (not canvas, not injected only at runtime if the site is statically generated). It should be readable with JavaScript off.

**Follow-scroll**
- When the current sentence changes, scroll the transcript panel so it sits about 34% from the top. Smooth scroll, instant if `prefers-reduced-motion`.
- If the reader scrolls, touches or clicks inside the panel, pause auto-follow for 5 s and show a "Follow along" button. Clicking it, or clicking a chapter chip or word, resumes.
- Edges of the panel fade with a mask so text does not cut hard.

**Chapters**
- A chip per chapter; the current one is marked (`aria-current`) and scrolled into view in the chip row.
- Each transcript chapter header has "Go to section" linking to the real section `anchor` (not for `top`).

**Persistent controls**
- If playback has started and the main player has scrolled out of view, show a compact bar (play/pause, chapter name, current sentence in one line, time, thin progress). Clicking the text scrolls back to the player. Respect the bottom safe-area inset.

**Accessibility**
- Real `<button>`s with labels that change with state ("Play narration" / "Pause narration").
- Scrubber is a native range input with `aria-valuetext` like "1:12 of 4:07". Arrow keys move ±5 s.
- Visible focus on everything. Target sizes 44 px on mobile.
- Transcript region is focusable and labelled.
- Respect `prefers-reduced-motion`: no smooth scroll, no colour or fill transitions.
- Wire the Media Session API (play, pause, seek ±10 s, title) so lock-screen and headset controls work.

**Disclosure**
- Footer line inside the player: "AI-generated voice (<engine label>), reading a shortened version of this page." The engine label comes from `engine` via one mapping (`kokoro` → "Kokoro, an open-source voice model", `elevenlabs` → "ElevenLabs"). Never hardcode an engine name in the UI. This also satisfies ElevenLabs' free-plan attribution requirement when that voice is used.

---

## 5. Suggested architecture (adapt to the repo)

Keep a **framework-agnostic core** and a thin UI on top. It makes the presentation choice in section 8 cheap to change.

- `narration/timeline.ts`: pure functions with unit tests. `flattenWords(narration)`, `wordIndexAt(t)`, `sentenceIndexOfWord`, `chapterIndexAt`, `formatTime`. No DOM.
- `narration/controller.ts` (or a hook `useNarration`): owns the audio element, the rAF loop, playback rate, seeking, and exposes a small subscribable state: `{ playing, currentTime, activeWord, activeSentence, activeChapter, started, error }`. UI subscribes; the rAF loop does not trigger React renders per frame (use a ref/subscription for time-critical bits).
- **Provider at layout level** (e.g. `NarrationProvider`), so the audio and its state survive opening or closing a modal or slide-over, and route changes if the site has any.
- Presentational components: `NarrationTrigger`, `NarrationPlayer` (controls + scrubber + chips), `NarrationTranscript`, `NarrationMiniBar`. Each takes state from the provider.
- Load `narration.json` lazily on first open or first interaction (dynamic import or `fetch` of the site's own static file) so it costs nothing to page load. The JSON is about 58 KB uncompressed.

**Audio hosting.** In the real site, serve `narration.mp3` as a normal static file (for example `public/case-studies/placement/narration/narration.mp3` plus `narration.json` beside it). Do **not** inline base64; that was only needed inside a single-file artifact. The host must support byte-range requests so seeking works (GitHub Pages and Vercel do). Commit both files; they are build outputs but small. Consider a content hash in the file name so a future re-render busts caches.

**Design.** Reuse the case study's existing tokens; add none unless unavoidable. The prototype used the spec-sheet system: hairline borders, zero radius, square controls, a serif transcript (about 1.1875 to 1.375 rem, line-height 1.58), mono for small labels, amber from the handover notes as the only accent. Follow the repo's own font loading (self-hosted fontsource if that is what it uses; no Google Fonts calls). Light and dark must both work.

**Likely repo conventions** (from Manik's prototype spec; verify): a monorepo for arcept.in, case studies under `public/case-studies/<slug>/`, docs under `docs/<slug>/`, React + TypeScript + Vite, Tailwind CSS v4, React Aria Components, `motion` for animation, kebab-case file names, `@/` alias, npm. If the repo has `CLAUDE.md` files, read them first and follow them.

---

## 6. Presentation options

The audio, timeline and behaviour are identical in all of these. Only the container differs. Manik will choose in section 8.

| Option | What it is | Good for | Cost / risk |
|---|---|---|---|
| **A. Inline block** | The player sits in the page under the masthead (the prototype). Transcript always visible. | Discoverability; zero extra clicks; simplest. | Pushes the snapshot and hero down by about 520 px. Needs a compact default height. |
| **B. Inline, collapsed** | A one-line bar under the masthead ("Listen to the short version, 4:07"). Expands in place to the full transcript. | Keeps the top of the page tight; still visible. | Slightly less immediate than A. |
| **C. Modal dialog** | A "Listen" button opens a focused dialog with player and transcript. | Cinematic, distraction-free reading along. | Blocks the page; need the audio to keep playing when closed (mini bar) or it feels broken. Focus trap and scroll lock to get right. |
| **D. Slide-over** | Right-hand panel on desktop, bottom sheet on mobile. Page stays visible and scrollable beside it. | Best of both: read the page and the transcript together. "Go to section" works naturally. | More layout work; on narrow screens becomes a sheet that covers content. |
| **E. Hybrid** (recommended) | A small trigger near the masthead ("Listen 4:07"), plus a **slide-over on desktop / bottom sheet on mobile**, plus the **mini bar** whenever audio is playing and the panel is closed. | Discoverable, non-blocking, survives scrolling, feels like a product feature. | Most parts to build; build in stages (section 12). |

**Notes that apply to C, D and E**
- The audio element and state live in the provider, outside the modal, so closing the panel does not stop playback.
- Use the repo's dialog primitives (React Aria `Modal` / `Dialog` / `DialogTrigger`, or its equivalent) for focus management, Escape to close, and scroll behaviour. For a non-modal slide-over that lets the page keep scrolling, do **not** trap focus or lock scroll; label it as a complementary region.
- Animate with the repo's motion library, only on open and close. Nothing decorative.
- On mobile use a bottom sheet with a drag handle only if the repo already has one; otherwise a full-height sheet with a clear close button.

---

## 7. Optional enhancements (offer, do not assume)

- **Narration drives the page:** as the chapter changes, mark the matching section in the page's own chapter rail or nav. Opt-in, and only if a rail exists.
- **Deep link:** `?listen=1&t=62` opens the player and seeks to 1:02. Useful for the talk track and for sharing a specific moment.
- **Per-section "Listen to this part" button:** plays from that section's chapter start.
- **Remember position** in `sessionStorage` per visit (not across visits).

---

## 8. Decisions to put to Manik (as multiple-choice questions)

Ask these before building. Recommendation in bold.

1. **Presentation:** A inline / B inline collapsed / C modal / D slide-over / **E hybrid**.
2. **When the panel closes (C, D, E):** **audio keeps playing with the mini bar** / audio pauses.
3. **Mini bar:** **show it whenever playback has started and the player is off-screen** / never.
4. **Transcript default height (A, B):** **compact, about 280 px, with an "Expand transcript" toggle** / open tall.
5. **Optional enhancements** (section 7): pick any of none / narration drives the page / deep link / per-section buttons / remember position.
6. **Where the tooling lives:** **`tools/narration/` with a short README** / `docs/narration/` / other.
7. **Tests:** **unit tests for `timeline.ts` plus a Playwright check** / unit tests only / none.

If the repo already has a strong convention for any of these (for example a standard drawer component), say so and recommend following it.

---

## 9. Content rules

- The transcript is exactly the script. **Never hand-edit words in `narration.json`**; timings are tied to them. To change text, edit `script.json` and re-render (section 10).
- The narration is deliberately **silent on post-launch results**, because section 07 of the earlier draft page held placeholder figures. It uses only the baseline figures (CSAT by stage, NPS by segment, 30% self-placed) and the "we do not claim more jobs" line. Once verified results are on the page, the script needs one more paragraph and a re-render. Do not add numbers yourself.
- Pronunciation overrides (`ECAT` → "E-C-A-T", `Novatr` → "Nova-ter", `Retool` → "Ree-tool", `Sanya` → "Sahn-ya") affect what is *said*, never what is *shown*. Manik should confirm "Sanya".
- The credit line in the case study names Manik, Sanya and Swati. The narration says "Sanya owned the detailed product design… She reported to me." Do not alter that phrasing without asking.

---

## 10. Engine swap: Kokoro now, ElevenLabs later

Nothing in the site code changes. Only two files are replaced:

1. Run `render_elevenlabs.py` (see the kit README: `--list-voices`, then `--only 1` as a cheap test, then the full run). It writes `narration.mp3` and `narration.json` in the same format.
2. Copy both over the existing files in `public/…/narration/`.
3. The disclosure footer updates itself from `engine`.

Notes: the ElevenLabs free plan is about 10,000 credits a month and the full script is about 3,650 characters; responses are cached so unchanged paragraphs are free on re-run; the free plan is non-commercial and requires attribution. That renderer has been tested against a mock of the API, not the live one. It uses per-character timestamps, so word timing becomes exact.

---

## 11. Verification

**Validator (build-time or a script).** Fail if: times go backwards; a word has `e < s`; a sentence's words are not contiguous; any chapter `anchor` other than `top` has no matching element id in the page; `duration` differs from the mp3 by more than 0.1 s (use `ffprobe` if available, otherwise skip with a warning).

**Manual and automated checks** (Playwright or the repo's equivalent)
- Seeking to a word's midpoint marks exactly that word active; the current sentence is the one containing it.
- Chapter chip click seeks to that chapter and plays; the chip gets `aria-current`.
- Word click seeks; scrubber arrow keys move ±5 s.
- Manual scroll in the transcript pauses follow and shows "Follow along"; clicking it resumes.
- Scroll the page away while playing: mini bar appears; clicking its text returns to the player.
- Closing the panel (C, D, E) does not interrupt audio.
- Light, dark, and 390 px wide. `prefers-reduced-motion` on: no smooth scroll.
- No console errors; no requests other than the site's own static files.
- On iOS Safari, playback starts from the tap and seeking works (this needs byte-range support on the host).
- Screen reader pass or axe: labels, roles and focus order.

**Definition of done.** A reader who has never seen the page can press play, watch the highlight track the voice, jump to a chapter, scroll away and pause from the mini bar, and read the whole narration without audio, all on desktop and phone.

---

## 12. Suggested order of work

1. **Inspect and report.** Repo stack, conventions, tokens, where the case study page and its sections live, whether section ids `s1` to `s7` exist. Report differences from section 5's assumptions and from the anchors in `narration.json`.
2. **Ask** the section 8 decisions. Wait for answers.
3. **Core.** Unpack the kit, place the audio and JSON, write `timeline.ts` with tests and the validator, then the controller and provider.
4. **Transcript and controls.** The lyric behaviour first, since it is the point; then chips, scrubber, speed, skip, follow-scroll.
5. **Container.** Build the chosen presentation (for E: trigger and slide-over first, then mini bar, then mobile sheet).
6. **Polish and verify.** Light, dark, mobile, reduced motion, keyboard; take screenshots and compare against `reference/screenshots/`.
7. **Summarise** what was built, what was tested, what was not, and anything Manik must do (for example confirm the "Sanya" pronunciation or re-render after results are added).

---

## 13. Gotchas found while building the prototype

- The int8 Kokoro model file gave near-silent audio; use the full-precision one if re-rendering.
- Inline sentence spans: `offsetTop` returns the first line's position, which is what follow-scroll needs. Give the panel `position: relative`.
- Manual-scroll detection must use wheel, touch and pointer events, not the `scroll` event (which also fires for programmatic scrolls).
- `audio.play()` returns a promise that can reject (autoplay policy); handle it and show a hint.
- Extend each word's end to the next word's start inside a sentence so the highlight never flickers off between words.
- An `IntersectionObserver` on the player's top row (threshold about 0.05) is enough to decide when to show the mini bar.
- Keep the sentence gap silences in the timeline; they are what makes the audio feel like narration rather than a stream of sentences.
