'use client';

import { useEffect } from 'react';
import PrototypeEmbed from '@/components/PrototypeEmbed';
import CaseStudyNav from '@/components/CaseStudyNav';
import HeroBackdrop from '@/components/case-study-kit/HeroBackdrop';
import HeroFacts from '@/components/case-study-kit/HeroFacts';
import ScrollRise from '@/components/case-study-kit/ScrollRise';
import { NarrationTrigger } from '@/components/narration/NarrationUI';
import { useT } from '@/components/i18n/LangProvider';
import PlacementStory from './PlacementStory';
import PlacementSections from './sections';

// The case study's own words: the hero, the prototype frame, the article and the footer links. English is written
// here and in sections.js; another language replaces each piece by its key (see i18n/). It is a client component
// so the words can change without a reload; it is still rendered on the server, so English is in the HTML.

const HEADLINE = 'Making India’s biggest AEC education platform’s placement process visible to learners';

// The contents nav. `id` is the section's anchor and must match sections.js.
const SECTIONS = [
  { id: 'problem', label: 'The problem' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'reframing', label: 'Reframing' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'product', label: 'The product' },
  { id: 'handover', label: 'Handover' },
  { id: 'launch', label: 'Launch and measurement' },
];

// Fonts, the narration length and each section's "Listen to this part" button come from the server (page.js).
export default function PlacementBody({ headlineFont, fontVars, narrationDuration, listen }) {
  const t = useT();
  const headline = t('hero.headline', HEADLINE);
  useEffect(() => {
    document.title = t('meta.title', 'Making Placement Visible — Manik Madaan');
  }, [t]);
  return (
    <>
      <header className="cs-hero ph-hero">
        <div className="ph-hero__bg">
          <HeroBackdrop />
        </div>
        <div className="ph-hero__fade" aria-hidden="true" />
        <div className="wrap wrap--wide" style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb ph-rise" style={{ marginBottom: '32px', '--d': 0.05 }}>
            <a href="/">← {t('hero.back', 'Back to all work')}</a>
          </div>

          <div className="cs-header-grid">
            <div>
              <p className="ph-eyebrow ph-rise" style={{ '--d': 0.1 }}>
                <span className="ph-eyebrow__dot" aria-hidden="true" />
                {t('hero.eyebrow', 'Case study · Product design leadership')}
              </p>
              <h1 className={`ph-h1 ${headlineFont}`} aria-label={headline}>
                {headline.split(' ').map((word, i) => (
                  <span key={i} aria-hidden="true">
                    <span className="ph-word">
                      <span style={{ '--i': i }}>{word}</span>
                    </span>{' '}
                  </span>
                ))}
              </h1>
              <p className="ph-lede ph-rise" style={{ '--d': 0.45 }}>
                {t('hero.lede', "Learners bought placement support but experienced it as a black box. I led the design direction for a learner portal and reusable placement system that made progress, eligibility, opportunities, and next steps visible.")}
              </p>

              <div className="ph-rise" style={{ '--d': 0.6 }}>
                <HeroFacts
                  moreLabel={t('hero.moreLabel', 'Scope, team and timeline')}
                  lead={t.list('hero.lead', [
                    { label: 'Role', value: 'Product Design Manager / Design Lead', strong: true },
                    { label: 'Company', value: 'Novatr, an AEC education company' },
                    { label: 'Product', value: 'Placement Portal' },
                  ])}
                  more={t.list('hero.more', [
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
                  ])}
                />
              </div>

              <div className="hero-actions ph-rise" style={{ marginTop: '32px', '--d': 0.85 }}>
                <a href="#prototype" className="btn btn--rainbow-outline">
                  {t('ui.tryPrototype', 'Try the prototype')} ↓
                </a>
                <NarrationTrigger className="btn btn--tertiary btn--rainbow-text" duration={narrationDuration} />
                <PlacementStory className="btn btn--tertiary btn--rainbow-text" fontClass={fontVars}>
                  {t('hero.story', 'Read the 2-minute version')}
                </PlacementStory>
              </div>
            </div>

            <div>
              <div className="cs-hero-cover cs-hero-frame ph-cover">
                {/* The same browser bar as the live prototype below, so the screenshot reads as a real window. */}
                <div className="proto-frame-bar" aria-hidden="true">
                  <div className="proto-frame-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="proto-frame-url">placement-hub.novatr.internal/home</div>
                </div>
                <img
                  src="/case-studies/placement-hub/body/hero-home-updates.png"
                  alt={t('hero.coverAlt', 'Placement Hub home with the updates panel open, listing application updates and new opportunities, above the eligibility and interest-form banners.')}
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
        versions={t.list('proto.versions', [
          {
            id: 'hub',
            label: 'Placement Hub',
            eyebrow: 'Interactive prototype · Placement Hub',
            description:
              'A working prototype of the placement experience. Use the beaker button in the frame to act as the placement team and move an application through its stages.',
            url: 'placement-hub.novatr.internal/home',
            embedSrc: '/case-studies/placement-hub/prototype/index.html',
            fullSrc: '/case-studies/placement-hub/prototype/index.html',
            // Render the prototype as it would look on a large 1920px desktop screen, then scale the
            // whole thing down to fit the frame — like zooming out a real browser window, not
            // squeezing the layout (same approach as the OMS embed).
            frameWidth: 1920,
            frameBackground: '#fcfcfd',
          },
        ])}
        title={t('proto.title', 'Placement Hub interactive prototype')}
        heading={t('proto.heading', 'See Placement Hub, live')}
        note={t('proto.note', "Sample data throughout is synthetic. Scroll and click inside the frame. It's the full prototype, just boxed in. Try the interest form from the home banner, apply to a job, or open the beaker button to move an application through its stages.")}
        mobileImage="/case-studies/placement-hub/preview.png"
        mobileImageAlt={t('proto.mobileAlt', "Placement Hub home showing the eligibility banner, the interest-form banner and the learner's applications in progress")}
      />
      </ScrollRise>

      <div className="cs-article-grid wrap wrap--wide">
        <main className={`lx pcs ${fontVars}`}>
          <div className="lx-stack">
            <PlacementSections listen={listen} />
          </div>
        </main>

        <CaseStudyNav sections={t.list('nav.sections', SECTIONS)} />
      </div>

      <div className="cs-footer-nav wrap wrap--wide">
        <a href="/" className="btn btn--secondary">← {t('footer.all', 'All work')}</a>
        <span className="btn btn--primary btn--inert">{t('footer.contact', 'Get in touch')}</span>
      </div>

    </>
  );
}
