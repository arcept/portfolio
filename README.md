# Manik Madaan — Portfolio (v3)

Next.js (App Router, JavaScript) + Tailwind CSS + `motion` (motion/react),
statically exported and deployed to GitHub Pages behind the custom domain
`www.arcept.in`.

## What's here

- `app/page.js` — homepage: hero, selected work (3 cards), about
- `app/case-study-cro/page.js` — the Novatr CRO/data-informed redesign case
  study, with an interactive traffic-vs-conversion chart
- `app/case-study-novatr-lms/page.js`, `app/case-study-hapramp/page.js` —
  placeholder case study pages, marked "in progress"
- `components/` — shared Nav, Footer, Reveal (scroll-in animation),
  Card (hover), MetaStrip, CROChart
- `tailwind.config.js` — the Linear-inspired dark design system (colors,
  type scale, spacing, radius) as theme tokens

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
