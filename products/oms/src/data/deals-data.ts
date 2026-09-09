/**
 * Deal records for the Deals page — ported from the working prototype's `js/data.js`
 * (shapes and logic, not the file itself), but generated from the dashboard's existing
 * reconciled cascade instead of an independent seeded roster.
 *
 * The rule (2026-08-31 Deals Page brief §5.2): every deal is one unit in a month's
 * `DealStageCascade.currentStage` partition. Since that partition is already asserted to sum
 * to `applicationsSent`, generating exactly one record per counted unit gives a roster that
 * reconciles with the dashboard *by construction* — the Deals page and the dashboard read off
 * the same underlying numbers, just re-expressed as individual rows instead of aggregates.
 *
 * Reconciliation tolerance: per-persona counts (roster summed for a TM/TL/BDR) can differ from
 * `scalePeriodDataForPersona`'s numbers by up to ±1, because the two round independently —
 * one rounds a bucket-then-splits-by-BDR, the other rounds a whole-cascade-then-splits-by-TM.
 * Org-wide totals always match exactly (`splitByWeights` preserves the total by construction).
 * Accepted as a documented prototype tolerance rather than making `scaleCascade` read counts
 * back from this roster — that would work, but it's a bigger refactor for a difference that
 * never exceeds 1 and never appears at all in the numbers that actually matter (org-wide).
 *
 * Payment Plan / Offer Letter separation (2026-09-05 brief): a deal now moves through four
 * gates — Application filled → Payment Plan → Offer Letter (created) → Offer Letter (shared) —
 * instead of the single "send offer" step the v2.0-style wizard modeled. `plan` and `offer` are
 * independent state machines (§2 of the brief); `canCreatePlan`/`canEditPlan`/`canCreateLetter`/
 * `canShareLetter`/`canWithdraw` are the single source of truth for what's allowed at any given
 * moment — every surface (row actions, detail sections, dialogs) reads these instead of
 * inferring permission from `reachedStage`, which is how the old model tangled.
 */
import type { FlagTypes } from "@/components/base/badges/badge-types";
import type { Persona } from "@/types/role";
import type { DealStageCascade, MonthGroundTruth, OrgBdr } from "./dashboard-data";
import { MONTHS, PROTOTYPE_TODAY, bdrs, seededRandom, splitByWeights, teamLeads, teamManagers } from "./dashboard-data";

// ---------------------------------------------------------------------------
// Status model — ported verbatim from the prototype's `STATUS` object, extended with the
// Payment Plan stage (2026-09-05 brief §3.3). Colour language and stage grouping are the
// product's own convention (blue = waiting on someone outside this deal's owner — the learner
// or Sales Ops — amber = timed out, green = progress, red = action/cancelled, gray =
// cross-cutting global status).
// ---------------------------------------------------------------------------

export type DealStatusId =
    | "APP_NEW"
    | "APP_PENDING"
    | "APP_EXPIRED"
    | "APP_FILLED"
    | "PLAN_NOT_STARTED"
    | "PLAN_DRAFT"
    | "PLAN_AWAITING_APPROVAL"
    | "OFFER_PENDING"
    | "OFFER_EXPIRED"
    | "OFFER_ACCEPTED"
    | "OFFER_WITHDRAWN"
    | "PAY_ONGOING"
    | "PAY_DUE"
    | "PAY_OVERDUE"
    | "PAY_COMPLETED"
    | "ENR_CANCELLED"
    | "NOT_INTERESTED"
    | "REJECTED"
    | "SAVED";

export type DealStatus = {
    id: DealStatusId;
    stage: "Application" | "Plan" | "Offer" | "Payment" | "Enrolment" | "Global";
    label: string;
    color: "blue" | "amber" | "green" | "red" | "gray";
    /** True = the BDR owes an action (Application Filled, Offer Accepted) — rendered with the
     * red "Action needed" treatment, and what the Action Required tab filters on. */
    action: boolean;
    desc: string;
};

export const STATUS: Record<DealStatusId, DealStatus> = {
    APP_NEW: { id: "APP_NEW", stage: "Application", label: "New", color: "green", action: true, desc: "Assigned — application form not sent yet" },
    APP_PENDING: { id: "APP_PENDING", stage: "Application", label: "Pending", color: "blue", action: false, desc: "Application sent, awaiting the learner" },
    APP_EXPIRED: { id: "APP_EXPIRED", stage: "Application", label: "Expired", color: "amber", action: false, desc: "Application link timed out" },
    // Transitional: real time between the learner filling the application and the status
    // flipping to PLAN_NOT_STARTED. Kept for that brief window rather than removed outright.
    APP_FILLED: { id: "APP_FILLED", stage: "Application", label: "Filled", color: "green", action: true, desc: "Learner filled it — plan not started yet" },
    PLAN_NOT_STARTED: {
        id: "PLAN_NOT_STARTED",
        stage: "Plan",
        label: "Not Created",
        color: "green",
        action: true,
        desc: "Application filled — payment plan not created",
    },
    PLAN_DRAFT: { id: "PLAN_DRAFT", stage: "Plan", label: "Created", color: "green", action: true, desc: "Payment plan being built or ready" },
    PLAN_AWAITING_APPROVAL: {
        id: "PLAN_AWAITING_APPROVAL",
        stage: "Plan",
        label: "Awaiting approval",
        color: "blue",
        action: false,
        desc: "An EMI row is with Sales Ops",
    },
    OFFER_PENDING: { id: "OFFER_PENDING", stage: "Offer", label: "Pending", color: "blue", action: false, desc: "Offer sent, awaiting the learner" },
    OFFER_EXPIRED: { id: "OFFER_EXPIRED", stage: "Offer", label: "Expired", color: "amber", action: false, desc: "Offer's acceptance window timed out" },
    OFFER_ACCEPTED: { id: "OFFER_ACCEPTED", stage: "Offer", label: "Accepted", color: "green", action: true, desc: "Accepted — no payment made yet" },
    OFFER_WITHDRAWN: { id: "OFFER_WITHDRAWN", stage: "Offer", label: "Withdrawn", color: "amber", action: true, desc: "Offer withdrawn — plan reopened" },
    PAY_ONGOING: { id: "PAY_ONGOING", stage: "Payment", label: "Ongoing", color: "green", action: false, desc: "First payment made, next installment not due yet" },
    PAY_DUE: { id: "PAY_DUE", stage: "Payment", label: "Due", color: "amber", action: false, desc: "An installment is past its due date, within the grace period" },
    PAY_OVERDUE: { id: "PAY_OVERDUE", stage: "Payment", label: "Overdue", color: "red", action: false, desc: "An installment is past its grace-period last date" },
    PAY_COMPLETED: { id: "PAY_COMPLETED", stage: "Payment", label: "Completed", color: "green", action: false, desc: "All installments paid" },
    ENR_CANCELLED: {
        id: "ENR_CANCELLED",
        stage: "Enrolment",
        label: "Cancelled",
        color: "red",
        action: false,
        desc: "Enrolment was cancelled (backend action)",
    },
    NOT_INTERESTED: { id: "NOT_INTERESTED", stage: "Global", label: "Not Interested", color: "gray", action: false, desc: "Learner is no longer interested" },
    REJECTED: { id: "REJECTED", stage: "Global", label: "Rejected", color: "gray", action: false, desc: "Disqualified by the BDR" },
    SAVED: { id: "SAVED", stage: "Global", label: "Saved", color: "gray", action: false, desc: "Parked for a future sales cycle" },
};

/** Furthest funnel step reached — 0 Application / 1 Plan / 2 Offer / 3 Payment ongoing / 4
 * Payment cleared or cancelled. Lets a Not-Interested/Rejected/Saved deal bucket at where it
 * actually stalled, and is what section-completion checks read from. Shifted by one step from
 * the pre-separation model to make room for the Plan stage (2026-09-05 brief §3.3) — every
 * `reachedStage >= n` comparison in the codebase shifts with it. */
