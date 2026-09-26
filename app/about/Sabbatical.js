'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { HELD, LINE_AWAY, LINE_BACK, PAIRS, RETURN, SABBATICAL_DATES, SABBATICAL_HEADLINES, SABBATICAL_INTRO } from './sabbatical-content';
import SabbaticalTrade from './SabbaticalTrade';
import useBleedEdges from './useBleedEdges';

const EASE = [0.16, 1, 0.3, 1];

const rise = (delay = 0, y = 22) => ({
  initial: { opacity: 0, y, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// The two pictures, in order: the busy room first, the quiet dusk view after it.
const VIEWS = [
  {
    key: 'room',
    landscape: '/about/sabbatical/set3-landscape.jpg',
    portrait: '/about/sabbatical/set3-portrait.jpg',
    alt: 'An illustrated room full of the sabbatical: trading screens, a balcony garden, a map pinned with travel photographs, a woodworking bench and a small milling machine.',
  },
  {
    key: 'dusk',
    landscape: '/about/sabbatical/set2-landscape.jpg',
    portrait: '/about/sabbatical/set2-portrait.jpg',
    alt: 'The same things at dusk, in red and blue: plants, a trading screen, a workbench and a milling machine, around a terrace that opens onto hills and the sea.',
  },
];

const SIDES = [
  { key: 'away', label: 'Stepped away from', full: LINE_AWAY },
  { key: 'back', label: 'Returned with', full: LINE_BACK },
];

const HEADLINE = SABBATICAL_HEADLINES[0];

// Section 06. An illustration holds still behind while a card rises over it, spanning the nav bar's
// width: it starts 200px below the picture's top and ends 100px above its foot. As the card passes, the
// busy room gives way to the dusk view, and the card takes a deep colour from whichever is showing. In
// the card: the head; what I stepped away from and returned with, behind a switch, beside trading; what
// the time held; and the AI line as a quotation. Under the card, the illustrations' credit.
export default function Sabbatical() {
  const box = useRef(null);
  useBleedEdges(box);
  const [side, setSide] = useState('away');
  const [shown, setShown] = useState(0);

  const { scrollYProgress } = useScroll({ target: box, offset: ['start start', 'end end'] });
  // A function transform, not a range: Motion hands a plain scroll-linked opacity range to the browser's
  // native scroll timeline, which measures this sticky, overflowing section differently and faded the
  // second picture back out towards the end.
  const mix = useTransform(() => Math.min(1, Math.max(0, (scrollYProgress.get() - 0.3) / 0.35)));
  useMotionValueEvent(mix, 'change', (v) => setShown(v > 0.5 ? 1 : 0));

  return (
    <section className="sab" id="sabbatical" aria-labelledby="abt-sabbatical-title" ref={box} data-shown={VIEWS[shown].key}>
      <div className="sab__art">
        <motion.div
          className="sab__frame"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <Picture view={VIEWS[0]} />
          <motion.div className="sab__top" style={{ opacity: mix }}>
            <Picture view={VIEWS[1]} />
          </motion.div>
        </motion.div>
      </div>

      <div className="sab__opening" />

      <motion.div
        className="sab__card"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <motion.span
          className="sab__sticker"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -4 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.55 }}
        >
          <img src="/about/stickers/sabbatical.svg" alt="" width={616} height={334} />
        </motion.span>

        <div className="sab__head">
          <motion.p className="sab-label" {...rise(0)}>
            <span className="sab-label__index">06</span>
            <motion.span
              className="sab-label__rule"
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            />
            <span>Sabbatical</span>
            <span className="sab-label__dates">{SABBATICAL_DATES}</span>
          </motion.p>
          <motion.h2 className="sab__title" id="abt-sabbatical-title" {...rise(0.06)}>
            {HEADLINE.split('\n').map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </motion.h2>
          <motion.p className="sab__intro" {...rise(0.14)}>
            {SABBATICAL_INTRO}
          </motion.p>
        </div>

        <div className="sab__mid">
          <div>
            <motion.div className="sab__switch" role="radiogroup" aria-label="Which side" {...rise(0.05)}>
              {SIDES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={side === s.key}
                  aria-label={s.full}
                  className={side === s.key ? 'is-on' : ''}
                  onClick={() => setSide(s.key)}
                >
                  {side === s.key && <motion.span className="sab__thumb" layoutId="sab-thumb" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  <span className="sab__switchlabel">{s.label}</span>
                </button>
              ))}
            </motion.div>
            <ol className="sab__list" aria-live="polite">
              {PAIRS.map((p, i) => (
                <motion.li key={p.away} {...rise(0.08 + i * 0.05)}>
                  <span className="sab__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="sab__slot">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={side}
                        className={`sab__text sab__text--${side}`}
                        initial={{ opacity: 0, y: side === 'back' ? 20 : -20, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: side === 'back' ? -20 : 20, filter: 'blur(6px)' }}
                        transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                      >
                        {p[side]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>

          <SabbaticalTrade />
        </div>

        <div className="sab__held">
          <motion.p className="sab__kicker" {...rise(0)}>
            What the time held
          </motion.p>
          <ul>
            {HELD.map((h, i) => (
              <motion.li key={h.id} {...rise(0.03 + i * 0.04)}>
                {h.text}
              </motion.li>
            ))}
          </ul>
        </div>

        <figure className="sab__ai">
          <motion.span
            className="sab__mark"
            aria-hidden="true"
            initial={{ opacity: 0, y: 30, rotate: -8 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          >
            “
          </motion.span>
          <blockquote>
            <Lit text={RETURN} />
          </blockquote>
        </figure>
      </motion.div>

      <div className="sab__after">
        <motion.p className="sab__credit" {...rise(0.1, 10)}>
          Illustrations generated with AI, inspired by the work of{' '}
          <a href="https://dribbble.com/muhammedsajid" target="_blank" rel="noopener noreferrer">
            Muhammad Sajid on Dribbble
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </motion.p>
      </div>
    </section>
  );
}

function Picture({ view }) {
  return (
    <picture>
      <source media="(max-width: 899px)" srcSet={view.portrait} />
      <img src={view.landscape} alt={view.alt} width={1672} height={941} />
    </picture>
  );
}

// The AI line: each word lights as it climbs the screen.
function Lit({ text }) {
  const el = useRef(null);
  const { scrollYProgress } = useScroll({ target: el, offset: ['start 0.95', 'end 0.78'] });
  const words = text.split(' ');
  return (
    <p ref={el} className="sab__aitext">
      {words.map((w, i) => (
        <Word key={`${w}-${i}`} progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ progress, from, to, children }) {
  // A function transform, so Motion does not hand it to the browser's native scroll timeline.
  const opacity = useTransform(() => 0.18 + 0.82 * Math.min(1, Math.max(0, (progress.get() - from) / (to - from))));
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  );
}
