'use client';

import HeroFacts from '@/components/case-study-kit/HeroFacts';
import { HERO, RESULT } from './content';
import { EASE_IN, SplitText, countTo, formatNum } from './gsap';

// The pieces every hero option shares: the title and its copy, the reported week as three numbers
// under the journey's steps, the facts, and the note that says what the comparison can and can't tell us.

export function Heading({ className = '' }) {
  return (
    <>
      <a className="cro-back" href="/" data-eyebrow>
        ← Back to all work
      </a>
      <h1 className={`cro-h1 ${className}`} data-title>
        {HERO.title} <em>{HERO.titleEm}</em>
      </h1>
    </>
  );
}

export function Copy({ className = '' }) {
  return (
    <div className={`cro-hero__copy ${className}`}>
      <p className="cro-hero__sub" data-rise>
        {HERO.subtitle}
      </p>
      <p className="cro-hero__intro" data-rise>
        {HERO.intro}
      </p>
      {/* As on Placement Hub: the way in, then the other two ways to take the story. The last two are placeholders
          (neither the narration nor the 2-minute version exists yet), so they do nothing until they're built. */}
      <div className="cro-hero__actions" data-rise>
        <a className="btn btn--rainbow-outline cro-cta" href="#brief">
          Explore the story ↓
        </a>
        <button type="button" className="btn btn--tertiary cro-listen" aria-disabled="true">
          <WaveIcon />
          <span className="cro-listen__label">Listen to the short version</span>
          <span className="cro-listen__time">Soon</span>
        </button>
        <button type="button" className="btn btn--tertiary btn--rainbow-text cro-read" aria-disabled="true">
          Read the 2-minute version
        </button>
      </div>
    </div>
  );
}

// The narration's sound wave, as Placement Hub's "Listen" button draws it (components/narration/NarrationUI.js).
function WaveIcon() {
  return (
    <svg className="cro-listen__wave" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {[[2, 7], [5.5, 12], [9, 15], [12.5, 10], [16, 6]].map(([x, h]) => (
        <rect key={x} x={x - 0.9} y={9 - h / 2} width="1.8" height={h} rx="0.9" />
      ))}
    </svg>
  );
}

// The words' entrance on `tl`: the hero shows, the eyebrow fades in, the title rises line by line out
// of its mask, then the copy and the facts. Returns the split, for the caller to revert.
export function playWords(tl, el) {
  const split = SplitText.create(el.querySelector('[data-title]'), { type: 'lines', mask: 'lines', linesClass: 'cro-line' });
  tl.set(el, { autoAlpha: 1 })
    .from(el.querySelectorAll('[data-eyebrow]'), { autoAlpha: 0, y: 10, duration: 0.6, ease: EASE_IN }, 0)
    .from(split.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.11 }, 0.08)
    .from(el.querySelectorAll('[data-rise]'), { autoAlpha: 0, y: 24, duration: 0.9, ease: EASE_IN, stagger: 0.08 }, 0.45)
    .from(el.querySelectorAll('.ph-facts__lead > div, .ph-facts__toggle'), { autoAlpha: 0, y: 14, duration: 0.7, ease: EASE_IN, stagger: 0.06 }, 0.65);
  return split;
}


export const STEPS = [
  { label: 'Unique visitors', value: -7.31, decimals: 2, suffix: '%', sub: '2,613 → 2,422', tone: 'down' },
  {
    label: RESULT.rates[0].label,
    value: RESULT.rates[0].to,
    from: RESULT.rates[0].from,
    decimals: 2,
    suffix: '%',
    sub: `from ${RESULT.rates[0].from}% · ${RESULT.rates[0].change}`,
  },
  {
    label: RESULT.rates[1].label,
    value: RESULT.rates[1].to,
    from: RESULT.rates[1].from,
    decimals: 2,
    suffix: '%',
    sub: `from ${RESULT.rates[1].from}% · ${RESULT.rates[1].change}`,
    end: true,
  },
];

export function Steps() {
  return (
    <ol className="cro-steps" aria-label="The reported week, against the week before">
      {STEPS.map((step) => (
        <li key={step.label} className={`cro-step${step.end ? ' is-end' : ''}${step.tone === 'down' ? ' is-down' : ''}`} data-step>
          <span className="cro-step__rule" data-step-rule aria-hidden="true" />
          <span className="cro-step__label">{step.label}</span>
          <strong className="cro-step__value" data-count>
            {formatNum(step.value, step.decimals)}
            {step.suffix}
          </strong>
          <span className="cro-step__sub">{step.sub}</span>
        </li>
      ))}
    </ol>
  );
}

// Adds the numbers' entrance to a timeline at `at`: rules draw, labels rise, figures count up from the
// week before.
export function addSteps(tl, root, at) {
  tl.from(root.querySelectorAll('[data-step]'), { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.14 }, at)
    .from(root.querySelectorAll('[data-step-rule]'), { scaleX: 0, transformOrigin: '0 50%', duration: 0.9, ease: 'power3.out', stagger: 0.14 }, at)
    .from(root.querySelectorAll('[data-note]'), { autoAlpha: 0, duration: 0.8 }, at + 0.6);
  root.querySelectorAll('[data-count]').forEach((num, i) => {
    const step = STEPS[i];
    tl.add(countTo(num, { from: step.from ?? 0, to: step.value, decimals: step.decimals, suffix: step.suffix, duration: 1.5 }), at + 0.05 + i * 0.14);
  });
  return tl;
}

export function Note() {
  return (
    <span className="cro-hero__note" data-note>
      {RESULT.note}
    </span>
  );
}

// The facts as Placement Hub sets them: role, company and focus up front, scope and team behind a toggle.
export function LeadFacts({ className = '' }) {
  return (
    <div className={className}>
      <HeroFacts lead={HERO.lead} more={HERO.more} moreLabel={HERO.moreLabel} />
    </div>
  );
}

