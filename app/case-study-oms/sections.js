import { Statement } from '@/components/case-study-kit/Motion';
import { Columns, Embed, Note, Section, Stats, Table } from '@/components/case-study-kit/Blocks';
import { Gallery } from '@/components/case-study-kit/Shots';
import Num from '@/components/case-study-kit/Num';
import DecisionStepper from '@/components/DecisionStepper';
import OMSComponentEmbed from '@/components/OMSComponentEmbed';

// The nine sections of the OMS case study. Copy is the author's, unchanged; only the scaffolding around
// it is the kit's. The live embeds and the decision stepper are this page's own and are kept as they were.

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
    heading: 'Booked and Realised are two numbers, never one',
    desc: 'Settled with the sales and finance leads before anything was drawn, then built into the dashboard as two figures with the collection split underneath.',
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

export default function OmsSections() {
  return (
    <>
      {/* ---------- 01 Context ---------- */}
      <Section
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
            Novatr teaches AEC professionals through three flagship courses, and sells almost all of
            them through a floor of BDRs. Before OMS, nobody could get a straight answer about that
            floor. Asking how it was tracking against target meant somebody assembling the answer by
            hand. That took hours, and on bad days it took days.
          </p>
          <p>
            Sending an application form or rolling out an offer touched the CRM and two other teams,
            so every one of those added delay. And there was no way to see where leads were actually
            getting stuck.
          </p>
        </div>

        <div>
          <p>
            OMS v1 was meant to fix all of that. It was built by the engineering team on its own, with
            no product or design input. It handled the handful of scenarios it had been specified for
            and broke outside them, so every new scenario turned into an engineering ticket. New BDRs
            needed retraining whenever the floor changed shape, and getting one thing done meant
            bouncing between HubSpot, OMS and WhatsApp.
          </p>
        </div>

        <Statement>That isn&apos;t a usability problem. It&apos;s an ownership problem.</Statement>

        <div>
          <p>
            A tool built to spec never gets asked why it feels slow to somebody in their first week. A
            product does. The real deliverable of this rebuild was moving OMS from engineering
            ownership to product ownership, and every design decision below was only available to us
            because that shift happened first.
          </p>
        </div>

        <Gallery
          columns={1}
          fit="natural"
          items={[
            {
              src: '/case-studies/oms/body/context-system-of-record.png',
              alt: "Diagram comparing HubSpot's four-step flow, which converges into one deal record, against OMS v1's four steps scattering across a spreadsheet, inbox, and WhatsApp with no single owner.",
              width: 1472,
              height: 400,
              caption:
                'The gap, drawn once. Left of the line, four steps converge into one record. Right of it, four steps scatter across three tools and cross over each other, so no tool owns a step and no step owns a tool. That crossing is what a BDR actually did all day, and it is why nobody could answer a question about the floor without assembling it by hand.',
            },
          ]}
        />
      </Section>

      {/* ---------- 02 The Mandate ---------- */}
      <Section
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
        </div>

        <div>
          <p>
            <strong>I made the cost of slowness visible.</strong> Not a critique of the interface. How
            many hours it took to answer a question as basic as how the floor was tracking against
            target, and what that delay cost in planning that never happened. It was a number
            leadership already cared about, attached to a cause they hadn&apos;t connected it to.
          </p>
          <p>
            <strong>I let the pain come from the users.</strong> The Sales Head was the loudest voice
            on this and by far the most credible one. My job was getting that frustration into the
            room where budget gets decided, instead of letting it become a design team complaining
            about a design team problem.
          </p>
          <p>
            <strong>I argued it into the roadmap.</strong> I sat in the product roadmap planning
            sessions, so the rebuild competed openly against other bets and won on merit. Internal
            tools usually get funded by being slipped through as maintenance, which is also why they
            usually stay half built.
          </p>
        </div>

        <div>
          <p className="lx-subheading">Where the argument came from</p>
          <p>
            None of that works without evidence, and the evidence is the part I&apos;d defend as mine.
            Ved and Nikhil ran most of the sessions. What I did was{' '}
            <strong>
              design the enquiry: deciding which levels get asked what, and refusing to let the
              observation stop at the part of the funnel that&apos;s interesting to watch.
            </strong>
          </p>
        </div>

        <Columns
          items={[
            {
              label: 'The Interview Ladder',
              title: 'Every level of the sales hierarchy, up to the Sales Head',
              desc: 'The ladder was the point. Asking the same question at four altitudes shows you exactly where the answers stop agreeing, and that gap is where the real problem lives.',
            },
            {
              label: 'Live Call Shadowing',
              title: 'Sales calls observed, then followed past the interesting part',
              desc: 'What happens after a lead is marked interested was the half nobody could describe secondhand. Insisting the team follow it there is what made the flows real instead of reported.',
            },
            {
              label: 'Roadmap Sessions',
              title: 'Repeated pressure testing in product planning',
              desc: 'Not research, but it did the same job. The argument had to survive the people whose budget it was competing with.',
            },
          ]}
        />

        <Gallery
          columns={1}
          fit="natural"
          maxWidth="720px"
          items={[
            {
              src: '/case-studies/oms/body/mandate-interview-ladder.png',
              alt: 'Bar chart showing how much of the funnel each role could see: BDR 90%, Team Lead 55%, Team Manager 30%, Sales Head 8% — the blind spot grows toward the top of the hierarchy.',
              width: 1472,
              height: 1080,
              caption: (
                <>
                  <strong>The same question, asked at four altitudes.</strong> Everyone answered it, and
                  no two people answered the same question. The bars are what mattered more: the further
                  up the hierarchy, the less of your own remit you could actually see without somebody
                  assembling it by hand. The Sales Head carried the widest responsibility and had the
                  worst view of it. Percentages are illustrative, drawn from what each level described
                  in interviews rather than from instrumentation.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ---------- 03 Decisions ---------- */}
      <Section
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
        <div>
          <p>
            Each one was cheap to make early and expensive to reverse late, which is my working
            definition of what a design manager should be spending attention on. The screens are
            Ved&apos;s. These are mine.
          </p>
        </div>

        <DecisionStepper decisions={decisions} />
      </Section>

      {/* ---------- 04 The System ---------- */}
      <Section
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
            The floor had five tiers: BDR, Associate Team Lead, Team Lead, Team Manager, and the Sales
            Head who saw everything. The obvious brief was five dashboards, and that brief would have
            killed us.
          </p>
        </div>

        <div>
          <p>
            What we built instead was one set of components, reused at every altitude, with only the
            data scope changing behind them. In v2.0 that meant one funnel-card component: four cards
            reading Applications Sent, Offers Shared, Converted, Payment Clearance. In the v3.0
            rebuild that same principle produced a richer headline: a single flow diagram, one shape
            from Application through Offer, Payment and Completed, with the drop-off between every
            stage stamped directly on it. The four-card grid didn&apos;t disappear, it got demoted:
            it&apos;s now the scoped breakdown you see for one Team Manager&apos;s cohort or one
            BDR&apos;s own funnel, nested under the same headline shape everyone else sees.
          </p>
        </div>

        <Embed
          caption={
            <>
              <strong>The whole pipeline, as one shape.</strong> Applications, Offers, Payment and
              Completed, with the conversion between each stage read directly off the ribbon. Average
              Ticket Size sits in the corner of the same card. This is the answer to &quot;how is the
              floor doing right now&quot;, and it doesn&apos;t need a second screen.
            </>
          }
        >
          <OMSComponentEmbed view="sales-funnel" height={425} frameWidth={900} />
        </Embed>

        <Statement>
          The brief from the Sales Head, restated in his own words months after launch, was that he
          wanted to look at this page once and know the health of the floor, where the pipeline
          actually was, where deals were stuck, and what payment was coming in.
        </Statement>

        <Note>
          <p>Three more cards answer the parts the flow diagram can&apos;t.</p>
        </Note>

        <Embed
          caption={
            <>
              <strong>Where deals are stuck, named per stage.</strong> Nine stages, each a bar sized by
              count. The two hatched bars are loss buckets, Payment Plan Pending and Rejected, so a
              stall reads differently from a stage that&apos;s simply early. This is the direct answer
              to &quot;where are deals stuck&quot;, and it&apos;s a card, not a report someone has to
              run.
            </>
          }
        >
          <OMSComponentEmbed view="deal-stages" height={320} frameWidth={610} />
        </Embed>

        <Embed
          caption={
            <>
              <strong>Payment incoming, and where it&apos;s leaking.</strong> Realised revenue splits
              into Previous Period and Total, so a Sales Head can see how much of today&apos;s cash is
              old commitments finally landing versus new ones. Beside it, conversion by course with a
              Lost Deals count folded into the same card, because &quot;how is the floor doing&quot;
              and &quot;where are we losing people&quot; are one question, not two.
            </>
          }
        >
          <OMSComponentEmbed view="realised-conversion" height={400} frameWidth={900} />
        </Embed>

        <Embed
          caption={
            <>
              <strong>Booked and Realised, drawn as a gap.</strong> Booked and Realised plotted as two
              lines across the month, rather than a single number — the space between them is the
              thing a Sales Head is actually watching. There&apos;s also a payment-mode breakdown by
              gateway, built as its own component, that isn&apos;t wired into any page yet. No screen
              has been designed for it. It exists ahead of its own UI slot, which is a more honest
              state for unfinished work to be in than pretending it isn&apos;t there.
            </>
          }
        >
          <OMSComponentEmbed view="booked-revenue" height={416} frameWidth={900} />
        </Embed>

        <div>
          <Statement>Team performance, named per manager</Statement>
          <p>
            Below the floor-wide numbers, every Team Manager gets a card that answers the same
            questions about their own team: a heatmap of every deal&apos;s health, colour by colour,
            gray when the card is collapsed and lit up the moment you expand it; a pending-actions
            count split by Applications, Offers and Payment; a unit sales attainment figure against
            target; and Booked, Realised and Average Ticket Size for that manager alone, each with its
            own change badge.
          </p>
        </div>

        <Embed
          caption={
            <>
              <strong>One manager, one card, four questions answered.</strong> The heatmap alone is one
              deal per square, colour-coded by the same status model as the drill-down below, so a Team
              Manager sees the shape of their book before reading a single number.
            </>
          }
        >
          <OMSComponentEmbed view="team-manager-card" height={368} frameWidth={900} autoHeight />
        </Embed>

        <div>
          <p>
            The Applications and Payments lists work the same way: same columns, same filters,
            different scope. Every altitude also carries the same Overview and Performance toggle.
            Overview shows the funnel breakdown, Performance swaps in four KPI tiles including Average
            Ticket Size. One toggle, learned once, meaning the same thing everywhere.
          </p>
          <p>
            <strong>The drill-down is the piece I&apos;d demo live.</strong> Clicking a Team Manager
            filters the Team Leads column to their reports. Clicking a Team Lead filters the BDRs
            column. Selecting a BDR populates a detail panel with that person&apos;s own funnel view,
            which is the same component again. A Sales Head goes from an org-wide revenue dip to the
            one person responsible in three clicks, without leaving the page or exporting anything.
          </p>
        </div>

        <Embed caption="Live, not a screenshot — click a Team Manager to see the Team Leads column filter, the way it would for a real Sales Head. The empty states carry the instruction, so the interaction teaches itself rather than needing a tooltip.">
          <OMSComponentEmbed view="team-drilldown" height={401} />
        </Embed>

        <div>
          <a href="#prototype" className="btn btn--rainbow-outline">
            Open full prototype ↗
          </a>
        </div>

        <Note label="What I got wrong" tone="flag">
          <p>
            <strong>
              The Associate Team Lead is a genuine, distinct permission tier, and it has no home in
              the reporting model. The admin drill-down runs Team Manager, Team Lead, BDR, straight
              past it.
            </strong>
          </p>
          <p>
            So we shipped a role that could hold a deal but couldn&apos;t be reported on. That&apos;s
            an information architecture inconsistency, the IA was mine, and I missed it. The fix
            I&apos;d take today is the smaller one: stop treating ATL as a tier and make it a flag on a
            BDR. One fewer level is worth more than fidelity to the org chart.
          </p>
        </Note>
      </Section>

      {/* ---------- 05 Status ---------- */}
      <Section
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
        <div>
          <p>
            A deal has a stage and a sub-status. What it needed was a third thing the list could be
            read by at nine in the morning: am I the blocker? So colour got assigned to agency rather
            than to progress.
          </p>
        </div>

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
          <p className="sr-only">Amber · timed out. Green · moving. Red badge · waiting on you. Grey · global status.</p>
        </div>

        <Gallery
          columns={1}
          fit="natural"
          maxWidth="760px"
          items={[
            {
              src: '/case-studies/oms/body/status-deals-list.png',
              alt: 'Deals list with color-coded status badges per row: green for Application New and Plan Created, blue for Application, Plan and Offer Pending stages, red for Action, and amber for Awaiting approval.',
              width: 1440,
              height: 736,
              caption: (
                <>
                  <strong>One glance tells a BDR what needs them.</strong> Application Pending is blue
                  because the learner is holding the form. Offer Expired is amber because the deal is
                  decaying quietly. Global Not Interested and Global Saved are grey because a deal can
                  die at any stage. The globe icon flags an international lead, which changes both the
                  currency and the gateway.
                </>
              ),
            },
          ]}
        />

        <Gallery
          columns={1}
          fit="natural"
          maxWidth="760px"
          items={[
            {
              src: '/case-studies/oms/body/status-tabs.png',
              alt: "Deals list header and filter tab bar: breadcrumb Home / Deals, '157 Deals across the floor', and tabs reading Action Required 37, New 21, Application 37, Plan 11, Offer 21, Payment 43, Cancelled 1, Not interested 17, Rejected 6, Saved 5.",
              width: 1440,
              height: 317,
              caption: (
                <>
                  <strong>The tabs deliberately overlap.</strong> Action Required isn&apos;t a bucket,
                  it&apos;s a filter across every red-badged status in the funnel, which is why the
                  counts don&apos;t add up to <Num to={157} />. A BDR opening OMS isn&apos;t asking
                  what&apos;s in stage three. They&apos;re asking what their Team Lead will bring up at
                  standup. I&apos;d defend the overlap. What I wouldn&apos;t defend is that we never
                  made it legible, so a new BDR has to be told.
                </>
              ),
            },
          ]}
        />

        <div>
          <a href="#prototype" className="btn btn--rainbow-outline">
            Open The Deals List ↗
          </a>
        </div>

        <Note label="The bug that shipped" tone="flag">
          <p>
            <strong>Filtering the list didn&apos;t recompute the tab counts above it.</strong> Filters
            ran over the list, and the counts were computed against the unfiltered query. So the page
            could show you nine deals under a tab reading forty-one.
          </p>
          <p>
            We knew about it. It never beat anything else on the list. It&apos;s small, and it quietly
            erodes trust in every other number on a page whose entire job is telling you the truth
            about your pipeline. That&apos;s the argument I should have made at the time and
            didn&apos;t. It&apos;s the first thing the v3.0 prototype fixes.
          </p>
        </Note>
      </Section>

      {/* ---------- 06 The Offer Flow ---------- */}
      <Section
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
      >
        <div>
          <p>
            Building an offer is the one moment in this product where a mistake is expensive, customer
            facing and effectively irreversible. Almost every decision in the two-step wizard is a
            refusal to let an error escape.
          </p>
        </div>

        <div>
          <p>
            <strong>Step one is the payment plan.</strong> The BDR picks a payment type, upfront, part
            payment, or EMI through a third party, then picks discounts from a fixed menu: Early Bird,
            Merit, Super Merit (locked behind Sales Ops approval), or a custom amount capped to that
            deal&apos;s fee. Nothing is typed free-hand. Course Fee minus Total Discount resolves to
            one number, Net Payable Fee, and the system builds the instalments itself: a fixed
            downpayment, then the remainder split evenly across the tenure the BDR picked, with the
            last instalment quietly absorbing whatever rupee the division left over. There is nothing
            for the BDR to total, because there is no longer a manual total to get wrong.
          </p>
          <p>
            An earlier version of this screen worked the other way around: the BDR typed each
            instalment by hand against a live Amount Left counter and couldn&apos;t proceed until it
            hit zero. It shipped, and it worked, but it was still asking a person to check arithmetic a
            computer should own. Once the discount tiers existed as rules rather than free text,
            generating the instalments automatically was the smaller change, and the counter came out.
          </p>
        </div>

        <Gallery
          columns={2}
          fit="contain"
          caption={
            <>
              <strong>Net Payable splits evenly across the tenure,</strong> and the last instalment
              takes whatever the division didn&apos;t divide cleanly. Nobody has to notice that, let
              alone fix it.
            </>
          }
          items={[
            {
              src: '/case-studies/oms/body/offer-flow-discounts.png',
              alt: 'Discount selection list: Early Bird Offer (unavailable), Merit Scholarship (available, checked), Super Merit Scholarship (approval required), and a Custom BDR Discount field with an Apply Discount button.',
              width: 1034,
              height: 637,
              caption: 'Discount selection',
            },
            {
              src: '/case-studies/oms/body/offer-flow-fee-breakdown.png',
              alt: 'Fee breakdown showing Course Fees, Total Discount and Net Payable Fee, above four instalment cards (Downpayment, 1st, 2nd and 3rd Instalment) each stamped with a Razorpay logo and due dates.',
              width: 652,
              height: 640,
              caption: 'Fee breakdown and instalments',
            },
          ]}
        />

        <div>
          <p>
            <strong>Step two is the letter.</strong> Three named templates, an acceptance deadline, and
            a live preview of the actual email with the scholarship amount rendering through its merge
            tag as the BDR types. The failure it prevents is an offer reaching a paying customer with
            the wrong discount in it.
          </p>
        </div>

        <Gallery
          columns={2}
          fit="contain"
          caption={
            <>
              <strong>Two histories, on purpose.</strong> Milestones answer &quot;where is this
              deal&quot;. The activity log answers &quot;who did what, and why&quot;. Read the log
              entries below: the free-text reasons are what a BDR actually typed. Nobody asked for that
              field. It became the most-read thing on the page.
            </>
          }
          items={[
            {
              src: '/case-studies/oms/body/offer-flow-milestones.png',
              alt: 'Milestones rail: Application (completed, all three substages checked), Offer (in progress, Payment Plan Created ongoing), and Payment & Enrolment (pending).',
              width: 496,
              height: 640,
              caption: 'Milestones',
            },
            {
              src: '/case-studies/oms/body/offer-flow-activity-log.png',
              alt: 'Activity log: a reverse-chronological list of timestamped entries including Application filled, Deal Assigned to Angad Saini, Deal Reopened, Deal Marked Not Interested, with a free-text reason on the most recent reassignment.',
              width: 496,
              height: 640,
              caption: 'Activity log',
            },
            {
              src: '/case-studies/oms/body/offer-flow-form.png',
              alt: 'Candidate application form: Basic Information (name Dhruv Bhatt, phone, email, city, state, country) and Professional Details (current role, experience, English proficiency, income band, tools: AutoCAD, Revit, Rhinoceros 3D).',
              width: 754,
              height: 640,
              caption: 'Application form',
            },
            {
              src: '/case-studies/oms/body/offer-flow-deal-detail.png',
              alt: 'Deal detail panel: View On HubSpot and Chat On WhatsApp buttons, a Global Status row (Not Interested, Mark Reject, Save for Later), and an Assignment list naming the LC, TL and TM.',
              width: 602,
              height: 640,
              caption: 'Deal detail',
            },
          ]}
        />

        <div>
          <p>
            <strong>
              Enrolment, the fourth and final milestone, is a real screen, not just a label at the end
              of the flow diagram.
            </strong>{' '}
            It stays locked until the first payment clears, then opens to the specifics that actually
            matter at handover: the applicant&apos;s name, who their admission counsellor is, their
            application and LMS IDs, and their first session date. Small screen, but it&apos;s the one
            that answers &quot;is this actually a student yet&quot;, and it didn&apos;t exist as its
            own thing before this rebuild.
          </p>
        </div>
      </Section>

      {/* ---------- 07 Leading It ---------- */}
      <Section
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
      >
        <div>
          <p>
            On this project the line between product management and design leadership was blurry, and
            I made most of the product calls myself: sequencing, scope, and the definitions in section
            03. That&apos;s the honest version of my role, and it&apos;s why those decisions are mine
            to defend rather than ours to share.
          </p>
        </div>

        <Statement>
          The cost was that I became the bottleneck. Decisions queued behind me, because I was the only
          person holding the whole picture at once: the floor&apos;s workflow, the reporting model, and
          the roadmap argument.
        </Statement>

        <div>
          <p>
            On a team of three that was survivable, and probably faster than splitting the roles would
            have been. At ten people it&apos;s the failure mode. Knowing which of those two situations
            I&apos;m in is most of what I&apos;d do differently at the next scale.
          </p>
          <p>
            <strong>On delegation.</strong> I was hands-on early, doing the information architecture,
            the structure and the first wireframes, and then handed the execution surface to Ved
            entirely. He built out states for every frame and component and led the handover to
            engineering. After that point my review was deliberately narrow. I reviewed against the
            flows and the IA, not against my own taste.
          </p>
        </div>
      </Section>

      {/* ---------- 08 Impact ---------- */}
      <Section
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
      >
        <Stats
          columns={2}
          items={[
            { prefix: '< ', value: 1, suffix: ' hour', label: 'was 1–2 days', desc: 'Turnaround on sending an application form or rolling out an offer' },
            { trend: 'down', value: 18, suffix: '%', label: 'lead drop / dispose rate', desc: 'Leads dropped or disposed after the rebuild' },
            { trend: 'down', text: '4 → 3 days', label: 'new BDR training', desc: 'Onboarding time for a new BDR, with fewer follow-up questions after' },
            { value: 4.2, decimals: 1, suffix: '/5', label: '+25% on previous tooling', desc: 'Internal NPS across the sales floor' },
          ]}
        />

        <div>
          <p>
            The team also recorded 100% adoption, and cited roughly 30% more revenue in a quarter as
            indirect impact. I don&apos;t put those on a page as results. Adoption of a tool the job
            requires you to use measures the mandate. Daily actives on a tool people live in tracks
            headcount and rollout. And I&apos;m not going to claim a design tripled revenue, because
            the courses, the pricing and the market did that. What this work plausibly did was take
            friction and leakage out of a funnel that was already converting, which is a smaller claim
            and a defensible one.
          </p>
        </div>

        <div>
          <p>
            The more useful answer is what I&apos;d instrument if I ran it again, because that&apos;s
            the part I got wrong.{' '}
            <strong>
              We built a measurement product for a sales floor and shipped no measurement of
              ourselves.
            </strong>{' '}
            Every row below names the decision it tests. If no decision moves a number, the number is
            decoration.
          </p>
        </div>

        <Table
          columns={[{ label: "What I'd Measure" }, { label: 'What It proves' }, { label: 'Before*', num: true }, { label: 'After*', num: true, flag: true }]}
          rows={[
            ['Median time, pitch to offer sent', 'The last mile got shorter, which is the core promise', '1d4h', { v: '52m', tone: 'good' }],
            ['Deals waiting on a BDR over 48h', "Leak rate. The red-badge logic either works or it doesn't", '31%', { v: '12%', tone: 'good' }],
            ['Offers revised within 24h of sending', 'Error rate, and the direct test of Amount Left and the live preview', '16%', { v: '5%', tone: 'good' }],
            ['Time to build a part-payment plan', 'Whether the wizard beat the spreadsheet it replaced', '10m', { v: '2m', tone: 'good' }],
            ['Realised-to-booked ratio at day 30', 'Collection health, which is what the Booked and Realised split exists to expose', '34%', { v: '52%', tone: 'good' }],
            ['Manager hours per week assembling reports', 'The original ask, answered honestly', '~5h', { v: '~25m', tone: 'good' }],
            ['Share of deal actions taken inside OMS', 'The honest replacement for "100% adoption"', 'n/a', { v: '88%', tone: 'good' }],
          ]}
          minWidth={680}
        />

        <Note label="*Placeholder/Illustrative Numbers" tone="flag">
          <p>
            Every figure in that table is illustrative. It&apos;s there to show which measures would
            make this work defensible, not to imply they were captured. I&apos;d rather show you the
            measurement I should have designed than quote a real-sounding number I can&apos;t source.
          </p>
        </Note>
      </Section>

      {/* ---------- 09 Reflection ---------- */}
      <Section
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
      >
        <div>
          <p>Sequencing ran on two axes, and I&apos;d keep one of them.</p>
        </div>

        <div>
          <p>
            <strong>The one I&apos;d keep.</strong> Anything that took days by hand got built first.
            Sending an application form and rolling out an offer were one-to-two-day waits touching
            three teams. Ordering by turnaround-time pain is clean, it&apos;s defensible, and it
            produced the sub-hour result above.
          </p>
          <p>
            <strong>The one I&apos;d argue with myself about.</strong> Dashboards shipped ahead of
            workflow depth, because leadership&apos;s pain was the loudest. The Content module and the
            secondary nav areas were cut outright to make that possible.
          </p>
          <p>
            It was right for keeping the project alive. Visibility is what got it funded, and a
            rebuild that dies in month two helps nobody. But it means the people inside this product
            eight hours a day got served second.
          </p>
        </div>

        <Statement>
          The BDRs watched the tool get better at measuring them before it got better at helping them,
          and I don&apos;t think that&apos;s a neutral thing to do to a sales floor you&apos;re
          simultaneously asking to trust the numbers.
        </Statement>

        <div>
          <p>
            If I ran it again I&apos;d interleave instead of stacking. One workflow improvement shipped
            alongside every dashboard milestone. Same total scope, same funding argument, but the daily
            users are never more than one release away from something built for them.
          </p>
        </div>

        <div>
          <p className="lx-subheading">And if I built it in 2026</p>
          <p>
            The nine-field filter modal becomes a sentence. The deals list is a query and we built a
            form for it, then shipped a bug where the counts didn&apos;t follow. Today I&apos;d put
            natural language over the same query, something like &quot;every deal where the offer
            expired and nobody has called since&quot;, and let the filter chips be the result of the
            sentence rather than the way you compose it.
          </p>
          <p>
            The drill-down gets prototyped in code on day one. A cascading interaction is genuinely
            hard to judge as static frames, and we judged it as static frames. A working prototype in a
            day would have surfaced the ATL gap immediately, because you can&apos;t click a tier that
            isn&apos;t there. Building this prototype years later is the same instinct. I wanted to
            click through the direction before writing about it, and where it didn&apos;t hold up
            I&apos;d rather find that out here than after an engineering team had built it.
          </p>
        </div>
      </Section>
    </>
  );
}
