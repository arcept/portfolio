import localFont from 'next/font/local';
import './globals.css';
import Analytics from '@/components/Analytics';
import BrowserTint from '@/components/BrowserTint';

// The site's Google fonts are self-hosted (app/fonts/google): a build never depends on reaching Google.
const inter = localFont({
  src: [
    { path: './fonts/google/inter/inter-normal-100-900.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-inter',
});

const ibmPlexSans = localFont({
  src: [
    { path: './fonts/google/ibm-plex-sans/ibm-plex-sans-normal-300-700.woff2', weight: '300 700', style: 'normal' },
  ],
  variable: '--font-ibm-plex-sans',
});

const ibmPlexMono = localFont({
  src: [
    { path: './fonts/google/ibm-plex-mono/ibm-plex-mono-normal-300.woff2', weight: '300', style: 'normal' },
    { path: './fonts/google/ibm-plex-mono/ibm-plex-mono-normal-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/google/ibm-plex-mono/ibm-plex-mono-normal-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/google/ibm-plex-mono/ibm-plex-mono-normal-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/google/ibm-plex-mono/ibm-plex-mono-normal-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-ibm-plex-mono',
});

// Available as `font-figtree` (tailwind.config.js) — not applied anywhere by default.
const figtree = localFont({
  src: [
    { path: './fonts/google/figtree/figtree-normal-300-700.woff2', weight: '300 700', style: 'normal' },
  ],
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
        <BrowserTint />
      </body>
    </html>
  );
}
