import Nav from '@/components/Nav';
import AboutMotion from './about/AboutMotion';
import AboutThemeSwitch from './about/AboutThemeSwitch';
import { display, sans } from './about/fonts';
import { aboutThemeGate } from './about/theme';
import HomeIntro from './_home/HomeIntro';
import Hero from './_home/Hero';
import Statement from './_home/Statement';
import Runner from './_home/Runner';
import Work from './_home/Work';
import AboutMe from './_home/AboutMe';
import Leave from './_home/Leave';
import { homeIntroGate } from './_home/intro';
import './about/about.css';
import './about/resume/resume.css';
import './_home/home.css';

const TITLE = 'Manik Madaan — Product Design Leader';

// The runner (the scrolling line of words after the statement) is hidden for now; true brings it back.
const SHOW_RUNNER = false;
const DESCRIPTION = 'I build design functions and I still do the craft work to prove it.';

// Its own link-preview image (the pink-shirt portrait from the hero, cropped wide, with the name on
// it). A page's openGraph/twitter replaces the root layout's rather than merging with it, so every
// field the preview needs is set here.
export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.arcept.in',
    siteName: 'Manik Madaan',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og/home.jpg', width: 1200, height: 630, alt: 'Manik Madaan, Product Design Leader: an illustration of Manik sketching at a desk.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og/home.jpg'],
  },
};

// The homepage: the hero, the statement, the runner (hidden for now, SHOW_RUNNER), the selected work,
// and the About section that ends the page in place of the site footer (app/_home, in the About page's system and its loading curtain).
export default function Home() {
  return (
    <AboutMotion>
      <div className={`abt ${display.variable} ${sans.variable}`}>
        {/* Puts the site's theme on <html> before anything paints (the system's, unless chosen). */}
        <script dangerouslySetInnerHTML={{ __html: aboutThemeGate() }} />
        {/* Decides, before anything paints, whether the loading curtain shows (see _home/intro.js). */}
        <script dangerouslySetInnerHTML={{ __html: homeIntroGate() }} />
        <HomeIntro>
          <Nav actions={<AboutThemeSwitch />} />
          <div className="hx hx-i">
            <main>
              <Hero />
              <Statement />
              {SHOW_RUNNER && <Runner />}

              <Work />

              <AboutMe />
            </main>
          </div>
          {/* Any link to another page leaves under a curtain in that page's colour. */}
          <Leave />
        </HomeIntro>
      </div>
    </AboutMotion>
  );
}
