import { DM_Sans } from 'next/font/google';

// The phone menu's face (MobileMenu), the About page's reading face. Not preloaded: the menu is only
// opened on phones, and only sometimes.
export const menuSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-menu-sans',
});
