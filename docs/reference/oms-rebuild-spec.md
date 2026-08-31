> **Snapshot notice:** this is a point-in-time export (2026-08-30) of `claude/OMS-Rebuild-Spec.md`, a living document maintained in the Cowork session's attached Claude Project — that's the canonical, actively-updated version. This repo copy won't auto-update; if it changes meaningfully there, it should be re-exported. Treat this as reference/research material for engineering context, not a specification — see the data caveat immediately below, which is original to the source doc and still applies in full. Its companion raw fact-base, `oms-working-doc.md`, sits alongside this file in the same folder.

# Order Management System (OMS) — Rebuild & Improvement Spec

**Status:** Draft v1, synthesized 2026-08-24 from the full screenshot/frame review recorded in `claude/OMS-working-doc.md`. That doc remains the raw fact-base — every claim here traces back to a section there, cited in brackets like **[WD §4d]**. This doc is the polished, structured spec meant to actually support redesigning parts of OMS.

> **⚠️ Data caveat, carried forward:** every screenshot behind this spec is Figma/FigJam mock data from the design stage, not the live product. Names, IDs, counts, and dates throughout are placeholders. Where something is a confirmed real bug or a confirmed real behavior (as opposed to a mock-data artifact), it's flagged as such.

---

## 1. Executive Summary

OMS ("Order Management System," internally rebranded mid-life to "Sales Management System") is the tool Novatr's sales floor uses to run a lead from first contact through to enrollment in one of three AEC courses. It exists because HubSpot — which still owns marketing and early lead capture — has no concept of Novatr's specific close-of-sale process (payment plans, offer letters, EMI, enrollment) and gives sales leadership no team-performance visibility without manual data-pulling.

The system has two halves that map to two different jobs:
- A **deal-management surface** (Deals/Applications list, Deal Detail page, offer-creation wizard) that BDRs and their managers use to move individual leads through the funnel.
- A **role-based performance dashboard** (Homepage) that every role from BDR to Admin uses to see their own or their team's numbers, with a drill-down path from org-wide down to one person.

The product went through at least two navigation eras — an earlier left-sidebar version, later migrated to a top-nav v2.0 — and reused a small set of components (a 4-stage funnel card, a status-tag system, a two-step offer wizard) across every role rather than building bespoke views per level. That reuse is the single strongest signal for how a rebuild should be componentized (§9).

This spec is organized as: who uses it and why (§2-3), how the product is structured today (§4-5), what actually happens step by step (§6 flows, §7 scenarios), what's broken (§8), and what to do differently in a rebuild (§9). Open items that couldn't be resolved from the available material are in §10.

---

## 2. Problem & Context

Novatr sells three courses — BIM for Architects, BIM for Civil Engineers, and Master in Computational Design — entirely through a sales-driven funnel. Before OMS, the floor ran on HubSpot alone for lead capture plus ad hoc tooling for everything after. Two structural gaps drove the build:

1. **HubSpot couldn't model Novatr's sale.** Once a lead was qualified, the actual sale — building a payment plan, generating an offer letter, tracking EMI approvals, confirming enrollment — had no home.
2. **Leadership had no performance visibility.** A Team Lead or Sales Head had to comb through HubSpot manually to answer "how is my team doing this month."

OMS was scoped narrowly at first (an "Applications" tracker, Nov 2023), then widened into a full "Sales Management System" once a performance dashboard was added (Dec 2023) **[WD §1, §9]**. The team self-reported strong results (NPS +25% to 4.2/5, 100% adoption, +52% DAU, "3x revenue" as an indirect quarterly impact) — self-reported by the design team, not independently verified **[WD §1]**.

---

## 3. Users & Roles

Five confirmed permission tiers, each seeing progressively more of the floor **[WD §2]**:

