# Design rules — the numbers and the reasoning

These are decisions made and approved on the Placement Hub case study. Reuse the numbers; the reasons are
here so you can adapt sensibly when a page differs.

## Page structure (top to bottom)
1. Progress line (fixed, 2px, green) → nav (with theme switch).
2. **Hero**: back link → eyebrow → headline → intro → facts → actions | cover image.
3. **Prototype/hero-artifact embed** (if the case study has one), wrapped in `ScrollRise`.
4. **Article grid**: `wrap wrap--wide cs-article-grid` = sections column + sticky contents nav (240px).
5. Footer nav buttons → footer.
Seven-ish numbered sections, each: sticky **margin** (category, question, deliverables) | **main**
(ghost numeral, eyebrow, mask-revealed heading, body).

## Width and spacing
- Containers grow to **1600px** on this page only (`.ph-page .wrap--wide, .ph-page .site-nav__inner`).
  Below ~1650px nothing changes. Reason: at 1920px the three columns (margin, text, nav) otherwise feel
  squeezed. The site default (1400) stays for every other page — never edit `.wrap--wide` globally.
- Body text is capped at **68ch** (70ch ≥1500px, 17px → 18px). Wider containers give the *layout* room, not
  longer lines. Lines beyond ~75ch are harder to read.
- Section: `padding 80px 0 96px`, hairline `border-bottom`, columns `240px | 1fr` with `72px` gap
  (`200px`/`48px` ≤1099px; single column ≤899px with the margin hidden and its content behind a
  mobile-only disclosure). Block gap in a section `52px`; heading→body `52px`.
- **No card behind sections.** A grey card looked wrong next to the site's fixed contents nav; sections sit on
  the page background, separated by a hairline. The scroll animation is what lifts them.

## Hero
- Text column ≈ **59%** (`1.45fr / 1fr`, gap 72px) at ≥900px; single column below.
- Headline: `clamp(28px, 3.4vw, 44px)`, `text-wrap: balance`, **no `max-width: 24ch`** (the site default caps
  it there and strands one word on a fourth line). Verify: ≤3 lines at 900/1024/1280/1440/1920.
- **Hierarchy in four tiers**, each quieter: (1) green mono eyebrow + headline — what this is;
  (2) intro (18px, `--mist`) + lead facts (role larger, in `--paper`) — why it matters, who did it;
  (3) the rest of the facts, collapsed behind one quiet toggle; (4) actions: one outlined, one plain text.
- **Ordering facts for a portfolio reader**: Role → Company → Product show; Scope → Team → Timeline
  collapse. Timeline is the least important. Expanded details keep the *same three columns* as the lead row
  (same `grid-template-columns`), never three stacked rows.
- Actions: `btn btn--rainbow-outline` (primary) + tertiary "Read the 2-minute version" (`btn btn--tertiary
  btn--rainbow-text`).
- The prototype note under the embed: `max-width: 72%` of the frame (site default 46ch made it 4 lines) → two
  lines from ~1280px.
- Entrance is **CSS keyframes** (`ph-rise`, `ph-word`, `ph-cover`) so it plays on first paint, staggered by
  `--d` delays: breadcrumb .05s, eyebrow .1s, headline words .15s + .045s each, intro .45s, facts .6–.86s,
  actions .85s, cover .35s. Everything off under `prefers-reduced-motion`.
- No grid pattern (tried, removed by the user).

