// The site's one theme: dark or light, the same on every page that has both. A visitor who picks one
// with the switch keeps it on every page for the rest of the visit (sessionStorage, so the next visit
// starts from the default again); until then every page follows the operating system's setting, and
// dark when the browser doesn't expose one.
//
// Pages differ only in which attribute on <html> carries the theme to their CSS: the homepage and About
// use data-abt-theme (app/about/theme.js), the case studies data-cs-theme (./theme.js). A page adopts
// the site theme with two pieces, both keyed to its attribute:
//   1. the gate: an inline <script> at the top of the page, `themeGate(attr)`, so the theme is on <html>
//      before anything paints;
//   2. the switch: AnimatedThemeSwitch with `storageKey={SITE_THEME_KEY}` and `resolve={resolveSiteTheme}`,
//      which also keeps <html> in step afterwards (the system changing, coming Back to a kept page).
// A page with no light version yet (no gate, no switch) simply stays dark, and the choice is kept for the
// next page that has one.

export const SITE_THEME_KEY = 'site-theme';

export function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function chosenSiteTheme() {
  try {
    const value = window.sessionStorage.getItem(SITE_THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export const resolveSiteTheme = () => chosenSiteTheme() ?? systemTheme();

// The same as resolveSiteTheme, as an inline script that sets `attr` on <html> before first paint.
export function themeGate(attr) {
  return `(function(){try{var s=null;try{s=sessionStorage.getItem('${SITE_THEME_KEY}')}catch(e){}var m=window.matchMedia;var t=(s==='light'||s==='dark')?s:(m&&m('(prefers-color-scheme: dark)').matches?'dark':(m&&m('(prefers-color-scheme: light)').matches?'light':'dark'));document.documentElement.setAttribute('${attr}',t)}catch(e){}})();`;
}
