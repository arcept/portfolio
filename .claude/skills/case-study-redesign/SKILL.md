---
name: case-study-redesign
description: Transform an existing case study page in this portfolio (OMS, CRO, or a new one) into the Placement Hub format — numbered sections with a sticky margin, cardless layout on a 1600px container, scroll animations and faded numerals, a clear text-contrast hierarchy, an animated hero with collapsible facts, a top progress bar, tiles + lightbox + animated sequences for images, inline counting figures, a full-screen "2-minute version" story, and a single-page dark/light theme switch that follows the OS. Use this whenever the user wants another case study to "look like the Placement Hub one", asks to apply/replicate/port that redesign, wants a case study made responsive, themeable, or animated in that style, or asks for the light/dark theme, the progress bar, the 2-minute read, or the image gallery treatment on a different page — even if they only name one of those pieces.
---

# Case study redesign

Moves a case study onto the shared kit (`app/case-study-kit/`, `components/case-study-kit/`,
`components/theme/`). **Placement Hub** is the reference implementation and **OMS** the first port: when this
document and the code disagree, the code wins — read them.

The kit is the product of a long design conversation, so the numbers in `references/` are decisions the
user already approved, not suggestions. Reuse them; deviate only when a page's content forces it, and say so.

## Read first (in this order, only what you need)
- `references/design-rules.md` — structure, width, spacing, hero hierarchy, contrast, motion, content and
  image rules, the 2-minute story, responsive behaviour. **Read fully before designing anything.**
- `references/kit.md` — the shared kit's files, the block APIs, per-page knobs and the story module.
- `references/theming.md` — the single-page dark/light mechanism and what needs its own light treatment.
- `references/gotchas.md` — bugs already hit and fixed. Skim before writing code; grep it when something
  looks wrong.

## Workflow

### 0. Preflight
1. Name the target page. If the user said "all case studies", do them **one at a time**, verified and
   reported between each, because each has different content and embeds.
2. `git status`. The user often has uncommitted work; never mix it into your change. If the tree is dirty with
   unrelated files, leave them alone and say so. Don't commit or push unless asked — the user asks explicitly.
3. Make sure a dev server is running (`npm run dev`, port 3000) and Playwright is available in a scratch
   directory (`npm i playwright-core`; the script uses the installed Chrome).
4. **Audit before touching anything**: from the scratch dir run
   `node <skill>/scripts/verify.mjs --url http://localhost:3000/<page> --others /,/case-study-cro`.
   `--others` are pages that are *not* on the kit (they must stay theme-free) — never list a ported page.
   Every SKIP/FAIL is a piece still to build — this is your to-do list and your "before" evidence.

### 1. Read the page and write a mapping
Read the whole page. Produce (in your head or a short note to the user) a table: existing block → kit
block. Typical mappings: pull sentence → `Statement`; quotation/principle → `Quote`; data grid → `Table`;
callout/caveat/"what I got wrong" → `Note` (`tone="flag"` for honesty caveats); hero stat → `BigStat`;
group of headline numbers → `Stats`; long secondary lists → `Peek`; screenshots → `Gallery`/`Sequence`;
figures inside sentences → `Num`; key phrases → `<strong>`. Things with no kit equivalent (live iframe
embeds, custom steppers, status badges, charts) **stay as they are** — place them inside the new section
and frame them; don't rebuild working, bespoke components. Preserve copy verbatim.

