import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Card from '@/components/Card';
import StatCounter from '@/components/StatCounter';
import CROCover from '@/components/CROCover';
import AboutMotion from './about/AboutMotion';
import AboutThemeSwitch from './about/AboutThemeSwitch';
import { display, sans } from './about/fonts';
import HomeIntro from './_home/HomeIntro';
import Hero from './_home/Hero';
import Statement from './_home/Statement';
import Runner from './_home/Runner';
import { homeIntroGate } from './_home/intro';
import { homeThemeGate } from './_home/theme';
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

// The homepage: the hero, the statement and the runner (app/_home, in the About page's system and
// its loading curtain), then the selected work and a short about, restyled to follow the theme until
// they are rebuilt.
export default function Home() {
  return (
    <AboutMotion>
      <div className={`abt ${display.variable} ${sans.variable}`}>
        {/* Puts the theme on <html> before anything paints: light, unless chosen otherwise. */}
        <script dangerouslySetInnerHTML={{ __html: homeThemeGate() }} />
        {/* Decides, before anything paints, whether the loading curtain shows (see _home/intro.js). */}
        <script dangerouslySetInnerHTML={{ __html: homeIntroGate() }} />
        <HomeIntro>
          <Nav actions={<AboutThemeSwitch />} />
          <div className="hx hx-i">
            <main>
              <Hero />
              <Statement />
              <Runner />

              <section className="section wrap wrap--wide home-old" id="work">
                <Reveal>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
                    <h2 className="text-heading font-semibold">Selected work</h2>
                    <span className="text-caption text-fog">Archive is being rebuilt — updating regularly</span>
                  </div>
                </Reveal>

                <div className="work-grid">
                  <Reveal>
                    <Card href="/case-study-oms" className="card--featured">
                      <div className="card__cover">Cover art pending</div>
                      <StatCounter value={-18} suffix="%" label="Drop/dispose rate after the rebuild" />
                      <div className="card__tags">
                        <span className="tag">Product Strategy</span>
                        <span className="tag">0-to-1</span>
                        <span className="tag">Interactive Prototype</span>
                      </div>
                      <h3 className="card__title font-semibold">
                        Rebuilding OMS: A v3.0 Retrospective
                      </h3>
                      <p className="text-body text-fog">
                        Novatr&apos;s entire sales org ran on a tool engineering had built with no product or
                        design input. The product-and-design-led rebuild that replaced it — with a live,
                        click-through prototype you can try yourself.
                      </p>
                      <span className="card__cta">Read the case study →</span>
                    </Card>
                  </Reveal>

                  <Reveal delay={0.08}>
                    <Card href="/case-study-placement" className="card--featured">
                      <div className="card__cover card__cover--image">
                        <img
                          src="/case-studies/placement-hub/body/hero-home-updates.png"
                          alt="Placement Hub home with the updates panel open, above the eligibility and interest-form banners."
                          width={1440}
                          height={1000}
                          loading="lazy"
                        />
                      </div>
                      <StatCounter value={30} suffix="%" label="of placements were self-placed, and invisible to the company" />
                      <div className="card__tags">
                        <span className="tag">Product Design Leadership</span>
                        <span className="tag">Systems Design</span>
                        <span className="tag">Interactive Prototype</span>
                      </div>
                      <h3 className="card__title font-semibold">
                        Making Placement Visible: Designing Novatr&apos;s Placement Hub
                      </h3>
                      <p className="text-body text-fog">
                        Learners bought placement support but experienced it as a black box. I led the design
                        direction for a learner portal and a reusable placement system that made progress,
                        eligibility and next steps visible — with a live, click-through prototype you can try
                        yourself.
                      </p>
                      <span className="card__cta">Read the case study →</span>
                    </Card>
                  </Reveal>

                  <Reveal delay={0.16}>
                    <Card href="/case-study-cro" className="card--featured">
                      <CROCover />
                      <StatCounter value={20} suffix="%" label="Conversion improvement" />
                      <div className="card__tags">
                        <span className="tag">Product Strategy</span>
                        <span className="tag">Behavioral Data</span>
                        <span className="tag">Cross-functional Leadership</span>
                      </div>
                      <h3 className="card__title font-semibold">
                        Designing for Confidence: A Data-Informed Redesign of Novatr&apos;s Flagship Course Page
                      </h3>
                      <p className="text-body text-fog">
                        How behavioral data — not more traffic — became the difference between hesitation
                        and conversion on Novatr&apos;s highest-revenue product page, and how that changed the
                        way four teams made decisions together.
                      </p>
                      <span className="card__cta">Read the case study →</span>
                    </Card>
                  </Reveal>

                  <div className="work-support-grid">
                    <Reveal delay={0.24}>
                      <Card href="/case-study-novatr-lms">
                        <div className="card__cover">Cover art pending</div>
                        <div className="card__tags">
                          <span className="tag tag--progress">Case study in progress</span>
                          <span className="tag">Product Strategy</span>
                          <span className="tag">Design Systems</span>
                          <span className="tag">0-to-1</span>
                        </div>
                        <h3 className="card__title font-semibold">
                          Building the Novatr LMS
                        </h3>
                        <p className="text-body text-fog">
                          A 0-to-1 platform build, design systems, and cross-functional leadership behind
                          Novatr&apos;s Learning Management System.
                        </p>
                        <span className="card__cta">Read the case study →</span>
                      </Card>
                    </Reveal>

                    <Reveal delay={0.32}>
                      <Card href="/case-study-novatr-team">
                        <div className="card__cover">Cover art pending</div>
                        <div className="card__tags">
                          <span className="tag tag--progress">Case study in progress</span>
                          <span className="tag">Team Building</span>
                          <span className="tag">Hiring</span>
                          <span className="tag">Design Leadership</span>
                        </div>
                        <h3 className="card__title font-semibold">
                          Building a Design Team from Zero
                        </h3>
                        <p className="text-body text-fog">
                          The Novatr team-building story — hiring, structure, and design leadership
                          from the very first hire.
                        </p>
                        <span className="card__cta">Read the case study →</span>
                      </Card>
                    </Reveal>
                  </div>
                </div>
              </section>

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
        </HomeIntro>
      </div>
    </AboutMotion>
  );
}
