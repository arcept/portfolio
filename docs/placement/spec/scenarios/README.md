# Scenario scripts — conventions

- `screen`: slug from `../screen-map.md`.
- `set`: state patch applied on entering the step (dot/bracket paths allowed). Screens render from `LearnerState`, never from the slug alone — the slug is the reference image for fidelity.
- `action`: the learner-facing click that advances. `advance` = no learner action; show the **time chip** and a Next control. `end` = scenario end card.
- `timeChip`: shown in the chrome (not inside the product UI) whenever time passes, e.g. "Day 3 · ops updated Retool". Transition the state visibly.
- `note`: Designer's note. Rendered in the chrome. **Hidden by default**, revealed by a "Designer's notes" toggle that persists across steps (localStorage, try/catch). Empty notes render nothing.
- `chapter`: hero scenarios are grouped into chapters; the chrome shows a chapter rail and allows jumping to a chapter's first step.
- `branches` (short scenarios): a fork card at the start lets the viewer pick a branch; both branches reachable from the end card.
