import localFont from 'next/font/local';

// The clock's flip digits: Doto, a dot-matrix face, like an LED board. Self-hosted with the site's other
// Google fonts (app/fonts/google), so a build never has to reach Google Fonts.
export const doto = localFont({
  src: [{ path: '../fonts/google/doto/doto-normal-700.woff2', weight: '700', style: 'normal' }],
  display: 'swap',
  variable: '--font-px-doto',
});
