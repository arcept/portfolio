import localFont from 'next/font/local';
import { Newsreader } from 'next/font/google';
import Nav from '@/components/Nav';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import { LIGHT_PAGE, themeGateScript } from '@/components/theme/theme';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';
import PrototypeEmbed from '@/components/PrototypeEmbed';
import CaseStudyNav from '@/components/CaseStudyNav';
import ScrollRise from '@/components/placement/ScrollRise';
import PlacementSections from './sections';
import '../case-study-placement-light/light.css';
import './dark.css';
import VelarisBackground from '@/components/VelarisBackground';

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
  description:
    'Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.',
};

const sections = [
  { id: 'problem', label: 'The problem' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'reframing', label: 'Reframing' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'product', label: 'The product' },
  { id: 'handover', label: 'Handover' },
  { id: 'launch', label: 'Launch and measurement' },
];

export default function CaseStudyPlacement() {
  return (
    <>
      {/* Sends light-theme visitors to the light version before anything paints (see theme.js). */}
      <script dangerouslySetInnerHTML={{ __html: themeGateScript('dark', LIGHT_PAGE) }} />
      <Nav actions={<ThemeSwitch page="dark" siblingHref={LIGHT_PAGE} variant="cs" />} />

      <header className="cs-hero">
        <VelarisBackground colors={['#3b82f6', '#2563eb', '#0A1A4F', '#08090A']} bg="#08090A" />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(180deg, rgba(10, 26, 79, 0) 60%, #08090A 100%)',
            pointerEvents: 'none',
          }}
        />
        <div className="wrap wrap--wide" style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb" style={{ marginBottom: '32px' }}>
            <a href="/">← Back to all work</a>
          </div>

          <div className="cs-header-grid">
            <Reveal>
              <p className="text-caption text-fog" style={{ marginBottom: '16px' }}>
                Case study · Product design leadership
              </p>
              <h1
                className={neueAlteGrotesk.className}
                style={{
                  color: '#fff',
                  fontSize: 'clamp(30px, 4.2vw, 42px)',
                  fontWeight: 600,
                  lineHeight: '110%',
                  letterSpacing: '-0.42px',
                  marginBottom: '16px',
                  maxWidth: '24ch',
                }}
              >
                Making India’s biggest AEC education platform’s placement process visible to learners
              </h1>
              <p className="text-body text-mist" style={{ maxWidth: '720px' }}>
                Learners bought placement support but experienced it as a black box. I led the design
                direction for a learner portal and reusable placement system that made progress,
                eligibility, opportunities, and next steps visible.
              </p>

              <MetaStrip
                className="meta-strip--stacked"
                items={[
                  { label: 'Company', value: 'Novatr, an AEC education company' },
                  { label: 'Product', value: 'Placement Portal' },
                  { label: 'Role', value: 'Product Design Manager / Design Lead' },
                  { label: 'Timeline', value: 'Approximately three months to launch' },
                  {
                    label: 'Team',
                    value:
                      'Manik Madaan, Product Design Manager · Sanya, Product Designer · Swati, Product Manager · placement operations and engineering',
                    wide: true,
                  },
                  {
                    label: 'Scope',
                    value:
                      'Learner portal, Retool workflow adaptations for operations, and reusable status and data foundations for future internal and hiring-partner products',
                    wide: true,
                  },
                ]}
              />

              <div className="hero-actions" style={{ marginTop: '24px' }}>
                <a href="#prototype" className="btn btn--rainbow-outline">
                  Try the prototype ↓
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="cs-hero-cover cs-hero-frame">
                <img
                  src="/case-studies/placement-hub/body/hero-home-updates.png"
                  alt="Placement Hub home with the updates panel open, listing application updates and new opportunities, above the eligibility and interest-form banners."
                  width={1440}
                  height={1000}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <ScrollRise>
      <PrototypeEmbed
        versions={[
          {
            id: 'hub',
            label: 'Placement Hub',
            eyebrow: 'Interactive prototype · Placement Hub',
            description:
              'A working prototype of the placement experience: home, the jobs board, job descriptions, applications and the interest form. Every application status is live — use the beaker button at the bottom right of the frame to act as the placement team and move an application through its stages.',
            url: 'placement-hub.novatr.internal/home',
            embedSrc: '/case-studies/placement-hub/prototype/index.html',
            fullSrc: '/case-studies/placement-hub/prototype/index.html',
            // Render the prototype as it would look on a large 1920px desktop screen, then scale the
            // whole thing down to fit the frame — like zooming out a real browser window, not
            // squeezing the layout (same approach as the OMS embed).
            frameWidth: 1920,
            frameBackground: '#fcfcfd',
          },
        ]}
        title="Placement Hub interactive prototype"
        heading="See Placement Hub, live"
        note="Sample data throughout is synthetic. Scroll and click inside the frame — it's the full prototype, just boxed in. Try the interest form from the home banner, apply to a job, or open the beaker button to move an application through its stages."
        mobileImage="/case-studies/placement-hub/preview.png"
        mobileImageAlt="Placement Hub home showing the eligibility banner, the interest-form banner and the learner's applications in progress"
      />
      </ScrollRise>

      <div className="cs-article-grid wrap wrap--wide">
        <main className={`lx pcs ${neueAlteGrotesk.variable} ${serif.variable}`}>
          <div className="lx-stack">
            <PlacementSections />
          </div>
        </main>

        <CaseStudyNav sections={sections} />
      </div>

      <div className="cs-footer-nav wrap wrap--wide">
        <a href="/" className="btn btn--secondary">← All work</a>
        <a href="mailto:manikdesigns@yahoo.com" className="btn btn--primary">Get in touch</a>
      </div>

      <Footer />
    </>
  );
}
