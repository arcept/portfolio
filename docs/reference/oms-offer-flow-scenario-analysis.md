> **Snapshot notice:** this is a point-in-time export (2026-09-05) of `claude/OMS-Offer-Flow-Scenario-Analysis.md`, a living document maintained in the Cowork session's attached Claude Project — that's the canonical, actively-updated version. This repo copy won't auto-update; if it changes meaningfully there, it should be re-exported. It is the reasoning behind `docs/planning/2026-09-05-oms-plan-offer-separation-brief.md` — read it for *why*, read the brief for *what to do*.

# OMS — Payment Plan & Offer Letter: Separated Flow Spec

**Written:** 5 September 2026 · supersedes the single-wizard analysis at this path
**Scope:** the flow re-cut as two distinct objects with explicit gates between them, per Manik's direction of 5 Sep 2026.
**Sources:** `OMS-working-doc.md` §4b/§4d/§5/§6 · `OMS-PRD.md` §4.2–§4.7 · `OMS-Rebuild-Spec.md` §6.2/§6.3/§6.5 · `OMS-Deals-Page-Brief.md` §7/§8 · `OMS-Offer-Emailer-Templates.md`

**Tags:** **[D]** documented as-built · **[DEC]** decided by Manik, 5 Sep 2026 · **[I]** inferred from the decisions · **[U]** still undefined.

> **⚠ This document corrects the Booked-revenue definition carried in `OMS-PRD.md` §10 and R-5.1.1, `OMS-Rebuild-Spec.md` §6.6 and `OMS-working-doc.md` §18. See §7.**

---

## 1. What changed

v2.0 treats this as **one wizard with two steps**. A single Send click commits a fee structure, a collection schedule, a gateway arrangement and an outbound email at the same instant, and the fee lock engages the moment the plan is created — so the plan is frozen from birth, and "Revise offer letter" quietly re-opens a locked object. That contradiction was the central finding of the previous analysis.

v3 separates them into **two objects with their own lifecycles**, joined by four gates:

> **Application filled → Payment Plan → Offer Letter (created) → Offer Letter (shared)**

The load-bearing move is the fourth rule: **the fee lock moves from plan *creation* to offer *sharing*.** That is not a loosening of the integrity rule — it is a more exact statement of it. The lock exists so a learner is never shown terms that silently change underneath them. Before the offer is shared, no learner has seen anything, so there is nothing to protect and the BDR should be free to work. After it is shared, the lock is on — and after the first payment lands, it is permanent (§7.3).

---

## 2. Two objects, two lifecycles

### 2.1 Payment Plan

| State | Meaning | Editable? |
|---|---|---|
| **— (none)** | Application not filled, or filled and no plan started | n/a |
| **Draft · incomplete** | Rows exist, Amount Left ≠ 0 | Yes |
| **Draft · ready** | Amount Left = 0; plan is internally valid | Yes |
| **Awaiting approval** | Contains an EMI row submitted to Sales Ops | No (frozen pending decision) |
| **Committed** | An offer letter has been shared against it. **Soft-locked** | No — until withdrawn |
| **Active** | The learner has paid. **Hard-locked** | Never |

**[DEC]** Editable across both Draft states, and again after a withdrawal. Frozen everywhere else.
**[I]** *Draft · incomplete* is new capability, not a compromise: because the plan is now its own saved object, a BDR can build a six-row mixed-mode plan across two sittings. The old wizard held all of it in local form state and lost it on close.

### 2.2 Offer Letter

| State | Meaning |
|---|---|
| **— (none)** | No letter created |
| **Created** | Composed against the current plan. Not sent. Nobody outside the floor has seen it |
| **Stale** ⚠ | The plan changed after the letter was created. **[DEC]** Cannot be shared until refreshed |
| **Shared** | Sent to the learner. The letter is now a fixed snapshot; the plan is Committed |
| **Expired** | The acceptance deadline passed |
| **Accepted** ⚠ | Learner accepted; no payment yet — **still no revenue effect** |
| **Withdrawn** | Pulled back by the floor. Link dead, plan unlocked, deal returns to the Plan stage |

**[DEC]** *Created* is a real, persisted state — a letter exists before anyone receives it. This is the whole point of the separation and it unlocks the four things §12 covers.

---

## 3. The gates

