import localFont from 'next/font/local';

// The homepage's one face: the name band, the headline, the statement and the runner.
const googleSans = localFont({
  src: [
    { path: '../fonts/google/google-sans/google-sans-normal-400-700.woff2', weight: '400 700', style: 'normal' },
  ],
  display: 'swap',
});

// Google Sans's arrows and symbols (← → ↗ ✦ ▲ …), which Google serves from a file of their own: listed
// straight after the face, so those characters still come from Google Sans and not the system font.
const googleSansSymbols = localFont({
  src: [
    { path: '../fonts/google/google-sans/google-sans-symbols-normal-400-700.woff2', weight: '400 700', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

// The face, then its symbols, then the metric-matched fallback.
const [face, ...fallback] = googleSans.style.fontFamily.split(', ');
const family = [face, googleSansSymbols.style.fontFamily, ...fallback].join(', ');

// With the weight and tracking it takes as a display headline (the statement and runner cap the
// weight at 500).
export const FACE = { family, weight: 600, tracking: '-0.03em' };
