'use client';

import { useRef } from 'react';
import { FIGURES, FIGURES_NOTE, JOBS, STAGES, updateFor, useHeroCopy, useLive, useTick } from './parts';
import { addDepth, countTo, gsap, playWords, prefersStill, useIsoLayoutEffect, useStill } from './motion';

// B · Rail. Typographic, on a blueprint: the title set large across the page in the page's own grotesk, its turn
// in Newsreader italic; the deck and the intro side by side under it; then the whole journey as one line drawn
// across the hero like a dimension line. A marker carries an application along it: each stage it reaches is
// unredacted (the black box opening one step at a time) and the update the learner got there rises above it.
// At the end the line closes again and the next application sets off. Under it, the figures from Launch and
// measurement (illustrative there, so here too) and the facts. Under 900px the line runs down the page.

// Beats per run: the six stages, and two to hold on the last.
const BEATS = 8;

export default function HeroRail({ facts, actions }) {
  const root = useRef(null);
  const copy = useHeroCopy();
  const live = useLive(root);
  const still = useStill();
  const tick = useTick(live, 1700, 2400);
  const run = Math.floor(tick / BEATS);
  const job = JOBS[run % JOBS.length];
  // Before the first beat nothing is open; with less motion, the whole line is.
  const at = still ? 5 : tick === 0 ? -1 : Math.min((tick - 1) % BEATS, 5);

  useIsoLayoutEffect(() => {
    if (prefersStill()) return undefined;
    const el = root.current;
    let split;
    let mm;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      split = playWords(tl, el);
      tl.from('[data-rail-line]', { scaleX: 0, transformOrigin: '0 50%', duration: 1.6, ease: 'expo.inOut' }, 0.6)
        .from('[data-station]', { autoAlpha: 0, y: 14, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 1.0)
        .from('[data-fig]', { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 1.3);
      el.querySelectorAll('[data-count]').forEach((num, i) => {
        const f = FIGURES[i];
        tl.add(countTo(num, { from: f.from, to: f.to, decimals: f.decimals, suffix: f.suffix, duration: 1.5 }), 1.4 + i * 0.12);
      });
      mm = addDepth(el, { x: 16, y: 10, scroll: 8 });
    }, el);
    return () => {
      ctx.revert();
      mm?.revert();
      split?.revert();
    };
  }, []);

  return (
    <header className="phx-hero ph-hero phx-b" ref={root}>
      <div className="phx-b__bg" aria-hidden="true" data-depth="0.4" />
      <div className="wrap wrap--wide phx-b__wrap">
        <a className="phx-back" href="/" data-eyebrow>
          ← {copy.back}
        </a>
        <h1 className="phx-b__h1" data-title>
          {copy.title} <em>{copy.turn}</em>
        </h1>
        <div className="phx-b__cols">
          <div>
            <p className="phx-sub" data-rise>
              {copy.sub}
            </p>
            <div className="phx-actions" data-rise>
              {actions}
            </div>
          </div>
          <p className="phx-intro" data-rise>
            {copy.intro}
          </p>
        </div>

        <div className="phx-b__rail" aria-hidden="true" style={{ '--at': Math.max(at, 0) }}>
          <span className="phx-b__line" data-rail-line>
            <span className="phx-b__fill" />
          </span>
          <span className={`phx-b__marker${at < 0 ? ' is-waiting' : ''}`}>
            <span>{at === 5 ? 'Placed' : 'You'}</span>
          </span>
          <ol className="phx-b__stations">
            {STAGES.map((name, i) => (
              <li key={name} className={`${i <= at ? 'is-seen' : ''}${i === at ? ' is-now' : ''}`} data-station>
                <span className="phx-b__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="phx-b__name">{name}</span>
                {i === at && (
                  <span key={`${run}-${i}`} className={`phx-b__update${i === 5 ? ' is-end' : ''}`}>
                    {updateFor(i, job)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="phx-b__foot">
          <div className="phx-facts" data-rise>
            {facts}
          </div>
          <div className="phx-b__figs">
            <ol>
              {FIGURES.map((f) => (
                <li key={f.label} data-fig>
                  <strong data-count>
                    {f.to}
                    {f.suffix}
                  </strong>
                  <span>{f.label}</span>
                  <small>was {f.was}</small>
                </li>
              ))}
            </ol>
            <p data-fig>{FIGURES_NOTE}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
