// The CRO case study's words. Every line is from Website Draft 01 and the Version 2 copy
// (~/Documents/CRO Case Study/Outputs); numbers are the original report's (CRO_Report_Mar09.pdf),
// unique users, and rate changes are percentage points.

export const META = {
  title: 'Designing for Confidence — Manik Madaan',
  description:
    'Our flagship BIM course page was underperforming, but every team had a different explanation. I led a shared way to measure what visitors did, make design decisions together, and keep learning after each change.',
};

export const HERO = {
  title: 'Designing for Confidence,',
  titleEm: 'from guesswork to evidence',
  subtitle: 'How I made data a more empathetic tool for improving Novatr’s course pages',
  intro:
    'Our flagship BIM course page was underperforming, but every team had a different explanation. I led a shared way to measure what visitors did, make design decisions together, and keep learning after each change.',
  // The same facts as Placement Hub's hero sets them (HeroFacts): three up front, the rest a toggle
  // away. The team is roles only, drafted from the case study's own account, for review.
  lead: [
    { label: 'Role', value: 'Product Design Manager', strong: true },
    { label: 'Company', value: 'Novatr, an AEC education company' },
    { label: 'Focus', value: 'Acquisition and conversion' },
  ],
  more: [
    { label: 'Scope', value: 'Measurement, design, team practice' },
    {
      label: 'Team',
      value: 'Product Design Manager (my role) · product designers · performance marketing, sales, business and data colleagues',
    },
  ],
  moreLabel: 'Scope and team',
};

// The hero figure: the five teams that each saw a different part of acquisition, and the one
// visitor journey the practice joined them around.
export const VIEWS = ['Performance marketing', 'Sales', 'Business', 'Data', 'HubSpot pages'];
export const JOURNEY = ['Page view', 'Form start', 'Submission'];

// The reported result: one weekly comparison against the week before, while visitors fell.
export const RESULT = {
  rates: [
    { label: 'Visitors who started the form', from: 17.26, to: 26.26, change: '+9.00 pp' },
    { label: 'Visitors who submitted it', from: 11.33, to: 18.66, change: '+7.33 pp' },
  ],
  note: 'One weekly comparison, while unique visitors fell 7.31%. Observed week over week, not the isolated effect of one design change.',
};

// In brief: the five beats of the story (a beat's `image`, if it has one, is its card's background), each led by a line the article itself uses (they echo the chapters'
// headings, by the user's choice), but for Reflection's, which sums up its body (approved 2026-10-02).
export const BRIEF = [
  {
    label: 'Problem',
    // Shortened from chapter 01's heading to fit the card in three lines (the user's choice, 2026-10-02).
    line: 'Every team had a number. None had the journey.',
    image: '/case-study-cro/brief-problem.webp',
    // The platforms each team read its own numbers from, scattered over and around the image as layers
    // (BriefOptions.js), each as supplied: one proportion, the logo on its own white. x, y the block's centre and w
    // its width (set per logo so their visual weight balances, the logos themselves being of different sizes), as percentages of the image (beyond 0–100 it
    // breaks out of the frame, by different amounts: some sit inside, some half out, some mostly off its top or
    // bottom edge); tilt in degrees; depth how far it moves with the pointer.
    layers: [
      { src: '/case-study-cro/logos/google-analytics.webp', name: 'Google Analytics', x: 24, y: -2.5, w: 39, tilt: -4, depth: 0.8 },
      { src: '/case-study-cro/logos/meta.webp', name: 'Meta', x: 86, y: 28, w: 34, tilt: 5, depth: 0.55 },
      { src: '/case-study-cro/logos/hubspot.webp', name: 'HubSpot', x: 87, y: 62, w: 29, tilt: 3, depth: 0.5 },
      { src: '/case-study-cro/logos/mixpanel.webp', name: 'Mixpanel', x: 2, y: 73, w: 32, tilt: -3, depth: 0.65 },
      { src: '/case-study-cro/logos/google-ads.webp', name: 'Google Ads', x: 40, y: 101, w: 42, tilt: 2, depth: 0.7 },
    ],
    body: 'Performance marketing, sales, business, data, and the team building HubSpot landing pages each saw a different part of acquisition. We had numbers, but no shared way to connect them to what visitors did on a page or agree on what to change.',
  },
  {
    label: 'Approach',
    line: 'First, we made the signal believable.',
    image: '/case-study-cro/brief-approach.webp',
    body: 'I helped define and validate the measurement, establish page-specific dashboards and regular reports, and lead reviews that joined campaign source, page behavior, form starts, and submissions. I connected those findings to design hypotheses and mentored the team through the iterations.',
  },
  {
    label: 'What changed',
    line: 'Make the form visible, then make it manageable.',
    image: '/case-study-cro/brief-what-changed.webp',
    body: 'On the BIM page, we made the form easier to find and complete, improved the page narrative, and placed proof closer to the decision.',
  },
  {
    label: 'Outcome',
    line: 'Fewer visitors. More meaningful progress.',
    image: '/case-study-cro/brief-outcome.webp',
    body: 'In one reported comparison week, more visitors started and submitted the BIM form even as traffic fell. The report showed an improvement; it could not isolate a single cause. The review cycle became part of a designer’s regular work after I stepped back.',
  },
  {
    label: 'Reflection',
    line: 'Build the measurement in from the start.',
    image: '/case-study-cro/brief-reflection.webp',
    body: 'I would build this measurement framework into a new page from the start. Retrofitting trustworthy events, definitions, and reporting onto a high-stakes page took time that could have been spent learning sooner.',
  },
];

