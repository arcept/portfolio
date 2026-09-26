// Section 06's copy: the sabbatical. Read by the layout lab (/about/lenses-lab) and, once a layout is
// chosen, by the page.
//
// Facts come only from Draft 3 and the blueprint's locked truths; the wording is new. The rules it keeps
// (blueprint §10): an intentional break, not a gap repaired; nothing reframed as design work that was
// not; trading as judgment under uncertainty, never as a skill or a thrill; no criticism of Novatr; no
// "came back stronger".

export const SABBATICAL_DATES = 'Aug 2024 – Dec 2025';

export const SABBATICAL_HEADLINES = [
  'I stopped, on purpose.\nAway long enough to miss it.', // two lines
  'I stopped, on purpose.',
  'A pause, taken whole.',
  'The break was a real one.',
  'Away long enough to miss it.',
  'A deliberate pause, on purpose.',
];

export const SABBATICAL_INTRO =
  'After Novatr, I took a sabbatical. I had spent years building a career, and from the outside it looked like it was working. The work paid well, and I kept finishing products, but I had stopped feeling that I was adding value. The joy that made me choose design had worn thin, and I did not want to carry that exhaustion into another company. So I did not go looking for the next job. I let the break be a real one.';

// The two parallel lines, read across in pairs.
export const PAIRS = [
  {
    away: 'A role that paid well and looked like success.',
    back: 'A clearer sense of what I need from the next one.',
  },
  {
    away: 'A joy in the work that had been wearing thin for a long time.',
    back: 'The curiosity that made me choose design in the first place.',
  },
  {
    away: 'The habit of staying in a poor fit until it wore me out.',
    back: 'The habit of checking the fit before I begin.',
  },
  {
    away: 'The interface as the edge of what I could make.',
    back: 'More of the working product, now that I can build it myself with AI.',
  },
  {
    away: 'Screens, most of the day.',
    back: 'Furniture I built, a garden, and my health.',
  },
];

export const LINE_AWAY = 'What I stepped away from';
export const LINE_BACK = 'What I returned with';

// What the time held, in no particular order.
export const HELD = [
  { id: 'trading', text: 'Traded futures and options' },
  { id: 'consulting', text: 'Consulted, selectively' },
  { id: 'furniture', text: 'Built furniture' },
  { id: 'travel', text: 'Travelled' },
  { id: 'cooking', text: 'Cooked' },
  { id: 'garden', text: 'Gardened' },
  { id: 'health', text: 'Put my health first' },
  { id: 'learning', text: 'Learned things with no career use: cars, space, rockets' },
];

// Trading, as its own beat.
export const TRADING = {
  kicker: 'What trading taught me',
  line: 'A sound process can still lose.',
  body: 'During the break I traded futures and options, with real money, and I made and lost it. It taught me to think differently about probability, risk and emotional judgment: to set the risk before the trade, to judge a decision apart from its outcome, and to notice how quickly ego turns one loss into a bigger one. It is not design work, but it changed how I decide.',
};

// How it ended: the pull back toward making.
export const RETURN =
  'More recently, AI gave me a familiar kind of excitement. I could move beyond the interface and build more of a working product myself. It felt less like returning to an old practice, and more like finding another boundary I could now cross.';

// Draft 3's original wording, kept as an alternative to the rewrite above (which stays close to it) (the lab can switch between
// them). The trading paragraph drops Draft 3's list of activities, which the section shows on its own,
// and keeps its sentences otherwise.
export const COPY = {
  rewritten: {
    intro: SABBATICAL_INTRO,
    trading: TRADING.body,
    ret: RETURN,
  },
  draft: {
    intro:
      'After Novatr, I took a sabbatical. I had spent years building a career and reached a place that looked successful from the outside. The work paid well. I was also losing the joy that made me choose design in the first place. I did not want to carry that exhaustion directly into another company.',
    trading:
      'During the break I traded futures and options, and made and lost money. Trading taught me to think differently about probability, risk, emotional judgment, and the fact that a sound process can still produce an unfavourable outcome.',
    ret:
      'More recently, AI gave me a familiar kind of excitement. I could begin moving beyond the interface and build more of a working product myself. It felt less like returning to an old practice and more like discovering another boundary that had become possible to cross.',
  },
};
