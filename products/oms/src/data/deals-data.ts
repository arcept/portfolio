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
 */

import type { Persona } from "@/types/role";
import type { DealStageCascade, MonthGroundTruth, OrgBdr } from "./dashboard-data";
import { MONTHS, PROTOTYPE_TODAY, bdrs, seededRandom, splitByWeights, teamLeads, teamManagers } from "./dashboard-data";

// ---------------------------------------------------------------------------
// Status model — ported verbatim from the prototype's `STATUS` object. Colour
// language and stage grouping are the product's own convention (blue = waiting
// on the learner, amber = timed out, green = progress, red = action/cancelled,
// gray = cross-cutting global status).
// ---------------------------------------------------------------------------

export type DealStatusId =
    | "APP_PENDING"
    | "APP_EXPIRED"
    | "APP_FILLED"
    | "OFFER_PENDING"
    | "OFFER_EXPIRED"
    | "OFFER_ACCEPTED"
    | "PAY_ONGOING"
    | "PAY_COMPLETED"
    | "ENR_CANCELLED"
    | "NOT_INTERESTED"
    | "REJECTED"
    | "SAVED";

export type DealStatus = {
    id: DealStatusId;
    stage: "Application" | "Offer" | "Payment" | "Enrolment" | "Global";
    label: string;
    color: "blue" | "amber" | "green" | "red" | "gray";
    /** True = the BDR owes an action (Application Filled, Offer Accepted) — rendered with the
     * red "Action needed" treatment, and what the Action Required tab filters on. */
    action: boolean;
    desc: string;
};

export const STATUS: Record<DealStatusId, DealStatus> = {
    APP_PENDING: { id: "APP_PENDING", stage: "Application", label: "Pending", color: "blue", action: false, desc: "Application sent, awaiting the learner" },
    APP_EXPIRED: { id: "APP_EXPIRED", stage: "Application", label: "Expired", color: "amber", action: false, desc: "Application link timed out" },
    APP_FILLED: { id: "APP_FILLED", stage: "Application", label: "Filled", color: "green", action: true, desc: "Learner filled it — offer not sent yet" },
    OFFER_PENDING: { id: "OFFER_PENDING", stage: "Offer", label: "Pending", color: "blue", action: false, desc: "Offer sent, awaiting the learner" },
    OFFER_EXPIRED: { id: "OFFER_EXPIRED", stage: "Offer", label: "Expired", color: "amber", action: false, desc: "Offer's acceptance window timed out" },
    OFFER_ACCEPTED: { id: "OFFER_ACCEPTED", stage: "Offer", label: "Accepted", color: "green", action: true, desc: "Accepted — no payment made yet" },
    PAY_ONGOING: { id: "PAY_ONGOING", stage: "Payment", label: "Ongoing", color: "green", action: false, desc: "First payment made, installments continuing" },
    PAY_COMPLETED: { id: "PAY_COMPLETED", stage: "Payment", label: "Completed", color: "green", action: false, desc: "All installments paid" },
    ENR_CANCELLED: { id: "ENR_CANCELLED", stage: "Enrolment", label: "Cancelled", color: "red", action: false, desc: "Enrolment was cancelled (backend action)" },
    NOT_INTERESTED: { id: "NOT_INTERESTED", stage: "Global", label: "Not Interested", color: "gray", action: false, desc: "Learner is no longer interested" },
    REJECTED: { id: "REJECTED", stage: "Global", label: "Rejected", color: "gray", action: false, desc: "Disqualified by the BDR" },
    SAVED: { id: "SAVED", stage: "Global", label: "Saved", color: "gray", action: false, desc: "Parked for a future sales cycle" },
};

/** Furthest funnel step reached — 0 Application / 1 Offer / 2 Payment ongoing / 3 Payment
 * cleared or cancelled. Lets a Not-Interested/Rejected/Saved deal bucket at where it actually
 * stalled, and is what the offer button's Send-vs-Revise label and section-completion checks
 * both read from. */
export type ReachedStage = 0 | 1 | 2 | 3;