// Chapter 01, The context. The words are Website Draft 01's, the margin's discipline the user's choice
// (2026-10-02); as context, it has no deliverables.
export const CONTEXT = {
  id: 'context',
  number: '01',
  name: 'The context',
  navLabel: 'Context',
  margin: {
    discipline: 'Acquisition · Cross-team discovery',
    questions: ['What made acquisition decisions so hard to own?'],
  },
  eyebrow: 'Two page systems. Many local truths.',
  heading: 'Everybody had a number.',
  headingEm: 'Nobody had the whole journey.',
  paragraphs: [
    'Novatr had a public course site and campaign-specific landing pages built in HubSpot. Audience-specific page versions added another layer. The people working on those pages had different goals and different places to look for answers.',
    'Performance marketing judged traffic through Meta and Google Ads. Sales wanted more leads and enough information to follow up, which often meant more form fields. The business team watched spending and cost per lead. Design could change the page, but had little shared evidence for deciding which change would matter.',
  ],
  quote: 'We were making changes, but we couldn’t agree on what was helping. Every team could explain its own number; no one could explain the entire path.',
  map: {
    label: 'Reconstructed map of four local views: campaign traffic, page engagement, form leads, and business return, connected by one visitor journey.',
    spine: ['Visitor arrives', 'Explores course', 'Starts form', 'Submits'],
    top: [
      { team: 'Performance marketing', view: 'Traffic and campaigns' },
      { team: 'Sales', view: 'Lead quantity and detail' },
    ],
    bottom: [
      { team: 'HubSpot + Data', view: 'Pages and events' },
      { team: 'Business + Design', view: 'Cost and experience' },
    ],
  },
  caption: 'Reconstructed from the project account. The gaps between these views were the design-management problem.',
};

// navLabel: a chapter's name in the contents nav, two words at most (drafted for review; the page keeps the
// full name).
//
// Chapters 02 to 05 and Looking back. Their words are Website Draft 01's; the margins (discipline, question,
// deliverables) are drafted for review, as Draft 01 has none for these chapters. Each chapter's body is a list
// of blocks, rendered in order by ChapterBlocks.js:
//   p          a paragraph
//   steps      numbered steps that light in turn as they are read (02)
//   shift      a labelled statement (02's "The shift")
//   moves      numbered design moves, each with the signal it was read by (03)
//   detail     a labelled design detail with the pop-up / first-scroll interactive (03)
//   funnel     the explorable three-week funnel (04)
//   caveat     a boxed note on what the evidence can and cannot tell us (04)
//   loop       the review loop (05)
//   statement  a closing line, its words lighting as it is read

