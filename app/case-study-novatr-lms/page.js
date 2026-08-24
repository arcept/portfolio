import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';

export const metadata = {
  title: 'Building the Novatr LMS — Manik Madaan',
  description: 'A 0-to-1 platform build, design systems, and cross-functional leadership behind the Novatr Learning Management System.',
};

export default function CaseStudyNovatrLMS() {
  return (
    <>
      <Nav />

      <header className="wrap wrap--wide" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div className="breadcrumb" style={{ marginBottom: '32px' }}>
          <a href="/">← Back to all work</a>
        </div>

        <Reveal>
          <span className="tag tag--progress" style={{ marginBottom: '16px', display: 'inline-flex' }}>Case study in progress</span>
          <p className="text-caption text-fog" style={{ marginBottom: '16px', marginTop: '16px' }}>Case Study — Novatr</p>
          <h1 className="text-heading font-semibold" style={{ marginBottom: '16px' }}>
            Building the Novatr LMS
          </h1>
          <p className="text-body text-mist" style={{ fontSize: '18px', maxWidth: '720px' }}>
            A 0-to-1 platform build, design systems, and the cross-functional leadership behind
            Novatr&apos;s Learning Management System.
          </p>

          <MetaStrip
            items={[
              { label: 'Role', value: 'Product Design Manager' },
              { label: 'Company', value: 'Novatr (formerly Oneistox)' },
            ]}
          />
        </Reveal>
      </header>

      <main className="cs-body wrap wrap--wide" style={{ paddingBottom: '64px' }}>
        <Reveal>
          <div className="reflection-box">
            <p style={{ marginBottom: 0 }}>
              Full write-up coming soon. This case study will cover the 0-to-1 build of the LMS
              platform, the design system built across web and mobile, and the cross-functional
              processes that supported a 4x increase in company revenue.
            </p>
          </div>

          <div className="image-slot" style={{ marginTop: '24px' }}>
            Image placeholder — LMS product screenshots coming soon
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
