import localFont from 'next/font/local';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';
import PrototypeEmbed from '@/components/PrototypeEmbed';
import CaseStudyNav from '@/components/CaseStudyNav';
import { TLDRProvider, TLDRTrigger, TLDRPanel } from '@/components/TLDR';
import CaseStudySection from '@/components/CaseStudySection';
import DecisionStepper from '@/components/DecisionStepper';
import VelarisBackground from '@/components/VelarisBackground';
import OMSComponentEmbed from '@/components/OMSComponentEmbed';

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

const decisions = [
  {
    number: '01',
    heading: 'A deal begins at the pitch, not at the form.',
    desc: "The Deal record is created at PDE, short for Product Explained. That's the moment a BDR has actually pitched the course on a live call.",
    detail: {
      rejected:
        'Creating it at form fill or application sent. Simpler, and it fills the funnel with people who downloaded a syllabus at midnight, which turns every conversion rate below it into a measure of marketing volume that no BDR would trust.',
      atStake: 'Every denominator in the product. This decides what all of our numbers mean.',
    },
  },
  {
    number: '02',
    heading: 'One component set, scoped by role',
    desc: 'One performance dashboard structure and one deal list structure, changing only what they pull in based on who is logged in.',
    detail: {
      rejected:
        "A bespoke dashboard per permission tier. That was the obvious brief, and it's the one that makes a five-role product impossible for a team this size.",
      atStake: 'Whether this was buildable at all with the people we had.',
    },
  },
  {
    number: '03',
    heading: 'A deal begins at the pitch, not at the form.',
    desc: "The Deal record is created at PDE, short for Product Explained. That's the moment a BDR has actually pitched the course on a live call.",
    detail: {
      rejected:
        "A single \"Revenue\" figure. Within a month it teaches the floor to book large plans with small down payments. The number climbs, the bank account doesn't.",
      atStake: 'What behaviour the dashboard trains on the floor.',
    },
  },
  {
    number: '04',
    heading: 'The org chart is data, not structure',
    desc: 'Assignment lives on the deal with logged reasons, and the hierarchy gets read at query time instead of being baked into screens.',
    detail: {
      rejected:
        'Modelling the team structure in the UI. The floor restructured roughly every month, so the version that hard-codes it is broken by month four.',
      atStake: 'Whether the product survives the org it serves.',
    },
  },
  {
    number: '05',
    heading: 'Dashboards ship before workflow depth',
    desc: "Visibility first, because leadership's pain was the loudest in the room and it was the pain that funded the project.",
    detail: {
      rejected:
        "Interleaving workflow and reporting releases. This is the one I'd argue with myself about, and section 09 is that argument.",
      atStake: 'Who gets served first. I chose the funders over the daily users.',
    },
  },
];

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

// Matches the redesigned Figma nav (10 items). Only sections actually
// rebuilt in code get a real id — the rest render inert until they exist.
const sections = [
  { id: 'context', label: 'Context' },
  { id: 'mandate', label: 'The Mandate' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'system', label: 'The System' },
  { id: 'status', label: 'Status' },
  { id: null, label: 'The Offer Flow' },
  { id: null, label: 'Leading It' },
  { id: null, label: 'Impact' },
  { id: null, label: 'Reflection' },
  { id: null, label: 'Open Threads' },
];

