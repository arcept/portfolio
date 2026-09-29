import { SITE_THEME_KEY, resolveSiteTheme, themeGate } from '@/components/theme/site';

// The About page's theme, which the homepage uses too: the site's one theme (components/theme/site.js)
// on the attribute their CSS keys off, data-abt-theme. So a choice made here carries to the case
// studies and back, and it follows the operating system until one is made.

export const ABT_KEY = SITE_THEME_KEY;
export const ABT_ATTR = 'data-abt-theme';

// The width the About page's phone layouts use.
export const MOBILE_QUERY = '(max-width: 899px)';

export const resolveTheme = resolveSiteTheme;

// Runs as an inline <script> at the top of the page so the theme is on <html> before anything paints.
export function aboutThemeGate() {
  return themeGate(ABT_ATTR);
}
