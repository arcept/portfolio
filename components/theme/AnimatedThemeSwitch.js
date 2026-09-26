'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { track } from '@/components/track';

// The site's theme switch, wherever a page has one (the About page, the case studies). One shape does both states:
// a disc that is a sun with rays out, and becomes a moon when a second disc slides in and craters it. The knob
// travels on a spring and squashes while it is held, so the control has some give, and the new theme is revealed
// by a circle opening from the switch.
//
// Each page keeps its own theme (its own attribute on <html> and its own stored choice), so the switch is told
// which one it drives: `attr`, `storageKey`, `resolve` (the theme to use when the switch has not been touched),
// `follow` (media queries, beyond the operating system's colour scheme, that the default depends on) and `page`
// (for the analytics event). It also owns keeping <html> in step: on client-side navigations the page's inline
// gate script doesn't run, and the attribute is removed on unmount so the choice does not leak onto other pages.

const SPRING = { type: 'spring', stiffness: 700, damping: 30, mass: 0.8 };
const SOLID = 0.55; // where the wipe's gradient stops being fully opaque — keep in step with `edge`
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function AnimatedThemeSwitch({ attr, storageKey, resolve, follow = [], page, label = 'Dark theme', className = '' }) {
  const [theme, setTheme] = useState(null); // null until mounted, so server and client first render agree
  const [held, setHeld] = useState(false);
  const button = useRef(null);
  const reduced = useReducedMotion();
  const maskId = `theme-moon-mask-${useId().replace(/:/g, '')}`;
  const apply = (next) => document.documentElement.setAttribute(attr, next);
  const current = () => (document.documentElement.getAttribute(attr) === 'light' ? 'light' : 'dark');

  useEffect(() => {
    const root = document.documentElement;
    apply(resolve());
    setTheme(current());
    if (!window.matchMedia) return () => root.removeAttribute(attr);
    // Follow the default live (the operating system, and whatever else the page's default depends on), unless a
    // choice was made with the switch this visit.
    const queries = ['(prefers-color-scheme: dark)', '(prefers-color-scheme: light)', ...follow].map((q) => window.matchMedia(q));
    const sync = () => {
      apply(resolve());
      setTheme(current());
    };
    queries.forEach((q) => q.addEventListener('change', sync));
    return () => {
      queries.forEach((q) => q.removeEventListener('change', sync));
      root.removeAttribute(attr);
    };
  }, []);

  const flip = () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    track('theme_switch', { to: next, page });
    try {
      window.sessionStorage.setItem(storageKey, next);
    } catch {
      /* storage blocked — the switch still works, the OS setting wins on the next load */
    }

    const swap = () => {
      apply(next);
      setTheme(next);
    };

    // The new theme is revealed by a circle opening from the switch itself. Without view transitions
    // (or with reduced motion) it simply swaps.
    if (reduced || !document.startViewTransition) {
      swap();
      return;
    }
    const box = button.current.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const corner = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    // The mask is only fully opaque out to SOLID of its radius, so growing it to exactly the far
    // corner leaves that corner still inside the falloff when the transition ends — which reads as a
    // pop. Grow it until the opaque core alone covers the corner, with a little to spare.
    const reach = (corner / SOLID) * 1.05;
    const root = document.documentElement;
    root.dataset.themeWipe = 'on';
    const transition = document.startViewTransition(swap);
    // Between the two we tried: 760ms on a near-exponential curve snapped out too hard, 900ms on a
    // cubic one dragged. This sits in the middle on both counts.
    const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
    const duration = 820;

    // A soft-edged radial mask rather than clip-path: clip gives a hard rim travelling across the
    // page, while this gradient fades out over the last third of its radius. The circle of radius r
    // is drawn by a mask of size 2r positioned at (x - r, y - r), so size and position are animated
    // together and stay centred on the switch throughout.
    // `closest-side` matters: the default ending shape is farthest-corner, which in a square mask box
    // only reaches transparency at the corners — the inscribed circle never fades, so what travels
    // across the page is the box, not a circle. closest-side puts the last stop exactly on the
    // inscribed circle's edge.
    const edge = `radial-gradient(circle closest-side, rgba(0,0,0,1) ${SOLID * 100}%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 100%)`;
    transition.ready
      .then(() => {
        root.animate(
          {
            maskImage: [edge, edge],
            WebkitMaskImage: [edge, edge],
            maskPosition: [`${x}px ${y}px`, `${x - reach}px ${y - reach}px`],
            WebkitMaskPosition: [`${x}px ${y}px`, `${x - reach}px ${y - reach}px`],
            maskSize: ['0px 0px', `${reach * 2}px ${reach * 2}px`],
            WebkitMaskSize: ['0px 0px', `${reach * 2}px ${reach * 2}px`],
            opacity: [0.35, 1],
          },
          { duration, easing: ease, pseudoElement: '::view-transition-new(root)' }
        );
        root.animate(
          { opacity: [1, 0.45] },
          { duration, easing: ease, pseudoElement: '::view-transition-old(root)' }
        );
      })
      .catch(() => {});

    // Cleared only once the whole transition is over. Clearing it when the clip animation ends left
    // the pseudo-elements alive for a few frames without the rules below, and the browser's default
    // cross-fade ran in that gap — which is what made the theme flicker back before settling.
    transition.finished.catch(() => {}).finally(() => {
      delete root.dataset.themeWipe;
    });
  };

  const light = theme === 'light';

  return (
    <button
      type="button"
      ref={button}
      role="switch"
      aria-checked={!light}
      aria-label={label}
      className={`theme-switch${className ? ` ${className}` : ''}`}
      data-theme={theme ?? 'dark'}
      onClick={flip}
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
      onBlur={() => setHeld(false)}
    >
      {/* The two ends. The knob covers whichever one is active, so only the other is ever seen. */}
      <span className="theme-switch__end theme-switch__end--sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.8" />
          {RAYS.map((angle) => (
            <line key={angle} x1="12" y1="2.4" x2="12" y2="4.6" transform={`rotate(${angle} 12 12)`} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ))}
        </svg>
      </span>
      <span className="theme-switch__end theme-switch__end--moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </span>

      <motion.span
        className="theme-switch__knob"
        aria-hidden="true"
        layout
        initial={false}
        animate={{ scaleX: held ? 1.18 : 1, scaleY: held ? 0.84 : 1 }}
        transition={reduced ? { duration: 0 } : SPRING}
      >
        <svg viewBox="0 0 24 24" className="theme-switch__glyph">
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="24" height="24" fill="#fff" />
              {/* Slides over the disc to bite a crescent out of it. */}
              {/* The static values are the dark state, which is also what the server renders:
                  without them the first paint has no cx/cy/r at all and the browser complains. */}
              <motion.circle
                cx={17.5}
                cy={6.5}
                r={7.2}
                fill="#000"
                initial={false}
                animate={{ cx: light ? 30 : 17.5, cy: light ? -6 : 6.5 }}
                transition={reduced ? { duration: 0 } : { ...SPRING, stiffness: 420 }}
              />
            </mask>
          </defs>

          {/* The rays retract into the disc as the moon arrives. */}
          <motion.g
            initial={false}
            animate={{ rotate: light ? 0 : -55, opacity: light ? 1 : 0, scale: light ? 1 : 0.55 }}
            transition={reduced ? { duration: 0 } : { ...SPRING, stiffness: 320 }}
            style={{ transformOrigin: '12px 12px' }}
          >
            {RAYS.map((angle) => (
              <line
                key={angle}
                x1="12"
                y1="1.6"
                x2="12"
                y2="4.2"
                transform={`rotate(${angle} 12 12)`}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ))}
          </motion.g>

          <motion.circle
            cx={12}
            cy={12}
            r={7.4}
            fill="currentColor"
            mask={`url(#${maskId})`}
            initial={false}
            animate={{ r: light ? 5.2 : 7.4 }}
            transition={reduced ? { duration: 0 } : { ...SPRING, stiffness: 420 }}
          />
        </svg>
      </motion.span>
    </button>
  );
}
