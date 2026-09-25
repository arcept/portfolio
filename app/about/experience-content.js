// Section 04's copy: the roles, latest first. Read by the layout lab (/about/lenses-lab) and, once a
// layout is chosen, by the page.
//
// Facts come only from the Draft 3 content; the wording is new. Dates are placeholders until verified
// (`dates: null`) where not yet given; `place: null` likewise means "to confirm".
// `label` names the kind of work. `tier: 1` roles get full weight in the tiered layouts. `logo` is a
// single-colour SVG in public/about/logos/, drawn as a mask so it can be painted any colour: the page's
// ink by default (it flips with the theme), or `brand` (per theme; null falls back to ink, for marks
// whose own colour would not read on that background). `logoRatio` is its width over its height, and
// `logoInk` the share of that box the mark actually covers, so marks can be sized to the same visual
// weight. `logoTile` sets the mark on a coloured tile, as the company's own badge does. `logoSquare` is a
// finished square badge (own background and rounded corners); when present it is used in place of the
// wide logo.

export const EXPERIENCE_HEADLINES = [
  'Every role widened what design could reach.',
  'From flyers to design teams.',
  'A practice that kept expanding.',
  'Ten rooms. The same question in each.',
];

export const EXPERIENCE_INTRO =
  'My career has crossed studios, agencies, startups, education, manufacturing and independent practice, in India and in Italy. It was never a neat climb from one title to the next. Each room widened what I thought design could influence.';

