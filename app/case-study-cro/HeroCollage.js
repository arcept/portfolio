'use client';

import { useRef } from 'react';
import { EASE_IN, countTo, gsap, prefersStill, useIsoLayoutEffect } from './gsap';
import { RESULT } from './content';
import { Copy, Heading, LeadFacts, Note, Steps, addSteps, playWords } from './HeroParts';
import HeroFigure from './HeroFigure';
import HeroBackground from './HeroBackground';

// The hero: the image as a layered collage beside the words: the illustration taken apart into its
// pieces (the architectural backdrop, the laptop with the course page, the result cards), each at its
// own depth. The pieces drift against each other with the pointer and with the scroll; an orange
// thread runs from the page's form to the cards.
//
// The cards are live, not part of the picture: they carry the report's own figures and count in. The
// backdrop and laptop are cut from the flat illustration until its layered files arrive.
//
// Under them, the journey figure: the five teams' lanes bending into one visitor journey,
// the reported week's rates counting in under its steps, the note on what the comparison can tell us, and
// Darkroom's accent glow behind. It plays when it scrolls into view.
//
// Behind the words and the collage, a quiet moving background (HeroBackground.js), fading out
// before the journey.
//
// On load the backdrop wipes down, the laptop rises into place, the thread draws and the cards drop
// on to the stack. Under 900px the collage sits under the words and only the scroll moves it.

const CARDS = [
  { label: 'Unique visitors', value: 7.31, suffix: '%', arrow: '↓', sub: '2,613 → 2,422' },
  { label: 'Started the form', value: 9, suffix: ' pp', arrow: '↑', sub: `${RESULT.rates[0].from}% → ${RESULT.rates[0].to}%` },
  { label: 'Submitted it', value: 7.33, suffix: ' pp', arrow: '↑', sub: `${RESULT.rates[1].from}% → ${RESULT.rates[1].to}%` },
];

// The journey figure under the collage is hidden for now (2026-10-02): read straight after the hero, its lanes
// looked like visitors arriving from each team. It's to be placed elsewhere; set true to show it here again.
const SHOW_JOURNEY = false;

const FINE = '(min-width: 900px) and (hover: hover) and (pointer: fine)';

export default function HeroCollage() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (prefersStill()) return undefined;
    let split;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      split = playWords(tl, el);
      tl.from('[data-in="back"]', { clipPath: 'inset(0% 0% 100% 0% round 14px)', duration: 1.3, ease: 'expo.inOut' }, 0.2)
        .from('[data-in="laptop"]', { autoAlpha: 0, y: 90, duration: 1.3, ease: 'expo.out' }, 0.55)
        .from('[data-thread]', { strokeDashoffset: 1, duration: 1.1, ease: 'power2.inOut' }, 1.2)
        .from('[data-thread-dot]', { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(3)' }, 1.2)
        .from('[data-in="card"]', { autoAlpha: 0, y: -70, scale: 1.08, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.16 }, 1.45);
      el.querySelectorAll('.cro-col__cards [data-count]').forEach((num, i) => {
        tl.add(countTo(num, { to: CARDS[i].value, decimals: 2, suffix: CARDS[i].suffix, duration: 1.4 }), 1.6 + i * 0.16);
      });

      // Depth: nearer pieces move further, with the scroll and with the pointer.
      const layers = gsap.utils.toArray('[data-depth]');
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .to(layers, { yPercent: (i, layer) => -Number(layer.dataset.depth) * 22, ease: 'none' }, 0);

      mm.add(FINE, () => {
        const movers = layers.map((layer) => ({
          depth: Number(layer.dataset.depth),
          x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
        }));
        const move = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(-nx * m.depth * 36);
            m.y(-ny * m.depth * 26);
          });
        };
        const rest = () => movers.forEach((m) => (m.x(0), m.y(0)));
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', rest);
        return () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', rest);
        };
      });
    }, el);
    return () => {
      ctx.revert();
      mm.revert();
      split?.revert();
    };
  }, []);

  return (
    <header className={`cro-col${SHOW_JOURNEY ? '' : ' is-bare'}`} ref={root} data-hero>
      <div className="cro-col__top">
        <HeroBackground />
        <div className="cro-wrap cro-col__grid">
          <div className="cro-col__copy">
            <Heading className="cro-col__h1" />
            <Copy className="cro-col__deck" />
            <LeadFacts className="cro-col__facts" />
          </div>

          <figure className="cro-col__stage">
            <div className="cro-col__layer is-back" data-depth="0.35">
              <img
                data-in="back"
                src="/case-study-cro/hero-01-backdrop.webp"
                width="1400"
                height="667"
                alt=""
                decoding="async"
              />
            </div>
            <div className="cro-col__layer is-laptop" data-depth="0.7">
              <img
                data-in="laptop"
                src="/case-study-cro/hero-01-laptop.webp"
                width="1600"
                height="1088"
                alt="The BIM course page as it was in 2024, with its syllabus form beside the headline."
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <svg className="cro-col__layer cro-col__thread" data-depth="0.9" viewBox="0 0 100 104" aria-hidden="true">
              <path data-thread d="M66 41 C 78 41, 90 43, 90 53" pathLength="1" />
              <circle data-thread-dot cx="66" cy="41" r="0.9" />
            </svg>
            <ol className="cro-col__cards" aria-label="The reported week, against the week before">
              {CARDS.map((card, i) => (
                <li key={card.label} className={`cro-col__layer cro-card is-${i + 1}`} data-depth={(1.05 + i * 0.2).toFixed(2)}>
                  <div className="cro-card__face" data-in="card">
                    <span className="cro-card__label">{card.label}</span>
                    <strong className="cro-card__value">
                      <span className="cro-card__arrow" aria-hidden="true">
                        {card.arrow}
                      </span>
                      <span className="sr-only">{card.arrow === '↓' ? 'down' : 'up'}</span>
                      <span data-count>
                        {card.value.toFixed(2)}
                        {card.suffix}
                      </span>
                    </strong>
                    <span className="cro-card__sub">{card.sub}</span>
                  </div>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </div>

      {SHOW_JOURNEY && (
        <div className="cro-wrap cro-col__journey">
          <HeroFigure mode="view" note={<Note />} extend={(tl, at, figure) => addSteps(tl, figure, at)}>
            <Steps />
          </HeroFigure>
        </div>
      )}
    </header>
  );
}
