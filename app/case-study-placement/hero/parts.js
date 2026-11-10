'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/components/i18n/LangProvider';

// What the three hero options share: their words (drafts, in English only until one is chosen; another language
// shows the English), the portal's pieces rebuilt from its screens (sample data, as in the prototype), and the
// hooks that keep those pieces moving only while they're seen.

export function useHeroCopy() {
  const t = useT();
  return {
    back: t('hero.back', 'Back to all work'),
    title: t('hero2.title', 'Making Placement Visible,'),
    // A no-break space keeps "next step" on one line.
    turn: t('hero2.turn', 'from black box to next\u00a0step'),
    sub: t('hero2.sub', 'How I led the design of a placement portal for India’s biggest AEC education platform'),
    intro: t(
      'hero.lede',
      'Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.'
    ),
  };
}

// ---------------------------------------------------------------- The portal's data (sample, as in the prototype)

export const STAGES = ['Applied', 'Profile shared', 'Profile shortlisted', 'Selected for interview', 'Offer received', 'Offer accepted'];
export const DATES = ['15 Nov', '16 Nov', '18 Nov', '21 Nov', '27 Nov', '29 Nov'];

// The applications the tracker follows in turn.
export const JOBS = [
  { company: 'AECOM Architects', role: 'BIM Engineer' },
  { company: 'COWI', role: 'BIM Coordinator' },
  { company: 'Diller Scofidio + Renfro', role: 'Architect' },
];

// The update the portal sends as an application reaches each stage.
export function updateFor(stage, { company, role }) {
  return [
    `Your application for ${role} at ${company} was received.`,
    `Your application for ${role} has been shared with the hiring partner.`,
    `${company} shortlisted your profile.`,
    `You’re selected for an interview with ${company}.`,
    `You have an offer from ${company}.`,
    `Congratulations, you’ve accepted the offer from ${company}.`,
  ][stage];
}

// From the Launch and measurement table, which marks every figure after launch as an illustrative placeholder; so
// does the hero.
export const FIGURES = [
  { label: 'Placement-stage CSAT', from: 51.5, to: 68.2, decimals: 1, suffix: '', was: '51.5' },
  { label: 'Opening to profile shared', from: 60, to: 14.5, decimals: 1, suffix: ' h', was: '60+ h' },
  { label: 'Applied to relevant openings', from: 46, to: 66, decimals: 0, suffix: '%', was: '46%' },
];
export const FIGURES_NOTE = 'Illustrative, as in Launch and measurement';

// ---------------------------------------------------------------- Hooks

// True while `ref` is on screen, the tab is visible and the reader hasn't asked for less motion.
export function useLive(ref) {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let seen = false;
    const update = () => setLive(seen && !still.matches && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      update();
    });
    io.observe(el);
    still.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      io.disconnect();
      still.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [ref]);
  return live;
}

// A count that goes up by one every `ms` while `live`, starting after `wait`.
export function useTick(live, ms, wait = 0) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!live) return undefined;
    let id;
    const start = setTimeout(() => {
      setTick((n) => n + 1);
      id = setInterval(() => setTick((n) => n + 1), ms);
    }, wait);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [live, ms, wait]);
  return tick;
}

// ---------------------------------------------------------------- The portal's pieces

// The application tracker: stages down a line, those done in the accent with their dates, the current one bold.
export function Tracker({ job, stage, className = '' }) {
  return (
    <div className={`phx-ui phx-tracker ${className}`}>
      <p className="phx-ui__kicker">Track your application here</p>
      <p className="phx-tracker__title">
        Your journey with <span key={job.company}>{job.company}</span>
      </p>
      <ol className="phx-tracker__list">
        {STAGES.map((name, i) => (
          <li key={name} className={i < stage ? 'is-done' : i === stage ? 'is-now' : undefined} style={{ '--i': i }}>
            <span className="phx-tracker__date">{i <= stage ? DATES[i] : ''}</span>
            <span className="phx-tracker__dot" aria-hidden="true" />
            <span className="phx-tracker__name">{name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// A job as the board shows it: the company's mark, the tags, the checks against the learner's profile, and how
// long is left to apply.
export function JobCard({ hours = 36, className = '' }) {
  return (
    <div className={`phx-ui phx-job ${className}`}>
      <p className="phx-job__posted">Posted 1d ago</p>
      <div className="phx-job__head">
        <span className="phx-job__logo" aria-hidden="true">
          COWI
        </span>
        <div>
          <p className="phx-job__company">COWI</p>
          <p className="phx-job__tags">
            <span className="is-featured">Featured</span>
            <span className="is-match">Best Match</span>
          </p>
        </div>
      </div>
      <p className="phx-job__role">BIM Coordinator, Buildings &amp; Urban</p>
      <dl className="phx-job__checks">
        <div>
          <dt>Degree</dt>
          <dd>B.Arch</dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>3+ years</dd>
        </div>
      </dl>
      <p className="phx-job__close">
        Applications close in <b>{hours} hrs</b>
      </p>
    </div>
  );
}

// One update, as the portal's panel lists it.
export function Toast({ text, time = 'Just now', tone = 'blue', className = '' }) {
  return (
    <div className={`phx-ui phx-toast is-${tone} ${className}`}>
      <span className="phx-toast__icon" aria-hidden="true" />
      <p>
        {text}
        <small>{time}</small>
      </p>
    </div>
  );
}

// The eligibility banner's verdict, as a stamp.
export function Eligible({ className = '' }) {
  return (
    <div className={`phx-ui phx-eligible ${className}`}>
      <span className="phx-eligible__tick" aria-hidden="true" />
      <p>
        <b>Eligible</b>
        You qualify for personalised placement support
      </p>
    </div>
  );
}
