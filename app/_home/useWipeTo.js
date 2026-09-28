'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

// Leaving for another page with a wipe: a colour (home.css, .hx-wipe) rises from the foot of the
// screen until it covers it, then the page changes under it. Returns the click handler for the link
// and the wipe to render. Modified clicks (a new tab) and visitors who ask for less motion just follow
// the link; coming Back to a page the browser kept, the wipe is gone again.
export default function useWipeTo() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reset = () => setOn(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const go = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
    const href = event.currentTarget.getAttribute('href');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    setOn(true);
    window.setTimeout(() => window.location.assign(href), 850);
  };

  const wipe = on
    ? createPortal(
        <motion.div
          className="hx-wipe"
          aria-hidden="true"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
        />,
        document.body,
      )
    : null;
  return [go, wipe];
}
