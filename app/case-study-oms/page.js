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
import OmsSections from './sections';
import OmsStory from './OmsStory';
import '../case-study-kit/article.css';
import '../case-study-kit/themes.css';
import '../case-study-kit/blocks.css';
import '../case-study-kit/hero.css';
import '../case-study-kit/story.css';
import './oms.css';

const neueAlteGrotesk = localFont({
  src: '../fonts/NeueAlteGrotesk-SemiBold.ttf',
  weight: '600',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
});

// Newsreader is reserved for the sentences that carry the argument (pull statements).
const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata = {
  title: 'Rebuilding OMS — Manik Madaan',
  description: "Novatr's entire sales org ran on a tool engineering had built with no product or design input. The product-and-design-led rebuild that replaced it.",
};

const HEADLINE = 'From spreadsheets to a single source of truth';

// Matches the redesigned Figma nav (10 items). Only sections actually
// rebuilt in code get a real id — the rest render inert until they exist.
const sections = [
  { id: 'context', label: 'Context' },
  { id: 'mandate', label: 'The Mandate' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'system', label: 'The System' },
  { id: 'status', label: 'Status' },
  { id: 'offer-flow', label: 'The Offer Flow' },
  { id: 'leading-it', label: 'Leading It' },
  { id: 'impact', label: 'Impact' },
  { id: 'reflection', label: 'Reflection' },
  { id: null, label: 'Open Threads' },
];

// Placeholder hrefs until the real files are attached.
const projectFiles = [
  { label: 'User Flows: Acquisition & Disposition', type: 'FIGMA', href: '#' },
  { label: 'Information Architecture: Admin & BDR', type: 'PDF', href: '#' },
  { label: 'Product Requirements Doc', type: 'PDF', href: '#' },
];

// This case study's violet, used for the light theme's hero wash and tint (see hero.css).
const VIOLET = { '--ph-wash-a': '#8b5cf6', '--ph-wash-b': '#6366f1' };

export default function CaseStudyOMS() {
  return (
    <div className="ph-page oms-page" style={VIOLET}>
      {/* Puts the theme on <html> before anything paints (see theme.js). */}
      <script dangerouslySetInnerHTML={{ __html: themeGateScript() }} />
      <ScrollProgress />
      <Nav actions={<ThemeSwitch />} />

      <header className="cs-hero ph-hero">
        <div className="ph-hero__bg">
          <HeroBackdrop colors={['#8b5cf6', '#6366f1', '#110A4E', '#08090A']} />
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
                Case study · Novatr
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
              <p className="ph-sub ph-rise" style={{ '--d': 0.4 }}>
                Rebuilding OMS: a v3.0 retrospective
              </p>
              <p className="ph-lede ph-rise" style={{ '--d': 0.5 }}>
                Novatr&apos;s entire sales org, from a BDR on their first call to the VP of Sales, ran
                on a tool engineering had built with no product or design input. I led the rebuild that
                gave every one of five roles the exact view of the funnel they actually needed, in one
                place, replacing what used to take hours or days to piece together by hand.
              </p>

              <div className="ph-rise" style={{ '--d': 0.65 }}>
                <HeroFacts
                  moreLabel="Scope, team and timeline"
                  lead={[
                    { label: 'Role', value: 'Product Design Manager, project lead', strong: true },
                    { label: 'Company', value: 'Novatr' },
                    { label: 'Product', value: 'OMS (Order Management System), v3.0 rebuild' },
                  ]}
                  more={[
                    {
                      label: 'Scope',
                      value:
                        "An all-in-one dashboard for the sales team to manage the acquisition side of the funnel: dashboards and deal lists for all five sales roles, the deal status model, the two-step offer wizard and the admin drill-down, and moving OMS from engineering-owned to product-owned",
                    },
                    {
                      label: 'Team',
                      value: 'Manik Madaan, Product Design Manager · Ved, Product Designer · Nikhil, Product Manager · Sales and Engineering',
                    },
                    { label: 'Timeline', value: '1 month' },
                  ]}
                />
              </div>

              <div className="hero-actions ph-rise" style={{ marginTop: '32px', '--d': 0.85 }}>
                <a href="#prototype" className="btn btn--rainbow-outline">
                  Try the prototype ↓
                </a>
                <OmsStory className="btn btn--tertiary btn--rainbow-text" fontClass={`${neueAlteGrotesk.variable} ${serif.variable}`}>
                  Read the 2-minute version
                </OmsStory>
              </div>
            </div>

            <div>
              <div className="image-slot cs-hero-cover ph-cover" style={{ height: '100%', minHeight: '349px' }}>
                Cover art pending
              </div>
            </div>
          </div>
        </div>
      </header>

      <ScrollRise>
        <PrototypeEmbed
          versions={[
            {
              id: 'rebuild',
              label: 'Latest rebuild (WIP)',
              eyebrow: 'v3.0 · in progress',
              description:
                "The current rebuild, moved onto a proper design system. So far it's the Sales Head dashboard — deals list, deal detail, and the offer wizard are still being ported. Toggle light/dark from the sidebar; it's a placeholder control while the theme is still being designed.",
              url: 'app.novatr-oms.internal/dashboard · v3.0',
              embedSrc: '/case-studies/oms/rebuild/index.html',
              fullSrc: '/case-studies/oms/rebuild/index.html',
              // Renders at a wide desktop viewport, then scales down to fit the
              // frame — so the embed reads as a real spacious desktop layout
              // scaled down, not the app reflowing to a narrower breakpoint.
              frameWidth: 1850,
            },
          ]}
          title="OMS v3.0 interactive prototype"
          mobileImage="/case-studies/oms/dashboard-preview.png"
          mobileImageAlt="OMS v3.0 rebuild dashboard showing Booked Revenue, the Sales Funnel ribbon, Revenue Realised, Conversion by course, and Deal Stages"
        />
      </ScrollRise>

      <div className="cs-article-grid wrap wrap--wide">
        <main className={`lx pcs ${neueAlteGrotesk.variable} ${serif.variable}`}>
          <div className="lx-stack">
            <OmsSections />
          </div>
        </main>

        <CaseStudyNav sections={sections} projectFiles={projectFiles} />
      </div>

      <div className="cs-footer-nav wrap wrap--wide">
        <a href="/" className="btn btn--secondary">← All work</a>
        <a href="mailto:manikdesigns@yahoo.com" className="btn btn--primary">Get in touch</a>
      </div>

      <Footer />
    </div>
  );
}
