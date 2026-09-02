import { Inter, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
});

export const metadata = {
  title: 'Manik Madaan — Product Design Leader',
  description: "Manik Madaan — Product Design Leader. Design systems, 0-to-1 product, and teams that ship with confidence. Case studies and background.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
