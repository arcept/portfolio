'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useTransform } from 'motion/react';
import one from './art/portrait-1.webp';
import two from './art/portrait-2.webp';
import three from './art/portrait-3.webp';
import Hello from './Hello';
import NameSticker from './NameSticker';

const IMAGES = [one, two, three];
const HOLD = 4500; // how long each portrait stays before the next comes in
const EASE = [0.16, 1, 0.3, 1];

// The illustrated portraits, upright with rounded corners, in the middle of the name band. They take
// turns: every few seconds the next comes in, in vertical strips. It opens out of a narrower crop as
// it rises into place, and shrinks as the hero scrolls away, the "Hello / Ciao" sticker on its corner
// and the name under it going with it: in CSS (home.css) when `css` (the browser supports scroll-driven animations),
// otherwise from `progress`. With reduced motion it keeps to the first portrait.
export default function Portrait({ progress, css, ready }) {
  const [index, setIndex] = useState(0);
  const still = useReducedMotion();
  const scale = useTransform(progress, [0, 1], [1, 0.6]);

  useEffect(() => {
    if (still || !ready) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % IMAGES.length);
    }, HOLD);
    return () => window.clearInterval(timer);
  }, [still, ready]);

  // The scroll scales the outer layer; the entrance (with its clip) is on the inner one, so the clip
  // never sits on something being scaled, which makes Safari repaint it every frame.
  return (
    <motion.div className="hx-i-portrait-scale" style={css ? undefined : { scale }}>
      <motion.div
        className="hx-i-portrait"
        role="img"
        aria-label="Illustrated portraits of Manik"
        initial={{ opacity: 0, y: 40, clipPath: 'inset(12% 18% 12% 18% round 28px)' }}
        animate={ready ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)' } : undefined}
        transition={{ duration: 1.3, ease: EASE, delay: 0.45 }}
      >
        <Slices index={index} />
      </motion.div>
      <Hello ready={ready} />
      <NameSticker ready={ready} />
    </motion.div>
  );
}

// The portrait on show (`now`) and the one it came in over (`before`). Worked out as the index
// changes, so the one underneath is always the one that was showing: nothing waits on an animation
// finishing to catch up.
function usePair(index) {
  const [pair, setPair] = useState({ now: index, before: index });
  if (pair.now !== index) {
    const next = { now: index, before: pair.now };
    setPair(next);
    return next;
  }
  return pair;
}

// Once the page has finished loading (so they never hold up the first screen), the other portraits are
// fetched and decoded ahead, so a change never waits on one.
function useLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const go = () => {
      IMAGES.slice(1).forEach((img) => {
        const pic = new Image();
        pic.src = img.src;
        pic.decode?.().catch(() => {});
      });
      setLoaded(true);
    };
    if (document.readyState === 'complete') {
      go();
      return undefined;
    }
    window.addEventListener('load', go, { once: true });
    return () => window.removeEventListener('load', go);
  }, []);
  return loaded;
}

// The next portrait arrives in vertical strips, one after another, alternately from above and below,
// over the last. All the portraits stay stacked underneath with only the one being covered shown, so
// nothing is swapped in (and decoded) at the moment it must appear. Each strip is wiped in by moving it
// (its window slides in while the picture inside slides the other way, so the picture holds still),
// which a phone does on its compositor, rather than by cutting it away with a clip.
const SLICES = 6;
const STRIP = 100 / SLICES + 0.5; // each strip's width, in % of the portrait: a hair wider, so no seams

function Slices({ index }) {
  const { now, before } = usePair(index);
  const loaded = useLoaded();
  const next = IMAGES[now];
  return (
    <>
      {IMAGES.map((img, i) =>
        i === 0 || loaded ? (
          <img
            key={img.src}
            className="hx-i-portrait__img"
            src={img.src}
            width={img.width}
            height={img.height}
            alt=""
            style={{ opacity: i === before ? 1 : 0 }}
          />
        ) : null,
      )}
      {now !== before &&
        Array.from({ length: SLICES }, (_, k) => {
          const from = k % 2 ? -100 : 100;
          const move = { duration: 0.8, ease: [0.7, 0, 0.2, 1], delay: k * 0.07 };
          return (
            <motion.span
              key={`${now}-${k}`}
              className="hx-i-portrait__slice"
              style={{ left: `${(k * 100) / SLICES}%`, width: `${STRIP}%` }}
              initial={{ y: `${from}%` }}
              animate={{ y: '0%' }}
              transition={move}
            >
              <motion.img
                className="hx-i-portrait__strip"
                src={next.src}
                alt=""
                style={{ width: `${(100 / STRIP) * 100}%`, left: `${-((k * 100) / SLICES / STRIP) * 100}%` }}
                initial={{ y: `${-from}%` }}
                animate={{ y: '0%' }}
                transition={move}
              />
            </motion.span>
          );
        })}
    </>
  );
}
