'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

// The three context paragraphs. On phones they start clipped to roughly half their height with a
// fade and a "Read more" toggle — the full text is long for a screen this narrow. At wider widths
// the clip never applies (see the media query in about.css), so this renders exactly as before.
export default function ContextReveal({ paragraphs, rise }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`abt-context-clip${open ? ' is-open' : ''}`}>
      <div className="abt-opening__context">
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
