> [!NOTE]
> **What this is, in this repo specifically:** the future home of the OMS product UI, scaffolded but not yet built out. There are no real OMS screens here yet — this is infrastructure only, waiting on an actual Figma design (built with the Untitled UI Figma library) to translate into components.
>
> **Not wired into the live site.** The OMS case study's embedded prototype (`/case-study-oms`) still comes entirely from `prototype/oms-v3/` via `public/case-studies/oms/` — nothing here affects it. This app only gets pointed at from the live site once enough of it is actually built to match (or intentionally exceed) what that prototype does, which is a separate, later decision.
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
