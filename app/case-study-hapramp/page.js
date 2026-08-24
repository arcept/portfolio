import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';

export const metadata = {
  title: 'Building a Design Team from Zero — Manik Madaan',
  description: 'The Hapramp Studio team-building story — hiring, structure, and design leadership from the first hire.',
};

export default function CaseStudyHapramp() {
  return (
    <>
      <Nav />

      <header className="wrap wrap--wide" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div className="breadcrumb" style={{ marginBottom: '32px' }}>
          <a href="/">← Back to all work</a>
        </div>

        <Reveal>
          <span className="tag tag--progress" style={{ marginBottom: '16px', display: 'inline-flex' }}>Case study in progress</span>
          <p className="text-caption text-fog" style={{ marginBottom: '16px', marginTop: '16px' }}>Case Study — Hapramp Studio</p>
          <h1 className="text-heading font-semibold" style={{ marginBottom: '16px' }}>
            Building a Design Team from Zero
          </h1>
          <p className="text-body text-mist" style={{ fontSize: '18px', maxWidth: '720px' }}>
            The Hapramp Studio team-building story — hiring, structure, and design leadership
            from the very first hire.
          </p>

          <MetaStrip
            items={[
              { label: 'Role', value: 'Design Team Lead' },
              { label: 'Company', value: 'Hapramp Studio' },
            ]}
          />
        </Reveal>
      </header>

      <main className="cs-body wrap wrap--wide" style={{ paddingBottom: '64px' }}>
        <Reveal>
          <div className="reflection-box">
            <p style={{ marginBottom: 0 }}>
              Full write-up coming soon. This case study will cover building and leading a design
              team from zero at Hapramp Studio — hiring, structure, and the leadership decisions
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
