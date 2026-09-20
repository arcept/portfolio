'use client';

import { Children, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { Count, EASE, MaskText, Reveal, useReduce } from './Motion';

/* ---------------------------------------------------------------- Section */

// One numbered section. It rises and settles as it enters (scrubbed to scroll, not timed), then
// zooms back and dims as it leaves the top — so the page reads as layers you move through rather
// than one long sheet. Every direct child of the body is wrapped in a scroll-in reveal unless it
// animates itself. `headerAction` is an optional node shown under the heading (e.g. a "Listen to this part" button).
export function Section({ id, number, eyebrow, category, questions, artifacts, heading, headerAction, children }) {
  const ref = useRef(null);
  const reduce = useReduce();

  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const { scrollYProgress: exit } = useScroll({ target: ref, offset: ['end 0.55', 'end 0.05'] });
  const rise = useTransform(enter, [0, 1], [96, 0]);
  const settle = useTransform(enter, [0, 1], [0.94, 1]);
  const shrink = useTransform(exit, [0, 1], [1, 0.965]);
  const scale = useTransform([settle, shrink], ([a, b]) => a * b);
  const fadeIn = useTransform(enter, [0, 0.7], [0, 1]);
  const fadeOut = useTransform(exit, [0, 1], [1, 0.35]);
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
          <p className="lx-margin__label">Deliverables</p>
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
            {headerAction}
          </header>

          <Disclosure summary={`Discipline, questions and deliverables`} className="lx-disclosure--mobile-only">
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
  // A table wider than its column scrolls sideways; then it has to be reachable with the keyboard.
  const wrapRef = useRef(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const measure = () => setScrolls(wrap.scrollWidth > wrap.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div
      ref={wrapRef}
      className="lx-table-wrap"
      {...(scrolls ? { tabIndex: 0, role: 'region', 'aria-label': `Table: ${columns.map((c) => c.label).join(', ')} (scrolls sideways)` } : null)}
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

// items: [{ value, prefix?, suffix?, decimals?, label, desc?, trend?, text? }]
// `value` counts up; `text` shows a figure that isn't a plain number (e.g. "4 → 3 days") as it is;
// `trend="down"` puts a green arrow before it (down is good); `desc` is a quiet line under the label.
// `columns` is how many sit across (default 4; use 2 when the figures are long).
export function Stats({ items, columns = 4 }) {
  const reduce = useReduce();
  return (
    <motion.div
      className="lx-stats"
      style={{ '--cols': columns }}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {items.map(({ label, desc, text, trend, ...count }) => (
        <motion.div key={label} className="lx-stat" variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
          <p className="lx-stat__value">
            {trend === 'down' && (
              <span className="lx-stat__trend" aria-label="down">
                ↓
              </span>
            )}
            {text ?? <Count to={count.value} prefix={count.prefix} suffix={count.suffix} decimals={count.decimals} />}
          </p>
          <p className="lx-stat__label">{label}</p>
          {desc && <p className="lx-stat__desc">{desc}</p>}
        </motion.div>
      ))}
    </motion.div>
  );
}
Stats.lxSelfReveal = true;

// A row of short, parallel points — a label, a one-line statement, a sentence of explanation —
// separated by hairlines, with no boxes. items: [{ label, title, desc }]
export function Columns({ items }) {
  const reduce = useReduce();
  return (
    <motion.div
      className="lx-cols"
      style={{ '--cols': items.length }}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      {items.map(({ label, title, desc }) => (
        <motion.div key={label} className="lx-col" variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
          <p className="lx-col__label">{label}</p>
          <p className="lx-col__title">{title}</p>
          <p className="lx-col__desc">{desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
Columns.lxSelfReveal = true;

// A live, non-image thing (an iframe of a prototype, a chart) shown with a caption. The frame is
// only a hairline and a radius so it reads as a device on either theme; the child brings its own size.
export function Embed({ children, caption }) {
  return (
    <figure className="lx-embed">
      <div className="lx-embed__frame">{children}</div>
      {caption && <figcaption className="lx-embed__caption">{caption}</figcaption>}
    </figure>
  );
}

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
