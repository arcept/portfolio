// The About page's loading curtain: shown on the first visit to the page in a browser tab, skipped on
// later visits in the same tab (the assets are cached by then, so it would only be in the way).
//
// Whether it shows is decided before first paint by the gate script below, which puts an attribute on
// <html>; about.css only displays the curtain (and locks scrolling) while that attribute is present.
// Without JavaScript the gate never runs, so the curtain never appears. AboutIntro.js removes the
// attribute when the curtain lifts.
//
// For previewing: /about?intro shows the curtain on every load, whatever this tab has already seen.

export const INTRO_KEY = 'abt-intro-seen';
export const INTRO_ATTR = 'data-abt-intro';

export function aboutIntroGate() {
  return `(function(){try{if(!/[?&]intro\\b/.test(location.search)&&sessionStorage.getItem('${INTRO_KEY}'))return}catch(e){}document.documentElement.setAttribute('${INTRO_ATTR}','')})();`;
}
