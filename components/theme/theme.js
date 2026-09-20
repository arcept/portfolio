// Theme for the Placement Hub case study. There is one page; the theme is an attribute on <html>
// (data-cs-theme="dark" | "light") and themes.css turns it into colours. Dark is the design; light
// is the same page with its tokens swapped.
//
// Which theme applies, in order:
//   1. a choice made with the switch during this visit (sessionStorage — so the next visit starts
//      from the operating system again, i.e. the site "always follows" the OS);
//   2. the operating system's setting;
//   3. dark, when the browser doesn't expose one.
// (A browser reports "light" both when the OS is set to light and when it has no setting, so the
// dark fallback only ever applies to browsers that don't support prefers-color-scheme at all.)

export const THEME_KEY = 'cs-theme';
export const THEME_ATTR = 'data-cs-theme';

export function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function chosenTheme() {
  try {
    const value = window.sessionStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export const resolveTheme = () => chosenTheme() ?? systemTheme();

// Runs as an inline <script> at the very top of the page, so the theme is on <html> before
// anything paints (no flash of the wrong theme). The same logic lives above for client-side use.
export function themeGateScript() {
  return `(function(){try{var s=null;try{s=sessionStorage.getItem('${THEME_KEY}')}catch(e){}var m=window.matchMedia;var t=(s==='light'||s==='dark')?s:(m&&m('(prefers-color-scheme: dark)').matches?'dark':(m&&m('(prefers-color-scheme: light)').matches?'light':'dark'));document.documentElement.setAttribute('${THEME_ATTR}',t)}catch(e){}})();`;
}