| # | Gate | Rule | Source |
|---|---|---|---|
| **G1** | Create a payment plan | Requires **Application · Filled** | **[DEC]** — resolves the previous doc's U-1 |
| **G2** | Create an offer letter | Requires a payment plan in **Draft · ready** (Amount Left = 0) | **[DEC]** + **[I]** |
| **G3** | Share an offer letter | Requires a letter in **Created** (not Stale), and — if the plan contains an EMI row — Sales Ops approval granted | **[DEC]** + **[I]**, see §8 |
| **G4** | Edit the payment plan | Only while no offer letter is currently shared | **[DEC]** |
| **G5** | Withdraw a shared offer | Available while **Shared** or **Accepted**; blocked once any payment is received | **[DEC]** + **[I]** |

**On G2:** the Amount-Left validator moves from "you may not advance to step 2" to "you may not create a letter." Same guardrail, better placed — it now guards the artefact that states the terms, rather than a navigation step. The protected pattern survives intact.

**On G4:** stated positively — the plan is editable from creation until share, and again from withdrawal until re-share.

**On G5:** the blocking condition is *a payment received*, not *acceptance*. That is the same instant the deal books revenue (§7), and it is not a coincidence — see §7.3.

---

## 4. Flow A — Create a payment plan

**Lives in:** Deal Detail → section 2, Payment Plan. Not a wizard step. **[I]** The empty state's current "Send offer letter" button becomes **"Create payment plan"**, disabled with an explanatory line until the application is filled.

1. BDR opens the Payment Plan section on a Deal at **Application · Filled ⚠**.
2. Chooses **Upfront** or **Part Payment**.
3. Enters a **Discount**. Course Fee (read-only, from the course) − Discount = **Net Payable Fee**, live.
4. Builds installment rows: amount · mode · deadline. Modes are currency-bound — INR → Razorpay / Manual / EMI_3P; USD → Stripe one-time / Stripe EMI. Part Payment adds *Add installment* and per-row delete.
5. An EMI mode on a row replaces the amount field with three tenure cards (3 / 6 / 12 months, each showing per-month amount and total interest) plus a start date.
6. **Amount Left** counts down live. The plan **saves at any time**; it stays *Draft · incomplete* until Amount Left is exactly zero.
7. At zero, the plan is **Draft · ready** and the Offer Letter section unlocks.
8. If any row is EMI: **Submit for Sales Ops approval** (§8).

**Deal status while this is happening:** **Plan · Draft ⚠** — see §10.

**Still open here:**

- **[U-1] EMI rows vs. Amount Left** — does an EMI row contribute principal or principal-plus-interest? Net Payable contains no interest, so one reading makes the validator unreachable. **§7.4 narrows this** for EMI_3P.
- **[U-2] Discount ≥ Course Fee** — negative Net Payable is unbounded; a 100% scholarship yields Net Payable 0, a balanced plan with no rows, and an offer with no payment. Under the corrected revenue model this is sharper: **a zero-value deal can never book**, because booking requires a payment that will never happen. Needs a stated outcome.
- **[U-3] One Discount field, three displayed types** — Deal Detail shows Total Discount split into Upfront / Scholarship / BDR Discount; the builder captures one number. Same defect class as D1 (Course Fee vs. Sales Payable Fee); fold into the same decision.
- **[U-4] Date validation** — past deadlines, out-of-order installments, EMI start dates after the cohort's first session.
- **[U-5] Rounding help** — with a hard zero gate, "split evenly" / auto-fill-last-row is daily friction, not an edge case.

---

## 5. Flow B — Create an offer letter

**Lives in:** Deal Detail → section 3, Offer Letter. Unlocks at G2.

1. BDR picks one of three templates: **Early Bird** · **Without Scholarship** · **With Scholarship**.
2. Sets the **acceptance deadline**.
3. The **live preview** renders the exact outgoing email beside the form — greeting, course, validity datetime, *Accept Your Offer* CTA, scholarship amount and percentage where a discount exists, benefit bullets. Second protected pattern, unchanged.
4. **Create.** The letter persists in state **Created**. **Nothing is sent.**

**What the letter carries** **[D]**: no fee figures, no installment table, no EMI tenure, no payment mode, no payment link. One CTA to `{{offer_letter_url}}`, which is the plan of record. Merge tags per `OMS-Offer-Emailer-Templates.md`; `{{scholarship_amount}}` / `{{scholarship_percent}}` derive from the plan's Discount.

