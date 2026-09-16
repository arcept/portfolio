# Placement Hub — interactive prototype (`products/placement`)

A portfolio prototype for Manik's (arcept.in) case study of **Novatr Placement Hub (2024)**. It follows the same pattern as `products/oms`: a standalone Vite app in this monorepo, built and synced into `public/case-studies/placement/prototype/`, and embedded by the case study. It must feel like the shipped product, one step beyond polished.

The spec lives in **`docs/placement/`** (paths below are relative to the repo root).

## Read first, in order
1. `docs/placement/spec/acceptance.md`: what "done" means, including the 60-second test
2. `docs/placement/spec/state-model.ts`: the five state dimensions and `derive()`
3. `docs/placement/spec/scenarios/README.md`, then the four scenario JSONs
4. `docs/placement/spec/screen-map.md`: slug → Figma node → reference PNG
5. `docs/placement/spec/components.md`, `docs/placement/spec/tokens-product.css`, `docs/placement/spec/tokens-chrome.css`
6. `products/oms/CLAUDE.md`: house conventions (Untitled UI, React Aria, kebab-case, `Aria*` imports). **They apply here too.**

## Non-negotiables
- **As shipped in 2024.** Not a redesign. Do not build the pre-application per-criterion skills-match panel; it was cut. Do not invent screens: "disqualified once" is shown by message and badge only, and declining an offer goes through the offer-concern form.
- **Two visual systems, never mixed.** Inside the device frame is the Novatr product: Figtree, Untitled UI tokens (the Novatr file uses the Untitled UI palette), always light. Around it is the case-study chrome (frame, chapter rail, time chips, Designer's notes, controls): `tokens-chrome.css`, scoped under `.chrome`, with light and dark themes.
- **State drives screens.** Each screen is a pure function of `LearnerState`. Scenario steps apply state patches, and the renderer follows. Phase 2's state-switcher reuses the same renderer, so do not special-case scenario slugs inside components.
- **Real copy, real names.** Copy the Figma text verbatim. Company names stay as in Figma (AECOM Architects, …).
- No backend. No analytics. No runtime network calls.

## Stack: mirror `products/oms`
- Untitled UI React Vite starter: React 19, TypeScript, **Tailwind CSS v4**, **React Aria Components**, `motion` for animation, `react-router` with **HashRouter**, `@/` alias to `src/`, and npm (not pnpm).
- Scaffold by copying `products/oms`'s config files (`package.json` with deps trimmed to what's used, `vite.config.ts`, `tsconfig*.json`, `.prettierrc`, `index.html`, `src/styles/*`, `src/utils/cx.ts`, `src/providers/router-provider.tsx`) and only the `components/base` and `components/application` pieces you need. Do not copy OMS pages, data or PDF code.
- **Fonts:** Figtree via `@fontsource-variable/figtree` for the product. Newsreader, Archivo and IBM Plex Mono for the chrome, self-hosted with fontsource as well (no Google Fonts calls).
- **Product tokens:** keep Untitled UI's `theme.css`, set brand to **Purple** (700 `#5925DC`), and override the font family to Figtree. Check every value against `docs/placement/spec/tokens-product.css`; that file is the source of truth for anything that differs.
- `vite.config.ts` → `base: "/case-studies/placement/prototype/"`.
- **Embed:** the same pattern as OMS: a `?embed=<key>` query param resolved in `main.tsx`, not a route. Keys are `walkthrough` (full chrome, compact) and `scenario-01`…`scenario-04` (one scenario, chrome-light).
- **Build and sync:** add `scripts/sync-placement-prototype.js` (a copy of `scripts/sync-oms-rebuild.js` with its paths changed) and a root script `"build:placement-prototype": "npm --prefix products/placement run build && node scripts/sync-placement-prototype.js"`.

## Structure
```
products/placement/src/
  state/        learner-state.ts (from spec), derive.ts, apply-patch.ts, fixtures/ (jobs, applications, updates)
  components/
    base/ application/   Untitled UI pieces, as in OMS
    product/             Novatr components, per components.md (dynamic-banner, job-card, cta-tab, steps-tracker, status-message, applied-job-card, …)
    chrome/              device-frame, scenario-picker, chapter-rail, time-chip, designer-notes, step-controls, fork-card, end-card
  screens/      learner-hub, home, jobs, my-applications, job-description, interest-form, popups/
  scenarios/    loader for docs/placement/spec/scenarios/*.json (import via relative path or copy at build)
  pages/        walkthrough.tsx, embed-view.tsx, not-found.tsx
  styles/       globals.css, theme.css, typography.css, chrome.css
```
All files are kebab-case.

## Task 0: export from Figma (do this before any code)
Figma file `PdyMV2HJfhopCns7oyZcNL`, page **Handover** (3419:55339). The file has about 6,300 frames, so **never** call `get_metadata` on the page or on whole boards. Work node by node from `screen-map.md`.
1. Export every node in `docs/placement/spec/screen-map.md` with `get_screenshot` (maxDimension 1440) to `docs/placement/spec/screens/<slug>.png`.
2. Look at each ⚠ entry and correct its slug or node in `screen-map.md`. The tracker-row order and the pop-up flow order are the most likely to be wrong. Also look for a "portal closing in a week" state.
3. Export assets to `products/placement/src/assets/`: the 9 Dynamic Banner illustrations (3473:98425 children), the empty-state art (the hourglass in Job Cards 3529:55664), company logos and placeholders (3073:37900, 4507:64832), and the Self Placement / Contact Us card art. Prefer SVG; use PNG @2x otherwise.
4. For components, call `get_design_context` per component node listed in `components.md`, only when building that component.
5. Build a contact sheet at `docs/placement/spec/screens/_contact-sheet.png` and report the list of ⚠ corrections. **Stop for Manik's review before Task 1.**

## Task 1 onward: build
- **Build order:** scaffold → state + fixtures → product components → screens for scenario 01 → chrome → scenarios 02–04 → motion polish → embed keys → build + sync.
- **Product canvas:** 1440 × 900 logical size, scaled uniformly to fit the frame. It never reflows.
- **Fidelity loop:** for every hero step, compare against `docs/placement/spec/screens/<slug>.png`, using a dev-only `?overlay=1` mode at 50% opacity, before moving on.
- **Git:** small commits per component or screen, in the same message style as the repo's history (imperative, descriptive).

## Working with Manik
- Offer choices as multiple choice; don't make him write free text.
- End every checkpoint with one concrete decision for him.
- Show before you polish: a screenshot of each finished screen next to its reference.
- Use placeholders only when visibly labelled as placeholders.

## Decisions record
The source of truth is `docs/placement/docs/prototype-decisions.md`, mirrored in the claude.ai Project "Placement Portal". If a decision changes, update that file and tell Manik.