export const PRACTICE = {
  id: 'practice',
  number: '02',
  name: 'The practice',
  navLabel: 'Practice',
  standfirst: 'Before the team could use data, it had to trust it.',
  margin: {
    discipline: 'Measurement · Analytics practice',
    questions: ['How do you make a number the whole team can trust?'],
    deliverables: 'Event definitions · page-specific dashboards · weekly reports',
  },
  eyebrow: 'Measure / verify / interpret / decide',
  heading: 'First, we made the',
  headingEm: 'signal believable.',
  blocks: [
    {
      type: 'p',
      text: 'Mixpanel had already been selected. I helped turn it into a shared working tool. We defined the events and formulas that mattered, checked them against GA4, and investigated discrepancies. Some variation between tools was acceptable. Unexplained differences were not a sound basis for design decisions.',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'Define the journey',
          body: 'Agree on what counts as a page view, form start, and submission, then keep those definitions consistent across the public and campaign pages.',
        },
        {
          title: 'Make it visible',
          body: 'Build page-specific dashboards and weekly or biweekly reports that product, marketing, sales, and business colleagues can read together.',
        },
        {
          title: 'Question the pattern',
          body: 'Use campaign segments, Clarity sessions, and counselor conversations to interpret what a number might mean before choosing a change.',
        },
        {
          title: 'Close the loop',
          body: 'Release a change, look at the next observation, and carry what we learned into the following review.',
        },
      ],
    },
    {
      type: 'shift',
      label: 'The shift',
      text: 'Traffic became the start of the conversation. We also asked who arrived, what they encountered, and whether they reached the next meaningful step.',
    },
  ],
};

export const PROVING_GROUND = {
  id: 'proving-ground',
  number: '03',
  name: 'The proving ground',
  navLabel: 'Proving ground',
  standfirst: 'The BIM course page made the practice tangible.',
  margin: {
    discipline: 'Conversion design · Behavioural research',
    questions: ['Why did people explore the course, yet not start the form?'],
    deliverables: 'Form in the first scroll · fewer fields · proof near decisions',
  },
  eyebrow: 'Page view → form start → submission',
  heading: 'A course page became',
  headingEm: 'a place to learn.',
  blocks: [
    {
      type: 'p',
      text: 'The BIM Professional Course for Architects was the page we examined most deeply. Visitors could reach it through different routes and audience-specific versions. We focused on what happened from the first visit to a completed form; sales qualification came later.',
    },
    {
      type: 'p',
      text: 'We saw people explore the course, yet fewer started the form than we wanted. Clarity helped us inspect individual sessions for early exits, missed sections, and possible form or pop-up friction. Counselor conversations added context. “Hesitation” became a useful hypothesis to test, not a feeling that a chart could prove.',
    },
    {
      type: 'moves',
      items: [
        {
          title: 'Bring the next step into view',
          body: 'We placed the form near the first scroll rather than depending on a pop-up, reduced fields, and used preselected answers where they helped. The question became whether more people began and finished the form.',
          signal: 'Form starts + completions',
        },
        {
          title: 'Give proof room to work',
          body: 'We adjusted the page narrative and brought evidence such as the placement report and payment information closer to decision points. We watched how people moved through those sections and what they did next.',
          signal: 'Section behavior + funnel',
        },
        {
          title: 'Look beyond the average',
          body: 'We compared sources and page versions serving different audiences. They helped us ask better questions about traffic quality, without pretending those variants were a randomized A/B test.',
          signal: 'Campaign segments',
        },
      ],
    },
    {
      type: 'detail',
      label: 'Design detail',
      title: 'Make the form visible, then make it manageable.',
      text: 'A visible form changed what a button click meant. Reducing the effort inside the form addressed a different part of the journey: finishing after starting.',
      caption: 'This diagram represents the interaction principle; it is not an archival screenshot.',
    },
  ],
};

// The weeks in the funnel, unique users. Weeks 1–3 are the original report's (CRO_Report_Mar09); week 3 is its
// reported comparison, against week 2. Week 4 was supplied by the user (2026-10-02, no button clicks); its rates
// are worked out from its counts and its change is against week 3. `change` is what a week shows against the
// week before; a week without one shows none. `first` marks the week the funnel opens on.
export const WEEKS = [
  { label: 'Week 1', visitors: 3846, clicks: 1164, starters: 694, submissions: 472, startRate: 18.04, submitRate: 12.27 },
  { label: 'Week 2', visitors: 2613, clicks: 784, starters: 451, submissions: 296, startRate: 17.26, submitRate: 11.33 },
  {
    label: 'Week 3',
    first: true,
    visitors: 2422,
    clicks: 596,
    starters: 636,
    submissions: 452,
    startRate: 26.26,
    submitRate: 18.66,
    change: [
      { label: 'Visitors', value: '−7.31%', sub: '2,613 → 2,422' },
      { label: 'Form start rate', value: '+9.00 pp', sub: '17.26% → 26.26%' },
      { label: 'Submission rate', value: '+7.33 pp', sub: '11.33% → 18.66%' },
    ],
  },
  {
    label: 'Week 4',
    visitors: 2936,
    starters: 812,
    submissions: 558,
    startRate: 27.66,
    submitRate: 19.01,
    change: [
      { label: 'Visitors', value: '+21.22%', sub: '2,422 → 2,936' },
      { label: 'Form start rate', value: '+1.40 pp', sub: '26.26% → 27.66%' },
      { label: 'Submission rate', value: '+0.35 pp', sub: '18.66% → 19.01%' },
    ],
  },
];

