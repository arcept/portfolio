# Manik Madaan — Portfolio (v1)

This is a plain HTML/CSS/JS site — no build step, no framework, no `npm install`
required. Open `index.html` directly in a browser and it works. That was a
deliberate choice for this first build, not just a workaround (see note below),
and it's a perfectly good permanent stack for a portfolio: it loads fast, has
zero dependency risk, and is easy to keep editing by hand or with AI help.

## What's here

- `index.html` — homepage
- `case-study-cro.html` — first case study: the Novatr CRO/data-informed
  redesign, adapted from your Medium article, with an interactive chart
- `styles.css` — the whole design system (colors, type, layout, chart styling)

## Preview it locally

No server needed — just open the file:

```
open index.html
```

(On Windows/Linux, double-click it in a file browser, or run a tiny local
server if you want relative links to behave exactly like production:
`npx serve .` or `python3 -m http.server`.)

## Deploy it (free, ~10 minutes)

1. Create a new GitHub repo (e.g. `manik-portfolio`) and push this folder to it.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and "Import"
   that repo. Vercel will detect it as a static site — no build command, no
   output directory needed. Deploy.
3. You'll get a live `*.vercel.app` URL immediately.
4. In the Vercel project's Settings → Domains, add the domain you registered
   and follow the DNS instructions it gives you (usually one CNAME or A
   record at your registrar). SSL is automatic.

## A note on why this isn't Next.js/React

The original plan called for Next.js + Tailwind. This cloud workspace's
network access to package registries (npm, pip, etc.) is currently blocked
by policy, so `npm install` can't run here. Rather than block on that, this
version is zero-dependency plain HTML/CSS/JS — it deploys exactly the same
way, and it's honestly a fine long-term choice for a portfolio site. If you
want the Next.js/React version later (useful mainly if you want component
reuse across many more pages, or you want that specific line on your AI-skills
resume), that's a good Week 3 task to do from your own machine or a
non-restricted environment, using this content as the source of truth.

## Next passes on this file

- Add real screenshots/visuals to the case study (currently text + one
  reconstructed chart, since original Mixpanel/GA assets aren't available)
- Wire the "Get in touch" button to a real contact method once decided
- Add the remaining 3 case studies (Novatr LMS, Hapramp team-building, Shyft)
- Swap the placeholder `<title>`/meta description per page as more pages ship
- Add a resume download link once the resume draft is ready
