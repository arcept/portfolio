import localFont from 'next/font/local';
import { navSans } from '@/components/nav-font';

// The faces the hero options try, beside the page's own (Neue Alte Grotesk and Newsreader, page.js), DM Sans
// (the nav's) and IBM Plex Mono (the site's). None is preloaded: only a reader comparing the options needs them.
//   Tracker  Fraunces, the CRO case study's serif
//   Box      Instrument Serif, tall and narrow
const frauncesHero = localFont({
  src: [
    { path: '../../fonts/google/fraunces/fraunces-italic-100-900.woff2', weight: '100 900', style: 'italic' },
    { path: '../../fonts/google/fraunces/fraunces-normal-100-900.woff2', weight: '100 900', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  variable: '--phx-fraunces',
});

const instrumentSerif = localFont({
  src: [
    { path: '../../fonts/google/instrument-serif/instrument-serif-italic-400.woff2', weight: '400', style: 'italic' },
    { path: '../../fonts/google/instrument-serif/instrument-serif-normal-400.woff2', weight: '400', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  variable: '--phx-instrument',
});

export const HERO_FONTS = [frauncesHero.variable, instrumentSerif.variable, navSans.variable].join(' ');
