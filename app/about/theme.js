// The About page's own theme. It is deliberately separate from the case studies' (components/theme):
// the attribute and the stored choice differ, so switching here never follows the visitor elsewhere,
// and the case study's choice never arrives here.
//
// Which theme applies, in order:
//   1. a choice made with the switch during this visit (sessionStorage — the next visit starts from
//      the default again);
//   2. on phones and tablets in portrait (the same width the page's phone layouts use), light,
//      whatever the operating system is set to;
//   3. otherwise the operating system's setting;
//   4. dark, when the browser doesn't expose one.

export const ABT_KEY = 'abt-theme';
export const ABT_ATTR = 'data-abt-theme';

export const MOBILE_QUERY = '(max-width: 899px)';

export function defaultTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  if (window.matchMedia(MOBILE_QUERY).matches) return 'light';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function chosenTheme() {
  try {
    const value = window.sessionStorage.getItem(ABT_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export const resolveTheme = () => chosenTheme() ?? defaultTheme();

// Runs as an inline <script> at the top of the page so the theme is on <html> before anything paints.
export function aboutThemeGate() {
  return `(function(){try{var s=null;try{s=sessionStorage.getItem('${ABT_KEY}')}catch(e){}var m=window.matchMedia;var t=(s==='light'||s==='dark')?s:(m&&m('${MOBILE_QUERY}').matches?'light':m&&m('(prefers-color-scheme: dark)').matches?'dark':(m&&m('(prefers-color-scheme: light)').matches?'light':'dark'));document.documentElement.setAttribute('${ABT_ATTR}',t)}catch(e){}})();`;
}
