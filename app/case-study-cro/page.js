import { Suspense } from 'react';
import Nav from '@/components/Nav';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import { themeGateScript } from '@/components/theme/theme';
import SiteFooter from '@/components/case-study-kit/SiteFooter';
import CaseStudyEnd from '@/components/case-study-kit/CaseStudyEnd';
import ScrollProgress from '@/components/case-study-kit/ScrollProgress';
import CroBody from './CroBody';
import { META } from './content';
import { FONT_VARS } from './fonts';
import '../case-study-kit/themes.css';
import '../case-study-kit/hero.css';
import '../about/about.css';
import '../about/resume/resume.css';
import '../_home/home.css';
import './cro.css';
import './cro-tiles.css';
import './cro-brief-options.css';
import './cro-nav.css';
import './cro-chapters.css';
import './cro-collage.css';

export const metadata = {
  title: META.title,
  description: META.description,
  // Next.js replaces the whole openGraph/twitter object per page rather than merging it with the
  // layout's, so the site's default share image is repeated explicitly here rather than assumed
  // inherited (it silently drops otherwise).
  openGraph: {
    title: META.title,
    description: META.description,
    type: 'article',
    images: [{ url: '/og/default.jpg', width: 1200, height: 630, alt: 'Manik Madaan — Product Design Leader' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/default.jpg'],
    title: META.title,
    description: META.description,
  },
};

// With motion allowed, the hero starts hidden (cro.css) and its entrance reveals it; without it, or
// without script, it is simply there.
const MOTION_GATE = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('cro-motion');`;

export default function CaseStudyCRO() {
  return (
    <div className={`cro ${FONT_VARS}`}>
      {/* Puts the theme on <html> before anything paints (see theme.js). */}
      <script dangerouslySetInnerHTML={{ __html: themeGateScript() }} />
      {/* A flag that holds the hero back until its entrance plays. */}
      <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
      <ScrollProgress />
      <Nav actions={<ThemeSwitch />} />

      {/* The body reads ?compare, ?brief= and ?form= (the "In brief" layouts and the form options, kept to compare) in the browser, as the site is a static export. */}
      <Suspense fallback={null}>
        <CroBody />
      </Suspense>

      <SiteFooter>
        <CaseStudyEnd current="cro" />
      </SiteFooter>
    </div>
  );
}