**The stale rule** **[DEC]**: if the plan is edited after the letter is created, the letter flips to **Stale ⚠** with a visible note ("plan changed 12 Sep — discount ₹40,000 → ₹55,000"), and **Share is disabled** until the BDR refreshes it. Not a silent update, not a silent discard.

**Still open:** **[U-6]** template/discount cross-validation — *With Scholarship* + zero discount, or *Without Scholarship* + a large discount, are both one click away and neither is blocked. A soft warning at create time costs nothing. **[U-7]** the deadline field still has to reconcile with the emailers' hard-coded 24-hour copy; unchanged by the separation and still blocks the email build.

---

## 6. Flow C — Share the offer letter

A **separate, deliberate action** with its own confirmation. **[DEC]** Creating ≠ sharing.

**Pre-share confirmation should state, in one panel, everything about to become irreversible:**

- who it goes to (name + the actual email address — see U-8)
- the template and the acceptance deadline as a spelled-out local datetime
- Net Payable and the installment schedule in summary
- **"The payment plan will lock when this is shared."**

**What Share commits, atomically:**

| Written | Consequence |
|---|---|
| Plan → **Committed** | **Fee structure soft-locks here** — not at creation |
| Letter → **Shared**, snapshot fixed | The learner's link goes live |
| Deal status → **Offer · Pending** | Leaves the Plan tab, enters the Offer tab |
| `lastUpdate` bumped | Row rises to the top of the default sort |
| Activity log: *"Offer letter shared"*, reason = template name, **actor named** | The audit trail (see U-9) |
| Outbound email | The only artefact the learner sees |
| **Revenue** | **None.** Sharing an offer books nothing — see §7 |

Then the confirmation: *"Offer shared with {firstName}"* + **View deal**.

---

## 7. When revenue books — correcting the record

### 7.1 The correction

**[DEC — Manik, 5 Sep 2026]** Three project docs currently define Booked revenue as *"the value of payment plans/offers created in a period, regardless of collection"* (`OMS-PRD.md` §10 glossary and the R-5.1.1 protected-concept callout; echoed in `OMS-Rebuild-Spec.md` §6.6 and `OMS-working-doc.md` §18). **That definition is wrong.**

> **Booking is triggered by the learner's first payment — a part payment counts — and books the deal's full value at once. Realised is the cash actually collected to date.**

| Event | Booked | Realised |
|---|---|---|
| Payment plan created | — | — |
| Offer letter created | — | — |
| Offer letter shared | — | — |
| Offer **accepted**, nothing paid | — | — |
| **First payment, any amount** | **Full deal value, recognised in this period** | += that payment |
| Each later installment | unchanged | += amount, **in its own period** |
| Final installment | unchanged | Realised = Booked for that deal |

So Booked ≥ Realised for a deal, always, converging as the plan is collected.

### 7.2 What this fixes and what it implies

- **Booked revenue and Unit Sales share one trigger.** "Converted" in funnel card 3 is precisely *down payment received*, which is why *DP Not Paid (Accepted)* is its own breakdown bucket. Two headline figures that can never disagree — a free V3-G1 win, and worth an explicit comment wherever both are computed.
- **Nothing in Flows A, B or C has any revenue effect.** The entire separation is revenue-neutral by construction. Withdrawal (§9) therefore reverses nothing, which removes the restatement problem the previous version of this document invented.
- **The dashboard's realised split becomes exactly computable.** *Realised of this period's bookings* = payments on deals that booked this period; *realised of earlier bookings* = payments on deals booked in prior periods. That split only works because booking is a discrete event at a point in time — which it now is.
- **The booking date is the first-payment date, not the offer date.** An offer shared 28 Aug whose down payment lands 2 Sep books in **September**. Month-end down-payment chasing is therefore a real floor dynamic, and the dashboard should make the *accepted-but-DP-not-paid* pipeline visible near close — that bucket is next month's booked revenue sitting in plain sight.
- **An accepted offer is worth nothing in reporting.** *Offer · Accepted ⚠* carries a red action badge precisely because it is a commitment with no money behind it yet.

### 7.3 The lock now has two tiers, and a real justification

