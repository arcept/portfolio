'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import AboutLink from './AboutLink';
import IconSlot from './IconSlot';
import { PAIRS } from './lenses-content';

// Section 02's principles on wide screens (phones get PrinciplesDeck). The three principles are a
// list of large titles with small glyphs; one is open at a time — by click, or hover with a mouse —
// and because only one is open, it can show full depth: both lenses, side by side.

const EASE = [0.16, 1, 0.3, 1];
const pad = (n) => String(n + 1).padStart(2, '0');

const item = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
};

export default function PrinciplesIndex() {
  const [active, setActive] = useState(0);
  const uid = useId();
  const tabs = useRef([]);
  const hoverTimer = useRef(null);

  // The open panel waits for the section to scroll into view, and on that first entrance it follows
  // the three titles in; after that, switching principles swaps the content straight away.
  const box = useRef(null);
  const seen = useInView(box, { once: true, amount: 0.3 });
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!seen) return undefined;
    const t = setTimeout(() => setSettled(true), 1400);
    return () => clearTimeout(t);
  }, [seen]);

  const onKeyDown = (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (active + step + PAIRS.length) % PAIRS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  // A short intent delay, so sweeping the pointer down the list does not flick through every panel.
  const hoverTo = (i) => (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActive(i), 140);
  };
  const hoverOff = () => clearTimeout(hoverTimer.current);

  return (
    <div className="abt-ix" ref={box}>
      <div className="abt-ix__list" role="tablist" aria-orientation="vertical" aria-label="Principles" onKeyDown={onKeyDown}>
        {PAIRS.map((pair, i) => {
          const on = i === active;
          return (
            <motion.div
              key={pair.id}
              className={`abt-ix__row${on ? ' is-on' : ''}`}
              initial={{ opacity: 0, x: -24, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            >
              <button
                type="button"
                role="tab"
                id={`${uid}-tab-${pair.id}`}
                aria-selected={on}
                aria-controls={`${uid}-panel-${pair.id}`}
                tabIndex={on ? 0 : -1}
                ref={(el) => (tabs.current[i] = el)}
                className="abt-ix__tab"
                onClick={() => setActive(i)}
                onPointerEnter={hoverTo(i)}
                onPointerLeave={hoverOff}
              >
                <IconSlot size="sm" label={pair.title} still />
                <span className="abt-ix__num">{pad(i)}</span>
                <span className="abt-ix__title">{pair.title}</span>
                <span className="abt-ix__mark" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Every panel shares one grid cell, so the column is as tall as the longest and switching
          never moves the page. */}
      <div className="abt-ix__stage">
        {PAIRS.map((pair, i) => {
          const on = i === active;
          return (
            <div
              key={pair.id}
              id={`${uid}-panel-${pair.id}`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${pair.id}`}
              className={`abt-ix__panel${on ? ' is-on' : ''}`}
              inert={!on}
            >
              <motion.div
                initial="hidden"
                animate={on && seen ? 'shown' : 'hidden'}
                variants={{
                  shown: { transition: { staggerChildren: settled ? 0.06 : 0.12, delayChildren: settled ? 0.05 : 0.45 } },
                  hidden: {},
                }}
              >
                <motion.p className="abt-ix__note" variants={item}>
                  {pair.note}
                </motion.p>
                <div className="abt-ix__lenses">
                  {pair.lenses.map((lens) => (
                    <motion.section key={lens.id} className="abt-ix__lens" variants={item}>
                      <p className="abt-ix__lensname">{lens.name}</p>
                      <h4 className="abt-ix__statement">{lens.statement}</h4>
                      <p className="abt-ix__summary">{lens.summary}</p>
                      <p className="abt-ix__reasoning">{lens.reasoning}</p>
                      {lens.evidence && <AboutLink href={lens.evidence.href}>{lens.evidence.label}</AboutLink>}
                    </motion.section>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
