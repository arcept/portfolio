'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { gsap } from 'gsap';
import useScrollTimeline from '@/app/_home/useScrollTimeline';
import HeroRipple from './fx/HeroRipple';
import { HERO_RIPPLE } from './fx/config';
import './workbench.css';

// The hero's working bench (Hero.js puts it in place): a quiet design-tool frame round the portrait
// (faint dots behind, the portrait as a selected frame with its real size), and two of Manik's side projects tucked behind its edges: Magpiary's magpie on its search
// line (top left) and PushDeck, the Push 2 as a Mac controller and display (bottom right). They carry
// no labels and are not links; they answer the pointer instead. Both tilt towards it, PushDeck's pads
// light under it, a click wakes PushDeck (its display plays and the pads put on a light show) and a
// click sends the magpie flying off and back to land. As the hero scrolls away they slip back behind
// the portrait.
const EASE = [0.16, 1, 0.3, 1];
const CLOSE_BY = 0.3; // the objects are back behind the portrait by this much of the hero's scroll

// The selection frame round the portrait (outline, handles, its name and size). Off while trying the
// hero without it; true brings it back.
const SHOW_FRAME = false;

// The objects come first, so the portrait paints over them; the frame sits on top of it.
export function Around(props) {
  return (
    <>
      <Objects {...props} />
      {SHOW_FRAME && <Selection {...props} />}
    </>
  );
}

// A delay for a part's entrance, as a CSS variable (workbench.css adds it to the shared start time).
const at = (s) => ({ '--d': `${s}s` });

/* ---------------------------------------------------------------- The canvas (backdrop) */

// Full-bleed behind the poster: the faint dots. Nothing else. With HERO_RIPPLE on (fx/config.js) the
// dots are live (fx/HeroRipple.js), the CSS ones staying underneath in case WebGL isn't there.
export function Canvas({ ready }) {
  return (
    <div className={`hxw-canvas${ready ? ' is-on' : ''}`} aria-hidden="true">
      {HERO_RIPPLE && <HeroRipple />}
      <div className="hxw-dots" />
    </div>
  );
}

/* ---------------------------------------------------------------- The selection (around) */

// A box laid exactly over the portrait (same width rule, same 3:4), carrying the selection outline,
// its handles, the frame's name and real size. It
// shrinks with the portrait as the hero scrolls away: in CSS where the browser ties animations to
// the scroll (hero.css), otherwise from `progress`, as Portrait.js does.
function Selection({ ready, progress }) {
  const css = useScrollTimeline();
  const scale = useTransform(progress, [0, 1], [1, 0.6]);
  const box = useRef(null);
  const [size, setSize] = useState(null);

  // The frame's real size and the real gap between the portrait and the headline, measured, so the
  // labels never lie. Layout sizes (offset*), so the scroll's scaling doesn't change them.
  useLayoutEffect(() => {
    const el = box.current;
    const stage = el.parentElement;
    const title = stage.parentElement.querySelector('.hx-i-title');
    const measure = () => {
      const gap = title ? title.offsetTop - stage.offsetTop - stage.offsetHeight : 0;
      setSize({ w: el.offsetWidth, h: el.offsetHeight, gap: Math.max(0, gap) });
    };
    measure();
    document.fonts?.ready.then(measure);
    const watch = new ResizeObserver(measure);
    watch.observe(stage.parentElement);
    return () => watch.disconnect();
  }, []);

  return (
    <motion.div
      ref={box}
      className={`hxw-sel${ready ? ' is-on' : ''}`}
      style={{ ...(css ? {} : { scale }), '--gap': size ? `${size.gap}px` : undefined }}
      aria-hidden="true"
    >
      <span className="hxw-sel__edge hxw-sel__edge--t" style={at(0)} />
      <span className="hxw-sel__edge hxw-sel__edge--r" style={at(0.12)} />
      <span className="hxw-sel__edge hxw-sel__edge--b" style={at(0.24)} />
      <span className="hxw-sel__edge hxw-sel__edge--l" style={at(0.36)} />
      {['tl', 'tr', 'br', 'bl'].map((c, i) => (
        <span key={c} className={`hxw-sel__handle hxw-sel__handle--${c}`} style={at(0.45 + i * 0.06)} />
      ))}

      <span className="hxw-sel__tag hxw-fade" style={at(0.55)}>
        <span className="hxw-sel__name">Manik / portrait</span>
        {size && (
          <span className="hxw-sel__size">
            W {size.w} × H {size.h}
          </span>
        )}
      </span>

    </motion.div>
  );
}

