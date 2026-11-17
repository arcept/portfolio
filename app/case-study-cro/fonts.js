import localFont from 'next/font/local';
import { navSans } from '@/components/nav-font';

// The page's faces: a soft display serif for headlines and figures, DM Sans for reading, and IBM Plex Mono
// for labels. DM Sans is the site nav's own instance and IBM Plex Mono the site's (app/layout.js), so
// neither loads twice.
// Fraunces, its variable files carrying the SOFT and opsz axes as well as the weight.
const frauncesCro = localFont({
  src: [
    { path: '../fonts/google/fraunces/fraunces-italic-100-900.woff2', weight: '100 900', style: 'italic' },
    { path: '../fonts/google/fraunces/fraunces-normal-100-900.woff2', weight: '100 900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--cro-display-face',
});

export const display = frauncesCro;

export const FONT_VARS = [display.variable, navSans.variable].join(' ');
