/**
 * Seed-data generator for the Deals roster, lifted from the "Dashboard — Sales Head" Figma
 * frame (node 62:5, file i4hwfDcV60v0s0P9fZr8l6): a synthetic month-by-month cascade
 * (`MONTHS`/`buildCascade`) that `deals-data.ts` walks once to generate a plausible 141-deal
 * roster (`DEALS`), plus the org hierarchy (`teamManagers`/`teamLeads`/`bdrs`) and sales
 * targets (`unitTarget`, a goal — not something derivable from deals).
 *
 * The prototype's "today" is pinned to August 26, 2025 rather than the real date, so the
 * seeded roster always tells the same coherent story regardless of when it's viewed.
 *
 * What the Home dashboard actually *displays* is computed live from that roster in
 * `dashboard-metrics.ts` (via `useDeals()`/`dealsForPersona`), not from anything in this file
 * beyond `unitTarget` — this file's job ends at generating a believable seed, it does not
 * compute what's shown on screen.
 */
import type { Persona } from "@/types/role";

// ---------------------------------------------------------------------------
// Fixed "today"
// ---------------------------------------------------------------------------

export const PROTOTYPE_TODAY = new Date(2025, 7, 26); // August 26, 2025

export const prototypeTodayLabel = PROTOTYPE_TODAY.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Indian digit grouping: 1888000 -> "18,88,000". */
export function formatIndianNumber(value: number): string {
    const rounded = Math.round(Math.abs(value));
    const str = String(rounded);
    const lastThree = str.slice(-3);
    const rest = str.slice(0, -3);
    const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    const formatted = rest ? `${restGrouped},${lastThree}` : lastThree;
    return value < 0 ? `-${formatted}` : formatted;
}

/** Indian lakh/crore compact form: 422000 -> "4.22L", 12500000 -> "1.25Cr". */
export function formatIndianCompact(value: number): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_00_00_000) return `${sign}${(abs / 1_00_00_000).toFixed(2)}Cr`;
    if (abs >= 1_00_000) return `${sign}${(abs / 1_00_000).toFixed(2)}L`;
    return `${sign}${formatIndianNumber(abs)}`;
}

// ---------------------------------------------------------------------------
// Deterministic "organic" curve generator — seeded so the wobble is stable
// across renders instead of re-randomizing on every mount.
// ---------------------------------------------------------------------------

export function seededRandom(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

// ---------------------------------------------------------------------------
// Reusable split helper (brief §9) — one function, used at every level of the
// org tree (and for per-cohort funnel slices) so the rounding logic is never
// duplicated or allowed to drift.
// ---------------------------------------------------------------------------

/**
 * Splits `total` across `weights` proportionally.
 * - `integer: false` (default) — exact proportional split, for currency (no rounding error possible).
 * - `integer: true` — largest-remainder method, for counts: floors each share, then hands the
 *   leftover units to the shares with the largest fractional remainders, so the parts always
 *   sum to exactly `total`.
 */
export function splitByWeights(total: number, weights: number[], integer = false): number[] {
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const exact = weights.map((w) => (total * w) / weightSum);

    if (!integer) return exact;

    const floors = exact.map(Math.floor);
    const distributed = floors.reduce((a, b) => a + b, 0);
    let remainder = Math.round(total - distributed);

    const order = exact.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);

    const result = [...floors];
    for (let k = 0; k < remainder && k < order.length; k++) {
        result[order[k].i] += 1;
    }
    return result;
}

// ---------------------------------------------------------------------------
// Deal Stages cascade — built backward from Units Achieved so Payment
// Completed always equals it exactly, and every bucket total is the sum of
// generated parts (never hand-typed), per brief §3–§4.
// ---------------------------------------------------------------------------

export type DealStageCascade = {
    applicationsSent: number;
    applications: { pending: number; expired: number; filled: number; notInterestedOrRejected: number };
    offers: { pending: number; expired: number; accepted: number; notInterestedOrRejected: number };
    payments: { dpNotPaid: number; overdue: number; cleared: number; notInterestedOrRejected: number };
    clearance: { completed: number; enrolmentCancelled: number };
    currentStage: {
        applicationStage: number;
        offerStage: number;
        paymentStage: number;
        paymentCompleted: number;
        expired: number;
        notInterested: number;
    };
};

