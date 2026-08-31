> **Snapshot notice:** this is a point-in-time export (2026-08-30) of `claude/OMS-working-doc.md`, a living document maintained in the Cowork session's attached Claude Project — that's the canonical, actively-updated version. This repo copy won't auto-update; if it changes meaningfully there, it should be re-exported. Treat this as reference/research material for engineering context, not a specification — see the data caveat immediately below, which is original to the source doc and still applies in full.

# Order Management System (OMS) — Working Documentation

Status: **Screenshot/frame review complete** (as of 2026-08-24 — Manik confirmed these were all the screenshots available). This doc remains the raw fact-base and reference appendix. Synthesis into the two downstream deliverables — `claude/OMS-Rebuild-Spec.md` (detailed rebuild/improvement spec, with written user flows and use-case scenarios) and `claude/OMS-Case-Study-Draft.md` (narrative portfolio case-study draft) — is now underway; see those docs for the polished output. Built from Manik's recollection, the team's Medium case study (Ved Pathak, "Facilitating revenue with Sales Management System"), a FigJam planning board, and screenshot review. Not verified against original PRD (unavailable) or live product (unavailable).

> **⚠️ DATA CAVEAT — read before citing any specific value from this doc.** All screenshots reviewed are from the **Figma/FigJam design stage**, not the live shipped product. Every name, ID, count, date, and course code is **placeholder content**. Internal inconsistencies noticed within a single mock are called out as **mock artifacts**, distinct from things Manik has explicitly confirmed as real product bugs. **The FigJam board's exact timing relative to the other screenshots is unconfirmed** (per Manik) — treat terminology mismatches between FigJam and the Figma UI screenshots as a possible sign the FigJam reflects an earlier planning pass, not as a contradiction to resolve.

**Purpose:** (1) Spec for rebuild/improvement — detailed enough to support redesigning parts of OMS; (2) will later be adapted into a portfolio case study.

**Review approach:** Figma/FigJam page/frame by page/frame, screenshot-driven by default.

**Sources so far:**
1. Manik's own recollection (project lead / Product Design Manager on OMS)
2. Medium article: "Facilitating revenue with Sales Management System" by Ved Pathak
3. Screenshot #1: Deals page, no filters (v2.0) — frame `1:9148`
4. Screenshot #2: Filter modal/component (v2.0)
5. Screenshot #3: "Deals_List_Filters_On" (v2.0)
6. Screenshot #4: "Definitions of Statuses"
7. Screenshot #5: "These tabs will contain deals of these statuses"
8. Screenshot #6: Individual Deal Detail page (v2.0)
9. Screenshot #7: "Application Details" slide-over
10. Screenshot #8: FigJam — "User stories" (verbatim source for §8)
11. Screenshot #9: FigJam — "IA - BDR" (Section 4, item "1")
12. Screenshot #10: FigJam — "IA - Admin" (Section 3, item "1")
13. Screenshot #11: FigJam — "Fresh Application" — the full lead acquisition & disposition flow
14. Screenshots #12-14: the **Create Payment Plan → Choose Offer Template → Send confirmation** wizard (v2.0) — how a BDR actually builds and sends an offer
15. Screenshots #15-18: the **Homepage/Dashboard**, same test account ("Ved Pathak") shown once per role — Admin, Team Manager, Team Lead, BDR — from an earlier UI version (left-sidebar nav), pre-dating the migration to v2.0

Last updated: 2026-08-24

---

## 1. Background & Problem Statement

Novatr is an ed-tech platform for **AEC professionals and students** (Architecture, Engineering, Construction). Revenue is heavily sales-driven. Three courses were sold through this system:
1. BIM for architects
2. BIM for civil engineers
3. Master in Computational Design

**Before OMS:** sales floor ran on legacy LMS tooling + HubSpot only. HubSpot handled lead import and early-stage lead management, but couldn't support Novatr's specific close-of-sale flow, and gave sales leadership no easy way to see team performance without manually combing through HubSpot data.

**OMS was built to close both gaps.** It started life narrowly as an "Applications" tracker (Nov 2023), then was expanded and rebranded internally as a **"Sales Management System"** once a data/performance dashboard was added (Dec 2023).

**Design team:** Nikhil (Product Manager), Ved Pathak (Product Designer, wrote the case study), Manik (Product Design Manager — project lead).

**Reported outcomes (self-reported, design case study — not independently verified):** NPS 4.2/5 (+25%), 100% adoption, +52% daily active users, "3x revenue" cited as an indirect impact in a quarter.

**The pre-OMS journey (marketing → HubSpot → Deal Created) is now fully mapped — see §17.**

---

## 2. User Roles & Hierarchy — CONFIRMED: 5 levels

1. **BDR** (tagged **LC** in the UI) — owns leads directly
2. **ATL — Associate/Assistant Team Lead** — confirmed by Manik as a genuine distinct permission tier, sitting between BDR and Team Lead.
3. **Team Lead (TL)** — manages a group of BDRs (and ATLs?)
4. **Team Manager (TM)** — owns one of the 3 courses
5. **Sales Head / Admin** (VP of Sales) — full floor-wide visibility

**Note on an earlier discrepancy:** Manik originally recalled a "Senior Team Manager" between TM and Sales Head; what's confirmed instead is ATL, positioned between BDR and TL. A distinct Senior Team Manager tier above TM remains unconfirmed. **Also notable:** the Admin Performance Dashboard's drill-down (§16) only shows TM Level → TL Level → Individual BDR — no separate ATL tier appears there.

