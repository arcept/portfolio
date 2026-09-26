import localFont from 'next/font/local';

// The case studies' display face, for the closing name at the foot of /about (StoryBridge). Not
// preloaded: it is the last thing on the page, so it can load after everything above it.
export const neueAlte = localFont({
  src: '../fonts/NeueAlteGrotesk-SemiBold.ttf',
  weight: '600',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-wm-neue-alte',
});
