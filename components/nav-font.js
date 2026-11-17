import { DM_Sans } from 'next/font/google';

// The nav's face on every page (Nav), and the About page's reading face.
export const navSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nav-sans',
});