export type ReachedStage = 0 | 1 | 2 | 3 | 4;

const STAGE_RANK: Partial<Record<DealStatusId, ReachedStage>> = {
    APP_NEW: 0,
    APP_PENDING: 0,
    APP_EXPIRED: 0,
    APP_FILLED: 0,
    PLAN_NOT_STARTED: 1,
    PLAN_DRAFT: 1,
    PLAN_AWAITING_APPROVAL: 1,
    OFFER_PENDING: 2,
    OFFER_EXPIRED: 2,
    OFFER_ACCEPTED: 2,
    OFFER_WITHDRAWN: 2,
    PAY_ONGOING: 3,
    PAY_DUE: 3,
    PAY_OVERDUE: 3,
    PAY_COMPLETED: 4,
    ENR_CANCELLED: 4,
};

// ---------------------------------------------------------------------------
// Courses, offer templates, decoration pools — ported shapes from the
// prototype's data.js.
// ---------------------------------------------------------------------------

export type Course = { id: string; code: string; name: string; short: string };

export const COURSES: Course[] = [
    { id: "bim-arch", code: "BIM_C005", name: "BIM Professional Course for Architects", short: "BIM · Architects" },
    { id: "bim-civil", code: "BIM_C009", name: "BIM Professional Course for Civil Engineers", short: "BIM · Civil" },
    { id: "mcd", code: "MCD_C004", name: "Master in Computational Design for Professional Architects and Engineers", short: "MCD" },
];

export type OfferTemplate = { id: string; name: string; blurb: string };

export const OFFER_TEMPLATES: OfferTemplate[] = [
    { id: "early-bird", name: "Early Bird", blurb: "For learners who accept within the first 48 hours." },
    { id: "no-scholarship", name: "Without Scholarship", blurb: "Standard offer, no discount applied." },
    { id: "with-scholarship", name: "With Scholarship", blurb: "Includes the merit/need-based scholarship line." },
];

const FIRST_NAMES = [
    "Aarav",
    "Vivaan",
    "Diya",
    "Ishita",
    "Kabir",
    "Meher",
    "Sara",
    "Aryan",
    "Naina",
    "Reyansh",
    "Anaya",
    "Vihaan",
    "Myra",
    "Advika",
    "Rehan",
    "Trisha",
    "Dhruv",
    "Kiara",
    "Yash",
    "Alia",
    "James",
    "Olivia",
    "Daniel",
    "Sophia",
    "Lucas",
    "Amelia",
    "Noah",
    "Grace",
    "Ethan",
    "Chloe",
    "Marco",
    "Elena",
    "Hassan",
    "Layla",
    "Omar",
    "Fatima",
    "Chen",
    "Wei",
    "Mei",
    "Arjun",
];
const LAST_NAMES = [
    "Sharma",
    "Gupta",
    "Iyer",
    "Reddy",
    "Nair",
    "Kapoor",
    "Verma",
    "Chopra",
    "Bhatt",
    "Rao",
    "Malhotra",
    "Menon",
    "Joshi",
    "Bose",
    "Sheikh",
    "Suri",
    "Desai",
    "Patil",
    "Ranganathan",
    "Ahmed",
    "Fischer",
    "Novak",
    "Rossi",
    "Dubois",
    "Larsen",
    "Okoye",
    "Silva",
    "Tanaka",
    "Wong",
    "Kim",
];
const INDIA_CITIES: [string, string][] = [
    ["Mumbai", "India"],
    ["Bengaluru", "India"],
    ["Delhi", "India"],
    ["Pune", "India"],
    ["Hyderabad", "India"],
];
/** ISO-3166 codes for `BadgeWithFlag`/`FlagTypes` — covers every country `INDIA_CITIES` and
 * `GLOBAL_CITIES` can produce. Centralized here (rather than per-page) since both the deals list
 * row flag and the deal-detail header badge need to render the same country's flag. */
export const COUNTRY_FLAG: Record<string, FlagTypes> = {
    India: "IN",
    UAE: "AE",
    Singapore: "SG",
    UK: "GB",
    Canada: "CA",
    Australia: "AU",
    Nigeria: "NG",
};
const GLOBAL_CITIES: [string, string][] = [
    ["Dubai", "UAE"],
    ["Singapore", "Singapore"],
    ["London", "UK"],
    ["Toronto", "Canada"],
    ["Sydney", "Australia"],
    ["Lagos", "Nigeria"],
];
const SOP_SOURCES = ["Instagram ad", "LinkedIn post", "Google search", "referral from a friend", "YouTube review", "Novatr blog"];
const TOOLS = ["AutoCAD, Revit", "Rhinoceros 3D, Grasshopper", "Revit, Navisworks", "AutoCAD only", "Rhino, AutoCAD"];
const ENGLISH_LEVELS = ["Fluent", "Advanced", "Intermediate"];
const QUALIFICATIONS = ["B.Arch", "M.Arch", "B.E. Civil", "B.Tech Civil", "Diploma in Architecture"];
const CURRENT_ROLES = ["Junior Architect", "Design Engineer", "Site Engineer", "Architecture Intern", "Freelance Designer"];
const EXPERIENCE_BANDS = ["0–1 years", "1–3 years", "3–5 years", "5+ years"];
const INCOME_BANDS = ["₹3–5 LPA", "₹5–8 LPA", "₹8–12 LPA", "Not disclosed"];
/** State/province shown in the Application Details slide-over's Basic Information group —
 * only meaningful for the Indian cities `INDIA_CITIES` includes; international cities fall back to
 * their city name (there's no single "state" concept to derive for them). */
const CITY_STATE: Record<string, string> = { Mumbai: "Maharashtra", Bengaluru: "Karnataka", Delhi: "Delhi", Pune: "Maharashtra", Hyderabad: "Telangana" };
export function stateForCity(city: string): string {
    return CITY_STATE[city] ?? city;
}
const PERCENTAGE_BANDS = ["60% – 69%", "70% – 79%", "80% – 89%", "90% – 100%"];
const BIM_KNOWLEDGE_ANSWERS = [
    "Don't know anything about BIM but I heard that it will have a good future.",
    "Have used AutoCAD for a couple of years, but never touched a BIM workflow.",
    "Some exposure through college projects, nothing hands-on in a real job yet.",
    "Aware of the concept from client conversations, want to actually learn the tools.",
];
const WHY_LEARN_ANSWERS = [
    "I want to grow my career and learn tech-first skills like BIM modelling.",
    "My firm is moving to BIM workflows and I don't want to be left behind.",
    "Looking to switch from a purely drafting role into something more technical.",
    "Freelance clients keep asking for BIM deliverables and I keep saying no.",
];
const WITHDRAW_REASONS = [
    "Learner asked for a lower EMI tenure",
    "Discount needed revising after a scholarship review",
    "Learner requested a different installment schedule",
    "Wrong course fee slab applied at creation",
];

// ---------------------------------------------------------------------------
// Deal / installment / activity-log shapes
// ---------------------------------------------------------------------------

export type Currency = "INR" | "USD";
export type InstallmentMode = "Razorpay" | "Manual" | "EMI_3P" | "Stripe" | "Stripe EMI";
export type InstallmentStatus = "Paid" | "Unpaid" | "Overdue";

export type Installment = {
    label: string;
    amount: number;
    mode: InstallmentMode;
    isEmi: boolean;
    emiMonths: number | null;
    // TODO(manik): `emiInterest` is tracked separately and deliberately never folded into
    // `amount` — an EMI row's Amount Left / revenue contribution is its principal only, interest
    // is never OMS revenue. Confirmed default (2026-09-05 brief §9/§13.4).
    emiInterest: number | null;
    /** ISO date (yyyy-mm-dd) — "Start date" in the UI when the installment is EMI. */
    deadline: string;
    status: InstallmentStatus;
    /** When this installment was actually paid — distinct from when the deal was booked, and
     * what makes revenue realisable *within a period* rather than always tied to booking date. */
    paidOn: Date | null;
};