const STAGE_RANK: Partial<Record<DealStatusId, ReachedStage>> = {
    APP_PENDING: 0,
    APP_EXPIRED: 0,
    APP_FILLED: 0,
    OFFER_PENDING: 1,
    OFFER_EXPIRED: 1,
    OFFER_ACCEPTED: 1,
    PAY_ONGOING: 2,
    PAY_COMPLETED: 3,
    ENR_CANCELLED: 3,
};

// ---------------------------------------------------------------------------
// Courses, offer templates, decoration pools — ported shapes from the
// prototype's data.js.
// ---------------------------------------------------------------------------

export type Course = { id: string; code: string; name: string; short: string };

export const COURSES: Course[] = [
    { id: "bim-arch", code: "BIM_C005", name: "BIM for Architects", short: "BIM · Architects" },
    { id: "bim-civil", code: "BIM_C009", name: "BIM for Civil Engineers", short: "BIM · Civil" },
    { id: "mcd", code: "MCD_C004", name: "Master in Computational Design", short: "MCD" },
];

export type OfferTemplate = { id: string; name: string; blurb: string };

export const OFFER_TEMPLATES: OfferTemplate[] = [
    { id: "early-bird", name: "Early Bird", blurb: "For learners who accept within the first 48 hours." },
    { id: "no-scholarship", name: "Without Scholarship", blurb: "Standard offer, no discount applied." },
    { id: "with-scholarship", name: "With Scholarship", blurb: "Includes the merit/need-based scholarship line." },
];

const FIRST_NAMES = [
    "Aarav", "Vivaan", "Diya", "Ishita", "Kabir", "Meher", "Sara", "Aryan", "Naina", "Reyansh",
    "Anaya", "Vihaan", "Myra", "Advika", "Rehan", "Trisha", "Dhruv", "Kiara", "Yash", "Alia",
    "James", "Olivia", "Daniel", "Sophia", "Lucas", "Amelia", "Noah", "Grace", "Ethan", "Chloe",
    "Marco", "Elena", "Hassan", "Layla", "Omar", "Fatima", "Chen", "Wei", "Mei", "Arjun",
];
const LAST_NAMES = [
    "Sharma", "Gupta", "Iyer", "Reddy", "Nair", "Kapoor", "Verma", "Chopra", "Bhatt", "Rao",
    "Malhotra", "Menon", "Joshi", "Bose", "Sheikh", "Suri", "Desai", "Patil", "Ranganathan", "Ahmed",
    "Fischer", "Novak", "Rossi", "Dubois", "Larsen", "Okoye", "Silva", "Tanaka", "Wong", "Kim",
];
const CITIES: [string, string][] = [
    ["Mumbai", "India"], ["Bengaluru", "India"], ["Delhi", "India"], ["Pune", "India"], ["Hyderabad", "India"],
    ["Dubai", "UAE"], ["Singapore", "Singapore"], ["London", "UK"], ["Toronto", "Canada"], ["Sydney", "Australia"], ["Lagos", "Nigeria"],
];
const SOP_SOURCES = ["Instagram ad", "LinkedIn post", "Google search", "referral from a friend", "YouTube review", "Novatr blog"];
const TOOLS = ["AutoCAD, Revit", "Rhinoceros 3D, Grasshopper", "Revit, Navisworks", "AutoCAD only", "Rhino, AutoCAD"];
const ENGLISH_LEVELS = ["Fluent", "Advanced", "Intermediate"];
const QUALIFICATIONS = ["B.Arch", "M.Arch", "B.E. Civil", "B.Tech Civil", "Diploma in Architecture"];
const CURRENT_ROLES = ["Junior Architect", "Design Engineer", "Site Engineer", "Architecture Intern", "Freelance Designer"];
const EXPERIENCE_BANDS = ["0–1 years", "1–3 years", "3–5 years", "5+ years"];
const INCOME_BANDS = ["₹3–5 LPA", "₹5–8 LPA", "₹8–12 LPA", "Not disclosed"];
/** State/province shown in the Application Details slide-over's Basic Information group —
 * only meaningful for the Indian cities `CITIES` includes; international cities fall back to
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

// ---------------------------------------------------------------------------
// Deal / installment / activity-log shapes
// ---------------------------------------------------------------------------

export type InstallmentMode = "Razorpay" | "Manual" | "EMI_3P" | "Stripe" | "Stripe EMI";
export type InstallmentStatus = "Paid" | "Unpaid" | "Overdue";

export type Installment = {
    label: string;
    amount: number;
    mode: InstallmentMode;
    isEmi: boolean;
    emiMonths: number | null;
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

/** How `discount` breaks down into the line items the Payment Plan section itemizes.
 * Always sums back to the parent deal's `discount`. */
