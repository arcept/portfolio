import omsCover from './art/oms-cover.webp';

// The homepage's selected work (Work.js): the three case studies it features, in order, then the ones
// still being written, under "Read more". Each wears its own colour (`accent`). `image` is the
// featured card's screenshot (`srcLight` in the light theme, where there is one), with its size, which
// the dissolve between them needs to crop it. `breakAfter` breaks the title's line after that word where
// it is set large (the list, the phone cards).

export const CASES = [
  {
    slug: 'oms',
    href: '/case-study-oms',
    kicker: 'OMS v3.0 · Novatr',
    title: 'Rebuilding Order Management System',
    line: 'The whole sales org ran on a tool engineering built with no product or design input. The product-and-design-led rebuild that replaced it: five roles, one component set.',
    metric: { value: 1, prefix: '< ', suffix: ' hr', label: 'to raise an offer, down from 1–2 days' },
    facts: [
      ['Role', 'Project lead'],
      ['Timeline', '1 month'],
      ['Team', '2 designers, 1 PM'],
    ],
    prototype: true,
    accent: '#2fb583',
    image: {
      src: omsCover.src,
      w: omsCover.width,
      h: omsCover.height,
      alt: 'The OMS dashboard: booked revenue, the sales funnel, conversion by course and deal stages.',
    },
  },
  {
    slug: 'placement',
    href: '/case-study-placement',
    kicker: 'Placement Hub · Novatr',
    title: 'Making Placement Visible',
    line: 'Learners paid for placement support and experienced it as a black box. I led the design of a portal and a reusable placement system that made progress, eligibility and next steps visible.',
    metric: { value: 30, suffix: '%', label: 'of placements were self-placed, and invisible to the company' },
    facts: [
      ['Role', 'Design lead'],
      ['Timeline', '~3 months to launch'],
      ['Shipped', '63 annotated states'],
    ],
    prototype: true,
    accent: '#4d7bf0',
    image: {
      src: '/case-studies/placement-hub/preview.png',
      w: 1280,
      h: 750,
      alt: 'Placement Hub home: an eligibility banner, the next steps and a celebration card for self-placed learners.',
    },
  },
  {
    slug: 'cro',
    href: '/case-study-cro',
    kicker: 'Course page CRO · Novatr',
    title: 'Designing for Confidence',
    breakAfter: 'for',
    line: 'The flagship course page had strong traffic and weak conversion, and four teams disagreed on why. Behavioural data became the thing they could agree on.',
    metric: { value: 20, suffix: '%', label: 'conversion improvement on the highest-revenue page' },
    facts: [
      ['Role', 'Initiative lead'],
      ['Teams', '4, aligned on one page'],
      ['Method', 'Behavioural data'],
    ],
    prototype: false,
    accent: '#8a6cff',
    image: { src: '/case-studies/cro-cover.png', w: 1400, h: 788, alt: 'Cover: the landing page conversion chart with its percentage changes.' },
  },
].map((w, i) => ({ ...w, index: pad(i + 1) }));

// Still being written: numbered on from the featured three, with no images yet (their frames show a
// placeholder in their own colour).
export const MORE = [
  {
    slug: 'lms',
    href: '/case-study-novatr-lms',
    kicker: 'LMS · Novatr',
    title: 'Building the Novatr LMS',
    line: 'A 0-to-1 platform, its design system, and the revenue it carried.',
    accent: '#e0569b',
  },
  {
    slug: 'team',
    href: '/case-study-novatr-team',
    kicker: 'Design team · Novatr',
    title: 'A design team from zero',
    line: 'Hiring, structure and leadership from the first hire.',
    accent: '#22a6c4',
  },
].map((w, i) => ({ ...w, index: pad(CASES.length + i + 1) }));

function pad(n) {
  return String(n).padStart(2, '0');
}
