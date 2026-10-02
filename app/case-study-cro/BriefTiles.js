'use client';

import { useRef } from 'react';
import { EASE_IN, gsap, prefersStill, useIsoLayoutEffect } from './gsap';
import useReveal from './useReveal';
import { BRIEF } from './content';

// "In brief" as image cards: the five beats as a row of tiles, the whole story on one screen. Each tile shows
// its name and its line; pointing at it (or focusing it) turns it over to the detail. On screens without
// a pointer that can hover, the detail is simply shown beneath the line. A beat with an image has it as the
// card's background, fading to near-black behind the words so they stay legible; on hover it eases in closer
// and darkens further for the longer detail.
// The tiles rise in one after another, each opening upward out of its own frame.

export default function BriefTiles() {
  const root = useRef(null);
  useReveal(root);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (prefersStill()) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: el.querySelector('[data-tiles]'), start: 'top 82%', once: true } })
        .from('[data-tile]', { clipPath: 'inset(100% 0% 0% 0%)', y: 50, duration: 1.1, ease: 'expo.out', stagger: 0.1, clearProps: 'clipPath' }, 0)
        .from('[data-tile-in]', { autoAlpha: 0, y: 14, duration: 0.7, ease: EASE_IN, stagger: 0.06 }, 0.35);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cro-tiles" id="brief" ref={root} aria-labelledby="brief-title">
      <div className="cro-wrap">
        <header className="cro-tiles__head">
          <p className="cro-kicker" data-fade>
            In brief
          </p>
          <h2 id="brief-title" className="cro-h2" data-mask>
            A page problem revealed <em>a decision problem.</em>
          </h2>
          <p className="cro-tiles__hint" data-fade aria-hidden="true">
            Point at a beat for its detail
          </p>
        </header>

        <ol className="cro-tiles__grid" data-tiles>
          {BRIEF.map(({ label, line, body, image }, i) => (
            <li key={label} className={`cro-tile${image ? ' has-image' : ''}`} data-tile tabIndex={0}>
              {image && (
                <span className="cro-tile__media" aria-hidden="true">
                  <img src={image} alt="" width="720" height="960" loading="lazy" decoding="async" />
                </span>
              )}
              <p className="cro-tile__tag" data-tile-in>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {label}
              </p>
              <div className="cro-tile__face" data-tile-in>
                <h3 className="cro-tile__line">
                  {line}
                </h3>
                <p className="cro-tile__body">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
