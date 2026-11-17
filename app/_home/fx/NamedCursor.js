'use client';

import { useEffect, useRef } from 'react';
import { useIntroDone } from '../HomeIntro';
import { CURSOR_EFFECT } from './config';
import { createCursor } from './cursor';
import { between, measureStops } from './track';
import './fx.css';

// The homepage's named cursor (cursor.js), started once the loading curtain has lifted, on screens with
// a mouse only: phones and touch screens keep their own pointer and get nothing from this. Switched off
// altogether with CURSOR_EFFECT in config.js.
export default function NamedCursor() {
  if (!CURSOR_EFFECT) return null;
  return <CursorLayer />;
}

function CursorLayer() {
  const ready = useIntroDone();
  const overlay = useRef(null);

  useEffect(() => {
    if (!ready) return undefined;
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px)');
    if (!mouse.matches) return undefined;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    const cursor = createCursor({ overlay: overlay.current });

    // Every frame: the sections' positions, the theme, the time, for the cursor's colour and comments.
    const state = { time: 0, dt: 0, still, dark: 1, stops: [], trav: null, size: { w: 0, h: 0 } };
    let last = performance.now();
    let raf = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        return;
      }
      state.dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      state.time = now / 1000;
      state.size.w = window.innerWidth;
      state.size.h = window.innerHeight;
      state.dark = root.getAttribute('data-abt-theme') === 'light' ? 0 : 1;
      state.stops = measureStops();
      state.trav = between(state.stops, state.size.h);
      cursor.frame(state);
    };
    raf = requestAnimationFrame(loop);

    // If the window narrows to a phone's width (or the mouse goes), hand the pointer back.
    const change = () => {
      if (!mouse.matches) stop();
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      mouse.removeEventListener('change', change);
      cursor.destroy();
      overlay.current?.replaceChildren();
    };
    mouse.addEventListener('change', change);
    return stop;
  }, [ready]);

  return <div ref={overlay} className="fx-overlay" aria-hidden="true" />;
}
