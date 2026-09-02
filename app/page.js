import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Card from '@/components/Card';
import StatCounter from '@/components/StatCounter';
import CROCover from '@/components/CROCover';
import WarpText from '@/components/WarpText/WarpText';

export default function Home() {
  return (
    <>
      <Nav />

      <header className="hero wrap wrap--wide">
        <Reveal>
          <p className="text-caption text-fog" style={{ marginBottom: '16px' }}>Product Design Leader</p>
          <WarpText
            text={'I build design functions,\nand I still do the craft\nwork to prove it.'}
            align="left"
            color="#f8f5ff"
            warpStrength={0.08}
            warpScale={1.7}
            speed={0.55}
            pointerInfluence={0.42}
            pointerStrength={0.50}
            refraction={0.025}
            ripple
            fontSize={88}
            fontWeight={800}
            lineHeight={1.05}
            letterSpacing="-0.02em"
            style={{ height: '380px', marginBottom: '24px' }}
          />
          <p className="text-body text-mist" style={{ maxWidth: '640px', marginBottom: '32px' }}>
            Over a decade leading product design end to end — from founding my own studio,
            to building a design team from zero, to running design as the head of function
            at a fast-growing edtech company. I care about the systems that let good design
            happen consistently, and about the specific pixels and decisions inside them.
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn btn--rainbow">See selected work</a>
            <a href="mailto:manikdesigns@yahoo.com" className="btn btn--rainbow-outline">Get in touch</a>
          </div>
        </Reveal>
      </header>

      <section className="section wrap wrap--wide" id="work">
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
            <h2 className="text-heading font-semibold">Selected work</h2>
            <span className="text-caption text-fog">Archive is being rebuilt — updating regularly</span>
          </div>
        </Reveal>

        <div className="work-grid">
          <Reveal>
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

          <Reveal delay={0.08}>
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

          <div className="work-support-grid">
            <Reveal delay={0.16}>
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

            <Reveal delay={0.24}>
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

      <section className="section wrap wrap--wide" id="about">
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

      <Footer />
    </>
  );
}