function buildCascade(unitsAchieved: number, seed: number, quality: number): DealStageCascade {
    const rand = seededRandom(seed);
    const branch = (of: number, min: number, max: number) => Math.max(1, Math.round(of * (min + rand() * (max - min))));
    // `quality` scales just the "loss" branches (expired/not-interested/rejected — deals that
    // stop progressing) inversely: >1 shrinks them (a stronger-converting month), <1 grows them
    // (a weaker one). Friction/in-progress branches (overdue, dpNotPaid, offer/app pending) are
    // untouched by it — those aren't conversion, just where a still-live deal currently sits.
    // This is what makes each month's stage-to-stage conversion % genuinely different from the
    // next, not just mildly jittered by a different random seed within the same fixed range.
    const lossBranch = (of: number, min: number, max: number) => branch(of, min / quality, max / quality);

    // Payment step — `unitsAchieved` is booked units (>=1 payment): cleared + overdue +
    // payment-stage not-interested/rejected, every "accepted" deal except dpNotPaid. `cleared`
    // (fully paid / Payment Completed) is derived DOWNWARD from it, not pinned equal to it
    // (§9(a) of the offer-separation brief) — a deal books the moment it starts paying, whether
    // or not it's finished.
    const overdue = branch(unitsAchieved, 0.12, 0.22);
    const paymentNotInterestedOrRejected = lossBranch(unitsAchieved, 0.06, 0.12);
    const cleared = Math.max(1, unitsAchieved - overdue - paymentNotInterestedOrRejected);
    const dpNotPaid = branch(unitsAchieved, 0.2, 0.32);
    const accepted = cleared + dpNotPaid + overdue + paymentNotInterestedOrRejected;

    // Offer step — backward from `accepted`.
    const offerPending = branch(accepted, 0.16, 0.26);
    const offerExpired = lossBranch(accepted, 0.08, 0.14);
    const offerNotInterestedOrRejected = lossBranch(accepted, 0.12, 0.2);
    const filled = accepted + offerPending + offerExpired + offerNotInterestedOrRejected;

    // Application step — backward from `filled`. Widened per Manik's ask for a bigger sample of
    // brand-new (assigned, not yet sent) deals — purely additive to Applications Sent, since
    // `filled` (and everything downstream of it — Plan/Offer/Payment) is computed independently
    // above and never reads this fraction back.
    const appPending = branch(filled, 0.22, 0.34);
    const appExpired = lossBranch(filled, 0.06, 0.12);
    const appNotInterestedOrRejected = lossBranch(filled, 0.08, 0.16);
    const applicationsSent = filled + appPending + appExpired + appNotInterestedOrRejected;

    // Enrolment cancellations are a small, decorative post-clearance event — they don't
    // feed back into the funnel volume, matching how this bucket already behaved
    // (near-zero) in the previously hand-authored data.
    const enrolmentCancelled = rand() < 0.35 ? Math.round(cleared * (rand() * 0.08)) : 0;

    return {
        applicationsSent,
        applications: { pending: appPending, expired: appExpired, filled, notInterestedOrRejected: appNotInterestedOrRejected },
        offers: { pending: offerPending, expired: offerExpired, accepted, notInterestedOrRejected: offerNotInterestedOrRejected },
        payments: { dpNotPaid, overdue, cleared, notInterestedOrRejected: paymentNotInterestedOrRejected },
        clearance: { completed: cleared, enrolmentCancelled },
        currentStage: {
            applicationStage: appPending,
            offerStage: offerPending + dpNotPaid,
            paymentStage: overdue,
            paymentCompleted: cleared,
            expired: appExpired + offerExpired,
            notInterested: appNotInterestedOrRejected + offerNotInterestedOrRejected + paymentNotInterestedOrRejected,
        },
    };
}

// ---------------------------------------------------------------------------
// Monthly ground truth — the only place Units/ATS/Booked/Realised are chosen.
// Everything else on the dashboard is derived from these five months.
// ---------------------------------------------------------------------------