**Permissions model:** role-based data scope — BDR sees own leads/performance only; ATL/TL/TM see progressively wider team scopes; Sales Head/Admin sees everything. **Confirmed concretely by the Homepage/Dashboard screenshots (§18):** the exact same account, viewed with each role badge applied, gets a visibly different dashboard — the dashboard is a strong, literal example of this role-scoped-data-visibility principle in action.

**Confirmed from §17:** lead assignment happens in two steps — **HubSpot workflow automation assigns a lead to a TL automatically**, then **the TL manually assigns it to a specific BDR**.

**Terminology:**

| Term | Full form | Notes |
|---|---|---|
| BDR | Business Development/Sales Representative | |
| LC | Product-UI tag for the BDR-assignment field | Functionally = BDR |
| ATL | Associate/Assistant Team Lead | Confirmed real 5th permission tier, between BDR and TL |
| PDE | Product Explained to lead | The call stage where a BDR pitches the course; **this is the exact moment a Deal is created in OMS** (confirmed via §17) |
| DP | Down Payment | |
| TL | Team Lead | |
| TM | Team Manager | |
| Admission Counsellor | **Confirmed = the same BDR/LC**, relabeled in the Enrollment section | Not a separate role |
| ATS | **Average Ticket Size** ✅ | Confirmed via the Homepage Performance tab (§18) — one of 4 KPI tiles: "Unit Sales Target vs Achieved," "Revenue Booked," "Revenue Realised," "Average Ticket Size" |
| TI | Field on the Payments table | Meaning unconfirmed; guess: "Transaction ID" |
| CBL | Call Back Later | A lead-creation source, alongside "Apply now form," "download syllabus," and "Career Navigator" (§17) |
| Career Navigator | A named lead-generation feature/product surface (exact nature unconfirmed) | Open question |
| Dispose / Disposition | A BDR marking a lead as not worth pursuing further, sorted into **Case 1** (Junk / Not eligible / Language Barrier — hard disqualification) or **Case 2** (Other — softer, still gets a drop-nurture series) | §17 |
| Auto Drop | System automatically disposes a lead after a timeout (90 days at PDE/Application stage, 120 days at pre-connect Lead Call stage) if no BDR action | §17 |
| Acquisition Communication | The umbrella marketing/nurture communication sent to a lead; stops once the lead pays, is disposed as Case 1, or is auto-dropped | §17 |
| Sales Payable Fee | Seen in the Create-Payment-Plan modal alongside Course Fee and Net Payable Fee — in the one example seen, it equals Course Fee exactly, so likely a synonym/duplicate label rather than a distinct figure | Open question — see §6 |
| Booked Revenue | The total value of deals whose payment plan was booked/created within the selected period, regardless of how much has actually been collected yet | Confirmed via §18 |
| Realised Revenue | Cash actually collected within the selected period — combines collections against deals booked *in* that period and collections against deals booked in *earlier* periods | Confirmed via §18 |

---

## 3. Navigation / Information Architecture

**CONFIRMED version order:** OMS started on a **left-sidebar nav** (Dashboard | Applications | Payments | Content — see the Homepage screenshots, §18), then **migrated to the v2.0 top nav** (Home | Deals | Payments, with an ADMIN role badge, global search, and user avatar/dropdown) — confirmed directly by Manik. The v2.0 top nav is the later, more evolved IA and the one most other screenshots in this doc (Deals list, Deal Detail, offer wizard) are drawn from.

The left-sidebar version's "Applications" and "Dashboard" naming matches the FigJam IA's terminology (§15/§16) more closely than v2.0's "Home"/"Deals" — consistent with the left-sidebar version being the earlier pass. **The left-sidebar nav's "Payments" and "Content" items were not explored further** (per Manik, out of scope for this review) — Payments is documented in depth elsewhere via the v2.0 Deal Detail/offer-wizard screenshots (§4d, §6) and the FigJam IA (§15/§16), so nothing is lost by leaving the left-sidebar version's own Payments/Content screens unreviewed.

**Two FigJam IA diagrams reviewed — BDR (§15) and Admin (§16).** They corroborate each other heavily on the Applications and Payments sub-structures, while each also shows role-specific top-level sections: BDR gets a single **Performance Dashboard**; Admin gets a richer **Overview Dashboard** *plus* its own **Performance Dashboard** with a TM→TL→Individual-BDR drill-down. **The Homepage screenshots in §18 are the concrete, pixel-level realization of exactly this dashboard structure.**

**A third FigJam diagram (§17) maps everything upstream of OMS** — from a marketing visitor landing on the site, through HubSpot assignment and the BDR's PDE call, to the moment a Deal is actually created and enters the OMS funnel documented in §5.

---

## 4. Core Entity: The Lead / Deal

### 4a. Deals-list columns (summary view)
Applicant Name+ID, Mobile/Email, Course, Status(+sub-pill), Created On, Last Update, Assigned LC/ATL/TL/TM. Globe icon on some rows — still unconfirmed, possibly intl/USD flag.

### 4b. Individual Deal Detail page — full breakdown

**Header / left sidebar:**
- Applicant Name, Application ID (copyable), Email, Phone
- **External-link actions:** "View On [HubSpot]" and "Chat On [WhatsApp]"
- **Global-status action buttons:** "Not Interested," "Mark Reject," "Save for Later" — the 3 "Global Status" states from §5
- Cohort (course-batch code, e.g. `BIM_C005`)
- Deal Created on / Last Updated on
- City, Country
- **Assignment block:** LC①, ATL②, TL③, TM④, each with the assigned person's name

**Main content — 4 numbered sections, each with its own completion status:**

