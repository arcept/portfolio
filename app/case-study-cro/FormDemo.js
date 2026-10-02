'use client';

import { useRef, useState } from 'react';
import { EASE_IN, ScrollTrigger, gsap, prefersStill, useIsoLayoutEffect } from './gsap';

// Chapter 03's design detail: the same course page two ways, to show the interaction principle (not the
// archival page). Behind a pop-up, starting the form takes finding the button and opening it; in the first
// scroll, the form is already there, shorter, with answers preselected where they helped.
//
// A switch toggles between them. The first time it comes into view it plays the pop-up — the pointer finds
// the button, the pop-up opens — then, unless the reader has taken over, turns to the first-scroll version.

const MODES = [
  { id: 'popup', label: 'Behind a pop-up', path: ['See the page', 'Find the button', 'Open the pop-up', 'Start the form'] },
  { id: 'inline', label: 'In the first scroll', path: ['See the page', 'Start the form'] },
];

export default function FormDemo({ caption }) {
  const root = useRef(null);
  const [mode, setMode] = useState('popup');
  const touched = useRef(false);
  const play = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const still = prefersStill();
    const ctx = gsap.context(() => {
      let running = null;
      const cursor = el.querySelector('[data-cursor]');
      // Where the pointer has to travel to reach the button, from its resting place.
      const toButton = (axis) => () => {
        const b = el.querySelector('[data-cta]').getBoundingClientRect();
        const c = cursor.getBoundingClientRect();
        return axis === 'x' ? b.left + b.width * 0.6 - c.left : b.top + b.height * 0.6 - c.top;
      };
      const show = (id, animate = !still) => {
        const popup = id === 'popup';
        running?.kill();
        const tl = gsap.timeline({ defaults: { ease: EASE_IN } });
        running = tl;
        const dur = animate ? 1 : 0;
        tl.to('[data-modal]', { autoAlpha: 0, y: 24, duration: 0.3 * dur }, 0)
          .to('[data-inline]', { autoAlpha: popup ? 0 : 1, x: popup ? 16 : 0, duration: 0.5 * dur }, 0)
          .to('[data-cta]', { autoAlpha: popup ? 1 : 0, duration: 0.4 * dur }, 0)
          .set('[data-cursor]', { autoAlpha: 0, x: 0, y: 0 }, 0);
        if (popup) {
          tl.to('[data-cursor]', { autoAlpha: 1, duration: 0.25 * dur }, 0.3 * dur)
            .to('[data-cursor]', { x: toButton('x'), y: toButton('y'), duration: 0.9 * dur, ease: 'power2.inOut' }, 0.4 * dur)
            .to('[data-cta]', { scale: 0.92, duration: 0.12 * dur, yoyo: true, repeat: 1 }, 1.3 * dur)
            .to('[data-shade]', { autoAlpha: 1, duration: 0.35 * dur }, 1.5 * dur)
            .fromTo('[data-modal]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 * dur }, 1.55 * dur)
            .fromTo('[data-modal] [data-field]', { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.3 * dur, stagger: 0.06 * dur }, 1.75 * dur)
            .to('[data-cursor]', { autoAlpha: 0, duration: 0.3 * dur }, 2.2 * dur);
        } else {
          tl.to('[data-shade]', { autoAlpha: 0, duration: 0.3 * dur }, 0).fromTo(
            '[data-inline] [data-field]',
            { autoAlpha: 0, x: -8 },
            { autoAlpha: 1, x: 0, duration: 0.3 * dur, stagger: 0.07 * dur },
            0.25 * dur
          );
        }
        tl.fromTo('[data-path] li', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 * dur, stagger: 0.08 * dur }, 0.1 * dur);
        return tl;
      };
      play.current = show;
      show('popup', false).progress(1);
      gsap.set(['[data-shade]', '[data-modal]'], { autoAlpha: 0 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          const first = show('popup');
          if (!still) {
            first.eventCallback('onComplete', () => {
              gsap.delayedCall(1.4, () => {
                if (!touched.current) setMode('inline');
              });
            });
          }
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Play the change whenever the mode changes after the first paint.
  const first = useRef(true);
  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    play.current?.(mode);
  }, [mode]);

  const choose = (id) => {
    touched.current = true;
    setMode(id);
  };
  const current = MODES.find((m) => m.id === mode);

  return (
    <figure className={`cro-form is-${mode}`} ref={root}>
      <div className="cro-form__switch" role="group" aria-label="Where the form sits">
        {MODES.map(({ id, label }) => (
          <button key={id} type="button" aria-pressed={mode === id} onClick={() => choose(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="cro-form__stage" aria-hidden="true">
        <div className="cro-form__bar">
          <i />
          <i />
          <i />
        </div>
        <div className="cro-form__page">
          <div className="cro-form__hero">
            <div className="cro-form__copy">
              <span className="cro-form__tag" />
              <span className="cro-form__line is-head" />
              <span className="cro-form__line is-head is-short" />
              <span className="cro-form__line" />
              <span className="cro-form__line is-short" />
              <span className="cro-form__cta" data-cta>
                Download syllabus
              </span>
            </div>
            <div className="cro-form__card is-inline" data-inline>
              <span className="cro-form__field" data-field />
              <span className="cro-form__field" data-field />
              <span className="cro-form__field is-chosen" data-field>
                <b />
              </span>
              <span className="cro-form__field is-chosen" data-field>
                <b />
              </span>
              <span className="cro-form__submit" data-field />
            </div>
          </div>
          <div className="cro-form__below">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="cro-form__shade" data-shade />
        <div className="cro-form__card is-modal" data-modal>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="cro-form__field" data-field />
          ))}
          <span className="cro-form__submit" data-field />
        </div>
        <svg className="cro-form__cursor" data-cursor viewBox="0 0 16 20">
          <path d="M1 1 L1 15 L5 11 L8 18 L10.5 17 L7.5 10 L13 10 Z" />
        </svg>
      </div>

      <ol className="cro-form__path" data-path aria-label={`To start the form, ${current.label.toLowerCase()}`}>
        {current.path.map((step, i) => (
          <li key={`${mode}-${step}`} className={i === current.path.length - 1 ? 'is-end' : undefined}>
            {step}
          </li>
        ))}
      </ol>
      <figcaption className="cro-form__caption">{caption}</figcaption>
    </figure>
  );
}
