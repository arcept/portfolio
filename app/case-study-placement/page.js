import localFont from 'next/font/local';
import { Newsreader } from 'next/font/google';
import Nav from '@/components/Nav';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import { themeGateScript } from '@/components/theme/theme';
import Footer from '@/components/Footer';
import PrototypeEmbed from '@/components/PrototypeEmbed';
import CaseStudyNav from '@/components/CaseStudyNav';
import HeroBackdrop from '@/components/case-study-kit/HeroBackdrop';
import HeroFacts from '@/components/case-study-kit/HeroFacts';
import ScrollProgress from '@/components/case-study-kit/ScrollProgress';
import ScrollRise from '@/components/case-study-kit/ScrollRise';
import PlacementStory from './PlacementStory';
import NarrationProvider from '@/components/narration/NarrationProvider';
import { NarrationTrigger, NarrationUIProvider } from '@/components/narration/NarrationUI';
import { NarrationPanel } from '@/components/narration/NarrationDock';
import NarrationPlayer from '@/components/narration/NarrationPlayer';
import '../../components/narration/narration.css';
import narration from '../../public/case-studies/placement-hub/narration/narration.json';
import PlacementSections from './sections';
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
  description:
    'Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.',
};

const HEADLINE = 'Making India’s biggest AEC education platform’s placement process visible to learners';

const sections = [
  { id: 'problem', label: 'The problem' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'reframing', label: 'Reframing' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'product', label: 'The product' },
  { id: 'handover', label: 'Handover' },
  { id: 'launch', label: 'Launch and measurement' },
];

// `version` is recorded by docs/narration/narrate.py when new audio is aligned: it changes the URLs, so a new
// render is never served from a cache alongside the old one.
const NARRATION_SRC = `/case-studies/placement-hub/narration/narration.json${narration.version ? `?v=${narration.version}` : ''}`;

export default function CaseStudyPlacement() {
  return (
    <NarrationProvider src={NARRATION_SRC}>
    <NarrationUIProvider>
    <div className="ph-page">
      {/* Puts the theme on <html> before anything paints (see theme.js). */}
      <script dangerouslySetInnerHTML={{ __html: themeGateScript() }} />
      <ScrollProgress />
      <Nav actions={<ThemeSwitch />} />

      <header className="cs-hero ph-hero">
        <div className="ph-hero__bg">
          <HeroBackdrop />
        </div>
        <div className="ph-hero__fade" aria-hidden="true" />
        <div className="wrap wrap--wide" style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb ph-rise" style={{ marginBottom: '32px', '--d': 0.05 }}>
            <a href="/">← Back to all work</a>
          </div>

          <div className="cs-header-grid">
            <div>
              <p className="ph-eyebrow ph-rise" style={{ '--d': 0.1 }}>
                <span className="ph-eyebrow__dot" aria-hidden="true" />
                Case study · Product design leadership
              </p>
              <h1 className={`ph-h1 ${neueAlteGrotesk.className}`} aria-label={HEADLINE}>
                {HEADLINE.split(' ').map((word, i) => (
                  <span key={i} aria-hidden="true">
                    <span className="ph-word">
                      <span style={{ '--i': i }}>{word}</span>
                    </span>{' '}
                  </span>
                ))}
              </h1>
              <p className="ph-lede ph-rise" style={{ '--d': 0.45 }}>
                Learners bought placement support but experienced it as a black box. I led the design
                direction for a learner portal and reusable placement system that made progress,
                eligibility, opportunities, and next steps visible.
              </p>

              <div className="ph-rise" style={{ '--d': 0.6 }}>
                <HeroFacts
                  moreLabel="Scope, team and timeline"
                  lead={[
                    { label: 'Role', value: 'Product Design Manager / Design Lead', strong: true },
                    { label: 'Company', value: 'Novatr, an AEC education company' },
                    { label: 'Product', value: 'Placement Portal' },
                  ]}
                  more={[
                    {
                      label: 'Scope',
                      value:
                        'Learner portal, Retool workflow adaptations for operations, and reusable status and data foundations for future internal and hiring-partner products',
                    },
                    {
                      label: 'Team',
                      value:
                        'Manik Madaan, Product Design Manager · Sanya, Product Designer · Swati, Product Manager · placement operations and engineering',
                    },
                    { label: 'Timeline', value: 'Approximately three months to launch' },
                  ]}
                />
              </div>

              <div className="hero-actions ph-rise" style={{ marginTop: '32px', '--d': 0.85 }}>
                <a href="#prototype" className="btn btn--rainbow-outline">
                  Try the prototype ↓
                </a>
                <PlacementStory className="btn btn--tertiary btn--rainbow-text" fontClass={`${neueAlteGrotesk.variable} ${serif.variable}`}>
                  Read the 2-minute version
                </PlacementStory>
                <NarrationTrigger className="btn btn--tertiary btn--rainbow-text" duration={narration.duration} />
              </div>
            </div>

            <div>
              <div className="cs-hero-cover cs-hero-frame ph-cover">
                <img
                  src="/case-studies/placement-hub/body/hero-home-updates.png"
                  alt="Placement Hub home with the updates panel open, listing application updates and new opportunities, above the eligibility and interest-form banners."
                  width={1440}
                  height={1000}
                />
              </div>
            </div>
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
    </div>

    {/* The narration: a floating card that is a small player by default and expands to the full player (a sheet on phones). */}
    <NarrationPanel>
      <NarrationPlayer narration={narration} fontClass={serif.variable} />
    </NarrationPanel>
    </NarrationUIProvider>
    </NarrationProvider>
  );
}
