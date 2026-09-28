import { DM_Sans } from 'next/font/google';

// The nav's face on every page, and the About page's reading face: the bar (Nav) and its phone menu
// (MobileMenu, which is portaled out of the bar, so it sets the variable itself).
export const navSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nav-sans',
});
