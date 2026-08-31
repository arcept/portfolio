/**
 * Static sample data for the Sales Head dashboard, lifted from the "Dashboard — Sales Head"
 * Figma frame (node 62:5, file i4hwfDcV60v0s0P9fZr8l6). No live data source yet.
 *
 * The prototype's "today" is pinned to August 26, 2025 rather than the real date, so the
 * dashboard always tells the same coherent story regardless of when it's viewed.
 *
 * Reconciliation model (per the 2026-08-31 metrics brief, docs/planning/):
 * every number on the dashboard is *derived*, not independently authored, so cards can
 * never silently disagree with each other:
 *   - Booked(P)        = UnitsAchieved(P) × ATS(P) — never picked independently.
 *   - RealisedThisPeriod(P) = a fraction of Booked(P), shown as the "% realised" badge.
 *   - Total Realised(P) = RealisedThisPeriod(P) + RealisedOfPreviouslyBooked(P), where the
 *     latter is drawn from a running backlog ledger (§7 of the brief), not free-floating.
 *   - Deal Stages is a genuine cascade: each stage's population is what's left over from
 *     the previous one, so the 6 current-stage buckets always sum to Applications Sent,
 *     and Payment Completed always equals Units Achieved — enforced by construction.
 *   - The funnel cards (Applications Sent → Offers Shared → Converted → Payment Clearance)
 *     read off that same cascade, so they can't drift from the Deal Stages bars.
 *   - Per-TM splits use `splitByWeights` (exact for currency, largest-remainder for counts)
 *     so children always sum exactly to the org-wide parent total.
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

/** 422000 -> "4.22 L" */
export function formatLakhs(value: number): string {
    return `${(value / 100_000).toFixed(2)} L`;
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

/** Monotonic (non-decreasing) cumulative series from `start` to `end` with gentle noise. */
function generateCumulativeSeries(start: number, end: number, points: number, seed: number): number[] {
    const rand = seededRandom(seed);
    const raw: number[] = [];

    for (let i = 0; i < points; i++) {
        const t = points === 1 ? 1 : i / (points - 1);
        const linear = start + (end - start) * t;
        const taper = Math.sin(Math.PI * t); // 0 at both ends, so endpoints stay exact
        const noiseAmplitude = (end - start) * 0.05;
        const noise = (rand() - 0.5) * 2 * noiseAmplitude * taper;
        raw.push(linear + noise);
    }

    raw[0] = start;
    raw[raw.length - 1] = end;

    for (let i = 1; i < raw.length; i++) {
        if (raw[i] < raw[i - 1]) raw[i] = raw[i - 1];
    }

    return raw.map((v) => Math.round(v));
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

function buildCascade(unitsAchieved: number, seed: number): DealStageCascade {
    const rand = seededRandom(seed);
    const branch = (of: number, min: number, max: number) => Math.max(1, Math.round(of * (min + rand() * (max - min))));

    // Payment step — cleared is pinned to unitsAchieved; everything else branches off it backward.
    const cleared = unitsAchieved;
    const dpNotPaid = branch(cleared, 0.2, 0.32);
    const overdue = branch(cleared, 0.12, 0.22);
    const paymentNotInterestedOrRejected = branch(cleared, 0.12, 0.2);
    const accepted = cleared + dpNotPaid + overdue + paymentNotInterestedOrRejected;

    // Offer step — backward from `accepted`.
    const offerPending = branch(accepted, 0.16, 0.26);
    const offerExpired = branch(accepted, 0.08, 0.14);
    const offerNotInterestedOrRejected = branch(accepted, 0.12, 0.2);
    const filled = accepted + offerPending + offerExpired + offerNotInterestedOrRejected;

    // Application step — backward from `filled`.
    const appPending = branch(filled, 0.12, 0.2);
    const appExpired = branch(filled, 0.06, 0.12);
    const appNotInterestedOrRejected = branch(filled, 0.08, 0.16);
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

/** Sums cascades field-by-field — the sum of reconciled cascades is still a reconciled cascade. */
export function sumCascades(cascades: DealStageCascade[]): DealStageCascade {
    return cascades.reduce((acc, c) => ({
        applicationsSent: acc.applicationsSent + c.applicationsSent,
        applications: {
            pending: acc.applications.pending + c.applications.pending,
            expired: acc.applications.expired + c.applications.expired,
            filled: acc.applications.filled + c.applications.filled,
            notInterestedOrRejected: acc.applications.notInterestedOrRejected + c.applications.notInterestedOrRejected,
        },
        offers: {
            pending: acc.offers.pending + c.offers.pending,
            expired: acc.offers.expired + c.offers.expired,
            accepted: acc.offers.accepted + c.offers.accepted,
            notInterestedOrRejected: acc.offers.notInterestedOrRejected + c.offers.notInterestedOrRejected,
        },
        payments: {
            dpNotPaid: acc.payments.dpNotPaid + c.payments.dpNotPaid,
            overdue: acc.payments.overdue + c.payments.overdue,
            cleared: acc.payments.cleared + c.payments.cleared,
            notInterestedOrRejected: acc.payments.notInterestedOrRejected + c.payments.notInterestedOrRejected,
        },
        clearance: {
            completed: acc.clearance.completed + c.clearance.completed,
            enrolmentCancelled: acc.clearance.enrolmentCancelled + c.clearance.enrolmentCancelled,
        },
        currentStage: {
            applicationStage: acc.currentStage.applicationStage + c.currentStage.applicationStage,
            offerStage: acc.currentStage.offerStage + c.currentStage.offerStage,
            paymentStage: acc.currentStage.paymentStage + c.currentStage.paymentStage,
            paymentCompleted: acc.currentStage.paymentCompleted + c.currentStage.paymentCompleted,
            expired: acc.currentStage.expired + c.currentStage.expired,
            notInterested: acc.currentStage.notInterested + c.currentStage.notInterested,
        },
    }));
}

/** Scales every field of a cascade by a weight (largest-remainder for the integer counts). */
function scaleCascade(c: DealStageCascade, weight: number, totalWeight: number, seed: number): DealStageCascade {
    const s = (value: number) => splitByWeights(value, [weight, totalWeight - weight], true)[0];
    void seed;
    return {
        applicationsSent: s(c.applicationsSent),
        applications: {
            pending: s(c.applications.pending),
            expired: s(c.applications.expired),
            filled: s(c.applications.filled),
            notInterestedOrRejected: s(c.applications.notInterestedOrRejected),
        },
        offers: {
            pending: s(c.offers.pending),
            expired: s(c.offers.expired),
            accepted: s(c.offers.accepted),
            notInterestedOrRejected: s(c.offers.notInterestedOrRejected),
        },
        payments: {
            dpNotPaid: s(c.payments.dpNotPaid),
            overdue: s(c.payments.overdue),
            cleared: s(c.payments.cleared),
            notInterestedOrRejected: s(c.payments.notInterestedOrRejected),
        },
        clearance: { completed: s(c.clearance.completed), enrolmentCancelled: s(c.clearance.enrolmentCancelled) },
        currentStage: {
            applicationStage: s(c.currentStage.applicationStage),
            offerStage: s(c.currentStage.offerStage),
            paymentStage: s(c.currentStage.paymentStage),
            paymentCompleted: s(c.currentStage.paymentCompleted),
            expired: s(c.currentStage.expired),
            notInterested: s(c.currentStage.notInterested),
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
        cascade: buildCascade(unitsAchieved, cascadeSeed),
        realisedOfPreviouslyBooked: 0,
        totalRealised: 0,
    };
}

const APRIL = defineMonth(2025, 3, 10, 8, 172_000, 0.21, 101);
const MAY = defineMonth(2025, 4, 11, 9, 175_000, 0.215, 102);
const JUNE = defineMonth(2025, 5, 12, 10, 176_000, 0.22, 103);
const JULY = defineMonth(2025, 6, 13, 11, 178_000, 0.225, 104);
const AUGUST = defineMonth(2025, 7, 12, 11, 180_000, 0.2235, 105);

export const MONTHS: MonthGroundTruth[] = [APRIL, MAY, JUNE, JULY, AUGUST];

/** The full lifetime's reconciled cascade — every month's cascade summed. `deals-data.ts` uses
 * this (and the per-month `MONTHS` cascades) as the single source of truth for how many deal
 * records should exist at each funnel stage, so the Deals page can never disagree with the
 * dashboard's Deal Stages bars. */
export function getLifetimeCascade(): DealStageCascade {
    return sumCascades(MONTHS.map((m) => m.cascade));
}

// ---------------------------------------------------------------------------
// Backlog ledger (brief §7) — resolves "Realised of previously booked" for
// every month from a running pool, in chronological order, so it can never
// exceed what's actually outstanding.
// ---------------------------------------------------------------------------

const BACKLOG_SEED_POOL = 11_00_000; // outstanding balance carried in from before April
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
// Payment Modes (brief §3) — a breakdown of Total Realised by gateway. Built
// now as real, working functionality; not yet surfaced in any UI (the pie
// component exists at ./payment-modes-pie.tsx but isn't imported anywhere).
// ---------------------------------------------------------------------------

export type PaymentModeBreakdown = { mode: string; percent: number; amount: number }[];

const PAYMENT_MODE_WEIGHTS: { mode: string; weight: number }[] = [
    { mode: "Manual", weight: 8 },
    { mode: "Razorpay", weight: 46 },
    { mode: "Stripe", weight: 31 },
    { mode: "EMI", weight: 15 },
];

function paymentModesFor(totalRealised: number): PaymentModeBreakdown {
    const weights = PAYMENT_MODE_WEIGHTS.map((w) => w.weight);
    const amounts = splitByWeights(totalRealised, weights, true);
    return PAYMENT_MODE_WEIGHTS.map((w, i) => ({ mode: w.mode, percent: w.weight, amount: amounts[i] }));
}

// ---------------------------------------------------------------------------
// Lifetime / Custom range — functionality only, no UI slot yet (per Manik,
// 2026-08-31: the pills for these are coming later). Both derive from the
// same five months rather than needing separate logic, per brief §8.
// ---------------------------------------------------------------------------

export type RangeSummary = {
    booked: number;
    unitsAchieved: number;
    realisedThisPeriod: number;
    realisedOfPreviouslyBooked: number;
    totalRealised: number;
};

export function getLifetimeSummary(): RangeSummary {
    return MONTHS.reduce<RangeSummary>(
        (acc, m) => ({
            booked: acc.booked + m.booked,
            unitsAchieved: acc.unitsAchieved + m.unitsAchieved,
            realisedThisPeriod: acc.realisedThisPeriod + m.realisedThisPeriod,
            realisedOfPreviouslyBooked: acc.realisedOfPreviouslyBooked + m.realisedOfPreviouslyBooked,
            totalRealised: acc.totalRealised + m.totalRealised,
        }),
        { booked: 0, unitsAchieved: 0, realisedThisPeriod: 0, realisedOfPreviouslyBooked: 0, totalRealised: 0 },
    );
}

/**
 * A day-by-day booked series spanning every seeded month, distributed via seeded organic
 * weights (higher on business days) and scaled so each month's days sum to that month's
 * exact Booked total — this is what makes an arbitrary custom range possible without
 * separate per-range logic (brief §6 steps 1–4, §8).
 */
function distributeMonthAcrossDays(total: number, year: number, monthIndex0: number, seed: number, upToDate?: Date): { date: Date; bookedDelta: number }[] {
    const rand = seededRandom(seed);
    const totalDaysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
    const lastDay = upToDate ? upToDate.getDate() : totalDaysInMonth;

    // Weights are only generated (and normalized) for the days actually being emitted —
    // normalizing against the full month while emitting a truncated one would silently
    // under-allocate `total` across the emitted days (this under-counted a partial
    // current month by roughly the fraction of days cut off).
    const weights: number[] = [];
    for (let d = 1; d <= lastDay; d++) {
        const isWeekend = [0, 6].includes(new Date(year, monthIndex0, d).getDay());
        weights.push(isWeekend ? 0.2 + rand() * 0.3 : 0.8 + rand() * 0.4);
    }
    const weightSum = weights.reduce((a, b) => a + b, 0);

    return weights.map((w, i) => ({
        date: new Date(year, monthIndex0, i + 1),
        bookedDelta: Math.round((w / weightSum) * total),
    }));
}

const MASTER_DAILY_SERIES: { date: Date; bookedDelta: number }[] = [
    ...distributeMonthAcrossDays(APRIL.booked, APRIL.year, APRIL.month, 201),
    ...distributeMonthAcrossDays(MAY.booked, MAY.year, MAY.month, 202),
    ...distributeMonthAcrossDays(JUNE.booked, JUNE.year, JUNE.month, 203),
    ...distributeMonthAcrossDays(JULY.booked, JULY.year, JULY.month, 204),
    ...distributeMonthAcrossDays(AUGUST.booked, AUGUST.year, AUGUST.month, 205, PROTOTYPE_TODAY),
];

const ORG_WIDE_REALISED_RATIO = getLifetimeSummary().realisedThisPeriod / getLifetimeSummary().booked;

/**
 * Sums the daily series over [from, to]. Realised-this-period is approximated using the
 * org-wide average ratio (there's no true daily realised series, since realised includes
 * ledger draws that only resolve at month granularity) — good enough for a range total,
 * called out here so it isn't mistaken for the same precision as the monthly figures.
 */
export function getCustomRangeSummary(from: Date, to: Date): { booked: number; realisedThisPeriod: number } {
    const booked = MASTER_DAILY_SERIES.filter((p) => p.date >= from && p.date <= to).reduce((sum, p) => sum + p.bookedDelta, 0);
    return { booked, realisedThisPeriod: Math.round(booked * ORG_WIDE_REALISED_RATIO) };
}

// ---------------------------------------------------------------------------
// Period model (This Month / Last Month / This Quarter / Last Quarter) — the
// four pills currently on screen. Chart lines track Booked (solid) and this
// period's own Realised (dashed) — the "Total Realised" card figure (which
// includes backlog draws) is a separate, ledger-resolved scalar, not what
// the trend line plots (brief §11's open question, resolved this way since
// modeling ledger draws at daily granularity would be a lot of machinery
// for a line that's illustrative of shape, not a second source of truth).
// ---------------------------------------------------------------------------

export type PeriodId = "this-month" | "last-month" | "this-quarter" | "last-quarter";

export const periods: { id: PeriodId; label: string }[] = [
    { id: "this-month", label: "This Month" },
    { id: "last-month", label: "Last Month" },
    { id: "this-quarter", label: "This Quarter" },
    { id: "last-quarter", label: "Last Quarter" },
];

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysInMonth(year: number, monthIndex0: number): number {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function dayIndexBetween(start: Date, date: Date): number {
    return Math.round((date.getTime() - start.getTime()) / 86_400_000) + 1;
}

export type ChartPoint = { x: number; date: Date; booked: number; realised: number };

export type PeriodChartData = {
    id: PeriodId;
    label: string;
    /** Just the period-describing part shared across cards, e.g. "This Month (August)" or
     * "Jul 1 – Jul 31" — headingLabel is "Booked - " + this; other cards reuse it directly. */
    periodLabel: string;
    headingLabel: string;
    bookedTotal: number;
    realisedTotal: number;
    realisedPercent: number;
    changeText: string;
    unitsAchieved: number;
    unitTarget: number;
    ats: number;
    totalRealised: number;
    realisedOfPreviouslyBooked: number;
    cascade: DealStageCascade;
    paymentModes: PaymentModeBreakdown;
    points: ChartPoint[];
    xDomain: [number, number];
    xTicks: number[];
    xTickFormatter: (x: number) => string;
};

/** Builds a daily curve from `periodStart` through `dataEnd`, growing to the known `bookedEnd`. */
function buildSeries(periodStart: Date, dataEnd: Date, bookedEnd: number, realisedEnd: number, seed: number): ChartPoint[] {
    const pointCount = dayIndexBetween(periodStart, dataEnd);
    const bookedStart = Math.round(bookedEnd * 0.16); // a plausible small opening balance, not zero
    const bookedSeries = generateCumulativeSeries(bookedStart, bookedEnd, pointCount, seed);

    const startRatio = (realisedEnd / bookedEnd) * 0.8;
    const endRatio = realisedEnd / bookedEnd;

    return bookedSeries.map((booked, i) => {
        const t = pointCount === 1 ? 1 : i / (pointCount - 1);
        const ratio = startRatio + (endRatio - startRatio) * t;
        return { x: i + 1, date: addDays(periodStart, i), booked, realised: Math.round(booked * ratio) };
    });
}

function monthTicks(daysInAxisMonth: number): number[] {
    const ticks = [1, 5, 10, 15, 20, 25];
    if (!ticks.includes(daysInAxisMonth)) ticks.push(daysInAxisMonth);
    return ticks;
}

function buildMonthPeriod(id: PeriodId, label: string, labelSuffix: string, m: MonthGroundTruth, isCurrent: boolean, seed: number): PeriodChartData {
    const axisStart = new Date(m.year, m.month, 1);
    const totalDays = daysInMonth(m.year, m.month);
    const axisEnd = new Date(m.year, m.month, totalDays);
    const dataEnd = isCurrent ? PROTOTYPE_TODAY : axisEnd;

    const points = buildSeries(axisStart, dataEnd, m.booked, m.realisedThisPeriod, seed);
    const realisedPercent = (m.realisedThisPeriod / m.booked) * 100;

    return {
        id,
        label,
        periodLabel: `${label} (${labelSuffix})`,
        headingLabel: `Booked - ${label} (${labelSuffix})`,
        bookedTotal: m.booked,
        realisedTotal: m.realisedThisPeriod,
        realisedPercent,
        changeText: `Out of which ₹${formatLakhs(m.realisedThisPeriod)} is realised (${realisedPercent.toFixed(2)}%)`,
        unitsAchieved: m.unitsAchieved,
        unitTarget: m.unitTarget,
        ats: m.ats,
        totalRealised: m.totalRealised,
        realisedOfPreviouslyBooked: m.realisedOfPreviouslyBooked,
        cascade: m.cascade,
        paymentModes: paymentModesFor(m.totalRealised),
        points,
        xDomain: [1, totalDays],
        xTicks: monthTicks(totalDays),
        xTickFormatter: (x) => String(x),
    };
}

function buildQuarterPeriod(
    id: PeriodId,
    label: string,
    labelSuffix: string,
    m1: MonthGroundTruth,
    m2: MonthGroundTruth,
    /** The quarter's third month — `null` when it hasn't started yet (the current quarter), in
     * which case it contributes nothing to the totals but still supplies the axis's month/year. */
    m3: MonthGroundTruth | { year: number; month: number },
    isCurrent: boolean,
    seed: number,
): PeriodChartData {
    const axisStart = new Date(m1.year, m1.month, 1);
    const m3Days = daysInMonth(m3.year, m3.month);
    const axisEnd = new Date(m3.year, m3.month, m3Days);
    const dataEnd = isCurrent ? PROTOTYPE_TODAY : axisEnd;
    const totalDays = dayIndexBetween(axisStart, axisEnd);

    // The current quarter's third month hasn't started yet, so it has no MonthGroundTruth
    // to contribute — only sum it in when it's a real, complete month (i.e. not the current quarter).
    const realMonths = isCurrent ? [m1, m2] : [m1, m2, m3 as MonthGroundTruth];

    const bookedEnd = realMonths.reduce((sum, m) => sum + m.booked, 0);
    const realisedEnd = realMonths.reduce((sum, m) => sum + m.realisedThisPeriod, 0);
    const unitsAchieved = realMonths.reduce((sum, m) => sum + m.unitsAchieved, 0);
    const unitTarget = realMonths.reduce((sum, m) => sum + m.unitTarget, 0);
    const totalRealised = realMonths.reduce((sum, m) => sum + m.totalRealised, 0);
    const realisedOfPreviouslyBooked = realMonths.reduce((sum, m) => sum + m.realisedOfPreviouslyBooked, 0);
    const cascade = sumCascades(realMonths.map((m) => m.cascade));

    const points = buildSeries(axisStart, dataEnd, bookedEnd, realisedEnd, seed);
    const realisedPercent = (realisedEnd / bookedEnd) * 100;

    const m2Start = new Date(m2.year, m2.month, 1);
    const m3Start = new Date(m3.year, m3.month, 1);

    return {
        id,
        label,
        periodLabel: `${label} (${labelSuffix})`,
        headingLabel: `Booked - ${label} (${labelSuffix})`,
        bookedTotal: bookedEnd,
        realisedTotal: realisedEnd,
        realisedPercent,
        changeText: `Out of which ₹${formatLakhs(realisedEnd)} is realised (${realisedPercent.toFixed(2)}%)`,
        unitsAchieved,
        unitTarget,
        ats: Math.round(bookedEnd / unitsAchieved),
        totalRealised,
        realisedOfPreviouslyBooked,
        cascade,
        paymentModes: paymentModesFor(totalRealised),
        points,
        xDomain: [1, totalDays],
        xTicks: [1, dayIndexBetween(axisStart, m2Start), dayIndexBetween(axisStart, m3Start)],
        xTickFormatter: (x) => {
            if (x === 1) return MONTH_ABBR[m1.month];
            if (x === dayIndexBetween(axisStart, m2Start)) return MONTH_ABBR[m2.month];
            if (x === dayIndexBetween(axisStart, m3Start)) return MONTH_ABBR[m3.month];
            return "";
        },
    };
}

export const periodChartData: Record<PeriodId, PeriodChartData> = {
    "this-month": buildMonthPeriod("this-month", "This Month", "August", AUGUST, true, 1),
    "last-month": buildMonthPeriod("last-month", "Last Month", "July", JULY, false, 2),
    "this-quarter": buildQuarterPeriod("this-quarter", "This Quarter", "Jul-Sep", JULY, AUGUST, { year: 2025, month: 8 }, true, 3),
    "last-quarter": buildQuarterPeriod("last-quarter", "Last Quarter", "Apr-Jun", APRIL, MAY, JUNE, false, 4),
};

// ---------------------------------------------------------------------------
// Custom Date Range (brief §8's "filter the same daily series and sum" — this
// is exactly that). Slices the real master daily series rather than
// fabricating a fresh curve, so it's more precise than the four preset
// periods, not less. `unitsAchieved`/`ats`/`cascade`/`paymentModes` aren't
// meaningful at arbitrary-range granularity (those are monthly ground-truth
// concepts), so they're apportioned from the org-wide monthly average —
// fine for a card that only ever shows Booked/Realised for a custom range.
// ---------------------------------------------------------------------------

/** The bounds of the seeded data — the only range that has real numbers behind it. */
export const DATA_WINDOW_START = new Date(APRIL.year, APRIL.month, 1);
export const DATA_WINDOW_END = PROTOTYPE_TODAY;

export type PeriodSelection = { kind: "preset"; id: PeriodId } | { kind: "custom"; from: Date; to: Date };

function formatShortDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Org-wide averages, used to apportion the ground-truth-only concepts (units/ATS/target/
// backlog draws) across an arbitrary custom range that doesn't line up with a seeded month.
const ORG_WIDE_PREVIOUSLY_BOOKED_RATIO = getLifetimeSummary().realisedOfPreviouslyBooked / getLifetimeSummary().booked;
const ORG_WIDE_DAILY_TARGET_RATE =
    MONTHS.reduce((sum, m) => sum + m.unitTarget, 0) / MONTHS.reduce((sum, m) => sum + daysInMonth(m.year, m.month), 0);

export function buildCustomPeriodChartData(from: Date, to: Date): PeriodChartData {
    const sliced = MASTER_DAILY_SERIES.filter((p) => p.date >= from && p.date <= to);
    let cumulative = 0;
    const startRatio = ORG_WIDE_REALISED_RATIO * 0.8;
    const endRatio = ORG_WIDE_REALISED_RATIO;

    const points: ChartPoint[] = sliced.map((p, i) => {
        cumulative += p.bookedDelta;
        const t = sliced.length === 1 ? 1 : i / (sliced.length - 1);
        const ratio = startRatio + (endRatio - startRatio) * t;
        return { x: i + 1, date: p.date, booked: cumulative, realised: Math.round(cumulative * ratio) };
    });

    const bookedTotal = cumulative;
    const realisedTotal = Math.round(bookedTotal * ORG_WIDE_REALISED_RATIO);
    const realisedOfPreviouslyBooked = Math.round(bookedTotal * ORG_WIDE_PREVIOUSLY_BOOKED_RATIO);
    const totalRealised = realisedTotal + realisedOfPreviouslyBooked;
    const totalDays = Math.max(1, dayIndexBetween(from, to));
    const orgWideMonthlyAts = Math.round(getLifetimeSummary().booked / getLifetimeSummary().unitsAchieved);
    const unitsAchieved = Math.round(bookedTotal / orgWideMonthlyAts);
    const unitTarget = Math.max(unitsAchieved, Math.round(ORG_WIDE_DAILY_TARGET_RATE * totalDays));

    // Ticks: a handful of evenly-spaced day labels — there's no fixed calendar shape
    // (unlike a month or quarter) to hang them off, so just space them out.
    const tickCount = Math.min(6, totalDays);
    const xTicks = Array.from({ length: tickCount }, (_, i) => Math.round(1 + (i * (totalDays - 1)) / Math.max(1, tickCount - 1)));

    const rangeLabel = `${formatShortDate(from)} – ${formatShortDate(to)}`;

    return {
        id: "this-month", // placeholder — PeriodChartData.id isn't read anywhere custom ranges are used
        label: "Custom",
        periodLabel: rangeLabel,
        headingLabel: `Booked - ${rangeLabel}`,
        bookedTotal,
        realisedTotal,
        realisedPercent: bookedTotal === 0 ? 0 : (realisedTotal / bookedTotal) * 100,
        changeText: `Out of which ₹${formatLakhs(realisedTotal)} is realised (${bookedTotal === 0 ? "0.00" : ((realisedTotal / bookedTotal) * 100).toFixed(2)}%)`,
        unitsAchieved,
        unitTarget,
        ats: orgWideMonthlyAts,
        totalRealised,
        realisedOfPreviouslyBooked,
        // A real cascade sized to this range's own unitsAchieved — seeded off the range's
        // start date so it's deterministic (same range always yields the same breakdown).
        cascade: buildCascade(Math.max(1, unitsAchieved), from.getTime() % 100000),
        paymentModes: paymentModesFor(totalRealised),
        points,
        xDomain: [1, totalDays],
        xTicks,
        xTickFormatter: (x) => {
            const point = points[x - 1];
            return point ? formatShortDate(point.date) : String(x);
        },
    };
}

export function getSelectedPeriodChartData(selection: PeriodSelection): PeriodChartData {
    return selection.kind === "preset" ? periodChartData[selection.id] : buildCustomPeriodChartData(selection.from, selection.to);
}

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
        assert(m.cascade.currentStage.paymentCompleted === m.unitsAchieved, `Payment Completed !== Units Achieved for month ${m.month + 1}`);

        const stageSum =
            m.cascade.currentStage.applicationStage +
            m.cascade.currentStage.offerStage +
            m.cascade.currentStage.paymentStage +
            m.cascade.currentStage.paymentCompleted +
            m.cascade.currentStage.expired +
            m.cascade.currentStage.notInterested;
        assert(stageSum === m.cascade.applicationsSent, `Deal Stages buckets don't sum to Applications Sent for month ${m.month + 1}`);

        const modeSum = paymentModesFor(m.totalRealised).reduce((sum, p) => sum + p.amount, 0);
        assert(modeSum === m.totalRealised, `Payment Modes don't sum to Total Realised for month ${m.month + 1}`);
    }

    for (const period of Object.values(periodChartData)) {
        const lastPoint = period.points[period.points.length - 1];
        assert(lastPoint?.booked === period.bookedTotal, `${period.id}: chart's last point !== period Booked total`);
    }
}

// ---------------------------------------------------------------------------
// Org drill-down (brief §9, extended by the role-based-data-scoping brief) —
// Ish Kumar / Dhruv Anand / Raj Kashyap (reconciled to the documented names,
// §11/§18 of prior OMS research), each split into Team Leads, each split
// into BDRs. Every level's weights are independently seeded (not identical
// across siblings — real orgs aren't that even) and every level's numbers
// are resolved on demand from whatever period's data is current via
// `scaleForWeight`/`scaleCascade`, so a BDR's figures always sum to their
// TL's, which sum to their TM's, which sum to org-wide, by construction.
// Nothing here hand-authors a leaf number.
// ---------------------------------------------------------------------------

export type OrgTeamManager = { id: string; name: string; weight: number };
export type OrgTeamLead = { id: string; tmId: string; name: string; weight: number };
export type OrgBdr = { id: string; tlId: string; tmId: string; name: string; weight: number };

const TM_WEIGHTS: OrgTeamManager[] = [
    { id: "ish-kumar", name: "Ish Kumar", weight: 40 },
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
    "Tanvi Shah", "Karan Malhotra", "Ritu Bhatia", "Sameer Iyer", "Pooja Nair", "Aryan Chawla", "Meera Pillai",
    "Vivek Saxena", "Ananya Desai", "Rahul Bose", "Divya Chandran", "Nikhil Bhatt", "Shreya Ghosh", "Yash Tandon",
    "Kavya Reddy", "Arjun Prasad", "Ishita Sinha", "Manav Oberoi", "Riya Kulkarni", "Dev Khanna", "Anika Sharma",
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

/** Deterministic small-int hash of an id string — used only to seed each org node's
 * cascade shape distinctly, not for anything requiring cryptographic properties. */
function seedFromId(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1_000_000;
    return h + 1;
}

/** Proportional split of `total` between `weight` and its siblings' combined `totalWeight`,
 * returning just this node's share. Thin, exported wrapper around `splitByWeights` so
 * consumers outside this module (team-drilldown, the persona scoper) reuse the same exact
 * currency / largest-remainder integer logic instead of re-deriving shares by hand. */
export function scaleForWeight(total: number, weight: number, totalWeight: number, integer = false): number {
    return splitByWeights(total, [weight, totalWeight - weight], integer)[0];
}

/** Scales every numeric field of a period's chart data down to one org node's share —
 * currency/count fields via `scaleForWeight`, the cascade via `scaleCascade`, and the chart
 * points by the same fraction so the on-screen curve reflects the node's own trajectory. */
function scalePeriodDataToNode(data: PeriodChartData, weight: number, totalWeight: number, cascadeSeed: number): PeriodChartData {
    const bookedTotal = scaleForWeight(data.bookedTotal, weight, totalWeight);
    const realisedTotal = scaleForWeight(data.realisedTotal, weight, totalWeight);
    const unitsAchieved = scaleForWeight(data.unitsAchieved, weight, totalWeight, true);
    const unitTarget = scaleForWeight(data.unitTarget, weight, totalWeight, true);
    const totalRealised = scaleForWeight(data.totalRealised, weight, totalWeight);
    const realisedOfPreviouslyBooked = scaleForWeight(data.realisedOfPreviouslyBooked, weight, totalWeight);
    const cascade = scaleCascade(data.cascade, weight, totalWeight, cascadeSeed);
    const fraction = weight / totalWeight;
    const realisedPercent = bookedTotal === 0 ? 0 : (realisedTotal / bookedTotal) * 100;

    return {
        ...data,
        bookedTotal,
        realisedTotal,
        unitsAchieved,
        unitTarget,
        totalRealised,
        realisedOfPreviouslyBooked,
        ats: unitsAchieved === 0 ? data.ats : Math.round(bookedTotal / unitsAchieved),
        cascade,
        paymentModes: paymentModesFor(totalRealised),
        points: data.points.map((p) => ({ ...p, booked: Math.round(p.booked * fraction), realised: Math.round(p.realised * fraction) })),
        realisedPercent,
        changeText: `Out of which ₹${formatLakhs(realisedTotal)} is realised (${realisedPercent.toFixed(2)}%)`,
    };
}

/**
 * Scales a period's org-wide chart data down to whatever a `Persona` should see — Admin sees
 * it unchanged (org-wide), everyone else gets it walked down through their tree path (TM →
 * TL → BDR), scaling at each hop against that level's real sibling weights. Two hops (org→TM,
 * TM→TL) compound to the same result as one combined fraction would, but doing it per-hop is
 * what keeps a BDR's numbers exactly summing to their TL's, which sum to their TM's.
 */
export function scalePeriodDataForPersona(data: PeriodChartData, persona: Persona): PeriodChartData {
    if (persona.role === "admin") return data;

    const tm = teamManagers.find((t) => t.id === persona.tmId);
    if (!tm) return data;
    let scoped = scalePeriodDataToNode(data, tm.weight, TM_TOTAL_WEIGHT, seedFromId(tm.id));
    if (persona.role === "tm") return scoped;

    const tlSiblings = teamLeads.filter((tl) => tl.tmId === persona.tmId);
    const tlTotalWeight = tlSiblings.reduce((sum, tl) => sum + tl.weight, 0);
    const tl = tlSiblings.find((t) => t.id === persona.tlId);
    if (!tl) return scoped;
    scoped = scalePeriodDataToNode(scoped, tl.weight, tlTotalWeight, seedFromId(tl.id));
    if (persona.role === "tl") return scoped;

    const bdrSiblings = bdrs.filter((b) => b.tlId === persona.tlId);
    const bdrTotalWeight = bdrSiblings.reduce((sum, b) => sum + b.weight, 0);
    const bdr = bdrSiblings.find((b) => b.id === persona.bdrId);
    if (!bdr) return scoped;
    return scalePeriodDataToNode(scoped, bdr.weight, bdrTotalWeight, seedFromId(bdr.id));
}

/** A persona's display name for the sidebar/header ("Ish Kumar", "Tanvi Shah", "Admin"...). */
export function getPersonaLabel(persona: Persona): string {
    if (persona.role === "admin") return "Admin";
    if (persona.role === "tm") return teamManagers.find((t) => t.id === persona.tmId)?.name ?? "Team Manager";
    if (persona.role === "tl") return teamLeads.find((t) => t.id === persona.tlId)?.name ?? "Team Lead";
    return bdrs.find((b) => b.id === persona.bdrId)?.name ?? "BDR";
}

export type TeamManagerSummary = { id: string; name: string; bookedTotal: number; unitsAchieved: number; unitTarget: number; ats: number };

/** Per-TM revenue/target/ATS rollup for the current period — reuses `scalePeriodDataForPersona`
 * (the same scoping every other card goes through) rather than a separate calculation, so the
 * report table can never silently disagree with the drilldown or the funnel-per-TM blocks. */
export function getTeamManagerSummaries(data: PeriodChartData): TeamManagerSummary[] {
    return teamManagers.map((tm) => {
        const scoped = scalePeriodDataForPersona(data, { role: "tm", tmId: tm.id });
        return { id: tm.id, name: tm.name, bookedTotal: scoped.bookedTotal, unitsAchieved: scoped.unitsAchieved, unitTarget: scoped.unitTarget, ats: scoped.ats };
    });
}

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

export type DealStageBar = { label: string; value: number; colorClassName: string };

/** Deal Stages is the same 6-bucket cascade snapshot for every card that shows it (the bar
 * list here and the funnel cards below) — reading off one shared cascade per period keeps
 * them from ever drifting apart, per whichever period is currently selected. */
export function cascadeToDealStages(cascade: DealStageCascade): DealStageBar[] {
    return [
        { label: "Application", value: cascade.currentStage.applicationStage, colorClassName: "bg-fg-brand-primary" },
        { label: "Offer", value: cascade.currentStage.offerStage, colorClassName: "bg-fg-warning-primary" },
        { label: "Payment", value: cascade.currentStage.paymentStage, colorClassName: "bg-fg-error-secondary" },
        { label: "Completed", value: cascade.currentStage.paymentCompleted, colorClassName: "bg-fg-success-primary" },
        { label: "Not Interested", value: cascade.currentStage.notInterested, colorClassName: "bg-fg-brand-secondary_hover" },
        { label: "Rejected", value: cascade.currentStage.expired, colorClassName: "bg-fg-error-primary" },
    ];
}

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

const dot = {
    neutral: "text-fg-quaternary",
    warning: "text-fg-warning-primary",
    success: "text-fg-success-primary",
    error: "text-fg-error-primary",
    brand: "text-fg-brand-primary",
};

/** Maps a reconciled cascade onto the 4-card funnel shape — same cascade Deal Stages reads. */
function cascadeToFunnelStages(c: DealStageCascade): [FunnelStage, FunnelStage, FunnelStage, FunnelStage] {
    const converted = c.payments.overdue + c.payments.cleared;

    return [
        {
            label: "Applications Sent",
            fraction: "1 / 4",
            value: c.applicationsSent,
            breakdown: [
                { label: "Pending", count: c.applications.pending, dotClassName: dot.neutral },
                { label: "Expired", count: c.applications.expired, dotClassName: dot.error },
                { label: "Filled", count: c.applications.filled, dotClassName: dot.success },
                { label: "Not Interested / Rejected", count: c.applications.notInterestedOrRejected, dotClassName: dot.neutral },
            ],
        },
        {
            label: "Offers Shared",
            fraction: "2 / 4",
            value: c.offers.accepted,
            denominator: c.applications.filled,
            caption: "of Filled",
            breakdown: [
                { label: "Pending", count: c.offers.pending, dotClassName: dot.neutral },
                { label: "Expired", count: c.offers.expired, dotClassName: dot.error },
                { label: "Accepted", count: c.offers.accepted, dotClassName: dot.success },
                { label: "Not Interested / Rejected", count: c.offers.notInterestedOrRejected, dotClassName: dot.neutral },
            ],
        },
        {
            label: "Converted",
            fraction: "3 / 4",
            value: converted,
            denominator: c.offers.accepted,
            caption: "of Offers Shared",
            breakdown: [
                { label: "DP Not Paid", count: c.payments.dpNotPaid, dotClassName: dot.warning },
                { label: "Payment Overdue", count: c.payments.overdue, dotClassName: dot.error },
                { label: "Payment Cleared", count: c.payments.cleared, dotClassName: dot.success },
                { label: "Not Interested / Rejected", count: c.payments.notInterestedOrRejected, dotClassName: dot.neutral },
            ],
        },
        {
            label: "Payment Clearance",
            fraction: "4 / 4",
            value: c.clearance.completed,
            denominator: converted,
            caption: "of Converted",
            breakdown: [
                { label: "Payment Completed", count: c.clearance.completed, dotClassName: dot.success },
                { label: "Enrolment Cancelled", count: c.clearance.enrolmentCancelled, dotClassName: dot.error },
            ],
        },
    ];
}

/**
 * Funnel-card blocks for the current period + persona, per the visibility matrix: Admin sees
 * the org-wide aggregate plus one block per Team Manager; every other persona sees exactly
 * one block, scoped to their own node. Reads off the same `data.cascade` (already scoped to
 * `persona` upstream by `scalePeriodDataForPersona`) the Deal Stages bars use, so the funnel
 * cards can never drift from it or from the currently selected period.
 */
export function getFunnelCohorts(data: PeriodChartData, persona: Persona): FunnelCohort[] {
    if (persona.role !== "admin") {
        return [{ id: getPersonaKey(persona), name: getPersonaLabel(persona), stages: cascadeToFunnelStages(data.cascade) }];
    }

    return [
        { id: "aggregate", name: "ADMIN Funnel — Sales Head", stages: cascadeToFunnelStages(data.cascade) },
        ...teamManagers.map((tm) => ({
            id: tm.id,
            name: `${tm.name} — Team Manager`,
            stages: cascadeToFunnelStages(scaleCascade(data.cascade, tm.weight, TM_TOTAL_WEIGHT, seedFromId(tm.id))),
        })),
    ];
}

function getPersonaKey(persona: Persona): string {
    if (persona.role === "admin") return "admin";
    if (persona.role === "tm") return persona.tmId;
    if (persona.role === "tl") return persona.tlId;
    return persona.bdrId;
}
