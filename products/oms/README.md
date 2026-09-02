> [!NOTE]
> **What this is, in this repo specifically:** the home of the OMS "rebuild" (v3.0) dashboard UI — the Sales Head dashboard's funnel cards, drilldown, and related pieces, built with the Untitled UI React library.
>
> **Wired into the live site, two ways.** The full app is embedded at `/case-study-oms` as the "Latest rebuild (WIP)" prototype tab (`public/case-studies/oms/rebuild/`). The case study body also embeds individual isolated pieces of it directly — not screenshots — via `?embed=<view>` query params handled in `src/main.tsx` (see `src/pages/embed-view.tsx` for the view registry). After editing this app, run `npm run build:oms-rebuild` from the **portfolio repo root** (not from here) — it builds this app and syncs `dist/` over `public/case-studies/oms/rebuild/` in one step (`scripts/sync-oms-rebuild.js`). The **original**, separate v3.0 prototype (`/case-study-oms`'s other tab) still comes from `prototype/oms-v3/` via `public/case-studies/oms/` and is unrelated to this app.
>
> **`vite.config.ts` sets `base: "/case-studies/oms/rebuild/"`** to match exactly where the built output is served from — without it the built `index.html` references `/assets/...` instead of `/case-studies/oms/rebuild/assets/...`, which 404s once deployed (found and fixed while wiring up the `?embed=` views; don't remove it without re-checking that deployed path still resolves).
>
> **Fully standalone.** Own `package.json`, own `node_modules`, no npm workspaces, no connection to the root `package.json` or the Next.js app. Two independent dev servers: Next.js on its usual port, this Vite app on its own (default 5173).
>
> A couple of fixes were needed to get `npm install && npm run build` passing cleanly, both upstream scaffold issues rather than anything specific to this project: `@react-aria/utils`, `@react-stately/utils`, and `@react-types/overlays` were missing from `package.json` despite being imported directly by the shipped components (added as explicit dependencies), and `date-picker/calendar.tsx` had a type error in its `CalendarContext` value versus the installed `react-aria-components` types (narrowed with a local cast — see the comment at the call site).

# Untitled UI starter kit for Vite

This is an official Untitled UI starter kit for Vite. Kickstart your Untitled UI project with Vite in seconds.

## Untitled UI React

[Untitled UI React](https://www.untitledui.com/react) is the world’s largest collection of open-source React UI components. Everything you need to design and develop modern, beautiful interfaces—fast.

Built with React 19.1, Tailwind CSS v4.1, TypeScript 5.8, and React Aria, Untitled UI React components deliver modern performance, type safety, and maintainability.

[Learn more](https://www.untitledui.com/react) • [Documentation](https://www.untitledui.com/react/docs/introduction) • [Figma](https://www.untitledui.com/figma) • [FAQs](https://www.untitledui.com/faqs)

## Getting started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

You can start editing the app by modifying the components in `src/` folder. The page auto-updates as you edit the file.

## Resources

Untitled UI React is built on top of [Untitled UI Figma](https://www.untitledui.com/figma), the world's largest and most popular Figma UI kit and design system. Explore more:

**[Untitled UI Figma:](https://www.untitledui.com/react/resources/figma-files)** The world's largest Figma UI kit and design system.
<br/>
**[Untitled UI Icons:](https://www.untitledui.com/react/resources/icons)** A clean, consistent, and neutral icon library crafted specifically for modern UI design.
<br/>
**[Untitled UI file icons:](https://www.untitledui.com/react/resources/file-icons)** Free file format icons, designed specifically for modern web and UI design.
<br/>
**[Untitled UI flag icons:](https://www.untitledui.com/react/resources/flag-icons)** Free country flag icons, designed specifically for modern web and UI design.
<br/>
**[Untitled UI avatars:](https://www.untitledui.com/react/resources/avatars)** Free placeholder user avatars and profile pictures to use in your projects.
<br/>
**[Untitled UI logos:](https://www.untitledui.com/react/resources/logos)** Free fictional company logos to use in your projects.

## License

Untitled UI React open-source components are licensed under the MIT license, which means you can use them for free in unlimited commercial projects.

> [!NOTE]
> This license applies only to the starter kit and to the components included in this open-source repository. [Untitled UI React PRO](https://www.untitledui.com/react) includes hundreds more advanced UI components and page examples and is subject to a separate [license agreement](https://www.untitledui.com/license).

[Untitled UI license agreement →](https://www.untitledui.com/license)

[Frequently asked questions →](https://www.untitledui.com/faqs)
