// Section 05's copy: the schools, in the order they happened. Read by the layout lab
// (/about/lenses-lab) and, once a layout is chosen, by the page.
//
// `logos` lists the institution's marks (the master's shows NABA's alone): `src` names the
// pair of files in public/about/logos/edu/ (`-light` and `-dark`, one per theme), `ratio` is width over
// height and `ink` the share of that box the mark covers, so they can be drawn at the same visual weight;
// `scale` enlarges a lockup whose fine print would not read at the shared weight; `mono` is the
// monogram used where a full lockup will not fit. `major` is the tag on the degree that
// matters most; `emphasis` sets a degree a step larger in the lists (the two full degrees). `small: true` is a short programme rather than a
// degree, given a lighter entry. `answer` is what design meant after that school, for the layouts that
// tell the section as one changing answer. `short` is the one-line version for layouts that show all four
// at once. `continent` groups the schools for the passport layout.

export const EDUCATION_HEADLINES = [
  'Four schools, three continents, one changing answer.',
  'Education across disciplines and cultures.',
  'I kept finding out design was bigger than I thought.',
  'Engineering taught me how things are made. Design taught me why.',
];

export const EDUCATION_INTRO =
  'I started in engineering, left it for design, and then kept learning what design could mean, in New Delhi, New Mexico and Milan.';

export const SCHOOLS = [
  {
    id: 'northcap',
    discipline: 'Engineering',
    programme: 'B.Tech, Mechanical Engineering',
    school: 'The NorthCap University',
    formerly: 'ITM University', // Institute of Technology and Management
    place: 'Gurugram, India',
    city: 'Gurugram',
    continent: 'Asia',
    years: '2009 – 2011',
    from: 2009,
    to: 2011,
    status: 'Left after two years',
    logos: [{ name: 'The NorthCap University', mono: 'NCU', src: 'northcap', ratio: 1.51, ink: 0.354 }],
    short: 'Manufacturing processes were the only classes that felt alive. I left for design.',
    line: 'Two years of mechanical engineering. Manufacturing processes were the only classes that felt alive, and I dropped out because design held my attention in a way engineering did not.',
    answer: 'look',
    answerNote: 'What I believed before design school',
  },
  {
    id: 'pearl',
    discipline: 'Communication design',
    programme: 'BA (Hons), Communication Design',
    school: 'Pearl Academy',
    place: 'New Delhi, India',
    city: 'New Delhi',
    continent: 'Asia',
    years: '2011 – 2015',
    from: 2011,
    to: 2015,
    award: 'Merit scholarship',
    emphasis: true,
    logos: [{ name: 'Pearl Academy', mono: 'PA', src: 'pearl', ratio: 5.859, ink: 0.182 }],
    short: 'Design grew from how things look into how they work, and why.',
    line: 'I arrived confident in visual design and learned how little of design I understood. It moved from appearance to function, reasoning, first principles, culture and context.',
    answer: 'work',
  },
  {
    id: 'santafe',
    discipline: 'Micro cinema',
    programme: 'Micro cinema',
    school: 'Santa Fe University of Art and Design',
    place: 'Santa Fe, New Mexico, USA',
    city: 'Santa Fe',
    continent: 'North America',
    years: '2013',
    from: 2013,
    to: 2013,
    small: true,
    logos: [{ name: 'Santa Fe University of Art and Design', mono: 'SF', src: 'sfuad', ratio: 4.234, ink: 0.263, scale: 1.5 }],
    short: 'Culture stopped feeling separate from design.',
    line: 'A few months studying micro cinema, among people from many countries. Culture stopped feeling separate from design.',
    answer: 'meet',
  },
  {
    id: 'domus',
    discipline: 'Interaction design',
    programme: 'MA, Interaction Design',
    school: 'Domus Academy (NABA)',
    schoolLead: 'Domus Academy', // the part in bold; other schools are bold in full
    place: 'Milan, Italy',
    city: 'Milan',
    continent: 'Europe',
    years: '2016 – 2017',
    from: 2016,
    to: 2017,
    major: 'Master’s degree',
    emphasis: true,
    logos: [{ name: 'NABA', mono: 'NABA', src: 'naba', ratio: 3.549, ink: 0.333, scale: 1.75 }],
    // Where there is room for both (the school named under the answer), Domus Academy's beside NABA's.
    sourceLogos: [
      { name: 'Domus Academy', mono: 'DA', src: 'domus', ratio: 4.264, ink: 0.139, scale: 1.9 },
      { name: 'NABA', mono: 'NABA', src: 'naba', ratio: 3.549, ink: 0.333, scale: 1.4 },
    ],
    short: 'Interaction design among business, luxury, automotive and industrial designers.',
    line: 'Interaction designers alongside business design, luxury brand management, automotive and industrial design. The projects, the people, physical computing and living in Milan taught as much as the modules.',
    answer: 'behave',
  },
];

// The changing answer, one per school: "Design is how things ___."
export const ANSWERS = {
  look: 'Design is how things look.',
  work: 'Design is how things work.',
  meet: 'Design is where cultures meet.',
  behave: 'Design is how people and things behave together.',
};