export type ActivityLogEntry = { ts: Date; text: string; reason?: string | null };

/** Extra fields decorating the application-details slide-over — generated once, stably, from
 * the deal's own id (so re-opening the slide-over always shows the same values). */
export type ApplicationDetails = {
    role: string;
    experience: string;
    tools: string;
    englishLevel: string;
    incomeBand: string;
    qualification: string;
    percentageCgpa: string;
    linkedin: string;
    bimKnowledge: string;
    whyLearn: string;
};

export type DiscountLineItem = { label: string; amount: number };

/** How `discount` breaks down into the line items the Payment Plan section itemizes — `upfront`
 * is the automatic Upfront-payment-type discount, `items` is every other tier actually applied
 * (multiple can stack: Early Bird + Merit + a Custom BDR amount, any combination). Always sums
 * back to the parent deal's `discount`. */
export type DiscountBreakdown = {
    upfront: number;
    items: DiscountLineItem[];
};

// ---------------------------------------------------------------------------
// Payment Plan / Offer Letter state machines (2026-09-05 brief §2).
// ---------------------------------------------------------------------------

export type PlanState = "none" | "draft_incomplete" | "draft_ready" | "awaiting_approval" | "committed" | "active";
export type OfferState = "none" | "created" | "shared" | "expired" | "accepted" | "withdrawn";

/** A frozen read of the plan's money shape — taken when a letter is created (so staleness can
 * be detected before it's ever shared) and again whenever it's refreshed. Once the letter is
 * shared, this is what it renders from — never the live plan. */
export type PlanSnapshot = {
    netPayable: number;
    discount: number;
    installments: { amount: number; mode: InstallmentMode; deadline: string; emiMonths: number | null }[];
};

export type PlanFields = {
    state: PlanState;
    createdOn: Date | null;
    committedOn: Date | null;
    activatedOn: Date | null;
    approval: { state: "n/a" | "pending" | "approved" | "rejected"; reason: string | null; decidedOn: Date | null };
};

export type OfferFields = {
    state: OfferState;
    template: OfferTemplate | null;
    deadline: string | null;
    version: number;
    createdOn: Date | null;
    sharedOn: Date | null;
    resendCount: number;
    snapshot: PlanSnapshot | null;
};

export type OfferHistoryEntry = {
    version: number;
    template: string;
    sharedOn: Date;
    endedOn: Date;
    endedBy: "withdrawn" | "expired" | "superseded";
    reason: string | null;
};

export type BookingFields = { bookedOn: Date | null; bookedValue: number };

/** Tracks the application-form link separately from the deal's status — `APP_NEW` (assigned,
 * not sent) and `APP_PENDING` (sent, awaiting the learner) used to be the same status with no
 * record of when — or whether — the link actually went out. */
export type ApplicationFields = { sentOn: Date | null; resendCount: number };

export type GuardResult = { allowed: boolean; reason?: string };

/** BDR owes sending the application form — the deal is brand new, nothing sent yet. */
export function canSendApplication(d: Deal): GuardResult {
    if (d.status.id !== "APP_NEW") return { allowed: false, reason: "Application form already sent" };
    return { allowed: true };
}

/** Resend the same, already-sent application link — available while it's still pending or
 * has expired unfilled; not once the learner has actually filled it. */
export function canResendApplication(d: Deal): GuardResult {
    if (!d.application.sentOn) return { allowed: false, reason: "Application form hasn't been sent yet" };
    if (d.status.id !== "APP_PENDING" && d.status.id !== "APP_EXPIRED") return { allowed: false, reason: "Application has already moved past pending" };
    return { allowed: true };
}

/** A stable, fabricated application-form link — this prototype has no real form host. */
export function applicationFormUrl(d: Deal): string {
    return `https://apply.novatr.com/a/${d.applicationId}`;
}

/** A stable, fabricated payment-collection link — mirrors `applicationFormUrl`, no real payment
 * host behind it either. */
export function paymentPlanUrl(d: Deal): string {
    return `https://payment.novatr.com/a/${d.applicationId}`;
}

/** BDR owes a payment plan. */
export function canCreatePlan(d: Deal): GuardResult {
    if (d.plan.state !== "none") return { allowed: false, reason: "A payment plan already exists" };
    if (d.status.id !== "APP_FILLED" && d.status.id !== "PLAN_NOT_STARTED") return { allowed: false, reason: "Application hasn't been filled yet" };
    return { allowed: true };
}

/** Editable in place while draft; read-only (with a reason naming the lock tier) after. */
export function canEditPlan(d: Deal): GuardResult {
    if (d.plan.state === "draft_incomplete" || d.plan.state === "draft_ready") return { allowed: true };
    if (d.plan.state === "none") return { allowed: false, reason: "Create a payment plan first" };
    if (d.plan.state === "awaiting_approval") return { allowed: false, reason: "Plan is with Sales Ops for approval" };
    if (d.plan.state === "committed") return { allowed: false, reason: "Locked — an offer has been shared" };
    return { allowed: false, reason: "Locked — this deal has been paid" }; // active
}

/** Amount Left must be settled — Amount Left ≠ 0 no longer blocks saving the plan, only this. */
export function canCreateLetter(d: Deal): GuardResult {
    // `awaiting_approval` still permits letter creation (the brief's own acceptance check) — the
    // plan was already draft_ready (Amount Left settled) before an EMI row froze it for Sales
    // Ops; sharing, not creating, is what that approval actually gates.
    if (d.plan.state === "draft_ready" || d.plan.state === "awaiting_approval") return { allowed: true };
    if (d.plan.state === "draft_incomplete") return { allowed: false, reason: "Amount Left must be zero before creating a letter" };
    return { allowed: false, reason: "Create a payment plan first" };
}

/** The fee lock moves here — sharing commits the plan and freezes the letter's snapshot. */
export function canShareLetter(d: Deal): GuardResult {
    if (d.plan.state === "awaiting_approval") return { allowed: false, reason: "Plan is with Sales Ops for approval" };
    if (d.offer.state !== "created") return { allowed: false, reason: "Create an offer letter first" };
    return { allowed: true };
}

/** Revenue-neutral unlock. Blocked the moment a payment lands — via the guard, not by hiding
 * the button (§10 acceptance check). */
export function canWithdraw(d: Deal): GuardResult {
    if (d.offer.state !== "shared" && d.offer.state !== "accepted") return { allowed: false, reason: "No shared offer to withdraw" };
    if (d.installments.some((i) => i.status === "Paid")) return { allowed: false, reason: "Can't withdraw — a payment has already been received" };
    return { allowed: true };
}

/** Same lock as `canWithdraw` — once a payment has landed, the letter that was shared is what
 * the learner paid against, so resending (which bumps the resend count as if renotifying them of
 * unchanged terms) is blocked rather than left as a no-op-looking button. */
export function canResendLetter(d: Deal): GuardResult {
    if (d.offer.state !== "shared" && d.offer.state !== "accepted") return { allowed: false, reason: "No shared offer to resend" };
    if (d.installments.some((i) => i.status === "Paid")) return { allowed: false, reason: "Can't resend — a payment has already been received" };
    return { allowed: true };
}

export function planSnapshot(d: Deal): PlanSnapshot {
    return {
        netPayable: d.netPayable,
        discount: d.discount,
        installments: d.installments.map((i) => ({ amount: i.amount, mode: i.mode, deadline: i.deadline, emiMonths: i.emiMonths })),
    };
}


