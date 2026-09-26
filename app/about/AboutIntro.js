'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { INTRO_ATTR, INTRO_KEY } from './intro';

// The loading curtain (see intro.js) and the signal the opening waits on. The opening's entrance is
// held until the curtain starts to lift, so it plays in view instead of underneath.
//
// Outside the About page (the lab routes) there is no provider, so the default is "done" and those
// components animate as they always did.
const IntroContext = createContext(true);
export const useIntroDone = () => useContext(IntroContext);

const MIN_MS = 900; // from the request: long enough to read as a deliberate beat rather than a flicker
const MAX_MS = 3000; // from the request: never hold the page longer, whatever is still loading
const LIFT_MS = 900; // the columns' staggered lift in about.css

// What the curtain waits for: the fonts, and every image visible in the first screen.
function firstScreenWork() {
  const images = [...document.querySelectorAll('.abt img')].filter((img) => {
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
  const settled = images.map((img) =>
    img.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }),
  );
  return [document.fonts ? document.fonts.ready : Promise.resolve(), ...settled];
}

// performance.now() counts from the request, so time spent fetching this script counts too.
const until = (ms) => new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms - performance.now())));

// Gentle enough at the start that the takeover doesn't read as a lurch forward.
const easeOut = (t) => 1 - (1 - t) ** 2;

// The curtain's content: the shutter (about.css). Its count is drawn in every column and in every
// column's fill, so the rising accent cuts through the digits. Whatever the content, it reads the two
// properties the fill sets on .abt-intro — --abt-p (0–100, fractional) and --abt-n (the same, whole)
// — and lifts on .is-lifting within LIFT_MS, so other curtains run on this component unchanged (the
// alternatives are in the loader lab).
const COLUMNS = [0, 1, 2, 3, 4, 5];

const SHUTTER = (
  <>
    <span className="abt-intro__cols">
      {COLUMNS.map((i) => (
        <span className="abt-intro__col" key={i} style={{ '--i': i }}>
          <span className="abt-intro__num" />
          <span className="abt-intro__fill">
            <span className="abt-intro__num" />
          </span>
        </span>
      ))}
    </span>
    <span className="abt-intro__name">Manik Madaan</span>
  </>
);

// `curtain`, `variant` and `simulate` exist for the loader lab (/about/loader-lab): another curtain,
// its class modifier, and a stand-in load time in ms in place of the real wait.
export default function AboutIntro({ children, curtain: content = SHUTTER, variant = 'shutter', simulate }) {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const curtain = useRef(null);
  const armed = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (armed.current === null) armed.current = root.hasAttribute(INTRO_ATTR);
    if (!armed.current) {
      setDone(true);
      setGone(true);
      return undefined;
    }

    let cancelled = false;
    let lifted = false;
    let frame = 0;
    let timer = 0;

    const lift = () => {
      lifted = true;
      // The class keeps the curtain displayed once the attribute (and the scroll lock) is gone.
      curtain.current?.classList.add('is-lifting');
      root.removeAttribute(INTRO_ATTR);
      try {
        window.sessionStorage.setItem(INTRO_KEY, '1');
      } catch {}
      setDone(true);
      timer = window.setTimeout(() => setGone(true), LIFT_MS);
    };

    // The fill has been running in CSS since the curtain first painted (abt-intro-fill, about.css).
    // Once the page is ready, take it over from wherever it has got to and carry it on to 100 at a
    // pace that reads as the same motion, then lift.
    const finish = () => {
      const node = curtain.current;
      if (!node) return lift();
      const from = parseFloat(getComputedStyle(node).getPropertyValue('--abt-p')) || 0;
      node.style.setProperty('--abt-p', from);
      node.style.setProperty('--abt-n', Math.round(from));
      node.style.animationName = 'none';
      const duration = 450 + (100 - from) * 9; // 1.35s from zero, about 1s from 40, 0.7s from 70
      const began = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - began) / duration);
        const value = from + (100 - from) * easeOut(t);
        node.style.setProperty('--abt-p', value);
        node.style.setProperty('--abt-n', Math.round(value));
        if (t < 1) frame = requestAnimationFrame(step);
        else lift();
      };
      frame = requestAnimationFrame(step);
    };

    const ready =
      simulate != null
        ? new Promise((resolve) => window.setTimeout(resolve, simulate))
        : Promise.all([Promise.race([Promise.all(firstScreenWork()), until(MAX_MS)]), until(MIN_MS)]);
    ready.then(() => {
      if (!cancelled) finish();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      // Leaving mid-load must not strand the scroll lock on the next page. Checked a moment later, and
      // only if no curtain is still up: a development re-run of this effect (same curtain) or the lab's
      // replay (a new one) must keep the attribute, or the fill would restart from zero.
      if (!lifted) {
        window.setTimeout(() => {
          if (!document.querySelector('.abt-intro:not(.is-lifting)')) root.removeAttribute(INTRO_ATTR);
        });
      }
    };
  }, []);

  return (
    <IntroContext.Provider value={done}>
      {!gone && (
        <div className={`abt-intro abt-intro--${variant}`} ref={curtain} aria-hidden="true">
          {content}
        </div>
      )}
      {children}
    </IntroContext.Provider>
  );
}
