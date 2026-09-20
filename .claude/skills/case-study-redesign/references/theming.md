# Theming: one page, two themes

Dark is the design (and the default). Light is the *same page* with tokens swapped — never a second page.
An earlier attempt built a separate light page and had to keep its copy in sync by hand; that is why this
exists. The page never forks content.

## Mechanism
1. **State**: `data-cs-theme="dark"|"light"` on `<html>`. Only present while a page that installs the kit is
   open. Everything else on the site is untouched (verify: `/`, other case studies have no attribute).
2. **Which theme**: a choice made with the switch this visit (sessionStorage `cs-theme`) → else the OS
   (`prefers-color-scheme`, live — it follows changes while the page is open) → else dark. Session-only on
   purpose, so the next visit starts from the OS again.
3. **No flash**: an inline `<script dangerouslySetInnerHTML={{__html: themeGateScript()}}/>` as the *first
   child of the page wrapper* sets the attribute during parse, before paint. `<html>` in `app/layout.js`
   needs `suppressHydrationWarning` (the attribute isn't in the server HTML).
4. **Client navigations**: inline scripts don't run there, so `ThemeSwitch` (mounted in the nav) applies the
   theme on mount, follows OS changes, and **removes the attribute on unmount** so a choice can't leak onto
   other pages.
5. **The switch**: `<Nav actions={<ThemeSwitch />} />`. Knob/icon position is CSS from the `<html>`
   attribute (`html[data-cs-theme='light'] .cs-switch__knob`), so it is correct on first paint;
   `aria-checked` comes from `useCsTheme()`.

## Token layers (themes.css)
- **Article tokens** on `.pcs` (the `<main class="lx pcs …">`): `--ink --base --t1..t4-pct --line --line-2
  --s2 --sunk --accent --on-accent --good --bad --warn --shadow-frame`. article.css derives every gray with
  `color-mix(ink N%, base)`. Dark is the default `.pcs`; light overrides under `html[data-cs-theme='light'] .pcs`.
- **Site tokens** on `html[data-cs-theme='light']`: `--void --carbon --obsidian --graphite` (surfaces),
  `--paper --mist --fog --ash` (text, strongest → quietest), `--article-green`. The nav, hero, buttons,
  contents nav, prototype frame and footer already read these, so remapping flips them all with no edits to
  those components. `--paper` is *text* in dark (white) and becomes near-black in light; buttons that use
  `--paper` as a fill invert correctly.
- Hard-coded colours don't flip. When porting, search the page's CSS/JSX for `#fff`, `#08090a`, `rgba(255`,
  `rgba(8,` and either replace with a token or add a light override. If you touch `globals.css`, only make
  token-neutral edits (e.g. `color-mix(in srgb, var(--void) 80%, transparent)` equals the old rgba in dark), so
  other case studies render identically.
- `--bg` on `.pcs` is `var(--void)` so `Peek`'s fade blends into the real page colour in both themes.

## Things that need their own light treatment
- **Hero background**: the Velaris shader is built for dark and looks muddy on light. Dark keeps the shader;
  light uses a CSS wash (`.ph-wash`, three radial gradients drifting over 24s). `HeroBackdrop` picks by theme
  and renders nothing until the theme is known, so the hero's CSS gradient shows through first paint.
- **Hero gradient + fade** are CSS (`.cs-hero` override, `.ph-hero__fade` uses `var(--void)`).
- **Overlays** (story, lightbox) are portalled to `<body>`, outside `.pcs` — they can't inherit article
  tokens. The story defines its own `--st-*` variables and a `html[data-cs-theme='light'] .st` override.
  The lightbox is deliberately dark in both themes.
- **Fonts for portals**: `next/font` variable classes sit on `<main>`; a portal is outside it, so pass them
  in (`StoryLauncher fontClass=…`). Body-level fonts (`--font-inter`, `--font-ibm-plex-mono`) are on `<html>`.
- **Embedded live content** (iframes of prototypes/dashboards) keeps its own theme in both modes; frame it
  (border, radius, shadow) so it reads as a device on either background.

## Verifying a theme port
`scripts/verify.mjs` covers the mechanism, contrast in both themes, story theming, phone overflow in both.
Also *look*: screenshot hero, one text-heavy section, one table section, one image section, the story, in
both themes. Watch for: dark patches left in light, light text on light, invisible hairlines, shadows that
only make sense on dark, focus rings that vanish.
