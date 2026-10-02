'use client';

import { useRef } from 'react';
import { EASE_IN, gsap, prefersStill, useIsoLayoutEffect } from './gsap';

// Chapter 01's diagram, reconstructed from the project account: one visitor journey across the middle,
// and four teams' local views of it, two above and two below. Each view is tied to the journey by a short
// stem, but none spans it: the gaps between them are the point.
// On arrival the journey draws, its steps appear, then the views settle in towards it from either side.
// It reads at any width: it sizes to its own container, not the window.
export default function TeamMap({ map }) {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (prefersStill()) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
        .from('[data-map-spine]', { scaleX: 0, transformOrigin: '0 50%', duration: 1.3, ease: 'power2.inOut' }, 0)
        .from('[data-map-step]', { autoAlpha: 0, y: 8, duration: 0.6, ease: EASE_IN, stagger: 0.16 }, 0.25)
        .from('[data-map-top]', { autoAlpha: 0, y: -26, duration: 0.9, ease: EASE_IN, stagger: 0.14 }, 0.8)
        .from('[data-map-bottom]', { autoAlpha: 0, y: 26, duration: 0.9, ease: EASE_IN, stagger: 0.14 }, 0.9)
        .from('[data-map-stem]', { scaleY: 0, duration: 0.6, ease: EASE_IN, stagger: 0.08 }, 1.3);
    }, el);
    return () => ctx.revert();
  }, []);

  const card = (row) => ({ team, view }) => (
    <div key={team} className="cro-map__view" {...{ [`data-map-${row}`]: '' }}>
      <span className="cro-map__team">{team}</span>
      <span className="cro-map__what">{view}</span>
      <span className="cro-map__stem" data-map-stem aria-hidden="true" />
    </div>
  );

  return (
    <div className="cro-map" ref={root} role="img" aria-label={map.label}>
      <div className="cro-map__row is-top">{map.top.map(card('top'))}</div>
      <div className="cro-map__journey">
        <span className="cro-map__spine" data-map-spine aria-hidden="true" />
        {map.spine.map((step, i) => (
          <span key={step} className={`cro-map__step${i === map.spine.length - 1 ? ' is-end' : ''}`} data-map-step>
            <i aria-hidden="true" />
            {step}
          </span>
        ))}
      </div>
      <div className="cro-map__row is-bottom">{map.bottom.map(card('bottom'))}</div>
    </div>
  );
}
