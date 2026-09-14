import localFont from 'next/font/local';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import MetaStrip from '@/components/MetaStrip';
import PrototypeEmbed from '@/components/PrototypeEmbed';
import CaseStudyNav from '@/components/CaseStudyNav';
import { TLDRProvider, TLDRTrigger, TLDRPanel } from '@/components/TLDR';
import CaseStudySection, { SeeMore } from '@/components/CaseStudySection';
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
            // Renders at a wide desktop viewport, then scales down to fit the
            // frame — so the embed reads as a real spacious desktop layout
            // scaled down, not the app reflowing to a narrower breakpoint.
            frameWidth: 1850,
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
              hasMore
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
              </div>

              <SeeMore>
                <div>
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
              </SeeMore>

              <div className="cs-article-slot">
                <img
                  src="/case-studies/oms/body/context-system-of-record.png"
                  alt="Diagram comparing HubSpot's four-step flow, which converges into one deal record, against OMS v1's four steps scattering across a spreadsheet, inbox, and WhatsApp with no single owner."
                  width={1472}
                  height={400}
                />
                <SeeMore>
                  <p className="cs-article-caption">
                    The gap, drawn once. Left of the line, four steps converge into one record. Right
                    of it, four steps scatter across three tools and cross over each other, so no tool
                    owns a step and no step owns a tool. That crossing is what a BDR actually did all
                    day, and it is why nobody could answer a question about the floor without
                    assembling it by hand.
                  </p>
                </SeeMore>
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
              hasMore
            >
              <div>
                <p>Three arguments, running at the same time, and none of them was &quot;the tool is bad.&quot;</p>
              </div>

              <SeeMore>
                <div>
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
              </SeeMore>

              <div className="cs-article-slot">
                <img
                  src="/case-studies/oms/body/mandate-interview-ladder.png"
                  alt="Bar chart showing how much of the funnel each role could see: BDR 90%, Team Lead 55%, Team Manager 38%, Sales Head 8% — the blind spot grows toward the top of the hierarchy."
                  width={1472}
                  height={1080}
                />
                <SeeMore>
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
                </SeeMore>
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
              hasMore
            >
              <div>
                <p>
                  The floor had five tiers: BDR, Associate Team Lead, Team Lead, Team Manager, and
                  the Sales Head who saw everything. The obvious brief was five dashboards, and that
                  brief would have killed us.
                </p>
              </div>

              <SeeMore>
                <p>
                  What we built instead was one set of components, reused at every altitude, with
                  only the data scope changing behind them. In v2.0 that meant one funnel-card
                  component: four cards reading Applications Sent, Offers Shared, Converted, Payment
                  Clearance. In the v3.0 rebuild that same principle produced a richer headline: a
                  single flow diagram, one shape from Application through Offer, Payment and
                  Completed, with the drop-off between every stage stamped directly on it. The
                  four-card grid didn&apos;t disappear, it got demoted: it&apos;s now the scoped
                  breakdown you see for one Team Manager&apos;s cohort or one BDR&apos;s own funnel,
                  nested under the same headline shape everyone else sees.
                </p>
              </SeeMore>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="sales-funnel" height={400} frameWidth={900} />
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>The whole pipeline, as one shape.</strong> Applications, Offers, Payment and
                    Completed, with the conversion between each stage read directly off the ribbon.
                    Average Ticket Size sits in the corner of the same card. This is the answer to
                    &quot;how is the floor doing right now&quot;, and it doesn&apos;t need a second
                    screen.
                  </p>
                </SeeMore>
              </div>

              <SeeMore>
                <div>
                  <p className="cs-article-statement cs-article-statement--display">
                    <span className="cs-article-statement__dim">
                      The brief from the Sales Head, restated in his own words months after launch, was
                      that he wanted to{' '}
                    </span>
                    <span>look at this page once and know the health of the floor</span>
                    <span className="cs-article-statement__dim">
                      , where the pipeline actually was, where deals were stuck, and what payment was
                      coming in.
                    </span>
                  </p>
                  <p className="cs-article-annotation">
                    Three more cards answer the parts the flow diagram can&apos;t.
                  </p>
                </div>
              </SeeMore>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="deal-stages" height={320} frameWidth={900} />
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>Where deals are stuck, named per stage.</strong> Nine stages, each a bar
                    sized by count. The two hatched bars are loss buckets, Payment Plan Pending and
                    Rejected, so a stall reads differently from a stage that&apos;s simply early. This
                    is the direct answer to &quot;where are deals stuck&quot;, and it&apos;s a card,
                    not a report someone has to run.
                  </p>
                </SeeMore>
              </div>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="realised-conversion" height={400} frameWidth={900} />
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>Payment incoming, and where it&apos;s leaking.</strong> Realised revenue
                    splits into Previous Period and Total, so a Sales Head can see how much of
                    today&apos;s cash is old commitments finally landing versus new ones. Beside it,
                    conversion by course with a Lost Deals count folded into the same card, because
                    &quot;how is the floor doing&quot; and &quot;where are we losing people&quot; are
                    one question, not two.
                  </p>
                </SeeMore>
              </div>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="booked-revenue" height={416} frameWidth={900} />
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>Booked and Realised, drawn as a gap.</strong> Booked and Realised plotted
                    as two lines across the month, rather than a single number — the space between
                    them is the thing a Sales Head is actually watching. There&apos;s also a
                    payment-mode breakdown by gateway, built as its own component, that isn&apos;t
                    wired into any page yet. No screen has been designed for it. It exists ahead of
                    its own UI slot, which is a more honest state for unfinished work to be in than
                    pretending it isn&apos;t there.
                  </p>
                </SeeMore>
              </div>

              <SeeMore>
                <div>
                  <p className="cs-article-statement cs-article-statement--display">
                    Team performance, named per manager
                  </p>
                  <p>
                    Below the floor-wide numbers, every Team Manager gets a card that answers the same
                    questions about their own team: a heatmap of every deal&apos;s health, colour by
                    colour, gray when the card is collapsed and lit up the moment you expand it; a
                    pending-actions count split by Applications, Offers and Payment; a unit sales
                    attainment figure against target; and Booked, Realised and Average Ticket Size for
                    that manager alone, each with its own change badge.
                  </p>
                </div>
              </SeeMore>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="team-manager-card" height={368} frameWidth={900} autoHeight />
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>One manager, one card, four questions answered.</strong> The heatmap alone
                    is one deal per square, colour-coded by the same status model as the drill-down
                    below, so a Team Manager sees the shape of their book before reading a single
                    number.
                  </p>
                </SeeMore>
              </div>

              <SeeMore>
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
              </SeeMore>

              <div className="cs-article-slot">
                <OMSComponentEmbed view="team-drilldown" height={401} />
                <SeeMore>
                  <p className="cs-article-caption">
                    Live, not a screenshot — click a Team Manager to see the Team Leads column filter,
                    the way it would for a real Sales Head. The empty states carry the instruction, so
                    the interaction teaches itself rather than needing a tooltip.
                  </p>
                </SeeMore>
              </div>

              <a href="#prototype" className="btn btn--rainbow-outline">
                Open full prototype ↗
              </a>

              <SeeMore>
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
              </SeeMore>
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
              hasMore
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
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>One glance tells a BDR what needs them.</strong> Application Pending is
                    blue because the learner is holding the form. Offer Expired is amber because the
                    deal is decaying quietly. Global Not Interested and Global Saved are grey because a
                    deal can die at any stage. The globe icon flags an international lead, which
                    changes both the currency and the gateway.
                  </p>
                </SeeMore>
              </div>

              <div className="cs-article-slot">
                <img
                  src="/case-studies/oms/body/status-tabs.png"
                  alt="Filter tab bar: All 157, Action Required 10, Application 31, Offer 34, Payment 56, Cancelled 1, Not Interested 22, Rejected 8, Saved 5."
                  width={2192}
                  height={88}
                />
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>The tabs deliberately overlap.</strong> Action Required isn&apos;t a
                    bucket, it&apos;s a filter across every red-badged status in the funnel, which is
                    why the counts don&apos;t add up to 157. A BDR opening OMS isn&apos;t asking
                    what&apos;s in stage three. They&apos;re asking what their Team Lead will bring up
                    at standup. I&apos;d defend the overlap. What I wouldn&apos;t defend is that we
                    never made it legible, so a new BDR has to be told.
                  </p>
                </SeeMore>
              </div>

              <a href="#prototype" className="btn btn--rainbow-outline">
                Open The Deals List ↗
              </a>

              <SeeMore>
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
              </SeeMore>
            </CaseStudySection>

          <CaseStudySection
              id="offer-flow"
              number="06"
              eyebrow="The Offer Flow"
              category="Craft · Error prevention"
              questions={[
                "Show me one screen you're proud of, and why.",
                'How did you handle errors and irreversible actions?',
                'Who did your business rules protect, and who did they annoy?',
              ]}
              heading="Don't make anyone do the math by hand."
              hasMore
            >
              <div>
                <p>
                  Building an offer is the one moment in this product where a mistake is expensive,
                  customer facing and effectively irreversible. Almost every decision in the two-step
                  wizard is a refusal to let an error escape.
                </p>
              </div>

              <SeeMore>
                <div>
                  <p>
                    <strong>Step one is the payment plan.</strong> The BDR picks a payment type,
                    upfront, part payment, or EMI through a third party, then picks discounts from a
                    fixed menu: Early Bird, Merit, Super Merit (locked behind Sales Ops approval), or a
                    custom amount capped to that deal&apos;s fee. Nothing is typed free-hand. Course Fee
                    minus Total Discount resolves to one number, Net Payable Fee, and the system builds
                    the instalments itself: a fixed downpayment, then the remainder split evenly across
                    the tenure the BDR picked, with the last instalment quietly absorbing whatever rupee
                    the division left over. There is nothing for the BDR to total, because there is no
                    longer a manual total to get wrong.
                  </p>
                  <p>
                    An earlier version of this screen worked the other way around: the BDR typed each
                    instalment by hand against a live Amount Left counter and couldn&apos;t proceed
                    until it hit zero. It shipped, and it worked, but it was still asking a person to
                    check arithmetic a computer should own. Once the discount tiers existed as rules
                    rather than free text, generating the instalments automatically was the smaller
                    change, and the counter came out.
                  </p>
                </div>
              </SeeMore>

              <div className="cs-article-slot">
                <div className="cs-article-hscroll">
                  <img
                    src="/case-studies/oms/body/offer-flow-discounts.png"
                    alt="Discount selection list: Early Bird Offer (unavailable), Merit Scholarship (available, checked), Super Merit Scholarship (approval required), and a Custom BDR Discount field with an Apply Discount button."
                    width={517}
                    height={318}
                  />
                  <img
                    src="/case-studies/oms/body/offer-flow-fee-breakdown.png"
                    alt="Fee breakdown showing Course Fees, Total Discount and Net Payable Fee, above four instalment cards (Downpayment, Instalment 1, 2 and 3) each stamped with a Razorpay logo and due dates."
                    width={900}
                    height={500}
                  />
                </div>
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>Net Payable splits evenly across the tenure,</strong> and the last
                    instalment takes whatever the division didn&apos;t divide cleanly. Nobody has to
                    notice that, let alone fix it.
                  </p>
                </SeeMore>
              </div>

              <SeeMore>
                <div>
                  <p>
                    <strong>Step two is the letter.</strong> Three named templates, an acceptance
                    deadline, and a live preview of the actual email with the scholarship amount
                    rendering through its merge tag as the BDR types. The failure it prevents is an
                    offer reaching a paying customer with the wrong discount in it.
                  </p>
                </div>
              </SeeMore>

              <div className="cs-article-slot">
                <div className="cs-article-hscroll">
                  <img
                    src="/case-studies/oms/body/offer-flow-milestones.png"
                    alt="Milestones rail: Application (completed, all three substages checked), Offer (in progress, Payment Plan Created ongoing), and Payment & Enrolment (pending)."
                    width={248}
                    height={320}
                  />
                  <img
                    src="/case-studies/oms/body/offer-flow-activity-log.png"
                    alt="Activity log: a reverse-chronological list of timestamped entries including Application filled, Deal Assigned to Angad Saini, Deal Reopened, Deal Marked Not Interested, with a free-text reason on the most recent reassignment."
                    width={248}
                    height={320}
                  />
                </div>
                <SeeMore>
                  <p className="cs-article-figure-caption__desc">
                    <strong>Two histories, on purpose.</strong> Milestones answer &quot;where is this
                    deal&quot;. The activity log answers &quot;who did what, and why&quot;. Read the log
                    entries below: the free-text reasons are what a BDR actually typed. Nobody asked for
                    that field. It became the most-read thing on the page.
                  </p>
                </SeeMore>
              </div>

              <SeeMore>
                <div>
                  <p>
                    <strong>Enrolment, the fourth and final milestone, is a real screen, not just a
                    label at the end of the flow diagram.</strong> It stays locked until the first
                    payment clears, then opens to the specifics that actually matter at handover: the
                    applicant&apos;s name, who their admission counsellor is, their application and LMS
                    IDs, and their first session date. Small screen, but it&apos;s the one that answers
                    &quot;is this actually a student yet&quot;, and it didn&apos;t exist as its own thing
                    before this rebuild.
                  </p>
                </div>
              </SeeMore>
            </CaseStudySection>

          <CaseStudySection
              id="leading-it"
              number="07"
              eyebrow="Leading It"
              category="People leadership"
              questions={[
                'How did you divide the work, and what did you delegate?',
                'How did you develop the designer on this project?',
                'What did that way of working cost?',
              ]}
              heading="I did both jobs. That was the strength and the bottleneck."
              hasMore
            >
              <div>
                <p>
                  On this project the line between product management and design leadership was
                  blurry, and I made most of the product calls myself: sequencing, scope, and the
                  definitions in section 03. That&apos;s the honest version of my role, and it&apos;s
                  why those decisions are mine to defend rather than ours to share.
                </p>
              </div>

              <SeeMore>
                <p className="cs-article-statement cs-article-statement--display">
                  <span>The cost was that I became the bottleneck. </span>
                  <span className="cs-article-statement__dim">
                    Decisions queued behind me, because I was the only person holding the whole picture
                    at once: the floor&apos;s workflow, the reporting model, and the roadmap argument.
                  </span>
                </p>

                <div>
                  <p>
                    On a team of three that was survivable, and probably faster than splitting the roles
                    would have been. At ten people it&apos;s the failure mode. Knowing which of those two
                    situations I&apos;m in is most of what I&apos;d do differently at the next scale.
                  </p>
                  <p>
                    <strong>On delegation.</strong> I was hands-on early, doing the information
                    architecture, the structure and the first wireframes, and then handed the execution
                    surface to Ved entirely. He built out states for every frame and component and led
                    the handover to engineering. After that point my review was deliberately narrow. I
                    reviewed against the flows and the IA, not against my own taste.
                  </p>
                </div>
              </SeeMore>
            </CaseStudySection>

          <CaseStudySection
              id="impact"
              number="08"
              eyebrow="Impact"
              category="Measurement"
              questions={[
                'What was the impact, and how do you know?',
                "“100% adoption” of a mandatory tool isn't a metric.",
                "What's the honest attribution here?",
              ]}
              heading="Four numbers I'll stand behind, and three I won't."
              hasMore
            >
              <div className="cs-article-stat-grid">
                <div className="cs-article-stat-grid__cell">
                  <div className="cs-article-stat-grid__value-row">
                    <span className="cs-article-stat-grid__icon" />
                    <span className="cs-article-stat-grid__value">&lt; 1 hour</span>
                  </div>
                  <p className="cs-article-stat-grid__label">was 1–2 days</p>
                  <p className="cs-article-stat-grid__desc">
                    Turnaround on sending an application form or rolling out an offer
                  </p>
                </div>
                <div className="cs-article-stat-grid__cell">
                  <div className="cs-article-stat-grid__value-row">
                    <span className="cs-article-stat-grid__icon cs-article-stat-grid__icon--down">↓</span>
                    <span className="cs-article-stat-grid__value">18%</span>
                  </div>
                  <p className="cs-article-stat-grid__label">lead drop / dispose rate</p>
                  <p className="cs-article-stat-grid__desc">Leads dropped or disposed after the rebuild</p>
                </div>
                <div className="cs-article-stat-grid__cell">
                  <div className="cs-article-stat-grid__value-row">
                    <span className="cs-article-stat-grid__icon cs-article-stat-grid__icon--down">↓</span>
                    <span className="cs-article-stat-grid__value">4 → 3 days</span>
                  </div>
                  <p className="cs-article-stat-grid__label">new BDR training</p>
                  <p className="cs-article-stat-grid__desc">
                    Onboarding time for a new BDR, with fewer follow-up questions after
                  </p>
                </div>
                <div className="cs-article-stat-grid__cell">
                  <div className="cs-article-stat-grid__value-row">
                    <span className="cs-article-stat-grid__icon" />
                    <span className="cs-article-stat-grid__value">4.2/5</span>
                  </div>
                  <p className="cs-article-stat-grid__label">+25% on previous tooling</p>
                  <p className="cs-article-stat-grid__desc">Internal NPS across the sales floor</p>
                </div>
              </div>

              <SeeMore>
                <div>
                  <p>
                    The team also recorded 100% adoption, and cited roughly 30% more revenue in a
                    quarter as indirect impact. I don&apos;t put those on a page as results. Adoption of
                    a tool the job requires you to use measures the mandate. Daily actives on a tool
                    people live in tracks headcount and rollout. And I&apos;m not going to claim a design
                    tripled revenue, because the courses, the pricing and the market did that. What this
                    work plausibly did was take friction and leakage out of a funnel that was already
                    converting, which is a smaller claim and a defensible one.
                  </p>
                </div>

                <div>
                  <p>
                    The more useful answer is what I&apos;d instrument if I ran it again, because
                    that&apos;s the part I got wrong. <strong>We built a measurement product for a sales
                    floor and shipped no measurement of ourselves.</strong> Every row below names the
                    decision it tests. If no decision moves a number, the number is decoration.
                  </p>
                </div>

                <div className="cs-article-measure-table">
                <div className="cs-article-measure-table__row cs-article-measure-table__row--head">
                  <span className="cs-article-measure-table__what">What I&apos;d Measure</span>
                  <span className="cs-article-measure-table__proves">What It proves</span>
                  <span className="cs-article-measure-table__figure">Before*</span>
                  <span className="cs-article-measure-table__figure">After*</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Median time, pitch to offer sent</span>
                  <span className="cs-article-measure-table__proves">
                    The last mile got shorter, which is the core promise
                  </span>
                  <span className="cs-article-measure-table__figure">1d4h</span>
                  <span className="cs-article-measure-table__figure">52m</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Deals waiting on a BDR over 48h</span>
                  <span className="cs-article-measure-table__proves">
                    Leak rate. The red-badge logic either works or it doesn&apos;t
                  </span>
                  <span className="cs-article-measure-table__figure">31%</span>
                  <span className="cs-article-measure-table__figure">12%</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Offers revised within 24h of sending</span>
                  <span className="cs-article-measure-table__proves">
                    Error rate, and the direct test of Amount Left and the live preview
                  </span>
                  <span className="cs-article-measure-table__figure">16%</span>
                  <span className="cs-article-measure-table__figure">5%</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Time to build a part-payment plan</span>
                  <span className="cs-article-measure-table__proves">
                    Whether the wizard beat the spreadsheet it replaced
                  </span>
                  <span className="cs-article-measure-table__figure">10m</span>
                  <span className="cs-article-measure-table__figure">2m</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Realised-to-booked ratio at day 30</span>
                  <span className="cs-article-measure-table__proves">
                    Collection health, which is what the Booked and Realised split exists to expose
                  </span>
                  <span className="cs-article-measure-table__figure">34%</span>
                  <span className="cs-article-measure-table__figure">52%</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Manager hours per week assembling reports</span>
                  <span className="cs-article-measure-table__proves">The original ask, answered honestly</span>
                  <span className="cs-article-measure-table__figure">~5h</span>
                  <span className="cs-article-measure-table__figure">~25m</span>
                </div>
                <div className="cs-article-measure-table__row">
                  <span className="cs-article-measure-table__what">Share of deal actions taken inside OMS</span>
                  <span className="cs-article-measure-table__proves">
                    The honest replacement for &quot;100% adoption&quot;
                  </span>
                  <span className="cs-article-measure-table__figure">n/a</span>
                  <span className="cs-article-measure-table__figure">88%</span>
                </div>
              </div>

              <div className="cs-article-measure-footnote">
                <p className="cs-article-measure-footnote__label">*Placeholder/Illustrative Numbers</p>
                <p>
                  Every figure in that table is illustrative. It&apos;s there to show which measures
                  would make this work defensible, not to imply they were captured. I&apos;d rather
                  show you the measurement I should have designed than quote a real-sounding number I
                  can&apos;t source.
                </p>
              </div>
              </SeeMore>
            </CaseStudySection>

          <CaseStudySection
              id="reflection"
              number="09"
              eyebrow="Reflection"
              category="Prioritisation · Self-awareness"
              questions={[
                'What would you do differently?',
                'What did you cut, and what did that cost?',
                "What's still broken?",
                'How would you build this today?',
              ]}
              heading="I sequenced for the people funding it, not the people using it."
              hasMore
            >
              <div>
                <p>Sequencing ran on two axes, and I&apos;d keep one of them.</p>
              </div>

              <SeeMore>
                <div>
                  <p>
                    <strong>The one I&apos;d keep.</strong> Anything that took days by hand got built
                    first. Sending an application form and rolling out an offer were one-to-two-day
                    waits touching three teams. Ordering by turnaround-time pain is clean, it&apos;s
                    defensible, and it produced the sub-hour result above.
                  </p>
                  <p>
                    <strong>The one I&apos;d argue with myself about.</strong> Dashboards shipped ahead
                    of workflow depth, because leadership&apos;s pain was the loudest. The Content
                    module and the secondary nav areas were cut outright to make that possible.
                  </p>
                  <p>
                    It was right for keeping the project alive. Visibility is what got it funded, and a
                    rebuild that dies in month two helps nobody. But it means the people inside this
                    product eight hours a day got served second.
                  </p>
                </div>

                <p className="cs-article-statement cs-article-statement--display">
                  The BDRs watched the tool get better at measuring them before it got better at helping
                  them, and I don&apos;t think that&apos;s a neutral thing to do to a sales floor
                  you&apos;re simultaneously asking to trust the numbers.
                </p>

                <div>
                  <p>
                    If I ran it again I&apos;d interleave instead of stacking. One workflow improvement
                    shipped alongside every dashboard milestone. Same total scope, same funding argument,
                    but the daily users are never more than one release away from something built for
                    them.
                  </p>
                </div>

                <div>
                  <p className="cs-article-subheading">And if I built it in 2026</p>
                  <p>
                    The nine-field filter modal becomes a sentence. The deals list is a query and we
                    built a form for it, then shipped a bug where the counts didn&apos;t follow. Today
                    I&apos;d put natural language over the same query, something like &quot;every deal
                    where the offer expired and nobody has called since&quot;, and let the filter chips
                    be the result of the sentence rather than the way you compose it.
                  </p>
                  <p>
                    The drill-down gets prototyped in code on day one. A cascading interaction is
                    genuinely hard to judge as static frames, and we judged it as static frames. A
                    working prototype in a day would have surfaced the ATL gap immediately, because you
                    can&apos;t click a tier that isn&apos;t there. Building this prototype years later is
                    the same instinct. I wanted to click through the direction before writing about it,
                    and where it didn&apos;t hold up I&apos;d rather find that out here than after an
                    engineering team had built it.
                  </p>
                </div>
              </SeeMore>
            </CaseStudySection>
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
