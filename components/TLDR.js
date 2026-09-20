'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function TLDR({ sections }) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="tldr">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tldr-trigger"
        aria-expanded={open}
      >
        Read the 60-second version
        <motion.span
          className="tldr-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          ↓
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div className="reflection-box tldr-box">
          {sections.map(({ label, body }) => (
            <div key={label} className="tldr-section">
              <p className="tldr-label">{label}</p>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