export type DiscountBreakdown = {
    upfront: number;
    scholarship: number;
    bdr: number;
};

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
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
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

function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

const bdrWeights = bdrs.map((b) => b.weight);

/** A ready-to-append deal, minus fields resolved after every deal in a batch is known
 * (reachedStage, activityLog) — kept internal to generation. */
type DraftDeal = Omit<Deal, "reachedStage" | "activityLog">;

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

    const currency: "INR" | "USD" = rand() < 0.72 ? "INR" : "USD";
    const courseFee = currency === "INR" ? pick([185_000, 210_000, 245_000, 275_000]) : pick([2400, 2800, 3200]);
    const discountPct = int(0, 20);
    const discount = Math.round(courseFee * (discountPct / 100));
    const netPayable = courseFee - discount;
    const [city, country] = pick(CITIES);

    const hasPlan = (["OFFER_PENDING", "OFFER_EXPIRED", "OFFER_ACCEPTED", "PAY_ONGOING", "PAY_COMPLETED", "ENR_CANCELLED"] as DealStatusId[]).includes(statusId);
    const installments: Installment[] = hasPlan ? buildInstallments(statusId, currency, netPayable, createdOn) : [];

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
    const discountBreakdown: DiscountBreakdown = { upfront, scholarship, bdr: bdrDiscount };

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
        installments,
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

