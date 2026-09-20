'use client';

import { Children, isValidElement, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { Count, EASE, MaskText, Reveal, useReduce } from './LxMotion';

/* ---------------------------------------------------------------- Section */

// One numbered section, drawn as a raised panel. It rises and settles as it enters (scrubbed to
// scroll, not timed), then dims slightly as it leaves the top — so the page reads as a stack of
// layers you move through rather than one long sheet. Every direct child of the body is wrapped
// in a scroll-in reveal unless it animates itself.
//
// The four `enter*` / `exit*` props tune how pronounced that is; the defaults are the light page's.
export function Section({ id, number, eyebrow, category, questions, artifacts, heading, enterRise = 64, enterScale = 0.972, exitScale = 1, exitOpacity = 0.4, children }) {
  const ref = useRef(null);
  const reduce = useReduce();

  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const { scrollYProgress: exit } = useScroll({ target: ref, offset: ['end 0.55', 'end 0.05'] });
  const rise = useTransform(enter, [0, 1], [enterRise, 0]);
  const settle = useTransform(enter, [0, 1], [enterScale, 1]);
  const shrink = useTransform(exit, [0, 1], [1, exitScale]);
  const scale = useTransform([settle, shrink], ([a, b]) => a * b);
  const fadeIn = useTransform(enter, [0, 0.7], [0, 1]);
  const fadeOut = useTransform(exit, [0, 1], [1, exitOpacity]);
  const opacity = useTransform([fadeIn, fadeOut], ([a, b]) => a * b);

  const { scrollYProgress: drift } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const ghostY = useTransform(drift, [0, 1], [50, -50]);

  const margin = (
    <>
      <p className="lx-margin__category">{category}</p>
      <div className="lx-margin__group">
        <p className="lx-margin__label">Questions</p>
        {questions.map((q) => (
          <p key={q} className="lx-margin__question">
            {q}
          </p>
        ))}
      </div>
      {artifacts && (
        <div className="lx-margin__group">
          <p className="lx-margin__label">Artifacts</p>
          <p className="lx-margin__artifacts">{artifacts}</p>
        </div>
      )}
    </>
  );

  const blocks = Children.toArray(children).map((child, i) =>
    isValidElement(child) && child.type?.lxSelfReveal ? child : <Reveal key={i}>{child}</Reveal>
  );

  return (
    <section id={id} className="lx-section" data-lx-section>
      <motion.div className="lx-panel" ref={ref} style={reduce ? undefined : { y: rise, scale, opacity }}>
        <aside className="lx-margin" aria-label={`About the ${eyebrow} section`}>
          {margin}
        </aside>

        <div className="lx-main">
          <header className="lx-head">
            <motion.span className="lx-ghost" aria-hidden="true" style={reduce ? undefined : { y: ghostY }}>
              {number}
            </motion.span>
            <p className="lx-eyebrow">
              <span>{number}</span>
              {eyebrow}
            </p>
            <MaskText text={heading} className="lx-h2" />
          </header>

          <Disclosure summary="Discipline, questions and artifacts" className="lx-disclosure--mobile-only">
            {margin}
          </Disclosure>

          <div className="lx-body">{blocks}</div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------ Disclosure */

// Expand / collapse with no box around it: a hairline, a quiet label and a plus that turns into a
// minus. The content grows open and its children arrive one after another.
export function Disclosure({ summary, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduce = useReduce();
  const items = Children.toArray(children);

  return (
    <div className={`lx-disclosure ${open ? 'is-open' : ''} ${className}`.trim()}>
      <button type="button" className="lx-disclosure__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span>{summary}</span>
        <span className="lx-disclosure__icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { height: { duration: 0.5, ease: EASE }, opacity: { duration: 0.35 } }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              className="lx-disclosure__body"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: 0.08 } } }}
            >
              {items.map((item, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------- Table */

const NUMERIC = /^([−-]?)(\d+(?:\.\d+)?)(%?)$/;

function Cell({ value }) {
  if (typeof value === 'string') {
    const match = value.match(NUMERIC);
    if (match) {
      const [, sign, digits, pct] = match;
      const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
      return <Count to={Number(digits)} decimals={decimals} prefix={sign} suffix={pct} />;
    }
  }
  return value;
}

// columns: [{ label, num?, flag? }]. A cell is a string/node, or { v, tone: 'bad' | 'good' }.
// Rows stagger in, plain numbers count up, and `bars` draws a bar behind one numeric column.
export function Table({ columns, rows, minWidth, bars }) {
  const reduce = useReduce();
  return (
    <motion.div
      className="lx-table-wrap"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <table className="lx-table" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map(({ label, num, flag }) => (
              <th key={label} className={[num && 'is-num', flag && 'is-flag'].filter(Boolean).join(' ') || undefined}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <motion.tr
              key={r}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '0px 0px -6% 0px' }}
              transition={{ duration: 0.55, ease: EASE, delay: r * 0.06 }}
            >
              {row.map((cell, c) => {
                const isTone = cell !== null && typeof cell === 'object' && 'tone' in cell && !isValidElement(cell);
                const value = isTone ? cell.v : cell;
                const classes = [columns[c].num && 'is-num', isTone && `is-${cell.tone}`].filter(Boolean).join(' ');
                const showBar = bars && bars.col === c && typeof value === 'string' && NUMERIC.test(value);
                return (
                  <td key={c} className={classes || undefined}>
                    {showBar && (
                      <motion.span
                        aria-hidden="true"
                        className={`lx-table__bar ${isTone ? `is-${cell.tone}` : ''}`}
                        initial={reduce ? false : { scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: EASE, delay: 0.15 + r * 0.06 }}
                        style={{ width: `calc((100% - 104px) * ${Math.min(1, parseFloat(value) / bars.max)})` }}
                      />
                    )}
                    <span className="lx-table__value">
                      <Cell value={value} />
                    </span>
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
Table.lxSelfReveal = true;

/* ------------------------------------------------------------ Note, stats */

// Secondary information: a hairline and quiet type, no filled box. A flagged note (`tone="flag"`)
// keeps its label coloured so an honesty caveat is still findable.
export function Note({ label, tone, children }) {
  return (
    <aside className={`lx-note${tone ? ` lx-note--${tone}` : ''}`}>
      {label && <p className="lx-note__label">{label}</p>}
      <div className="lx-note__body">{children}</div>
    </aside>
  );
}

// items: [{ value, prefix?, suffix?, decimals?, label }]
export function Stats({ items }) {
  const reduce = useReduce();
  return (
    <motion.div
      className="lx-stats"
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {items.map(({ label, ...count }) => (
        <motion.div key={label} className="lx-stat" variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
          <p className="lx-stat__value">
            <Count to={count.value} prefix={count.prefix} suffix={count.suffix} decimals={count.decimals} />
          </p>
          <p className="lx-stat__label">{label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
Stats.lxSelfReveal = true;

export function BigStat({ value, suffix = '%', label }) {
  return (
    <Reveal>
      <div className="lx-bigstat">
        <p className="lx-bigstat__value">
          <Count to={value} suffix={suffix} duration={1.8} />
        </p>
        <p className="lx-bigstat__label">{label}</p>
      </div>
    </Reveal>
  );
}
BigStat.lxSelfReveal = true;

/* ---------------------------------------------------------------- Images */

export function Placeholder({ children }) {
  return (
    <div className="lx-ph">
      <span className="lx-ph__tag">Visual placeholder</span>
      <span>{children}</span>
    </div>
  );
}

const CLIP_HIDDEN = { opacity: 0, scale: 1.05, clipPath: 'inset(7% 7% 7% 7% round 22px)' };
const CLIP_SHOWN = { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 16px)' };

// A real screenshot: the frame opens up to the full image as it scrolls in.
export function Figure({ src, alt, width, height, caption, narrow = false }) {
  const reduce = useReduce();
  return (
    <figure className={`lx-fig${narrow ? ' lx-fig--narrow' : ''}`}>
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        initial={reduce ? false : CLIP_HIDDEN}
        whileInView={CLIP_SHOWN}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={{ duration: 1, ease: EASE }}
      />
      <Reveal delay={0.15} y={10} blur={0}>
        <figcaption className="lx-fig__caption">{caption}</figcaption>
      </Reveal>
    </figure>
  );
}
Figure.lxSelfReveal = true;

export function Tiles({ children }) {
  const reduce = useReduce();
  return (
    <motion.div
      className="lx-tiles"
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
    >
      {children}
    </motion.div>
  );
}
Tiles.lxSelfReveal = true;

const TILE = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: EASE } },
};

export function Tile({ src, alt, width, height, caption }) {
  return (
    <motion.figure className="lx-tile" variants={TILE}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" />
      <figcaption className="lx-fig__caption">{caption}</figcaption>
    </motion.figure>
  );
}

export function TilePlaceholder({ children }) {
  return (
    <motion.div className="lx-tile lx-tile--wide" variants={TILE}>
      <div className="lx-ph">
        <span className="lx-ph__tag">Visual placeholder</span>
        <span>{children}</span>
      </div>
    </motion.div>
  );
}
