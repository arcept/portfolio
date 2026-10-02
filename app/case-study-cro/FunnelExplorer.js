'use client';

import { useRef, useState } from 'react';
import { EASE_MOVE, ScrollTrigger, countTo, formatNum, gsap, prefersStill, useIsoLayoutEffect } from './gsap';
import { WEEKS } from './content';

// Chapter 04: the original report's three weeks, explorable. Pick a week and its funnel redraws: visitors,
// those who started the form, those who submitted it, each as a bar against the busiest week's visitors,
// with the share of visitors beside it. A small chart follows the two rates across the three weeks, the
// chosen week marked. A week with a change (content.js) shows it against the week before: week 3, the report's
// comparison with week 2, and week 4 against week 3. Unique users.

// The week shown first: the report's comparison.
const REPORTED = WEEKS.findIndex((w) => w.first);
const MAX = Math.max(...WEEKS.map((w) => w.visitors));
const ROWS = [
  { key: 'visitors', label: 'Visitors' },
  { key: 'starters', label: 'Started the form', rate: 'startRate' },
  { key: 'submissions', label: 'Submitted it', rate: 'submitRate' },
];

// The rates chart, in its own units: x by week, y 0–30%.
const W = 320;
const H = 150;
const PAD = { l: 8, r: 8, t: 16, b: 26 };
const xAt = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / (WEEKS.length - 1);
const yAt = (v) => PAD.t + (1 - v / 30) * (H - PAD.t - PAD.b);
const line = (key) => WEEKS.map((w, i) => `${i ? 'L' : 'M'}${xAt(i)},${yAt(w[key])}`).join(' ');

export default function FunnelExplorer({ caption }) {
  const root = useRef(null);
  const [week, setWeek] = useState(REPORTED);
  const shown = useRef(false);

  // The bars and their numbers follow the chosen week.
  const draw = (i, animate) => {
    const el = root.current;
    const w = WEEKS[i];
    const dur = animate ? 0.9 : 0;
    ROWS.forEach(({ key, rate }) => {
      gsap.to(el.querySelector(`[data-bar="${key}"]`), { scaleX: w[key] / MAX, duration: dur, ease: EASE_MOVE, overwrite: true });
      const num = el.querySelector(`[data-num="${key}"]`);
      const from = Number(num.dataset.value || 0);
      num.dataset.value = w[key];
      if (animate) countTo(num, { from, to: w[key], duration: dur });
      else num.textContent = formatNum(w[key]);
      if (rate) el.querySelector(`[data-rate="${key}"]`).textContent = `${formatNum(w[rate], 2)}%`;
    });
    gsap.to(el.querySelector('[data-mark]'), { x: xAt(i), duration: dur, ease: EASE_MOVE, overwrite: true });
  };

  useIsoLayoutEffect(() => {
    const el = root.current;
    gsap.set(el.querySelectorAll('[data-bar]'), { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(el.querySelector('[data-mark]'), { x: xAt(REPORTED) });
    if (prefersStill()) {
      draw(REPORTED, false);
      shown.current = true;
      return undefined;
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          shown.current = true;
          draw(REPORTED, true);
          gsap.from(el.querySelectorAll('[data-line]'), { strokeDashoffset: 1, duration: 1.4, ease: EASE_MOVE, stagger: 0.15 });
          gsap.from(el.querySelectorAll('[data-dot]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.08, delay: 0.6 });
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const choose = (i) => {
    setWeek(i);
    if (shown.current) draw(i, !prefersStill());
  };

  return (
    <figure className="cro-funnel" ref={root}>
      <div className="cro-funnel__weeks" role="group" aria-label="Week">
        {WEEKS.map((w, i) => (
          <button key={w.label} type="button" aria-pressed={week === i} onClick={() => choose(i)}>
            {w.label}
          </button>
        ))}
      </div>

      <div className="cro-funnel__body">
        <dl className="cro-funnel__rows">
          {ROWS.map(({ key, label, rate }) => (
            <div key={key} className={`cro-funnel__row is-${key}`}>
              <dt>{label}</dt>
              <dd>
                <span className="cro-funnel__track">
                  <span className="cro-funnel__bar" data-bar={key} />
                </span>
                <span className="cro-funnel__nums">
                  <strong data-num={key}>{formatNum(WEEKS[REPORTED][key])}</strong>
                  {rate && <span data-rate={key}>{`${formatNum(WEEKS[REPORTED][rate], 2)}%`}</span>}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="cro-funnel__trend">
          <p className="cro-funnel__trend-label">Rates across the weeks</p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Form start rate: ${WEEKS.map((w) => `${w.startRate}%`).join(', ')}. Submission rate: ${WEEKS.map((w) => `${w.submitRate}%`).join(', ')}.`}>
            <line className="cro-funnel__mark" data-mark x1="0" x2="0" y1={PAD.t - 8} y2={H - PAD.b + 4} />
            {[10, 20, 30].map((v) => (
              <line key={v} className="cro-funnel__grid" x1={PAD.l} x2={W - PAD.r} y1={yAt(v)} y2={yAt(v)} />
            ))}
            <path className="cro-funnel__line is-start" data-line d={line('startRate')} pathLength="1" />
            <path className="cro-funnel__line is-submit" data-line d={line('submitRate')} pathLength="1" />
            {WEEKS.map((w, i) => (
              <g key={w.label}>
                <circle className="cro-funnel__dot is-start" data-dot cx={xAt(i)} cy={yAt(w.startRate)} r="3.5" />
                <circle className="cro-funnel__dot is-submit" data-dot cx={xAt(i)} cy={yAt(w.submitRate)} r="3.5" />
                <text className="cro-funnel__tick" x={xAt(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === WEEKS.length - 1 ? 'end' : 'middle'}>
                  {w.label}
                </text>
              </g>
            ))}
          </svg>
          <p className="cro-funnel__legend">
            <span className="is-start">Started the form</span>
            <span className="is-submit">Submitted it</span>
          </p>
        </div>
      </div>

      <div className="cro-funnel__change" aria-live="polite">
        {WEEKS[week].change ? (
          <dl>
            {WEEKS[week].change.map((c, k, all) => (
              <div key={c.label} className={k === all.length - 1 ? 'is-end' : undefined}>
                <dt>{c.label}</dt>
                <dd>
                  <strong>{c.value}</strong>
                  <span>{c.sub}</span>
                  <span className="cro-funnel__against">against {WEEKS[week - 1].label.toLowerCase()}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>The report compares week 3 with week 2, and week 4 follows on from week 3. Choose either to see its change.</p>
        )}
      </div>

      <table className="sr-only">
        <caption>Visitors, form starts and submissions by week, unique users</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Visitors</th>
            <th scope="col">Started the form</th>
            <th scope="col">Submitted it</th>
            <th scope="col">Form start rate</th>
            <th scope="col">Submission rate</th>
          </tr>
        </thead>
        <tbody>
          {WEEKS.map((w) => (
            <tr key={w.label}>
              <th scope="row">{w.label}</th>
              <td>{formatNum(w.visitors)}</td>
              <td>{formatNum(w.starters)}</td>
              <td>{formatNum(w.submissions)}</td>
              <td>{w.startRate}%</td>
              <td>{w.submitRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="cro-funnel__caption">{caption}</figcaption>
    </figure>
  );
}