export type Deal = {
    id: string;
    applicationId: string;
    name: string;
    email: string;
    phone: string;
    course: Course;
    currency: "INR" | "USD";
    courseFee: number;
    discount: number;
    /** Cosmetic — derived stably from `id` + `discount`, not part of the reconciliation model
     * below. */
    discountBreakdown: DiscountBreakdown;
    netPayable: number;
    installments: Installment[];
    application: ApplicationFields;
    plan: PlanFields;
    offer: OfferFields;
    /** Past offer versions, pushed when a withdrawal or a new version supersedes them. */
    offerHistory: OfferHistoryEntry[];
    /** Triggered by the learner's first payment (a part payment counts); books the deal's full
     * Net Payable. Never reverses in this prototype (`// TODO(manik)` at the seam below) — a
     * cancelled enrolment currently leaves booked revenue standing permanently. */
    booking: BookingFields;
    status: DealStatus;
    createdOn: Date;
    lastUpdate: Date;
    bdrId: string;
    tlId: string | null;
    tmId: string | null;
    cohort: string;
    city: string;
    country: string;
    /** Cosmetic — derived stably from `id`, not part of the reconciliation model below. */
    postalCode: string;
    intlFlag: boolean;
    sopSource: string;
    reachedStage: ReachedStage;
    activityLog: ActivityLogEntry[];
    applicationDetails: ApplicationDetails;
};

// ---------------------------------------------------------------------------
// Generation — one deterministic seeded RNG for the whole roster, so reload
// always produces the identical roster (never `Math.random()` — per-render
// randomness is the exact bug this codebase already fixed once).
// ---------------------------------------------------------------------------

const rand = seededRandom(770101);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

function hashId(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h);
}
function pickStable<T>(id: string, arr: T[]): T {
    return arr[hashId(id) % arr.length];
}

