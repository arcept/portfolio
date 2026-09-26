import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { aboutThemeGate } from './theme';
import AboutMotion from './AboutMotion';
import AboutThemeSwitch from './AboutThemeSwitch';
import AboutIndex from './AboutIndex';
import HeroWash from './HeroWash';
import Opening from './Opening';
import LoopBand from './LoopBand';
import Lenses from './Lenses';
import Leadership from './Leadership';
import Experience from './Experience';
import Education from './Education';
import Sabbatical from './Sabbatical';
import { display, sans } from './fonts';
import './about.css';
import './experience.css';
import './education.css';
import './sabbatical.css';
import './resume/resume.css';

const TITLE = 'About — Manik Madaan';
const DESCRIPTION =
  'Manik Madaan is a product design leader based in Delhi NCR, working across freelance practice, studios, agencies, startups, consulting, and design leadership.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Its own link-preview image (the résumé dialog's illustration, captioned) in place of the site's
  // default card — openGraph.images here replaces the root layout's; everything else in openGraph
  // (siteName, locale, …) is still inherited from there.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'profile',
    images: [{ url: '/og/about.jpg', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og/about.jpg'],
  },
};

// Sections are added one at a time; the margin index lists the ones that exist.
// The narrative blueprint and content drafts behind this page live in app/about/reference/, which is
// gitignored: it names former colleagues and discusses compensation, and this repo is public.
const SECTIONS = [
  { id: 'opening', label: 'Introduction' },
  { id: 'how-i-work', label: 'How I work' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'sabbatical', label: 'Sabbatical' },
];

export default function About() {
  return (
    <AboutMotion>
      <div className={`abt ${display.variable} ${sans.variable}`}>
        {/* Puts the theme on <html> before anything paints (see theme.js). */}
        <script dangerouslySetInnerHTML={{ __html: aboutThemeGate() }} />
        {/* Outside .abt-shell so it spans the viewport, not the reading container. */}
        <HeroWash />
        <Nav actions={<AboutThemeSwitch />} />

        <div className="abt-shell">
          <AboutIndex sections={SECTIONS} />
          <main>
            <Opening />
            <LoopBand />
            <Lenses />
            <Leadership />
            <Experience />
            <Education />
            <Sabbatical />
          </main>
        </div>

        <Footer />
      </div>
    </AboutMotion>
  );
}
