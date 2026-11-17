import localFont from 'next/font/local';

// Statements are set in the serif, reading copy in DM Sans, and the apparatus (section numbers,
// index, labels) in the site's IBM Plex Mono. Shared by /about and its lab routes.
// Each font's variable gives its family name (unhashed), so the names say which font it is: two
// pages' `display` faces would otherwise share one family name.
const averiaSerifLibre = localFont({
  src: [
    { path: '../fonts/google/averia-serif-libre/averia-serif-libre-italic-300.woff2', weight: '300', style: 'italic' },
    { path: '../fonts/google/averia-serif-libre/averia-serif-libre-italic-400.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/google/averia-serif-libre/averia-serif-libre-italic-700.woff2', weight: '700', style: 'italic' },
    { path: '../fonts/google/averia-serif-libre/averia-serif-libre-normal-300.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/google/averia-serif-libre/averia-serif-libre-normal-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/google/averia-serif-libre/averia-serif-libre-normal-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-abt-display',
});

const dmSansAbout = localFont({
  src: [
    { path: '../fonts/google/dm-sans/dm-sans-normal-100-1000.woff2', weight: '100 1000', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-abt-sans',
});

// Handwriting, for Education's notes in the margin.
const caveat = localFont({
  src: [
    { path: '../fonts/google/caveat/caveat-normal-500-600.woff2', weight: '500 600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-ed-hand',
});

export { averiaSerifLibre as display, dmSansAbout as sans, caveat as hand };
