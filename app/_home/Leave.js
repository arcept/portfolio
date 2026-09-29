'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { resolveSiteTheme } from '@/components/theme/site';

// Leaving the homepage for another page of the site, from any link on it (a case study, About, the
// nav): a curtain (home.css, .hx-wipe) rises from the foot of the screen in the colour the next page
// opens in, then the page changes under it, so the one arrives already in its own colour. Links that
// stay on this page (#work), open elsewhere (another site, a new tab, a download) or come with a
// modifier key are left alone, as is everything for visitors who ask for less motion. Coming Back to
// a page the browser kept, the curtain is gone again.

// The solid colour at the top of each page, per theme (what components/BrowserTint reads there). Every
// page opens in the site's one theme (components/theme/site.js); one without a light version is dark.
const SITE = '#08090a'; // the site's own dark: the case studies without a light theme, and any other page
const COLOURS = {
  '/about': { dark: '#0a0b0e', light: '#f4f1ec' },
  '/case-study-oms': { dark: SITE, light: '#f1f1f1' },
  '/case-study-placement': { dark: SITE, light: '#f1f1f1' },
};

function colourFor(path) {
  const page = COLOURS[path.replace(/\/+$/, '') || '/'];
  return page ? page[resolveSiteTheme()] : SITE;
}

export default function Leave() {
  const [colour, setColour] = useState(null);

  useEffect(() => {
    const reset = () => setColour(null);
    const onClick = (event) => {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      setColour(colourFor(url.pathname));
      window.setTimeout(() => window.location.assign(url.href), 850);
    };
    document.addEventListener('click', onClick);
    window.addEventListener('pageshow', reset);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('pageshow', reset);
    };
  }, []);

  if (!colour) return null;
  return createPortal(
    <motion.div
      className="hx-wipe"
      aria-hidden="true"
      style={{ background: colour }}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
    />,
    document.body,
  );
}
