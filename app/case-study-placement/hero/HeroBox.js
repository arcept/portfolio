'use client';

import { useRef } from 'react';
import { FIGURES, FIGURES_NOTE, Eligible, Toast, useHeroCopy, useLive, useTick } from './parts';
import { addDepth, gsap, playWords, prefersStill, useIsoLayoutEffect } from './motion';

// C · Box. The problem made literal. On the right, a black box: inside it float the questions learners were left
// asking. A scan line runs down it and the box clears, and as the line passes each question, the portal's own
// answer takes its place: the update that the profile was shared, the eligibility stamp, the reason a job isn't a
// match, the hours left to apply. The box holds open (the hours still counting down), then closes over them, and
// the questions come back. The title, in Instrument Serif, is set tall beside it; amber is the accent; the page is
// grained and lit by a soft spotlight that follows the pointer.

// Each question, where it sits in the box (from the top, in %), and the answer under it.
const ROWS = [
  { q: 'Was my profile even shared?', y: 8 },
  { q: 'Am I eligible for placement support?', y: 31 },
  { q: 'Why can’t I apply to this one?', y: 54 },
  { q: 'Is this job still open?', y: 77 },
];

function NotMatch() {
  return (
    <div className="phx-ui phx-c__nomatch">
      <span className="phx-c__mark" aria-hidden="true">
        AE
      </span>
      <p>
        <b>Sr. BIM Engineer · AECOM</b>
        Needs 3+ years’ experience
      </p>
      <span className="phx-c__tag">Not a match</span>
    </div>
  );
}

function Closing({ hours }) {
  return (
    <div className="phx-ui phx-c__closing">
      <p>
        Applications close in <b>{hours} hrs</b>. Apply now!
      </p>
      <span className="phx-c__apply">Apply now →</span>
    </div>
  );
}

export default function HeroBox({ facts, actions }) {
  const root = useRef(null);
  const copy = useHeroCopy();
  const live = useLive(root);
  const hours = 36 - (useTick(live, 2600, 4000) % 12);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (prefersStill()) {
      el.classList.add('is-open');
      return undefined;
    }
    let split;
    let mm;
    const ctx = gsap.context(() => {
      const intro = gsap.timeline();
      split = playWords(intro, el);
      intro
        .from('[data-box]', { autoAlpha: 0, scale: 0.92, duration: 1.4, ease: 'expo.out' }, 0.3)
        .from('[data-q]', { autoAlpha: 0, y: 16, filter: 'blur(6px)', duration: 0.9, ease: 'power3.out', stagger: 0.18 }, 0.9);

      // The box: closed with its questions, scanned open answer by answer, held open, closed again; over and over.
      const scan = 2.8;
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      loop
        .set('[data-scan]', { autoAlpha: 1, top: '0%' })
        .to('[data-scan]', { top: '100%', duration: scan, ease: 'power1.inOut' }, 0)
        .to('[data-lid]', { clipPath: 'inset(100% 0% 0% 0%)', duration: scan, ease: 'power1.inOut' }, 0)
        .to('[data-scan]', { autoAlpha: 0, duration: 0.3 }, scan);
      ROWS.forEach(({ y }, i) => {
        const at = (scan * y) / 100;
        loop
          .to(`[data-q="${i}"]`, { autoAlpha: 0, y: -12, filter: 'blur(4px)', duration: 0.4, ease: 'power2.in' }, at)
          .fromTo(`[data-a="${i}"]`, { autoAlpha: 0, y: 14, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, at + 0.1);
      });
      const shut = scan + 6.5;
      loop
        .to('[data-lid]', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, shut)
        .to('[data-q]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12 }, shut + 0.9);
      intro.add(loop, 2.6);

      mm = addDepth(el, { x: 22, y: 16, scroll: 10 });
      // The spotlight follows the pointer.
      const light = (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      el.addEventListener('pointermove', light);
      return () => el.removeEventListener('pointermove', light);
    }, el);
    return () => {
      ctx.revert();
      mm?.revert();
      split?.revert();
    };
  }, []);

  const answers = [
    <Toast key="shared" text="Your application for BIM Engineer has been shared with the hiring partner." />,
    <Eligible key="eligible" />,
    <NotMatch key="nomatch" />,
    <Closing key="closing" hours={hours} />,
  ];

  return (
    <header className="phx-hero ph-hero phx-c" ref={root}>
      <div className="phx-c__bg" aria-hidden="true" />
      <div className="wrap wrap--wide phx-c__wrap">
        <a className="phx-back" href="/" data-eyebrow>
          ← {copy.back}
        </a>
        <div className="phx-c__grid">
          <div className="phx-c__copy">
            <h1 className="phx-c__h1" data-title>
              {copy.title} <em>{copy.turn}</em>
            </h1>
            <p className="phx-sub" data-rise>
              {copy.sub}
            </p>
            <p className="phx-intro" data-rise>
              {copy.intro}
            </p>
            <div className="phx-actions" data-rise>
              {actions}
            </div>
            <div className="phx-facts" data-rise>
              {facts}
            </div>
          </div>

          <figure className="phx-c__figure" aria-hidden="true">
            <div className="phx-c__box-wrap" data-depth="0.5">
              <div className="phx-c__box" data-box>
                {ROWS.map(({ y }, i) => (
                  <div key={i} className={`phx-c__answer is-${i + 1}`} style={{ top: `${y}%` }} data-a={i}>
                    {answers[i]}
                  </div>
                ))}
                <div className="phx-c__lid" data-lid>
                  <span className="phx-c__label">The black box</span>
                </div>
                <span className="phx-c__scan" data-scan />
                {ROWS.map(({ q, y }, i) => (
                  <span key={q} className="phx-c__q" style={{ top: `${y + 3}%` }} data-q={i}>
                    {q}
                  </span>
                ))}
              </div>
            </div>
            <figcaption className="phx-c__figs">
              <ol>
                {FIGURES.map((f) => (
                  <li key={f.label}>
                    <span>{f.label}</span>
                    <b>
                      {f.was} → {f.to}
                      {f.suffix}
                    </b>
                  </li>
                ))}
              </ol>
              <p>{FIGURES_NOTE}</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </header>
  );
}