export type MonthGroundTruth = {
    year: number;
    month: number; // 0-indexed
    unitTarget: number;
    /** A deal that's made >=1 payment (booked), not necessarily fully cleared — see the
     * booked-revenue-trigger note at the top of this file. */
    unitsAchieved: number;
    ats: number;
    booked: number; // = unitsAchieved * ats, always
    realisedThisPeriod: number;
    cascade: DealStageCascade;
    /** Resolved by the backlog ledger below — not set at declaration time. */
    realisedOfPreviouslyBooked: number;
    totalRealised: number;
};

function defineMonth(
    year: number,
    month: number,
    unitTarget: number,
    unitsAchieved: number,
    ats: number,
    realisedRatio: number,
    cascadeSeed: number,
    /** >1 = a stronger-converting month (fewer deals expire/fall through at every stage), <1 =
     * weaker — see `lossBranch` in buildCascade. This is what gives each month a genuinely
     * different Application→Offer→Payment→Completed conversion story, not just volume. */
    quality: number,
): MonthGroundTruth {
    const booked = unitsAchieved * ats;
    return {
        year,
        month,
        unitTarget,
        unitsAchieved,
        ats,
        booked,
        realisedThisPeriod: Math.round(booked * realisedRatio),
        cascade: buildCascade(unitsAchieved, cascadeSeed, quality),
        realisedOfPreviouslyBooked: 0,
        totalRealised: 0,
    };
}

// Jan–Mar: the quarter before the Apr–Jun window this dashboard used to start at (added on
// Manik's ask for a sample of deals from that earlier quarter) — a smaller, ramping-up team
// output that leads naturally into April's already-established upward trend.
//
// unitsAchieved (30–42/month) is tuned so applicationsSent lands around 90–120/month on average
// (per Manik's ask) — see the cascade math in buildCascade: applicationsSent ends up roughly
// unitsAchieved × 2.7–2.9 once every stage's random branch ratios compound. `quality` varies
// deliberately non-monotonically (not a smooth ramp) so conversion swings from a genuinely weak
// month (March) to a genuinely strong one (May), rather than every month reading about the same.
// unitTarget ramps +10/month starting from a fixed 80 in January (Manik's call, 2026-09-10) —
// a deliberate goal-setting progression, unrelated to `unitsAchieved`'s own month-to-month
// variation above.
// Apr/May/Jun and Jul unitsAchieved bumped up (Manik's call, 2026-09-10) so Unit Sales/Target
// lands in the Amber band for July and the Green band for Last Quarter (Apr-Jun combined) — see
// `unitTargetAttainmentTone` in sales-funnel-section.tsx for the exact thresholds.
const JANUARY = defineMonth(2025, 0, 80, 34, 165_000, 0.195, 98, 0.85);
const FEBRUARY = defineMonth(2025, 1, 90, 38, 168_000, 0.2, 99, 1.15);
const MARCH = defineMonth(2025, 2, 100, 32, 170_000, 0.205, 100, 0.75);
const APRIL = defineMonth(2025, 3, 110, 92, 172_000, 0.21, 101, 1.0);
const MAY = defineMonth(2025, 4, 120, 82, 175_000, 0.215, 102, 1.3);
const JUNE = defineMonth(2025, 5, 130, 87, 176_000, 0.22, 103, 0.9);
const JULY = defineMonth(2025, 6, 140, 75, 178_000, 0.225, 104, 1.1);
const AUGUST = defineMonth(2025, 7, 150, 37, 180_000, 0.2235, 105, 0.95);

export const MONTHS: MonthGroundTruth[] = [JANUARY, FEBRUARY, MARCH, APRIL, MAY, JUNE, JULY, AUGUST];

// ---------------------------------------------------------------------------
// Backlog ledger (brief §7) — resolves "Realised of previously booked" for
// every month from a running pool, in chronological order, so it can never
// exceed what's actually outstanding.
// ---------------------------------------------------------------------------

const BACKLOG_SEED_POOL = 11_00_000; // outstanding balance carried in from before January
const BACKLOG_DRAW_RATE = 0.3; // fraction of the pool collected each month

