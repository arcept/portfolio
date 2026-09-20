// Shared by the two versions of the Placement Hub case study. The theme decides WHICH PAGE you
// are on: dark is the original design (/case-study-placement), light is the light design
// (/case-study-placement-light). Both pages carry the same switch, which flips between them.
//
// Which theme applies, in order:
//   1. a choice made with the switch during this visit (sessionStorage — so the next visit starts
//      from the operating system again, i.e. the site "always follows" the OS);
//   2. the operating system's setting;
//   3. dark, when the browser doesn't expose one.
// (A browser reports "light" both when the OS is set to light and when it has no setting, so the
// dark fallback only ever applies to browsers that don't support prefers-color-scheme at all.)

export const THEME_KEY = 'cs-theme';

export const DARK_PAGE = '/case-study-placement';
export const LIGHT_PAGE = '/case-study-placement-light';

// Section ids the two pages have in common — used to land on the same section after switching.
export const SECTION_IDS = ['problem', 'evidence', 'reframing', 'leadership', 'product', 'handover', 'launch'];

// Runs as an inline <script> at the very top of each page, so a visitor whose theme belongs to the
// other page is sent there before anything paints (no flash of the wrong theme). The same logic
// lives in ThemeSwitch for client-side navigations, where inline scripts don't run.
export function themeGateScript(page, siblingHref) {
  return `(function(){try{var s=null;try{s=sessionStorage.getItem('${THEME_KEY}')}catch(e){}var m=window.matchMedia;var t=(s==='light'||s==='dark')?s:(m&&m('(prefers-color-scheme: dark)').matches?'dark':(m&&m('(prefers-color-scheme: light)').matches?'light':'dark'));if(t!=='${page}'){location.replace('${siblingHref}'+location.hash)}}catch(e){}})();`;
}
