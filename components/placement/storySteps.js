'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Count, EASE } from '@/components/placement/Motion';

// The steps of the "2-minute version". Each has a kicker, a headline, a line or two of body, and a
// visual that animates in when the step arrives. `section` is the full section it summarises.

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function CantSee() {
  const rows = ['Whether a job matched them', 'Whether their profile was shared', 'Where an application stood', 'Why they were ineligible', 'What to do next'];
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <p className="st-vis__label">What a learner couldn’t see</p>
      <ul className="st-cant">
        {rows.map((row) => (
          <motion.li key={row} variants={item}>
            <span aria-hidden="true">?</span>
            {row}
          </motion.li>
        ))}
      </ul>
      <motion.p className="st-quote" variants={item}>
        “Messages get skipped in Slack.”
      </motion.p>
    </motion.div>
  );
}

function Bars() {
  const rows = [
    ['Acquisition', 82],
    ['Activation', 79.7],
    ['Engagement', 82],
    ['Completion', 55.5, true],
    ['Placements', 51.5, true],
  ];
  return (
    <div className="st-vis">
      <p className="st-vis__label">Satisfaction (CSAT) by stage</p>
      <div className="st-bars">
        {rows.map(([label, value, low], i) => (
          <div key={label} className="st-bar">
            <span className="st-bar__label">{label}</span>
            <span className="st-bar__track">
              <motion.i
                className={low ? 'is-low' : undefined}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.3 + i * 0.1 }}
              />
            </span>
            <span className={`st-bar__value${low ? ' is-low' : ''}`}>
              <Count to={value} decimals={value % 1 ? 1 : 0} duration={1.1} />
            </span>
          </div>
        ))}
      </div>
      <motion.p className="st-callout" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 1.2 }}>
        NPS among graduates who weren’t placed: <b><Count to={18} prefix="−" duration={1.2} /></b>
      </motion.p>
    </div>
  );
}

function Reframe() {
  const needs = ['Eligibility', 'Communication', 'Access', 'Tracking'];
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <motion.div className="st-big" variants={item}>
        <span className="st-big__num">
          <Count to={30} suffix="%" duration={1.6} />
        </span>
        <span className="st-big__text">of placements were self-placed, invisible to the company and unacknowledged by the product</span>
      </motion.div>
      <motion.p className="st-vis__label" variants={item}>
        The frame we worked to: ECAT
      </motion.p>
      <ul className="st-pills">
        {needs.map((need) => (
          <motion.li key={need} variants={item}>
            <b>{need[0]}</b>
            {need.slice(1)}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function Question() {
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <motion.blockquote className="st-serif" variants={item}>
        “What must be true about this learner for this screen to appear, and what must they understand or do next?”
      </motion.blockquote>
      <motion.p className="st-vis__label" variants={item}>
        Screens → explicit states → shared definitions
      </motion.p>
    </motion.div>
  );
}

const STATES = [
  { src: '/case-studies/placement-hub/body/state-relevant.png', label: 'Relevant, open to apply', alt: 'Job screen for a relevant opening with an Apply Now button.' },
  { src: '/case-studies/placement-hub/body/state-not-match.png', label: 'Not a match', alt: 'Job screen for a role that is not a match, with a Share concern button.' },
  { src: '/case-studies/placement-hub/body/state-expired.png', label: 'Expired', alt: 'Job screen for an expired opening with a disabled Apply Now button.' },
  { src: '/case-studies/placement-hub/body/state-applied.png', label: 'Applied, in process', alt: 'Job screen for an application in process.' },
];

function States() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setI((n) => (n + 1) % STATES.length), 2200);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="st-vis st-vis--shot">
      <div className="st-shot">
        {STATES.map((s, n) => (
          <motion.img key={s.src} src={s.src} alt={n === i ? s.alt : ''} width={880} height={1120} animate={{ opacity: n === i ? 1 : 0, scale: n === i ? 1 : 1.03 }} initial={{ opacity: n === 0 ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
        ))}
      </div>
      <p className="st-chip" key={i}>
        {STATES[i].label}
      </p>
    </div>
  );
}

function Handover() {
  const stats = [
    [63, '', 'annotated screen states'],
    [45, '~', 'components with developer notes'],
    [5, '', 'journey boards'],
    [6, '', 'state boards'],
  ];
  return (
    <motion.div className="st-vis st-stats" variants={list} initial="hidden" animate="show">
      {stats.map(([value, prefix, label]) => (
        <motion.div key={label} variants={item}>
          <span className="st-stats__num">
            <Count to={value} prefix={prefix} duration={1.4} />
          </span>
          <span className="st-stats__label">{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function Results() {
  const rows = [
    ['Placement-stage CSAT', '51.5', '68.2'],
    ['NPS, non-placed graduates', '−18', '−3'],
    ['Back-outs during hiring', '29.6%', '13.2%'],
  ];
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <ul className="st-results">
        {rows.map(([label, before, after]) => (
          <motion.li key={label} variants={item}>
            <span className="st-results__label">{label}</span>
            <span className="st-results__before">{before}</span>
            <span className="st-results__arrow" aria-hidden="true">→</span>
            <span className="st-results__after">{after}</span>
          </motion.li>
        ))}
      </ul>
      <motion.p className="st-vis__label" variants={item}>
        *Illustrative figures in this draft — to be replaced with verified results
      </motion.p>
    </motion.div>
  );
}

export const STEPS = [
  {
    id: 'problem',
    kicker: 'The problem',
    title: 'Placement support felt invisible.',
    body: 'Learners had bought placement support. What they met was a Slack channel, an email thread and a Google Form — and after that, the process went dark.',
    visual: <CantSee />,
  },
  {
    id: 'evidence',
    kicker: 'Evidence',
    title: 'Satisfaction fell exactly where the promise came due.',
    body: 'It held through learning, then dropped at placement. Net Promoter Score told the same story, and it fell the further a learner travelled.',
    visual: <Bars />,
  },
  {
    id: 'reframing',
    kicker: 'Reframing',
    title: 'A page was asked for. The evidence described a system.',
    body: 'A page could show one moment. The problem needed shared rules for every condition, who changed it, and what the learner should understand when it did.',
    visual: <Reframe />,
  },
  {
    id: 'leadership',
    kicker: 'Leadership',
    title: 'One question changed how the work was done.',
    body: 'Sanya owned the detailed design; I owned the framing, the principles and the reviews. Asking this in every review turned a pile of screens into a bounded set of states.',
    visual: <Question />,
  },
  {
    id: 'product',
    kicker: 'The product',
    title: 'Every screen answers: where do I stand, and what next?',
    body: 'The same job screen resolves differently depending on the learner — the unmet requirement is named, the deadline is counting, the action is always clear.',
    visual: <States />,
  },
  {
    id: 'handover',
    kicker: 'Handover',
    title: 'Specified to be built, and to be built on.',
    body: 'Status, relevance and eligibility were handed over as system definitions, so the operations tool and any partner product could adopt them rather than invent their own.',
    visual: <Handover />,
  },
  {
    id: 'launch',
    kicker: 'Launch and measurement',
    title: 'What launched, and what we measured.',
    body: 'Measured on the same instruments as the baselines. One claim this case study does not make: that the portal created more jobs.',
    visual: <Results />,
  },
];