(function resolveBacklogLedger() {
    let pool = BACKLOG_SEED_POOL;
    for (const m of MONTHS) {
        const draw = Math.round(pool * BACKLOG_DRAW_RATE);
        m.realisedOfPreviouslyBooked = draw;
        m.totalRealised = m.realisedThisPeriod + draw;
        pool = pool - draw + (m.booked - m.realisedThisPeriod);
    }
})();

// ---------------------------------------------------------------------------
// Payment Modes — the type still exists because `payment-modes-pie.tsx` imports it (that
// component isn't wired into any page). The synthetic weighting that used to fill it is gone;
// nothing live populates this breakdown.
// ---------------------------------------------------------------------------

export type PaymentModeBreakdown = { mode: string; percent: number; amount: number }[];

// ---------------------------------------------------------------------------
// Period model (This Month / Last Month / This Quarter / Last Quarter /
// This Year) — the five pills currently on screen.
// ---------------------------------------------------------------------------

// `id` stays "lifetime" — the seeded deal roster only ever spans one calendar year, so
// "lifetime" and "this year" already resolve to the exact same bounds; this is a label-only
// rename (Manik's call, 2026-09-10), not a new period kind.
export type PeriodId = "this-month" | "last-month" | "this-quarter" | "last-quarter" | "lifetime";

export const periods: { id: PeriodId; label: string }[] = [
    { id: "this-month", label: "This Month" },
    { id: "last-month", label: "Last Month" },
    { id: "this-quarter", label: "This Quarter" },
    { id: "last-quarter", label: "Last Quarter" },
    { id: "lifetime", label: "This Year" },
];

