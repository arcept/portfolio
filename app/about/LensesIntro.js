'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import BookStack from './BookStack';
import { INTRO } from './lenses-content';

const EASE = [0.16, 1, 0.3, 1];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.9, ease: EASE, delay },
});

// Section 02's opening: the label, the headline with the handwritten "How I work" behind it (as
// "Who am I" sits in section 01), and the story of how design stopped being only visual. The lead-in
// stays at reading size; the turn is a pull line, and it and the paragraph after it light word by
// word as they travel up the screen. The books beside it can be pulled out of the stack.
export default function LensesIntro({ id = 'abt-lenses-title' }) {
  return (
    <>
      <motion.p className="abt-label" {...rise()}>
        <span className="abt-label__index">02</span>
        <span className="abt-label__rule" aria-hidden="true" />
        <span>How I work</span>
      </motion.p>

      <div className="abt-lenses__head">
        <motion.span
          className="abt-sticker abt-sticker--howiwork"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.4, rotate: -24 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 0.9, delay: 0.45 }}
        >
          <img src="/about/stickers/how-i-work.svg" alt="" width={343} height={299} />
        </motion.span>
        <motion.h2 className="abt-display abt-display--section" id={id} {...rise(0.05)}>
          {INTRO.headline}
        </motion.h2>
      </div>

      <div className="abt-lenses__intro">
        <div className="abt-lenses__copy">
          <motion.p className="abt-lenses__before" {...rise(0.1)}>
            {INTRO.before}
          </motion.p>
          <LitCopy turn={INTRO.turn} after={INTRO.after} />
        </div>

        <figure className="abt-lenses__books">
          <BookStack interactive />
          <motion.figcaption {...rise(0.9)}>On my desk · The Great Mental Models, volumes 1–3</motion.figcaption>
        </figure>
      </div>
    </>
  );
}

// The turn, then the paragraph after it, as one sequence: each word goes from dim to lit as the
// block travels from near the bottom of the screen to the middle, so the paragraph picks up where
// the turn line ends. Scroll back and it dims again.
function LitCopy({ turn, after }) {
  const box = useRef(null);
  const { scrollYProgress } = useScroll({ target: box, offset: ['start 0.85', 'end 0.5'] });
  const turnWords = turn.split(' ');
  const afterWords = after.split(' ');
  const total = turnWords.length + afterWords.length;

  return (
    <div className="abt-lenses__lit" ref={box}>
      <p className="abt-lenses__turn">
        {turnWords.map((w, i) => (
          <Word key={`t${i}`} progress={scrollYProgress} from={i / total} to={(i + 1) / total}>
            {w}
          </Word>
        ))}
      </p>
      <p className="abt-lenses__after">
        {afterWords.map((w, i) => {
          const n = turnWords.length + i;
          return (
            <Word key={`a${i}`} progress={scrollYProgress} from={n / total} to={(n + 1) / total}>
              {w}
            </Word>
          );
        })}
      </p>
    </div>
  );
}

function Word({ progress, from, to, children }) {
  const opacity = useTransform(progress, [from, to], [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  );
}
