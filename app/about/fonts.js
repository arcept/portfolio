import { Averia_Serif_Libre, Caveat, DM_Sans } from 'next/font/google';

// Statements are set in the serif, reading copy in DM Sans, and the apparatus (section numbers,
// index, labels) in the site's IBM Plex Mono. Shared by /about and its lab routes.
export const display = Averia_Serif_Libre({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-abt-display',
});

export const sans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-abt-sans',
});

// Handwriting, for Education's notes in the margin.
export const hand = Caveat({ subsets: ['latin'], weight: ['500', '600'], display: 'swap', variable: '--font-ed-hand' });
