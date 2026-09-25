import localFont from 'next/font/local';
import { Newsreader } from 'next/font/google';
import Nav from '@/components/Nav';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import LangSwitch from '@/components/i18n/LangSwitch';
import { themeGateScript } from '@/components/theme/theme';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/case-study-kit/ScrollProgress';
import NarrationProvider from '@/components/narration/NarrationProvider';
import { NarrationUIProvider } from '@/components/narration/NarrationUI';
import { NarrationPanel } from '@/components/narration/NarrationDock';
import NarrationPlayer from '@/components/narration/NarrationPlayer';
import ListenToSection from '@/components/narration/ListenToSection';
import '../../components/narration/narration.css';
import narration from '../../public/case-studies/placement-hub/narration/narration.json';
import PlacementLang from './PlacementLang';
import PlacementBody from './PlacementBody';
import '../case-study-kit/article.css';
import '../case-study-kit/themes.css';
import '../case-study-kit/blocks.css';
import '../case-study-kit/hero.css';
import '../case-study-kit/story.css';

const neueAlteGrotesk = localFont({
  src: '../fonts/NeueAlteGrotesk-SemiBold.ttf',
  weight: '600',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
});

// Newsreader is reserved for the sentences that carry the argument (pull statements and quotes).
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata = {
  title: 'Making Placement Visible — Manik Madaan',
  description: 'Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.',
  // Next.js replaces the whole openGraph/twitter object per page rather than merging it with the
  // layout's, so the site's default share image is repeated explicitly here rather than assumed
  // inherited (it silently drops otherwise).
  openGraph: {
    title: 'Making Placement Visible — Manik Madaan',
    description: 'Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.',
    type: 'article',
    images: [{ url: '/og/default.jpg', width: 1200, height: 630, alt: 'Manik Madaan — Product Design Leader' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/default.jpg'],
    title: 'Making Placement Visible — Manik Madaan',
    description: 'Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.',
  },
};

// `version` is recorded by docs/narration/narrate.py when new audio is aligned: it changes the URLs, so a new
// render is never served from a cache alongside the old one.
const NARRATION_SRC = `/case-studies/placement-hub/narration/narration.json${narration.version ? `?v=${narration.version}` : ''}`;

// The narration for each language. Only English exists so far; a language without an entry uses the English one (and its
// dictionary says so on the buttons: nr.audioTag and nr.audioNote). To add one, record it, run it through docs/narration,
// publish it to its own folder and add a line here, e.g.  de: '/case-studies/placement-hub/narration/de/narration.json?v=…'
// (see docs/i18n/README.md, which also says what to change so its transcript is shown too).
const NARRATION_BY_LANGUAGE = { en: NARRATION_SRC };

// The sections that have a "Listen to this part" button. These are made here, on the server, and handed down.
const LISTEN_IDS = ['problem', 'evidence', 'reframing', 'leadership', 'product', 'handover', 'launch'];

export default function CaseStudyPlacement() {
  const listen = Object.fromEntries(LISTEN_IDS.map((id) => [id, <ListenToSection key={id} id={id} />]));
  return (
    <PlacementLang>
    <NarrationProvider src={NARRATION_BY_LANGUAGE}>
    <NarrationUIProvider>
    <div className="ph-page">
      {/* Puts the theme on <html> before anything paints (see theme.js). */}
      <script dangerouslySetInnerHTML={{ __html: themeGateScript() }} />
      <ScrollProgress />
      <Nav
        actions={
          <>
            <LangSwitch />
            <ThemeSwitch />
          </>
        }
      />

      <PlacementBody headlineFont={neueAlteGrotesk.className} fontVars={`${neueAlteGrotesk.variable} ${serif.variable}`} narrationDuration={narration.duration} listen={listen} />

      <Footer />
    </div>

    {/* The narration: a floating card that is a small player by default and expands to the full player (a sheet on phones). */}
    <NarrationPanel>
      <NarrationPlayer narration={narration} fontClass={serif.variable} />
    </NarrationPanel>
    </NarrationUIProvider>
    </NarrationProvider>
    </PlacementLang>
  );
}
