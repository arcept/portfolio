import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import AboutMotion from './about/AboutMotion';
import AboutThemeSwitch from './about/AboutThemeSwitch';
import { display, sans } from './about/fonts';
import { aboutThemeGate } from './about/theme';
import HomeIntro from './_home/HomeIntro';
import Hero from './_home/Hero';
import Statement from './_home/Statement';
import Runner from './_home/Runner';
import Work from './_home/Work';
import Leave from './_home/Leave';
import { homeIntroGate } from './_home/intro';
import './about/about.css';
import './_home/home.css';

const TITLE = 'Manik Madaan — Product Design Leader';
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

// The homepage: the hero, the statement, the runner and the selected work (app/_home, in the About
// page's system and its loading curtain), then a short about, restyled to follow the theme until it is
// rebuilt.
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
              <Runner />

              <Work />

              <section className="section wrap wrap--wide home-old" id="about">
                <Reveal>
                  <h2 className="text-heading font-semibold" style={{ marginBottom: '24px' }}>About</h2>
                  <p className="text-body text-mist" style={{ maxWidth: '720px', marginBottom: '16px' }}>
                    I&apos;m a Gurugram-based product designer and design leader. Most recently I was Product
                    Design Manager at Novatr (previously Oneistox), where I led design for a Learning
                    Management System that supported a 4x increase in company revenue, built a unified
                    design system across web and mobile, and ran the cross-functional processes that let
                    design, product, marketing, and engineering move in the same direction. Before that,
                    I built and led design teams at Hapramp Studio and Shyft, and started my career in
                    interaction design at Leo Burnett after a Master&apos;s in Interaction Design from Domus
                    Academy in Milan.
                  </p>
                  <p className="text-body text-mist" style={{ maxWidth: '720px' }}>
                    I&apos;m currently rebuilding this site and my case study archive after a career break —
                    partly to have a proper home for this work, and partly to get hands-on with AI-assisted
                    design and development again. This site itself is one of those projects: built and
                    deployed with AI-assisted tooling as I go.
                  </p>
                </Reveal>
              </section>
            </main>
            <Footer />
          </div>
          {/* Any link to another page leaves under a curtain in that page's colour. */}
          <Leave />
        </HomeIntro>
      </div>
    </AboutMotion>
  );
}