1. **Application** — course name, Duration, Start date; "View Application" (slide-over — §4c) / "Edit Application"
2. **Payment Plan** — Course Fees (A), Total Discount (B: Upfront Discount / Scholarship / BDR Discount), Net Payable Fee (A−B); **business rule: fee structure can't be edited once a payment plan is created**; individual payment installments; "View Transactions." **The full creation flow for this is now documented — see §4d.**
3. **Offer Letter** (collapsible) — **conditional: if no offer exists yet → "Send offer letter"; if one already exists → "Revise offer letter."** **Full creation flow — see §4d.**
4. **Enrollment** (collapsible) — separate Applicant Name/ID (LMS-side), **Admission Counsellor** (= the BDR, relabeled), **First Session at**

**Right column — two distinct history views:**
- **Milestone timeline:** Application Sent → Application Filled → Offer Shared → Offer Accepted → Payment Ongoing → Payment Completed
- **Activity Log:** Payment Completed, **Payment due date extended** (logged reason), Down Payment Done, Offer Accepted, Offer Sent, Application filled, **Deal Assigned to [BDR]** (logged reason), **Deal Reopened**, **Deal Marked Not Interested**, Deal Created (logged reason).

**Confirms a recovery/reactivation path exists:** Not Interested → **Reopened**.

**Additional BDR quick-actions (confirmed via both FigJam IA diagrams):** **"Get form link"** — retrieve/copy the application form link to send manually.

**Worth preserving in a rebuild:** free-text reason logging on key actions.

*(Mock-data artifacts on this frame: mismatched applicant name in Enrollment vs. header; "No offers shared" text despite timeline/log showing otherwise; differing dates between panels; duplicate Pay IDs; Activity Log header count mismatch.)*

### 4c. Application Form — full field schema (screenshot #7)

**Basic Information:** First Name, Last Name, Mobile, Email Address, City, State, Country

**Professional Details:** current job role (free text); years of industry experience (banded); software tool experience — multi-select fixed list (AutoCAD, Autodesk Revit, Rhinoceros 3D) + free-text "other tools" follow-up; English proficiency level; monthly salary/income in INR (banded)

**Educational Details:** highest educational qualification; percentage/CGPA (banded); CV/Resume upload (optional); LinkedIn URL (optional)

**Statement of Purpose (free text):** current BIM knowledge; motivation for learning BIM/Computational Design; how they heard about Novatr (doubles as an attribution field)

*(Useful for a rebuild: a qualification + intent-signal form, mixing hard qualifiers with soft intent fields.)*

### 4d. Create Payment Plan → Choose Offer Template — the send-offer wizard (screenshots #12-14)

A 2-step modal, launched from the Deal Detail page's Offer Letter section ("Send offer letter" / "Revise offer letter").

**Step 1 — Create Payment Plan:**
- Toggle: **Upfront** vs. **Part Payment** (installments)
- **Discount** field (free entry)
- Three fee figures shown: **Course Fee**, **Sales Payable Fee** (in the one example seen, identical to Course Fee — likely a synonym, see §2/§6 open question), **Net Payable Fee** (= Course Fee minus Discount)
- For Part Payment, the BDR builds installments manually: each has an amount, a **Mode** dropdown (e.g. Stripe, Stripe EMI), and — for non-EMI modes — a **Deadline** date. An **"Add Instalment"** button adds more rows, and each row can be deleted.
- **A running "Amount Left" total (in red) tracks the gap between the sum of installments and the Net Payable Fee** — a live validation cue that installments must fully account for the fee before proceeding.
- If a row's Mode is an EMI type, a **"Select EMI Plan"** section appears instead of a flat amount: pre-built card options (e.g. "USD 200 for 3 months," "for 6 months," "for 12 months"), each showing the per-month amount and total interest/APR, plus a **Start Date**. A note clarifies: **"Payment link will be sent to the learner directly by [the gateway]"** — i.e. for EMI plans, the gateway (Stripe) emails the learner directly rather than OMS/the BDR sending it.
- Footer: "*Lead will receive this offer on their email" + Close / **Next Step →**