function daysInMonth(year: number, monthIndex0: number): number {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

export type ChartPoint = {
    x: number;
    date: Date;
    /** Cumulative running total through this day — what the area/line actually plot. */
    booked: number;
    realised: number;
    /** This day's own amount, not the running total — the Booked Revenue chart's tooltip shows
     * both so a holiday's near-₹0 daily figure doesn't get lost in an ever-climbing cumulative
     * number. Derived from the same holiday-stagnation-adjusted series as `booked`/`realised`
     * (see applyHolidayStagnation) so a holiday reads as ~₹0 here too, not just a flat cumulative
     * line — but NOT the cosmetic baseline-bias applied on top of that for the curve's opening
     * shape, which would otherwise inflate day 1's figure with an artificial jump. */
    dailyBooked: number;
    dailyRealised: number;
};

export type RealisedBucket = {
    index: number;
    from: Date;
    to: Date;
    label: string;
    previousRealised: number;
    thisRealised: number;
    total: number;
};

export type PeriodChartData = {
    id: PeriodId;
    label: string;
    /** Just the period-describing part shared across cards, e.g. "This Month (August)" or
     * "Jul 1 – Jul 31" — headingLabel is "Booked - " + this; other cards reuse it directly. */
    periodLabel: string;
    headingLabel: string;
    /** The actual month/quarter the period covers, e.g. "August" or "Q3 2025" — for the Booked
     * Revenue card's badge, distinct from `label` ("This Month") already shown in the filter
     * pills above it. */
    badgeLabel: string;
    bookedTotal: number;
    realisedTotal: number;
    realisedPercent: number;
    changeText: string;
    unitsAchieved: number;
    unitTarget: number;
    ats: number;
    totalRealised: number;
    realisedOfPreviouslyBooked: number;
    /** vs the previous equivalent period (same shape as Booked Revenue's own change indicator) —
     * null wherever there's no prior period to compare against (e.g. Lifetime). */
    realisedOfPreviouslyBookedChangePct: number | null;
    totalRealisedChangePct: number | null;
    /** Realised Revenue card's mini bar chart — always 10 buckets spanning the period, each
     * split into its previous-period vs this-period realised amount (see buildRealisedBuckets). */
    realisedBuckets: RealisedBucket[];
    cascade: DealStageCascade;
    paymentModes: PaymentModeBreakdown;
    points: ChartPoint[];
    /** National holidays that fall inside this period, at the same `x` the chart's own points
     * use — marked on the Booked Revenue chart where the curve also shows a stagnant dip. */
    holidays: { x: number; label: string }[];
    xDomain: [number, number];
    xTicks: number[];
    xTickFormatter: (x: number) => string;
};

// ---------------------------------------------------------------------------
// Custom Date Range bounds — the date-range picker in the dashboard header is clamped to this
// window, the only range that has real seeded deals behind it.
// ---------------------------------------------------------------------------

export const DATA_WINDOW_START = new Date(MONTHS[0].year, MONTHS[0].month, 1);
export const DATA_WINDOW_END = PROTOTYPE_TODAY;

export type PeriodSelection = { kind: "preset"; id: PeriodId } | { kind: "custom"; from: Date; to: Date };

/** Sales targets are a goal, not something derivable from deals — this is the org-wide daily
 * rate `dashboard-metrics.ts` apportions across an arbitrary custom range that doesn't line up
 * with a seeded month. */
export const ORG_WIDE_DAILY_TARGET_RATE = MONTHS.reduce((sum, m) => sum + m.unitTarget, 0) / MONTHS.reduce((sum, m) => sum + daysInMonth(m.year, m.month), 0);

/** A stable, unique key for a selection — for React `key`s that should remount on any change
 * (a custom range is uniquely identified by its dates, since it has no fixed `PeriodId`). */
export function getPeriodSelectionKey(selection: PeriodSelection): string {
    return selection.kind === "preset" ? selection.id : `custom-${selection.from.getTime()}-${selection.to.getTime()}`;
}

// ---------------------------------------------------------------------------
// Dev-time invariant checks — no test runner in this scaffold yet, so these
// assert on module load in dev builds instead. Catches the exact class of
// bug the brief calls out (cards silently disagreeing with each other).
// ---------------------------------------------------------------------------

if (import.meta.env.DEV) {
    const assert = (condition: boolean, message: string) => {
        if (!condition) console.error(`[dashboard-data invariant failed] ${message}`);
    };

    for (const m of MONTHS) {
        assert(m.booked === m.unitsAchieved * m.ats, `Booked !== Units × ATS for month ${m.month + 1}`);
        assert(m.totalRealised === m.realisedThisPeriod + m.realisedOfPreviouslyBooked, `Total Realised mismatch for month ${m.month + 1}`);
        // Reworked for §9(a): Units Achieved is now "booked" (>=1 payment), of which Payment
        // Completed (cleared) is a subset — the other two are still-paying or fell off after
        // paying something. Cleared no longer equals Units Achieved by itself.
        assert(
            m.cascade.payments.cleared + m.cascade.payments.overdue + m.cascade.payments.notInterestedOrRejected === m.unitsAchieved,
            `Booked (cleared+overdue+payment-stage not-interested) !== Units Achieved for month ${m.month + 1}`,
        );

        const stageSum =
            m.cascade.currentStage.applicationStage +
            m.cascade.currentStage.offerStage +
            m.cascade.currentStage.paymentStage +
            m.cascade.currentStage.paymentCompleted +
            m.cascade.currentStage.expired +
            m.cascade.currentStage.notInterested;
        assert(stageSum === m.cascade.applicationsSent, `Deal Stages buckets don't sum to Applications Sent for month ${m.month + 1}`);
    }
}

// ---------------------------------------------------------------------------
// Org drill-down (brief §9, extended by the role-based-data-scoping brief) —
// Arjun Khurana (id: ish-kumar) / Dhruv Anand / Raj Kashyap (ids reconciled to the documented
// names, §11/§18 of prior OMS research — Arjun Khurana is a later rename, Manik's call,
// 2026-09-11), each split into Team Leads, each split
// into BDRs. Every level's weights are independently seeded (not identical
// across siblings — real orgs aren't that even). Revenue/unit numbers for
// each node are computed live in dashboard-metrics.ts by literally filtering
// deals owned by that node — these weights are only still used to roll up
// the one thing that legitimately isn't deal-derived: sales targets.
// ---------------------------------------------------------------------------

export type OrgTeamManager = { id: string; name: string; weight: number };
export type OrgTeamLead = { id: string; tmId: string; name: string; weight: number };
export type OrgBdr = { id: string; tlId: string; tmId: string; name: string; weight: number };

const TM_WEIGHTS: OrgTeamManager[] = [
    { id: "ish-kumar", name: "Arjun Khurana", weight: 40 },
    { id: "dhruv-anand", name: "Dhruv Anand", weight: 35 },
    { id: "raj-kashyap", name: "Raj Kashyap", weight: 25 },
];

export const TM_TOTAL_WEIGHT = TM_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);

