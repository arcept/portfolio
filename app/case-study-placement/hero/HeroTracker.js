'use client';

import { useRef } from 'react';
import HeroBackdrop from '@/components/case-study-kit/HeroBackdrop';
import ShaderField from '../../case-study-cro/ShaderField';
import { FIGURES, FIGURES_NOTE, JOBS, Eligible, JobCard, Toast, Tracker, updateFor, useHeroCopy, useLive, useTick } from './parts';
import { addDepth, countTo, gsap, playWords, prefersStill, useIsoLayoutEffect } from './motion';

// A · Tracker. The CRO hero's build in the product's own blue: the words on the left in Fraunces, and on the right
// a collage of the portal's pieces at their own depths: the job card at the back, the application tracker in the
// middle, the eligibility stamp and the updates in front. After the entrance the tracker keeps working: an
// application moves through its stages, an update arrives at each, and once it's accepted the next one starts.
// Under the collage, three figures from Launch and measurement (illustrative there, so here too).
// Behind it all, a status board: a field of dots, a path through them lit by a pulse travelling to the collage.

const BLUE = ['#3d6bff', '#2147e0', '#0a1650', '#08090a'];

// The board: dots on a grid, faintly flickering; a path rising from the bottom left to the collage, its dots lit by
// a pulse that travels along it; the dots near the pointer brighter.
const BOARD = `
precision highp float;
varying vec2 vUv;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_pointerAmt;
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_strength;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pathY(float x, float t) { return 0.12 + 0.5 * smoothstep(0.0, 1.0, x) + 0.03 * sin(x * 7.0 + t * 0.4); }
void main() {
  float cell = max(u_res.x / 70.0, 14.0);
  vec2 g = vUv * u_res / cell;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  vec2 c = (id + 0.5) * cell / u_res;
  float ratio = u_res.x / u_res.y;
  float t = u_time;

  float dotMask = 1.0 - smoothstep(0.09, 0.09 + 1.6 / cell, length(f));
  float base = 0.08 + 0.1 * step(0.93, hash(id + floor(t * 0.6)));

  float dy = (c.y - pathY(c.x, t)) * (1.0 / ratio) * 2.2;
  float onPath = exp(-dy * dy * 900.0);
  float head = fract(t * 0.07) * 1.4 - 0.2;
  float behind = head - c.x;
  float pulse = smoothstep(0.42, 0.0, behind) * step(0.0, behind);
  float lit = onPath * (0.28 + 0.72 * pulse);

  vec2 m = u_pointer / u_res;
  vec2 dm = (c - m) * vec2(ratio, 1.0);
  float near = u_pointerAmt * exp(-dot(dm, dm) * 22.0);

  float fade = smoothstep(0.0, 0.25, c.y) * mix(0.55, 1.0, c.x);
  float a = dotMask * (base + lit * 0.95 + near * 0.45) * fade * u_strength;
  vec3 col = mix(u_ink, u_accent, clamp(lit * 1.4 + near, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}
`;

const PALETTE = {
  dark: { ink: '#7f99ff', accent: '#e3eaff', strength: 0.95 },
  light: { ink: '#3557e8', accent: '#1d44f0', strength: 0.75 },
};

export default function HeroTracker({ facts, actions }) {
  const root = useRef(null);
  const copy = useHeroCopy();

  // The application under way: seven beats each, the six stages and a beat to see it accepted, starting midway.
  const live = useLive(root);
  const tick = useTick(live, 1900, 2800) + 2;
  const run = Math.floor(tick / 7);
  const beat = tick % 7;
  const stage = Math.min(beat, 5);
  const job = JOBS[run % JOBS.length];
  const updates = [stage, stage - 1].filter((s) => s >= 0);

  useIsoLayoutEffect(() => {
    if (prefersStill()) return undefined;
    const el = root.current;
    let split;
    let mm;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      split = playWords(tl, el);
      tl.from('[data-in="job"]', { autoAlpha: 0, x: 60, rotate: 4, duration: 1.2, ease: 'expo.out' }, 0.35)
        .from('[data-in="tracker"]', { autoAlpha: 0, y: 90, duration: 1.3, ease: 'expo.out' }, 0.5)
        .from('.phx-tracker__list li', { autoAlpha: 0, x: -12, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, 0.9)
        .from('[data-in="eligible"]', { autoAlpha: 0, scale: 0.6, rotate: -8, duration: 0.8, ease: 'back.out(2)' }, 1.35)
        .from('[data-in="toast"]', { autoAlpha: 0, y: -30, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, 1.5)
        .from('[data-fig]', { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 1.6);
      el.querySelectorAll('[data-count]').forEach((num, i) => {
        const f = FIGURES[i];
        tl.add(countTo(num, { from: f.from, to: f.to, decimals: f.decimals, suffix: f.suffix, duration: 1.5 }), 1.7 + i * 0.12);
      });
      mm = addDepth(el);
    }, el);
    return () => {
      ctx.revert();
      mm?.revert();
      split?.revert();
    };
  }, []);

  return (
    <header className="phx-hero ph-hero phx-a" ref={root}>
      <div className="phx-a__bg" aria-hidden="true">
        <HeroBackdrop colors={BLUE} />
        <ShaderField fragment={BOARD} palette={PALETTE} />
      </div>
      <div className="wrap wrap--wide phx-a__wrap">
        <a className="phx-back" href="/" data-eyebrow>
          ← {copy.back}
        </a>
        <div className="phx-a__grid">
          <div className="phx-a__copy">
            <h1 className="phx-a__h1" data-title>
              {copy.title} <em>{copy.turn}</em>
            </h1>
            <p className="phx-sub" data-rise>
              {copy.sub}
            </p>
            <p className="phx-intro" data-rise>
              {copy.intro}
            </p>
            <div className="phx-actions" data-rise>
              {actions}
            </div>
            <div className="phx-facts" data-rise>
              {facts}
            </div>
          </div>

          <figure className="phx-a__stage" aria-hidden="true">
            <div className="phx-a__layer is-job" data-depth="0.35">
              <div data-in="job">
                <JobCard hours={36 - (tick % 12)} />
              </div>
            </div>
            <div className="phx-a__layer is-tracker" data-depth="0.7">
              <div data-in="tracker">
                <Tracker job={job} stage={stage} className={beat === 6 ? 'is-placed' : ''} />
              </div>
            </div>
            <div className="phx-a__layer is-eligible" data-depth="1.05">
              <div data-in="eligible">
                <Eligible />
              </div>
            </div>
            <div className="phx-a__layer is-toasts" data-depth="1.2">
              {updates.map((s, i) => (
                <div key={`${run}-${s}`} data-in="toast" className={i ? 'is-old' : 'is-new'}>
                  <Toast text={updateFor(s, job)} time={i ? '2 days ago' : 'Just now'} tone={s === 5 ? 'green' : 'blue'} />
                </div>
              ))}
            </div>
          </figure>
        </div>

        <div className="phx-a__figs">
          <ol>
            {FIGURES.map((f) => (
              <li key={f.label} data-fig>
                <span className="phx-a__fig-label">{f.label}</span>
                <strong data-count>
                  {f.to}
                  {f.suffix}
                </strong>
                <span className="phx-a__fig-was">was {f.was}</span>
              </li>
            ))}
          </ol>
          <p data-fig>{FIGURES_NOTE}</p>
        </div>
      </div>
    </header>
  );
}