**Step 2 — Choose Offer Template:**
- **Named offer letter templates** (radio-select): **Early Bird**, **Without Scholarship**, **With Scholarship**
- **Choose Deadline** (date field, for the offer's acceptance window)
- Live preview of the actual email on the right: Novatr-branded header, a hero banner ("Exclusive Offer letter of [Course] For Career Growth" + "Accept Your Offer" CTA), a greeting, congratulatory copy, and a **standard benefits list**: no-cost EMI options (up to 24 months), reduced down payment for the next cohort, a scholarship on course fee, recorded material for two electives/specialisation, early access to pre-course material. Uses a **merge-tag** (`{{custom discount}}`) for the personalized scholarship amount.
- Footer: "*Lead will receive this offer on their email" + Back / **Send →**

**Confirmation screen:** "Offer has been Successfully sent to [Lead name]!" with a link back to "their Deal."

*(Useful for a rebuild: the running Amount-Left validator and the live email preview before sending are both good patterns worth keeping — they catch mistakes before the lead ever sees them.)*

---

## 5. Lead Lifecycle — Statuses & Definitions

**This section covers the OMS-side funnel, from Application Sent onward. For everything upstream of that — how a lead is created and reaches the PDE/Deal-Created moment — see §17. For how the Payment Plan and Offer Letter are actually built, see §4d.**

**Full canonical status list (from the "Definitions of Statuses" frame):**

| Stage | Sub-status | Color | Meaning |
|---|---|---|---|
| Application | **Pending** | Blue | PDE created in HubSpot, application sent to learner, awaiting the learner to fill it |
| Application | **Expired** | Amber | Application link/form timed out |
| Application | **Filled** ⚠ | Green + red action badge | Learner filled it; BDR hasn't sent the offer yet |
| Offer | **Pending** | Blue | Offer sent by BDR, awaiting the learner |
| Offer | **Expired** | Amber | Offer timed out |
| Offer | **Accepted** ⚠ | Green + red action badge | Learner accepted; no payment made yet |
| Payment | **Ongoing** | Green | At least one payment made (the Down Payment) |
| Payment | **Completed** | Green | All payments made |
| Enrolment | **Cancelled** | Red/pink | Enrollment was cancelled |
| *(none — "Global Status")* | **Not Interested / Rejected / Saved** | Gray | Applies at any stage |

**Color-coding logic:** Blue = waiting on the learner. Amber = timed out. Green = positive progress. Red "!" badge = BDR action required. Gray = global/cross-cutting.

**"Action Required" tab — CONFIRMED:** cross-cutting overlay pulling in the ⚠-flagged statuses. **Deals-page tabs overlap, not a strict partition.**

**Branch logic:**
- Accepts + pays → Payment Ongoing. Accepts but doesn't yet pay → Offer Accepted.
- Payment Ongoing = at least one payment made; enrollment happens after the *first* payment.
- **Saved** = leads parked to re-target in a future sales cycle.
- Cancellation is backend-only manual; **Enrolment: Cancelled** is the resulting state.
- **Confirmed recovery path:** Not Interested → **Reopened**.

**⚠ Possible earlier/simpler status model, seen in the FigJam IA diagrams (BDR and Admin):** "Application sent," "Application rejected," "Payment ongoing," "Not interested" shown as Application-level statuses, and "Plan ongoing" used instead of "Payment: Ongoing." Also introduces **Paid / Unpaid / Overdue** as per-installment payment statuses (see §6). **The Homepage funnel cards (§18) use yet another close variant** — Application Pending/Expired/Filled/Not Interested/Rejected; Offer Not Shared/Not Accepted/Expired/Accepted/Not Interested/Rejected; DP Not Paid (Accepted)/Accepted but expired/Payment Overdue/Payment Due/Payment Cleared; Payment Completed — corroborating the same overall funnel shape while using its own label set, consistent with the doc's standing note that different frames reflect different design passes rather than contradictions.

---

## 6. Payments

- Currency: USD or INR.
- Structure: **Course Fee** (= "Sales Payable Fee"? — see §2), minus **Discount** = **Net Payable Fee**. Payment plan = a set of installments (gateway, amount, due date, paid date). Full creation flow: §4d.
- **Business rule: the fee structure can't be edited once a payment plan is created.**
- Payment methods: INR → Razorpay, Manual, EMI_3P. USD → Stripe one-time, or Stripe EMI. *(Both FigJam IA diagrams describe Mode more generically as Razorpay / Manual / Stripe / EMI — an earlier, less granular pass.)* **Confirmed again on the BDR Homepage (§18) via a "Payment Modes" breakdown of realised payments: Manual, Razorpay, Stripe, EMI.**
- EMI flow: Sales Ops/BDR fills EMI details → Sales Ops admin approves → EMI created; otherwise BDR refills/switches mode. Known pain point: no way to modify EMI tenure/amount once set. **For Stripe EMI specifically, the payment link is sent to the learner directly by Stripe, not via OMS** (§4d).
- Non-EMI flow: payment link; subsequent links auto-send on the BDR-set due date. **Due dates can be extended** by a BDR, logged with a reason.
- **Per-installment status:** individual payments/links can be **Paid, Unpaid, or Overdue** — more granular than the deal-level Payment:Ongoing/Completed status.
- **Live validation while building a plan:** an "Amount Left" tracker ensures installments sum to the Net Payable Fee before the BDR can proceed (§4d).

**Payment-card layout varies by gateway (screenshot #7):**
- **Razorpay:** Due On / Paid On dates
- **EMI_3P:** "Disbursed On" date
- **Stripe One-time:** Due On / Paid On
- **Stripe EMI:** "Starts On" date + installment-progress fraction badge (e.g. "1/4 ✓")

**Payments-table fields (confirmed by both IA diagrams):** Applicant name, Email, Amount, Currency, Deadline, Mode, Deal owner, TI (unconfirmed), Payment status. Filterable by Search, Status (Paid/Unpaid/Overdue), Created date.

**Revenue terminology — CONFIRMED via the Homepage revenue card (§18):** the dashboard's Revenue summary makes the Booked/Realised split concrete for a given month, e.g. November:
- **"Booked in Nov'23": INR 3,14,24,000** — total value of payment plans/offers booked (created) in that month, whether or not cash has come in yet. A small badge under it shows how much of *that same booked total* has already been collected ("Out of which INR 6,14,240 is realised (2%)").
- **"Total realised in Nov'23": INR 8,14,240** — all cash actually collected during the month, regardless of when the underlying deal was booked. This splits into two lines: the realised-from-this-month's-bookings figure above (6,14,240), plus **"Realised of previously booked in Nov'23": INR 2,00,000** — collections in November against deals that were booked in an earlier month.
- In short: **Booked** = value of new commitments made in the period; **Realised** = cash collected in the period, from both new and older commitments. This resolves the earlier open question about how the two terms relate.

---

## 7. Known Problems

**From the article:** team structure changes ~monthly; BDR onboarding/training gaps; manual backend dependency for cancellations; TL/TM performance-monitoring and lead-convincing burden; EMI hassle/approval bottleneck/no tenure-editing.

**Confirmed real bug (flagged by Manik):** the Deals page's status-bucket tab counts don't recompute when a filter is applied.

---

## 8. User Stories (by permission level)

**Double-sourced:** the article's condensed versions and the FigJam "User stories" frame match almost verbatim. Format used: "When [situation], I want to [motivation], so I can [expected outcome]."

**BDR:** at-a-glance leads/applicants/deal count/payment status on login; filter deals & payments by status; detailed payment filters; allocation/payment-timeline visibility; EMI/instalment reminders; personal lead funnel; visibility into progress toward monthly targets/incentives. **§18 shows this concretely realized:** own Revenue/Deal Stages/Payment Modes charts plus a 4-card funnel (no team-level tables, matching the BDR's own-leads-only scope).

**Team Lead:** BDR-level filtering with TAT visibility; team financial status detail; allocation vs. final-payment-due-date tracking; per-BDR lead funnel; set monthly per-BDR targets; team-level conversion/revenue metrics. **§18:** dashboard adds a single-column "BDR performance" table plus a BDR search/detail panel, on top of the same top-level charts.

**Team Manager:** aggregated Revenue Summary Dashboard; aggregated application/payment stats with trend; team-level visibility per BDR; aggregated progress-to-target visibility; set per-BDR monthly targets; team-wide conversion/revenue metrics. **§18:** dashboard adds a two-column "Team Leads / BDRs" table plus a BDR search/detail panel.

**Sales Head/Admin:** org-wide Revenue Summary Dashboards; BDR-level filtering across the floor; detailed payment filters org-wide; allocation-date/EMI-tenure visibility org-wide; EMI/instalment reminders org-wide; aggregated deal-level revenue by stage; total unit sales + BDR-level target/incentive visibility; set sales targets per BDR per month. **Concretely mapped to an actual IA — see §16, and to the actual dashboard UI — see §18** (adds a per-TM funnel-card section plus the full 3-column TM/TL/BDR drill-down table).

*(No distinct ATL-level user stories surfaced anywhere yet.)*

---

## 9. Version Timeline (reconstructed opportunistically)

| Version / Milestone | Approx. timeframe | What it was | Source |
|---|---|---|---|
| Original OMS ("Applications" tool) | Through Nov 2023 | Simple applications tracker | Article screenshot |
| + Data dashboard, renamed "Sales Management System" | Dec 2023 | Performance/data dashboard added | Article |
| v1.2 | After Dec 2023 | Actionable Grouping of Statuses, Deals Status Monitoring, Detailed Deals page, Controls, Role-based access | Article screenshot |
| Left-sidebar-nav Homepage version | Earlier than v2.0 (confirmed by Manik) | Dashboard/Applications/Payments/Content left nav; role-based dashboard (§18) — terminology and structure closely match the FigJam IA | Screenshots #15-18 |
| **v2.0 — top nav migration** | Unknown exact date | **Confirmed by Manik: OMS migrated from the left-sidebar nav to the top nav (Home \| Deals \| Payments) at v2.0.** Most UI screenshots reviewed (Deals list, filters, Deal Detail, offer wizard) are this version. | Screenshots + article + Manik |
| FigJam planning board | Unclear — Manik isn't certain where this sits | User stories, IA diagrams for BDR and Admin, and the full pre-OMS acquisition/disposition flow; terminology looks like an earlier/simpler pass than v2.0's UI in places | Screenshots #8-11 |

---

## 10. Figma Tooling

One `get_metadata` test pull (frame `1:9148`) confirmed structure-only, no text content. Screenshot-driven review stays the default; Figma tools used only situationally, only when handed a specific link.

---

## 11. Filters — Deals Page

**Categories:** General (Stage and Status, Course, Currency, Created on, Last Update), People (Team Manager, Team Lead, BDR).

**Stage and Status options:** see §5.

**Course options (sample, placeholder):** BIM C_005, BIM Civil C_009, MCD C_004.

**Currency options:** INR, USD.

**Team Manager options (sample, placeholder names):** Ish Kumar, Dhruv Anand, Raj Kashyap, Chhaya Ranjan (4 listed vs. a "(3)" category badge — open question). **Partial corroboration from §18:** the Admin Homepage's "Team Managers" section lists exactly 3 TMs — Ish Kumar, Dhruv Anand, Raj Kashyap (matching the "(3)" badge) — with Chhaya Ranjan not appearing. Leaning toward Chhaya Ranjan being a mock-data inconsistency in the filter list rather than a real 4th TM, though not fully confirmed since these are two different mocks.

**Applying filters:** become removable chips; running "N Filters Applied" count; "Clear all" / "Apply Filters."

**⚠ Confirmed real bug:** applying filters doesn't recompute the top status-bucket tab counts.

---

## 12. Open Questions (running list — carried into the Rebuild Spec's assumptions/open-questions section)

- What does **TI** stand for?
- Is **"Sales Payable Fee"** truly a synonym for Course Fee, or does it diverge in some scenario not yet seen?
- What exactly is **"Career Navigator"** as a lead source?
- Do sibling FigJam frames exist for **IA-TL** and **IA-TM**?
- Team Manager filter list shows 4 names but the Homepage's Admin view only shows 3 — leaning toward the 4th (Chhaya Ranjan) being a mock-data artifact, but not fully confirmed.
- Does the **globe icon** on Deals rows flag international/USD leads, or something else?
- Why does Enrollment have a separate Applicant ID from the Application ID — is that a real link to an LMS record?
- Is there a version between original OMS and v1.2, or between v1.2 and v2.0 exactly? (The left-sidebar-nav Homepage version and the FigJam board are both confirmed/believed earlier than v2.0, but their position relative to v1.2 and to each other is still unclear.)
- Does a distinct "Senior Team Manager" tier exist above Team Manager?
- Any known missing frames/flows in the Figma file? *(Answered: no — this was the full available screenshot set, per Manik, 2026-08-24.)*

*(Resolved: 5-level hierarchy incl. ATL; LC/ATL/TL/TM assignment tags; "Saved" meaning; Global Status concept; recovery/reactivation flow; Admission Counsellor = BDR relabeled; tab overlap behavior; Deal Detail page fields/actions; full Application form field schema; per-gateway payment card variants; BDR default landing page = Performance Dashboard; offer send-vs-revise logic; user stories verbatim-confirmed; Admin-level IA; Applications/Payments search filters; the full pre-OMS lead acquisition and disposition flow; the full Payment Plan + Offer Letter creation wizard, including named offer templates, EMI plan cards, and the Amount-Left validator; ATS = Average Ticket Size; the Booked vs. Realised Revenue split, concretely; the role-based Homepage/Dashboard structure and its TM→TL→BDR drill-down interaction; nav version order — left-sidebar nav preceded the v2.0 top-nav migration.)*

---

## 13. Rebuild/Improvement Notes (decisions & ideas captured along the way)

- **Assignee info (LC/ATL/TL/TM) should move to hover/on-demand disclosure** on the Deals list table rather than more columns — Manik's direction.
- **Filter application must recompute all on-page counts** — currently broken in the v2.0 mock.
- Same core needs (filtering, funnel visibility, TAT tracking, target-setting) repeat at every permission level — one adaptable component set could serve all roles; Applications/Payments sub-structures are nearly identical between BDR and Admin IAs, differing mainly in scope. **Strongly reinforced by §18:** the exact same "4-card funnel" component (Applications Sent → Offers Shared → Converted → Payment Clearance) is reused verbatim for a BDR's own numbers, for each Team Manager's numbers on the Admin dashboard, and implicitly for the empty "Select a BDR to view" detail panel — one component, parameterized by scope, rather than bespoke views per role.
- **Worth preserving:** free-text reason logging on key actions.
- **Worth preserving:** the fee-structure-locked-after-payment-plan-creation rule.
- **Worth reconsidering:** tabs overlapping is confirmed intentional, but could be made more legible.
- **Worth preserving:** the application form's dual structure (hard qualifiers + soft intent signals).
- **Worth preserving:** the conditional Send-vs-Revise offer letter logic, and the "Get form link" manual-share fallback.
- **Worth clarifying/simplifying:** the apparent overlap between deal-level Payment status and per-installment status.
- **Worth preserving:** the Booked vs. Realised revenue split on the dashboard — now confirmed concretely (§6, §18), including the more granular "realised of this month's bookings vs. realised of earlier bookings" breakdown, which is a genuinely useful distinction for sales leadership.
- **Worth preserving (from §17):** the disposition taxonomy (Case 1 hard-disqualify vs. Case 2 soft/nurture-first), the timed auto-drop safety net (90/120 days), and the explicit "what stops Acquisition Communication" trigger list.
- **Worth preserving (from §17):** the two-step assignment (automated TL routing, manual BDR assignment).
- **Worth preserving (from §4d):** the running "Amount Left" validator when building a payment plan, and the live email preview before sending an offer — both prevent avoidable mistakes.
- **Worth simplifying:** having both "Course Fee" and "Sales Payable Fee" shown as separate figures when they may just be duplicates — worth collapsing to one clearly-named figure if confirmed redundant.
- **Worth preserving (from §18):** the cascading drill-down table (click a Team Manager → filters the Team Lead column to their reports → click a Team Lead → filters the BDR column → select a BDR → populates a detail panel below) is a clean, low-friction way to let a manager move from org-wide numbers down to one person's numbers without leaving the page or opening a new view.
- **Worth noting, not necessarily a flaw:** the Homepage mocks reuse one test persona ("Ved Pathak") across all 4 role screenshots, just swapping the role badge — a sensible way to preview role-scoped UI in Figma, but a reminder that "who's logged in" in these mocks isn't meaningful, only "which role is being previewed."

---

## 14. Screenshot / Frame Log

| # | Screenshot/Frame | Page | Version | Notes |
|---|---|---|---|---|
| 1 | Deals page, no filters | Deals (list) | v2.0 | Core columns identified |
| 2 | Filter modal | Deals filter component | v2.0 | Full status list, filter categories |
| 3 | "Deals_List_Filters_On" | Deals (filtered) | v2.0 | Known bug: tabs don't recompute |
| 4 | "Definitions of Statuses" | Design-doc/legend frame | v2.0-era | Color coding, status definitions, Global Status concept |
| 5 | "These tabs will contain deals of these statuses" | Design-doc/legend frame | v2.0-era | Tab-to-status mapping — confirmed |
| 6 | Individual Deal Detail page | Deal detail | v2.0 | Full breakdown in §4b |
| 7 | "Application Details" slide-over | Deal detail → View Application overlay | v2.0 | Application form schema (§4c); payment-card gateway variants (§6) |
| 8 | FigJam "User stories" | Planning board | Timing unclear | Verbatim source for §8 |
| 9 | FigJam "IA - BDR" | Planning board (Section 4) | Timing unclear | Full BDR information architecture — §15 |
| 10 | FigJam "IA - Admin" | Planning board (Section 3) | Timing unclear | Full Admin/Sales Head information architecture — §16 |
| 11 | FigJam "Fresh Application" | Planning board | Timing unclear | Full pre-OMS lead acquisition & disposition flow — §17 |
| 12-14 | Create Payment Plan / Choose Offer Template / Send confirmation | Deal detail → Offer wizard | v2.0 | Full offer-creation flow — §4d |
| 15-18 | Homepage/Dashboard — Admin, Team Manager, Team Lead, BDR | Dashboard (home) | Earlier UI version, left-sidebar nav, pre-v2.0 | Role-based dashboard, drill-down table, revenue Booked/Realised split — §18 |

This is the **complete screenshot set Manik has available** (confirmed 2026-08-24) — no further frames are expected. Downstream synthesis work continues in `claude/OMS-Rebuild-Spec.md` and `claude/OMS-Case-Study-Draft.md`.

---

## 15. Information Architecture — BDR (from FigJam, screenshot #9)

Flow starts at **Login to OMS**, branching into: **Performance Dashboard**, **Applications**, **Payments**.

**Performance Dashboard** (confirmed default landing page after login):
- **Deals Summary** → Unit Sales, ATS, Deal funnel visibility (→ Application rejected, Not interested, Plan ongoing, Payment ongoing, Payment completed)
- **Payments Summary** → Revenue, Mode of payment, Status (→ Paid, Unpaid, Overdue)
- **Progress/Incentive** → Target, Achieved

**Applications** (the Deals list, scoped to the BDR's own leads):
- Fields: Applicant name, Email, Phone no., Course, Last update, Status, Action
- Search, Filters; Status filter values: Application sent, Application rejected, Payment ongoing, Not interested; Date Duration filter
- **Action:** conditional — offer exists → "Revise offer letter"; no offer yet → "Send offer letter." Also: Mark as not interested, Mark as rejected, **Get form link**

**Payments** (scoped to the BDR's own leads):
- Fields: Applicant name, Email, Amount, Currency, Deadline, Mode, Deal owner, TI, Payment status
- Mode → Razorpay, Manual, Stripe, EMI
- Payment status → Paid, Unpaid, Overdue
- Search, Status, Date Duration filters

---

## 16. Information Architecture — Admin / Sales Head (from FigJam, screenshot #10)

Flow starts at **Log In**, branching into four top-level sections: **Overview Dashboard**, **Performance Dashboard**, **Applications**, **Payments**.

**Overview Dashboard** (org-wide, Admin-only):
- Trends
- **Booked and Realised Revenue**
- Application Funnel (filterable by Course, Date/Sales Cycle)
- Unit Sales
- ATS

**Performance Dashboard** — a drill-down:
- **TM Level → TL Level → Individual BDR**, each rolling up into **Target Stats**, filterable by Course and Date/Sales Cycle
- No separate tier for ATL appears in this drill-down (see §2 open question)

**Applications** (floor-wide, all BDRs):
- Fields: Applicant name, Email, Phone Number, Course, **BDR Name**, Last update, Status, Action
- Search (filters by User name, Email, or BDR), Status, Created date
- Status filter values: Application sent, Application rejected, Payment ongoing, Not interested; further breakdown: Application rejected, Not interested, Plan ongoing, Payment ongoing, Payment completed
- **Action:** identical conditional logic to the BDR IA — Send/Revise offer letter, Mark as not interested, Rejected

**Payments** (floor-wide): identical field set and filters to the BDR's Payments IA, scoped to everyone.

*(Structurally, Applications and Payments are near-identical between BDR and Admin — strong evidence these are meant to be the same underlying components with a scope parameter. The real differentiators at the Admin level are the Overview Dashboard and the TM→TL→BDR Performance drill-down.)*

---

## 17. Full Lead Acquisition & Disposition Flow (from FigJam, screenshot #11 — "Fresh Application")

This is the piece that sits **upstream of everything in §5** — how a random visitor becomes a HubSpot lead, gets assigned, gets called, and either becomes an OMS Deal or gets dropped. Confirms exactly when/how "Deal Created" (an event we'd already seen in the Deal Detail Activity Log, §4b) actually happens.

**1. Acquisition:** A **Visitor** arrives via Direct, Ads, Social media, or Organic channels.

**2. Lead Creation** — four ways a visitor becomes a lead:
- Apply Now form
- Download syllabus
- **CBL (Call Back Later)**
- **Career Navigator** (a named lead-gen surface, exact nature unconfirmed)

This triggers two parallel things:
- An **Intro Series Marketing Communication** (2 days) — a nurture email sequence that stops early if the lead pays or is marked Case 1 in Dispose.
- Entry into the **Sales Floor**: HubSpot workflow automation auto-assigns the lead to a **Team Lead**, who then **manually assigns it to a specific BDR**.

**3. Lead Call gate:** the BDR attempts to call the lead.
- **Not reached →** enters a **Lead Call Series** (repeated call attempts) running for up to **120 days**, after which — if still unreached — it's auto-dropped: a **120-day auto-drop check** triggers a **Lead drop series**, and **Acquisition Communication stops**.
- **Reached →** the BDR chooses one of three paths: **PDE**, **Dispose**, or leaving it as **"Stays Here" (continues in the Lead Call queue)**.

**4. PDE (Product Explained to lead)** — the pitch call itself. **This is the moment a Deal is created in OMS.** From here:
- **Application Shared** (the application form is sent)
- **Application Filled?**
  - Yes → **Offer Letter Shared → Offer accepted? → Downpayment Made? → Acquisition Communication stops** (the successful path, feeding into the §5 funnel)
  - No, or a stall at any later gate (offer not accepted, downpayment not made) → routes to **"Did BDR dispose it?"**
- **"Did BDR dispose it?"**
  - No → an automated **reminder-email cadence** kicks in, explicitly specified: **Application stage = 3 different emails within 2 days; Offer letter stage = 3 different emails within 1 day; Downpayment stage = reminder emails** (count not specified) — with a **90-day auto-drop** ("Case 2") if the BDR still hasn't acted by then.
  - Yes → the BDR sorts the disposition into **Case 1 (Junk / Not eligible / Language Barrier)** — a hard disqualification, sent a thank-you email and Acquisition Communication stops immediately — or **Case 2 (Other)** — a softer disqualification that still runs a **PDE Drop Series (90 days)** nurture before communication fully stops.

**5. Dispose (as a direct branch from the Lead Call gate, not via PDE):** the same Case 1 / Case 2 split applies — Case 1 → thank-you email, stops; Case 2 → stops (no drop series shown on this direct branch, unlike the PDE-routed Case 2).

**Key takeaways for the rest of the doc:**
- **"Deal Created"** happens specifically **at the PDE step**, i.e. once a BDR has actually pitched the course on a call — *before* "Application Sent," which is itself the very next step.
- **Assignment is two-step:** automated HubSpot routing to a Team Lead, then manual TL→BDR assignment.
- **Auto-drop is a real, timed safety net** at two points: 120 days of failed call attempts, or 90 days of BDR inaction post-PDE.
- **Disposition has a clean two-case taxonomy** (hard-disqualify vs. soft/nurture-first) reused across the flow.

---

## 18. Homepage / Dashboard — Role-Based (screenshots #15-18)

**Version note:** these mocks predate the v2.0 top nav — they use the left-sidebar nav documented in §3 (Dashboard | Applications | Payments | Content). Same test account, "Ved Pathak," is shown 4 times with a different role badge each time (Admin, Team Manager, Team Lead, BDR) — this is a role-preview technique, not 4 real people (see §13).

### 18a. Elements common to all 4 roles

**Revenue summary card** (top-left):
- Revenue / Unit Sales tab toggle (Revenue shown)
- Month selector dropdown (e.g. "November")
- "Booked in [Month]" headline figure, with a badge showing what % of that booked total is already realised
- "Total realised in [Month]" figure, broken into realised-of-this-month's-bookings + "Realised of previously booked in [Month]" — see §6 for the full Booked/Realised explanation this confirms
- Line chart of the revenue trend across the month (Y-axis in "cr" = crores), with a hover tooltip showing a cumulative figure and that specific day's figure (e.g. "18,500 (10 Nov)")

**Deal Stages / Payment Modes card** (top-right) — a tab toggle:
- **Deal Stages** (horizontal bar chart): Application Stage, Offer Stage, Payment Stage, Payment Completed, Expired, Not Interested — each with a count
- **Payment Modes** (pie chart, footnoted "*These are payments which are realised"): Manual, Razorpay, Stripe, EMI, each with a %
- Which tab is selected in a given screenshot is just that screenshot's state, not a role-based default — every role can toggle between both.

**Date-range quick filters:** This Month | Last Month | This Quarter | Lifetime | Or | Choose date range (custom).

**The reusable "funnel card" component** — a row of 4 cards, present (scoped differently) for every role and every person drilled into:
1. **Applications Sent** — total + breakdown (Application Pending, Expired, Filled, Not Interested, Rejected)
2. **Offers Shared / Appl. Filled** — total/denominator + breakdown (Offer Not Shared, Offer Not Accepted, Expired, Accepted, Not Interested, Rejected)
3. **Converted / Accepted** — total/denominator + breakdown (DP Not Paid (Accepted), Accepted but expired, Payment Overdue, Payment Due, Payment Cleared)
4. **Payment Clearance / Converted** — total/denominator + breakdown (Payment Completed)

Each funnel-card block sits under an **Overview / Performance** tab pair. **Performance** shows 4 KPI tiles instead of the funnel breakdown: Unit Sales Target vs. Achieved (with %), Revenue Booked, Revenue Realised, **Average Ticket Size** (resolves ATS, §2).

### 18b. Role-scoped differences

- **BDR:** just the common top charts + one funnel-card block for their own numbers. No team tables, no drill-down — matches the BDR's own-leads-only data scope.
- **Team Lead:** common top charts + own funnel-card block, plus a single-column **"BDR performance"** table (Name, Revenue, TvsA) listing their BDRs, plus a **Search BDR** box and an Overview/Performance detail panel below ("Select a BDR to view" empty state until one is chosen).
- **Team Manager:** same as Team Lead, but the table has two columns — **"Team Leads"** and **"BDRs"** — plus the same BDR search/detail panel.
- **Admin:** the richest view. Adds a **"Team Managers"** section — one full funnel-card block per Team Manager (3 TMs shown: Ish Kumar, Dhruv Anand, Raj Kashyap), each with its own Overview/Performance toggle. Below that, a **3-column drill-down table** — Team Managers | Team Leads | BDRs (Name, Revenue, TvsA each) — plus the same BDR search/detail panel at the bottom.

**Confirmed drill-down interaction (3-column Admin table):** clicking a row in the Team Managers column filters the Team Leads column to that TM's reports; clicking a row in the Team Leads column filters the BDRs column to that TL's reports; selecting a BDR (from that filtered list or via the search box) populates the detail panel below with that BDR's own funnel-card view. This is the concrete UI behind the FigJam IA's "TM Level → TL Level → Individual BDR" drill-down (§16).

**Rebuild takeaways captured in §13:** the funnel-card component's reuse across every scope (self, TM, TL, BDR-drilled-into) is strong evidence for a single parameterized component; the cascading drill-down table is a good pattern worth keeping.