| Tier | Engages | Reversible | Protects |
|---|---|---|---|
| **Soft lock** | offer letter shared | Yes — **Withdraw** (§9) | the learner from silent term changes |
| **Hard lock** | **first payment received** | **No** | the booked figure and the cash already collected |

This is why G5 blocks on *payment received* rather than on *acceptance*: the moment money moves, the deal's full value has been recognised as booked revenue, and changing the plan would retroactively change a figure already reported to a Team Manager. **The hard lock and the booking event are the same fact, seen from two sides.** That is a considerably better justification for R-4.6.2 than "fee structure is locked once a payment plan is created," and it should replace it.

### 7.4 Still open on the revenue model

- **[U-21] "The entire sum of the course" — Course Fee or Net Payable?** Reading it as **Net Payable**, since that is the only figure Realised can converge on, and the only one where a discount is visible in ATS. If it is gross Course Fee, then discounts vanish from reporting and Realised can never reach Booked on any discounted deal. Worth one line of confirmation.
- **[U-22] Does booking ever reverse?** *Enrolment · Cancelled* is a manual backend action that happens **after** payments, and refunds presumably exist. No document describes a reversal. Without one, a cancelled enrolment leaves booked revenue standing in the period forever — and the ±1 reconciliation tolerance in the Deals brief is nothing next to a cancelled deal that never leaves the books.
- **[U-23] Does EMI_3P realise in full at disbursement?** Its payment card reads **"Disbursed On"**, not Due On / Paid On — which reads as the lender paying Novatr the principal in one go while the learner repays the lender. If so, an EMI_3P deal realises 100% at disbursement while a Stripe EMI deal realises monthly across the tenure. That is a large asymmetry in the realised curve and in the Payment Modes pie, and nothing flags it today.
  **It also narrows [U-1]:** if the lender disburses principal, the plan should carry **principal only**, and the interest is the learner's business with the lender — never OMS revenue. That is the answer I would expect for EMI_3P; Stripe EMI still needs its own.

---

## 8. Where EMI approval now sits

**[I]** The separation gives EMI approval the home it never had. Approval is a **gate on Share (G3)**, not on plan creation:

1. BDR builds a plan containing an EMI row → **Submit for Sales Ops approval**.
2. Plan → **Awaiting approval** (frozen). The offer letter may be *created* but **not shared**.
3. **Approved** → plan returns to *Draft · ready*; Share unlocks.
4. **Rejected** → plan returns to *Draft*, with the rejection reason in the log. BDR refills the EMI details or switches mode; any created letter goes **Stale** if the plan changed.

This kills the ordering problem outright. Under the old single-click model, either the learner received an offer whose arrangement Sales Ops might still reject, or the wizard needed a "waiting on Sales Ops" state the status model had no name for. Now the waiting happens entirely before anything leaves the building, and *Plan · Awaiting approval* is a legitimate, nameable deal state.

**[I] Stripe EMI's direct link should fire on acceptance, not on share.** The plan is *Committed* at share but *Active* only when the learner pays. Firing Stripe's collection link at share means a learner can receive a payment link for an offer they have not accepted — and possibly before the OMS offer email lands.

**[U-10]** Sales Ops still has no queue surface and no notification path documented. *Plan · Awaiting approval* as a filterable status is the minimum; a Sales Ops-scoped list is the real answer.

---

## 9. After sharing — the two post-share actions

### Resend **[DEC]**

Re-sends the **identical** letter — same snapshot, same deadline, same link. Logged as a resend, distinct from any revision. Does not touch the plan or the lock. For the learner who deleted the email or never found it.

**[I] Surface the time remaining at the resend confirmation.** Resending an offer with two hours left on the clock is worse than useless. Below some threshold the confirmation should say so and point at Withdraw → re-share with a fresh deadline instead.

### Withdraw **[DEC]** — the correction path

The replacement for "Revise offer letter", and the answer to the contradiction that opened this document.

1. BDR (or TL/TM) chooses **Withdraw offer**, with a **mandatory free-text reason** — consistent with the product's protected reason-capture pattern.
2. `{{offer_letter_url}}` immediately serves the **expired/withdrawn offer page** rather than a live acceptable offer. **[U-11]** that page needs to exist — already specified for expiry, still not built.
3. Letter → **Withdrawn** (retained in history, never deleted). Plan → unlocked, back to **Draft**.
4. Deal returns to the **Plan** stage with an action badge.
5. BDR edits the plan → the letter is **Stale** → refresh → **Share** again as v2.