// Placeholder hrefs until the real files are attached.
const projectFiles = [
  { label: 'User Flows: Acquisition & Disposition', type: 'FIGMA', href: '#' },
  { label: 'Information Architecture: Admin & BDR', type: 'PDF', href: '#' },
  { label: 'Product Requirements Doc', type: 'PDF', href: '#' },
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
          <CaseStudySection
              id="context"
              number="01"
              eyebrow="Context"
              category="Problem facing"
              questions={[
                'What was the state of things when you arrived?',
                'Was this a design problem or an org problem?',
                "Whose problem was it, the user's or the business's?",
              ]}
              heading="The tool already existed. The problem was who owned it."
            >
              <div>
                <p>
                  Novatr teaches AEC professionals through three flagship courses, and sells almost
                  all of them through a floor of BDRs. Before OMS, nobody could get a straight
                  answer about that floor. Asking how it was tracking against target meant somebody
                  assembling the answer by hand. That took hours, and on bad days it took days.
                </p>
                <p>
                  Sending an application form or rolling out an offer touched the CRM and two other
                  teams, so every one of those added delay. And there was no way to see where leads
                  were actually getting stuck.
                </p>
                <p>
                  OMS v1 was meant to fix all of that. It was built by the engineering team on its
                  own, with no product or design input. It handled the handful of scenarios it had
                  been specified for and broke outside them, so every new scenario turned into an
                  engineering ticket. New BDRs needed retraining whenever the floor changed shape,
                  and getting one thing done meant bouncing between HubSpot, OMS and WhatsApp.
                </p>
              </div>

              <p className="cs-article-statement">
                That isn&apos;t a usability problem. It&apos;s an ownership problem.
              </p>

              <p>
                A tool built to spec never gets asked why it feels slow to somebody in their first
                week. A product does. The real deliverable of this rebuild was moving OMS from
                engineering ownership to product ownership, and every design decision below was
                only available to us because that shift happened first.
              </p>

              <div className="cs-article-slot">
                <img
                  src="/case-studies/oms/body/context-system-of-record.png"
                  alt="Diagram comparing HubSpot's four-step flow, which converges into one deal record, against OMS v1's four steps scattering across a spreadsheet, inbox, and WhatsApp with no single owner."
                  width={1472}
                  height={400}
                />
                <p className="cs-article-caption">
                  The gap, drawn once. Left of the line, four steps converge into one record. Right
                  of it, four steps scatter across three tools and cross over each other, so no tool
                  owns a step and no step owns a tool. That crossing is what a BDR actually did all
                  day, and it is why nobody could answer a question about the floor without
                  assembling it by hand.
                </p>
              </div>
            </CaseStudySection>

          <CaseStudySection
              id="mandate"
              number="02"
              eyebrow="The Mandate"
              category="Stakeholder management · Research design"
              questions={[
                'How do you get budget to rebuild something that technically already works?',
                'Who had to be convinced, and what convinced them?',
                'How did you know the problem was real rather than requested?',
                'What did you personally contribute to the research?',
              ]}
              heading="I didn't sell a redesign. I sold the cost of not knowing."
            >
              <div>
                <p>Three arguments, running at the same time, and none of them was &quot;the tool is bad.&quot;</p>
                <p>
                  <strong>I made the cost of slowness visible.</strong> Not a critique of the
                  interface. How many hours it took to answer a question as basic as how the floor
                  was tracking against target, and what that delay cost in planning that never
                  happened. It was a number leadership already cared about, attached to a cause they
                  hadn&apos;t connected it to.
                </p>
                <p>
                  <strong>I let the pain come from the users.</strong> The Sales Head was the
                  loudest voice on this and by far the most credible one. My job was getting that
                  frustration into the room where budget gets decided, instead of letting it become
                  a design team complaining about a design team problem.
                </p>
                <p>
                  <strong>I argued it into the roadmap.</strong> I sat in the product roadmap
                  planning sessions, so the rebuild competed openly against other bets and won on
                  merit. Internal tools usually get funded by being slipped through as maintenance,
                  which is also why they usually stay half built.
                </p>
              </div>

              <div>
                <p className="cs-article-subheading">Where the argument came from</p>
                <p>
                  None of that works without evidence, and the evidence is the part I&apos;d defend
                  as mine. Ved and Nikhil ran most of the sessions. What I did was{' '}
                  <strong>
                    design the enquiry: deciding which levels get asked what, and refusing to let
                    the observation stop at the part of the funnel that&apos;s interesting to watch.
                  </strong>
                </p>
              </div>

              <div className="cs-article-cards">
                <div className="cs-article-card">
                  <p className="cs-article-card__label">The Interview Ladder</p>
                  <div className="cs-article-card__stat">
                    <p>Every level of the sales hierarchy, up to the Sales Head</p>
                  </div>
                  <p className="cs-article-card__desc">
                    The ladder was the point. Asking the same question at four altitudes shows you
                    exactly where the answers stop agreeing, and that gap is where the real problem
                    lives.
                  </p>
                </div>
                <div className="cs-article-card">
                  <p className="cs-article-card__label">Live Call Shadowing</p>
                  <div className="cs-article-card__stat">
                    <p>Sales calls observed, then followed past the interesting part</p>
                  </div>
                  <p className="cs-article-card__desc">
                    What happens after a lead is marked interested was the half nobody could
                    describe secondhand. Insisting the team follow it there is what made the flows
                    real instead of reported.
                  </p>
                </div>
                <div className="cs-article-card">
                  <p className="cs-article-card__label">Roadmap Sessions</p>
                  <div className="cs-article-card__stat">
                    <p>Repeated pressure testing in product planning</p>
                  </div>
                  <p className="cs-article-card__desc">
                    Not research, but it did the same job. The argument had to survive the people
                    whose budget it was competing with.
                  </p>
                </div>
              </div>

              <div className="cs-article-slot">
                <img
                  src="/case-studies/oms/body/mandate-interview-ladder.png"
                  alt="Bar chart showing how much of the funnel each role could see: BDR 90%, Team Lead 55%, Team Manager 38%, Sales Head 8% — the blind spot grows toward the top of the hierarchy."
                  width={1472}
                  height={1080}
                />
                <div className="cs-article-figure-caption">
                  <p className="cs-article-figure-caption__lead">
                    The same question, asked at four altitudes.
                  </p>
                  <p className="cs-article-figure-caption__desc">
                    Everyone answered it, and no two people answered the same question. The bars are
                    what mattered more: the further up the hierarchy, the less of your own remit you
                    could actually see without somebody assembling it by hand. The Sales Head carried
                    the widest responsibility and had the worst view of it. Percentages are
                    illustrative, drawn from what each level described in interviews rather than from
                    instrumentation.
                  </p>
                </div>
              </div>
            </CaseStudySection>

          <CaseStudySection
              id="decisions"
              number="03"
              eyebrow="Decisions"
              category="Systems Thinking"
              questions={[
                'Which decisions could only you have made?',
                'What did you consider and reject?',
                'You had a PM and a designer, so what was left for you?',
              ]}
              heading="Five decisions, made before anything was drawn."
            >
              <p>
                Each one was cheap to make early and expensive to reverse late, which is my working
                definition of what a design manager should be spending attention on. The screens are
                Ved&apos;s. These are mine.
              </p>

              <DecisionStepper decisions={decisions} />
            </CaseStudySection>

          <CaseStudySection
              id="system"
              number="04"
              eyebrow="The System"
              category="Design systems · Business literacy"
              questions={[
                'Five permission tiers is a lot. Why not three?',
                "Was this a systems decision, or a shortcut you're framing as one?",
                'How did two designers ship a five-role product?',
                'What did you have to learn about the business to design this?',
              ]}
              heading="Five roles, one component. Scope is a parameter, not a screen."
            >
              <div>
                <p>
                  The floor had five tiers: BDR, Associate Team Lead, Team Lead, Team Manager, and
                  the Sales Head who saw everything. The obvious brief was five dashboards, and that
                  brief would have killed us.
                </p>
                <p>
                  What we built instead was <strong>one funnel-card component</strong>. Four cards
                  reading Applications Sent, Offers Shared, Converted, Payment Clearance, each with a
                  total and a status breakdown. Only the data scope changes behind it.
                </p>
              </div>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="admin-funnel" height={384} frameWidth={1320} />
                <p className="cs-article-figure-caption__desc">
                  <strong>Aggregate, across every cohort.</strong> This is the live component, not a
                  screenshot — the actual current numbers, and it updates automatically if the
                  prototype changes.
                </p>
              </div>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="team-manager-funnel" height={360} frameWidth={1320} />
                <p className="cs-article-figure-caption__desc">
                  <strong>The same component, scoped to one Team Manager.</strong> Identical layout,
                  identical labels, identical breakdown rows. Only the numbers move. That is the
                  entire argument: one component means one test surface, and one place to fix a bug.
                </p>
              </div>

              <div>
                <p>
                  The Applications and Payments lists work the same way: same columns, same filters,
                  different scope. Every altitude also carries the same Overview and Performance
                  toggle. Overview shows the funnel breakdown, Performance swaps in four KPI tiles
                  including Average Ticket Size. One toggle, learned once, meaning the same thing
                  everywhere.
                </p>
                <p>
                  <strong>The drill-down is the piece I&apos;d demo live.</strong> Clicking a Team
                  Manager filters the Team Leads column to their reports. Clicking a Team Lead
                  filters the BDRs column. Selecting a BDR populates a detail panel with that
                  person&apos;s own funnel view, which is the same component again. A Sales Head goes
                  from an org-wide revenue dip to the one person responsible in three clicks, without
                  leaving the page or exporting anything.
                </p>
              </div>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="team-drilldown" height={401} />
                <p className="cs-article-caption">
                  Live, not a screenshot — click a Team Manager to see the Team Leads column filter,
                  the way it would for a real Sales Head. The empty states carry the instruction, so
                  the interaction teaches itself rather than needing a tooltip.
                </p>
              </div>

              <a href="#prototype" className="btn btn--rainbow-outline">
                Switch roles in the Prototype ↗
              </a>

              <div>
                <p className="cs-article-subheading">A floor optimises whatever its dashboard names</p>
                <p>
                  Sitting above that funnel is the decision I&apos;d point at if somebody asked what I
                  had to learn about the business. If the revenue card had simply said
                  &quot;Revenue&quot;, the floor would have learned within a month to book large plans
                  with small down payments. The number climbs and the bank account doesn&apos;t. So
                  the card names two things and refuses to average them.
                </p>
                <p>
                  <strong>Booked</strong> is the total value of payment plans created in the period,
                  cash or no cash. It&apos;s the commitment the floor generated. <strong>Realised</strong>{' '}
                  is cash actually collected in the period, split further into collections against
                  this period&apos;s bookings and collections against earlier ones.
                </p>
              </div>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="stat-cards" height={425} frameWidth={1600} />
                <div className="cs-article-figure-caption">
                  <p className="cs-article-figure-caption__desc">
                    <strong>The badge is the whole point.</strong> Booked carries a badge for the
                    share of it that&apos;s actually realised — live, not a screenshot, so the
                    percentage is always this month&apos;s real number, the one telling a Sales Head
                    whether last month was a good month or a promise.
                  </p>
                  <p className="cs-article-figure-caption__desc">
                    Beside it, cash collected this month against deals booked earlier, rolled into a
                    Total Realised figure. Two different quantities, both true, and neither one is
                    &quot;revenue&quot; on its own. Most of the work here wasn&apos;t visual. It was
                    the conversations with the sales and finance leads that established the split.{' '}
                    <strong>Deciding what a number means is design work, and at manager level
                    it&apos;s most of the design work.</strong>
                  </p>
                </div>
              </div>

              <a href="#prototype" className="btn btn--rainbow-outline">
                Open The Dashboard ↗
              </a>

              <div className="cs-article-warning">
                <p className="cs-article-warning__label">What I got wrong</p>
                <p className="cs-article-warning__lead">
                  The Associate Team Lead is a genuine, distinct permission tier, and it has no home
                  in the reporting model. The admin drill-down runs Team Manager, Team Lead, BDR,
                  straight past it.
                </p>
                <p>
                  So we shipped a role that could hold a deal but couldn&apos;t be reported on.
                  That&apos;s an information architecture inconsistency, the IA was mine, and I missed
                  it. The fix I&apos;d take today is the smaller one: stop treating ATL as a tier and
                  make it a flag on a BDR. One fewer level is worth more than fidelity to the org
                  chart.
                </p>
              </div>
            </CaseStudySection>

          <CaseStudySection
              id="status"
              number="05"
              eyebrow="Status"
              category="Information Design"
              questions={[
                'Why this status model, and why do the tabs overlap?',
                "What's the weakest part of this design?",
              ]}
              heading='Colour answers "whose move is it?", not "what stage is this?"'
            >
              <p>
                A deal has a stage and a sub-status. What it needed was a third thing the list could
                be read by at nine in the morning: am I the blocker? So colour got assigned to agency
                rather than to progress.
              </p>

              <div>
                <div className="cs-status-badges">
                  <div className="cs-status-badge cs-status-badge--blue">
                    <span className="cs-status-badge__dot" />
                    <p>Blue · Waiting on the learner</p>
                  </div>
                  <div className="cs-status-badge cs-status-badge--amber">
                    <span className="cs-status-badge__dot" />
                    <p>Amber · Timed Out</p>
                  </div>
                  <div className="cs-status-badge cs-status-badge--green">
                    <span className="cs-status-badge__dot" />
                    <p>Green · Moving</p>
                  </div>
                  <div className="cs-status-badge cs-status-badge--red">
                    <span className="cs-status-badge__dot" />
                    <p>Red · Waiting On You</p>
                  </div>
                  <div className="cs-status-badge cs-status-badge--grey">
                    <span className="cs-status-badge__dot" />
                    <p>Grey · Global Status</p>
                  </div>
                </div>
                {/* Figma shows this as a visible run-on sentence with no spacing between
                    phrases ("Amber · timed outGreen · movingRed badge..."), which reads as
                    an accessibility summary of the badges above rather than intended
                    body copy — rendered here as screen-reader-only text instead. */}
                <p className="sr-only">
                  Amber · timed out. Green · moving. Red badge · waiting on you. Grey · global
                  status.
                </p>
              </div>

              <div className="cs-article-slot">
                <div className="cs-article-image--crop">
                  <img
                    src="/case-studies/oms/body/status-deals-list.png"
                    alt="Deals list with color-coded status badges per row: blue for Application Pending, green for Payment Completed, amber for Offer Expired, grey for Global Not Interested and Global Saved."
                    width={2192}
                    height={1640}
                  />
                </div>
                <p className="cs-article-figure-caption__desc">
                  <strong>One glance tells a BDR what needs them.</strong> Application Pending is
                  blue because the learner is holding the form. Offer Expired is amber because the
                  deal is decaying quietly. Global Not Interested and Global Saved are grey because a
                  deal can die at any stage. The globe icon flags an international lead, which
                  changes both the currency and the gateway.
                </p>
              </div>

              <div className="cs-article-slot">
                <img
                  src="/case-studies/oms/body/status-tabs.png"
                  alt="Filter tab bar: All 157, Action Required 10, Application 31, Offer 34, Payment 56, Cancelled 1, Not Interested 22, Rejected 8, Saved 5."
                  width={2192}
                  height={88}
                />
                <p className="cs-article-figure-caption__desc">
                  <strong>The tabs deliberately overlap.</strong> Action Required isn&apos;t a
                  bucket, it&apos;s a filter across every red-badged status in the funnel, which is
                  why the counts don&apos;t add up to 157. A BDR opening OMS isn&apos;t asking
                  what&apos;s in stage three. They&apos;re asking what their Team Lead will bring up
                  at standup. I&apos;d defend the overlap. What I wouldn&apos;t defend is that we
                  never made it legible, so a new BDR has to be told.
                </p>
              </div>

              <a href="#prototype" className="btn btn--rainbow-outline">
                Open The Deals List ↗
              </a>

              <div className="cs-article-warning">
                <p className="cs-article-warning__label">The bug that shipped</p>
                <p>
                  <strong>Filtering the list didn&apos;t recompute the tab counts above it.</strong>{' '}
                  Filters ran over the list, and the counts were computed against the unfiltered
                  query. So the page could show you nine deals under a tab reading forty-one.
                </p>
                <p>
                  We knew about it. It never beat anything else on the list. It&apos;s small, and it
                  quietly erodes trust in every other number on a page whose entire job is telling
                  you the truth about your pipeline. That&apos;s the argument I should have made at
                  the time and didn&apos;t. It&apos;s the first thing the v3.0 prototype fixes.
                </p>
              </div>
            </CaseStudySection>

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

        <CaseStudyNav sections={sections} projectFiles={projectFiles} />
      </div>

      <div className="cs-footer-nav wrap wrap--wide">
        <a href="/" className="btn btn--secondary">← All work</a>
        <a href="mailto:manikdesigns@yahoo.com" className="btn btn--primary">Get in touch</a>
      </div>

      <Footer />
    </>
  );
}