export const ROLES = [
  {
    id: 'independent-now',
    label: 'Independent practice',
    company: 'Independent',
    descriptor: 'Product design consultancy',
    role: 'Product Design Consultant',
    place: 'Delhi NCR, India',
    dates: 'Jan 2026 – Present',
    tier: 1,
    // No real company mark yet: a plain "I", swapping with the theme (see Logotype in Experience.js).
    logoSquare: { light: '/about/logos/independent-square-light.svg', dark: '/about/logos/independent-square-dark.svg' },
    line: 'Independent consulting practice, picking up where the sabbatical left off.',
    story:
      'Back to client work on my own terms, before the next full-time role.',
  },
  {
    id: 'novatr',
    label: 'Teams & systems',
    company: 'Novatr',
    formerly: 'OneistoX',
    descriptor: 'AEC technology and education',
    role: 'Product Design Manager',
    place: 'Gurugram, Haryana, India',
    dates: 'Oct 2022 – Jul 2024',
    tier: 1,
    logo: '/about/logos/novatr.svg',
    logoRatio: 5.547,
    logoInk: 0.407,
    logoSquare: '/about/logos/novatr-square.svg', // the company's square badge, with its own background
    logoScale: 0.9,
    brand: { light: 'linear-gradient(90deg, #7860fc, #21b7de 55%, #7feb8c)', dark: 'linear-gradient(90deg, #8f7bff, #33c6ea 55%, #8ff09a)' },
    line: 'Led product design as the company grew.',
    story:
      'Built the design team and its culture, set up systems, and shaped how the company approached problems. The work moved between hands-on design, hiring, team development, product strategy and organisational decisions.',
  },
  {
    id: 'shyft',
    label: 'Product & service',
    company: 'Shyft',
    formerly: 'Mindhouse',
    descriptor: 'Health and wellness platform',
    role: 'Product Design Lead',
    place: 'Gurugram, Haryana, India',
    dates: 'Nov 2021 – Oct 2022',
    tier: 1,
    logo: '/about/logos/shyft.svg',
    logoRatio: 2.268,
    logoInk: 0.406,
    logoSquare: '/about/logos/shyft-square.svg', // the company's square badge, with its own background
    // Two colours (the gold end of the t), so shown as the artwork itself, not as a mask.
    logoArt: { light: '/about/logos/shyft-color.svg', dark: '/about/logos/shyft-color-dark.svg' },
    brand: { light: 'linear-gradient(90deg, #6c2aff, #9865ff)', dark: 'linear-gradient(90deg, #8b5cff, #9865ff)' },
    line: 'Carried the product through the move from Mindhouse to Shyft.',
    story:
      'Designed digital experiences across yoga, mental-health coaching, sleep, physiotherapy and health tools. This is where product-led growth became something I lived across the product, the service, the brand, the sales team and the customer.',
  },
  {
    id: 'gosocial',
    label: 'Community products',
    company: 'Hapramp Studio',
    product: 'GoSocial',
    descriptor: 'Creator and community platform',
    role: 'Senior Product Designer',
    place: 'Gurugram, Haryana, India',
    dates: 'Jul 2020 – Nov 2021',
    tier: 1,
    logo: '/about/logos/hapramp.svg',
    logoRatio: 4.461,
    logoInk: 0.231,
    logoSquare: '/about/logos/hapramp-square.svg', // the company's square badge, with its own background
    brand: { light: '#3478f7', dark: '#6a9dff' },
    line: 'Designed GoSocial, from creative challenges to tools creators could build a living on.',
    story:
      'The product grew from creative challenges into tools for creators to build, engage and earn from their communities, at the meeting point of photography, writing, social behaviour, community and decentralised technology.',
  },
  {
    id: 'apostrfy',
    label: 'Design consultancy',
    company: 'Apostrfy',
    descriptor: 'Writing and publishing community',
    role: 'Product Design Consultant',
    place: 'Delhi NCR, India',
    dates: 'Dec 2019 – Jul 2020',
    tier: 1,
    logo: '/about/logos/apostrfy.svg',
    logoRatio: 3.503,
    logoInk: 0.261,
    logoSquare: '/about/logos/apostrfy-square.svg', // the company's square badge, with its own background
    brand: { light: null, dark: null },
    line: 'Shaped the early product, and a pivot.',
    story:
      'Three months into the first direction, we accepted that the work had drifted from the problem we believed in. We changed course instead of protecting the time and money already spent.',
  },
  {
    id: 'leoburnett',
    label: 'Agency & interaction',
    company: 'Leo Burnett',
    product: 'Arc Worldwide',
    descriptor: 'Global advertising agency',
    role: 'Interaction Designer',
    place: 'Turin, Piedmont, Italy',
    dates: 'Nov 2016 – Dec 2017',
    tier: 1,
    logo: '/about/logos/leo-burnett.svg',
    logoRatio: 1.389,
    logoInk: 0.241,
    brand: { light: '#101010', dark: '#101010' },
    logoTile: '#99ff00',
    line: 'Interaction design for Comau, Fiat Chrysler and FCA Bank.',
    story:
      'Working inside a global agency taught me what scale looks like, and showed me I wanted broader ownership than one small role in a very large mechanism.',
  },
  {
    id: 'automec',
    label: 'Manufacturing & operations',
    company: 'Manik Automec',
    descriptor: 'Auto components manufacturing',
    role: 'Communications and Operations',
    place: 'Faridabad, Haryana, India',
    dates: 'Jan 2018 – Dec 2019',
    tier: 2,
    logo: '/about/logos/manik-automec.svg',
    logoRatio: 0.968,
    logoInk: 0.435,
    logoSquare: '/about/logos/manik-automec-square.svg', // the company's square badge, with its own background
    brand: { light: 'linear-gradient(180deg, #1f6bff, #0a8cff)', dark: 'linear-gradient(180deg, #4a8bff, #3aa6ff)' },
    line: 'Engineering, making, operations and communication, inside my family’s business.',
    story:
      'It also made clear the kind of professional and ethical context I wanted to work in.',
  },
  {
    id: 'arcept',
    label: 'Independent practice',
    company: 'Arcept Design',
    descriptor: 'Independent design studio',
    role: 'Founder and Principal Designer',
    place: 'New Delhi, India',
    dates: 'Dec 2013 – Dec 2015',
    tier: 2,
    logo: '/about/logos/arcept.png',
    logoRatio: 0.906,
    logoInk: 0.682,
    logoScale: 1.35, // a detailed illustration; it needs more room than a wordmark to read
    // A raster illustration, kept as the artwork (background removed); not redrawn as a mask.
    logoArt: { light: '/about/logos/arcept.png', dark: '/about/logos/arcept.png' },
    brand: { light: null, dark: null },
    line: 'Founded and ran a studio while still in college, for two years.',
    story:
      'An early education in owning clients, decisions, delivery, and the consequences of my own judgment.',
  },
  {
    id: 'weirdlogics',
    label: 'Interaction & devices',
    company: 'Weird Logics',
    descriptor: 'Digital and iPad experiences',
    role: 'User Experience Designer',
    place: 'Gurugram, Haryana, India',
    dates: 'Jun 2012 – Aug 2013',
    tier: 2,
    logo: '/about/logos/weird-logics.svg',
    logoRatio: 1.8,
    logoInk: 0.532,
    brand: { light: '#36526a', dark: '#8fb0c8' },
    line: 'Early iPad and digital products, when product design in India still meant physical things.',
    story: 'Close to new devices and new interaction patterns while the language of the field was still forming.',
  },
  {
    id: 'creativegaga',
    label: 'Visual & editorial',
    company: 'Creative Gaga',
    descriptor: 'Art and design magazine',
    role: 'Design Intern',
    place: 'New Delhi, India',
    dates: 'Jun 2011 – Jul 2011',
    tier: 2,
    logo: '/about/logos/creative-gaga.svg',
    logoRatio: 2.412,
    logoInk: 0.587,
    logoSquare: '/about/logos/creative-gaga-square.svg', // the company's square badge, with its own background
    brand: { light: null, dark: null },
    line: 'A first professional role, inside a publication for art and design.',
    story: 'Working within a creative community, around people who made things for a living.',
  },
  {
    id: 'independent',
    label: 'Visual & independent',
    company: 'Independent',
    descriptor: 'Visual design for paying clients',
    role: 'Freelance designer',
    place: 'Delhi NCR, India',
    dates: 'From 18',
    tier: 2,
    logo: null,
    line: 'Flyers and visual work, paid, before any formal design education.',
    story: 'Freelance work carried on through college and early roles, turning private curiosity into practice.',
  },
];
