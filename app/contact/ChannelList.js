'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring } from 'motion/react';
import { CHANNELS, CopyIcon, EASE, NewTab, outward, pad } from './data';

// The four ways to reach me, set big and numbered. Only the email shows its address (with a copy icon
// beside it). Pointing at a word: its letters roll up, one after another, into a copy in the accent
// colour; the others step back; the accent dot comes up at its shoulder and a big ↗ beside it, drawing
// itself in; and a small framed picture with the handle follows the pointer. Only a mouse (or keyboard
// focus) does this: on a touch screen a tap just opens the link.

const word = (i) => ({
  initial: { y: '110%' },
  animate: { y: '0%' },
  transition: { duration: 1.1, ease: EASE, delay: 0.2 + i * 0.08 },
});

export default function ChannelList() {
  const [on, setOn] = useState(-1);
  const list = useRef(null);
  const spring = { stiffness: 320, damping: 30, mass: 0.6 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const box = list.current.getBoundingClientRect();
    // Below and to the right of the pointer, so it never covers the word or its arrow.
    x.set(e.clientX - box.left + 26);
    y.set(e.clientY - box.top + 26);
  };

  return (
    <ol ref={list} className={`chl${on > -1 ? ' has-on' : ''}`} onPointerMove={move} onPointerLeave={() => setOn(-1)}>
      {CHANNELS.map((c, i) => (
        <li key={c.key} className={`chl__row${on === i ? ' is-on' : ''}`} onPointerEnter={(e) => e.pointerType === 'mouse' && setOn(i)}>
          <a className="chl__link" href={c.href} {...outward(c)} onFocus={(e) => e.currentTarget.matches(':focus-visible') && setOn(i)} onBlur={() => setOn(-1)}>
            <span className="chl__num" aria-hidden="true">
              {pad(i + 1)}
            </span>
            <span className="chl__mask">
              <motion.span className="chl__word" {...word(i)}>
                <span className="sr-only">{c.label}</span>
                <Letters text={c.label} />
                <span className="chl__dot" aria-hidden="true" />
                <Arrow />
              </motion.span>
            </span>
            {c.key !== 'email' && <span className="sr-only">, {c.handle}</span>}
            <NewTab channel={c} />
          </a>
          {c.key === 'email' && (
            <motion.span className="chl__email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
              <a href={c.href} className="chl__address">
                {c.handle}
              </a>
              <CopyIcon className="chl__copy" />
            </motion.span>
          )}
        </li>
      ))}

      <motion.div className="chl__peek" style={{ x, y }} aria-hidden="true">
        <AnimatePresence mode="popLayout">
          {on > -1 && (
            <motion.div
              key={CHANNELS[on].key}
              className="chl__peek-card"
              initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: on % 2 ? 4 : -4 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <img src={CHANNELS[on].photo} alt="" style={{ objectPosition: CHANNELS[on].focus || 'center' }} />
              <span>{CHANNELS[on].handle}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ol>
  );
}

// The arrow beside the word, drawn on a 24-unit grid so its line keeps the letters' weight at any size.
function Arrow() {
  return (
    <span className="chl__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M5 19 19 5M8 5h11v11" pathLength="1" />
      </svg>
    </span>
  );
}

// The word as letters, each with a copy under it for the roll (hidden from screen readers, which read
// the word whole).
function Letters({ text }) {
  return (
    <span className="chl__letters" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="chl__ltr" style={{ '--i': i }}>
          <span className="chl__ltr-in" data-c={ch}>
            {ch}
          </span>
        </span>
      ))}
    </span>
  );
}
