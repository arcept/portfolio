import { Inter, IBM_Plex_Sans, IBM_Plex_Mono, Figtree } from 'next/font/google';
import './globals.css';
import Analytics from '@/components/Analytics';

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

// Available as `font-figtree` (tailwind.config.js) — not applied anywhere by default.
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-figtree',
});

// The site's default link-preview card (WhatsApp, iMessage, Slack, Twitter/X, …): every page inherits
// this unless it sets its own `openGraph`/`twitter` (as /about does, with its own image). `metadataBase`
// is required so the relative image path below resolves to an absolute https://www.arcept.in/… URL —
// without it, platforms that don't resolve relative OG URLs show no image at all.
const SITE_URL = 'https://www.arcept.in';
const DEFAULT_TITLE = 'Manik Madaan — Product Design Leader';
const DEFAULT_DESCRIPTION =
  "Manik Madaan — Product Design Leader. Design systems, 0-to-1 product, and teams that ship with confidence. Case studies and background.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Manik Madaan',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og/default.jpg', width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og/default.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${figtree.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
