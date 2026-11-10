import { Fraunces, Instrument_Serif } from 'next/font/google';
import { navSans } from '@/components/nav-font';

// The faces the hero options try, beside the page's own (Neue Alte Grotesk and Newsreader, page.js), DM Sans
// (the nav's) and IBM Plex Mono (the site's). None is preloaded: only a reader comparing the options needs them.
//   Tracker  Fraunces, the CRO case study's serif
//   Box      Instrument Serif, tall and narrow
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  variable: '--phx-fraunces',
});

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  variable: '--phx-instrument',
});

export const HERO_FONTS = [fraunces.variable, instrument.variable, navSans.variable].join(' ');
