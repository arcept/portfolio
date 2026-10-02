'use client';

import { useRef } from 'react';
import { EASE_IN, EASE_MOVE, ScrollTrigger, gsap, prefersStill, useIsoLayoutEffect } from './gsap';
import { JOURNEY, VIEWS } from './content';

// The hero's schematic: five teams, each looking at its own part of acquisition (five separate
// lanes), bend together into one visitor journey: page view, form start, submission. Then visitors
// flow along it, and only some go on at each step, in roughly the reported week's proportions (about
// a quarter start the form; most of those submit). It is an illustration, not a record of sessions.
//
// Coordinates are fractions of the figure (u across, v down). The lines are one SVG stretched to the
// box with strokes that don't scale; the labels, nodes and visitors are HTML placed on the same
// fractions, so they stay sharp and readable at every size.

const LANE_V = [0.12, 0.31, 0.5, 0.69, 0.88];
const SPINE_V = 0.5;
const MEET_U = 0.46; // where the lanes meet
export const NODE_U = [0.52, 0.68, 0.84];

const START_RATE = 0.26; // reported week: visitors who started the form
const SUBMIT_RATE = 0.71; // and starters who submitted

const lerp = (a, b, t) => a + (b - a) * t;

// One lane as a cubic curve; `t` 0 keeps it on its own level, 1 bends it into the spine.
function lanePoints(v, t) {
  const end = lerp(v, SPINE_V, t);
  return [
    [0, v],
    [0.27, v],
    [0.34, end],
    [MEET_U, end],
  ];
}

