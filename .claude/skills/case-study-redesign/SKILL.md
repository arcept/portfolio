---
name: case-study-redesign
description: Transform an existing case study page in this portfolio (OMS, CRO, or a new one) into the Placement Hub format — numbered sections with a sticky margin, cardless layout on a 1600px container, scroll animations and faded numerals, a clear text-contrast hierarchy, an animated hero with collapsible facts, a top progress bar, tiles + lightbox + animated sequences for images, inline counting figures, a full-screen "2-minute version" story, and a single-page dark/light theme switch that follows the OS. Use this whenever the user wants another case study to "look like the Placement Hub one", asks to apply/replicate/port that redesign, wants a case study made responsive, themeable, or animated in that style, or asks for the light/dark theme, the progress bar, the 2-minute read, or the image gallery treatment on a different page — even if they only name one of those pieces.
---

# Case study redesign

Moves a case study onto the kit built for **Placement Hub** (`app/case-study-placement/`,
`components/placement/`, `components/theme/`). That page is the reference implementation: when this document
and the code disagree, the code wins — read it.

The kit is the product of a long design conversation, so the numbers in `references/` are decisions the
user already approved, not suggestions. Reuse them; deviate only when a page's content forces it, and say so.

## Read first (in this order, only what you need)
- `references/design-rules.md` — structure, width, spacing, hero hierarchy, contrast, motion, content and
  image rules, the 2-minute story, responsive behaviour. **Read fully before designing anything.**
- `references/kit.md` — which files are reusable, the block APIs, and the one-time hoisting step.
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
   `node <skill>/scripts/verify.mjs --url http://localhost:3000/<page> --others /,/case-study-oms`.
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

### 2. Hoist the kit (first port only)
If `components/case-study-kit/` (or equivalent shared location) doesn't exist yet, do the move described in
`references/kit.md → Hoisting`, in its own commit, and prove Placement Hub is unchanged with `verify.mjs`.
If it already exists, skip.

### 3. Port
Follow the reference page's structure closely; copy, don't paraphrase.
1. **Theme scaffold**: `suppressHydrationWarning` on `<html>` (once), page wrapper `.ph-page`, gate script as
   its first child, `<ThemeSwitch />` in `Nav`'s `actions`, import the five kit stylesheets.
2. **Hero**: eyebrow, headline (words wrapped for the mask entrance, no ch cap), intro, `HeroFacts`
   (lead 3 / collapsed rest), actions (primary outlined + `StoryLauncher`), cover, `HeroBackdrop`,
   `ScrollProgress`. Keep the page's own hero art/cover if it has one.
3. **Article**: wrap in `cs-article-grid wrap wrap--wide` with `<main className="lx pcs …fontVars">` and
   `CaseStudyNav`. Convert each existing section to `<Section>` with number, eyebrow (= the nav label),
   `category` (2–3 disciplines), `questions`, `artifacts` (**shown as "Deliverables"**), heading.
   Sections that have no natural "question/deliverables" get a short honest one written from the content —
   or ask the user if it would be inventing a claim.
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
  finish. The user has asked for this explicitly and repeatedly.
- Update the README's case study entry (what the page uses, how to edit its story/sections).
- Report: what changed, what was verified (with counts), what you did *not* check (say it plainly — e.g.
  "light mode on a real phone"), decisions you made that the user may want to reverse, and anything that
  needs their input. Open with who it's written for if it's a document. Keep it short and specific.
- Offer to commit/push; do not do it unasked.

## Per-page notes (as of this writing — re-read the page, they may have changed)
- **OMS** (`app/case-study-oms/page.js`, ~1100 lines): 9 sections + an unnumbered "Open Threads" via
  `CaseStudySection`, a `TLDRProvider`/`TLDRPanel` 60-second expander (replace with `StoryLauncher`),
  `cs-article-*` blocks (statements, cards, warnings, annotations, captions), **live `OMSComponentEmbed`
  iframes**, `DecisionStepper`, status badges, and `projectFiles` on the contents nav. Keep the embeds,
  stepper, badges and project files; convert the prose scaffolding. `CaseStudySection` has its own mobile
  clamp/"see more" behaviour — `Section` + `Peek` replace it, so remove what becomes unused.
- **CRO**: seven plain `<h2>` blocks in `.cs-body`, a `CROChart`, and `<TLDR>`. Needs section metadata written
  (numbers, eyebrows, categories, questions) and a contents nav added (`CaseStudyNav`); keep `CROChart`.
- **Novatr team / LMS**: "case study in progress" stubs. Don't port until they have real content.

## When something in the design should change
Small per-page adaptations are expected. If the user asks for a change that applies to every case study
(a new spacing, a different accent), change the kit and the reference docs together and re-verify the
Placement Hub — a divergence between the docs and the code is what makes this skill go stale. Update this
skill (`references/` and the per-page notes) at the end of any port that taught you something new.