**Withdrawal has no revenue effect** — nothing had booked, because no payment had been received. That is guaranteed by G5, which blocks withdrawal the moment a payment lands.

**Withdrawing an accepted offer** is permitted but should demand a stronger confirmation and a reason: the learner has said yes to specific terms and is about to be told they changed. **Blocked once any payment is received** — past that point the correction is a finance operation, not a sales one, and the deal's full value is already on the books.

**Worked example — the wrong discount, caught after sending:**

> Offer shared Tue 10:14 with a ₹40,000 discount; the approved scholarship was ₹55,000.
> → Withdraw, reason *"wrong scholarship applied — approved ₹55,000"*. Link dies; plan unlocks. No revenue effect — nothing had booked.
> → Edit the plan: discount ₹55,000, installments rebalanced to Amount Left 0.
> → Offer letter flags **Stale**; BDR refreshes it, preview now shows the correct scholarship row.
> → Share v2. Log reads, in order: *shared v1 → withdrawn (reason) → plan edited → shared v2*.

Five actions, all logged, one live offer at any moment, and a learner who received one wrong email and one corrected one — instead of the current model, where the plan was locked at creation and the only documented escape was to unwind everything.

---

## 10. Status model and Deals-page impact

**[I]** The separation needs a stage of its own, because the work between "application filled" and "offer out" is now two distinct jobs with two gates — and today it is invisible, folded into a single *Application · Filled ⚠*.

**Proposed stage sequence:** Application → **Plan** → Offer → Payment → Enrolment, with the Global statuses cross-cutting as before.

| Stage | Status | Colour | Means | Who owes the next move |
|---|---|---|---|---|
| Application | Pending / Expired / **Filled ⚠** | blue / amber / green+⚠ | unchanged | learner / — / **BDR: create a plan** |
| **Plan** | **Not started ⚠** | green + ⚠ | app filled, no plan | BDR |
| **Plan** | **Draft ⚠** | green + ⚠ | plan exists; letter not created, not shared, or stale | BDR |
| **Plan** | **Awaiting approval** | blue | EMI submitted to Sales Ops | **Sales Ops** |
| Offer | Pending | blue | shared, waiting on learner | learner |
| Offer | Expired | amber | deadline passed | BDR |
| Offer | **Withdrawn ⚠** | amber + ⚠ | pulled back; plan unlocked | BDR |
| Offer | Accepted ⚠ | green + ⚠ | accepted, **no payment — nothing booked** | BDR |
| Payment | Ongoing / Completed | green | **first payment received → deal books** | — |

**Colour convention widens by one word** **[I]**: blue currently means "waiting on the learner"; it now means "waiting on someone outside this deal's owner" — learner *or* Sales Ops. The ⚠ badge continues to mean "you owe an action." State it in the legend rather than letting *Awaiting approval* borrow blue silently.

**Deals page:** the tab strip gains a **Plan** tab — *All · Action Required · Application · Plan · Offer · Payment · Not Interested · Rejected · Saved*. That tab is the BDR's real work queue and today it does not exist. Tab overlap stays intentional; the single-filtered-set rule (P0-1) is unaffected.

**Funnel cards:** card 2's existing *Offer Not Shared* bucket now has a precise definition — plan exists, letter not shared — instead of being an inference. Card 3's *DP Not Paid (Accepted)* bucket is, per §7.2, **next period's booked revenue**, and deserves to be readable as such near month-end. **[U-12]** whether *Plan · Not started* and *Plan · Draft* should split card 2's breakdown further is worth a look when the dashboard is rebuilt.

**Row actions** become stage-conditional rather than one relabelling button: *Create payment plan* → *Create offer letter* → *Share offer letter* → *Resend* / *Withdraw*.

---

## 11. Scenario catalogue, re-cut against the gates

### G1 — Application → Plan

| # | Scenario | Behaviour |
|---|---|---|
| S1 | App *Pending*, BDR wants to build a plan | **[DEC]** blocked. Action disabled with the reason shown, not hidden |
| S2 | App *Expired*, learner never filled | **[U-13]** does re-sending the form link reset to Pending? *Get form link* exists; its status effect is unstated |
| S3 | App filled, BDR does nothing | **[D]** 3 reminder emails in 2 days; 90-day auto-drop backstop |
| S4 | Application edited after the plan exists | **[U-14]** if the course changes, Course Fee changes and the plan's arithmetic is stale. Should force the plan back to *Draft · incomplete* |

