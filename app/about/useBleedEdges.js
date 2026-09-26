'use client';

import { useEffect } from 'react';

// For a background that runs to the window's edges while the content stays in the page's column: sets
// --bleed-l and --bleed-r on the element (its distance from each edge of the window), so a layer inside
// it can reach out with negative insets. Unlike useFullBleed, the element itself does not move.
//
// Also sets --nav-l and --nav-r: how far the nav bar's content (the name on the left, the last control on
// the right) reaches past the element on each side, for a part that should span the nav's width. Zero
// where the nav shows no links (phones), so there it keeps to the column. And --nav-h, the nav bar's
// real height (the site's --site-nav-h is a nominal 56px; the bar itself is taller on wide screens).
export default function useBleedEdges(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const apply = () => {
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      el.style.setProperty('--bleed-l', `${Math.max(0, r.left)}px`);
      el.style.setProperty('--bleed-r', `${Math.max(0, vw - r.right)}px`);
      const name = document.querySelector('.site-nav__name')?.getBoundingClientRect();
      const links = document.querySelector('.site-nav__links')?.getBoundingClientRect();
      const wide = name && links && links.width > 0;
      el.style.setProperty('--nav-l', `${wide ? r.left - name.left : 0}px`);
      el.style.setProperty('--nav-r', `${wide ? links.right - r.right : 0}px`);
      const bar = document.querySelector('.site-nav')?.getBoundingClientRect();
      if (bar) el.style.setProperty('--nav-h', `${Math.round(bar.height)}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [ref]);
}
