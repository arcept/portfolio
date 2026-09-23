import { Averia_Serif_Libre, DM_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { aboutThemeGate } from './theme';
import AboutMotion from './AboutMotion';
import AboutThemeSwitch from './AboutThemeSwitch';
import AboutIndex from './AboutIndex';
import HeroWash from './HeroWash';
import Opening from './Opening';
import Lenses from './Lenses';
import './about.css';

// Statements are set in the serif, reading copy in DM Sans, and the apparatus (section numbers,
// index, labels) in the site's IBM Plex Mono.
const display = Averia_Serif_Libre({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-abt-display',
});

const sans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-abt-sans',
});

export const metadata = {
  title: 'About — Manik Madaan',
  description:
    'Manik Madaan is a product design leader based in Delhi NCR, working across freelance practice, studios, agencies, startups, consulting, and design leadership.',
};

// Sections are added one at a time; the margin index lists the ones that exist.
// The narrative blueprint and content drafts behind this page live in app/about/reference/, which is
// gitignored: it names former colleagues and discusses compensation, and this repo is public.
const SECTIONS = [
  { id: 'opening', label: 'Introduction' },
  { id: 'how-i-work', label: 'How I work' },
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
            <Lenses />
          </main>
        </div>

        <Footer />
      </div>
    </AboutMotion>
  );
}
