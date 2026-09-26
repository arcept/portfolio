'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { TRADING } from './sabbatical-content';

const EASE = [0.16, 1, 0.3, 1];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// The break, marked to market: a tape of what went up and what went down. Decorative.
const TAPE = [
  ['Garden', 1],
  ['Furniture', 1],
  ['Screen time', 0],
  ['Travel', 1],
  ['Cooking', 1],
  ['Exhaustion', 0],
  ['Health', 1],
  ['Curiosity', 1],
];

// What trading taught me: the line, the tape, a live price over the floor it never crosses (the risk
// set before the trade), and the lesson. Pointing at the chart puts a crosshair on the price.
export default function SabbaticalTrade() {
  return (
    <div className="sab-tr">
      <motion.p className="sab-tr__kicker" {...rise(0)}>
        {TRADING.kicker}
      </motion.p>
      <motion.p className="sab-tr__line" {...rise(0.05)}>
        {TRADING.line}
      </motion.p>
      <motion.div className="sab-tr__tape" aria-hidden="true" {...rise(0.08)}>
        <div className="sab-tr__tapetrack">
          {[0, 1].map((n) =>
            TAPE.map(([name, up]) => (
              <span key={`${n}-${name}`} className="sab-tr__tapeitem">
                {name} <b className={up ? 'is-up' : 'is-down'}>{up ? '▲' : '▼'}</b>
              </span>
            ))
          )}
        </div>
      </motion.div>
      <motion.div {...rise(0.1)}>
        <LiveLine />
      </motion.div>
      <motion.p className="sab-tr__floor" {...rise(0.12)}>
        <span aria-hidden="true" />
        The risk, set before the trade
      </motion.p>
      <motion.p className="sab-tr__body" {...rise(0.14)}>
        {TRADING.body}
      </motion.p>
    </div>
  );
}

const W = 400;
const H = 120;
const FLOOR = 108;
const STEP = 12;

// A walk between the floor and the top, which bounces off the floor rather than crossing it.
function walker() {
  let v = 0.5;
  return () => {
    v += (Math.random() - 0.49) * 0.3;
    if (v < 0.08) v = 0.08 + (0.08 - v);
    if (v > 0.95) v = 0.95 - (v - 0.95);
    return v;
  };
}
const yOf = (v) => FLOOR - v * (FLOOR - 8);

// A live price: new points arrive on the right and the line slides left, while on screen (and not at
// all for visitors who ask for less motion). With the pointer over it, a crosshair and a dot ride the
// price at that point.
function LiveLine() {
  const wrap = useRef(null);
  const path = useRef(null);
  const cross = useRef(null);
  const dot = useRef(null);
  const state = useRef(null);
  const pointer = useRef(null);
  const [on, setOn] = useState(false);

  const draw = () => {
    const s = state.current;
    if (!s || !path.current) return;
    path.current.setAttribute('d', s.pts.map((v, i) => `${i ? 'L' : 'M'}${(i * STEP - s.offset).toFixed(1)} ${yOf(v).toFixed(1)}`).join(' '));
    const px = pointer.current;
    if (px == null || !cross.current) return;
    const x = px * W + s.offset;
    const i = Math.min(s.pts.length - 2, Math.max(0, Math.floor(x / STEP)));
    const f = x / STEP - i;
    const y = yOf(s.pts[i] + (s.pts[i + 1] - s.pts[i]) * f) / H;
    cross.current.style.left = `${px * 100}%`;
    dot.current.style.left = `${px * 100}%`;
    dot.current.style.top = `${y * 100}%`;
  };

  useEffect(() => {
    const next = walker();
    const pts = [];
    for (let i = 0; i < Math.ceil(W / STEP) + 2; i += 1) pts.push(next());
    state.current = { pts, next, offset: 0 };
    draw();
    const el = wrap.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!on) return undefined;
    let raf = 0;
    let prev = 0;
    const loop = (t) => {
      const dt = prev ? Math.min(64, t - prev) / 1000 : 0;
      prev = t;
      const s = state.current;
      s.offset += dt * 14;
      while (s.offset >= STEP) {
        s.offset -= STEP;
        s.pts.shift();
        s.pts.push(s.next());
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const onMove = (e) => {
    const b = wrap.current.getBoundingClientRect();
    pointer.current = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
    wrap.current.dataset.hover = 'true';
    draw();
  };
  const onLeave = () => {
    pointer.current = null;
    delete wrap.current.dataset.hover;
  };

  return (
    <div ref={wrap} className="sab-tr__chartwrap" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <svg className="sab-tr__chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line className="sab-tr__floorline" x1="0" x2={W} y1={FLOOR + 6} y2={FLOOR + 6} />
        <path ref={path} className="sab-tr__path" />
      </svg>
      <span ref={cross} className="sab-tr__cross" />
      <span ref={dot} className="sab-tr__dot" />
    </div>
  );
}