// Two TLs per TM, independently seeded weight pairs.
const TL_SPLITS: Record<string, [number, number]> = {
    "ish-kumar": [58, 42],
    "dhruv-anand": [52, 48],
    "raj-kashyap": [63, 37],
};
const TL_NAMES = ["Aisha Verma", "Rohan Kapoor", "Neha Joshi", "Vikram Rao", "Simran Kaur", "Aditya Menon"];

const TL_WEIGHTS: OrgTeamLead[] = TM_WEIGHTS.flatMap((tm, tmIndex) =>
    TL_SPLITS[tm.id].map((weight, i) => ({
        id: `${tm.id}-tl-${i === 0 ? "a" : "b"}`,
        tmId: tm.id,
        name: TL_NAMES[tmIndex * 2 + i],
        weight,
    })),
);

// 3–4 BDRs per TL, independently seeded weight sets.
const BDR_SPLITS: Record<string, number[]> = {
    "ish-kumar-tl-a": [34, 28, 22, 16],
    "ish-kumar-tl-b": [42, 33, 25],
    "dhruv-anand-tl-a": [30, 27, 24, 19],
    "dhruv-anand-tl-b": [39, 35, 26],
    "raj-kashyap-tl-a": [45, 31, 24],
    "raj-kashyap-tl-b": [32, 26, 23, 19],
};
const BDR_NAMES = [
    "Tanvi Shah",
    "Karan Malhotra",
    "Ritu Bhatia",
    "Sameer Iyer",
    "Pooja Nair",
    "Aryan Chawla",
    "Meera Pillai",
    "Vivek Saxena",
    "Ananya Desai",
    "Rahul Bose",
    "Divya Chandran",
    "Nikhil Bhatt",
    "Shreya Ghosh",
    "Yash Tandon",
    "Kavya Reddy",
    "Arjun Prasad",
    "Ishita Sinha",
    "Manav Oberoi",
    "Riya Kulkarni",
    "Dev Khanna",
    "Anika Sharma",
];

let bdrNameCursor = 0;
const BDR_WEIGHTS: OrgBdr[] = TL_WEIGHTS.flatMap((tl) =>
    BDR_SPLITS[tl.id].map((weight, i) => ({
        id: `${tl.id}-bdr-${i + 1}`,
        tlId: tl.id,
        tmId: tl.tmId,
        name: BDR_NAMES[bdrNameCursor++],
        weight,
    })),
);

export const teamManagers: OrgTeamManager[] = TM_WEIGHTS;
export const teamLeads: OrgTeamLead[] = TL_WEIGHTS;
export const bdrs: OrgBdr[] = BDR_WEIGHTS;

/** Proportional split of `total` between `weight` and its siblings' combined `totalWeight`,
 * returning just this node's share. Thin, exported wrapper around `splitByWeights` so
 * consumers outside this module (dashboard-metrics.ts's target rollup) reuse the same exact
 * currency / largest-remainder integer logic instead of re-deriving shares by hand. */
export function scaleForWeight(total: number, weight: number, totalWeight: number, integer = false): number {
    return splitByWeights(total, [weight, totalWeight - weight], integer)[0];
}

/** A persona's display name for the sidebar/header ("Arjun Khurana", "Tanvi Shah", "Admin"...). */
export function getPersonaLabel(persona: Persona): string {
    if (persona.role === "admin") return "Admin";
    if (persona.role === "tm") return teamManagers.find((t) => t.id === persona.tmId)?.name ?? "Team Manager";
    if (persona.role === "tl") return teamLeads.find((t) => t.id === persona.tlId)?.name ?? "Team Lead";
    return bdrs.find((b) => b.id === persona.bdrId)?.name ?? "BDR";
}

