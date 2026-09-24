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
    const watcher = new ResizeObserver(apply);
    watcher.observe(document.documentElement);
    return () => {
      watcher.disconnect();
      el.style.marginLeft = '';
      el.style.width = '';
    };
  }, [ref, margin]);
}
