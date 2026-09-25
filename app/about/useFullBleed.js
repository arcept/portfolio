'use client';

import { useEffect } from 'react';

// Pulls an element out of the page's reading column (which is offset by the rail) to run across the
// window: `margin` px free each side (at most 5% of the width), none on phones, and none at all when
// `margin` is 0. It measures where the element naturally starts and cancels that.
export default function useFullBleed(ref, margin) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const apply = () => {
      el.style.marginLeft = '0px';
      el.style.width = 'auto';
      const left = el.getBoundingClientRect().left;
      const vw = document.documentElement.clientWidth;
      const gap = margin <= 0 || vw < 900 ? 0 : Math.max(14, Math.min(margin, vw * 0.05));
      el.style.marginLeft = `${gap - left}px`;
      el.style.width = `${vw - gap * 2}px`;
    };
    apply();
    // A viewport-width listener, not a ResizeObserver on the document: the element's own box isn't
    // what needs watching (it has no intrinsic size once full-bled), and observing the document root
    // instead fires on every content-height change anywhere on the page — including this effect's own
    // full-bleed toggle — thrashing the layout mid-scroll and occasionally yanking the scroll position.
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      el.style.marginLeft = '';
      el.style.width = '';
    };
  }, [ref, margin]);
}