### G2 — Plan → Offer letter

| # | Scenario | Behaviour |
|---|---|---|
| S5 | Amount Left ≠ 0, BDR tries to create the letter | **[DEC]** blocked; the validator's new home |
| S6 | Plan saved incomplete, BDR returns next day | **[I]** resumes from *Draft · incomplete* — new capability |
| S7 | Upfront plan, single mode | **[D]** base case |
| S8 | Mixed plan — non-EMI down payment + EMI balance | **[I]** allowed; most common real EMI shape |
| S9 | Two or more EMI rows | **[U-15]** allowed by the model, incoherent as an arrangement, unblocked |
| S10 | Manual mode (INR) | **[U-16]** who tells the learner how to pay, and who marks it Paid, is undefined — and marking it Paid is now the **booking trigger**, so it is a revenue-recognition action performed by hand |
| S11 | Plan in *Awaiting approval* | **[I]** letter may be created, not shared |

### G3 — Offer letter → Shared

| # | Scenario | Behaviour |
|---|---|---|
| S12 | Letter created, plan then edited | **[DEC]** letter → **Stale**; Share disabled until refreshed |
| S13 | Letter created, TL wants to check it before it goes | **[I]** now possible — §12 |
| S14 | EMI rejected by Sales Ops after the letter was created | **[I]** plan → Draft; letter → Stale; nothing reached the learner |
| S15 | Deadline set in the past | **[U-4]** unblocked; ships an offer expired on arrival |
| S16 | Email bounces / lands in spam | **[U-8]** no delivery state anywhere. *Offer · Pending* is indistinguishable from a learner thinking it over, and the 3-emails-in-1-day cadence fires into an unverified address |
| S17 | Learner has no email on the application | **[U-8]** no guard |
| S18 | Share fails mid-write | **[U-17]** if the plan commits when the email does not, the soft lock has engaged on an offer nobody received. Share must be atomic or compensating |
| S19 | Double-click / two users share at once | **[U-18]** no locking documented |

### G4/G5 — After sharing

| # | Scenario | Behaviour |
|---|---|---|
| S20 | Learner accepts, pays nothing | **[D]** *Offer · Accepted ⚠*. **No booking.** Still fully withdrawable |
| S21 | Learner pays the down payment | **[D+DEC]** *Payment · Ongoing*; plan → **Active**, hard-locked; **full deal value books this period**; Realised += the DP; enrollment unlocks. **Four things at once — the single most consequential event in the funnel** |
| S22 | Ignores it | **[D]** 3 emails within 1 day, then expiry at the deadline |
| S23 | Deadline passes | **[D]** *Offer · Expired*; the URL must serve an expired page, **[U-11]** not built |
| S24 | Learner says they never got it | **[DEC]** **Resend** — same letter, same deadline, same link |
| S25 | Learner asks for different terms, pre-payment | **[DEC]** **Withdraw** → edit plan → refresh letter → share v2. Revenue-neutral |
| S26 | Wrong terms caught after sharing, pre-payment | **[DEC]** same path (worked example, §9) |
| S27 | Withdraw after acceptance, pre-payment | **[DEC]** allowed, stronger confirm + mandatory reason |
| S28 | Withdraw after the first payment | **[DEC]** blocked — the deal is booked and the plan is hard-locked |
| S29 | Learner asks for different terms **after** paying | **[U-24]** the real remaining gap. Not a sales action any more: it changes a booked figure. Needs a finance-side path (the EMI re-approval editor is the nearest precedent) or an explicit "no" |
| S30 | Marked Not Interested while an offer is live | **[I]** the global status must invalidate the live offer, or the offer page must read the deal's status at load. Otherwise a learner accepts an offer on a deal the floor wrote off |
| S31 | Reopened weeks after being parked at *Offer · Pending* | **[I]** should return as *Offer · Expired*, so the honest next action (share v2) is the obvious one |
| S32 | Deal reassigned after sharing | **[U-19]** the sent snapshot carries `{{counsellor_name/email/phone}}`. The learner holds stale contact details for someone who no longer owns the deal. Monthly team churn is documented, so this is routine |
| S33 | TL/TM/Admin acts on a BDR's deal | **[I]** possible via row actions; **[U-9]** actor attribution in the log is unspecified and matters more now there are five distinct actions |
| S34 | Enrolment cancelled after payments | **[U-22]** booked revenue reversal is undefined — see §7.4 |
| S35 | Deal at *Enrolment · Cancelled* | **[I]** all plan and offer actions hidden |

