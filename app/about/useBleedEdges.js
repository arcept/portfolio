'use client';

import { useEffect } from 'react';

// For a background that runs to the window's edges while the content stays in the page's column: sets
// --bleed-l and --bleed-r on the element (its distance from each edge of the window), so a layer inside
// it can reach out with negative insets. Unlike useFullBleed, the element itself does not move.
export default function useBleedEdges(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const apply = () => {
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      el.style.setProperty('--bleed-l', `${Math.max(0, r.left)}px`);
      el.style.setProperty('--bleed-r', `${Math.max(0, vw - r.right)}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [ref]);
}
