import localFont from 'next/font/local';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';
import VelarisBackground from '@/components/VelarisBackground';

const neueAlteGrotesk = localFont({
  src: '../fonts/NeueAlteGrotesk-SemiBold.ttf',
  weight: '600',
  style: 'normal',
  display: 'swap',
});

export const metadata = {
  title: 'Building a Design Team from Zero — Manik Madaan',
  description: 'The Novatr team-building story — hiring, structure, and design leadership from the first hire.',
};

export default function CaseStudyNovatrTeam() {
  return (
    <>
      <Nav />

      <header className="cs-hero" style={{ paddingTop: '96px', paddingBottom: '48px' }}>
        <VelarisBackground />
        <div className="wrap wrap--wide" style={{ position: 'relative', zIndex: 1 }}>
          <div className="breadcrumb" style={{ marginBottom: '32px' }}>
            <a href="/">← Back to all work</a>
          </div>

          <div className="cs-header-grid">
            <Reveal>
              <span className="tag tag--progress" style={{ marginBottom: '16px', display: 'inline-flex' }}>Case study in progress</span>
              <p className="text-caption text-fog" style={{ marginBottom: '16px', marginTop: '16px' }}>Case Study — Novatr</p>
              <h1
                className={neueAlteGrotesk.className}
                style={{
                  color: '#fff',
                  fontSize: '48px',
                  fontWeight: 600,
                  lineHeight: '110%',
                  letterSpacing: '-0.48px',
                  marginBottom: '16px',
                  maxWidth: '16ch',
                }}
              >
                Building a Design Team from Zero
              </h1>
              <p className="text-body text-mist" style={{ fontSize: '18px', maxWidth: '640px' }}>
                The Novatr team-building story — hiring, structure, and design leadership
                from the very first hire.
              </p>

              <MetaStrip
                items={[
                  { label: 'Role', value: 'Design Team Lead' },
                  { label: 'Company', value: 'Novatr' },
                ]}
              />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="image-slot" style={{ height: '100%', minHeight: '349px' }}>
                Cover art pending
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <main className="cs-body wrap wrap--wide" style={{ paddingBottom: '64px' }}>
        <Reveal>
          <div className="reflection-box">
            <p style={{ marginBottom: 0 }}>
              Full write-up coming soon. This case study will cover building and leading a design
              team from zero at Novatr — hiring, structure, and the leadership decisions
              that shaped the team&apos;s early years.
            </p>
          </div>

          <div className="image-slot" style={{ marginTop: '24px' }}>
            Image placeholder — team and process visuals coming soon
          </div>
        </Reveal>
      </main>

      <div className="cs-footer-nav wrap wrap--wide">
        <a href="/" className="btn btn--secondary">← All work</a>
        <a href="mailto:manikdesigns@yahoo.com" className="btn btn--primary">Get in touch</a>
      </div>

      <Footer />
    </>
  );
}
