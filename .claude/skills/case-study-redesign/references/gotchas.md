# Gotchas — each of these cost real time on the Placement Hub; don't re-learn them

**Reduced motion + server rendering.** The server renders the *animated* branch (hidden initial state). If a
client component then drops its variants because `prefers-reduced-motion` is on, React leaves the SSR'd hidden
inline style in place and the content is stuck invisible. Rule: never remove or swap variants/initial state
based on `useReducedMotion`; keep the same states and make the transition instant (`duration: 0`, stagger 0).
`useReduce()` (in Motion.js) returns false until mounted precisely for this. Tiles once stayed at opacity 0
in reduced-motion because of this; `verify.mjs` checks for it.

**Words glued together in mask animations.** A space *inside* an `overflow:hidden` inline-block gets clipped,
so "words rise out of a mask" renders as one word. Put the space outside the mask span
(`<span><span class="mask">word</span>{' '}</span>`).

**Fixed overlays inside animated ancestors.** `transform`, `filter`, `will-change` on an ancestor make it the
containing block for `position: fixed`. The sections are transformed, so lightbox/story must be portalled to
`document.body`. Consequently they lose scoped CSS variables and font classes — see theming.md.

**Keyframe end-states create stacking contexts.** `animation-fill-mode: both` with an end keyframe of
`filter: blur(0)` leaves a filter on the element forever; end with `filter: none` and `transform: none`. The
site's `.btn--rainbow-outline` relies on a `z-index:-1` pseudo-element and must not sit under an ancestor with a
lingering transform/filter/opacity<1.

**Effects that re-run on every render.** An effect for a modal (focus, scroll lock, key handler) that lists an
inline `onClose` in its deps re-runs constantly, stealing focus and restoring the wrong opener. Keep the latest
handlers in a ref and depend only on `isOpen`. Restore `document.body.style.overflow` in cleanup.

**Layout shift in counters.** A counting number changes width as it runs. `Num` renders the final value
invisibly to reserve space and overlays the live value. Use `tabular-nums`.

**Headline orphan.** `max-width: 24ch` (the site's default headline) leaves one word on a fourth line. Use
`text-wrap: balance` and no ch cap; verify line count at several widths.

**Narrow shared captions.** `.proto-note { max-width: 46ch }` is site-wide. Override with a page-scoped
selector (`.ph-page .proto-note`), never in the shared rule.

**Global CSS leakage.** Next serves imported CSS globally. Every kit selector is scoped to `.ph-page`, `.pcs`,
`.st`, `.px-*`, `.lx-*` or `html[data-cs-theme…]`. Add no bare element selectors. Width changes are scoped to
`.ph-page` for the same reason.

**Measuring mid-animation.** `ScrollRise` and `Section` scale/translate elements, so `getBoundingClientRect`
lefts/widths look inset until they settle. Measure containers (`.cs-article-grid`), not animated children, or
wait for them to settle.

**Computed colours from `color-mix`.** Browsers report them as `color(srgb 0.7 0.7 0.7)` (channels 0–1). A
contrast test that reads them as 0–255 gives nonsense (dark text "1.0:1"). `verify.mjs` handles both.

**Pages that never go network-idle.** Live embeds/polling (e.g. the OMS page) never idle; use `load` + a short
best-effort wait, not `waitUntil: 'networkidle'`.

**Shader on light.** Don't recolour Velaris for light; it turns muddy. Use the CSS wash.

**`next build` while the dev server runs** is fine here, but the static export has no redirects: deleting a
route is a 404. (The old `/case-study-placement-light` was deleted at the user's request.)

**Hydration warning on `<html>`.** Adding `data-cs-theme` before hydration needs `suppressHydrationWarning` on
`<html>` in `app/layout.js` (already done once; don't remove it).

**Don't spread a design choice to other pages by editing shared CSS.** Prefer additive, scoped rules. If a
shared rule must change, make the change token-neutral and confirm the other pages render identically.

**Clean up behind you** (standing user instruction). When a change orphans a file, class, prop, comment or
README line, delete it in the same task — e.g. the row gallery layout after the flow sequence replaced it,
`MetaStrip`'s extra props after the hero stopped using it. Grep for the name before finishing.

## Learned porting OMS

**Selectors that hung off the old wrapper stop matching.** OMS's stepper and badges were styled through
`.cs-article-section …` ancestors. The kit's `Section` doesn't have that class, so they lost their styling with no
error. Re-home such rules under `.pcs` (specificity beats `.lx-body p`), on tokens, in `<name>.css`.

**Kit prose rules outrank kit classes.** `.lx-body p` (0,1,1) beats a bare `.px-gallery__caption` (0,1,0), so a
`<p>` caption rendered at body size. Prefix element-level kit classes that live inside prose with `.pcs`.
A button inside prose needs `.lx-body a.btn { text-decoration: none }` (already in article.css).

**Assets drawn for dark.** A white-stroke SVG icon vanishes on light (fix: `filter: invert(1)` under the light
theme); screenshots and iframes of dark UIs stay dark — frame them (hairline, radius, theme-surface backdrop),
don't recolour them. `Gallery fit="contain"` letterboxes on `var(--s2)`, not white.

**Alt text can contradict the image.** OMS's chart alt said Team Manager 38%; the image says 30%. When a story
or caption uses numbers from an image, read the image, not the alt. Fix the alt and say so.

**A 5:4 tile crops wide diagrams.** Use `fit="natural"` (frame = image shape) for 3:1+ diagrams; `contain` for
cropped UI panels; keep `cover` for full-screen screenshots.

**`--others` in verify.mjs means "must stay theme-free".** Listing a ported page there fails by design.

**Reduced-motion check must look at tiles in view.** Tiles far down the page legitimately wait for scroll.

**Pruning a shared stylesheet.** Generate the new file by script (drop selectors from named families whose
classes no code references; drop rules left empty), then prove it: selector-set diff (nothing added) + full-page
pixel diffs of the other pages with old vs new CSS. Do not prune families another page still uses (CRO uses
`TLDR` and `.cs-body`).

**Double borders around finished cards.** The kit frames tiles and embeds with a hairline. A live embed or a
screenshot that already draws its own card (border + radius) then shows two edges. On such a page turn the kit's
frames off with page-scoped rules (`.<page>-page .lx-embed__frame`, `.px-tile__frame` → `border: 0`; drop the
tile backing on full-bleed images with `:not(.is-contain)` so no light slivers show at rounded corners). Do it
in `<name>.css`, scoped to a class on the page wrapper, so other kit pages keep their frames.

**Dark images flush to their edge in light theme.** A dark chart with no margin of its own blends into a dark
page but reads as a hard block with text touching the edge on light. That is the asset, not the frame — ask
the author for an image with margin (or scale it down) rather than adding padding hacks to the kit.
