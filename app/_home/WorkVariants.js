'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import useTheme from './useTheme';
import { CASES, MORE } from './cases';
import { Beam, Cta, EASE, Enter, Kicker, Metric, src } from './Work';
import Tip from './Tip';
import './work-variants.css';

// Other ways to lay out the featured case studies on a wide screen, in place of the list and its
// one card (Work.js `Split`). Each is passed to <Work Wide={...} />; phones keep the carousel and
// "Read more" stays as it is. Compared side by side at /work-lab.
//
//   Bento     — all three at once in tiles of different sizes, each a product screen bleeding off its
//               edge with a second screen tucked in front, and the two still being written as small
//               tiles in the last slot (so "Read more" is folded in: <Work foldMore />). Hovering any
//               tile shows a designed tooltip in its colour (Tip.js): "Read the case study", or
//               "Coming soon" on the two that can't be opened yet.
//   Showcase  — one wide block each, alternating sides: a big framed screen that tilts upright as it
//               scrolls in, with two more screens drifting past it at different speeds.

// ---------------------------------------------------------------- Shared

// Where the pointer is over a card, as --mx/--my, for the light that follows it.
function trackPointer(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function Facts({ work }) {
  return (
    <span className="hx-w-facts">
      {work.facts.map(([k, v]) => (
        <span key={k} className="hx-w-facts__item">
          <span className="hx-w-facts__key">{k}</span>
          <span className="hx-w-facts__value">{v}</span>
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------- Bento

export function Bento() {
  const [oms, placement, cro] = CASES;
  const grid = useRef(null);
  return (
    <div className="wv-bento" ref={grid}>
      <Tip scope={grid} />
      <BentoTile work={oms} className="wv-bento__a" delay={0} />
      <BentoTile work={placement} className="wv-bento__b" delay={0.08} tall />
      <div className="wv-bento__d">
        {MORE.map((w, i) => (
          <Enter key={w.slug} className="wv-bento__more" delay={0.12 + i * 0.06}>
            <MoreTile work={w} />
          </Enter>
        ))}
      </div>
      <BentoTile work={cro} className="wv-bento__c" delay={0.16} />
    </div>
  );
}

function BentoTile({ work, className, delay, tall }) {
  const light = useTheme() === 'light';
  const [main, extra] = work.shots;
  return (
    <Enter className={className} delay={delay}>
      <a
        href={work.href}
        className="hx-w-card wv-tile"
        data-tall={tall ? 'true' : 'false'}
        style={{ '--accent': work.accent }}
        onPointerMove={trackPointer}
        data-tip="Read the case study"
        data-tip-color={work.tip}
        aria-label={`${work.title}: read the case study`}
      >
        <span className="wv-tile__glow" aria-hidden="true" />
        <span className="wv-tile__text">
          <span className="wv-tile__top">
            <span className="hx-w-num" aria-hidden="true">
              {work.index}
            </span>
            <Kicker work={work} />
          </span>
          <span className="wv-tile__title">{work.title}</span>
          <span className="wv-tile__foot">
            <Metric metric={work.metric} />
            <Cta />
          </span>
        </span>
        <span className="wv-tile__stage" aria-hidden="true">
          <img className="wv-tile__main" src={tall ? main.src : src(work.image, light)} alt="" loading="lazy" />
          <img className="wv-tile__extra" src={extra.src} alt="" loading="lazy" />
        </span>
        <Beam />
      </a>
    </Enter>
  );
}

// A case study still being written: not a link yet. Where it's from at the top, its title and line in
// the middle, "Coming soon" at the foot, and a faint blueprint hatch in its colour where the work will
// go. Hovering it says "Coming soon" too (Tip.js).
function MoreTile({ work }) {
  return (
    <div
      className="hx-w-card wv-more"
      style={{ '--accent': work.accent }}
      aria-disabled="true"
      data-tip="Coming soon"
      data-tip-color={work.tip}
    >
      <span className="wv-more__hatch" aria-hidden="true" />
      <span className="wv-more__top">
        <span className="hx-w-num" aria-hidden="true">
          {work.index}
        </span>
        <span className="wv-more__kicker">{work.kicker}</span>
      </span>
      <span className="wv-more__mid">
        <span className="wv-more__title">{work.title}</span>
        <span className="wv-more__line">{work.line}</span>
      </span>
      <span className="wv-more__soon">Coming soon</span>
    </div>
  );
}

// ---------------------------------------------------------------- Showcase

export function Showcase() {
  return (
    <div className="wv-show-list">
      {CASES.map((w, i) => (
        <ShowRow key={w.slug} work={w} i={i} />
      ))}
    </div>
  );
}

function ShowRow({ work, i }) {
  const light = useTheme() === 'light';
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const tilt = useTransform(scrollYProgress, [0.05, 0.42], [18, 0]);
  const lift = useTransform(scrollYProgress, [0.05, 0.42], [60, 0]);
  const slow = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const fast = useTransform(scrollYProgress, [0, 1], [180, -180]);
  const [a, b] = work.shots;
  return (
    <article className="wv-show" data-flip={i % 2 ? 'true' : 'false'} ref={ref} style={{ '--accent': work.accent }}>
      <motion.div
        className="wv-show__text"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <span className="wv-show__index" aria-hidden="true">
          {work.index}
        </span>
        <Kicker work={work} />
        <h3 className="wv-show__title">
          <a href={work.href}>{work.title}</a>
        </h3>
        <p className="wv-show__line">{work.line}</p>
        <Metric metric={work.metric} />
        <Facts work={work} />
        <a href={work.href} className="wv-show__go" tabIndex={-1} aria-hidden="true">
          <Cta />
        </a>
      </motion.div>
      <a href={work.href} className="wv-show__media" tabIndex={-1} aria-hidden="true">
        <span className="wv-show__glow" />
        <motion.span className="wv-show__frame" style={reduce ? undefined : { rotateX: tilt, y: lift }}>
          <span className="wv-show__chrome">
            <i />
            <i />
            <i />
            <span className="wv-show__url">arcept.in/{work.href.replace('/', '')}</span>
          </span>
          <img src={src(work.image, light)} alt="" loading="lazy" />
        </motion.span>
        <motion.img className="wv-show__float wv-show__float--a" src={a.src} alt="" loading="lazy" style={reduce ? undefined : { y: slow }} />
        <motion.img className="wv-show__float wv-show__float--b" src={b.src} alt="" loading="lazy" style={reduce ? undefined : { y: fast }} />
      </a>
    </article>
  );
}
