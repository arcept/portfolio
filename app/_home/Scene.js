'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useTheme from './useTheme';
import Backdrop from './backdrops/Backdrop';
import { auroraContours } from './backdrops/auroraContours';

gsap.registerPlugin(ScrollTrigger);

// The hero's background, the aurora contours, pinned to the screen behind the hero. As the hero
// scrolls away (GSAP's ScrollTrigger, scrubbed over the hero's height) it quietens and fades out, and
// it is gone (hidden, and no longer drawn) once the hero has passed: nothing of it carries on under
// the rest of the page. Its entrance waits for `ready` (the loading curtain has lifted).
export default function Scene({ hero, ready }) {
  const theme = useTheme();
  const box = useRef(null);
  const scroll = useRef({ value: 0 });

  // After mounting (not in a layout effect): the hero this is inside is only attached to its ref once
  // its children's layout effects have run.
  useEffect(() => {
    if (!hero.current) return undefined;
    const ctx = gsap.context(() => {
      const trigger = { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: 0.6 };
      const tl = gsap.timeline({ scrollTrigger: trigger, defaults: { ease: 'none' } });
      tl.fromTo(scroll.current, { value: 0 }, { value: 1, duration: 1 }, 0);
      tl.fromTo(box.current, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, ease: 'power1.in' }, 0.4);
    }, box);
    // Measure again once the page has settled (fonts and pictures change the hero's height).
    const settle = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => {
      window.clearTimeout(settle);
      ctx.revert();
    };
  }, [hero]);

  return (
    <div ref={box} className="hx-i-scene">
      <Backdrop {...auroraContours} theme={theme} scroll={scroll} watch={hero} ready={ready} />
    </div>
  );
}
