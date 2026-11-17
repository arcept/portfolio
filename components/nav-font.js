import localFont from 'next/font/local';

// The nav's face on every page (Nav), and the About page's reading face.
export const navSans = localFont({
  src: [
    { path: '../app/fonts/google/dm-sans/dm-sans-normal-100-1000.woff2', weight: '100 1000', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-nav-sans',
});
