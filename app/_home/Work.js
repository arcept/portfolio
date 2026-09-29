'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import useTheme from './useTheme';
import DissolveImage from './DissolveImage';
import Behind from './Behind';
import { FACE } from './fonts';
import { CASES, MORE } from './cases';

const EASE = [0.16, 1, 0.3, 1];
const IMAGES = CASES.map((w) => w.image);
const src = (image, light) => (image.srcLight && light ? image.srcLight : image.src);

// Selected work. On a wide screen, the featured case studies as a list (a big number, the title and
// its line) with one card beside it for the row hovered (the first until then): its screenshot melts
// into the next (DissolveImage), and its details, headline number and facts change with it. On a
// phone, the same cards in a carousel. Then "Read more": the case studies still being written.
//
// Everything wears its case study's own colour; a light runs round each featured card's edge (Beam);
// faint lines drift behind the cards (Behind); everything rises in as it comes into view. The cards are
// frosted glass in the dark theme and solid, lifted a little, in the light one (home.css). Titles and
// text are in DM Sans; the headings in the homepage's face.
export default function Work() {
  const wide = useWide();
  const [active, setActive] = useState(0);
  return (
    <section className="hx-w" id="work" aria-labelledby="hx-w-title" style={{ '--hx-w-head-face': FACE.family }}>
      <Behind />
      <header className="hx-w__head hx-w-wrap">
        <Title id="hx-w-title">Selected work</Title>
      </header>
      <div className="hx-w-wrap">
        {wide ? <Split active={active} pick={setActive} /> : <Carousel />}
        <More compact={!wide} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Headings

// "Selected work" and "Read more": the logo's green ✦ springs in, the words rise, and a faint line
// draws out after them to the edge.
function Title({ as = 'h2', id, className, children }) {
  const Tag = as === 'h3' ? motion.h3 : motion.h2;
  return (
    // The heading is what is watched: the words start clipped, so they would never count as in view.
    <Tag
      className={className ? `hx-w__heading ${className}` : 'hx-w__heading'}
      id={id}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, amount: 1 }}
    >
      <motion.svg
        className="hx-w__star"
        viewBox="0 0 24 24"
        aria-hidden="true"
        variants={{ hide: { scale: 0, rotate: -90 }, show: { scale: 1, rotate: 0 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
      >
        <path d={STAR} />
      </motion.svg>
      <span className="hx-w__mask">
        <motion.span
          style={{ display: 'inline-block' }}
          variants={{ hide: { y: '110%' }, show: { y: '0%' } }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        >
          {children}
        </motion.span>
      </span>
      <motion.span
        className="hx-w__streak"
        aria-hidden="true"
        variants={{ hide: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1 } }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
      />
    </Tag>
  );
}

const STAR = 'M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z';

// ---------------------------------------------------------------- Wide: the list, and one card

function Split({ active, pick }) {
  const w = CASES[active];
  const light = useTheme() === 'light';
  return (
    <div className="hx-w-split" style={{ '--accent': w.accent }}>
      <ol className="hx-w-list">
        {CASES.map((c, i) => (
          <Row key={c.slug} work={c} i={i} on={i === active} pick={pick} />
        ))}
      </ol>
      <Enter delay={0.25} className="hx-w-split__card">
        <a href={w.href} className="hx-w-card" aria-label={`${w.title}: read the case study`}>
          <div className="hx-w-card__media">
            <DissolveImage images={IMAGES} active={active} light={light} className="hx-w-card__canvas" />
          </div>
          {/* Every project's details, stacked in one cell with only the open one shown, so the card is
              always the height of the tallest and never jumps between projects. */}
          <div className="hx-w-card__bodies">
            {CASES.map((c, i) => (
              <motion.div
                key={c.slug}
                className="hx-w-card__body"
                aria-hidden={i !== active}
                initial={false}
                // Hidden (not just transparent) once faded, so only the open one can be read or tabbed to.
                animate={
                  i === active
                    ? { opacity: 1, y: 0, visibility: 'visible' }
                    : { opacity: 0, y: 10, transitionEnd: { visibility: 'hidden' } }
                }
                transition={{ duration: 0.45, ease: EASE, delay: i === active ? 0.1 : 0 }}
                style={{ '--accent': c.accent }}
              >
                <Details work={c} />
              </motion.div>
            ))}
          </div>
          <Beam />
        </a>
      </Enter>
    </div>
  );
}

// A row of the list: hovering or focusing it opens its card.
function Row({ work, i, on, pick }) {
  return (
    <motion.li
      className="hx-w-row"
      data-on={on ? 'true' : 'false'}
      style={{ '--accent': work.accent }}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.span
        className="hx-w-row__rule"
        aria-hidden="true"
        variants={{ hide: { scaleX: 0 }, show: { scaleX: 1 } }}
        transition={{ duration: 1.3, ease: EASE, delay: i * 0.1 }}
      />
      <a
        href={work.href}
        className="hx-w-row__link"
        onPointerEnter={() => pick(i)}
        onFocus={() => pick(i)}
        aria-label={`${work.title}: read the case study`}
      >
        <span className="hx-w-row__head">
          <motion.span
            className="hx-w-num"
            aria-hidden="true"
            variants={{ hide: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.1 + i * 0.1 }}
          >
            {work.index}
          </motion.span>
          <span className="hx-w-row__text">
            <span className="hx-w__mask">
              <motion.span
                className="hx-w-row__title"
                variants={{ hide: { y: '110%' }, show: { y: '0%' } }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.1 }}
              >
                {work.title}
              </motion.span>
            </span>
            <motion.span
              className="hx-w-row__line"
              variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.1 }}
            >
              {work.line}
            </motion.span>
          </span>
        </span>
      </a>
    </motion.li>
  );
}

// ---------------------------------------------------------------- Phones: a carousel

// One card at a time with the edge of the next, swiped through, dots under them. The cards either side
// of the one in view sit at 94% and grow as they're swiped into place, following the finger; each
// shrinks towards the one in view, so the gap between them holds.
const SIDE = 0.94;

function Carousel() {
  const track = useRef(null);
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(1); // one card and the gap after it, in px
  const { scrollX } = useScroll({ container: track });

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const measure = () => {
      const first = el.firstElementChild;
      if (first) setStep(first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0));
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const onScroll = () => setCurrent(Math.max(0, Math.min(CASES.length - 1, Math.round(track.current.scrollLeft / step))));
  const go = (i) => track.current?.scrollTo({ left: i * step, behavior: 'smooth' });
  return (
    <Enter className="hx-w-ph">
      <ol className="hx-w-ph__track" ref={track} onScroll={onScroll}>
        {CASES.map((w, i) => (
          <Slide key={w.slug} work={w} i={i} on={i === current} scrollX={scrollX} step={step} />
        ))}
      </ol>
      <div className="hx-w-ph__dots">
        {CASES.map((w, i) => (
          <button
            key={w.slug}
            type="button"
            className="hx-w-ph__dot"
            data-on={i === current ? 'true' : 'false'}
            style={{ '--accent': w.accent }}
            aria-label={`Show ${w.title}`}
            aria-current={i === current ? 'true' : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </Enter>
  );
}

// A card of the carousel: its screenshot, number and title, where it's from, its line, its headline
// number and the way in (the facts stay on the wide card). The one in view wears its colour.
function Slide({ work, i, on, scrollX, step }) {
  const light = useTheme() === 'light';
  const at = i * step;
  const scale = useTransform(scrollX, [at - step, at, at + step], [SIDE, 1, SIDE]);
  const originX = useTransform(scrollX, (x) => (x < at ? 0 : 1));
  return (
    <li className="hx-w-ph__slide" style={{ '--accent': work.accent }}>
      <motion.a href={work.href} className="hx-w-card hx-w-ph__card" data-on={on ? 'true' : 'false'} style={{ scale, originX }}>
        <span className="hx-w-card__media">
          <img className="hx-w-shot" src={src(work.image, light)} alt={work.image.alt} loading="lazy" />
        </span>
        <span className="hx-w-ph__text">
          <span className="hx-w-ph__head">
            <span className="hx-w-num" aria-hidden="true">
              {work.index}
            </span>
            <span className="hx-w-ph__title">{work.title}</span>
          </span>
          <Kicker work={work} />
          <span className="hx-w-row__line">{work.line}</span>
          <Metric metric={work.metric} />
          <Cta />
        </span>
        <Beam />
      </motion.a>
    </li>
  );
}

// ---------------------------------------------------------------- Read more: the rest, quietly

// Below the featured work, the case studies still being written, quieter than the featured three: on a
// wide screen a smaller card each, two side by side, the words beside a placeholder frame; on phones
// (`compact`) a short row each: a small thumbnail, the number and its tag, the title, an arrow.
function More({ compact }) {
  if (!MORE.length) return null;
  return (
    <div className="hx-w-more">
      <Title as="h3" className="hx-w-more__heading">
        Read more
      </Title>
      <ol className={compact ? 'hx-w-more__list hx-w-more__list--rows' : 'hx-w-more__list'}>
        {MORE.map((w, i) => (
          <li key={w.slug} style={{ '--accent': w.accent }}>
            <Enter delay={i * 0.1}>{compact ? <MoreRow work={w} /> : <MoreCard work={w} />}</Enter>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MoreCard({ work }) {
  return (
    <a href={work.href} className="hx-w-card hx-w-more__card">
      <span className="hx-w-more__text">
        <span className="hx-w-num" aria-hidden="true">
          {work.index}
        </span>
        <span className="hx-w-more__kicker">
          {work.kicker} <InProgress />
        </span>
        <span className="hx-w-more__title">{work.title}</span>
        <span className="hx-w-more__line">{work.line}</span>
        <Cta />
      </span>
      <span className="hx-w-card__media">
        <Soon label />
      </span>
    </a>
  );
}

function MoreRow({ work }) {
  return (
    <a href={work.href} className="hx-w-more__row">
      <span className="hx-w-more__thumb">
        <Soon />
      </span>
      <span className="hx-w-more__rowtext">
        <span className="hx-w-more__rowtop">
          <span className="hx-w-more__num">{work.index}</span>
          <InProgress />
        </span>
        <span className="hx-w-more__title">{work.title}</span>
      </span>
      <span className="hx-w-more__go" aria-hidden="true">
        →
      </span>
    </a>
  );
}

// They are still being written, and say so.
function InProgress() {
  return <span className="hx-w-more__state">In progress</span>;
}

// Where a screenshot will go: the ✦ in the case study's colour (and, with `label`, a word to say so).
function Soon({ label }) {
  return (
    <span className="hx-w-more__soon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={STAR} />
      </svg>
      {label && 'Visual to come'}
    </span>
  );
}

// ---------------------------------------------------------------- Shared parts

// The light that runs round the OMS case study's prototype frame (components/StarBorder): a glow in
// the case study's colour sliding along the top edge one way and the bottom the other, fading as it
// goes. Every featured card carries one.
function Beam() {
  return (
    <span className="hx-w-beam" aria-hidden="true">
      <span className="hx-w-beam__top" />
      <span className="hx-w-beam__bottom" />
    </span>
  );
}

// Where a case study is from, and whether it has a prototype to try.
function Kicker({ work }) {
  return (
    <span className="hx-w-card__kicker">
      {work.kicker}
      {work.prototype && <span className="hx-w-proto">Live prototype</span>}
    </span>
  );
}

// What the wide card says beyond the list: where it's from, the headline number, the facts, the way in.
function Details({ work }) {
  return (
    <>
      <Kicker work={work} />
      <Metric metric={work.metric} />
      <span className="hx-w-facts">
        {work.facts.map(([k, v]) => (
          <span key={k} className="hx-w-facts__item">
            <span className="hx-w-facts__key">{k}</span>
            <span className="hx-w-facts__value">{v}</span>
          </span>
        ))}
      </span>
      <Cta />
    </>
  );
}

// The case study's headline number, in its colour, with what it counts beside it.
function Metric({ metric }) {
  return (
    <span className="hx-w-metric">
      <span className="hx-w-metric__value">
        {metric.prefix}
        {metric.value}
        {metric.suffix}
      </span>
      <span className="hx-w-metric__label">{metric.label}</span>
    </span>
  );
}

function Cta() {
  return (
    <span className="hx-w-cta">
      Read the case study <span aria-hidden="true">→</span>
    </span>
  );
}

// A card's way in: it opens upwards out of a clip as it rises.
function Enter({ delay = 0, className, children }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(18% 0% 0% 0% round 28px)', y: 40, opacity: 0 }}
      // Cleared once in: a lingering clip would stop the glass card blurring what's behind it.
      whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 28px)', y: 0, opacity: 1, transitionEnd: { clipPath: 'none' } }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Whether the screen is wide enough for the list and its card (900px and up). True until mounted: the
// section is well below the first screen, so a phone swaps to the carousel before it's seen.
function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const read = () => setWide(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);
  return wide;
}