---

## 12. What the separation buys, beyond correctness

1. **An offer can be reviewed before it is sent.** *Created* is a persisted state, so a TL can read the exact email and the exact plan before a learner does. New capability — under the old model, review and send were the same click. A "request TL review" step on high-discount offers becomes trivial to add later. **[U-20]** worth deciding whether any discount threshold should *require* it.
2. **Plans get drafts for free.** Multi-row mixed-mode plans survive a closed tab.
3. **EMI approval has a home**, and a nameable deal state, entirely before anything leaves the building (§8).
4. **The lock gets a coherent two-tier justification** (§7.3) — soft at share, protecting the learner; hard at first payment, protecting the books. "You cannot change money on an offer a learner has seen, and you can never change money on a deal that has been paid" is a rule a BDR can hold in their head. "You cannot change money once you started building" was one they had to route around.
5. **The Deals page gains a real work queue** — the Plan tab is the between-gates backlog that is currently invisible.
6. **The revenue model is untouched by any of it.** Flows A–C are revenue-neutral by construction, so none of this needs a reporting migration — the only reporting change here is correcting a definition that was already wrong (§7.1).

---

## 13. Still open

**Blocking:**

1. **[U-21] Booked = Net Payable or gross Course Fee?** One line. Net Payable is the only reading where Realised converges and discounts show up in ATS.
2. **[U-22] Does booking reverse on cancellation or refund?** Without an answer, cancelled deals stay on the books permanently.
3. **[U-1 / U-23] EMI and the money model** — principal vs. principal-plus-interest in Amount Left, and whether EMI_3P realises in full at disbursement. §7.4 argues principal-only for EMI_3P; Stripe EMI still needs its own answer.
4. **[U-7] The deadline field vs. the emailers' hard-coded 24-hour copy** — unchanged by the separation, still blocks the email build.
5. **[U-2] Discount ≥ Course Fee**, including the 100%-scholarship path — which under the corrected model can never book.

**High value, cheap:**

6. **[U-8] Email delivery state** on the Offer Letter section — *Shared · Delivered · Opened · Bounced*.
7. **[U-11] The withdrawn/expired offer page** — specified for expiry, now needed for withdrawal too.
8. **[U-9] Actor attribution** on every logged action, not just the subject.
9. **[U-6] Template/discount soft warning** at letter creation; past-deadline warning alongside it.
10. **S30 status propagation** — a global status must kill a live offer.
11. **[U-24] The post-payment change request** — the one correction path the two-tier lock deliberately closes. Decide whether it has a finance-side route or an explicit "no".

**Resolve with existing open decisions:**

12. **[U-3] One Discount field vs. three displayed types** — same defect class as D1.
13. **[U-10] A Sales Ops queue** for EMI approvals.
14. **[U-12] Whether the funnel's card 2 splits *Plan · Not started* from *Plan · Draft*.**
15. **[U-20] A discount threshold that requires TL review before sharing.**

---

## 14. Downstream doc corrections needed

The Booked-revenue definition in §7.1 contradicts what three project docs currently say. Until they are corrected, a build brief read in isolation will implement the wrong rule.

| Doc | Location | Current text | Needs |
|---|---|---|---|
| `OMS-PRD.md` | §10 Glossary | *"Booked revenue \| Value of payment plans/offers created in a period, regardless of collection"* | Replace with the first-payment trigger |
| `OMS-PRD.md` | §5.1.1, "Booked vs. Realised — protected concept" | *"Booked is the value of new commitments made in the period, regardless of collection"* | Same; the concept stays protected, the trigger changes |
| `OMS-PRD.md` | §4.6, R-4.6.2 | *"Fee structure is locked once a payment plan is created"* | Replace with the two-tier lock (§7.3) |
| `OMS-Rebuild-Spec.md` | §6.6 step 1 | *"Booked-this-period headline…"* | Restate the trigger where it defines the card |
| `OMS-working-doc.md` | §6, §18 | Booked/Realised split description | Same |
