'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { offsetFromVisitor, pad, useDelhiNow } from './data';

// The "In Delhi now" tile: split-flap digits in Doto (clock-font.js) that flip as the minutes turn, a
// seconds bar under them. Pointing at it (or focusing it) turns the foot to the visitor: how far their
// clock is from Delhi's.

export default function Clock() {
  const now = useDelhiNow();
  const [away, setAway] = useState('');
  useEffect(() => setAway(offsetFromVisitor()), []);

  return (
    <div className="clk" tabIndex={0} aria-label={now ? `In Delhi it is ${pad(now.h)}:${pad(now.m)}. ${away}.` : 'The time in Delhi'}>
      <h2 className="cth__tile-kicker">In Delhi now</h2>
      <Flip now={now} />
      <span className="clk__foot">
        <span className="clk__zone">IST · GMT +5:30</span>
        <span className="clk__away">{away}</span>
      </span>
    </div>
  );
}

function Flip({ now }) {
  const digits = now ? `${pad(now.h)}${pad(now.m)}` : '----';
  return (
    <>
      <span className="clk__flip" aria-hidden="true">
        {[...digits].map((d, i) => (
          <span key={i} className={`clk__card${i === 2 ? ' clk__card--gap' : ''}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={d}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.3, 0.7, 0.4, 1] }}
              >
                {d}
              </motion.span>
            </AnimatePresence>
          </span>
        ))}
      </span>
      <span className="clk__secs" aria-hidden="true">
        <span style={{ scale: `${((now?.s ?? 0) + 1) / 60} 1` }} />
      </span>
    </>
  );
}
