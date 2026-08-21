import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';
import CROChart from '@/components/CROChart';

export const metadata = {
  title: 'Designing for Confidence — Manik Madaan',
  description: "How behavioral data became an empathy tool for four teams at Novatr who couldn't agree on why a strong page wasn't converting.",
};

export default function CaseStudyCRO() {
  return (
    <>
      <Nav />

      <header className="wrap wrap--wide" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div className="breadcrumb" style={{ marginBottom: '32px' }}>
          <a href="/">← Back to all work</a>
        </div>

        <Reveal>
          <p className="text-caption text-fog" style={{ marginBottom: '16px' }}>Case Study — Novatr</p>
          <h1 className="text-heading font-semibold" style={{ marginBottom: '16px' }}>
            Designing for Confidence: A Data-Informed Redesign of Novatr&apos;s Flagship Course Page
          </h1>
          <p className="text-body text-mist" style={{ fontSize: '18px', maxWidth: '720px' }}>
            How behavioral data became an empathy tool for four teams who couldn&apos;t agree on
            why a strong page wasn&apos;t converting — and how that agreement outlasted the page itself.
          </p>

          <MetaStrip
            items={[
              { label: 'Role', value: 'Product Design Manager, initiative lead' },
              { label: 'Company', value: 'Novatr (formerly Oneistox)' },
              { label: 'Timeframe', value: '2022–2024' },
              { label: 'Collaborators', value: 'Design, Marketing, Sales, Engineering' },
            ]}
          />
        </Reveal>
      </header>

      <main className="cs-body wrap" style={{ paddingBottom: '48px' }}>
        <Reveal>
          <h2>The situation</h2>
          <p>
            Novatr was growing fast. New courses, new audiences, new landing pages, and new
            campaigns were launching every few weeks. On the surface, everything looked healthy —
            traffic was strong, leads were flowing, the business was scaling. But underneath that
            momentum, something felt off.
          </p>
          <p>
            Our flagship BIM Professional Course for Architects — the single biggest driver of
            revenue — was built with care. The content was solid, the value proposition was clear,
            and the audience was highly intent-driven. Yet the pattern was consistent: traffic
            remained healthy, but conversions repeatedly fell short of expectations.
          </p>
        </Reveal>

        <Reveal>
          <h2>Where the certainty broke down</h2>
          <p>
            Every conversation about the page ended the same way. Marketing advocated for stronger
            copy. Sales pushed for shorter forms. Design tested new layouts. Engineering implemented
            without full alignment. Everyone had an opinion about the fix. No one had conviction —
            because no one could say with confidence where users were actually dropping off, or why.
          </p>
          <p>
            The trigger to change how we worked wasn&apos;t a dramatic drop in numbers. It was decision
            fatigue. As the design lead on this, that lack of shared clarity concerned me more than
            any single conversion metric: when a team can&apos;t make decisions with confidence, momentum
            stalls, and in a growth-stage company that cost shows up quietly — in missed
            opportunities, not in a dashboard.
          </p>
        </Reveal>

        <Reveal>
          <h2>My approach</h2>
          <p>
            I reframed the brief for the team from &quot;improve conversion&quot; to &quot;understand hesitation.&quot;
            We instrumented Mixpanel and Google Analytics — not as reporting tools, but as empathy
            tools: scroll depth, hero and section engagement, campaign source paths, and form-start
            patterns became a way to see how people actually behaved on the page when no one was
            watching. That reframe was the specific decision I made as design lead: the goal was
            never the dashboard. It was <strong>designing for confidence instead of designing for
            conversion.</strong>
          </p>
        </Reveal>

        <Reveal>
          <h2>What the data showed</h2>
          <p>
            Once we tracked real behavior, the gap became obvious. A large share of visitors read
            deep into the page — engaging with curriculum highlights, real-world project simulations,
            and mentorship benefits — and then paused before starting the form. They were interested.
            Something in the final stretch was costing us their confidence, not their attention.
          </p>
          <p>
            The more useful signal was directional rather than absolute: in the periods we tracked,
            traffic and conversion didn&apos;t move together. There were stretches where traffic dipped
            slightly and conversion went up meaningfully — the opposite of what a traffic-first
            mindset would predict.
          </p>

          <CROChart />
        </Reveal>

        <Reveal>
          <h2>What we changed</h2>
          <p>
            We redesigned the page around that emotional reality rather than around a layout guess.
            We reduced perceived commitment before the form, moved proof — outcomes, credibility
            signals, real student results — closer to the decision point, and clarified what someone
            would get before asking them for effort. We also changed what we measured: the team&apos;s
            shared target metric shifted from &quot;conversion&quot; to &quot;form starts,&quot; since that&apos;s where the
            hesitation was concentrated and where a design change could actually move something.
          </p>

          <div className="pull-quote">
            It didn&apos;t feel like optimization. It felt like relief — like we&apos;d finally stopped
            rushing users and started reassuring them.
          </div>
        </Reveal>

        <Reveal>
          <h2>Outcome</h2>
          <p>
            Form-start rates and conversion both improved, and traffic quality became more
            consistent across campaigns. But the change that mattered more to me as a design leader
            happened across teams, not just on the page: conversations became less defensive and
            more reflective, marketing and design started using a shared insight language, engineering
            began instrumenting for real behavior signals instead of vanity metrics, and sales reported
            better lead quality because the users who started forms now did so with clearer intent.
          </p>
          <p>
            CRO stopped being treated as &quot;a performance marketing task&quot; handed to whichever team was
            under the most pressure that quarter. It became an operating rhythm — a shared feedback
            loop across design, marketing, sales, and engineering that outlasted this one page and
            became how we approached every page after it.
          </p>
        </Reveal>

        <Reveal>
          <h2>Reflection</h2>
          <div className="reflection-box">
            <p>
              This project cemented something I still lead with: data doesn&apos;t replace intuition, it
              preserves it. It doesn&apos;t end debates, it ends guesswork. With a shared source of truth,
              teams move faster and with more conviction — and when that becomes a habit rather than
              a one-off initiative, growth stops being accidental.
            </p>
            <p style={{ marginBottom: 0 }}>
              If I were running this today, I&apos;d change one thing about the sequencing: I&apos;d build the
              measurement framework into every new landing page from day one, rather than retrofitting
              it onto our highest-stakes page after the fact. The instinct to treat analytics as an
              empathy tool, not a report, is the part I&apos;d install first at any future company — before
              the first pixel gets designed.
            </p>
          </div>
        </Reveal>
      </main>

      <div className="cs-footer-nav wrap">
        <a href="/" className="btn btn--secondary">← All work</a>
        <a href="mailto:manikdesigns@yahoo.com" className="btn btn--primary">Get in touch</a>
      </div>

      <Footer />
    </>
  );
}
