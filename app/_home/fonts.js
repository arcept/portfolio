import { Google_Sans } from 'next/font/google';

// The homepage's one face: the name band, the headline, the statement and the runner.
const googleSans = Google_Sans({ subsets: ['latin'], display: 'swap' });

// With the weight and tracking it takes as a display headline (the statement and runner cap the
// weight at 500).
export const FACE = { family: googleSans.style.fontFamily, weight: 600, tracking: '-0.03em' };