export type TeamManagerSummary = { id: string; name: string; bookedTotal: number; unitsAchieved: number; unitTarget: number; ats: number };

/** Every Team Lead across the whole org, for the "Preview as" switcher's second step —
 * labeled with their TM so same-named ambiguity (there isn't any yet, but could be) reads
 * clearly regardless. */
export function listAllTeamLeads(): { id: string; label: string; persona: Persona }[] {
    return teamLeads.map((tl) => {
        const tm = teamManagers.find((t) => t.id === tl.tmId)!;
        return { id: tl.id, label: `${tl.name} — under ${tm.name}`, persona: { role: "tl", tmId: tm.id, tlId: tl.id } };
    });
}

/** Every BDR across the whole org, for the "Preview as" switcher's second step. */
export function listAllBdrs(): { id: string; label: string; persona: Persona }[] {
    return bdrs.map((bdr) => {
        const tl = teamLeads.find((t) => t.id === bdr.tlId)!;
        return { id: bdr.id, label: `${bdr.name} — under ${tl.name}`, persona: { role: "bdr", tmId: bdr.tmId, tlId: bdr.tlId, bdrId: bdr.id } };
    });
}

export type DealStageBarStatus = { label: string; count: number; color: "blue" | "amber" | "green" | "red" | "gray" };

export type DealStageBar = {
    label: string;
    value: number;
    colorClassName: string;
    hatched?: boolean;
    /** A raw CSS `background` gradient, overriding `colorClassName`'s solid fill for this bar. */
    gradient?: string;
    /** Subset of `value` that needs attention (e.g. Application's `APP_NEW` deals — assigned but
     * not yet sent). Rendered as a highlighted cap inside the bar (Figma node 556:17421). */
    attentionValue?: number;
    attentionLabel?: string;
    /** Every individual `DealStatusId` folded into this bar, with its own count — zero-count
     * statuses omitted. Powers the hover tooltip's per-status hierarchy (bar total → status
     * breakdown), since the bar's own `value` is already a sum across several statuses. */
    breakdown: DealStageBarStatus[];
};

export type FunnelBreakdownItem = {
    label: string;
    count: number;
    dotClassName: string;
};

export type FunnelStage = {
    label: string;
    fraction: string;
    value: number;
    denominator?: number;
    caption?: string;
    breakdown: FunnelBreakdownItem[];
};

export type FunnelCohort = {
    id: string;
    name: string;
    stages: [FunnelStage, FunnelStage, FunnelStage, FunnelStage];
};

/** One condensed funnel panel (Applications/Offers/Payment) on the redesigned per-Team-Manager
 * Admin Funnel card (Figma node 609:10888) — `breakdown` is the panel's own status list,
 * `fallout` the Saved/Not-Interested/Rejected deals that dropped out at that panel's stage
 * boundary specifically (not the whole cohort's fallout, unlike the old `FunnelStage`). */
export type FunnelPanelData = {
    count: number;
    breakdown: FunnelBreakdownItem[];
    fallout: { saved: number; notInterested: number; rejected: number };
};

export type DealHealthColor = "green" | "amber" | "blue" | "gray" | "red";

export type TeamManagerFunnelCardData = {
    id: string;
    name: string;
    cohortTags: string[];
    dealsHealth: DealHealthColor[];
    unitsAchieved: number;
    unitTarget: number;
    unitTargetAttainmentPct: number | null;
    booked: { amount: number; changePct: number | null };
    realised: { amount: number; changePct: number | null };
    avgTicketSize: { amount: number; changePct: number | null };
    applications: FunnelPanelData;
    offers: FunnelPanelData;
    payment: FunnelPanelData;
    /** Deals whose next step is BDR/TM-owned, not the learner's (Figma node 626:17776's
     * collapsed-state "Pending Actions" list) — a different cut than `applications`/`offers`/
     * `payment`'s own totals above, e.g. Applications here is New + Expired only, not the whole
     * cohort. See `getTeamManagerFunnelCardData` for the exact status sets (Manik's call,
     * 2026-09-11). */
    pendingActions: { applications: number; offers: number; payment: number };
    topPerformers: { id: string; name: string; roleTag: string; revenue: number; units: number }[];
};
