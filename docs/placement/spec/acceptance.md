# Acceptance — what "done" means for phase 1

## The 60-second test (governs everything)
A hiring manager who clicks Next for 60 seconds on the happy path, notes off, can say: *the learner always knows where they stand, and the screen changes because their state changed.*

## Global
- [ ] Every product screen renders from `LearnerState` via `derive()`; no screen hard-codes a status.
- [ ] Product UI visually matches the reference PNG for its slug (layout, type, colour, spacing) at 1440w. Side-by-side overlay check for every hero step.
- [ ] Product UI uses only the Untitled UI theme (brand Purple, Figtree) checked against `tokens-product.css`; chrome uses only `tokens-chrome.css` scoped under `.chrome`. No leakage either way.
- [ ] Figtree for product; Newsreader / Archivo / IBM Plex Mono for chrome.
- [ ] Real Figma copy verbatim (typos in the original such as "eligibilty" kept only where visible in the shipped screen — decide once, record in CLAUDE.md).
- [ ] Company names as in Figma (AECOM Architects etc.).
- [ ] Nothing that was cut is shown as shipped (no pre-apply per-criterion skills-match panel). No invented screens (disqualified-once = message + badge only).
- [ ] Transitions: state changes animate (`motion`, as in products/oms), ≤ 300ms for in-page, page transitions ≤ 450ms; `prefers-reduced-motion` respected.
- [ ] Keyboard: ←/→ step, N toggles notes, Esc closes pop-ups. Visible focus.
- [ ] `?embed=walkthrough` and `?embed=scenario-01…04` work from `public/case-studies/placement/prototype/index.html` after `npm run build:placement-prototype`; fit a 16:10 iframe from 720px to 1440px width and scale the 1440 product canvas without reflow.
- [ ] Hard refresh on any hash route and any embed key loads correctly from the static path.
- [ ] Lighthouse ≥ 90 performance and accessibility on the synced build.
- [ ] Follows products/oms conventions: kebab-case files, `Aria*` import prefix, `@/` alias.

## Chrome
- [ ] Scenario picker (4 cards: 2 hero, 2 short).
- [ ] Chapter rail on hero scenarios; jump to chapter start.
- [ ] Time chip appears on every `advance` step, in the chrome.
- [ ] Designer's notes toggle: off by default, persists (localStorage in try/catch), renders nothing for empty notes.
- [ ] Step counter "07 / 17", mono.
- [ ] Short scenarios open on a fork card; end card offers the other branch and the other scenarios.
- [ ] Light/dark for chrome only.

## Per scenario
**01 Happy path** — all 18 steps; location mismatch is a warning with "apply anyway"; after offer, apply is disabled on any JD visited; the accept-offer popup carries the rating ask (4-step sequence) before redirecting home; placed home shows subdued navbar (focus mode).
**02 Rejection + closure** — rejection shows stage + reason; concern pop-up submits to acknowledgement; closure screen reached only with no in-flight applications (assert via `derive().hubMayClose`).
**03 Gate** — both branches; incomplete-profile JD allows browsing, blocks apply with "My Profile ↗"; not-eligible routes to self-placement form.
**04 Exit ladder** — invalid decline ends on Access Restricted with navbar locked; disqualified branch shows badge + message first, lockout second.

## Phase 2 (not now)
State-switcher rail: controls for the five dimensions + content conditions, driving the same renderer. Mobile toggle from the mobile boards.