| Role | UI tag | Scope |
|---|---|---|
| BDR (Business Development/Sales Rep) | LC | Owns and sees their own leads/deals only |
| ATL (Associate/Assistant Team Lead) | ATL | A real, distinct tier between BDR and TL (confirmed by Manik; doesn't appear in the dashboard drill-down — §10) |
| Team Lead (TL) | TL | Manages a group of BDRs; sees their team |
| Team Manager (TM) | TM | Owns one of the 3 courses; sees their team leads and BDRs |
| Sales Head / Admin | — | Full floor-wide visibility across all TMs |

The BDR is also relabeled "Admission Counsellor" inside the Enrollment section of a Deal — same person, different title in that context **[WD §2]**. Lead assignment itself is two-step and partly automated: HubSpot auto-assigns a new lead to a Team Lead, who then manually assigns it to a specific BDR **[WD §2, §17]**.

Every dashboard and list in the product is scoped by this hierarchy rather than being role-specific UI — the same components render different data depending on who's looking, which is the core reuse pattern this spec leans on in §9.

---

## 4. Information Architecture

OMS shipped at least two navigation structures **[WD §3, §9]**:

- **Earlier version:** a left sidebar — Dashboard, Applications, Payments, Content, with Log Out pinned at the bottom.
- **v2.0 (confirmed later, migrated-to version):** a top nav — Home, Deals, Payments — plus a role badge, global search, and a user avatar/dropdown.

Both eras share the same underlying structure once you look past the labels ("Applications" became "Deals," "Dashboard" became "Home"). The FigJam IA diagrams describe this structure independent of either visual skin, and it holds for every role **[WD §15, §16]**:

- **A Performance/Overview Dashboard** — role-scoped, described fully in §6.6 below.
- **A Deals/Applications list** — every lead/deal the current role can see, filterable, with row-level actions.
- **A Payments list** — every payment/installment the current role can see, filterable by status.
- **Admin only: an Overview Dashboard** with org-wide trend and revenue data, layered on top of the same Performance Dashboard everyone else gets, plus a TM→TL→BDR drill-down.

The two Deals/Applications-and-Payments sub-structures are close to identical between BDR and Admin, differing only in scope — strong evidence the underlying components are shared with a scope parameter rather than built twice **[WD §16]**.

---

## 5. Core Data Model

### 5.1 The Deal (a.k.a. Lead, a.k.a. Application)

One record tracks a person from "application sent" through enrollment. Its Deal Detail page has four content sections, each independently completable **[WD §4b]**:

1. **Application** — course, duration, start date; the application form itself (§5.4) opens in a slide-over.
2. **Payment Plan** — Course Fee, Discount, Net Payable Fee; locked once created (§6.3, §5.3).
3. **Offer Letter** — conditionally "Send" or "Revise" depending on whether one already exists (§6.3).
4. **Enrollment** — LMS-side applicant ID, Admission Counsellor (= the BDR), first session date.

Alongside these, every Deal carries: global-status actions (Not Interested / Mark Reject / Save for Later), a milestone timeline, and a free-text-reason activity log covering every meaningful action (assignment, reopening, due-date extension, etc.) **[WD §4b]**.

### 5.2 Status model

The canonical status set, by stage, with a consistent color language (blue = waiting on the learner, amber = timed out, green = progress, red badge = BDR action required, gray = cross-cutting) **[WD §5]**:

| Stage | Sub-statuses |
|---|---|
| Application | Pending, Expired, Filled ⚠ |
| Offer | Pending, Expired, Accepted ⚠ |
| Payment | Ongoing, Completed |
| Enrolment | Cancelled |
| Global (any stage) | Not Interested, Rejected, Saved |

Deals-page tabs built on these statuses **overlap by design** — a Deal can appear in more than one tab at once (e.g. under both its stage tab and "Action Required") — this is confirmed intentional, not a bug **[WD §5]**. Two recovery paths exist: **Not Interested → Reopened**, and a manual, backend-only path to **Enrolment: Cancelled** **[WD §5]**. Per-installment payment status is a separate, more granular axis: **Paid / Unpaid / Overdue** per payment link, distinct from the deal-level Payment: Ongoing/Completed **[WD §6]**.

### 5.3 Payments

INR routes through Razorpay, Manual, or EMI_3P; USD through Stripe (one-time or EMI). A Payment Plan is Course Fee minus Discount equals Net Payable Fee, split into one or more installments (§6.3). Once a plan exists, the fee structure is locked — it cannot be edited **[WD §6]**. EMI specifically routes through an approval step (Sales Ops fills details, an admin approves) and, once live, cannot have its tenure or amount modified — a known pain point **[WD §6, §7]**. For Stripe EMI, the payment link goes straight from Stripe to the learner, bypassing OMS **[WD §4d, §6]**.

**Revenue reporting distinguishes Booked from Realised** **[WD §6, §18]**:
- **Booked** = total value of payment plans/offers created in the period, regardless of collection status.
- **Realised** = cash actually collected in the period — a mix of collections against this period's own bookings and collections still coming in against earlier periods' bookings.

### 5.4 Application form

Four sections: Basic Information (name/contact/location), Professional Details (role, experience, tool familiarity, English level, income band), Educational Details (qualification, CV, LinkedIn), and a free-text Statement of Purpose (current knowledge, motivation, attribution — how they heard about Novatr) **[WD §4c]**. It mixes hard qualifiers with soft intent signals in one form — a pattern worth keeping in a rebuild (§9).

---

## 6. User Flows

Each flow below is written as it happens today, stitched together from the individual frames reviewed. Citations point back to the working doc for the exact screenshot evidence.

### 6.1 Visitor to Deal Created (pre-OMS, upstream of everything else)

1. A **visitor** reaches Novatr's site via a direct visit, an ad, social, or organic search.
2. They become a **lead** one of four ways: filling an Apply Now form, downloading the syllabus, requesting a callback (CBL), or through "Career Navigator" (a named lead-gen surface — exact nature still unconfirmed, §10).
3. Two things fire in parallel: a 2-day nurture email sequence starts (**Intro Series Marketing Communication**), and the lead enters the sales floor — HubSpot auto-assigns it to a **Team Lead**, who **manually assigns it to a BDR**.
4. The BDR attempts to call the lead (**Lead Call**). If unreached, it sits in a **Lead Call Series** for up to 120 days, after which it auto-drops and nurture communication stops. If reached, the BDR either runs the pitch call (**PDE**), disposes the lead, or leaves it in the queue.
5. **PDE happens — this is the exact moment a Deal is created in OMS**, before "Application Sent" even fires.
6. From PDE: the application is shared. If filled, the funnel continues into §6.2 below. If it stalls at any point (not filled, offer not accepted, downpayment not made) and the BDR hasn't disposed it, an automated reminder cadence kicks in (3 emails/2 days at Application stage, 3 emails/1 day at Offer stage, reminder emails at Downpayment stage), with a 90-day auto-drop as the backstop.
7. If the BDR does dispose it, it's sorted **Case 1** (Junk/Not eligible/Language Barrier — hard stop, thank-you email, done) or **Case 2** (softer — a 90-day drop-nurture series runs before communication fully stops).

*[WD §17]*

### 6.2 Application → Offer → Payment → Enrollment (the core OMS funnel)

1. **Application Sent** — triggered at PDE (see 6.1). Status: Application/Pending.
2. Learner fills the form (§5.4) or the link expires. Status moves to Application/Filled (flagged as needing BDR action) or Application/Expired.
3. BDR builds a payment plan and sends an offer letter (full mechanics in §6.3). Status: Offer/Pending.
4. Learner accepts or the offer expires. Status: Offer/Accepted (flagged as needing BDR action, since no payment has landed yet) or Offer/Expired.
5. Learner makes the first payment (the Down Payment). Status: Payment/Ongoing. This is also the trigger for enrollment — enrollment happens after the *first* payment, not after full payment.
6. Remaining installments are collected per the plan (§6.5). Once all are paid, status: Payment/Completed.
7. At any point along this path, the BDR (or the system) can instead route the Deal to a Global Status — Not Interested, Rejected, or Saved (parked for a future sales cycle) — or, on the backend, to Enrolment: Cancelled.
8. **Recovery path:** a Deal marked Not Interested can be manually Reopened, re-entering the funnel from wherever it left off.

*[WD §4b, §5]*

### 6.3 BDR builds and sends an offer

This is the concrete mechanism behind step 3 of §6.2, launched from the Deal Detail page's Offer Letter section ("Send offer letter" the first time, "Revise offer letter" if one already exists).

**Step 1 — Create Payment Plan:**
1. BDR chooses Upfront or Part Payment.
2. BDR enters a Discount. The system shows Course Fee, Sales Payable Fee (currently a likely duplicate of Course Fee — §10), and Net Payable Fee (Course Fee minus Discount).
3. For Part Payment, the BDR adds installment rows one at a time (amount, payment Mode, and — for non-EMI modes — a Deadline), watching a live **"Amount Left"** total in red count down to zero as the installments account for the full Net Payable Fee.
4. If a row's Mode is an EMI type, the amount field is replaced by pre-built EMI plan cards (e.g. "USD 200 for 3 months") showing the monthly amount and total interest, plus a Start Date. A note tells the BDR the payment link for this row will go straight from the gateway (Stripe) to the learner.
5. BDR clicks Next Step.

**Step 2 — Choose Offer Template:**
6. BDR picks one of three named templates — Early Bird, Without Scholarship, With Scholarship — and sets a Choose Deadline for the offer's acceptance window.
7. A live preview of the actual outgoing email renders on the right (branded header, benefits list, a `{{custom discount}}` merge tag for the personalized scholarship amount) so the BDR can see exactly what the learner will receive before sending.
8. BDR clicks Send. Confirmation: "Offer has been Successfully sent to [Lead name]!" with a link back to the Deal.

*[WD §4d]*

### 6.4 BDR/manager works the Deals (Applications) list

1. User lands on Deals/Applications, scoped to what their role can see (own leads for a BDR, team for TL/TM, everyone for Admin).
2. Status-bucket tabs at the top group deals by stage; an "Action Required" tab cross-cuts these, pulling in every deal flagged ⚠ regardless of which stage tab it's also in.
3. User opens the filter panel: General filters (Stage and Status, Course, Currency, Created on, Last Update) and, for TL/TM/Admin, People filters (Team Manager, Team Lead, BDR).
4. Applied filters become removable chips with a running "N Filters Applied" count; user can Clear all or Apply Filters.
5. **Known bug:** applying filters narrows the table but does not recompute the status-bucket tab counts at the top, so the tabs and the table disagree on volume.
6. From a row, the user can act directly: Send/Revise offer letter, Mark as not interested, Mark as rejected, or Get form link (copy the application link to share manually) — without opening the full Deal Detail page.

*[WD §4a, §5, §11]*

### 6.5 Payment collection

1. Once a payment plan exists, each installment becomes either a payment link (non-EMI) or an EMI arrangement.
2. Non-EMI: a link is sent at the scheduled point, and subsequent links auto-send on their due dates. A BDR can extend a due date, and the system logs the reason.
3. EMI: Sales Ops or the BDR fills EMI details, a Sales Ops admin approves it, and the EMI plan is created — or the BDR refills/switches mode if it's rejected. Once approved, tenure and amount cannot be changed. For Stripe EMI, the collection link is Stripe's to send, not OMS's.
4. Each installment independently carries a Paid/Unpaid/Overdue status, visible on the Deal's Payment Plan section and on the floor-wide Payments list, alongside the deal-level Payment Ongoing/Completed status.
5. The payment card's date labels differ by gateway: Razorpay and Stripe one-time show Due On/Paid On; EMI_3P shows Disbursed On; Stripe EMI shows Starts On plus an installment-progress fraction (e.g. "1/4 ✓").

*[WD §4d, §6]*

### 6.6 A manager checks performance and drills into one person's numbers

1. User (any role) lands on their Dashboard/Home. Top-left: a Revenue card — Booked-this-period headline, a badge for how much of that is already realised, and a Total Realised figure split into realised-of-this-period's-bookings and realised-of-earlier-bookings. A trend line for the period sits below it, with a date-hover tooltip.
2. Top-right: a toggle between a Deal Stages bar chart (counts per funnel stage) and a Payment Modes pie chart (share of realised payments by gateway).
3. User can switch the reporting window (This Month, Last Month, This Quarter, Lifetime, or a custom range).
4. Below that: a 4-card funnel — Applications Sent → Offers Shared/Filled → Converted/Accepted → Payment Clearance/Converted — each with its own status breakdown and an Overview/Performance tab toggle. Performance shows Unit Sales Target vs. Achieved, Revenue Booked, Revenue Realised, and Average Ticket Size (ATS) instead of the breakdown.
5. **A BDR's dashboard stops here** — just their own numbers, no team view.
6. **A Team Lead's dashboard** adds a single-column BDR performance table (Name, Revenue, Target-vs-Achieved) plus a Search BDR box.
7. **A Team Manager's dashboard** adds the same, but with two columns — Team Leads and BDRs.
8. **An Admin's dashboard** adds a full funnel-card block per Team Manager, plus a three-column table — Team Managers, Team Leads, BDRs. Clicking a Team Manager row filters the Team Leads column to their reports; clicking a Team Lead row filters the BDRs column in turn.
9. From any of these tables (or the search box), selecting a BDR populates a detail panel below with that BDR's own funnel-card view — the same component used in step 4, just re-scoped to one person.

*[WD §18]*

---

## 7. Use Case Scenarios

Concrete, first-person walkthroughs of the user stories captured during review **[WD §8]**, made specific to the actual UI.

**Scenario — BDR, daily check-in.** *When I log into OMS in the morning, I want to see at a glance how many of my leads need action today, so I can prioritize my calls before doing anything else.* → I land on my Dashboard. My funnel card shows 07 Expired applications and 17 Filled (which need an offer from me) — both are red flags in the Applications Sent breakdown. I switch to the Deals list, open the Action Required tab, and work through everyone flagged ⚠ first — Filled applications waiting on an offer, and Accepted offers waiting on a down payment — before touching anything else.

**Scenario — BDR, sending an offer.** *When a learner fills their application, I want to build their payment plan and send a polished offer without drafting anything by hand, so the offer goes out fast and error-free.* → From their Deal, I open Send Offer Letter. I toggle Part Payment, enter their negotiated discount, and add three installments — watching Amount Left drop to zero as I go. I pick the "With Scholarship" template, check the live preview to make sure the `{{custom discount}}` merge tag rendered their actual number, set a 7-day acceptance deadline, and hit Send. I get a confirmation and go straight back to their Deal.

**Scenario — Team Lead, tracking a stalled deal.** *When one of my BDRs has a lead that's been sitting in Offer/Accepted for a week with no payment, I want to see that immediately, so I can nudge them before the lead goes cold.* → I filter my team's Deals list by Status: Offer Accepted and by BDR. I see the deal, open it, and check the Activity Log for a "Payment due date extended" entry — if there's one with no clear reason, I follow up directly with the BDR rather than waiting for it to auto-flag.

**Scenario — Team Manager, month-end review.** *When the month is closing, I want to see my team's Booked vs. Realised revenue and each Team Lead's progress against target, so I can flag anyone at risk before the quarter rolls over.* → I open my Dashboard, switch the date range to This Month, and read the Revenue card: Booked this month vs. how much of it has actually been collected. I scan the Team Leads/BDRs table, sorted by Revenue, and click into the lowest performer's row to pull up their funnel card and see exactly where their pipeline is thin — expired applications, unsent offers, or overdue payments.

**Scenario — Sales Head/Admin, floor-wide health check.** *When I want a snapshot of the whole floor's health, I want org-wide Booked/Realised revenue and a funnel view I can drill from Team Manager down to a single BDR, so I can identify exactly where a problem originates without pulling raw data.* → I open the Admin Dashboard. Deal Stages shows me where volume is concentrated (Application Stage is always the largest bucket). I click into the Team Manager with the lowest Realised number, which filters the Team Leads column to their reports; I click the weakest Team Lead, which filters to their BDRs; I select the weakest BDR and read their funnel card directly — three clicks from "something's off at the floor level" to "here's the exact person and the exact stage."

**Scenario — BDR, recovering a cold lead.** *When a lead I marked Not Interested later reaches back out, I want to reopen their Deal without recreating it from scratch, so their original application, payment plan, and history stay intact.* → From their Deal Detail page, I use the Reopen action. The Deal re-enters the funnel at whatever stage it was in before, and the Activity Log records "Deal Reopened" alongside everything that happened before the pause.

---

## 8. Known Issues

- **Confirmed bug:** the Deals/Applications page's status-bucket tab counts don't recompute when a filter is applied — the table narrows, the tab counts don't, so the two disagree on-screen **[WD §7, §11]**.
- **Confirmed pain point (from the design case study):** monthly team-structure churn, BDR onboarding/training gaps, a manual backend step required for cancellations, and a TL/TM burden around performance-monitoring and lead-convincing that the dashboard only partially offsets **[WD §7]**.
- **Confirmed pain point:** EMI tenure/amount cannot be edited once approved — a BDR who made a mistake, or a learner whose circumstances change, has no in-product fix **[WD §6, §7]**.
- **Likely redundancy, unconfirmed:** "Course Fee" and "Sales Payable Fee" are shown as two separate figures in the offer wizard but were identical in the one example seen — possibly the same value under two labels **[WD §2, §4d]**.

---

## 9. Recommendations for Rebuild

Ranked roughly by how much leverage each would give a rebuild, drawing on the "worth preserving" and "worth fixing" notes accumulated during review **[WD §13]**.

**Componentize around the patterns that already repeat.** The clearest finding across the whole review is that OMS already implicitly shares components across roles — the same 4-card funnel renders a BDR's own numbers, a Team Manager's numbers, and a drilled-into BDR's numbers; the Applications and Payments list structures are near-identical between BDR and Admin. A rebuild should make this explicit: one funnel-card component and one list component, each taking a scope parameter, rather than parallel bespoke views per role.

**Fix the filter/tab-count bug as a forcing function.** It's a small bug with an outsized trust cost — a BDR who sees "3 filtered results" next to a tab that still says "791" will stop trusting either number. Worth treating as a template for a broader rule: any two counts shown on the same screen must always agree.

**Move assignee visibility to on-demand disclosure.** The Deals-list table currently dedicates a column per assignment tier (LC/ATL/TL/TM); Manik's direction is to collapse this to hover/on-demand disclosure rather than adding more columns as the hierarchy grows.

**Resolve the Course Fee / Sales Payable Fee duplication.** If confirmed redundant, collapse to one clearly-named figure — two labels for one number is exactly the kind of thing that erodes trust in the payment plan screen specifically, where trust matters most.

**Keep the guardrails that already work well.** The offer wizard's running Amount-Left validator and live email preview both catch mistakes before a learner ever sees them — worth carrying forward as a general pattern (validate the sum, preview the output) anywhere else money or outbound communication is involved.

**Keep the free-text reason logging on state-changing actions** (reassignment, due-date extension, reopening) — it's what makes the Activity Log actually useful for a manager auditing a stalled deal, rather than just a timestamp list.

**Keep the two-case disposition taxonomy and the timed auto-drop safety nets** (120 days pre-PDE, 90 days post-PDE) — they're a clean way to make sure leads don't sit forever in either the calling queue or a stalled pipeline.

**Reconsider, don't necessarily remove, tab overlap.** Deals-page tabs overlapping (a deal counted in both its stage tab and Action Required) is intentional and useful, but the counts-not-recomputing bug suggests the underlying data model for "what's in this tab" may need to be more explicit to avoid this class of bug recurring.

---

## 10. Assumptions & Open Questions

Carried forward from the working doc's running list — none of these block this spec, but each would sharpen it if resolved **[WD §12]**:

- What **TI** stands for on the Payments table.
- Whether **Sales Payable Fee** is truly a duplicate of Course Fee or diverges in some case not yet seen.
- What **Career Navigator** actually is as a lead source.
- Whether IA diagrams exist for the ATL/TL/TM tiers specifically (only BDR and Admin IA diagrams were found).
- Whether the Team Manager list's 4th name (Chhaya Ranjan, absent from the actual dashboard's 3-TM view) is a mock artifact.
- What the **globe icon** on Deals rows indicates.
- Why Enrollment has its own Applicant ID, separate from the Application ID — whether that's a real LMS-side link.
- The exact chronological order of the left-sidebar nav version, v1.2, and the FigJam planning board relative to each other (the left-sidebar version and FigJam are both earlier than v2.0, but not pinned relative to one another).
- Whether a distinct "Senior Team Manager" tier exists above Team Manager (unconfirmed; ATL is the only extra tier actually confirmed).
- Why the Admin dashboard's TM→TL→BDR drill-down has no ATL tier, despite ATL being confirmed as a real permission level.

This is drawn from the complete available screenshot set — Manik confirmed no further frames exist beyond what's logged in the working doc's Screenshot/Frame Log (§14).
