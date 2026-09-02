import localFont from 'next/font/local';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';
import PrototypeEmbed from '@/components/PrototypeEmbed';
import CaseStudyNav from '@/components/CaseStudyNav';
import { TLDRProvider, TLDRTrigger, TLDRPanel } from '@/components/TLDR';
import VelarisBackground from '@/components/VelarisBackground';

const neueAlteGrotesk = localFont({
  src: '../fonts/NeueAlteGrotesk-SemiBold.ttf',
  weight: '600',
  style: 'normal',
  display: 'swap',
});

export const metadata = {
  title: 'Rebuilding OMS — Manik Madaan',
  description: "Novatr's entire sales org ran on a tool engineering had built with no product or design input. The product-and-design-led rebuild that replaced it.",
};

const tldrSections = [
  {
    label: 'Context',
    body: "Novatr's entire sales org ran on a tool engineering built with no product or design input — slow, broken, and dependent on engineering for everything outside a handful of scenarios.",
  },
  {
    label: 'Process',
    body: "We validated the need through interviews at every level of the sales hierarchy and shadowed live sales calls, then moved OMS from an engineering-owned utility to a product-owned one.",
  },
  {
    label: 'Solution',
    body: "One shared dashboard and deal-list structure serves all five roles, scoped by who's logged in, plus a three-click drill-down from an org-wide dip to the one underperforming person.",
  },
  {
    label: 'Impact',
    body: 'Drop/dispose rate down 18%, turnaround for forms and offers down from 1–2 days to under an hour, and new-BDR training time down from 4 days to 3.',
  },
  {
    label: 'Retrospective',
    body: "The ATL permission tier was invisible in reporting, EMI plans couldn't be edited once approved, and a filtering bug let summary counts drift out of sync — real friction the rebuild still needs to fix.",
  },
  {
    label: 'Reflection',
    body: "The real fix was organizational as much as visual — moving OMS from engineering-owned to product-owned changed what questions we were even allowed to ask about it.",
  },
];

const sections = [
  { id: 'context', label: 'Context' },
  { id: 'process', label: 'Process' },
  { id: 'solution', label: 'Solution' },
  { id: 'impact', label: 'Impact' },
  { id: 'retrospective', label: 'Retrospective' },
  { id: 'reflection', label: 'Reflection' },
];