function bezier([p0, p1, p2, p3], s) {
  const m = 1 - s;
  const a = m * m * m;
  const b = 3 * m * m * s;
  const c = 3 * m * s * s;
  const d = s * s * s;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

// The SVG is drawn in the stage's own pixels (its viewBox follows the stage's size), so curves keep
// their shape and strokes their weight at every width. Before it is measured, a nominal size stands in.
const NOMINAL = { w: 1352, h: 470 };

const toPath = (pts, { w, h }) => {
  const [p0, p1, p2, p3] = pts.map(([u, v]) => [u * w, v * h]);
  return `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
};
const spinePath = ({ w, h }) => `M${MEET_U * w},${SPINE_V * h} L${w},${SPINE_V * h}`;

// `children` (the reported week's numbers) sit in the stage under the journey's three steps.
//
// `mode` sets how it plays:
//   play     on load: the lanes draw, bend together, the journey and its steps appear, visitors flow
//   view     the same, once the figure scrolls into view; `extend(tl, at, figure)` can add to it
// Visitors only set out once the lanes have met, so scrolling back stops new ones.
export default function HeroFigure({ children, note, mode = 'play', extend, className = '' }) {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const stage = el.querySelector('[data-stage]');
    const svg = el.querySelector('svg');
    const lanes = [...el.querySelectorAll('[data-lane]')];
    const spine = el.querySelector('[data-spine]');
    const labels = el.querySelectorAll('[data-lane-label]');
    const nodes = el.querySelectorAll('[data-node]');
    const caption = el.querySelector('[data-caption]');
    const flow = el.querySelector('[data-flow]');
    const state = { t: 0 };
    let size = NOMINAL;
    const draw = () => lanes.forEach((p, i) => p.setAttribute('d', toPath(lanePoints(LANE_V[i], state.t), size)));
    const measure = () => {
      size = { w: stage.clientWidth || NOMINAL.w, h: stage.clientHeight || NOMINAL.h };
      svg.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
      spine.setAttribute('d', spinePath(size));
      draw();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();

    if (prefersStill()) {
      state.t = 1;
      draw();
      return () => ro.disconnect();
    }

    const ctx = gsap.context(() => {
      const inView = mode === 'view';
      const intro = gsap.timeline({ delay: inView ? 0 : 0.55, paused: inView });
      intro
        .from(lanes, { strokeDashoffset: 1, duration: 1.1, ease: EASE_IN, stagger: 0.08 }, 0)
        .from(labels, { autoAlpha: 0, y: 8, duration: 0.7, ease: EASE_IN, stagger: 0.08 }, 0.1);
      const at = 1.25;
      intro
        .to(state, { t: 1, duration: 1.4, ease: EASE_MOVE, onUpdate: draw }, at)
        .from(spine, { strokeDashoffset: 1, duration: 0.9, ease: EASE_IN }, at + 0.85)
        .from(nodes, { autoAlpha: 0, scale: 0.6, duration: 0.6, ease: 'back.out(2)', stagger: 0.18 }, at + 1.05)
        .from(caption, { autoAlpha: 0, y: 6, duration: 0.6, ease: EASE_IN }, at + 1.55);
      if (inView) {
        extend?.(intro, at + 1.7, el);
        ScrollTrigger.create({ trigger: el, start: 'top 72%', once: true, onEnter: () => intro.play() });
      }
    }, el);

    // Visitors: each picks a lane, rides it into the journey and, past the page-view node, either
    // peels away or carries on, by the reported proportions.
    let ticker = null;
    let visible = true;
    const dots = [];
    function spawn() {
      const node = document.createElement('i');
      node.className = 'cro-fig__visitor';
      flow.appendChild(node);
      const r = Math.random();
      const fate = r < START_RATE * SUBMIT_RATE ? 2 : r < START_RATE ? 1 : 0; // 2 submits, 1 starts, 0 leaves
      const leaveAt = fate === 0 ? lerp(0.55, 0.65, Math.random()) : fate === 1 ? lerp(0.71, 0.81, Math.random()) : 1;
      dots.push({ node, lane: Math.floor(Math.random() * LANE_V.length), r: 0, fate, leaveAt, out: 0, speed: lerp(0.16, 0.21, Math.random()) });
    }
    function place(d) {
      let u;
      let v;
      if (d.r < 0.5) {
        [u, v] = bezier(lanePoints(LANE_V[d.lane], 1), d.r / 0.5);
      } else {
        u = lerp(MEET_U, NODE_U[2], (d.r - 0.5) / 0.5);
        v = SPINE_V;
      }
      if (d.out > 0) v += d.out * 0.12;
      const lit = d.fate === 2 && u >= NODE_U[1];
      d.node.style.transform = `translate(${u * size.w}px, ${v * size.h}px) scale(${lit ? 1.35 : 1})`;
      d.node.style.opacity = String((1 - d.out) * (d.r < 0.04 ? d.r / 0.04 : 1));
      d.node.classList.toggle('is-lit', lit);
      return u;
    }
    let since = 0;
    function tick(_, dt) {
      if (!visible) return;
      const sec = dt / 1000;
      since += sec;
      if (state.t > 0.97 && since > 0.32 && dots.length < 22) {
        since = 0;
        spawn();
      }
      for (let i = dots.length - 1; i >= 0; i -= 1) {
        const d = dots[i];
        d.r += d.speed * sec;
        const u = place(d);
        if (u >= d.leaveAt && d.fate !== 2) d.out += sec * 1.6;
        const done = d.out >= 1 || d.r >= 1;
        if (done) {
          d.node.remove();
          dots.splice(i, 1);
        }
      }
    }
    function startFlow() {
      ticker = tick;
      gsap.ticker.add(ticker);
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    startFlow();

    return () => {
      ctx.revert();
      if (ticker) gsap.ticker.remove(ticker);
      io.disconnect();
      ro.disconnect();
      dots.forEach((d) => d.node.remove());
    };
  }, []);

  return (
    <figure className={`cro-fig ${className}`} ref={root}>
      <div className="cro-fig__canvas">
        <div
          className="cro-fig__stage"
          data-stage
          role="img"
          aria-label="Schematic: five teams’ separate views of acquisition bend into one visitor journey, from page view to form start to submission."
        >
          <svg className="cro-fig__lines" viewBox={`0 0 ${NOMINAL.w} ${NOMINAL.h}`} aria-hidden="true">
            {LANE_V.map((v) => (
              <path key={v} data-lane className="cro-fig__lane" d={toPath(lanePoints(v, 0), NOMINAL)} pathLength="1" />
            ))}
            <path data-spine className="cro-fig__spine" d={spinePath(NOMINAL)} pathLength="1" />
          </svg>

          {VIEWS.map((view, i) => (
            <span key={view} data-lane-label className="cro-fig__view" style={{ top: `${LANE_V[i] * 100}%` }} aria-hidden="true">
              {view}
            </span>
          ))}

          {JOURNEY.map((step, i) => (
            <span
              key={step}
              data-node
              className={`cro-fig__node${i === 1 ? ' is-mid' : ''}${i === 2 ? ' is-end' : ''}`}
              style={{ left: `${NODE_U[i] * 100}%` }}
              aria-hidden="true"
            >
              <i />
              <b>{step}</b>
            </span>
          ))}

          <div className="cro-fig__flow" data-flow aria-hidden="true" />
        </div>
        {children}
      </div>
      <figcaption className="cro-fig__caption">
        <span className="cro-fig__tag" data-caption>
          <span className="cro-pulse" aria-hidden="true" />
          One visitor journey. A shared view.
        </span>
        {note}
      </figcaption>
    </figure>
  );
}
