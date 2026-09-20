'use client';

import StoryLauncher from '@/components/case-study-kit/Story';
import { BarsVisual, BeforeAfterVisual, BigStatVisual, CycleVisual, ListVisual, QuoteVisual, StatsVisual } from '@/components/case-study-kit/StoryVisuals';
import { Count } from '@/components/case-study-kit/Motion';

// The steps of Placement Hub's "2-minute version". `id` is the section each step summarises.
const STATES = [
  { src: '/case-studies/placement-hub/body/state-relevant.png', label: 'Relevant, open to apply', alt: 'Job screen for a relevant opening with an Apply Now button.' },
  { src: '/case-studies/placement-hub/body/state-not-match.png', label: 'Not a match', alt: 'Job screen for a role that is not a match, with a Share concern button.' },
  { src: '/case-studies/placement-hub/body/state-expired.png', label: 'Expired', alt: 'Job screen for an expired opening with a disabled Apply Now button.' },
  { src: '/case-studies/placement-hub/body/state-applied.png', label: 'Applied, in process', alt: 'Job screen for an application in process.' },
];

const STEPS = [
  {
    id: 'problem',
    kicker: 'The problem',
    title: 'Placement support felt invisible.',
    body: 'Learners had bought placement support. What they met was a Slack channel, an email thread and a Google Form — and after that, the process went dark.',
    visual: (
      <ListVisual
        label="What a learner couldn’t see"
        rows={['Whether a job matched them', 'Whether their profile was shared', 'Where an application stood', 'Why they were ineligible', 'What to do next']}
        footer="“Messages get skipped in Slack.”"
      />
    ),
  },
  {
    id: 'evidence',
    kicker: 'Evidence',
    title: 'Satisfaction fell exactly where the promise came due.',
    body: 'It held through learning, then dropped at placement. Net Promoter Score told the same story, and it fell the further a learner travelled.',
    visual: (
      <BarsVisual
        label="Satisfaction (CSAT) by stage"
        rows={[['Acquisition', 82], ['Activation', 79.7], ['Engagement', 82], ['Completion', 55.5, true], ['Placements', 51.5, true]]}
        callout={
          <>
            NPS among graduates who weren’t placed: <b><Count to={18} prefix="−" duration={1.2} /></b>
          </>
        }
      />
    ),
  },
  {
    id: 'reframing',
    kicker: 'Reframing',
    title: 'A page was asked for. The evidence described a system.',
    body: 'A page could show one moment. The problem needed shared rules for every condition, who changed it, and what the learner should understand when it did.',
    visual: <BigStatVisual value={30} suffix="%" text="of placements were self-placed, invisible to the company and unacknowledged by the product" pillsLabel="The frame we worked to: ECAT" pills={['Eligibility', 'Communication', 'Access', 'Tracking']} />,
  },
  {
    id: 'leadership',
    kicker: 'Leadership',
    title: 'One question changed how the work was done.',
    body: 'Sanya owned the detailed design; I owned the framing, the principles and the reviews. Asking this in every review turned a pile of screens into a bounded set of states.',
    visual: <QuoteVisual quote="“What must be true about this learner for this screen to appear, and what must they understand or do next?”" caption="Screens → explicit states → shared definitions" />,
  },
  {
    id: 'product',
    kicker: 'The product',
    title: 'Every screen answers: where do I stand, and what next?',
    body: 'The same job screen resolves differently depending on the learner — the unmet requirement is named, the deadline is counting, the action is always clear.',
    visual: <CycleVisual images={STATES} />,
  },
  {
    id: 'handover',
    kicker: 'Handover',
    title: 'Specified to be built, and to be built on.',
    body: 'Status, relevance and eligibility were handed over as system definitions, so the operations tool and any partner product could adopt them rather than invent their own.',
    visual: (
      <StatsVisual
        stats={[
          { value: 63, label: 'annotated screen states' },
          { value: 45, prefix: '~', label: 'components with developer notes' },
          { value: 5, label: 'journey boards' },
          { value: 6, label: 'state boards' },
        ]}
      />
    ),
  },
  {
    id: 'launch',
    kicker: 'Launch and measurement',
    title: 'What launched, and what we measured.',
    body: 'Measured on the same instruments as the baselines. One claim this case study does not make: that the portal created more jobs.',
    visual: (
      <BeforeAfterVisual
        rows={[['Placement-stage CSAT', '51.5', '68.2'], ['NPS, non-placed graduates', '−18', '−3'], ['Back-outs during hiring', '29.6%', '13.2%']]}
        footnote="*Illustrative figures in this draft — to be replaced with verified results"
      />
    ),
  },
];

export default function PlacementStory(props) {
  return <StoryLauncher steps={STEPS} {...props} />;
}
