# Manik Madaan — Portfolio (v3)

Next.js (App Router, JavaScript) + Tailwind CSS + `motion` (motion/react),
statically exported and deployed to GitHub Pages behind the custom domain
`www.arcept.in`.

## What's here

- `app/page.js` — homepage: hero, selected work (4 cards), about
- `app/case-study-cro/page.js` — the Novatr CRO/data-informed redesign case
  study, with an interactive traffic-vs-conversion chart
- `app/case-study-oms/page.js` — the Novatr OMS v3.0 rebuild case study:
  six-section long-form write-up, sticky scroll-spy TOC, and the live
  prototype (see below) embedded in an iframe
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
