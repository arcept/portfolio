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
  Visible"), dark version. The hero, prototype embed and contents nav are the site's own; the seven
  sections (`sections.js`) are animated cards — they zoom in and settle as they arrive, zoom out and
  dim as they leave, and carry a faded section numeral in the corner. The cards, their scroll
  animation and their type hierarchy are the light version's components
  (`components/light/`) and styles (`../case-study-placement-light/light.css`, imported here)
  with a dark palette from `dark.css` — so `light.css` has to keep being importable. The prototype
  is embedded in an iframe (`products/placement-hub`, synced into
  `public/case-studies/placement-hub/` — see "Rebuilding the Placement Hub prototype" below)
- `app/case-study-placement-light/page.js` — the light version of the Placement Hub case study:
  layered gray-token surfaces and scroll-driven motion, fully scoped under `.lx` (`light.css`,
  `components/light/`). Its section content is generated from the dark page's, so copy edits made
  to `app/case-study-placement/page.js` need re-applying there by hand.
  **The dark and light pages are one case study with two themes.** Both carry the same switch
  (`components/theme/`), which flips between them and keeps you in the same section. Which one you
  land on follows the operating system (live, if it changes), falling back to dark if the browser
  doesn't expose a setting; a choice made with the switch lasts for that visit only. An inline
  script at the top of each page redirects before anything paints, so there is no flash.
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
