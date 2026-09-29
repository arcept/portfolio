import { SITE_THEME_KEY, resolveSiteTheme, themeGate } from './site';

// The case studies' theme: the site's one theme (./site.js) on the attribute their CSS keys off,
// data-cs-theme="dark" | "light" (case-study-kit/themes.css turns it into colours). Dark is the design;
// light is the same page with its tokens swapped.

export const THEME_KEY = SITE_THEME_KEY;
export const THEME_ATTR = 'data-cs-theme';

export const resolveTheme = resolveSiteTheme;

// Runs as an inline <script> at the very top of the page, so the theme is on <html> before anything
// paints (no flash of the wrong theme).
export function themeGateScript() {
  return themeGate(THEME_ATTR);
}
