'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// The three context paragraphs. On phones they start clipped to roughly half their height with a
// fade and a "Read more" toggle — the full text is long for a screen this narrow. At wider widths
// the clip never applies (see the media query in about.css), so this renders exactly as before.
//
// The open target is measured (scrollHeight), not a generous guess — animating max-height to a
// value far past the real content means the visible growth all happens in the fast opening burst
// of the easing curve, then sits idle, which reads as an abrupt jump rather than a reveal.
export default function ContextReveal({ paragraphs, rise }) {
  const [open, setOpen] = useState(false);
  const [fullHeight, setFullHeight] = useState(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const measure = () => setFullHeight(contentRef.current?.scrollHeight ?? null);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className={`abt-context-clip${open ? ' is-open' : ''}`}>
      <div
        className="abt-opening__context"
        ref={contentRef}
        style={open && fullHeight ? { maxHeight: fullHeight } : undefined}
      >
        {paragraphs.map((paragraph, i) => (
          <motion.p key={paragraph.slice(0, 24)} {...rise(0.7 + i * 0.1)}>
            {paragraph}
          </motion.p>
        ))}
      </div>

      <button
        type="button"
        className="abt-context-more"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}
