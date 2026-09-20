'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, useReduce } from './Motion';

// The hero's snapshot, in order of what a reader of a portfolio case study needs first: the lead
// facts (role, company, product) sit under the intro; the rest — scope, team, timeline — is one
// click away. `lead` items with `strong` are set larger. `more` is optional: a case study with only
// a few facts shows them all and gets no toggle.
export default function HeroFacts({ lead, more = [], moreLabel }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduce = useReduce();

  return (
    <div className="ph-facts">
      <dl className="ph-facts__lead">
        {lead.map(({ label, value, strong }) => (
          <div key={label} className={strong ? 'is-strong' : undefined}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {more.length > 0 && (
      <button type="button" className={`ph-facts__toggle${open ? ' is-open' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span>{open ? 'Hide details' : moreLabel}</span>
        <span className="ph-facts__icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      )}

      <AnimatePresence initial={false}>
        {open && more.length > 0 && (
          <motion.div
            id={id}
            key="more"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { height: { duration: 0.5, ease: EASE }, opacity: { duration: 0.35 } }}
            style={{ overflow: 'hidden' }}
          >
            <dl className="ph-facts__more">
              {more.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
