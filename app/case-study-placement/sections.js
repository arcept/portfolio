import { Quote, Statement } from '@/components/case-study-kit/Motion';
import { BigStat, Note, Placeholder, Section, Stats, Table } from '@/components/case-study-kit/Blocks';
import { Gallery, Sequence } from '@/components/case-study-kit/Shots';
import Num from '@/components/case-study-kit/Num';
import Peek from '@/components/case-study-kit/Peek';
import ListenToSection from '@/components/narration/ListenToSection';

// The seven sections of the Placement Hub case study, animated on scroll: each zooms in and settles as
// it arrives, and zooms back out and dims as it leaves.

const bad = (v) => ({ v, tone: 'bad' });
const good = (v) => ({ v, tone: 'good' });

export default function PlacementSections() {
  return (
    <>
    {/* ---------- 01 The problem ---------- */}
    <Section
      id="problem"
      headerAction={<ListenToSection id="problem" />}
      number="01"
      eyebrow="The problem"
      category="Discovery · stakeholder interviews · process mapping"
      questions={['What was actually broken, and for whom?']}
      artifacts="Current-state journey map · problem statements · learner pain inventory"
      heading="Placement support felt invisible"
    >
      <div>
        <p>
          A learner finishing a Novatr course had already bought placement support. It was part
          of the course promise. What they actually encountered was a Slack channel, an email
          thread, and a Google Form sent <Num to={30} /> days before graduation.
        </p>
        <p>
          They could express interest. After that, <strong>the process disappeared.</strong> A learner had no way
          to see:
        </p>
        <ul className="lx-list">
          <li>Whether an opportunity matched them</li>
          <li>Whether their profile had been reviewed or shared</li>
          <li>Where an application stood</li>
          <li>Why they were ineligible</li>
          <li>What they could do next</li>
        </ul>
      </div>

      <div>
        <p>
          <strong>Every one of those is answerable. None of them was being answered.</strong> The work of the
          placement team was real and continuous, and almost none of it was legible to the person
          it was being done for.
        </p>
      </div>

      <Quote>“Messages get skipped in Slack.”</Quote>

      <div>
        <p>
          That line appears more often than any other in the discovery notes. It is a small
          complaint describing a large problem: the only channel connecting a learner to their
          own placement process was one they could scroll past.
        </p>
      </div>

      <Placeholder>
        Before-state workflow — Slack channel, Google Form, and manual operations process
      </Placeholder>
    </Section>

    {/* ---------- 02 Evidence ---------- */}
    <Section
      id="evidence"
      headerAction={<ListenToSection id="evidence" />}
      number="02"
      eyebrow="Evidence"
      category="Quantitative analysis · segmentation · metric definition"
      questions={['How do you know these were the real problems?']}
      artifacts="CSAT and NPS baselines · five learner types · operational metric set"
      heading="What the data showed"
    >
      <Statement>Satisfaction held through the learning experience, then dropped at the moment the
        company’s placement promise came due.</Statement>

      <div>
        <p>
          Novatr measured customer satisfaction at every stage of the learner journey. The data
          made the placement stage <strong>an unambiguous priority</strong>, while later reflection showed us
          where quantitative evidence alone was insufficient.
        </p>
      </div>

      <Table
        columns={[{ label: 'Stage' }, { label: 'CSAT', num: true }]}
        bars={{ col: 1, max: 100 }}
        rows={[
          ['Acquisition', '82'],
          ['Activation', '79.7'],
          ['Engagement', '82'],
          ['Completion', bad('55.5')],
          ['Placements', bad('51.5')],
        ]}
        minWidth={0}
      />

      <div>
        <p>
          Net Promoter Score told the same story by segment, and it <strong>fell the further a learner
          travelled.</strong>
        </p>
      </div>

      <Table
        columns={[{ label: 'Segment' }, { label: 'NPS', num: true }]}
        rows={[
          ['Learners, 0–3 months', '35'],
          ['Learners, 4–7 months', '32'],
          ['Graduates, placed', '14'],
          ['Graduates, not placed', bad('−18')],
        ]}
        minWidth={0}
      />

      <Note label="Note for publication" tone="flag"><p>
          The final version must state the survey period, sample sizes, methodology, and scale
          definitions for both instruments.
        </p></Note>

      <div>
        <p className="lx-subheading">The operational picture</p>
      </div>

      <Table
        columns={[{ label: 'Measure' }, { label: 'Baseline', num: true }, { label: 'Target', num: true }]}
        rows={[
          ['Opening live → profile shared with a company', bad('60+ hrs'), '16 working hrs'],
          ['Application rate on relevant openings', '46%', '70%'],
          ['Back-outs during hiring', bad('29.6%'), '<10%'],
          ['Shortlisting rate for shared profiles', '25%', '40%'],
          ['Eligible learners among those interested', '80%', '89%'],
          ['Relevant openings per learner, per week', '3', '5'],
        ]}
        minWidth={480}
      />

      <Note label="On attribution"><p>
          We used business metrics to set direction and define success. The product could
          directly influence visibility, readiness, applications, and operational speed; broader
          outcomes such as opportunity supply depended on the placement team and hiring market as
          well.
        </p>
      </Note>

      <div>
        <p>
          The last row is the clearest example.{' '}
          <strong>Relevant openings per learner per week is a supply-side measure.</strong> It
          moves when the partnerships and placement teams bring in more of the right roles. The
          portal’s job was to make that supply visible to the right learners and the gap
          measurable — not to create it.
        </p>
      </div>

      <div>
        <p className="lx-subheading">Who the learners actually were</p>
        <p>
          Five learner types came out of discovery, and they turned out to be the system’s real
          structure rather than a presentation device. The one that reframed the brief:{' '}
          <strong><Num to={30} suffix="%" /> of all placements were self-placed</strong> — learners who found jobs
          themselves, largely invisible to the company and unacknowledged by the product.
        </p>
      </div>

      <BigStat value={30} suffix="%" label="of all placements were self-placed — largely invisible to the company and unacknowledged by the product" />

      <Peek label="The five learner types" more="Show all five">
        <ul className="lx-list">
          <li>
            <strong>To-be graduates</strong> — still learning; may or may not become eligible.
          </li>
          <li>
            <strong>Eligible graduates</strong> — graduated, interest expressed, waiting.
          </li>
          <li>
            <strong>Active applicants</strong> — applied to at least one opening.
          </li>
          <li>
            <strong>Inactive learners</strong> — expressed interest, then disappeared.
          </li>
          <li>
            <strong>Self-placed learners</strong> — found a job independently. 30% of all
            placements.
          </li>
        </ul>
        <p>
          These five became the placement standings in the shipped system almost unchanged, which
          is why the state model later has the shape it does.
        </p>
      </Peek>

      <Placeholder>Research synthesis, learner segments, and baseline metrics</Placeholder>
    </Section>

    {/* ---------- 03 Reframing ---------- */}
    <Section
      id="reframing"
      headerAction={<ListenToSection id="reframing" />}
      number="03"
      eyebrow="Reframing"
      category="Problem framing · systems design · scope strategy"
      questions={['Why build a system when a page was asked for?']}
      artifacts="ECAT frame · shared status vocabulary · staged delivery plan"
      heading="From a placement page to a system"
    >
      <Statement>A page was asked for. The evidence described a process with no visible state, so I argued
        for a system.</Statement>

      <div>
        <p>
          The distinction is not academic. A standalone page could present one moment in the
          process. This problem needed shared rules for every meaningful condition, who changed
          it, and what the learner should understand when it changed.
        </p>
      </div>

      <div>
        <p className="lx-subheading">The frame the team worked to</p>
        <p>
          Early on we settled on a definition that held for the rest of the project. We
          summarised the learner problem into four needs:{' '}
          <strong>Eligibility, Communication, Access, and Tracking — ECAT.</strong> Every
          subsequent scope argument was conducted in those terms, which is a large part of why a
          three-month release did not fragment into a backlog.
        </p>
      </div>

      <Table
        columns={[{ label: 'ECAT' }, { label: 'What the learner needed' }, { label: 'What it became' }]}
        rows={[
          [<strong key="e">Eligibility</strong>, 'To know whether they qualify, and what to do if not', 'Course-page banner, criteria screen, actionable gate'],
          [<strong key="c">Communication</strong>, 'To be told when something changes', 'Updates feed and notification system'],
          [<strong key="a">Access</strong>, 'To see jobs that are actually for them', 'Relevance grouping, filters, matchmaking model'],
          [<strong key="t">Tracking</strong>, 'To know where an application stands, and why', 'My Applications, status ladder, rejection reasoning'],
        ]}
        minWidth={560}
      />

      <div>
        <p className="lx-subheading">
          1. Make eligibility legible and actionable, not merely enforced
        </p>
        <p>
          Learners qualify through weighted course completion, review-day attendance, and a
          complete profile. The business need was to hold that line. The research said the
          sharpest frustration was not being ineligible — it was not knowing why, and not knowing
          what to do about it.
        </p>
      </div>

      <Table
        columns={[{ label: 'Business need' }, { label: 'Learner need' }, { label: 'Design response' }]}
        rows={[
          [
            'Maintain qualification standards',
            'Understand why they are not eligible and how to become eligible',
            'Show criteria, current shortfall, and an actionable recovery path',
          ],
        ]}
        minWidth={560}
      />

      <div>
        <p>
          The argument I made was not that the gate should be softer. It was that <strong>a gate the
          learner cannot see is the thing generating the complaint.</strong>
        </p>
      </div>

      <div>
        <p className="lx-subheading">2. Design shared status vocabulary and data definitions</p>
        <p>
          The company knew it needed three products eventually: a learner portal, an internal tool
          for operations, and something for hiring partners. Definitions written narrowly for the
          first would become constraints on the other two. So eligibility, relevance, placement
          standing and application status were specified as system definitions rather than as
          screen behaviour — reusable, not merely sufficient.
        </p>
      </div>

      <div>
        <p className="lx-subheading">
          3. Stage the solution, and decline to build one part of it
        </p>
        <p>
          Ship the learner portal, because the learner was the only party with no visibility at
          all. Adapt Retool for operations rather than replacing it, because a three-month release
          that also required the ops team to change tools would have failed at the ops end. And
          deliberately do not build a hiring-partner portal.
        </p>
        <p>
          That last one was a finding, not a cut. Every hiring partner had its own evaluation
          process and its own way of selecting candidates, and they did not want to use a third
          party’s portal to assess our learners. Building it would have meant building for people
          who had said they would not use it. Applications continued to go out by email, in the
          format partners already worked in — while the structured records behind those emails were
          designed so a partner product could later sit on them without re-modelling anything.
        </p>
      </div>

      <Peek label="What the operations tool could and could not do">
        <p>
          Retool is organised by company and by opening. A learner exists in it only as an
          applicant row beneath a job, which means there was no view answering{' '}
          <em>“how is this learner doing overall?”</em> — precisely the visibility one of our own
          objectives asked for.
        </p>
        <p>
          That gap is the strongest argument for the internal tool that was always meant to
          follow, and it is the first thing I would put in it.
        </p>
      </Peek>

      <Placeholder>
        Decision framework or workshop showing learner, business, and operational constraints
      </Placeholder>
    </Section>

    {/* ---------- 04 Leadership ---------- */}
    <Section
      id="leadership"
      headerAction={<ListenToSection id="leadership" />}
      number="04"
      eyebrow="Leadership"
      category="Design management · coaching · stakeholder alignment"
      questions={['What did you do, and what did your designer do?']}
      artifacts="Review cadence · decision principles · ownership split"
      heading="How I led the work"
    >
      <div>
        <p>
          Sanya owned the detailed product design. This was her first major project at the
          company, and the flows, screens, states and documentation are hers — thorough enough
          that the entire product remains legible from them years later. She reported to me.
        </p>
      </div>

      <Table
        columns={[
          { label: 'My role — Manik, Product Design Manager' },
          { label: 'Product designer — Sanya' },
          { label: 'Product manager and operations' },
        ]}
        rows={[
          [
            'Problem framing, decision principles, systems thinking, design direction, design-system guidance, stakeholder alignment, quality reviews, and handover strategy',
            'Learner flows, interaction and visual design, state execution, detailed documentation, components, and engineering handover',
            'Scope, business objectives, roadmap decisions, operational feasibility, and implementation constraints',
          ],
        ]}
        minWidth={620}
      />

      <div>
        <p className="lx-subheading">The coaching that changed the work</p>
      </div>

      <Quote>Early work approached the placement experience as a sequence of screens. In reviews, I
          introduced a state-model question: “What must be true about this learner for this screen
          to appear, and what must they understand or do next?” This shifted the work from page
          design to explicit system states, producing reusable definitions for eligibility,
          placement standing, relevance, and application status.</Quote>

      <div>
        <p>
          That question was a core leadership contribution to the project. It turned a growing
          collection of screens into a bounded set of conditions, and gave Sanya a method she could
          apply independently in later work.
        </p>
        <p>
          This was Sanya’s first systems-heavy end-to-end project. By its conclusion, <strong>she could
          model complex product states independently</strong> — a capability that stayed with the team
          beyond this release.
        </p>
      </div>

      <div>
        <p className="lx-subheading">Where the balance was held</p>
        <p>
          We used regular design reviews to test decisions against learner evidence, resolve
          state-model questions, and keep engineering handover aligned with the system rather than
          individual screens.
        </p>
        <p>
          Design was in the room to represent the learner, product management to represent the
          business. The productive version of that is not a standoff — it is that either side has
          to show why a decision follows from what learners actually did. My interventions were
          almost always the same move: take a decision being made on intuition and send it back to
          the evidence.
        </p>
        <p>
          One thing I argued for and did not get: a genuinely personalised feed, ranking openings
          by fit and behaviour rather than filtering them by rule. It needed a substantial set of
          per-learner variables tracked from day one, and the agreed position was that this was too
          much for an initial scope. That was a reasonable call for a three-month release, and I
          would make it too from the product manager’s seat.
        </p>
      </div>

      <Placeholder>
        Design review or critique example showing the state-model question applied to real work
      </Placeholder>
    </Section>

    {/* ---------- 05 The product ---------- */}
    <Section
      id="product"
      headerAction={<ListenToSection id="product" />}
      number="05"
      eyebrow="The product"
      category="Interaction design · content design · state modelling"
      questions={['What did a learner actually see, and why that?']}
      artifacts="Dynamic banner · interest and eligibility flow · jobs and tracking · three endings"
      heading="Making state and next steps visible"
    >
      <Statement>Every surface answered two questions: where do I stand, and what happens next?</Statement>

      <Note label="Interactive prototype"><p>
          The working prototype is live at the top of this page, and everything in the four
          moments below is in it. Scroll and click inside the frame, or{' '}
          <a href="#prototype">jump back up to it</a>.
        </p>
      </Note>

      <div>
        <p className="lx-subheading">Four moments</p>
        <p>
          <strong>1. The course-page banner.</strong> The portal has no front door. A learner
          reaches it through a single banner on their course page that resolves differently
          depending on where they are — check your eligibility, complete the interest form, you
          have graduated, counting down to unlock, unlocked, not eligible, you said you were not
          interested. It was the first component specified, because it is the only thing that
          guarantees the product meets a learner wherever they happen to be.
        </p>
      </div>

      <Placeholder>Dynamic banner across key states</Placeholder>

      <div>
        <p>
          <strong>2. Eligibility and interest.</strong> Criteria shown in full, the learner’s
          current shortfall named, and a route to closing it on every screen that says no. The
          interest form replaced the Google Form — CTC expectations, notice period, preferred
          location, willingness to relocate, specialisation, and explicit consent to share the
          profile with hiring partners, with a plain-language disclaimer that completing it does
          not guarantee a job.
        </p>
        <p>
          <strong>3. Relevant opportunities.</strong> Openings grouped by relevance with counts,
          so a learner can see how much of the board is genuinely for them. Location is a{' '}
          <em>soft</em> criterion: a job outside a stated preference is not hidden and not blocked
          — the learner is told and decides. With <Num to={14} /> recorded cases of learners accepting
          offers and then declining over location, hiding those roles would have been the easy
          answer and the wrong one.
        </p>
        <p>
          <strong>4. Tracking, and an ending.</strong> Reasons travel with an application at every
          stage — a profile not shared says why, a rejection carries the reason given. And the
          journey has a designed conclusion whichever way it goes.
        </p>
      </div>

      <Sequence
        wide
        items={[
          {
            src: '/case-studies/placement-hub/body/jobs-board.png',
            alt: 'The jobs board: tabs for All Jobs, Featured, Relevant with a count, and Expired, then job cards showing company, role, degree and experience checks, location, and time left to apply.',
            width: 1504,
            height: 1280,
            label: 'Find an opening',
            caption: 'Openings are grouped by relevance with a count, and every card shows the degree and experience checks, the location and how long is left to apply.',
          },
          {
            src: '/case-studies/placement-hub/body/job-detail.png',
            alt: "A job description: company and role, the learner's degree and experience match, a deadline banner with an Apply Now button, then About the Job and Role Accountabilities.",
            width: 1504,
            height: 1280,
            label: 'Check the match, then apply',
            caption: 'The match against the requirements comes first, then one clear next action.',
          },
          {
            src: '/case-studies/placement-hub/body/application-tracker.png',
            alt: 'Application tracker titled Your Journey with AECOM Architects, listing Applied, Profile Shared and Profile Shortlisted as reached, then Selected for interview, Offer Received and Offer Accepted still to come.',
            width: 880,
            height: 812,
            label: 'Follow the application',
            caption: 'Each stage an application has reached is marked, and what comes next stays visible.',
          },
          {
            src: '/case-studies/placement-hub/body/ending-placed.png',
            alt: "Confirmation after accepting an offer: an illustration, the message 'Congratulations, you've accepted the offer from AECOM Architects', and a five-star Rate Experience control.",
            width: 1120,
            height: 856,
            label: 'Accept the offer',
            caption: 'Accept, confirm, celebrate, then rate the experience.',
          },
        ]}
      />

      <div>
        <p className="lx-subheading">Three endings</p>
        <p>
          <strong>Placed.</strong> Accept, confirm, celebrate, then rate the experience and share
          the story. After that the product deliberately restricts access to the rest of itself,
          because a placed learner does not need job listings.
        </p>
        <p>
          <strong>Self-placed.</strong> “Share your job news with us” — company, designation,
          location. Small, and aimed at the <Num to={30} suffix="%" /> of outcomes that were previously invisible to the
          company and unacknowledged for the learner.
        </p>
        <p>
          <strong>Not placed.</strong> When the window closes without a placement, the learner is
          not logged out or quietly expired. They get a page that says the search is closing,
          acknowledges the difficulty, tells them their effort mattered, and asks what could have
          been better.
        </p>
        <p>
          One rule inside that ending is worth stating on its own, because it was the humane
          decision of the project and it exists only as a note on the handover board:{' '}
          <strong>a learner cannot lose portal access while they are mid-process.</strong> The
          closing window was never absolute.
        </p>
      </div>

      <Gallery
        columns={3}
        items={[
          {
            src: '/case-studies/placement-hub/body/ending-placed.png',
            alt: "Confirmation after accepting an offer: an illustration, the message 'Congratulations, you've accepted the offer from AECOM Architects', and a five-star Rate Experience control.",
            width: 1120,
            height: 856,
            caption: 'Placed. Accept, confirm, celebrate, then rate the experience.',
          },
          {
            src: '/case-studies/placement-hub/body/ending-self-placed.png',
            alt: "A card reading 'Got placed with your own hard work?' with a link, 'Share your triumphs with us', over a celebratory illustration.",
            width: 880,
            height: 816,
            caption: 'Self-placed. “Got placed with your own hard work?” invites the learner to share their news.',
          },
          { placeholder: 'Not placed — the closing-window page', caption: 'Not placed. The search is closing, and the learner is asked what could have been better.' },
        ]}
      />

      <div>
        <p className="lx-subheading">The system underneath</p>
        <p>
          The visible experience was supported by a defined state model. The most complex screen
          resolved multiple independent conditions — relevance, eligibility, and application status
          — so engineering received rules and combinations, not isolated screenshots.
        </p>
      </div>

      <Peek label="The state model in full" more="Show all six inputs">
        <p>What a learner should see resolved from six inputs:</p>
        <ul className="lx-list">
          <li>
            <strong>Journey stage</strong> — where they are in the course, from learn mode to
            graduation
          </li>
          <li>
            <strong>Eligibility</strong> — not yet assessed, eligible, or not eligible
          </li>
          <li>
            <strong>Profile completeness</strong> — resume and portfolio uploaded, or not
          </li>
          <li>
            <strong>Placement standing</strong> — the learner’s overall position, including placed,
            self-placed, declined and disqualified
          </li>
          <li>
            <strong>Per-application status</strong> — from applied through to placed, with every
            exit reason defined
          </li>
          <li>
            <strong>Opening availability and relevance</strong> — whether openings exist, and
            whether any are relevant to this learner
          </li>
        </ul>
        <p>
          Each was specified as a definition rather than a screen behaviour, so the same
          vocabulary could carry into the operations tool and, later, a partner-facing product.
        </p>
      </Peek>

      <Sequence
        items={[
          {
            src: '/case-studies/placement-hub/body/state-relevant.png',
            alt: 'Job screen for a relevant opening: degree and experience matched, a green banner counting down the deadline, and an Apply Now button.',
            width: 880,
            height: 1120,
            label: 'Relevant, open to apply',
            caption: 'Eligibility matched and a deadline counting down.',
          },
          {
            src: '/case-studies/placement-hub/body/state-not-match.png',
            alt: 'Job screen for a role that is not a match: the degree is marked as not matching, and a Share concern button replaces Apply Now.',
            width: 880,
            height: 1120,
            label: 'Not a match',
            caption: 'The unmet requirement is marked, and the learner can raise a concern.',
          },
          {
            src: '/case-studies/placement-hub/body/state-expired.png',
            alt: "Job screen for an expired opening: a 'No longer accepting applications' banner and a disabled Apply Now button.",
            width: 880,
            height: 1120,
            label: 'Expired',
            caption: 'Applications are closed and the action is disabled.',
          },
          {
            src: '/case-studies/placement-hub/body/state-applied.png',
            alt: 'Job screen for an application in process: an In Process status badge and a message saying the application is being reviewed.',
            width: 880,
            height: 1120,
            label: 'Applied, in process',
            caption: 'The status is stated, and the apply action is replaced by what is happening.',
          },
        ]}
      />

      <div>
        <p>
          One structural consequence is worth naming. The job description screen ended up carrying
          two unrelated jobs — evaluating an opening a learner has not applied to, and tracking an
          application already in flight. It shipped and it worked, but splitting those into two
          surfaces is the first change I would make now.
        </p>
      </div>
    </Section>

    {/* ---------- 06 Handover ---------- */}
    <Section
      id="handover"
      headerAction={<ListenToSection id="handover" />}
      number="06"
      eyebrow="Handover"
      category="Design systems · documentation · engineering handover"
      questions={['How did this reach engineering without losing its logic?']}
      artifacts="63 annotated states · ~45 components · mobile library · journey and state boards"
      heading="Specified to be built, and to be built on"
    >
      <div>
        <p>
          The handover served two audiences: the engineers building it then, and whoever built the
          next product on top of it.
        </p>
        <p>
          <Num to={63} /> screen states, each annotated with the condition that produces it. Around{' '}
          <Num to={45} /> components with developer notes. <Num to={5} /> journey boards mapping flow to screen
          from learn mode through to graduation, <Num to={6} /> state boards covering every surface, and a
          full parallel mobile set with its own component library — all built on Novatr’s existing
          LMS design system rather than a new one.
        </p>
        <p>
          The part that mattered beyond this release was the vocabulary. The status ladder,
          relevance criteria and eligibility model were handed over as system definitions rather
          than as screen behaviour, so the operations tool and any future partner product could
          adopt them rather than invent competing versions.
        </p>
      </div>

      <Stats
        items={[
          { value: 63, label: 'annotated screen states' },
          { value: 45, prefix: '~', label: 'components with developer notes' },
          { value: 5, label: 'journey boards' },
          { value: 6, label: 'state boards' },
        ]}
      />

      <Peek label="What was in the handover">
        <ul className="lx-list">
          <li>
            <strong>63</strong> annotated screen states
          </li>
          <li>
            <strong>~45</strong> components with developer notes
          </li>
          <li>
            <strong>5</strong> journey boards, flow mapped to screen
          </li>
          <li>
            <strong>6</strong> state boards — home, jobs, applications, job descriptions, pop-ups,
            updates
          </li>
          <li>Full parallel mobile set and component library</li>
          <li>Extended from the existing LMS design system</li>
        </ul>
      </Peek>

      <Placeholder>
        Annotated handover board at full zoom-out, and the component library with developer notes
      </Placeholder>
    </Section>

    {/* ---------- 07 Launch and measurement ---------- */}
    <Section
      id="launch"
      headerAction={<ListenToSection id="launch" />}
      number="07"
      eyebrow="Launch and measurement"
      category="Measurement design · outcome analysis · retrospective"
      questions={['Did it work, and what would you do differently?']}
      artifacts="Baseline and outcome set · attribution boundaries · change list"
      heading="What launched, what we measured, and what I would change"
    >
      <div>
        <p>
          The portal went live to graduating cohorts, and satisfaction at the placement stage was
          measured continuously afterwards on the same instruments that produced the baselines — so
          the before and after are directly comparable.
        </p>
      </div>

      <Table
        columns={[
          { label: 'Measure' },
          { label: 'Baseline', num: true },
          { label: 'After*', num: true, flag: true },
          { label: 'Intended influence' },
        ]}
        rows={[
          ['Placement-stage CSAT', bad('51.5'), good('68.2'), 'Clear visibility of status, eligibility, and next steps'],
          ['NPS, placed graduates', '14', good('31'), 'Better closure, confidence, and celebration'],
          ['NPS, non-placed graduates', bad('−18'), good('−3'), 'Acknowledged, informative ending instead of silence'],
          ['Opening to profile shared', bad('60+ hours'), good('14.5 working hours'), 'Structured records and clearer operations workflow'],
          ['Application rate for relevant openings', '46%', good('66%'), 'Relevance grouping, clearer deadlines, and status visibility'],
          ['Back-outs during hiring', bad('29.6%'), good('13.2%'), 'Better expectation-setting and visible consequences'],
          ['Shortlisting rate for shared profiles', '25%', good('37%'), 'Better readiness and relevance checks'],
          ['Eligible learners among those interested', '80%', good('87%'), 'Actionable eligibility criteria and preparation prompts'],
        ]}
        minWidth={640}
      />

      <Note label="*Placeholder/Illustrative Numbers · Draft note" tone="flag"><p>
          All post-launch figures above are illustrative placeholders for this draft. Replace them
          with verified results, dates, cohort size, survey sample size, and measurement
          methodology before publishing.
        </p></Note>

      <div>
        <p>One claim this case study does not make: <strong>that the portal increased the number of jobs available.</strong></p>
      </div>

      <Quote>The portal made opportunity supply visible and made gaps measurable; expanding the
          supply of relevant roles remained an operational and partnerships responsibility.</Quote>

      <Placeholder>
        Post-launch measurement — CSAT or NPS reporting, or the dashboard the placement team worked from
      </Placeholder>

      <div>
        <p className="lx-subheading">What I would change</p>
        <ol className="lx-list">
          <li>
            <strong>Split job evaluation from in-progress application tracking.</strong> Two
            surfaces, two jobs, far fewer conditions on each.
          </li>
          <li>
            <strong>
              Reconcile the progressive disqualification and immediate invalid-decline rules.
            </strong>{' '}
            One consequence model, stated up front, so a learner always knows which rules apply to
            them.
          </li>
          <li>
            <strong>
              Create a rubric for human decisions that affect learner access to a paid service.
            </strong>{' '}
            Judgements this consequential should not rest on one person’s read with no criteria or
            precedent.
          </li>
          <li>
            <strong>
              Explain why a job is not considered relevant, not merely that it is not.
            </strong>{' '}
            Reasons travel with an application once it is in flight; they should travel before it
            too.
          </li>
          <li>
            <strong>Remove empty or unsupported navigation states.</strong> We shipped a section that
            never had content in it.
          </li>
          <li>
            <strong>
              Put primary interviews with non-placed graduates at the start of the project.
            </strong>{' '}
            That group responded to surveys at half the rate of current learners, so the people we
            most needed to hear from were the least represented in the data we used.
          </li>
        </ol>
      </div>

      <div>
        <p className="lx-subheading">Reflection</p>
      </div>

      <Quote>The most important outcome was not a portal alone. It was a shared language for a
          placement process that had previously existed as disconnected human actions. That
          foundation made the learner experience clearer immediately, while making future
          operations, partner, and personalisation products easier to build responsibly.</Quote>

      <p className="lx-credit">
        <b>Placement Hub · Novatr</b>
        <br />
        Design leadership: Manik Madaan · Product design: Sanya · Product management: Swati
      </p>
    </Section>

    </>
  );
}
