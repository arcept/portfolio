import { Fraunces } from 'next/font/google';
import { navSans } from '@/components/nav-font';

// The page's faces: a soft display serif for headlines and figures, DM Sans for reading, and IBM Plex Mono
// for labels. DM Sans is the site nav's own instance and IBM Plex Mono the site's (app/layout.js), so
// neither loads twice.
export const display = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'opsz'], style: ['normal', 'italic'], display: 'swap', variable: '--cro-display-face' });

export const FONT_VARS = [display.variable, navSans.variable].join(' ');