export const OBSERVED = {
  id: 'observed',
  number: '04',
  name: 'What we observed',
  navLabel: 'Observations',
  standfirst: 'A stronger week, read in context.',
  margin: {
    discipline: 'Reporting · Evidence',
    questions: ['What can one stronger week honestly tell us?'],
  },
  eyebrow: 'From the original weekly CRO report',
  heading: 'Fewer visitors.',
  headingEm: 'More meaningful progress.',
  blocks: [
    {
      type: 'p',
      text: 'In the reported comparison, unique visitors fell from 2,613 to 2,422. Unique form starters rose from 451 to 636, and submissions rose from 296 to 452. The share of visitors starting the form moved from 17.26% to 26.26%; the share submitting it moved from 11.33% to 18.66%.',
    },
    {
      type: 'funnel',
      caption: 'Three consecutive weeks from the original CRO report. The middle week dipped; the last week improved substantially. Rates compare unique users on the page with those who started or submitted the form.',
    },
    {
      type: 'p',
      text: 'Button clicks fell in that same comparison. Once the form was visible on the page, a click was a less useful stand-in for intent. Form starts and submissions gave us a clearer signal.',
    },
    {
      type: 'caveat',
      title: 'What this can—and cannot—tell us',
      text: 'The team tried A/B testing, but traffic was too limited for a reliable conclusion. Campaign mix and traffic quality changed across weeks, and the immediately preceding week was weaker than the week before it. The report shows an improvement in the observed rates and a rebound in starts and submissions. It does not isolate the effect of each design change.',
    },
  ],
};

export const LASTING_CHANGE = {
  id: 'lasting-change',
  number: '05',
  name: 'The lasting change',
  navLabel: 'Lasting change',
  standfirst: 'A method people could carry without me.',
  margin: {
    discipline: 'Design leadership · Team practice',
    questions: ['Would the practice hold without me in every review?'],
    deliverables: 'A review cycle owned by one designer',
  },
  eyebrow: 'Design leadership / team practice',
  heading: 'The work mattered most',
  headingEm: 'when I could step back.',
  blocks: [
    {
      type: 'p',
      text: 'The BIM page was the deepest example, but the approach began to move into other course pages and a new BIM launch campaign. I had initially helped build dashboards and reports, led reviews and design direction, and mentored the designers doing the detailed work.',
    },
    {
      type: 'p',
      text: 'Over time, one designer took on conversion reporting and ongoing page decisions as a regular responsibility. Marketing, sales, and data colleagues could bring information directly into that loop. The designer could report a pattern, make a change, and track its impact without needing me or other senior colleagues in every review.',
    },
    { type: 'loop', stages: ['Observe', 'Interpret', 'Change', 'Review'] },
    {
      type: 'statement',
      text: 'That was the broader shift I wanted: product and design taking measurable responsibility for growth alongside the teams bringing in traffic and speaking to prospective learners.',
    },
  ],
};

export const LOOKING_BACK = {
  id: 'looking-back',
  number: '06',
  name: 'Looking back',
  navLabel: 'Looking back',
  margin: {
    discipline: 'Reflection',
  },
  heading: 'What I would',
  headingEm: 'carry forward',
  blocks: [
    {
      type: 'p',
      text: 'I would define events and reporting when a new page is planned, not after a high-stakes page is already live. Rebuilding trust in the measurement took time we could have spent learning sooner.',
    },
    {
      type: 'p',
      text: 'I would also record decisions more consistently. In a lean company, a useful practice can spread through conversations and routine work. A clearer trail would make that learning easier for the next person to inherit.',
    },
    {
      type: 'statement',
      text: 'Data helped us find where to look. Session observation and counselor input helped us interpret what we saw. My job as a design leader was to help the team use those signals, make a decision, and stay willing to revise it.',
    },
  ],
};
