// The résumé's content. Roles and schools come from the About page's own data (one source of truth);
// what the page does not carry — the summary, skills, contact details, résumé-only facts — lives here.
// Anything marked TODO is a draft or a placeholder to confirm.

import { ROLES } from '../experience-content';
import { SCHOOLS } from '../education-content';

export const PERSON = {
  name: 'Manik Madaan',
  title: 'Product Design Leader / Manager',
  location: 'Delhi NCR, India',
  email: 'contact@arcept.in',
  phone: '+91 99530 46048',
  website: 'arcept.in',
  linkedin: 'linkedin.com/in/manikmadaan',
  linkedinUrl: 'https://www.linkedin.com/in/manikmadaan/',
  websiteUrl: 'https://arcept.in',
  photo: '/about/resume/portrait.jpg',
};

// TODO review: drafted from the About page's opening and the LinkedIn export.
export const SUMMARY =
  'Product design leader with more than a decade across freelance practice, studios, agencies, startups and education technology, in India and Italy. At Novatr I built and led the product design team, shaped the learning platform behind a 4x rise in revenue, and designed the growth, sales and operations tools around it. I am most useful where a problem is complicated and the system is hard to see: finding the problem beneath the request, and making it clear enough for a team to act.';

// TODO review: drafted, not yet on the page.
export const SKILLS = [
  { group: 'Leadership', items: ['Building and leading design teams', 'Hiring and mentoring', 'Design culture and critique', 'Stakeholder alignment'] },
  { group: 'Product', items: ['Product strategy', 'Discovery and user research', 'Product-led growth', 'Data-informed decisions'] },
  { group: 'Craft', items: ['Interaction design', 'Design systems', 'Prototyping', 'Visual and motion design'] },
  { group: 'Tools', items: ['Figma', 'Adobe Creative Cloud', 'After Effects', 'AI-assisted prototyping'] },
];

// Résumé dates where the page's own are informal.
const DATES = { independent: 'Alongside college' }; // TODO confirm years

// What each of the recent roles achieved, for the résumé (from the LinkedIn export, tightened). Where a
// role has these they replace the About page's story; the other roles use the page's own lines.
const HIGHLIGHTS = {
  novatr: [
    'Led the design of a Learning Management System that helped grow company revenue 4x and set up a projected 5x ARR growth.',
    'Drove growth: a referral engine that brought in 25% of revenue, and Career Navigator, a PLG tool that grew organic traffic, MQLs and SQLs.',
    'Created a unified family of design systems across websites, web apps, mobile and internal tools.',
    'Designed a placement portal for graduates, and internal tools (CMS, sales dashboard, Order Management System) on HubSpot CRM.',
    'Built the design team, led the rebrand from OneistoX to Novatr, and set up how design worked with product, engineering and QA.',
  ],
  shyft: [
    'Carried the product through the move from Mindhouse to Shyft, and established its design language and system for scale.',
    'Led new experiences across yoga, mental health, sleep and nutrition programmes, onboarding and profiles, on mobile and web.',
  ],
  gosocial: [
    'Built and led the product design team from the ground up: hiring, skill development and a collaborative design culture.',
    'Led the design of GoSocial, tools for creators to build, engage and earn from their communities.',
  ],
  apostrfy: [
    'Shaped the early product of a writing and publishing community.',
    'Three months in, recognised the work had drifted from the problem and led the pivot, rather than protect the time and money spent.',
  ],
  leoburnett: [
    'Designed digital products and interactive campaigns for FCA Bank, Comau and Fiat.',
    'Shaped user journeys and experience strategy across brand, product and campaign.',
  ],
  // The earlier roles: one line each.
  automec: ['Ran communication and operations for the family auto-components business.'],
  arcept: ['Ran an independent studio through college, owning clients and delivery.'],
  weirdlogics: ['Early iPad and digital products, when product design in India meant physical things.'],
  creativegaga: ['A first professional role, in the design team of an art and design magazine.'],
};

// The role's lines for the résumé: the one-line summary first, then the story's sentences.
const sentences = (text = '') => text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [];

export const EXPERIENCE = ROLES.map((r) => ({
  id: r.id,
  company: r.company,
  aka: r.formerly ? `formerly ${r.formerly}` : r.product ?? null,
  descriptor: r.descriptor,
  role: r.role,
  dates: DATES[r.id] ?? r.dates,
  place: r.place,
  // A theme-swapping badge (no real company mark yet) picks its light variant for the printed page.
  badge: (typeof r.logoSquare === 'string' ? r.logoSquare : r.logoSquare?.light) ?? null,
  tile: r.logoTile ? { color: r.logoTile, mark: r.logo } : null,
  mark: r.logoSquare || r.logoTile ? null : r.logo,
  bullets: HIGHLIGHTS[r.id] ?? [r.line, ...sentences(r.story)],
  early: ['automec', 'arcept', 'weirdlogics', 'creativegaga', 'independent'].includes(r.id),
}));

export const EDUCATION = SCHOOLS.map((s) => ({
  id: s.id,
  programme: s.programme,
  school: s.school,
  formerly: s.formerly ?? null,
  place: s.place,
  years: s.years,
  note: s.status ? 'Did not complete (two years)' : s.award ?? s.major ?? null,
  logo: s.logos?.[0] ? { src: `/about/logos/edu/${s.logos[0].src}-light.png`, ratio: s.logos[0].ratio } : null,
}));