Decide, don't ask, unless it's a real fork: section numbering/eyebrows (use the page's existing nav labels),
which 3 facts lead (Role → Company → Product unless the page's story says otherwise), which visual each
story step gets, which image groups become a grid vs a sequence. Ask (briefly, with a recommendation) only
for: how live embeds should look in light theme, or when the content genuinely has two reasonable shapes.

### 2. The kit is shared — import it, don't copy it
The kit was hoisted when OMS became the second consumer. If you need something it lacks, add it to the kit
and re-run the Placement Hub and OMS through `verify.mjs`; a page's own widgets go in its own `<name>.css`.
Before you start, note what in the page has **no kit equivalent** and how it will look in both themes.

### 3. Port
Follow the reference pages' structure closely; copy, don't paraphrase.
1. **Theme scaffold**: `suppressHydrationWarning` on `<html>` (once), page wrapper `.ph-page`, gate script as
   its first child, `<ThemeSwitch />` in `Nav`'s `actions`, import the five kit stylesheets.
2. **Hero**: eyebrow, headline (words wrapped for the mask entrance, no ch cap), intro, `HeroFacts`
   (lead 3 / collapsed rest), actions (primary outlined + `StoryLauncher`), cover, `HeroBackdrop`,
   `ScrollProgress`. Keep the page's own hero art/cover if it has one.
3. **Article**: wrap in `cs-article-grid wrap wrap--wide` with `<main className="lx pcs …fontVars">` and
   `CaseStudyNav`. Move any page-specific CSS that hung off the old section wrapper (e.g. `.cs-article-section …`)
   into `<name>.css` under `.pcs`, on tokens — the old ancestor no longer exists, so those selectors silently stop
   matching. Convert each existing section to `<Section>` with number, eyebrow (= the nav label),
   `category` (2–3 disciplines), `questions`, `artifacts` (**shown as "Deliverables"**), heading.
   `artifacts` is optional: if the page has no real deliverables to list, **omit it** rather than invent claims
   (OMS has none, so its margin shows only the category and questions).
4. **Blocks**: apply the mapping. Add `Num` for key figures and `<strong>` for key phrases (the "Emphasis"
   rules in design-rules.md). Convert images per the image rules — pick grid vs sequence by what the images
   *are*, aim for at least one sequence if there's a flow.
5. **2-minute story**: write 6–8 steps from the page's own content (a visual per step, illustrative numbers
   flagged), in the page's own client module (see kit.md). Replace any existing TL;DR expander in the hero.
6. **Theme**: check every hard-coded colour in the page and its bespoke components (theming.md). Live
   embeds keep their own theme; frame them.
7. **Responsive**: build mobile behaviour as you go, not after (design-rules.md → Responsive).

Scope discipline: change only this page and the kit. If `globals.css` or a shared component must change,
make it additive/token-neutral and confirm other pages render identically. Don't touch other case studies.

### 4. Verify — evidence, not confidence
1. `node <skill>/scripts/verify.mjs --url … --others / --shots ./shots` must end with **0 failed**. A SKIP is
   acceptable only when the page genuinely has no such element (e.g. no prototype embed → no note check).
2. **Look at the screenshots** (`--shots`) in both themes: hero, a text section, a table section, an image
   section, the story, phone. Numbers pass while things still look wrong; eyes catch the rest.
3. Run the existing suites for pages you touched shared files for, and `npx next build`.
4. Check the other case studies and `/` still look identical (no theme attribute, 1400px container).

### 5. Clean up and hand over
- Delete whatever the port orphaned (unused CSS rules, props, components, README lines) — grep before you
  finish. The user has asked for this explicitly and repeatedly. For shared `globals.css`, prune by
  selector family with a script, then prove it: compare selector sets before/after (nothing added, only the
  intended families removed) **and pixel-diff full-page screenshots of every other page** with the old and the
  new stylesheet (reduced-motion, 1440 and 390). OMS's port removed ~900 lines this way with 0.000% difference.
- **Report content bugs you noticed, don't silently fix them** — copy the author wrote that looks wrong
  (OMS: decision 03 repeats decision 01's heading and description). Fix only what is plainly an error in
  something you produce (e.g. alt text that contradicts its image — OMS's chart said 38%, the image says 30%).
- Update the README's case study entry (what the page uses, how to edit its story/sections).
- Report: what changed, what was verified (with counts), what you did *not* check (say it plainly — e.g.
  "light mode on a real phone"), decisions you made that the user may want to reverse, and anything that
  needs their input. Open with who it's written for if it's a document. Keep it short and specific.
- Offer to commit/push; do not do it unasked.

## Per-page notes (re-read the page; they may have changed)
- **OMS — ported** (`app/case-study-oms/`). What it taught: kept the live `OMSComponentEmbed` iframes (in
  `Embed`, staying dark in both themes), `DecisionStepper` (restyled under `.pcs` in `oms.css`, check icon
  inverted in light) and the status badges (light variants); 60-second `TLDR` expander → story with three
  page-specific visuals; cards → `Columns`; stat grid → `Stats` (with `desc`, `text`, `trend`); measure table →
  `Table`; "What I got wrong"/"The bug that shipped" → `Note tone="flag"`; wide diagrams → `Gallery
  fit="natural"`; UI panels → `Gallery fit="contain"`. Hero facts: Role/Company/Product lead, Scope/Team collapsed (Timeline still to be supplied by the author), no `Peek`, no
  sequence (no image flow) — the SKIPs in `verify.mjs` for those are legitimate. Image frames are turned off for this page in `oms.css` (`.oms-page`) because its embeds and screenshots are already cards. Removed `CaseStudySection`,
  `TLDR`'s context variant and ~900 lines of orphaned CSS. Hero "Sample tertiary link" and the hidden primary
  button were placeholders: replaced by "Try the prototype" + the story button. Cover art is still a placeholder.
- **CRO**: seven plain `<h2>` blocks in `.cs-body`, a `CROChart`, and `<TLDR>`. Needs section metadata written
  (numbers, eyebrows, categories, questions) and a contents nav added (`CaseStudyNav`); keep `CROChart`. It still
  uses `TLDR` and `.cs-body` styles — don't prune those from `globals.css` until it is ported.
- **Novatr team / LMS**: "case study in progress" stubs. Don't port until they have real content.

## When something in the design should change
Small per-page adaptations are expected. If the user asks for a change that applies to every case study
(a new spacing, a different accent), change the kit and the reference docs together and re-verify the
Placement Hub — a divergence between the docs and the code is what makes this skill go stale. Update this
skill (`references/` and the per-page notes) at the end of any port that taught you something new.
