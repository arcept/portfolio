# Prototype decisions log — Placement Portal

Companion to `claude/prototype-brief.md`. Decided 16 Sep 2026.

| Decision | Choice |
|---|---|
| Form | **C, staged**: guided walkthrough first (phase 1), then the state-switcher rail (phase 2) |
| Devices | **Desktop first**, mobile toggle later, built from the handover's mobile boards |
| Spine | **2 hero + 2 short.** Hero, full depth: (1) happy path → placed/focus mode; (2) rejection after interview → window closes → closure screen. Short 3–4-step branches: (3) gate: eligible + incomplete profile vs not eligible; (4) exit ladder: invalid decline → access restricted; disqualified once → fully |
| Company names | **Keep the Figma names** (AECOM etc.) as in the handover |
| Workflow | Settle decisions + Figma extraction + scenario scripts + handoff folder here in Cowork, then move to Claude Code in VS Code **before any code is written** |
| Architecture | **Mirrors products/oms** — Untitled UI Vite starter (React 19, TS, Tailwind v4, React Aria, `motion`, HashRouter), code in `products/placement`, spec in `docs/placement`. `base: /case-studies/placement/prototype/`; built + synced by `npm run build:placement-prototype`; embeds via `?embed=walkthrough` / `scenario-01…04`. One `LearnerState` across five dimensions; screens are pure functions of it; walkthrough = scripted state patches; switcher reuses the renderer |
| Handoff folder | `CLAUDE.md`, `spec/state-model.ts`, `spec/scenarios/*.json`, `spec/tokens-product.css`, `spec/tokens-chrome.css`, `spec/screens/*.png`, `spec/assets/`, `spec/components.md`, `spec/screen-map.md`, `spec/acceptance.md` |
| Product tokens | **Locked** — Figtree, Untitled-UI-named palette; Purple 700 brand, Gray Cool 900 primary action. `claude/prototype-spec/tokens-product.css` |
| Component scope | **Locked** — 24 spine components **plus the interest form**. FAQs out. `claude/prototype-spec/components.md` |
| Screen map | ~75 frames mapped to spine with node IDs; ⚠ items to verify on export. `claude/prototype-spec/screen-map.md` |
| Exports (screens + assets) | figma.com downloads blocked in Cowork → **first task in Claude Code**: export all screen-map nodes and assets via Figma MCP, resolve ⚠ items |
| Disqualified once | **Message + badge only** — no invented warning screen |
| Offer decline | **Via the offer-concern form** (4065:53834 → 53899 → 53964); ops judges validity |
| Designer's notes | **Toggle**, off by default, persists per viewer |
| Time skips | **Visible time chip** in chrome ("Day 3 · ops updated Retool") + real transition |
| Hero length | **Chaptered**: happy path 17 steps in Enter · Browse · Apply · Outcome; rejection in Outcome · Support · Closure |
| Handoff | Spec in `manik-portfolio/docs/placement`; brief at `products/placement/CLAUDE.md`; KICKOFF run from repo root. Task 0 = Figma exports, then stop for review |
| Sticky notes | Already transcribed in `claude/sticky-annotations.md` — no re-read needed |

## Task 0 review, 16 Sep 2026
| Decision | Choice |
|---|---|
| lh-graduate-popup | Wrong node in screen-map (3813:58636 was the not-eligible popup). Correct node found via text search: 3813:29779, exact "Congratulations…" copy with single "Go to Placement Hub" CTA. |
| home-jobs-not-applied | Reference node (3905:163842) renders the profile-incomplete banner/CTA, not the profile-complete state the happy path needs at that step. **Use it anyway** — swap the banner/CTA copy to the complete-profile state by hand when building. |
| Offer-accepted flow | The 4 "celebration" nodes are one sequence (congrats+rate → review textarea → redirecting → thank-you), not variants to choose between. **Rating now happens inside this popup sequence** — `home-rating`/`home-feedback-received` dropped from the happy-path spine (renumbered scenario 01 to 18 steps; updated `acceptance.md`). |
| "Portal closing in a week" | No frame found anywhere in the exported set. **Skipped for phase 1** — `windowClosingSoon` stays a state flag with no dedicated visual. |
| Apply-flow popups | Location-mismatch and policy-reminder nodes were swapped in screen-map — corrected via visual verification, no open question. |

## Next
Task 0 done — see `docs/placement/spec/screen-map.md` Gaps section for the full verification log. Task 1 (scaffold) started: `products/placement` builds and type-checks clean, scaffold page renders chrome tokens/fonts correctly.
