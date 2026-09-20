'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { EASE, useReduce } from '@/components/placement/Motion';

const PEEK = 128;

// Expandable content that shows its first few lines and fades out below them, so it is obvious
// there is more behind the fade. `label` names it; the button under it opens the rest.
export default function Peek({ label, more = 'Show the rest', less = 'Show less', children }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(null);
  const inner = useRef(null);
  const id = useId();
  const reduce = useReduce();

  // Track the content's natural height (it changes with viewport width).
  useEffect(() => {
    const el = inner.current;
    if (!el) return undefined;
    const measure = () => setFull(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Content that already fits in the peek doesn't need a fold.
  const fits = full !== null && full <= PEEK + 32;
  const expanded = open || fits;
  const height = full === null ? PEEK : expanded ? full : PEEK;

  return (
    <div className={`px-peek${expanded ? ' is-open' : ''}`}>
      <p className="px-peek__label">{label}</p>
      <motion.div
        id={id}
        className="px-peek__clip"
        initial={false}
        animate={{ height }}
        transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
      >
        <div ref={inner} className="px-peek__inner">
          {children}
        </div>
        <span className="px-peek__fade" aria-hidden="true" />
      </motion.div>
      {!fits && (
        <button type="button" className="px-peek__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          <span>{open ? less : more}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 4.25 6 8l4-3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
