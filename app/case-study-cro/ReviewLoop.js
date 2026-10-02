'use client';

import { useRef } from 'react';
import { ScrollTrigger, gsap, prefersStill, useIsoLayoutEffect } from './gsap';

// Chapter 05: the review cycle the practice settled into — observe, interpret, change, review — as a ring the
// scroll draws round, clockwise from the top. Each stage lights as the arc reaches it, and once the ring is
// closed the arrow out of it says the cycle goes on (Draft 01's ↗).

const R = 120;
const C = 160; // the ring's centre, in its 320 × 320 box
// The stages at the top, right, bottom and left.
const PLACES = [
  { x: C, y: C - R, side: 'top' },
  { x: C + R, y: C, side: 'right' },
  { x: C, y: C + R, side: 'bottom' },
  { x: C - R, y: C, side: 'left' },
];

export default function ReviewLoop({ stages }) {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    // Each stage is a dot on the ring and a label beside it; both light together.
    const marks = [...el.querySelectorAll('[data-node]')];
    const labels = [...el.querySelectorAll('[data-stage]')];
    const light = (i, on) => [marks[i], labels[i]].forEach((n) => n.classList.toggle('is-on', on));
    if (prefersStill()) {
      labels.forEach((_, i) => light(i, true));
      el.classList.add('is-closed');
      return undefined;
    }
    const ctx = gsap.context(() => {
      const arc = el.querySelector('[data-arc]');
      gsap.set(arc, { strokeDashoffset: 1 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        end: 'bottom 45%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(arc, { strokeDashoffset: 1 - p });
          labels.forEach((_, i) => light(i, p >= i / stages.length - 0.001));
          el.classList.toggle('is-closed', p > 0.98);
        },
      });
    }, el);
    return () => ctx.revert();
  }, [stages.length]);

  return (
    <figure className="cro-loop" ref={root}>
      <div className="cro-loop__ring">
        <svg viewBox="0 0 320 320" aria-hidden="true">
          <circle className="cro-loop__track" cx={C} cy={C} r={R} />
          {/* Drawn clockwise from the top, as a path: browsers don't all honour pathLength on a circle. */}
          <path
            className="cro-loop__arc"
            data-arc
            d={`M${C},${C - R} A${R},${R} 0 1 1 ${C},${C + R} A${R},${R} 0 1 1 ${C},${C - R}`}
            pathLength="1"
          />
          {PLACES.map(({ x, y }, i) => (
            <circle key={i} className="cro-loop__node" data-node cx={x} cy={y} r="6" />
          ))}
        </svg>
        <ol className="cro-loop__stages">
          {stages.map((stage, i) => (
            <li key={stage} className={`cro-loop__stage is-${PLACES[i].side}`} data-stage>
              {stage}
            </li>
          ))}
        </ol>
        <span className="cro-loop__again" aria-hidden="true">
          ↗
        </span>
      </div>
    </figure>
  );
}
