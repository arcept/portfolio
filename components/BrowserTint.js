'use client';

import { useEffect } from 'react';

// The two themes' attributes, and the homepage's and About's loading curtain (whose fill would
// otherwise be what's at the top of the screen while it's up).
const WATCHED = ['data-abt-theme', 'data-cs-theme', 'data-abt-intro'];
// Overlays that are passing, not the page: the loading curtain and the homepage's curtain on leaving.
const PASSING = '.abt-intro, .hx-wipe';

// A computed colour's opacity: 1 for rgb(), the last value for rgba() or color(… / a).
const alpha = (c) => {
  const slash = c.split('/')[1];
  if (slash) return parseFloat(slash);
  const parts = c.match(/[\d.]+/g) || [];
  return c.startsWith('rgba') ? parseFloat(parts[3] ?? '1') : 1;
};

// The colour showing at the top of the screen: the first solid background behind that point, skipping
// see-through layers (the site's bar, a canvas) and passing overlays, or the body's. Null while a
// theme switch's own transition covers the page (the point is then the whole document), to read again
// later.
function topColour() {
  const top = document.elementsFromPoint(window.innerWidth / 2, 2).find((el) => !el.closest(PASSING));
  if (!top || top === document.documentElement) return null;
  for (let el = top; el; el = el.parentElement) {
    const c = getComputedStyle(el).backgroundColor;
    if (alpha(c) >= 0.99) return c;
  }
  return getComputedStyle(document.body).backgroundColor;
}

// Keeps the browser's own bars (Safari's status bar and toolbar on a phone) in the page's colour. The
// browser takes that colour once, as the page first paints, and doesn't look again when a theme
// switch changes it; so whenever the About/homepage theme or a case study's theme changes, this reads
// the colour at the top of the page as it now is and hands it to the browser as the theme colour (a
// <meta name="theme-color">, which Safari re-reads when it changes). It reads on the next frame and
// again once a switch's transition, or the curtain's lift, has had time to finish.
export default function BrowserTint() {
  useEffect(() => {
    const root = document.documentElement;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    let timers = [];
    let frame = 0;
    const read = () => {
      const bg = topColour();
      if (bg && meta.content !== bg) meta.content = bg;
    };
    const update = () => {
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      frame = requestAnimationFrame(read);
      timers = [700, 1500].map((ms) => window.setTimeout(read, ms));
    };
    update();
    const watch = new MutationObserver(update);
    watch.observe(root, { attributes: true, attributeFilter: WATCHED });
    return () => {
      watch.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
  return null;
}