/* ---------------------------------------------------------------- The side projects (around) */

// The two objects, both kept on a phone.
const ITEMS = [
  { key: 'pushdeck', name: 'PushDeck', line: 'An Ableton Push 2 as a Mac controller and display', phone: true },
  { key: 'magpiary', name: 'Magpiary', line: 'A private library for everything you save', phone: true },
];

function Objects({ ready, progress }) {
  const ref = useRef(null);
  useTilt(ref);
  // 0 out in place, 1 slipped back behind the portrait (over the first part of the scroll).
  const tuck = useTransform(progress, (p) => Math.min(1, p / CLOSE_BY));

  return (
    <motion.ul ref={ref} className="hxw-objs" aria-label="Side projects" style={{ '--tuck': tuck }}>
      {ITEMS.map((item, i) => (
        <motion.li
          key={item.key}
          className={`hxw-obj hxw-obj--${item.key}${item.phone ? ' is-phone' : ''}`}
          aria-label={`${item.name}: ${item.line}`}
          initial={{ opacity: 0, y: 28 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, ease: EASE, delay: 1 + i * 0.12 }}
        >
          <div className="hxw-obj__tilt">
            <div className="hxw-obj__thing">{THINGS[item.key]}</div>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

const THINGS = {
  pushdeck: <Pads />,
  magpiary: (
    <div className="hxw-mag">
      <Magpie />
      <div className="hxw-mag__search">
        <Symbol />
        <span>Search what was said, shown or written</span>
      </div>
    </div>
  ),
};

// Magpiary's symbol (from its brand files), inline so its dark half can follow the theme.
function Symbol() {
  return (
    <svg className="hxw-mag__sym" viewBox="0 0 256 256" aria-hidden="true">
      <path
        fill="#FF2E93"
        fillRule="evenodd"
        d="M207.35 77.86 L172.08 65.02 L171.85 57.5 L170.65 51.04 L169.3 46.87 L167.52 42.87 L164.08 37.26 L161.33 33.86 L158.23 30.76 L153.01 26.76 L149.22 24.56 L145.21 22.78 L138.91 20.92 L134.58 20.23 L130.2 20 L123.65 20.52 L119.37 21.43 L115.2 22.78 L111.19 24.56 L107.4 26.76 L102.18 30.76 L99.08 33.86 L96.32 37.26 L93.94 40.94 L91.95 44.84 L89.53 51.98 L98.29 52.57 L105.86 54.38 L113.05 57.36 L119.68 61.43 L123.72 64.7 L129.07 70.34 L132.12 74.54 L134.72 79.04 L136.83 83.78 L138.44 88.72 L139.51 93.79 L140.07 99.27 L172.08 110.93 L172.08 90.69Z M140.12 135.77 L140.12 164.37 L172.08 196.33 L172.08 124.14Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M132.41 236 L132.41 130.37 L167.67 117.53 L132.41 104.7 L132.35 99.36 L131.49 92.84 L130.36 88.61 L127.84 82.54 L124.41 76.94 L121.65 73.53 L116.89 69.01 L113.34 66.43 L109.54 64.24 L105.54 62.45 L101.37 61.1 L97.08 60.19 L90.53 59.67 L86.15 59.9 L81.82 60.59 L77.59 61.72 L73.5 63.29 L67.72 66.43 L62.51 70.43 L57.99 75.2 L54.26 80.61 L52.27 84.52 L50.08 90.71 L49.17 95 L48.65 101.55 L48.65 236 L90.53 194.12Z M101.69 102.79 L98.24 118.08 L94.8 102.79 L79.51 99.35 L94.8 95.9 L98.24 80.61 L101.69 95.9 L116.98 99.35Z"
      />
      <path fill="#FF2E93" d="M101.69 102.79 L98.24 118.08 L94.8 102.79 L79.51 99.35 L94.8 95.9 L98.24 80.61 L101.69 95.9 L116.98 99.35Z" />
    </svg>
  );
}

// PushDeck: the device, with the Push 2's display strip over its 8 × 8 pads, a live miniature.
// At rest the screen is dark and a diagonal band of light sweeps slowly across the pads, a step every
// half second (CSS fades between steps); the timer stops when the device is off screen or the tab is
// hidden. A click (or tap) wakes it: the screen plays the real recording of PushDeck's display (a
// Claude session at work, muted) while the pads run a light show, a burst from the centre and then a
// rainbow wave; when the recording ends the screen dims and the sweep comes back. With reduced motion
// the band holds still, and a click lights the screen with a still of the display and every pad, then
// dims them again. The pointer brightening is done in useTilt.
const SIZE = 8;
const STEP = 520;
const SWEEP = 2 * SIZE + 4; // diagonals plus a short rest before the band comes round again
const SHOW_STEP = 90; // ms per frame of the light show
const MID = (SIZE - 1) / 2;

// The light show, as frames: each a function from a pad's row and column to how lit it is (0 to 1).
const SHOW = [
  // the burst: a ring running out from the centre
  ...Array.from({ length: 7 }, (_, k) => (r, c) => {
    const gap = Math.abs(Math.hypot(r - MID, c - MID) - k * 0.85);
    return gap < 0.7 ? 1 : gap < 1.5 ? 0.4 : 0;
  }),
  // the rainbow wave: every pad in its column's colour, a bright crest rolling across corner to corner
  ...Array.from({ length: 18 }, (_, k) => (r, c) => 0.22 + 0.78 * Math.max(0, Math.cos((r + c - k * 1.1) * 0.7))),
  // and out
  () => 0.1,
  () => 0,
];

function Pads() {
  const grid = useRef(null);
  const video = useRef(null);
  const ctl = useRef(null);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const pads = [...grid.current.children];
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const set = (fn) => pads.forEach((pad, i) => pad.style.setProperty('--on', String(fn(Math.floor(i / SIZE), i % SIZE))));
    const band = (t) => (r, c) => {
      const gap = Math.abs(r + c - t);
      return gap < 1 ? 1 : gap < 2 ? 0.45 : gap < 3 ? 0.18 : 0;
    };
    let t = 0;
    let timer = 0;
    let seen = false;
    let showing = false;
    let frames = [];
    const sync = () => {
      const run = seen && !document.hidden && !showing && !still;
      if (run && !timer) timer = window.setInterval(() => set(band((t = (t + 1) % SWEEP))), STEP);
      if (!run && timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };
    set(band(still ? 7 : t));
    const watch = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      sync();
    });
    watch.observe(grid.current);
    document.addEventListener('visibilitychange', sync);

    // The light show: the sweep stops, the pads switch to quick fades, the frames play, then the
    // sweep picks up again.
    const show = () => {
      if (showing) return;
      showing = true;
      sync();
      grid.current.classList.add('is-show');
      const run = still ? [() => 1, () => 1, () => 1, () => 1, () => 1, () => 1, () => 1, () => 1, () => 1, () => 1, () => 0] : SHOW;
      const step = still ? 400 : SHOW_STEP;
      frames = run.map((fn, k) => window.setTimeout(() => set(fn), k * step));
      frames.push(
        window.setTimeout(() => {
          grid.current?.classList.remove('is-show');
          showing = false;
          set(band(still ? 7 : t));
          sync();
        }, run.length * step + 120),
      );
    };
    ctl.current = { show, still };
    return () => {
      watch.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.clearInterval(timer);
      frames.forEach(window.clearTimeout);
    };
  }, []);

  // A click: the light show, and the screen wakes. With motion it plays the recording to its end;
  // without, it shows a still for a few seconds.
  const wake = () => {
    const c = ctl.current;
    if (!c || awake) return;
    setAwake(true);
    c.show();
    const v = video.current;
    if (c.still || !v) {
      window.setTimeout(() => setAwake(false), 4000);
      return;
    }
    v.currentTime = 0;
    v.play().catch(() => window.setTimeout(() => setAwake(false), 4000));
  };

  return (
    <button type="button" className={`hxw-pd${awake ? ' is-awake' : ''}`} onClick={wake} aria-label="Wake PushDeck">
      <span className="hxw-pd__screen">
        <video
          ref={video}
          src="/home/hero/pushdeck/claude.mp4"
          poster="/home/hero/pushdeck/claude-poster.jpg"
          muted
          playsInline
          preload="none"
          onEnded={() => setAwake(false)}
        />
      </span>
      <span ref={grid} className="hxw-pads__grid">
        {Array.from({ length: SIZE * SIZE }, (_, i) => (
          <span key={i} className="hxw-pad" style={{ '--c': `var(--hxw-pad-${i % SIZE})` }} />
        ))}
      </span>
    </button>
  );
}

// The cursor effect. With a mouse (and motion allowed), each object within reach of the pointer
// tilts a few degrees towards it in 3D, more the closer it is, and settles back as the pointer
// leaves. The pads under the pointer brighten. One listener on the hero, one frame loop that stops
// when everything has settled; values go straight to CSS variables, never through React.
const REACH = 300; // px from an object's centre where the tilt starts
const MAX = 7; // degrees at the closest

function useTilt(ref) {
  useEffect(() => {
    const list = ref.current;
    const hero = list?.closest('.hx-i-hero');
    if (!list || !hero) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const objs = [...list.querySelectorAll('.hxw-obj__tilt')].map((el) => ({ el, rx: 0, ry: 0, k: 0 }));
    const pads = [...list.querySelectorAll('.hxw-pad')];
    let px = null;
    let py = null;
    let raf = 0;
    let hot = -1;

    const frame = () => {
      raf = 0;
      let busy = false;
      for (const o of objs) {
        let trx = 0;
        let try_ = 0;
        let tk = 0;
        if (px !== null) {
          const r = o.el.getBoundingClientRect();
          const dx = px - (r.left + r.width / 2);
          const dy = py - (r.top + r.height / 2);
          const k = Math.max(0, 1 - Math.hypot(dx, dy) / REACH);
          if (k > 0) {
            tk = k;
            try_ = Math.max(-1, Math.min(1, dx / (r.width / 2 + 40))) * MAX * k;
            trx = -Math.max(-1, Math.min(1, dy / (r.height / 2 + 40))) * MAX * k;
          }
        }
        o.rx += (trx - o.rx) * 0.12;
        o.ry += (try_ - o.ry) * 0.12;
        o.k += (tk - o.k) * 0.12;
        if (Math.abs(trx - o.rx) + Math.abs(try_ - o.ry) + Math.abs(tk - o.k) > 0.01) busy = true;
        o.el.style.setProperty('--rx', `${o.rx.toFixed(2)}deg`);
        o.el.style.setProperty('--ry', `${o.ry.toFixed(2)}deg`);
        o.el.style.setProperty('--lift', o.k.toFixed(3));
      }
      lightPads();
      if (busy) raf = window.requestAnimationFrame(frame);
    };

    // Which pad the pointer is over; that one and its neighbours brighten, fading out by CSS.
    const lightPads = () => {
      let next = -1;
      if (px !== null && pads.length) {
        const grid = pads[0].parentElement.getBoundingClientRect();
        const c = Math.floor(((px - grid.left) / grid.width) * SIZE);
        const r = Math.floor(((py - grid.top) / grid.height) * SIZE);
        if (c >= 0 && c < SIZE && r >= 0 && r < SIZE) next = r * SIZE + c;
      }
      if (next === hot) return;
      hot = next;
      pads.forEach((pad, i) => {
        let h = 0;
        if (hot >= 0) {
          const d = Math.max(Math.abs(Math.floor(i / SIZE) - Math.floor(hot / SIZE)), Math.abs((i % SIZE) - (hot % SIZE)));
          h = d === 0 ? 1 : d === 1 ? 0.5 : 0;
        }
        pad.style.setProperty('--hot', String(h));
      });
    };

    const wake = () => {
      if (!raf) raf = window.requestAnimationFrame(frame);
    };
    const move = (e) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      wake();
    };
    const leave = () => {
      px = null;
      py = null;
      wake();
    };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    return () => {
      window.cancelAnimationFrame(raf);
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
    };
  }, [ref]);
}

// Magpiary's magpie, from the Magpiary site's own frames: flapping (a, b, c), coming in (d), landing
// (l1, l2, l3) and perched (e), stacked and shown one at a time. A click sends it off: it flaps up and
// away over the portrait and out of the hero, then, after a moment, flies back in from the left and
// lands where it was, as the Magpiary site's bird does. While it flies its object is lifted above
// the portrait. With reduced motion it gives a small hop instead.
const FRAMES = ['a', 'b', 'c', 'd', 'l1', 'l2', 'l3', 'e'];
const PERCH = FRAMES.length - 1;

function Magpie() {
  const ref = useRef(null);
  const busy = useRef(false);

  const show = (i) => ref.current?.querySelectorAll('img').forEach((f, k) => (f.style.opacity = k === i ? '1' : '0'));

  useEffect(() => {
    show(PERCH);
    return () => gsap.killTweensOf(ref.current);
  }, []);

  const fly = () => {
    const b = ref.current;
    if (!b || busy.current) return;
    busy.current = true;
    const holder = b.closest('.hxw-obj');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.timeline({ onComplete: () => (busy.current = false) }).to(b, { y: -10, duration: 0.18, ease: 'power1.out' }).to(b, { y: 0, duration: 0.3, ease: 'bounce.out' });
      return;
    }
    const box = b.getBoundingClientRect();
    const o = { i: 0 };
    const flap = gsap.to(o, { i: 3, duration: 0.3, repeat: -1, ease: 'none', paused: true, onUpdate: () => show(Math.min(2, Math.floor(o.i))) });
    gsap.set(b, { transformOrigin: '50% 100%' });
    holder.classList.add('is-flying');
    const T = 1.5;
    gsap
      .timeline({ onComplete: () => { busy.current = false; holder.classList.remove('is-flying'); } })
      // A crouch, then off: a short climb and away to the right, across the top of the portrait and out
      // of the hero.
      .to(b, { scaleY: 0.92, scaleX: 1.04, duration: 0.12, ease: 'power1.in' })
      .add(() => { show(3); })
      .add(() => flap.play(), '+=0.05')
      .to(b, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'back.out(2)' }, '<')
      .to(b, { x: window.innerWidth - box.left + 80, duration: 1.7, ease: 'power1.in' }, '<')
      .to(b, { y: -Math.min(box.top + box.height * 0.3, 130), rotation: -6, duration: 1.7, ease: 'sine.out' }, '<')
      .add(() => { flap.pause(); gsap.set(b, { opacity: 0 }); })
      // Back, a moment later, in from the left and down onto its line.
      .add(() => {
        gsap.set(b, { x: -(box.left + box.width + 60), y: -window.innerHeight * 0.3, rotation: -5, opacity: 1 });
        flap.play();
      }, '+=0.9')
      .to(b, { x: 0, duration: T, ease: 'power2.out' })
      .to(b, { y: 0, duration: T, ease: 'power1.inOut' }, '<')
      .to(b, { rotation: 0, duration: 0.35, ease: 'sine.out' }, `<${T - 0.45}`)
      .add(() => { flap.kill(); show(3); }, `<${0.11}`)
      .add(() => show(4), '+=0.14')
      .add(() => show(5), '+=0.14')
      .add(() => show(6), '+=0.14')
      .add(() => show(PERCH), '+=0.12')
      .to(b, { scaleY: 0.95, scaleX: 1.03, duration: 0.1, ease: 'power1.out' }, '<-0.16')
      .to(b, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'back.out(2.5)' });
  };

  return (
    <button type="button" ref={ref} className="hxw-bird" onClick={fly} aria-label="Make the magpie fly">
      {FRAMES.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={f} src={`/home/hero/bird/${f}.webp`} alt="" draggable="false" />
      ))}
    </button>
  );
}