export default function CaseStudyOMS() {
  return (
    <>
      <Nav />

      <header className="cs-hero" style={{ paddingTop: '96px', paddingBottom: '48px' }}>
        <VelarisBackground colors={['#8b5cf6', '#6366f1', '#110A4E', '#08090A']} bg="#08090A" />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(180deg, rgba(17, 10, 78, 0) 60%, #08090A 100%)',
            pointerEvents: 'none',
          }}
        />
        <div className="wrap wrap--wide" style={{ position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb" style={{ marginBottom: '32px' }}>
            <a href="/">← Back to all work</a>
          </div>

          <div className="cs-header-grid">
            <Reveal>
              <TLDRProvider>
                <p className="text-caption text-fog" style={{ marginBottom: '16px' }}>Case Study — Novatr</p>
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
                  From spreadsheets to a single source of truth
                </h1>
                <p className="text-body text-mist" style={{ fontSize: '18px', maxWidth: '640px' }}>
                  Rebuilding OMS: a v3.0 retrospective
                </p>

                <p className="text-body text-mist" style={{ maxWidth: '720px' }}>
                  Novatr&apos;s entire sales org, from a BDR on their first call to the VP of Sales, ran
                  on a tool engineering had built with no product or design input. I led the rebuild
                  that gave every one of five roles the exact view of the funnel they actually needed,
                  in one place, replacing what used to take hours or days to piece together by hand.
                </p>

                <MetaStrip
                  items={[
                    { label: 'Role', value: 'Product Design Manager, project lead' },
                    { label: 'Collaborators', value: 'Product, Sales, Engineering' },
                    { label: 'Company', value: 'Novatr' },
                  ]}
                />

                <div className="hero-actions" style={{ marginTop: '24px' }}>
                  {/* Primary "Open full prototype ↗" (btn btn--rainbow) hidden for now —
                      the solid white surface read as too loud next to the other two. */}
                  <TLDRTrigger className="btn btn--rainbow-outline">
                    Read the 2 min version
                  </TLDRTrigger>
                  <a href="#" className="btn btn--tertiary btn--rainbow-text">
                    Sample tertiary link
                  </a>
                </div>

                <TLDRPanel sections={tldrSections} />
              </TLDRProvider>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="image-slot" style={{ height: '100%', minHeight: '349px' }}>
                Cover art pending
              </div>
            </Reveal>
          </div>
        </div>
      </header>

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
            // Renders at its real desktop width, then scales down to fit the
            // frame — so the embed shows the actual desktop layout instead
            // of the app's own narrower responsive breakpoint.
            frameWidth: 1536,
          },
          {
            id: 'original',
            label: 'Original prototype',
            eyebrow: 'v3.0 · interactive',
            description:
              "The full original prototype: a real dashboard, deals list, deal detail, and offer wizard, with a live role switcher across all five permission tiers. It's embedded below at a fixed size; open it full-size for the real thing.",
            url: 'app.novatr-oms.internal · v3.0',
            embedSrc: '/case-studies/oms/embed.html',
            fullSrc: '/case-studies/oms/dist.html#app',
          },
        ]}
        title="OMS v3.0 interactive prototype"
        mobileImage="/case-studies/oms/dashboard-preview.png"
        mobileImageAlt="OMS v3.0 dashboard showing the funnel cards, revenue split, and deals list"
      />

      <div className="cs-article-grid wrap wrap--wide">
        <main className="cs-body">
          <Reveal>
            <section className="cs-section" id="context">
              <p className="section-eyebrow">01 · Context</p>
              <h2>Why this got built</h2>
              <p>
                Novatr is an ed-tech company teaching AEC professionals through three flagship
                courses, selling almost entirely through a floor of BDRs. Before OMS, sales
                visibility was a constant, cross-functional pain point — the Founder&apos;s office,
                product planning, and the sales floor itself all struggled to get a straight answer
                on where things stood.
              </p>
              <p>
                Turnaround time for sales numbers was measured in hours to days, not minutes: any
                time leadership asked how the floor was tracking against target, someone had to go
                pull it together by hand. Core workflow steps depended on other teams and tools —
                sending an application form or rolling out an offer touched the CRM and the sales
                team in ways that introduced delay every time. And there was no visibility into
                where leads were actually stuck: how many had closed, how close the floor was to
                target, how an individual BDR was performing. The cost was real — missed
                opportunities and a lack of proactive planning, both direct consequences of not
                being able to see the funnel clearly.
              </p>
              <p>
                The first version of OMS made some of this worse before it made anything better. It
                was built by the tech team alone, with no product or design input: no attention to
                usability for a non-technical sales associate, constant retraining needed for new
                BDRs, broken flows that bounced a user between HubSpot, OMS, and WhatsApp to get one
                thing done, and a standing dependency on engineering to handle anything outside the
                handful of scenarios it was originally built for. This case study covers the
                product-and-design-led rebuild that replaced it.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 590, marginTop: '32px', marginBottom: '16px' }}>My role</h3>
              <div className="role-card">
                <div>
                  <div className="role-card__key">Manik</div>
                  <div className="role-card__value">
                    Product Design Manager — led design, drove the rebuild&apos;s priority with
                    leadership, and defined the roadmap by feature priority and turnaround time.
                  </div>
                </div>
                <div>
                  <div className="role-card__key">Nikhil</div>
                  <div className="role-card__value">
                    Product Manager — facilitated cross-functional conversations with Sales, Tech,
                    and CRM, gathered the data to make the case, managed documentation and
                    timelines.
                  </div>
                </div>
                <div>
                  <div className="role-card__key">Ved Pathak</div>
                  <div className="role-card__value">
                    Product Designer — did most of the hands-on Figma work, building out states for
                    every frame and component and leading the handover to engineering.
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="cs-section" id="process">
              <p className="section-eyebrow">02 · Process</p>
              <h2>How we got there</h2>
              <p>
                We validated the need directly rather than assuming it: interviews at every level
                of the sales hierarchy, up to and including the Sales Head, plus repeated
                discussion in the product roadmap planning sessions I was part of. On the design
                side, the team shadowed live sales calls, then followed what happened after a lead
                was marked interested, all the way through the later stages of the funnel — so the
                flows in OMS were built from watching the actual job, not from a secondhand
                description of it.
              </p>
              <p>
                The biggest structural shift the project made was moving OMS from an
                engineering-owned utility to a product-owned one. The first version&apos;s problems
                weren&apos;t cosmetic: rigid, single-path flows that only worked for a handful of
                scenarios, and a real, ongoing dependency on engineering for anything else. The
                rebuild&apos;s biggest win wasn&apos;t any one screen — it was collapsing what used to
                require bouncing between HubSpot, OMS, and WhatsApp into a single touchpoint.
                Viewing an application, building a payment plan, and rolling out an offer all happen
                inside one product now, and new BDR onboarding got measurably easier as a direct
                result: there was one place to learn, not three.
              </p>
              <p>
                That shift showed up most clearly in a new BDR&apos;s first week. Before the rebuild,
                onboarding meant training on the funnel and best practices largely through
                spreadsheets — and then a gap between what that training promised and what actually
                landing a deal felt like once someone was on the floor. After the rebuild, a new BDR
                had direct visibility into the numbers and expectations, and into how the later
                stages of the funnel actually worked, from day one. Training time dropped from 4
                days to 3, and the volume of follow-up questions dropped with it — the product was
                teaching people the job as they used it, not just the training deck.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="cs-section" id="solution">
              <p className="section-eyebrow">03 · The Solution</p>
              <h2>What we built</h2>
              <p>Two things made OMS work, and they&apos;re related.</p>
              <h3 style={{ fontSize: '18px', fontWeight: 590, marginTop: '32px', marginBottom: '16px' }}>
                One shared set of components, five different views
              </h3>
              <p>
                Instead of building a bespoke dashboard per role, we built one
                performance-dashboard structure and one deal-list structure, and simply changed
                what each pulled in based on who was logged in. A BDR&apos;s dashboard is the same
                four-card funnel — Applications Sent, Offers Shared, Converted, Payment Clearance —
                that shows up on a Team Manager&apos;s dashboard once per Team Manager they oversee,
                and again in a drilled-into BDR&apos;s own detail panel. The Applications and Payments
                list structures are close to identical between a BDR&apos;s own view and the Admin&apos;s
                floor-wide view: same columns, same filters, different scope.
              </p>
              <h3 style={{ fontSize: '18px', fontWeight: 590, marginTop: '32px', marginBottom: '16px' }}>
                A drill-down that gets you from &quot;something&apos;s wrong&quot; to &quot;here&apos;s who&quot; in three
                clicks
              </h3>
              <p>
                The Admin dashboard&apos;s Team Managers → Team Leads → BDRs table lets a Sales Head go
                from an org-wide revenue dip straight down to the one underperforming person,
                without leaving the page or exporting anything.
              </p>
              <p>
                A few smaller decisions are worth calling out on their own. The offer-sending flow
                validates itself before it lets you send: building a payment plan shows a running
                &quot;Amount Left&quot; total that has to hit zero before you can move on, a small guardrail
                against sending an offer that doesn&apos;t add up. You see the actual email before you
                send it, too — the offer wizard&apos;s second step renders a live preview of exactly
                what the learner will receive, personalized discount and all, rather than trusting a
                BDR to imagine what a template will look like once merged. And the dashboard splits
                Booked revenue from Realised revenue rather than showing one flat number — further
                splitting collections into &quot;from this period&apos;s deals&quot; versus &quot;still trickling in
                from earlier deals,&quot; a distinction that matters a lot to a VP of Sales and is easy
                to lose if you&apos;re not careful about it.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="cs-section" id="impact">
              <p className="section-eyebrow">04 · Impact</p>
              <h2>What changed</h2>
              <p>What I remember concretely, and am comfortable standing behind:</p>

              <div className="stat-row">
                <div className="stat-card">
                  <div className="stat-card__value">−18%</div>
                  <div className="stat-card__label">Drop / dispose rate on leads, after the rebuild</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">&lt;1 hr</div>
                  <div className="stat-card__label">Turnaround for application forms and offers — down from 1–2 days</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">4 → 3 days</div>
                  <div className="stat-card__label">New-BDR training time, with fewer follow-up questions after</div>
                </div>
              </div>

              <div className="self-reported">
                <div className="self-reported__label">
                  Self-reported by the design team at the time — from the original Medium write-up,
                  not independently audited
                </div>
                <div className="self-reported-grid">
                  <div>
                    <div className="self-reported-grid__value">4.2 / 5</div>
                    <div className="self-reported-grid__label">NPS, +25%</div>
                  </div>
                  <div>
                    <div className="self-reported-grid__value">100%</div>
                    <div className="self-reported-grid__label">Adoption across the sales floor</div>
                  </div>
                  <div>
                    <div className="self-reported-grid__value">+52%</div>
                    <div className="self-reported-grid__label">Daily active users</div>
                  </div>
                  <div>
                    <div className="self-reported-grid__value">~3×</div>
                    <div className="self-reported-grid__label">Revenue in one quarter (indirect)</div>
                  </div>
                </div>
              </div>

              <p className="disclosure">
                I&apos;d rather not round this section out with invented figures presented as real
                results — a case study reads as a factual account, and false precision is genuinely
                risky if it ever comes up in an interview conversation. Where I don&apos;t have a hard
                number, I&apos;d rather say &quot;meaningfully reduced&quot; than make one up. The prototype
                above has realistic-looking sample data on screen the way any product demo does —
                that&apos;s a different thing from an audited result, and not a claim this section is
                making.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="cs-section" id="retrospective">
              <p className="section-eyebrow">05 · Retrospective</p>
              <h2>What I&apos;d do differently</h2>
              <p>
                This doubles as the honest retrospective and the v3.0 rebuild&apos;s actual scope —
                nothing below is hypothetical hand-waving, and every one of these is what the live
                prototype above is actually demonstrating a fix for.
              </p>
              <p>
                The assignee hierarchy (BDR/ATL/TL/TM) took up four permanent columns on the deals
                table; in hindsight that&apos;s better as an on-hover detail than something visible at
                a glance on every row. A real bug shipped where filtering a list didn&apos;t recompute
                the summary tab counts above it — small, but the kind of inconsistency that quietly
                erodes trust in every other number on the page. The offer wizard showed two labels,
                Course Fee and Sales Payable Fee, for what was in practice always one number. EMI
                plans, once approved, couldn&apos;t be edited — a tenure or amount change meant
                unwinding the whole plan, a real friction point for both Sales Ops and BDRs. And the
                ATL tier was real but invisible: a confirmed fifth permission level that never
                actually showed up in the Admin performance drill-down.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="cs-section" id="reflection">
              <p className="section-eyebrow">06 · Reflection</p>
              <h2>Looking back</h2>
              <div className="reflection-box">
                <p>
                  The thing I keep coming back to isn&apos;t any single screen — it&apos;s that the real
                  fix was organizational as much as it was visual. Moving OMS from something
                  engineering owned to something product owned changed what questions we were even
                  allowed to ask about it. A rigid tool built to spec doesn&apos;t get a &quot;why does this
                  feel slow to a new BDR&quot; conversation. A product does.
                </p>
                <p style={{ marginBottom: 0 }}>
                  Building the prototype above was itself part of that same instinct, a few years
                  later. Rather than write a case study about a redesign I hadn&apos;t actually
                  pressure-tested, I wanted to click through the direction first — role switching,
                  the drill-down, the offer wizard&apos;s guardrails — and see whether it held up as an
                  interaction, not just a set of Figma frames. It mostly did. Where it didn&apos;t, I&apos;d
                  rather find out here than after a real engineering team had built it.
                </p>
              </div>
            </section>
          </Reveal>
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
