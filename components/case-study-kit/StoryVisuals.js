'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Count, EASE } from './Motion';

// The visuals a story step can use (see Story.js). Each is a generic shape a case study fills with its
// own data; classes (.st-*) live in story.css. A case study needing a shape that isn't here adds a
// visual to its own story module, styled from the --st-* variables, rather than bending these.

const list = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

// A labelled list of rows, each with a marker, then an italic serif line.
// rows: [string]  ·  marker: what sits in the round badge  ·  footer: the serif line
export function ListVisual({ label, rows, marker = '?', footer }) {
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <p className="st-vis__label">{label}</p>
      <ul className="st-cant">
        {rows.map((row) => (
          <motion.li key={row} variants={item}>
            <span aria-hidden="true">{marker}</span>
            {row}
          </motion.li>
        ))}
      </ul>
      {footer && (
        <motion.p className="st-quote" variants={item}>
          {footer}
        </motion.p>
      )}
    </motion.div>
  );
}

// Horizontal bars that draw in and count up. rows: [[label, value, low?]] (value is 0–100; `low` paints
// the bar red). callout: a node shown under a hairline once the bars are drawn.
export function BarsVisual({ label, rows, callout }) {
  return (
    <div className="st-vis">
      <p className="st-vis__label">{label}</p>
      <div className="st-bars">
        {rows.map(([name, value, low], i) => (
          <div key={name} className="st-bar">
            <span className="st-bar__label">{name}</span>
            <span className="st-bar__track">
              <motion.i className={low ? 'is-low' : undefined} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 + i * 0.1 }} />
            </span>
            <span className={`st-bar__value${low ? ' is-low' : ''}`}>
              <Count to={value} decimals={value % 1 ? 1 : 0} duration={1.1} />
            </span>
          </div>
        ))}
      </div>
      {callout && (
        <motion.p className="st-callout" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 1.2 }}>
          {callout}
        </motion.p>
      )}
    </div>
  );
}

// One large counting figure with a sentence beside it, then a labelled row of pills.
// pills: [string] — the first letter of each is picked out in the accent.
export function BigStatVisual({ value, suffix = '', text, pillsLabel, pills = [] }) {
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <motion.div className="st-big" variants={item}>
        <span className="st-big__num">
          <Count to={value} suffix={suffix} duration={1.6} />
        </span>
        <span className="st-big__text">{text}</span>
      </motion.div>
      {pills.length > 0 && (
        <>
          <motion.p className="st-vis__label" variants={item}>
            {pillsLabel}
          </motion.p>
          <ul className="st-pills">
            {pills.map((pill) => (
              <motion.li key={pill} variants={item}>
                <b>{pill[0]}</b>
                {pill.slice(1)}
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}

// A serif quotation with a rule, and a small label under it.
export function QuoteVisual({ quote, caption }) {
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <motion.blockquote className="st-serif" variants={item}>
        {quote}
      </motion.blockquote>
      {caption && (
        <motion.p className="st-vis__label" variants={item}>
          {caption}
        </motion.p>
      )}
    </motion.div>
  );
}

// Screens that crossfade on their own, with the current one's label beneath.
// images: [{ src, label, alt }] · width/height: the images' shared pixel size
export function CycleVisual({ images, width = 880, height = 1120, interval = 2200 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setI((n) => (n + 1) % images.length), interval);
    return () => window.clearInterval(timer);
  }, [images.length, interval]);
  return (
    <div className="st-vis st-vis--shot">
      <div className="st-shot" style={{ aspectRatio: `${width} / ${height}` }}>
        {images.map((s, n) => (
          <motion.img key={s.src} src={s.src} alt={n === i ? s.alt : ''} width={width} height={height} animate={{ opacity: n === i ? 1 : 0, scale: n === i ? 1 : 1.03 }} initial={{ opacity: n === 0 ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
        ))}
      </div>
      <p className="st-chip" key={i}>
        {images[i].label}
      </p>
    </div>
  );
}

// A 2×2 grid of counting figures. stats: [{ value, prefix?, suffix?, decimals?, label }] — or `text`
// in place of `value` for a figure that isn't a plain number (e.g. "4 → 3 days").
export function StatsVisual({ stats }) {
  return (
    <motion.div className="st-vis st-stats" variants={list} initial="hidden" animate="show">
      {stats.map(({ value, text, prefix, suffix, decimals, label }) => (
        <motion.div key={label} variants={item}>
          <span className="st-stats__num">{text ?? <Count to={value} prefix={prefix} suffix={suffix} decimals={decimals} duration={1.4} />}</span>
          <span className="st-stats__label">{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Rows of "before → after". rows: [[label, before, after]] · footnote: a small label under them.
export function BeforeAfterVisual({ rows, footnote }) {
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <ul className="st-results">
        {rows.map(([label, before, after]) => (
          <motion.li key={label} variants={item}>
            <span className="st-results__label">{label}</span>
            <span className="st-results__before">{before}</span>
            <span className="st-results__arrow" aria-hidden="true">→</span>
            <span className="st-results__after">{after}</span>
          </motion.li>
        ))}
      </ul>
      {footnote && (
        <motion.p className="st-vis__label" variants={item}>
          {footnote}
        </motion.p>
      )}
    </motion.div>
  );
}

// For a page's own visuals: the same stagger, so custom visuals move like the built-in ones.
export const storyMotion = { list, item };
