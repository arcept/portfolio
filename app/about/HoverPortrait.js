'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';

// The photograph is not given a column of its own. It appears beside the pointer while the visitor
// is actually over the sentences about him, and follows with a little lag, so the person arrives
// with the words rather than as a separate exhibit. Wrap it around the text alone.
//
// Where there is no hover (touch, and reduced motion) the photograph is shown in place instead —
// .abt-hovershot--static in about.css — so it is never only available to a mouse.
export default function HoverPortrait({ children }) {
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const area = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  // A little tilt from how fast the pointer is travelling sideways.
  const tilt = useTransform(sx, (value) => (value - x.get()) * 0.05);

  useEffect(() => setMounted(true), []);

  // True only when the pointer is over a line of the text itself. A Range gives one rect per line,
  // so the ragged right edge, the gap under the last line and the space around the paragraph are all
  // outside — the photograph belongs to the sentences, not to the column's empty space.
  const overText = (clientX, clientY) => {
    const text = area.current?.firstElementChild;
    if (!text) return false;
    const range = document.createRange();
    range.selectNodeContents(text);
    for (const r of range.getClientRects()) {
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return true;
    }
    return false;
  };

  const track = (event) => {
    if (event.pointerType === 'touch') return;
    if (!overText(event.clientX, event.clientY)) {
      if (shown) setShown(false);
      return;
    }
    x.set(event.clientX);
    y.set(event.clientY);
    if (!shown) {
      // The springs rest at 0,0 until they are given a position, so without this the photograph
      // flies in from the top-left corner the first time. Jump sets them with no travel.
      sx.jump(event.clientX);
      sy.jump(event.clientY);
      setShown(true);
    }
  };

  return (
    <div
      className="abt-hoverzone"
      ref={area}
      onPointerMove={track}
      onPointerLeave={() => setShown(false)}
    >
      {children}

      {/* Rendered into <body>: this column is inside a parallax transform, and a transformed ancestor
          becomes the containing block for position:fixed — the photograph would ride the parallax
          away from the cursor as soon as the page scrolled. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {shown && (
              <motion.figure
                className="abt-hovershot"
                style={{ left: sx, top: sy, rotate: tilt }}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              >
                <Image src="/about/manik-street.jpg" alt="" width={1500} height={2000} sizes="320px" priority />
              </motion.figure>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

// The same photograph, in the flow, for anyone who cannot hover. It arrives the way everything else
// on this page arrives: nothing is simply present when it comes into view.
export function StaticPortrait() {
  const box = useRef(null);
  const shown = useInView(box, { once: true, amount: 0.2 });

  return (
    <motion.figure
      ref={box}
      className="abt-hovershot abt-hovershot--static"
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 30, filter: shown ? 'blur(0px)' : 'blur(8px)' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src="/about/manik-street.jpg"
        alt="Manik Madaan standing in the middle of a wet street at dusk, string lights overhead."
        width={1500}
        height={2000}
        sizes="(max-width: 860px) 100vw, 40vw"
      />
    </motion.figure>
  );
}