function daysInMonth(year: number, monthIndex0: number): number {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

function genName(): string {
    return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

/** Local calendar date, not `toISOString().slice(0, 10)` — that converts through UTC first,
 * which silently shifts every date back a day in any positive-UTC-offset timezone (e.g. IST)
 * since local midnight is the previous day in UTC. Surfaced by the Payment Due/Overdue boundary
 * check landing exactly one day off from what `PROTOTYPE_TODAY`'s local calendar day intended. */
function toISODate(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

const bdrWeights = bdrs.map((b) => b.weight);

/** A ready-to-append deal, minus fields resolved once every deal's final status is known
 * (installments, plan/offer/offerHistory/booking, reachedStage, activityLog) — kept internal to
 * generation. Sub-status relabeling (`assignSubStatuses`) happens on this shape precisely so
 * those lifecycle fields are always derived from the deal's *final* status, never a
 * pre-relabel placeholder. */
type DraftDeal = Omit<Deal, "reachedStage" | "activityLog" | "installments" | "application" | "plan" | "offer" | "offerHistory" | "booking">;

let dealSeq = 0;
let applicationSeq = 0;

function buildBaseDeal(bdr: OrgBdr, month: MonthGroundTruth, statusId: DealStatusId): DraftDeal {
    dealSeq += 1;
    applicationSeq += 3;

    const tl = teamLeads.find((t) => t.id === bdr.tlId) ?? null;
    const tm = teamManagers.find((t) => t.id === bdr.tmId) ?? null;

    const course = pick(COURSES);
    const status = STATUS[statusId];

    const totalDays = daysInMonth(month.year, month.month);
    const isCurrentMonth = month === MONTHS[MONTHS.length - 1];
    const lastDay = isCurrentMonth ? PROTOTYPE_TODAY.getDate() : totalDays;
    const createdOn = new Date(month.year, month.month, int(1, lastDay));
    const lastUpdateDayOffset = int(0, 20);
    const lastUpdateMs = Math.min(PROTOTYPE_TODAY.getTime(), createdOn.getTime() + lastUpdateDayOffset * 86_400_000);
    const lastUpdate = new Date(lastUpdateMs);

    // 15% of deals are global (outside India) and priced in USD; the remaining 85% are based
    // in India and priced in INR. Currency and city/country are derived from the same draw so
    // they never disagree (e.g. an "India" deal billed in USD).
    const isGlobal = rand() < 0.15;
    const currency: "INR" | "USD" = isGlobal ? "USD" : "INR";
    const courseFee = currency === "INR" ? pick([185_000, 210_000, 245_000, 275_000]) : pick([2400, 2800, 3200]);
    const discountPct = int(0, 20);
    const discount = Math.round(courseFee * (discountPct / 100));
    const netPayable = courseFee - discount;
    const [city, country] = isGlobal ? pick(GLOBAL_CITIES) : pick(INDIA_CITIES);

    const id = `DL-${2100 + dealSeq}`;
    const name = genName();
    const postalCode = country === "India" ? String(100_000 + (hashId(id) % 900_000)) : String(10_000 + (hashId(id) % 90_000));

    // Split the single `discount` total into the three line items the Payment Plan section
    // itemizes. `bdr` is always the remainder (never independently rounded), so the three
    // always sum back to exactly `discount`.
    const upfrontFraction = pickStable(`${id}du`, [0.5, 0.6, 0.7, 0.8, 1]);
    const upfront = Math.round(discount * upfrontFraction);
    const remainingAfterUpfront = discount - upfront;
    const scholarshipFraction = pickStable(`${id}ds`, [0, 0, 0, 0.3, 0.5]);
    const scholarship = Math.round(remainingAfterUpfront * scholarshipFraction);
    const bdrDiscount = remainingAfterUpfront - scholarship;
    const discountBreakdown: DiscountBreakdown = {
        upfront,
        items: [
            ...(scholarship > 0 ? [{ label: "Merit Scholarship", amount: scholarship }] : []),
            ...(bdrDiscount > 0 ? [{ label: "Custom BDR Discount", amount: bdrDiscount }] : []),
        ],
    };

    return {
        id,
        applicationId: `APP-${48000 + applicationSeq}`,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@${pick(["gmail.com", "outlook.com", "proton.me"])}`,
        phone: `+${pick(["91", "1", "44", "971", "65"])} ${int(700_000_000, 999_999_999)}`,
        course,
        currency,
        courseFee,
        discount,
        discountBreakdown,
        netPayable,
        status,
        createdOn,
        lastUpdate,
        bdrId: bdr.id,
        tlId: tl?.id ?? null,
        tmId: tm?.id ?? null,
        cohort: `${course.code}-${pick(["A", "B", "C"])}`,
        city,
        country,
        postalCode,
        intlFlag: country !== "India",
        sopSource: pick(SOP_SOURCES),
        applicationDetails: {
            role: pickStable(`${id}r`, CURRENT_ROLES),
            experience: pickStable(`${id}e`, EXPERIENCE_BANDS),
            tools: pickStable(`${id}t`, TOOLS),
            englishLevel: pickStable(`${id}l`, ENGLISH_LEVELS),
            incomeBand: pickStable(`${id}i`, INCOME_BANDS),
            qualification: pickStable(`${id}q`, QUALIFICATIONS),
            percentageCgpa: pickStable(`${id}p`, PERCENTAGE_BANDS),
            linkedin: `linkedin.com/in/${name.toLowerCase().replace(/\s+/g, "-")}`,
            bimKnowledge: pickStable(`${id}bk`, BIM_KNOWLEDGE_ANSWERS),
            whyLearn: pickStable(`${id}wl`, WHY_LEARN_ANSWERS),
        },
    };
}

/** Grace window between an installment's due date and its "last date" — past the due date but
 * still inside this window is merely Due, past the last date is Overdue. Shared with the
 * Payment Plan installment card (`payment-plan-shared.tsx`), which renders the same "Last Date"
 * from the same rule, so the deal-level Payment status always agrees with what that card shows. */
export const PAYMENT_GRACE_DAYS = 4;

/** Classifies a single unpaid installment's deadline against `PROTOTYPE_TODAY` using the same
 * due-date/last-date rule as the installment card. Paid installments are never "Overdue" here —
 * callers check `paidOn`/`paidFlag` first. */
function isInstallmentOverdue(deadline: string): boolean {
    const dueOn = new Date(`${deadline}T00:00:00`);
    const lastDate = new Date(dueOn.getTime() + PAYMENT_GRACE_DAYS * 86_400_000);
    return PROTOTYPE_TODAY >= lastDate;
}

function buildInstallments(statusId: DealStatusId, currency: "INR" | "USD", netPayable: number, createdOn: Date): Installment[] {
    const gatewayMode: InstallmentMode = currency === "INR" ? pick(["Razorpay", "Manual"]) : "Stripe";
    const emiMode: InstallmentMode = currency === "INR" ? "EMI_3P" : "Stripe EMI";
    const roundTo = currency === "INR" ? 100 : 10;

    // A Due/Overdue deal needs a genuine unpaid trailing installment to hang that status off —
    // "first payment made" (every Payment-stage status) means a single-installment plan is
    // already fully paid, so these two statuses always force a part-payment plan.
    const needsUnpaidTail = statusId === "PAY_DUE" || statusId === "PAY_OVERDUE";

    // Deal-level payment type (not a per-installment coin-flip like this used to be — that let
    // EMI_3P land on ~1/3 of individual installments, making most deals read as "EMI 3rd Party"
    // regardless of how the plan was actually structured). Target mix, per Manik: ~65% Part
    // Payment (35% of that on a 3-month plan, 65% on a 6-month plan), ~30% Upfront, ~5% EMI 3rd
    // Party — see `paymentTypeLabel` in payment-plan-shared.tsx for how a deal's installments
    // resolve back into this label.
    const roll = rand();
    let paymentType: "emi" | "upfront" | "part3" | "part6" = roll < 0.05 ? "emi" : roll < 0.35 ? "upfront" : rand() < 0.35 ? "part3" : "part6";
    // Upfront/EMI's single-installment shape can't carry a genuine unpaid trailing row — fall
    // back to a part-payment plan for those regardless of the roll, so the 65/30/5 mix describes
    // the population overall, not each individual status bucket.
    if (needsUnpaidTail && paymentType !== "part3" && paymentType !== "part6") paymentType = rand() < 0.35 ? "part3" : "part6";

    const isEmiType = paymentType === "emi";
    const months = paymentType === "part3" ? 3 : paymentType === "part6" ? 6 : 0;
    const mode = isEmiType ? emiMode : gatewayMode;

    // Downpayment is a fixed 15% of Net Payable, remainder split evenly across the tenure, final
    // installment absorbing the rounding remainder — mirrors `buildPartPaymentInstallments` in
    // payment-plan-editor.tsx so a seeded plan looks like one a BDR could have built by hand.
    const rows: { label: string; amount: number }[] = [];
    if (months > 0) {
        const downpayment = Math.round((netPayable * 0.15) / roundTo) * roundTo;
        const per = Math.round((netPayable - downpayment) / months / roundTo) * roundTo;
        rows.push({ label: "Downpayment", amount: downpayment });
        let assigned = downpayment;
        for (let i = 0; i < months; i++) {
            const amount = i === months - 1 ? netPayable - assigned : per;
            assigned += amount;
            rows.push({ label: `Installment ${i + 1}`, amount });
        }
    } else {
        rows.push({ label: isEmiType ? "Full Payment" : "Full payment", amount: netPayable });
    }
    const count = rows.length;

    // ENR_CANCELLED deals were fully paid before the enrolment was cancelled on the backend (a
    // post-clearance event, not a payment-stage one) — same paid shape as PAY_COMPLETED.
    const allPaid = statusId === "PAY_COMPLETED" || statusId === "ENR_CANCELLED";
    const isPaymentActive = statusId === "PAY_ONGOING" || statusId === "PAY_DUE" || statusId === "PAY_OVERDUE";
    // The installment right after the paid down payment (or the sole installment, if there's
    // only one) drives the deal's Ongoing/Due/Overdue split — every other unpaid row sits safely
    // in the future so it never outranks the intended status.
    const drivingIndex = isPaymentActive ? (count > 1 ? 1 : 0) : -1;

    const installments: Installment[] = [];
    for (let k = 0; k < count; k++) {
        const paidFlag = allPaid || (isPaymentActive && k === 0);

        // Capped at 30 days regardless of how long ago the deal was created — otherwise an early
        // deal's first-payment date gets drawn from a uniform range spanning its entire lifetime
        // (months, for anything created back in Q1), smearing most of its booking probability
        // mass forward into later months instead of shortly after its own creation. That was
        // making a period's booked chart look empty right at the start of the window and only
        // pick up well after it — payment should land soon after creation, same fast-pipeline
        // assumption `lastUpdateDayOffset` above already makes.
        const daysSinceCreated = Math.max(1, Math.round((PROTOTYPE_TODAY.getTime() - createdOn.getTime()) / 86_400_000));
        const maxDaysToFirstPayment = Math.min(daysSinceCreated, 30);
        let paidOn: Date | null = paidFlag ? new Date(createdOn.getTime() + int(1, maxDaysToFirstPayment) * 86_400_000) : null;
        if (paidOn && paidOn > PROTOTYPE_TODAY) paidOn = PROTOTYPE_TODAY;

        // Day offset (relative to today) for this installment's due date — the driving row is
        // biased into the window matching the deal's target sub-status, everything else lands
        // safely in the future.
        let dayOffset = int(5, 30);
        if (!paidFlag && k === drivingIndex) {
            if (statusId === "PAY_DUE") dayOffset = -int(0, PAYMENT_GRACE_DAYS - 1);
            else if (statusId === "PAY_OVERDUE") dayOffset = -int(PAYMENT_GRACE_DAYS, PAYMENT_GRACE_DAYS + 25);
            else dayOffset = int(1, 30);
        }
        const deadlineDate = new Date(PROTOTYPE_TODAY.getTime() + dayOffset * 86_400_000);
        const deadline = toISODate(deadlineDate);

        installments.push({
            label: rows[k].label,
            amount: rows[k].amount,
            mode,
            isEmi: isEmiType,
            emiMonths: isEmiType ? pick([3, 6, 12]) : null,
            emiInterest: isEmiType ? pick([180, 340, 620]) : null,
            deadline,
            status: paidFlag ? "Paid" : isInstallmentOverdue(deadline) ? "Overdue" : "Unpaid",
            paidOn,
        });
    }
    return installments;
}

function emptyPlan(): PlanFields {
    return { state: "none", createdOn: null, committedOn: null, activatedOn: null, approval: { state: "n/a", reason: null, decidedOn: null } };
}
function emptyOffer(): OfferFields {
    return { state: "none", template: null, deadline: null, version: 0, createdOn: null, sharedOn: null, resendCount: 0, snapshot: null };
}
function emptyBooking(): BookingFields {
    return { bookedOn: null, bookedValue: 0 };
}
function takeSnapshot(discount: number, netPayable: number, installments: Installment[]): PlanSnapshot {
    return { netPayable, discount, installments: installments.map((i) => ({ amount: i.amount, mode: i.mode, deadline: i.deadline, emiMonths: i.emiMonths })) };
}
function earliestPaidOn(installments: Installment[]): Date | null {
    const paid = installments.map((i) => i.paidOn).filter((d): d is Date => d !== null);
    if (!paid.length) return null;
    return paid.reduce((min, d) => (d < min ? d : min));
}
// TODO(manik): Booked value = Net Payable (post-discount), not gross Course Fee — confirmed
// default (2026-09-05 brief §9/§13.1).
/** // TODO(manik): booking never reverses — a cancelled enrolment (ENR_CANCELLED) leaves booked
 * revenue standing forever. Confirmed as the default for this prototype; almost certainly wrong
 * for the real product. */
function bookingFor(installments: Installment[], netPayable: number): BookingFields {
    const bookedOn = earliestPaidOn(installments);
    return { bookedOn, bookedValue: bookedOn ? netPayable : 0 };
}

type Lifecycle = Pick<Deal, "installments" | "plan" | "offer" | "offerHistory" | "booking">;

/** Derives `installments`/`plan`/`offer`/`offerHistory`/`booking` from a deal's *final* status —
 * run once every deal in a batch has its real (possibly relabeled) status, so these fields are
 * never built against a pre-relabel placeholder status. Builds the installments plan lazily
 * (`complete()`) since most statuses (APP_PENDING and the Global ones) never need one. */
function buildLifecycle(id: string, statusId: DealStatusId, currency: "INR" | "USD", discount: number, netPayable: number, createdOn: Date): Lifecycle {
    let cached: Installment[] | null = null;
    const complete = () => cached ?? (cached = buildInstallments(statusId, currency, netPayable, createdOn));
    const template = () => pickStable(`${id}ot`, OFFER_TEMPLATES);
    const offerDeadline = (days: number) => toISODate(new Date(createdOn.getTime() + days * 86_400_000));

    switch (statusId) {
        case "PLAN_NOT_STARTED":
        case "APP_FILLED":
            return { installments: [], plan: emptyPlan(), offer: emptyOffer(), offerHistory: [], booking: emptyBooking() };

        case "PLAN_DRAFT": {
            // Amount Left ≠ 0 (still being built) or settled with no letter drafted yet. Nothing
            // seeds a deal mid-way through "letter drafted but not shared" — creating an offer
            // is never a standalone, savable-for-later action (there's no Save Offer path
            // anymore), so every seeded deal past this point has its offer already shared.
            const variant = pickStable(`${id}pv`, ["incomplete", "incomplete", "ready", "ready"] as const);
            const full = complete();

            if (variant === "incomplete") {
                // Amount Left ≠ 0 — a genuinely half-built plan (§3.4 seed list). Drop the last
                // row (or shrink the only row) so the installments no longer sum to Net Payable.
                const installments = full.length > 1 ? full.slice(0, -1) : [{ ...full[0], amount: Math.round(full[0].amount * 0.6) }];
                return {
                    installments,
                    plan: { ...emptyPlan(), state: "draft_incomplete", createdOn },
                    offer: emptyOffer(),
                    offerHistory: [],
                    booking: emptyBooking(),
                };
            }

            // ready
            const plan: PlanFields = { ...emptyPlan(), state: "draft_ready", createdOn };
            return { installments: full, plan, offer: emptyOffer(), offerHistory: [], booking: emptyBooking() };
        }

        case "PLAN_AWAITING_APPROVAL": {
            // The plan was draft_ready (Amount Left settled) and a letter already created off
            // it, then an EMI row got submitted for Sales Ops re-approval, freezing the plan —
            // letter creatable-in-the-past, not currently shareable (§7/§10).
            const full = complete();
            const plan: PlanFields = {
                state: "awaiting_approval",
                createdOn,
                committedOn: null,
                activatedOn: null,
                approval: { state: "pending", reason: null, decidedOn: null },
            };
            const offer: OfferFields = {
                state: "created",
                template: template(),
                deadline: offerDeadline(7),
                version: 1,
                createdOn,
                sharedOn: null,
                resendCount: 0,
                snapshot: takeSnapshot(discount, netPayable, full),
            };
            return { installments: full, plan, offer, offerHistory: [], booking: emptyBooking() };
        }

        case "OFFER_PENDING": {
            const full = complete();
            const sharedOn = createdOn;
            const plan: PlanFields = {
                state: "committed",
                createdOn,
                committedOn: sharedOn,
                activatedOn: null,
                approval: { state: "n/a", reason: null, decidedOn: null },
            };
            const offer: OfferFields = {
                state: "shared",
                template: template(),
                deadline: toISODate(new Date(PROTOTYPE_TODAY.getTime() + int(-3, 10) * 86_400_000)),
                version: 1,
                createdOn,
                sharedOn,
                resendCount: pickStable(`${id}rc`, [0, 0, 0, 1]),
                snapshot: takeSnapshot(discount, netPayable, full),
            };
            return { installments: full, plan, offer, offerHistory: [], booking: emptyBooking() };
        }

        case "OFFER_EXPIRED": {
            const full = complete();
            const sharedOn = createdOn;
            // Reopened per the row-action table (§6): an expired offer's plan returns to
            // draft_ready so "Create offer letter (v2)" (canCreateLetter) is available.
            const plan: PlanFields = {
                state: "draft_ready",
                createdOn,
                committedOn: sharedOn,
                activatedOn: null,
                approval: { state: "n/a", reason: null, decidedOn: null },
            };
            const offer: OfferFields = {
                state: "expired",
                template: template(),
                deadline: offerDeadline(7),
                version: 1,
                createdOn,
                sharedOn,
                resendCount: 0,
                snapshot: takeSnapshot(discount, netPayable, full),
            };
            return { installments: full, plan, offer, offerHistory: [], booking: emptyBooking() };
        }

        case "OFFER_WITHDRAWN": {
            const full = complete();
            const sharedOn = createdOn;
            const endedOn = new Date(createdOn.getTime() + int(2, 10) * 86_400_000);
            const t = template();
            const plan: PlanFields = {
                state: "draft_ready",
                createdOn,
                committedOn: sharedOn,
                activatedOn: null,
                approval: { state: "n/a", reason: null, decidedOn: null },
            };
            const offer: OfferFields = {
                state: "withdrawn",
                template: t,
                deadline: null,
                version: 1,
                createdOn,
                sharedOn,
                resendCount: 0,
                snapshot: takeSnapshot(discount, netPayable, full),
            };
            const offerHistory: OfferHistoryEntry[] = [
                { version: 1, template: t.name, sharedOn, endedOn, endedBy: "withdrawn", reason: pickStable(`${id}wr`, WITHDRAW_REASONS) },
            ];
            return { installments: full, plan, offer, offerHistory, booking: emptyBooking() };
        }

        case "OFFER_ACCEPTED": {
            // Accepted, no payment yet — withdrawable, and worth nothing in booked revenue
            // until the first payment lands (§10 acceptance check).
            const full = complete();
            const sharedOn = createdOn;
            const plan: PlanFields = {
                state: "committed",
                createdOn,
                committedOn: sharedOn,
                activatedOn: null,
                approval: { state: "n/a", reason: null, decidedOn: null },
            };
            const offer: OfferFields = {
                state: "accepted",
                template: template(),
                // Kept, not cleared — the acceptance window closing isn't the same as it never
                // having existed; "Deadline" (Section 03) and the letter preview both still read
                // it after acceptance.
                deadline: offerDeadline(7),
                version: 1,
                createdOn,
                sharedOn,
                resendCount: 0,
                snapshot: takeSnapshot(discount, netPayable, full),
            };
            return { installments: full, plan, offer, offerHistory: [], booking: emptyBooking() };
        }

        case "PAY_ONGOING":
        case "PAY_DUE":
        case "PAY_OVERDUE":
        case "PAY_COMPLETED":
        case "ENR_CANCELLED": {
            const full = complete();
            const sharedOn = createdOn;
            const plan: PlanFields = {
                state: "active",
                createdOn,
                committedOn: sharedOn,
                activatedOn: earliestPaidOn(full),
                approval: { state: "n/a", reason: null, decidedOn: null },
            };
            const offer: OfferFields = {
                state: "accepted",
                template: template(),
                // Kept, not cleared — see the OFFER_ACCEPTED case above.
                deadline: offerDeadline(7),
                version: 1,
                createdOn,
                sharedOn,
                resendCount: 0,
                snapshot: takeSnapshot(discount, netPayable, full),
            };
            return { installments: full, plan, offer, offerHistory: [], booking: bookingFor(full, netPayable) };
        }

        default:
            // APP_PENDING, APP_EXPIRED, and the Global statuses (NOT_INTERESTED/REJECTED/SAVED)
            // never have a plan — matches the original `hasPlan` predicate's exclusions.
            return { installments: [], plan: emptyPlan(), offer: emptyOffer(), offerHistory: [], booking: emptyBooking() };
    }
}

/** Splits a month-level bucket count into a small number of sub-statuses, then hands out those
 * exact totals across an already-generated set of draft deals via a seeded shuffle — so the
 * bucket's own BDR-level split (already exact, from `splitByWeights`) is untouched, and the
 * sub-status split is exact at the month level (the level the brief's decorative-field framing
 * actually cares about), without needing to fan the split down through every individual BDR. */
function assignSubStatuses(deals: DraftDeal[], statusIds: DealStatusId[], weights: number[]): DraftDeal[] {
    const counts = splitByWeights(deals.length, weights, true);
    const shuffled = [...deals];
    // Fisher–Yates, seeded — deterministic across reloads.
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let cursor = 0;
    const result: DraftDeal[] = [];
    statusIds.forEach((statusId, idx) => {
        const slice = shuffled.slice(cursor, cursor + counts[idx]);
        cursor += counts[idx];
        for (const draft of slice) {
            result.push({ ...draft, status: STATUS[statusId] });
        }
    });
    return result;
}

function generateAllDeals(): Deal[] {
    const draftsByMonth: DraftDeal[][] = [];
    // Pooled across every month rather than relabeled per month — the whole-dataset paymentStage
    // bucket is small enough (a handful of deals) that a per-month 50/20/30 split would round to
    // zero Due/Overdue almost everywhere; pooling first keeps the ratio real at the dataset level.
    const allPaymentStageDrafts: DraftDeal[] = [];

    for (const month of MONTHS) {
        const c: DealStageCascade = month.cascade;
        const monthDrafts: DraftDeal[] = [];

        // applicationStage → hasn't filled the application at all. Split between deals just
        // assigned (form not sent yet) and deals whose form is already out with the learner —
        // APP_PENDING used to be 100% of this bucket, silently assuming every assignment was
        // followed by an immediate, unmodeled send.
        const perBdrAppPending = splitByWeights(c.currentStage.applicationStage, bdrWeights, true);
        let appStageDrafts: DraftDeal[] = [];
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrAppPending[i]; n++) appStageDrafts.push(buildBaseDeal(bdr, month, "APP_PENDING"));
        });
        appStageDrafts = assignSubStatuses(appStageDrafts, ["APP_NEW", "APP_PENDING"], [70, 30]);
        monthDrafts.push(...appStageDrafts);

        // offerStage (= offers.pending + payments.dpNotPaid, by cascade construction) → the
        // "filled the application" population. Under the plan/offer separation, most of these
        // now stall at the new Plan-stage statuses before ever reaching an offer — carved out of
        // this same bucket (re-labeling, not additional volume) rather than out of the cascade
        // itself, so the roster still sums to `applicationsSent` (2026-09-05 brief §3.4).
        const perBdrOfferStage = splitByWeights(c.currentStage.offerStage, bdrWeights, true);
        let offerStageDrafts: DraftDeal[] = [];
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrOfferStage[i]; n++) offerStageDrafts.push(buildBaseDeal(bdr, month, "OFFER_PENDING"));
        });
        offerStageDrafts = assignSubStatuses(
            offerStageDrafts,
            ["PLAN_NOT_STARTED", "PLAN_DRAFT", "PLAN_AWAITING_APPROVAL", "OFFER_PENDING", "OFFER_ACCEPTED", "OFFER_WITHDRAWN"],
            [10, 25, 5, 35, 20, 5],
        );
        monthDrafts.push(...offerStageDrafts);

        // paymentStage (= payments.overdue) → later split across the Ongoing/Due/Overdue
        // installment states, pooled across all months (see `allPaymentStageDrafts` above) rather
        // than relabeled here. A relabeling of this bucket only — the Dashboard funnel's own
        // independent "payments.overdue" cascade number is untouched.
        const perBdrPaymentStage = splitByWeights(c.currentStage.paymentStage, bdrWeights, true);
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrPaymentStage[i]; n++) allPaymentStageDrafts.push(buildBaseDeal(bdr, month, "PAY_ONGOING"));
        });

        // paymentCompleted → PAY_COMPLETED, then relabel a subset as ENR_CANCELLED. This is a
        // relabeling, not additional volume — `clearance.enrolmentCancelled` is explicitly a
        // "decorative post-clearance event" in the cascade's own construction (dashboard-data.ts),
        // so it must not inflate `deals.length` past `applicationsSent`.
        const perBdrCompleted = splitByWeights(c.currentStage.paymentCompleted, bdrWeights, true);
        let completedDrafts: DraftDeal[] = [];
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrCompleted[i]; n++) completedDrafts.push(buildBaseDeal(bdr, month, "PAY_COMPLETED"));
        });
        const cancelledCount = Math.min(c.clearance.enrolmentCancelled, completedDrafts.length);
        if (cancelledCount > 0) {
            completedDrafts = assignSubStatuses(completedDrafts, ["PAY_COMPLETED", "ENR_CANCELLED"], [completedDrafts.length - cancelledCount, cancelledCount]);
        }
        monthDrafts.push(...completedDrafts);

        // expired → split ~60/40 APP_EXPIRED / OFFER_EXPIRED.
        const perBdrExpired = splitByWeights(c.currentStage.expired, bdrWeights, true);
        let expiredDrafts: DraftDeal[] = [];
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrExpired[i]; n++) expiredDrafts.push(buildBaseDeal(bdr, month, "APP_EXPIRED"));
        });
        expiredDrafts = assignSubStatuses(expiredDrafts, ["APP_EXPIRED", "OFFER_EXPIRED"], [60, 40]);
        monthDrafts.push(...expiredDrafts);

        // notInterested → split ~60/25/15 NOT_INTERESTED / REJECTED / SAVED.
        const perBdrNotInterested = splitByWeights(c.currentStage.notInterested, bdrWeights, true);
        let notInterestedDrafts: DraftDeal[] = [];
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrNotInterested[i]; n++) notInterestedDrafts.push(buildBaseDeal(bdr, month, "NOT_INTERESTED"));
        });
        notInterestedDrafts = assignSubStatuses(notInterestedDrafts, ["NOT_INTERESTED", "REJECTED", "SAVED"], [60, 25, 15]);
        monthDrafts.push(...notInterestedDrafts);

        draftsByMonth.push(monthDrafts);
    }

    const relabeledPaymentStageDrafts = assignSubStatuses(allPaymentStageDrafts, ["PAY_ONGOING", "PAY_DUE", "PAY_OVERDUE"], [50, 20, 30]);
    const allDrafts = [...draftsByMonth.flat(), ...relabeledPaymentStageDrafts];

    return allDrafts.map((draft) => {
        const lifecycle = buildLifecycle(draft.id, draft.status.id, draft.currency, draft.discount, draft.netPayable, draft.createdOn);
        const application = buildApplicationFields(draft.id, draft.status.id, draft.createdOn);
        const reachedStage = STAGE_RANK[draft.status.id] ?? (pick([0, 0, 1, 1, 2, 3]) as ReachedStage);
        const withoutLog: Omit<Deal, "activityLog"> = { ...draft, ...lifecycle, application, reachedStage };
        return { ...withoutLog, activityLog: buildActivityLog(withoutLog) };
    });
}

/** `APP_NEW` deals haven't had the application form sent yet — everything past that point
 * (including `APP_EXPIRED`, where the link *was* sent but lapsed unfilled) has a real send
 * timestamp shortly after the deal was created. */
function buildApplicationFields(id: string, statusId: DealStatusId, createdOn: Date): ApplicationFields {
    if (statusId === "APP_NEW") return { sentOn: null, resendCount: 0 };
    let sentOn = new Date(createdOn.getTime() + int(0, 2) * 86_400_000);
    if (sentOn > PROTOTYPE_TODAY) sentOn = PROTOTYPE_TODAY;
    const resendCount = pickStable(`${id}arc`, [0, 0, 0, 1]);
    return { sentOn, resendCount };
}

function buildActivityLog(d: Omit<Deal, "activityLog">): ActivityLogEntry[] {
    const log: ActivityLogEntry[] = [{ ts: d.createdOn, text: "Deal created", reason: "PDE completed on call" }];
    const daysAgo = (n: number) => new Date(PROTOTYPE_TODAY.getTime() - n * 86_400_000);

    if (d.application.sentOn) {
        log.push({ ts: d.application.sentOn, text: "Application form sent" });
    }
    if (d.application.resendCount > 0) {
        log.push({ ts: daysAgo(int(1, 20)), text: "Application form resent" });
    }
    if (d.status.id !== "APP_NEW" && d.status.id !== "APP_PENDING" && d.status.id !== "APP_EXPIRED") {
        // A learner can't fill a form they never opened — log "opened" a few days before
        // "filled" so the milestone rail's earlier substages read as done too, not stuck on
        // "Pending" underneath a later substage that's already complete.
        const filledOn = daysAgo(int(30, 90));
        log.push({ ts: new Date(filledOn.getTime() - int(1, 3) * 86_400_000), text: "Application form opened by learner" });
        log.push({ ts: filledOn, text: "Application filled by learner" });
    }
    if (d.plan.state !== "none") {
        log.push({ ts: d.plan.createdOn ?? daysAgo(int(20, 60)), text: "Payment plan created" });
    }
    if (d.plan.state === "awaiting_approval") {
        log.push({ ts: daysAgo(int(1, 15)), text: "Submitted for Sales Ops approval" });
    }
    if (d.offer.state !== "none") {
        log.push({
            ts: d.offer.createdOn ?? daysAgo(int(15, 45)),
            text: "Offer letter created",
            reason: d.offer.template ? `${d.offer.template.name} template` : undefined,
        });
    }
    if (d.offer.sharedOn) {
        log.push({ ts: d.offer.sharedOn, text: "Offer letter shared", reason: d.offer.template ? `${d.offer.template.name} template` : undefined });
    }
    if (d.offer.resendCount > 0) {
        log.push({ ts: daysAgo(int(1, 10)), text: "Offer letter resent" });
    }
    if (d.offer.state === "accepted" || d.status.stage === "Payment" || d.status.id === "ENR_CANCELLED") {
        // Same fix as "Application form opened" above — "opened" has to precede "accepted", and
        // (since it's an independently-seeded real field, not a daysAgo() pick) can't precede
        // "shared" either, so clamp to whichever is later.
        const acceptedOn = daysAgo(int(1, 30));
        const openedOn = new Date(Math.max(acceptedOn.getTime() - int(1, 3) * 86_400_000, (d.offer.sharedOn?.getTime() ?? -Infinity) + 1 * 86_400_000));
        log.push({ ts: openedOn < acceptedOn ? openedOn : new Date(acceptedOn.getTime() - 1), text: "Offer letter opened by learner" });
        log.push({ ts: acceptedOn, text: "Offer accepted by learner" });
    }
    for (const h of d.offerHistory) {
        if (h.endedBy === "withdrawn") log.push({ ts: h.endedOn, text: "Offer withdrawn", reason: h.reason ?? undefined });
    }
    if (d.status.stage === "Payment") {
        log.push({ ts: daysAgo(int(1, 20)), text: "Down payment received" });
    }
    if (d.status.id === "PAY_COMPLETED") {
        log.push({ ts: daysAgo(int(1, 5)), text: "Final installment received — payment completed" });
    }
    if (d.booking.bookedOn) {
        log.push({ ts: d.booking.bookedOn, text: "Deal booked", reason: `${d.currency === "INR" ? "₹" : "$"}${d.booking.bookedValue.toLocaleString()}` });
    }
    if (d.status.id === "NOT_INTERESTED") log.push({ ts: daysAgo(int(1, 10)), text: "Marked Not Interested", reason: "Deferring to next year's cohort" });
    if (d.status.id === "ENR_CANCELLED") log.push({ ts: daysAgo(int(1, 8)), text: "Enrolment cancelled", reason: "Backend cancellation" });
    if (rand() < 0.25 && d.installments.length) {
        log.push({ ts: daysAgo(int(0, 4)), text: "Payment due date extended", reason: "Learner requested 5 extra days for fund transfer" });
    }
    const assignedBdr = bdrs.find((b) => b.id === d.bdrId);
    if (assignedBdr) log.push({ ts: daysAgo(int(1, 80)), text: `Deal assigned to ${assignedBdr.name}`, reason: "Routine team allocation" });
    log.sort((a, b) => a.ts.getTime() - b.ts.getTime());
    return log;
}

export const DEALS: Deal[] = generateAllDeals();

// ---------------------------------------------------------------------------
// Scoping helpers — the whole rebuild thesis in three functions: one dataset,
// filtered by whoever is asking.
// ---------------------------------------------------------------------------

// Every helper below defaults its `deals` argument to the static, module-level `DEALS` (for
// call sites without a live roster, like the dev assertions), but accepts the `deals` array
// from `useDeals()` so callers reading through `DealsProvider`'s React state stay in sync with
// mutations (marking a deal Not Interested, sending an offer, etc.) instead of reading the
// generator's frozen initial snapshot.

export function dealsForPersona(persona: Persona, deals: Deal[] = DEALS): Deal[] {
    if (persona.role === "admin") return deals;
    if (persona.role === "tm") return deals.filter((d) => d.tmId === persona.tmId);
    if (persona.role === "tl") return deals.filter((d) => d.tlId === persona.tlId);
    return deals.filter((d) => d.bdrId === persona.bdrId); // bdr / atl
}

export function dealById(id: string, deals: Deal[] = DEALS): Deal | undefined {
    return deals.find((d) => d.id === id);
}

// ---------------------------------------------------------------------------
// Dev-time invariant checks — mirrors the pattern already established in
// dashboard-data.ts (no test runner in this scaffold yet).
// ---------------------------------------------------------------------------

if (import.meta.env.DEV) {
    const assert = (condition: boolean, message: string) => {
        if (!condition) console.error(`[deals-data invariant failed] ${message}`);
    };

    const lifetimeApplicationsSent = MONTHS.reduce((sum, m) => sum + m.cascade.applicationsSent, 0);
    assert(DEALS.length === lifetimeApplicationsSent, `deals.length (${DEALS.length}) !== lifetime applicationsSent (${lifetimeApplicationsSent})`);

    const knownBdrIds = new Set(bdrs.map((b) => b.id));
    assert(
        DEALS.every((d) => knownBdrIds.has(d.bdrId)),
        "every deal's bdrId must exist in bdrs",
    );

    assert(dealsForPersona({ role: "admin" }).length === DEALS.length, "admin persona must see every deal");

    for (const month of MONTHS) {
        const c = month.cascade;
        const monthDeals = DEALS.filter((d) => d.createdOn.getFullYear() === month.year && d.createdOn.getMonth() === month.month);
        const bucketSum =
            c.currentStage.applicationStage +
            c.currentStage.offerStage +
            c.currentStage.paymentStage +
            c.currentStage.paymentCompleted +
            c.currentStage.expired +
            c.currentStage.notInterested;
        assert(monthDeals.length === bucketSum, `month ${month.month + 1}: roster count (${monthDeals.length}) !== currentStage bucket sum (${bucketSum})`);
    }

    // Every Paid installment must have booked the deal, and every booked deal's bookedOn must be
    // its earliest Paid installment's paidOn (2026-09-05 brief §10 acceptance check).
    for (const d of DEALS) {
        const paidDates = d.installments.filter((i) => i.status === "Paid").map((i) => i.paidOn);
        if (paidDates.length === 0) {
            assert(d.booking.bookedOn === null, `${d.id}: no Paid installment but bookedOn is set`);
        } else {
            const earliest = paidDates.reduce((min, dt) => (dt! < min! ? dt : min));
            assert(d.booking.bookedOn?.getTime() === earliest?.getTime(), `${d.id}: bookedOn !== earliest paidOn`);
            assert(d.booking.bookedValue === d.netPayable, `${d.id}: bookedValue !== netPayable`);
        }
    }
}
