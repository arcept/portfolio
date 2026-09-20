# Manik Madaan — Portfolio (v3)

Next.js (App Router, JavaScript) + Tailwind CSS + `motion` (motion/react),
statically exported and deployed to GitHub Pages behind the custom domain
`www.arcept.in`.

## What's here

- `app/page.js` — homepage: hero, selected work (5 cards), about
- `app/case-study-cro/page.js` — the Novatr CRO/data-informed redesign case
  study, with an interactive traffic-vs-conversion chart
- `app/case-study-oms/page.js` — the Novatr OMS v3.0 rebuild case study:
  six-section long-form write-up, sticky scroll-spy TOC, and the live
  prototype (see below) embedded in an iframe
- `app/case-study-placement/page.js` — the Novatr Placement Hub case study ("Making Placement
  Visible"). One page, two themes: dark is the design and light is the same page with its tokens
  swapped. The theme is an attribute on `<html>` (`data-cs-theme`); `themes.css` holds both
  palettes and remaps the site tokens so the nav, hero, buttons, contents nav and prototype frame
  flip with the article. It follows the operating system (live, if it changes), falling back to
  dark if the browser doesn't expose a setting; the switch in the nav overrides that for the
  current visit only. An inline script at the top of the page (`components/theme/theme.js`) sets the
  attribute before anything paints, so there is no flash, and the attribute only exists while this
  page is open. Containers grow to 1600px on wide screens (`hero.css`); the rest of the site stays
  at 1400px.
  - **Hero** (`hero.css`): entrance is CSS keyframes; lead facts (role, company, product) show and
    scope/team/timeline collapse (`HeroFacts`); the moving gradient is the site's shader in dark
    and a CSS wash in light (`HeroBackdrop`). "Read the 2-minute version" (`Story.js`, content in `storySteps.js`, styles in
    `story.css`) opens a full-screen, step-by-step story — edit `storySteps.js` when the copy
    changes.
  - **Article** (`sections.js`, structure in `article.css`): seven sections animated on scroll
    (they zoom in and settle, then zoom out and dim), with a faded numeral, no card behind them,
    and colours from tokens only. Body blocks that exist only here live in `components/placement/`
    with styles in `blocks.css`: `Shots` (screenshots as same-size tiles that zoom in a lightbox,
    plus animated sequences), `Peek` (an expandable that fades out below its first lines) and `Num`
    (a green figure that counts up inside a sentence). `ScrollProgress` draws the reading progress
    line along the top.
  - The prototype is embedded in an iframe (`products/placement-hub`, synced into
    `public/case-studies/placement-hub/` — see "Rebuilding the Placement Hub prototype" below)
- `.claude/skills/case-study-redesign/` — a Claude Code skill that applies the Placement Hub case study's
  design (structure, spacing, animation, contrast, hero, 2-minute story, image treatments, dark/light
  theme, responsive behaviour) to another case study, with a browser verification script. Ask Claude to
  "apply the case study redesign to <page>"; keep its `references/` in step with the code.
- `app/case-study-novatr-lms/page.js`, `app/case-study-hapramp/page.js` —
  placeholder case study pages, marked "in progress"
- `components/` — shared Nav, Footer, Reveal (scroll-in animation),
  Card (hover), MetaStrip, CROChart, CaseStudyNav (scroll-spy TOC),
  PrototypeEmbed, TLDR, plus vendored effects (StarBorder, WarpText)
- `prototype/oms-v3/` — the OMS v3.0 prototype's actual source: plain
  HTML/CSS/JS (no framework, no build step beyond concatenation) —
  `index.html` for local preview, modular `css/*.css` + `js/*.js`
  (a tiny pub-sub store + template-string rendering), and `build.js`,
  which bundles it all into the two files the case study actually
  serves: `public/case-studies/oms/dist.html` (standalone) and
  `embed.html` (boots straight into the dashboard, used in the iframe).
  This is the one editable copy — edit here, then `npm run build:oms`,
  never hand-edit the built files in `public/`.
- `tailwind.config.js` — the Linear-inspired dark design system (colors,
  type scale, spacing, radius) as theme tokens for the portfolio shell.
  The OMS prototype has its own separate, intentionally different
  light/product-style token set in `prototype/oms-v3/css/tokens.css`.

## Run locally

```
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```
npm run build
```

Outputs a static site to `/out` (via `output: 'export'` in
`next.config.js`), ready to serve from any static host — no Node server
needed in production.

### Rebuilding the OMS prototype

The prototype embedded in the OMS case study isn't part of the Next.js
build — it's a separate static bundle. After editing anything in
`prototype/oms-v3/`, regenerate it with:

```
npm run build:oms
```

This writes straight to `public/case-studies/oms/dist.html` and
`embed.html`. It's a manual step (not wired into `npm run build`) since
the prototype doesn't change every deploy — run it, check the result,
then commit the regenerated files alongside your source edit.

### Rebuilding the Placement Hub prototype

The prototype embedded in the Placement Hub case study is a separate Vite
app in `products/placement-hub/`. After editing it, regenerate the served
copy with:

```
npm run build:placement-hub
```

This builds it (with its production `base` of
`/case-studies/placement-hub/prototype/`) and copies the output into
`public/case-studies/placement-hub/prototype/`. Like the OMS one it's a manual
step, not part of `npm run build`. `public/case-studies/placement-hub/preview.png`
is the static screenshot phones see instead of the interactive frame; retake it
if the Home screen changes noticeably.

## Deploy

Deploys automatically via `.github/workflows/deploy.yml` on every push to
`main`: builds the static export and publishes `/out` to GitHub Pages.
Custom domain is preserved via `public/CNAME` → `www.arcept.in`.

**One-time setup**: in the repo's Settings → Pages → Build and deployment →
Source, this must be set to **GitHub Actions** (not "Deploy from a branch") —
the old plain-HTML setup served files directly from the repo root, which
doesn't work once there's a build step.

## Next passes

- Add real product/team screenshots to replace the image placeholder slots
  (LMS stub, Hapramp stub, and eventually inline in the CRO case study)
- Write the full "Building the Novatr LMS" and "Building a Design Team from
  Zero" case studies
- Add a resume download link once the resume draft is ready
