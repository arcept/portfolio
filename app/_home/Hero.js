'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Action from './Action';
import { FACE } from './fonts';
import { useIntroDone } from './HomeIntro';
import useScrollTimeline from './useScrollTimeline';
import glideTo from './glideTo';
import Marquee from './Marquee';
import Portrait from './Portrait';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Around, Canvas } from './Workbench';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1];
// Always two lines, on a phone too: the headline shrinks until its longer line fits (Headline).
const LINES = ['I build design functions', 'and I still do the craft work to prove it.'];

// The homepage's first screen, a designer's working bench (Workbench.js): faint dots full-bleed behind
// a layer that zooms out as the page scrolls away: the name in very large type running by behind the
// illustrated portraits, which stand in the middle as a selected frame, taking turns and shrinking
// with the scroll, with Magpiary and PushDeck tucked behind them; the headline under them; and the
// buttons. Everything comes in once the loading curtain lifts (`ready`).
export default function Hero() {
  const ready = useIntroDone();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  // In CSS where the browser can tie it to the scroll itself: on iOS Safari a zoom driven from
  // JavaScript lags the scroll by a frame or so, and shakes.
  const css = useScrollTimeline();

  // Measure the page's scroll animations again once it has settled (fonts and pictures change the
  // hero's height, and the statement under it is placed by ScrollTrigger).
  useEffect(() => {
    const settle = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => window.clearTimeout(settle);
  }, []);

  return (
    <section className="hx-i-hero hxw" ref={ref}>
      <Canvas ready={ready} />
      <motion.div
        className="hx-i-poster"
        style={css ? undefined : { scale }}
      >
        {/* It opens out of a clip. The clip is on this inner layer, not on the poster the scroll
            scales: a clip on a scaling element makes Safari repaint it every frame. */}
        <motion.div
          className="hx-i-poster__inner"
          initial={{ clipPath: 'inset(6% 6% 6% 6% round 48px)' }}
          animate={ready ? { clipPath: 'inset(0% 0% 0% 0% round 0px)' } : undefined}
          transition={{ duration: 1.4, ease: EASE }}
        >
          <div className="hx-i-stage">
            <Marquee ready={ready} />
            <Around ready={ready} progress={scrollYProgress} />
            <Portrait progress={scrollYProgress} css={css} ready={ready} />
          </div>
          <Headline ready={ready} />

          <motion.div
            className="abt-actions hx-i-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE, delay: 0.85 }}
          >
            <Action href="#work" arrow="↓" onClick={glideTo}>
              See the work
            </Action>
            <Action href="/about" variant="ghost">
              About me
            </Action>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Its lines never wrap: when the longer one would run wider than the room there is (on a phone),
// the whole headline steps down in size until it fits, measured again whenever the room changes or
// the face arrives.
function Headline({ ready }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const title = ref.current;
    const fit = () => {
      title.style.fontSize = '';
      const widest = Math.max(...[...title.querySelectorAll('.hx-i-title__line')].map((line) => line.scrollWidth));
      const room = title.clientWidth;
      if (widest > room) title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * (room / widest) * 0.98}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const watch = new ResizeObserver(fit);
    watch.observe(title.parentElement);
    return () => watch.disconnect();
  }, []);

  return (
    <h1 ref={ref} className="hx-i-title" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, letterSpacing: FACE.tracking }}>
      {LINES.map((line, i) => (
        <span className="hx-i-title__mask" key={line}>
          <motion.span
            className="hx-i-title__line"
            initial={{ y: '110%' }}
            animate={ready ? { y: '0%' } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 0.35 + i * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