function buildInstallments(statusId: DealStatusId, currency: "INR" | "USD", netPayable: number, createdOn: Date): Installment[] {
    const modeChoices: InstallmentMode[] = currency === "INR" ? ["Razorpay", "Manual", "EMI_3P"] : ["Stripe", "Stripe EMI"];
    const partPayment = rand() < 0.6;
    const count = partPayment ? int(2, 3) : 1;
    let remaining = netPayable;
    const installments: Installment[] = [];

    for (let k = 0; k < count; k++) {
        const mode = pick(modeChoices);
        const isEmi = mode.includes("EMI");
        const amount = k === count - 1 ? remaining : Math.round(remaining / (count - k) / 100) * 100;
        remaining -= amount;

        const paidFlag = statusId === "PAY_COMPLETED" ? true : statusId === "PAY_ONGOING" ? k === 0 : false;
        const overdue = !paidFlag && statusId === "PAY_ONGOING" && k === 1 && rand() < 0.35;

        const daysSinceCreated = Math.max(1, Math.round((PROTOTYPE_TODAY.getTime() - createdOn.getTime()) / 86_400_000));
        let paidOn: Date | null = paidFlag ? new Date(createdOn.getTime() + int(1, daysSinceCreated) * 86_400_000) : null;
        if (paidOn && paidOn > PROTOTYPE_TODAY) paidOn = PROTOTYPE_TODAY;

        const deadlineDate = new Date(PROTOTYPE_TODAY.getTime() + int(-10, 30) * 86_400_000);

        installments.push({
            label: partPayment ? `Installment ${k + 1}` : "Full payment",
            amount,
            mode,
            isEmi,
            emiMonths: isEmi ? pick([3, 6, 12]) : null,
            emiInterest: isEmi ? pick([180, 340, 620]) : null,
            deadline: toISODate(deadlineDate),
            status: paidFlag ? "Paid" : overdue ? "Overdue" : "Unpaid",
            paidOn,
        });
    }
    return installments;
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

    for (const month of MONTHS) {
        const c: DealStageCascade = month.cascade;
        const monthDrafts: DraftDeal[] = [];

        // applicationStage → all APP_PENDING.
        const perBdrAppPending = splitByWeights(c.currentStage.applicationStage, bdrWeights, true);
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrAppPending[i]; n++) monthDrafts.push(buildBaseDeal(bdr, month, "APP_PENDING"));
        });

        // offerStage (= offers.pending + payments.dpNotPaid, by cascade construction) → split
        // back into OFFER_PENDING / OFFER_ACCEPTED in that same ratio.
        const perBdrOfferStage = splitByWeights(c.currentStage.offerStage, bdrWeights, true);
        let offerStageDrafts: DraftDeal[] = [];
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrOfferStage[i]; n++) offerStageDrafts.push(buildBaseDeal(bdr, month, "OFFER_PENDING"));
        });
        offerStageDrafts = assignSubStatuses(offerStageDrafts, ["OFFER_PENDING", "OFFER_ACCEPTED"], [c.offers.pending, c.payments.dpNotPaid]);
        monthDrafts.push(...offerStageDrafts);

        // paymentStage (= payments.overdue) → all PAY_ONGOING.
        const perBdrPaymentStage = splitByWeights(c.currentStage.paymentStage, bdrWeights, true);
        bdrs.forEach((bdr, i) => {
            for (let n = 0; n < perBdrPaymentStage[i]; n++) monthDrafts.push(buildBaseDeal(bdr, month, "PAY_ONGOING"));
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

    const allDrafts = draftsByMonth.flat();

    return allDrafts.map((draft) => {
        const reachedStage = STAGE_RANK[draft.status.id] ?? (pick([0, 0, 0, 1, 1, 2]) as ReachedStage);
        return { ...draft, reachedStage, activityLog: buildActivityLog(draft) };
    });
}

function buildActivityLog(d: DraftDeal): ActivityLogEntry[] {
    const log: ActivityLogEntry[] = [{ ts: d.createdOn, text: "Deal created", reason: "PDE completed on call" }];
    const daysAgo = (n: number) => new Date(PROTOTYPE_TODAY.getTime() - n * 86_400_000);

    const stageOrder: DealStatusId[] = ["APP_PENDING", "APP_FILLED", "OFFER_PENDING", "OFFER_ACCEPTED", "PAY_ONGOING", "PAY_COMPLETED"];
    let idx = stageOrder.indexOf(d.status.id);
    if (idx === -1) idx = 0;

    if (idx >= 1) log.push({ ts: daysAgo(int(1, 60)), text: "Application filled by learner" });
    if (idx >= 2) log.push({ ts: daysAgo(int(1, 45)), text: "Offer letter sent", reason: "With Scholarship template" });
    if (idx >= 3) log.push({ ts: daysAgo(int(1, 30)), text: "Offer accepted by learner" });
    if (idx >= 4) log.push({ ts: daysAgo(int(1, 20)), text: "Down payment received" });
    if (idx >= 5) log.push({ ts: daysAgo(int(1, 5)), text: "Final installment received — payment completed" });
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

/** Deals not in a Global status and not Payment Completed — what the sidebar's Deals badge
 * counts. */
export function openDealCount(persona: Persona, deals: Deal[] = DEALS): number {
    return dealsForPersona(persona, deals).filter((d) => d.status.stage !== "Global" && d.status.id !== "PAY_COMPLETED").length;
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
    assert(DEALS.every((d) => knownBdrIds.has(d.bdrId)), "every deal's bdrId must exist in bdrs");

    assert(dealsForPersona({ role: "admin" }).length === DEALS.length, "admin persona must see every deal");

    for (const month of MONTHS) {
        const c = month.cascade;
        const monthDeals = DEALS.filter((d) => d.createdOn.getFullYear() === month.year && d.createdOn.getMonth() === month.month);
        const bucketSum =
            c.currentStage.applicationStage + c.currentStage.offerStage + c.currentStage.paymentStage + c.currentStage.paymentCompleted + c.currentStage.expired + c.currentStage.notInterested;
        assert(monthDeals.length === bucketSum, `month ${month.month + 1}: roster count (${monthDeals.length}) !== currentStage bucket sum (${bucketSum})`);
    }
}
