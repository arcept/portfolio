'use client';

import { motion } from 'motion/react';
import StoryLauncher from '@/components/case-study-kit/Story';
import { BarsVisual, ListVisual, QuoteVisual, StatsVisual, storyMotion } from '@/components/case-study-kit/StoryVisuals';

// The steps of OMS's "2-minute version". `id` is the section each step summarises. Every line here is
// taken from the page; the three visuals below are this case study's own shapes (styles: oms.css).
const { list, item } = storyMotion;

// The alternatives that were rejected, struck through one after another.
function Rejected() {
  const rows = [
    'Creating the deal at form fill or application sent',
    'A bespoke dashboard per permission tier',
    'A single “Revenue” figure',
    'Modelling the team structure in the UI',
    'Interleaving workflow and reporting releases',
  ];
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <p className="st-vis__label">What I rejected</p>
      <ul className="st-strike">
        {rows.map((row, i) => (
          <motion.li key={row} variants={item}>
            <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <s style={{ '--i': i }}>{row}</s>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// The five status colours and what each means.
function Badges() {
  const badges = [
    ['blue', 'Blue · Waiting on the learner'],
    ['amber', 'Amber · Timed Out'],
    ['green', 'Green · Moving'],
    ['red', 'Red · Waiting On You'],
    ['grey', 'Grey · Global Status'],
  ];
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <p className="st-vis__label">Colour follows agency, not progress</p>
      <div className="st-badges">
        {badges.map(([tone, text]) => (
          <motion.div key={tone} className={`cs-status-badge cs-status-badge--${tone}`} variants={item}>
            <span className="cs-status-badge__dot" />
            <p>{text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// The arithmetic the BDR no longer does.
function Formula() {
  return (
    <motion.div className="st-vis" variants={list} initial="hidden" animate="show">
      <p className="st-vis__label">Nothing typed free-hand</p>
      <motion.div className="st-formula" variants={item}>
        <span>Course Fee</span>
        <b aria-hidden="true">−</b>
        <span>Total Discount</span>
        <b aria-hidden="true">=</b>
        <span className="is-result">Net Payable Fee</span>
      </motion.div>
      <motion.p className="st-formula__note" variants={item}>
        A fixed downpayment, then the rest split evenly across the tenure. The last instalment absorbs whatever rupee the division left over.
      </motion.p>
    </motion.div>
  );
}

const STEPS = [
  {
    id: 'context',
    kicker: 'Context',
    title: 'The tool already existed. The problem was who owned it.',
    body: 'Getting a straight answer about the sales floor meant somebody assembling it by hand, and it took hours, sometimes days. OMS v1 was built by engineering alone.',
    visual: <ListVisual label="One task, three tools" rows={['HubSpot', 'OMS', 'WhatsApp']} marker="→" footer="That isn’t a usability problem. It’s an ownership problem." />,
  },
  {
    id: 'mandate',
    kicker: 'The Mandate',
    title: 'I didn’t sell a redesign. I sold the cost of not knowing.',
    body: 'Three arguments at once: make the cost of slowness visible, let the pain come from the users, and argue it into the roadmap.',
    visual: (
      <BarsVisual
        label="How much of the funnel each role could see"
        rows={[['BDR', 90], ['Team Lead', 55], ['Team Manager', 30], ['Sales Head', 8, true]]}
        callout="*Illustrative — drawn from what each level described in interviews, not from instrumentation."
      />
    ),
  },
  {
    id: 'decisions',
    kicker: 'Decisions',
    title: 'Five decisions, made before anything was drawn.',
    body: 'Each one was cheap to make early and expensive to reverse late, which is what a design manager should spend attention on. The screens are Ved’s. These are mine.',
    visual: <Rejected />,
  },
  {
    id: 'system',
    kicker: 'The System',
    title: 'Five roles, one component. Scope is a parameter, not a screen.',
    body: 'One set of components, reused at every altitude, with only the data scope changing. A Sales Head goes from an org-wide dip to the one person responsible in three clicks.',
    visual: <ListVisual label="One component set, five scopes" rows={['BDR', 'Associate Team Lead', 'Team Lead', 'Team Manager', 'Sales Head']} marker="•" footer="Scope is a parameter, not a screen." />,
  },
  {
    id: 'status',
    kicker: 'Status',
    title: 'Colour answers “whose move is it?”, not “what stage is this?”',
    body: 'A deal has a stage and a sub-status. What it needed was a third thing the list could be read by at nine in the morning: am I the blocker?',
    visual: <Badges />,
  },
  {
    id: 'offer-flow',
    kicker: 'The Offer Flow',
    title: 'Don’t make anyone do the math by hand.',
    body: 'Building an offer is the one moment where a mistake is expensive, customer-facing and effectively irreversible. Almost every decision in the wizard refuses to let an error escape.',
    visual: <Formula />,
  },
  {
    id: 'impact',
    kicker: 'Impact',
    title: 'Four numbers I’ll stand behind, and three I won’t.',
    body: 'Not claimed: 100% adoption of a mandatory tool, or roughly 30% more revenue. Both measure something other than this work.',
    visual: (
      <StatsVisual
        stats={[
          { prefix: '< ', value: 1, suffix: ' hour', label: 'was 1–2 days, for a form or offer' },
          { value: 18, suffix: '%', label: 'lead drop / dispose rate' },
          { text: '4 → 3 days', label: 'new BDR training' },
          { value: 4.2, decimals: 1, suffix: '/5', label: 'internal NPS, +25% on previous tooling' },
        ]}
      />
    ),
  },
  {
    id: 'reflection',
    kicker: 'Reflection',
    title: 'I sequenced for the people funding it, not the people using it.',
    body: 'Dashboards shipped ahead of workflow depth because leadership’s pain was the loudest. It kept the project alive, and the daily users got served second.',
    visual: <QuoteVisual quote="If I ran it again I’d interleave instead of stacking. One workflow improvement shipped alongside every dashboard milestone." caption="Same total scope, same funding argument" />,
  },
];

export default function OmsStory(props) {
  return <StoryLauncher steps={STEPS} {...props} />;
}
