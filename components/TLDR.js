'use client';

import { createContext, useContext, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

// Context variant — lets a trigger elsewhere on the page (e.g. a hero CTA
// row) control the panel instead of the panel owning its own inline
// button. Used by the OMS hero; the default export below is still the
// plain self-contained version everything else (CRO) uses unchanged.
const TLDRContext = createContext(null);

export function TLDRProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <TLDRContext.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      {children}
    </TLDRContext.Provider>
  );
}

export function TLDRTrigger({ className, children }) {
  const ctx = useContext(TLDRContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={ctx.toggle}
      aria-expanded={ctx.open}
      className={className}
    >
      {children}
    </button>
  );
}

export function TLDRPanel({ sections }) {
  const ctx = useContext(TLDRContext);
  const shouldReduceMotion = useReducedMotion();
  const open = ctx?.open ?? false;

  return (
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
  );
}

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
