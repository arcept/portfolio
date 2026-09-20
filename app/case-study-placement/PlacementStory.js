'use client';

import { useMemo } from 'react';
import StoryLauncher from '@/components/case-study-kit/Story';
import { BarsVisual, BeforeAfterVisual, BigStatVisual, CycleVisual, ListVisual, QuoteVisual, StatsVisual } from '@/components/case-study-kit/StoryVisuals';
import { Count } from '@/components/case-study-kit/Motion';
import { useT } from '@/components/i18n/LangProvider';

// The steps of Placement Hub's "2-minute version". `id` is the section each step summarises.
const STATES = [
  { src: '/case-studies/placement-hub/body/state-relevant.png', label: 'Relevant, open to apply', alt: 'Job screen for a relevant opening with an Apply Now button.' },
  { src: '/case-studies/placement-hub/body/state-not-match.png', label: 'Not a match', alt: 'Job screen for a role that is not a match, with a Share concern button.' },
  { src: '/case-studies/placement-hub/body/state-expired.png', label: 'Expired', alt: 'Job screen for an expired opening with a disabled Apply Now button.' },
  { src: '/case-studies/placement-hub/body/state-applied.png', label: 'Applied, in process', alt: 'Job screen for an application in process.' },
];

// The steps of the story, in the current language (`t` is the translate function).
const buildSteps = (t) => [
  {
    id: 'problem',
    kicker: t('story.problem.kicker', 'The problem'),
    title: t('story.problem.title', 'Placement support felt invisible.'),
    body: t('story.problem.body', 'Learners had bought placement support. What they met was a Slack channel, an email thread and a Google Form — and after that, the process went dark.'),
    visual: (
      <ListVisual
        label={t("story.problem.label", "What a learner couldn’t see")}
        rows={t("story.problem.rows", ['Whether a job matched them', 'Whether their profile was shared', 'Where an application stood', 'Why they were ineligible', 'What to do next'])}
        footer={t("story.problem.footer", "“Messages get skipped in Slack.”")}
      />
    ),
  },
  {
    id: 'evidence',
    kicker: t('story.evidence.kicker', 'Evidence'),
    title: t('story.evidence.title', 'Satisfaction fell exactly where the promise came due.'),
    body: t('story.evidence.body', 'It held through learning, then dropped at placement. Net Promoter Score told the same story, and it fell the further a learner travelled.'),
    visual: (
      <BarsVisual
        label={t("story.evidence.label", "Satisfaction (CSAT) by stage")}
        rows={t("story.evidence.rows", [['Acquisition', 82], ['Activation', 79.7], ['Engagement', 82], ['Completion', 55.5, true], ['Placements', 51.5, true]])}
        callout={
          <>
            {t('story.evidence.callout', 'NPS among graduates who weren’t placed:')} <b><Count to={18} prefix="−" duration={1.2} /></b>
          </>
        }
      />
    ),
  },
  {
    id: 'reframing',
    kicker: t('story.reframing.kicker', 'Reframing'),
    title: t('story.reframing.title', 'A page was asked for. The evidence described a system.'),
    body: t('story.reframing.body', 'A page could show one moment. The problem needed shared rules for every condition, who changed it, and what the learner should understand when it did.'),
    visual: <BigStatVisual value={30} suffix="%" text={t("story.reframing.text", "of placements were self-placed, invisible to the company and unacknowledged by the product")} pillsLabel={t("story.reframing.pillsLabel", "The frame we worked to: ECAT")} pills={t("story.reframing.pills", ['Eligibility', 'Communication', 'Access', 'Tracking'])} />,
  },
  {
    id: 'leadership',
    kicker: t('story.leadership.kicker', 'Leadership'),
    title: t('story.leadership.title', 'One question changed how the work was done.'),
    body: t('story.leadership.body', 'Sanya owned the detailed design; I owned the framing, the principles and the reviews. Asking this in every review turned a pile of screens into a bounded set of states.'),
    visual: <QuoteVisual quote={t("story.leadership.quote", "“What must be true about this learner for this screen to appear, and what must they understand or do next?”")} caption={t("story.leadership.caption", "Screens → explicit states → shared definitions")} />,
  },
  {
    id: 'product',
    kicker: t('story.product.kicker', 'The product'),
    title: t('story.product.title', 'Every screen answers: where do I stand, and what next?'),
    body: t('story.product.body', 'The same job screen resolves differently depending on the learner — the unmet requirement is named, the deadline is counting, the action is always clear.'),
    visual: <CycleVisual images={t.list("story.product.states", STATES)} />,
  },
  {
    id: 'handover',
    kicker: t('story.handover.kicker', 'Handover'),
    title: t('story.handover.title', 'Specified to be built, and to be built on.'),
    body: t('story.handover.body', 'Status, relevance and eligibility were handed over as system definitions, so the operations tool and any partner product could adopt them rather than invent their own.'),
    visual: (
      <StatsVisual
        stats={t.list("story.handover.stats", [
          { value: 63, label: 'annotated screen states' },
          { value: 45, prefix: '~', label: 'components with developer notes' },
          { value: 5, label: 'journey boards' },
          { value: 6, label: 'state boards' },
        ])}
      />
    ),
  },
  {
    id: 'launch',
    kicker: t('story.launch.kicker', 'Launch and measurement'),
    title: t('story.launch.title', 'What launched, and what we measured.'),
    body: t('story.launch.body', 'Measured on the same instruments as the baselines. One claim this case study does not make: that the portal created more jobs.'),
    visual: (
      <BeforeAfterVisual
        rows={t("story.launch.rows", [['Placement-stage CSAT', '51.5', '68.2'], ['NPS, non-placed graduates', '−18', '−3'], ['Back-outs during hiring', '29.6%', '13.2%']])}
        footnote={t("story.launch.footnote", "*Illustrative figures in this draft — to be replaced with verified results")}
      />
    ),
  },
];

export default function PlacementStory(props) {
  const t = useT();
  const steps = useMemo(() => buildSteps(t), [t]);
  return <StoryLauncher steps={steps} {...props} />;
}
