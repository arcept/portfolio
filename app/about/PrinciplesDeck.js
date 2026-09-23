'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import AboutLink from './AboutLink';
import IconSlot from './IconSlot';
import { PAIRS } from './lenses-content';

// Section 02's principles on phones (wide screens get PrinciplesIndex). Three cards in a stack:
// swipe the top one away and it goes to the back; turn it over for its two lenses. The front
// carries the principle — a spot illustration, the title, one line — and the back the lens
// statements and summaries. The long reasoning is shown on wide screens only.

const EASE = [0.16, 1, 0.3, 1];
const pad = (n) => String(n + 1).padStart(2, '0');
const THROW = 90;

// Where a card sits by its depth in the stack: 0 is the top. Kept tight so the fan never pushes a
// card past the screen's edge.
const SEATS = [
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 12, y: 12, rotate: 3, scale: 0.96 },
  { x: -10, y: 22, rotate: -3.5, scale: 0.92 },
];

export default function PrinciplesDeck() {
  const [order, setOrder] = useState(PAIRS.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const top = order[0];

  const bring = (i) => {
    setFlipped(false);
    setOrder((o) => [i, ...o.filter((n) => n !== i)]);
  };
  const next = () => bring(order[1]);
  const prev = () => bring(order[order.length - 1]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else return;
    e.preventDefault();
  };

  return (
    <div className="abt-dk">
      <motion.div
        className="abt-dk__pile"
        tabIndex={0}
        aria-roledescription="card stack"
        aria-label="Principles. Use the arrow keys to move through them."
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, y: 60, rotate: -4 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >
        {PAIRS.map((pair, i) => {
          const depth = order.indexOf(i);
          const isTop = depth === 0;
          const showBack = isTop && flipped;
          return (
            <motion.article
              key={pair.id}
              className="abt-dk-card"
              style={{ zIndex: PAIRS.length - depth }}
              initial={false}
              animate={{ ...SEATS[depth], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              drag={isTop ? 'x' : false}
              dragSnapToOrigin
              dragElastic={0.7}
              whileDrag={{ scale: 1.02 }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > THROW || Math.abs(info.velocity.x) > 500) next();
              }}
              aria-hidden={!isTop}
              inert={!isTop}
            >
              <motion.div
                className="abt-dk-card__inner"
                initial={false}
                animate={{ rotateY: showBack ? 180 : 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <div className="abt-dk-card__face abt-dk-card__face--front" inert={showBack}>
                  <IconSlot size="md" label={pair.title} art={pair.art} still />
                  <div>
                    <p className="abt-dk-card__count">{pad(i)} / 03</p>
                    <h3 className="abt-dk-card__title">{pair.title}</h3>
                    <p className="abt-dk-card__note">{pair.note}</p>
                  </div>
                  <button type="button" className="abt-dk-card__turn" onClick={() => setFlipped(true)}>
                    Turn over <span aria-hidden="true">↻</span>
                  </button>
                </div>

                <div className="abt-dk-card__face abt-dk-card__face--back" inert={!showBack}>
                  <p className="abt-dk-card__count">{pad(i)} / 03</p>
                  {pair.lenses.map((lens) => (
                    <section key={lens.id} className="abt-dk-card__lens">
                      <p className="abt-dk-card__lensname">{lens.name}</p>
                      <h4 className="abt-dk-card__statement">{lens.statement}</h4>
                      <p className="abt-dk-card__summary">{lens.summary}</p>
                      {lens.evidence && <AboutLink href={lens.evidence.href}>{lens.evidence.label}</AboutLink>}
                    </section>
                  ))}
                  <button type="button" className="abt-dk-card__turn" onClick={() => setFlipped(false)}>
                    Turn back <span aria-hidden="true">↺</span>
                  </button>
                </div>
              </motion.div>
            </motion.article>
          );
        })}
      </motion.div>

      <motion.div
        className="abt-dk__nav"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      >
        <button type="button" className="abt-dk__arrow" onClick={prev} aria-label="Previous principle">
          ←
        </button>
        <p className="abt-dk__count" aria-live="polite">
          Principle <span>{pad(top)}</span> of 03
        </p>
        <button type="button" className="abt-dk__arrow" onClick={next} aria-label="Next principle">
          →
        </button>
        <p className="abt-dk__hint">Swipe the card away, or turn it over.</p>
      </motion.div>
    </div>
  );
}