## Contrast and text levels (all measured against the page background)
Four levels; a gray is a percentage of ink mixed into base.
| level | use | dark (ink #f5f6f8 on #08090a) | light (ink #111214 on #f1f1f1) |
|---|---|---|---|
| t1 | headings, statements, key figures, `<strong>` | 98% → 17:1 | 94% → 14:1 |
| t2 | body copy | 80% → 11.7:1 | 78% → 8.3:1 |
| t3 | notes, margin text, table headers | 64% | 68% |
| t4 | captions, labels, placeholders | 55% → 5.9:1 | 63% → 4.8:1 |
Finding worth remembering: the *light* version felt crisper not because its numbers were higher (they were
lower) but because of a bigger step between heading and body plus layered surfaces. Every level must clear
WCAG AA (4.5:1) — the first light version's faintest level did not.
Lines/borders: dark 12% / 22% of ink; light 10% / 20%.
Accent: dark `--article-green` (#4ade80, the site's original green); light `#137a3d` (deeper green — the
bright green fails on white). Bad `#ff6b6b` / `#d12b1f`; warn `#f5b04c` / `#a15c07`.
Type: display font (Neue Alte Grotesk) for headings; **serif (Newsreader) only for statements and quotes** —
that voice change is what tells a reader "this sentence is the argument"; mono (IBM Plex) uppercase for labels.

## Motion (all motion respects reduced-motion — see gotchas.md)
- Section: rises 96px / scale .94 → 1 as it enters (scrubbed to scroll, not timed), scales .965 and dims to
  .35 as it leaves. Ghost numeral drifts ±50px and is faded with a mask.
- Each block: blur-rise `Reveal`; headings: word-by-word mask; `Statement`/`Quote`: words light up with scroll;
  tables: rows stagger in, numbers count up, bars draw; `Num`/`Stats`/`BigStat` count up in view.
- Progress line eases with a spring.

## Content rules
- **Preserve the author's copy.** Restructure, add emphasis, add Num/Peek — don't rewrite claims.
- Emphasis: green count-up on key numbers (`Num`), heavier/brighter `strong` on key phrases. Not red for bad
  numbers in prose; red/green *are* used in tables and the story to separate bad from good.
- Long secondary lists → `Peek` (first ~128px visible, fading, with a "Show all …" button) so it's obvious
  there is more. Content shorter than the peek renders open with no button.
- Wording bans (user preference): "Artifacts" (use **Deliverables**), "2024"/"recent build"/dates that age,
  words that sound generated. Credit line: `Project · Company`.
- Placeholders and illustrative numbers stay clearly labelled ("Visual placeholder", "*Illustrative — replace
  before publishing"), including inside the story.

## Images
- Never show a big screenshot at full column width by default. Screenshots are **tiles** (5:4 frame, cropped
  to the top, hover lift + zoom badge) that open in a **lightbox** (arrow keys, counter, caption, Esc).
- Choose the treatment by what the images are: parallel outcomes → `Gallery` grid (3 columns, all tiles the
  same shape, placeholder tiles too); a *journey or states of one screen* → `Sequence` (auto-cycles when in
  view, pauses on hover, list on the side with captions; `wide` for landscape screens, portrait otherwise).
- Aim for at least one animated sequence per case study that has a flow. Don't reuse the same image in two
  treatments unless it genuinely belongs in both.
- The lightbox stays dark in both themes (image viewer convention).

## The 2-minute story (`StoryLauncher`)
Replaces a "TL;DR" expander. Full-screen, one idea per step, animated; 6–8 steps plus a closing card.
Each step: kicker (section name), title ≤ ~60 chars, 1–2 sentence body, **one visual** built from the case
study's own data (a list of unanswered questions, bars, a big count-up + pills, a quote, cycling screens,
counts, before→after rows), and a "Read this section in full ↗" link that closes the story and jumps to the
section. Controls: progress segments, Next/Back, ← → keys, swipe, Esc. Closing card: read full / try the
prototype / watch again. Never invent facts — every line is traceable to the page.

## Responsive
- Breakpoints used: 1099 (narrower margin col), 899 (single column, hero stacks), 720 (sequence stacks),
  640 (facts single column, tile grid `auto-fill minmax(160px)`), 860 (story single column).
- Phone: margin column hidden (a mobile-only disclosure carries its content), prototype replaced by a preview
  image <640px, lightbox arrows move to the bottom, story stage scrolls vertically.
- Test 390px in **both** themes at every section: `document.scrollWidth - innerWidth` must be 0.
