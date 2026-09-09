/**
 * Live aggregation layer for the Home dashboard — every number here is computed from the real
 * `Deal[]` roster (via `useDeals()`/`dealsForPersona`), not the synthetic `MONTHS`/cascade model
 * in dashboard-data.ts (that file's `MONTHS`/`buildCascade` stay in place only as the generator
 * that seeded the roster in the first place — see its header comment). Mutating a deal through
 * the Learner Sim Pad now moves every card that reads through here.
 */
import type { Persona } from "@/types/role";
import type { Deal, DealStatusId } from "./deals-data";
import { COURSES, dealsForPersona } from "./deals-data";
import type {
    ChartPoint,
    DealStageBar,
    DealStageCascade,
    FunnelCohort,
    FunnelStage,
    PeriodChartData,
    PeriodSelection,
    TeamManagerSummary,
} from "./dashboard-data";
import {
    DATA_WINDOW_END,
    DATA_WINDOW_START,
    MONTHS,
    ORG_WIDE_DAILY_TARGET_RATE,
    PROTOTYPE_TODAY,
    TM_TOTAL_WEIGHT,
    bdrs,
    getPersonaLabel,
    periods,
    scaleForWeight,
    teamLeads,
    teamManagers,
} from "./dashboard-data";

// ---------------------------------------------------------------------------
// Date/period bounds — the live equivalent of dashboard-data.ts's buildMonthPeriod/
// buildQuarterPeriod, but resolving a selection to plain [from, to] bounds instead of
// bundling that together with synthetic-series generation.
// ---------------------------------------------------------------------------

export type PeriodBounds = { from: Date; to: Date; truncated: boolean };

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1);
const lastDayOfMonth = (year: number, month: number) => new Date(year, month + 1, 0);
const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};
const dayCount = (from: Date, to: Date) => Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000) + 1;
const formatShortDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

function monthBounds(year: number, month: number) {
    return { from: firstDayOfMonth(year, month), to: lastDayOfMonth(year, month) };
}

function quarterBounds(year: number, quarterIndex: number) {
    const startMonth = quarterIndex * 3;
    return { from: firstDayOfMonth(year, startMonth), to: lastDayOfMonth(year, startMonth + 2) };
}

function clampToToday(bounds: { from: Date; to: Date }): PeriodBounds {
    if (bounds.to > PROTOTYPE_TODAY) return { from: bounds.from, to: PROTOTYPE_TODAY, truncated: true };
    return { ...bounds, truncated: false };
}

/** Resolves a `PeriodSelection` to concrete calendar bounds, relative to the same fixed
 * `PROTOTYPE_TODAY` every deal's own dates are generated against — "this month" always means
 * August 2025 for as long as the prototype's clock is pinned there. */
export function resolvePeriodBounds(selection: PeriodSelection): PeriodBounds {
    if (selection.kind === "custom") {
        const from = startOfDay(selection.from);
        const to = startOfDay(selection.to);
        return to > PROTOTYPE_TODAY ? { from, to: PROTOTYPE_TODAY, truncated: true } : { from, to, truncated: false };
    }

    const now = PROTOTYPE_TODAY;
    switch (selection.id) {
        case "this-month":
            return clampToToday(monthBounds(now.getFullYear(), now.getMonth()));
        case "last-month": {
            const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            return { ...monthBounds(year, month), truncated: false };
        }
        case "this-quarter":
            return clampToToday(quarterBounds(now.getFullYear(), Math.floor(now.getMonth() / 3)));
        case "last-quarter": {
            const q = Math.floor(now.getMonth() / 3) - 1;
            return q >= 0 ? { ...quarterBounds(now.getFullYear(), q), truncated: false } : { ...quarterBounds(now.getFullYear() - 1, 3), truncated: false };
        }
        case "lifetime":
            return { from: DATA_WINDOW_START, to: DATA_WINDOW_END, truncated: false };
    }
}

/** The immediately preceding equivalent-length period, for period-over-period % change. When
 * the current period is truncated to `PROTOTYPE_TODAY` (an in-progress month/quarter), the
 * previous window is truncated to the SAME day count — comparing "26 days of August" against
 * a full July would bake in a built-in negative bias that has nothing to do with performance.
 * Returns `null` when there's no prior data at all (e.g. Last Quarter, which starts exactly at
 * the seeded data's own start). */
export function getPreviousEquivalentBounds(selection: PeriodSelection): PeriodBounds | null {
    const current = resolvePeriodBounds(selection);
    let previous: PeriodBounds;

    if (selection.kind === "custom") {
        const length = dayCount(current.from, current.to);
        const to = addDays(current.from, -1);
        previous = { from: addDays(to, -(length - 1)), to, truncated: false };
    } else {
        switch (selection.id) {
            case "this-month": {
                const prior = resolvePeriodBounds({ kind: "preset", id: "last-month" });
                const to = current.truncated ? addDays(prior.from, dayCount(current.from, current.to) - 1) : prior.to;
                previous = { from: prior.from, to, truncated: current.truncated };
                break;
            }
            case "last-month": {
                const month = current.from.getMonth() === 0 ? 11 : current.from.getMonth() - 1;
                const year = current.from.getMonth() === 0 ? current.from.getFullYear() - 1 : current.from.getFullYear();
                previous = { ...monthBounds(year, month), truncated: false };
                break;
            }
            case "this-quarter": {
                const prior = resolvePeriodBounds({ kind: "preset", id: "last-quarter" });
                const to = current.truncated ? addDays(prior.from, dayCount(current.from, current.to) - 1) : prior.to;
                previous = { from: prior.from, to, truncated: current.truncated };
                break;
            }
            case "last-quarter": {
                const q = Math.floor(current.from.getMonth() / 3) - 1;
                previous =
                    q >= 0
                        ? { ...quarterBounds(current.from.getFullYear(), q), truncated: false }
                        : { ...quarterBounds(current.from.getFullYear() - 1, 3), truncated: false };
                break;
            }
            case "lifetime":
                // No period exists before the seeded data's own start — there's nothing to compare against.
                return null;
        }
    }

    if (previous.to < DATA_WINDOW_START) return null;
    if (previous.from < DATA_WINDOW_START) previous = { ...previous, from: DATA_WINDOW_START };
    return previous;
}

/** Sales targets are goals, not deal-derived data — they stay sourced from the static `MONTHS`
 * config (looked up by calendar identity, so "This Quarter" always sums exactly the real
 * months it nominally covers, ignoring truncation — you want the full month's target next to
 * partial actual progress, not a partial target). */
export function resolveUnitTarget(selection: PeriodSelection): number {
    if (selection.kind === "custom") {
        return Math.round(ORG_WIDE_DAILY_TARGET_RATE * dayCount(startOfDay(selection.from), startOfDay(selection.to)));
    }

    const now = PROTOTYPE_TODAY;
    const sumMonths = (year: number, quarterIndex: number) =>
        MONTHS.filter((m) => m.year === year && Math.floor(m.month / 3) === quarterIndex).reduce((sum, m) => sum + m.unitTarget, 0);

    switch (selection.id) {
        case "this-month":
            return MONTHS.find((m) => m.year === now.getFullYear() && m.month === now.getMonth())?.unitTarget ?? 0;
        case "last-month": {
            const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            return MONTHS.find((m) => m.year === year && m.month === month)?.unitTarget ?? 0;
        }
        case "this-quarter":
            return sumMonths(now.getFullYear(), Math.floor(now.getMonth() / 3));
        case "last-quarter": {
            const q = Math.floor(now.getMonth() / 3) - 1;
            return q >= 0 ? sumMonths(now.getFullYear(), q) : sumMonths(now.getFullYear() - 1, 3);
        }
        case "lifetime":
            return MONTHS.reduce((sum, m) => sum + m.unitTarget, 0);
    }
}

/** Walks the org-wide target down through real weights to whatever a `Persona` should see —
 * same weight-rollup pattern the old model used everywhere, kept here since targets (unlike
 * revenue/units) are legitimately not something to compute from real deals. */
export function resolveUnitTargetForPersona(selection: PeriodSelection, persona: Persona): number {
    const orgWide = resolveUnitTarget(selection);
    if (persona.role === "admin") return orgWide;

    const tm = teamManagers.find((t) => t.id === persona.tmId);
    if (!tm) return 0;
    let value = scaleForWeight(orgWide, tm.weight, TM_TOTAL_WEIGHT, true);
    if (persona.role === "tm") return value;

    const tlSiblings = teamLeads.filter((tl) => tl.tmId === persona.tmId);
    const tlTotalWeight = tlSiblings.reduce((sum, tl) => sum + tl.weight, 0);
    const tl = tlSiblings.find((t) => t.id === persona.tlId);
    if (!tl) return value;
    value = scaleForWeight(value, tl.weight, tlTotalWeight, true);
    if (persona.role === "tl") return value;

    const bdrSiblings = bdrs.filter((b) => b.tlId === persona.tlId);
    const bdrTotalWeight = bdrSiblings.reduce((sum, b) => sum + b.weight, 0);
    const bdr = bdrSiblings.find((b) => b.id === persona.bdrId);
    if (!bdr) return value;
    return scaleForWeight(value, bdr.weight, bdrTotalWeight, true);
}

// ---------------------------------------------------------------------------
// Currency — 15% of deals are USD. Converted only at aggregation time (never mutates the
// stored `Deal`), at a fixed prototype rate — there's no real FX precedent anywhere else in
// this codebase, and the alternative (silently summing INR+USD raw) is flat-out wrong math.
// ---------------------------------------------------------------------------

const USD_TO_INR = 83;

function toInr(amount: number, currency: "INR" | "USD"): number {
    return currency === "USD" ? Math.round(amount * USD_TO_INR) : amount;
}

export const inRange = (date: Date | null, bounds: PeriodBounds): date is Date =>
    date !== null && date.getTime() >= bounds.from.getTime() && date.getTime() <= bounds.to.getTime();

// ---------------------------------------------------------------------------
// Cohort — the single source of truth Deal Stages, the Funnel, and Lost Deals all read off,
// so they can never drift from each other. A deal enters the funnel the moment its
// application is sent; one still `APP_NEW` (never sent) isn't in it yet.
// ---------------------------------------------------------------------------

export function getCohort(persona: Persona, bounds: PeriodBounds, deals: Deal[]): Deal[] {
    return dealsForPersona(persona, deals).filter((d) => inRange(d.application.sentOn, bounds));
}

// ---------------------------------------------------------------------------
// Booked / Realised
// ---------------------------------------------------------------------------

function computeBookedRealised(personaDeals: Deal[], bounds: PeriodBounds) {
    let bookedTotal = 0;
    let unitsAchieved = 0;
    let totalRealised = 0;
    let realisedOfPreviouslyBooked = 0;

    for (const d of personaDeals) {
        if (inRange(d.booking.bookedOn, bounds)) {
            bookedTotal += toInr(d.booking.bookedValue, d.currency);
            unitsAchieved += 1;
        }
        const bookedBeforePeriod = d.booking.bookedOn !== null && d.booking.bookedOn.getTime() < bounds.from.getTime();
        for (const inst of d.installments) {
            if (inRange(inst.paidOn, bounds)) {
                const amount = toInr(inst.amount, d.currency);
                totalRealised += amount;
                if (bookedBeforePeriod) realisedOfPreviouslyBooked += amount;
            }
        }
    }

    const ats = unitsAchieved === 0 ? 0 : Math.round(bookedTotal / unitsAchieved);
    return { bookedTotal, unitsAchieved, totalRealised, realisedOfPreviouslyBooked, ats };
}

function computeChangePercent(current: number, previous: number | null): number | null {
    if (previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

function previousPeriodLabel(selection: PeriodSelection): string {
    if (selection.kind === "custom") return "vs Previous Period";
    switch (selection.id) {
        case "this-month":
            return "vs Last Month";
        case "last-month":
            return "vs Previous Month";
        case "this-quarter":
            return "vs Last Quarter";
        case "last-quarter":
            return "vs Previous Quarter";
        case "lifetime":
            // Unreachable in practice — getPreviousEquivalentBounds returns null for "lifetime",
            // so computeChangeText's null-check short-circuits before this is ever called.
            return "vs Previous Period";
    }
}

function computeChangeText(current: number, previous: number | null, selection: PeriodSelection): string {
    const pct = computeChangePercent(current, previous);
    if (pct === null) return "No prior period data";
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% ${previousPeriodLabel(selection)}`;
}

/** Reads the sign back out of a `changeText` produced above, so a consuming component can pick
 * the right arrow direction/color without re-deriving the underlying numbers itself. */
export function changeDirectionFromText(changeText: string): "up" | "down" | "neutral" {
    if (changeText.startsWith("+")) return "up";
    if (changeText.startsWith("-")) return "down";
    return "neutral";
}

// ---------------------------------------------------------------------------
// Daily chart series
// ---------------------------------------------------------------------------

function buildDailyChartPoints(personaDeals: Deal[], bounds: PeriodBounds): ChartPoint[] {
    const days = dayCount(bounds.from, bounds.to);
    const bookedByDay = new Map<number, number>();
    const realisedByDay = new Map<number, number>();

    for (const d of personaDeals) {
        const bookedOn = d.booking.bookedOn;
        const bookedInPeriod = inRange(bookedOn, bounds);
        if (bookedInPeriod) {
            const idx = dayCount(bounds.from, bookedOn) - 1;
            bookedByDay.set(idx, (bookedByDay.get(idx) ?? 0) + toInr(d.booking.bookedValue, d.currency));
        }
        // Realised is period-scoped: only installments paid on deals that were also booked in
        // this same period count toward the chart line (matches "this period's own realised",
        // not the separate "previously booked" ledger the stat card shows alongside it).
        if (!bookedInPeriod) continue;
        for (const inst of d.installments) {
            if (inRange(inst.paidOn, bounds)) {
                const idx = dayCount(bounds.from, inst.paidOn) - 1;
                realisedByDay.set(idx, (realisedByDay.get(idx) ?? 0) + toInr(inst.amount, d.currency));
            }
        }
    }

    const points: ChartPoint[] = [];
    let bookedCumulative = 0;
    let realisedCumulative = 0;
    for (let i = 0; i < days; i++) {
        bookedCumulative += bookedByDay.get(i) ?? 0;
        realisedCumulative += realisedByDay.get(i) ?? 0;
        points.push({ x: i + 1, date: addDays(bounds.from, i), booked: bookedCumulative, realised: realisedCumulative });
    }
    return points;
}

function buildXAxisMeta(bounds: PeriodBounds, selection: PeriodSelection): { xDomain: [number, number]; xTicks: number[]; xTickFormatter: (x: number) => string } {
    const totalDays = dayCount(bounds.from, bounds.to);

    if (selection.kind === "preset" && (selection.id === "this-month" || selection.id === "last-month")) {
        const ticks = [1, 5, 10, 15, 20, 25].filter((t) => t <= totalDays);
        if (!ticks.includes(totalDays)) ticks.push(totalDays);
        return { xDomain: [1, totalDays], xTicks: ticks, xTickFormatter: (x) => String(x) };
    }

    if (selection.kind === "preset" && (selection.id === "this-quarter" || selection.id === "last-quarter")) {
        const ticks: number[] = [1];
        const labels = new Map<number, string>([[1, MONTH_ABBR[bounds.from.getMonth()]]]);
        let cursor = new Date(bounds.from.getFullYear(), bounds.from.getMonth() + 1, 1);
        while (cursor <= bounds.to) {
            const idx = dayCount(bounds.from, cursor);
            ticks.push(idx);
            labels.set(idx, MONTH_ABBR[cursor.getMonth()]);
            cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }
        return { xDomain: [1, totalDays], xTicks: ticks, xTickFormatter: (x) => labels.get(x) ?? "" };
    }

    // Custom range (and Lifetime, which spans a fixed but non-quarter-aligned window) — no
    // fixed calendar shape to hang ticks off, so just space a handful out.
    const tickCount = Math.min(6, totalDays);
    const xTicks = Array.from({ length: tickCount }, (_, i) => Math.round(1 + (i * (totalDays - 1)) / Math.max(1, tickCount - 1)));
    return { xDomain: [1, totalDays], xTicks, xTickFormatter: (x) => formatShortDate(addDays(bounds.from, x - 1)) };
}

// ---------------------------------------------------------------------------
// Deal Stages — exhaustive, non-overlapping partition of every reachable `DealStatusId`
// (APP_NEW is excluded structurally, by the cohort filter, since it's never "sent").
// ---------------------------------------------------------------------------

const APPLICATION_STAGE_IDS = new Set<DealStatusId>(["APP_PENDING", "APP_FILLED", "PLAN_NOT_STARTED", "PLAN_DRAFT", "PLAN_AWAITING_APPROVAL"]);
const OFFER_STAGE_IDS = new Set<DealStatusId>(["OFFER_PENDING", "OFFER_ACCEPTED", "OFFER_WITHDRAWN"]);
const PAYMENT_STAGE_IDS = new Set<DealStatusId>(["PAY_ONGOING", "PAY_DUE", "PAY_OVERDUE"]);
const NOT_INTERESTED_IDS = new Set<DealStatusId>(["NOT_INTERESTED", "SAVED"]);
const REJECTED_IDS = new Set<DealStatusId>(["APP_EXPIRED", "OFFER_EXPIRED", "REJECTED", "ENR_CANCELLED"]);

/** Live equivalent of `buildCascade` — only `.currentStage` carries real numbers (the only
 * part `cascadeToDealStages` and the funnel actually read); the other nested fields exist
 * purely so `PeriodChartData['cascade']` keeps its type shape. */
export function buildLiveCascade(cohort: Deal[]): DealStageCascade {
    let applicationStage = 0;
    let offerStage = 0;
    let paymentStage = 0;
    let paymentCompleted = 0;
    let notInterested = 0;
    let expired = 0;

    for (const d of cohort) {
        const id = d.status.id;
        if (APPLICATION_STAGE_IDS.has(id)) applicationStage++;
        else if (OFFER_STAGE_IDS.has(id)) offerStage++;
        else if (PAYMENT_STAGE_IDS.has(id)) paymentStage++;
        else if (id === "PAY_COMPLETED") paymentCompleted++;
        else if (NOT_INTERESTED_IDS.has(id)) notInterested++;
        else if (REJECTED_IDS.has(id)) expired++;
    }

    return {
        applicationsSent: cohort.length,
        applications: { pending: 0, expired: 0, filled: 0, notInterestedOrRejected: 0 },
        offers: { pending: 0, expired: 0, accepted: 0, notInterestedOrRejected: 0 },
        payments: { dpNotPaid: 0, overdue: 0, cleared: 0, notInterestedOrRejected: 0 },
        clearance: { completed: paymentCompleted, enrolmentCancelled: 0 },
        currentStage: { applicationStage, offerStage, paymentStage, paymentCompleted, expired, notInterested },
    };
}

const DEAL_STAGE_BAR_GROUPS: { label: string; ids: DealStatusId[]; colorClassName: string; hatched?: boolean; gradient?: boolean; attentionIds?: DealStatusId[]; attentionLabel?: string }[] = [
    // "Needs attention" = New (assigned, form not even sent yet) + Expired (form sent but the
    // window lapsed with no action) — both are stalled and need a BDR to act, unlike Pending
    // (form sent, still within its live window).
    //
    // NOTE: APP_FILLED isn't claimed by any of the 8 groups below — it was previously folded
    // into "Offer Letters" as a stand-in, but that bar is now explicitly scoped to exactly
    // OFFER_PENDING/ACCEPTED/EXPIRED/WITHDRAWN per Manik's spec, with nowhere else specified for
    // it. Flagging rather than guessing again: any deal sitting at APP_FILLED currently isn't
    // counted in any Deal Stages bar.
    { label: "Application", ids: ["APP_NEW", "APP_PENDING", "APP_EXPIRED"], colorClassName: "bg-utility-blue-400", attentionIds: ["APP_NEW", "APP_EXPIRED"], attentionLabel: "need attention" },
    { label: "Payment Plan Pending", ids: ["PLAN_NOT_STARTED", "PLAN_AWAITING_APPROVAL"], colorClassName: "bg-utility-purple-400", hatched: true },
    // PLAN_DRAFT (displayed "Plan · Created" — label is literally "Created", see deals-data.ts)
    // is the actual status for "plan created, offer not yet shared" that Manik was originally
    // after — moved here from Payment Plan Pending. It's counted in the total but deliberately
    // left out of `attentionIds`, matching the original spec ("the number inside the 3rd bar
    // should include Offer Pending/Accepted/Expired/Withdrawn" — Plan Created wasn't one of them).
    {
        label: "Offer Letters",
        ids: ["PLAN_DRAFT", "OFFER_PENDING", "OFFER_ACCEPTED", "OFFER_EXPIRED", "OFFER_WITHDRAWN"],
        colorClassName: "bg-fg-warning-secondary",
        attentionIds: ["OFFER_PENDING", "OFFER_ACCEPTED", "OFFER_EXPIRED", "OFFER_WITHDRAWN"],
        attentionLabel: "need attention",
    },
    { label: "Payment Overdue", ids: ["PAY_OVERDUE"], colorClassName: "bg-fg-error-secondary" },
    { label: "Payment Ongoing", ids: ["PAY_ONGOING", "PAY_DUE"], colorClassName: "bg-utility-indigo-400" },
    // ENR_CANCELLED joins Payment Completed here — those deals were fully paid before the
    // enrolment was cancelled on the backend (see deals-data.ts:697), so they're still
    // "completed" payments, just with a later cancellation event layered on top.
    { label: "Payment Completed", ids: ["PAY_COMPLETED", "ENR_CANCELLED"], colorClassName: "bg-fg-success-primary", gradient: true },
    { label: "Not Interested", ids: ["NOT_INTERESTED", "SAVED"], colorClassName: "bg-fg-tertiary" },
    // OFFER_EXPIRED moved to "Offer Letters" above per Manik's spec — kept here previously, now
    // just REJECTED so nothing is double-counted across bars.
    { label: "Rejected", ids: ["REJECTED"], colorClassName: "bg-fg-error-primary", hatched: true },
];

/** Deal Stages (Figma node 548:15755) — 8 bars classified directly off each deal's real
 * `status.id`, the same way `buildLiveCascade` classifies its 6, just with finer splits where
 * the status model actually supports them (Payment Ongoing/Due vs Overdue; payment-plan-pending
 * as its own bucket; Not Interested and Rejected surfaced separately instead of folded into one
 * "expired" bucket). Every status *except* `APP_FILLED` lands in exactly one group — see the
 * note above the "Application" entry in `DEAL_STAGE_BAR_GROUPS` for why that one's unclaimed.
 *
 * Unlike the Sales Funnel (which reads `getCohort`, scoped to deals whose application was
 * actually *sent*), this reads the raw `createdOn`-filtered roster — the same basis the Deals
 * List page uses — because the Application bar needs to surface `APP_NEW` deals (assigned but
 * not yet sent) as the "needs attention" count, and `getCohort` excludes those by design. */
export function getDealStageBars(selection: PeriodSelection, persona: Persona, deals: Deal[]): DealStageBar[] {
    const bounds = resolvePeriodBounds(selection);
    const cohort = dealsForPersona(persona, deals).filter((d) => inRange(d.createdOn, bounds));

    return DEAL_STAGE_BAR_GROUPS.map((group) => ({
        label: group.label,
        value: cohort.filter((d) => group.ids.includes(d.status.id)).length,
        colorClassName: group.colorClassName,
        hatched: group.hatched,
        gradient: group.gradient,
        attentionValue: group.attentionIds ? cohort.filter((d) => group.attentionIds!.includes(d.status.id)).length : undefined,
        attentionLabel: group.attentionLabel,
    }));
}

// ---------------------------------------------------------------------------
// Funnel — "remainder bucket" pattern: every breakdown item but the last is an explicit status
// predicate, and the last is `stageCohort.length - sum(others)`, so breakdowns always sum to
// the headline number even for edge-case deals (e.g. a Not-Interested deal that had already
// reached the Offer step before falling out — real, seeded behavior, not hypothetical).
// ---------------------------------------------------------------------------

const dot = {
    neutral: "text-fg-quaternary",
    warning: "text-fg-warning-primary",
    success: "text-fg-success-primary",
    error: "text-fg-error-primary",
};

export function buildFunnelStages(cohort: Deal[]): [FunnelStage, FunnelStage, FunnelStage, FunnelStage] {
    const countIds = (deals: Deal[], ids: DealStatusId[]) => deals.filter((d) => ids.includes(d.status.id)).length;

    const pending1 = countIds(cohort, ["APP_PENDING"]);
    const expired1 = countIds(cohort, ["APP_EXPIRED"]);
    const notInterested1 = countIds(cohort, ["NOT_INTERESTED", "REJECTED", "SAVED"]);
    const filled = cohort.length - pending1 - expired1 - notInterested1;

    const stage1: FunnelStage = {
        label: "Applications Sent",
        fraction: "1 / 4",
        value: cohort.length,
        breakdown: [
            { label: "Pending", count: pending1, dotClassName: dot.neutral },
            { label: "Expired", count: expired1, dotClassName: dot.error },
            { label: "Not Interested / Rejected", count: notInterested1, dotClassName: dot.neutral },
            { label: "Filled", count: filled, dotClassName: dot.success },
        ],
    };

    const offersCohort = cohort.filter((d) => d.reachedStage >= 2);
    const pending2 = countIds(offersCohort, ["OFFER_PENDING"]);
    const expired2 = countIds(offersCohort, ["OFFER_EXPIRED"]);
    const withdrawn2 = countIds(offersCohort, ["OFFER_WITHDRAWN"]);
    const accepted2 = offersCohort.length - pending2 - expired2 - withdrawn2;

    const stage2: FunnelStage = {
        label: "Offers Shared",
        fraction: "2 / 4",
        value: offersCohort.length,
        denominator: filled,
        caption: "of Filled",
        breakdown: [
            { label: "Pending", count: pending2, dotClassName: dot.neutral },
            { label: "Expired", count: expired2, dotClassName: dot.error },
            { label: "Withdrawn", count: withdrawn2, dotClassName: dot.warning },
            { label: "Accepted", count: accepted2, dotClassName: dot.success },
        ],
    };

    const paidCohort = cohort.filter((d) => d.reachedStage >= 3);
    const ongoing3 = countIds(paidCohort, ["PAY_ONGOING"]);
    const due3 = countIds(paidCohort, ["PAY_DUE"]);
    const overdue3 = countIds(paidCohort, ["PAY_OVERDUE"]);
    const cleared3 = paidCohort.length - ongoing3 - due3 - overdue3;

    const stage3: FunnelStage = {
        label: "Converted",
        fraction: "3 / 4",
        value: paidCohort.length,
        denominator: offersCohort.length,
        caption: "of Offers Shared",
        breakdown: [
            { label: "Ongoing", count: ongoing3, dotClassName: dot.success },
            { label: "Due", count: due3, dotClassName: dot.warning },
            { label: "Overdue", count: overdue3, dotClassName: dot.error },
            { label: "Cleared", count: cleared3, dotClassName: dot.success },
        ],
    };

    const completed4 = countIds(cohort, ["PAY_COMPLETED"]);
    const cancelled4 = countIds(cohort, ["ENR_CANCELLED"]);

    const stage4: FunnelStage = {
        label: "Payment Clearance",
        fraction: "4 / 4",
        value: completed4,
        denominator: paidCohort.length,
        caption: "of Converted",
        breakdown: [
            { label: "Completed", count: completed4, dotClassName: dot.success },
            { label: "Cancelled", count: cancelled4, dotClassName: dot.error },
        ],
    };

    return [stage1, stage2, stage3, stage4];
}

function getPersonaKey(persona: Persona): string {
    if (persona.role === "admin") return "admin";
    if (persona.role === "tm") return persona.tmId;
    if (persona.role === "tl") return persona.tlId;
    return persona.bdrId;
}

/** Funnel-card blocks for the current period + persona: Admin sees the org-wide aggregate plus
 * one real block per Team Manager (each built from that TM's own deals — a literal filter, not
 * a statistical split of the aggregate); every other persona sees exactly one block, scoped to
 * their own node. */
export function getFunnelCohortsLive(selection: PeriodSelection, persona: Persona, deals: Deal[]): FunnelCohort[] {
    const bounds = resolvePeriodBounds(selection);

    if (persona.role !== "admin") {
        return [{ id: getPersonaKey(persona), name: getPersonaLabel(persona), stages: buildFunnelStages(getCohort(persona, bounds, deals)) }];
    }

    return [
        { id: "aggregate", name: "ADMIN Funnel — Sales Head", stages: buildFunnelStages(getCohort(persona, bounds, deals)) },
        ...teamManagers.map((tm) => ({
            id: tm.id,
            name: `${tm.name} — Team Manager`,
            stages: buildFunnelStages(getCohort({ role: "tm", tmId: tm.id }, bounds, deals)),
        })),
    ];
}

// ---------------------------------------------------------------------------
// Sales Funnel flow (Sankey) — reuses the exact same cohort and `reachedStage` thresholds
// `buildFunnelStages` already uses for its Application/Offer/Payment values (checked by a
// dev-time assertion below, so the two can never silently disagree). What's new here:
// `buildFunnelStages` pools every Expired/Not-Interested/Rejected deal into one remainder
// bucket per stage without caring *when* it fell off — this needs to know which transition,
// which the existing shape doesn't expose.
// ---------------------------------------------------------------------------

export type FunnelFlowSubBand = { key: string; label: string; count: number };
export type FunnelFlowNodeId = "application" | "offer" | "payment" | "completed";
export type FunnelFlowNode = { id: FunnelFlowNodeId; label: string; value: number; subBands: FunnelFlowSubBand[] };
export type FunnelFlow = {
    cohortSize: number;
    nodes: [FunnelFlowNode, FunnelFlowNode, FunnelFlowNode, FunnelFlowNode];
    /** Count peeling off at each transition: Application→Offer, Offer→Payment, then
     * Payment→Completed. The last one is cancelled enrolments (paid in full, then cancelled on
     * the backend — doesn't count as Completed, per Manik's call) plus deals that went cold
     * mid-payment (Global status, stalled before finishing) — still-paying deals (Ongoing/Due/
     * Overdue) are NOT a dropout here, they just haven't reached Completed yet. */
    dropouts: [number, number, number];
    /** Why, for each transition — same deals as `dropouts`, broken out by status. */
    dropoutBreakdown: [FunnelFlowSubBand[], FunnelFlowSubBand[], FunnelFlowSubBand[]];
    /** (count continuing forward) / (count entering that stage): Offer/Application,
     * Payment/Offer, then Completed/Payment. */
    conversionPct: [number, number, number];
};

const DROPPED_STATUS_IDS: DealStatusId[] = ["APP_EXPIRED", "OFFER_EXPIRED", "NOT_INTERESTED", "REJECTED", "SAVED"];
const DROPPED_STATUS_LABELS: Partial<Record<DealStatusId, string>> = {
    APP_EXPIRED: "Expired",
    OFFER_EXPIRED: "Expired",
    NOT_INTERESTED: "Not Interested",
    REJECTED: "Rejected",
    SAVED: "Saved",
    ENR_CANCELLED: "Cancelled",
};

function dropoutBreakdownFor(deals: Deal[]): FunnelFlowSubBand[] {
    const counts = new Map<string, number>();
    for (const d of deals) {
        const label = DROPPED_STATUS_LABELS[d.status.id] ?? d.status.id;
        counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return Array.from(counts.entries())
        .map(([label, count]) => ({ key: label.toLowerCase().replace(/\s+/g, "-"), label, count }))
        .sort((a, b) => b.count - a.count);
}

function buildSalesFunnelFlow(cohort: Deal[]): FunnelFlow {
    const offerCohort = cohort.filter((d) => d.reachedStage >= 2);
    const paymentCohort = cohort.filter((d) => d.reachedStage >= 3);

    // Dropout attribution: `APP_EXPIRED`/`OFFER_EXPIRED` always carry a fixed `reachedStage`
    // (0 and 2 respectively, per STAGE_RANK). The three "Global" statuses (Not Interested /
    // Rejected / Saved) are seeded with a random `reachedStage` independent of their label —
    // exactly what "furthest point reached" means, so reading it here to place them is a
    // legitimate use of the same field, not a new interpretation of it.
    const dropped = cohort.filter((d) => DROPPED_STATUS_IDS.includes(d.status.id));
    const droppedAtApplicationDeals = dropped.filter((d) => d.reachedStage <= 1);
    const droppedAtOfferDeals = dropped.filter((d) => d.reachedStage === 2);
    const droppedAtApplication = droppedAtApplicationDeals.length;
    const droppedAtOffer = droppedAtOfferDeals.length;
    const wentColdAtPaymentDeals = dropped.filter((d) => d.reachedStage === 3);

    const applicationPending = cohort.filter((d) => d.status.id === "APP_PENDING").length;
    const applicationFilled = cohort.length - offerCohort.length - droppedAtApplication - applicationPending;

    const offerPending = offerCohort.filter((d) => d.status.id === "OFFER_PENDING").length;
    const offerWithdrawn = offerCohort.filter((d) => d.status.id === "OFFER_WITHDRAWN").length;
    const offerAccepted = offerCohort.length - paymentCohort.length - droppedAtOffer - offerPending - offerWithdrawn;

    const paymentOngoing = paymentCohort.filter((d) => PAYMENT_STAGE_IDS.has(d.status.id)).length;
    const completedDeals = paymentCohort.filter((d) => d.status.id === "PAY_COMPLETED");
    const cancelledDeals = paymentCohort.filter((d) => d.status.id === "ENR_CANCELLED");

    // Payment → Completed dropout: cancelled enrolments (paid in full, then cancelled on the
    // backend — doesn't count as Completed, per Manik's call) plus deals that went cold
    // mid-payment. Still-paying deals (Ongoing/Due/Overdue) are excluded — they haven't dropped
    // out, they just haven't reached Completed yet, same as "Offer Pending" isn't a dropout.
    const droppedAtPaymentDeals = [...cancelledDeals, ...wentColdAtPaymentDeals];
    const droppedAtPayment = droppedAtPaymentDeals.length;

    const nodes: [FunnelFlowNode, FunnelFlowNode, FunnelFlowNode, FunnelFlowNode] = [
        {
            id: "application",
            label: "Application",
            value: cohort.length,
            subBands: [
                { key: "pending", label: "Pending", count: applicationPending },
                { key: "filled", label: "Filled", count: applicationFilled },
            ],
        },
        {
            id: "offer",
            label: "Offer",
            value: offerCohort.length,
            subBands: [
                { key: "pending", label: "Pending", count: offerPending },
                { key: "withdrawn", label: "Withdrawn", count: offerWithdrawn },
                { key: "accepted", label: "Accepted", count: offerAccepted },
            ],
        },
        {
            id: "payment",
            label: "Payment",
            value: paymentCohort.length,
            // Cancelled/Went Cold moved out to the Payment→Completed dropout above, now that
            // there's a real downstream node for them to peel toward — dropouts are exclusive of
            // a node's own sub-bands, same as Application's "Filled" already excludes its dropouts.
            subBands: [
                { key: "ongoing", label: "Ongoing", count: paymentOngoing },
                { key: "completed", label: "Completed", count: completedDeals.length },
            ],
        },
        {
            id: "completed",
            label: "Completed",
            value: completedDeals.length,
            subBands: [],
        },
    ];

    const flow: FunnelFlow = {
        cohortSize: cohort.length,
        nodes,
        dropouts: [droppedAtApplication, droppedAtOffer, droppedAtPayment],
        dropoutBreakdown: [
            dropoutBreakdownFor(droppedAtApplicationDeals),
            dropoutBreakdownFor(droppedAtOfferDeals),
            dropoutBreakdownFor(droppedAtPaymentDeals),
        ],
        conversionPct: [
            cohort.length === 0 ? 0 : Math.round((offerCohort.length / cohort.length) * 100),
            offerCohort.length === 0 ? 0 : Math.round((paymentCohort.length / offerCohort.length) * 100),
            paymentCohort.length === 0 ? 0 : Math.round((completedDeals.length / paymentCohort.length) * 100),
        ],
    };

    if (import.meta.env.DEV) {
        const stages = buildFunnelStages(cohort);
        if (
            flow.nodes[0].value !== stages[0].value ||
            flow.nodes[1].value !== stages[1].value ||
            flow.nodes[2].value !== stages[2].value ||
            flow.nodes[3].value !== stages[3].value
        ) {
            console.error("[sales-funnel-flow invariant failed] node totals diverge from buildFunnelStages", { flow, stages });
        }
    }

    return flow;
}

export function getSalesFunnelFlow(selection: PeriodSelection, persona: Persona, deals: Deal[]): FunnelFlow {
    const bounds = resolvePeriodBounds(selection);
    return buildSalesFunnelFlow(getCohort(persona, bounds, deals));
}

export function getSalesFunnelHeadline(
    selection: PeriodSelection,
    persona: Persona,
    deals: Deal[],
): { applicationsSent: number; applicationsSentChangePct: number | null; conversionPct: number; conversionChangePct: number | null } {
    const bounds = resolvePeriodBounds(selection);
    const cohort = getCohort(persona, bounds, deals);
    const completed = cohort.filter((d) => d.status.id === "PAY_COMPLETED").length;
    const conversionPct = cohort.length === 0 ? 0 : Math.round((completed / cohort.length) * 100);

    const previousBounds = getPreviousEquivalentBounds(selection);
    let applicationsSentChangePct: number | null = null;
    let conversionChangePct: number | null = null;
    if (previousBounds) {
        const previousCohort = getCohort(persona, previousBounds, deals);
        applicationsSentChangePct = computeChangePercent(cohort.length, previousCohort.length);
        const previousCompleted = previousCohort.filter((d) => d.status.id === "PAY_COMPLETED").length;
        const previousConversionPct = previousCohort.length === 0 ? 0 : (previousCompleted / previousCohort.length) * 100;
        conversionChangePct = computeChangePercent(conversionPct, previousConversionPct);
    }

    return { applicationsSent: cohort.length, applicationsSentChangePct, conversionPct, conversionChangePct };
}

export type SalesFunnelCourseRow = {
    courseId: string;
    courseLabel: string;
    application: number;
    offer: number;
    offerConversionPct: number;
    payment: number;
    paymentConversionPct: number;
    completed: number;
    completedConversionPct: number;
};

export function getSalesFunnelCourseBreakdown(selection: PeriodSelection, persona: Persona, deals: Deal[]): SalesFunnelCourseRow[] {
    const bounds = resolvePeriodBounds(selection);
    const cohort = getCohort(persona, bounds, deals);

    return COURSES.map((course) => {
        const courseCohort = cohort.filter((d) => d.course.id === course.id);
        const application = courseCohort.length;
        const offer = courseCohort.filter((d) => d.reachedStage >= 2).length;
        const payment = courseCohort.filter((d) => d.reachedStage >= 3).length;
        const completed = courseCohort.filter((d) => d.status.id === "PAY_COMPLETED").length;
        return {
            courseId: course.id,
            courseLabel: course.short,
            application,
            offer,
            offerConversionPct: application === 0 ? 0 : Math.round((offer / application) * 100),
            payment,
            paymentConversionPct: offer === 0 ? 0 : Math.round((payment / offer) * 100),
            completed,
            completedConversionPct: payment === 0 ? 0 : Math.round((completed / payment) * 100),
        };
    });
}

// ---------------------------------------------------------------------------
// Lost Deals
// ---------------------------------------------------------------------------

export function getLostDealsSummary(cohort: Deal[]): { percent: number; closedCount: number; cohortSize: number } {
    const cascade = buildLiveCascade(cohort);
    const cohortSize = cascade.applicationsSent;
    const lostCount = cascade.currentStage.expired + cascade.currentStage.notInterested;
    const percent = cohortSize === 0 ? 0 : Math.round((lostCount / cohortSize) * 100);
    return { percent, closedCount: cascade.currentStage.paymentCompleted, cohortSize };
}

export function getLostDealsSummaryForSelection(selection: PeriodSelection, persona: Persona, deals: Deal[]) {
    const bounds = resolvePeriodBounds(selection);
    return getLostDealsSummary(getCohort(persona, bounds, deals));
}

// ---------------------------------------------------------------------------
// Period label text
// ---------------------------------------------------------------------------

function periodLabelFor(selection: PeriodSelection): string {
    if (selection.kind === "custom") return "Custom";
    return periods.find((p) => p.id === selection.id)?.label ?? selection.id;
}

function periodDescriptionFor(selection: PeriodSelection, bounds: PeriodBounds): string {
    const label = periodLabelFor(selection);
    if (selection.kind === "custom") return `${formatShortDate(bounds.from)} – ${formatShortDate(bounds.to)}`;

    if (selection.id === "this-month" || selection.id === "last-month") {
        return `${label} (${MONTH_ABBR[bounds.from.getMonth()]})`;
    }

    if (selection.id === "lifetime") {
        return `${label} (${formatShortDate(bounds.from)} – ${formatShortDate(bounds.to)})`;
    }

    const q = Math.floor(bounds.from.getMonth() / 3);
    const endMonth = q * 3 + 2;
    return `${label} (${MONTH_ABBR[bounds.from.getMonth()]}-${MONTH_ABBR[endMonth]})`;
}

/** The actual month/quarter this period covers, e.g. "August" or "Q3 2025" — for the Booked
 * Revenue card's badge (Figma node 118:28883 literally reads "August"), which shouldn't just
 * repeat the period-pill label ("This Month") already shown above it in the filter row. */
function periodBadgeLabel(selection: PeriodSelection, bounds: PeriodBounds): string {
    if (selection.kind === "custom") return `${formatShortDate(bounds.from)} – ${formatShortDate(bounds.to)}`;
    if (selection.id === "lifetime") return "Lifetime";
    if (selection.id === "this-month" || selection.id === "last-month") return MONTH_FULL[bounds.from.getMonth()];

    const quarter = Math.floor(bounds.from.getMonth() / 3) + 1;
    return `Q${quarter} ${bounds.from.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Top-level entry point — replaces `getSelectedPeriodChartData` + `scalePeriodDataForPersona`
// combined: resolves the period, scopes to the persona's real deals, and computes every field
// `PeriodChartData` needs in one pass.
// ---------------------------------------------------------------------------

export function getPeriodChartDataLive(selection: PeriodSelection, persona: Persona, deals: Deal[]): PeriodChartData {
    const bounds = resolvePeriodBounds(selection);
    const personaDeals = dealsForPersona(persona, deals);
    const cohort = getCohort(persona, bounds, deals);

    const { bookedTotal, unitsAchieved, totalRealised, realisedOfPreviouslyBooked, ats } = computeBookedRealised(personaDeals, bounds);

    const previousBounds = getPreviousEquivalentBounds(selection);
    const previousBookedTotal = previousBounds ? computeBookedRealised(personaDeals, previousBounds).bookedTotal : null;
    const changeText = computeChangeText(bookedTotal, previousBookedTotal, selection);

    const realisedTotal = totalRealised - realisedOfPreviouslyBooked;
    const realisedPercent = bookedTotal === 0 ? 0 : (realisedTotal / bookedTotal) * 100;

    const description = periodDescriptionFor(selection, bounds);

    return {
        id: selection.kind === "preset" ? selection.id : "this-month",
        label: periodLabelFor(selection),
        periodLabel: description,
        headingLabel: `Booked - ${description}`,
        badgeLabel: periodBadgeLabel(selection, bounds),
        bookedTotal,
        realisedTotal,
        realisedPercent,
        changeText,
        unitsAchieved,
        unitTarget: resolveUnitTargetForPersona(selection, persona),
        ats,
        totalRealised,
        realisedOfPreviouslyBooked,
        cascade: buildLiveCascade(cohort),
        paymentModes: [], // payment-modes-pie.tsx isn't wired into any page — nothing reads this live
        points: buildDailyChartPoints(personaDeals, bounds),
        ...buildXAxisMeta(bounds, selection),
    };
}

// ---------------------------------------------------------------------------
// Team Drilldown — each node's revenue is a literal sum of its own deals (a `Deal` already
// carries its own `tmId`/`tlId`/`bdrId`, so no need to walk/sum through children).
// ---------------------------------------------------------------------------

type OrgField = "tmId" | "tlId" | "bdrId";

export function getNodeBookedTotal(field: OrgField, id: string, bounds: PeriodBounds, deals: Deal[]): number {
    let total = 0;
    for (const d of deals) {
        if (d[field] !== id) continue;
        if (inRange(d.booking.bookedOn, bounds)) total += toInr(d.booking.bookedValue, d.currency);
    }
    return total;
}

export function getNodeChangePercent(field: OrgField, id: string, selection: PeriodSelection, deals: Deal[]): string {
    const previousBounds = getPreviousEquivalentBounds(selection);
    if (!previousBounds) return "—";

    const current = getNodeBookedTotal(field, id, resolvePeriodBounds(selection), deals);
    const previous = getNodeBookedTotal(field, id, previousBounds, deals);
    const pct = computeChangePercent(current, previous);
    return pct === null ? "—" : `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

export function getTeamManagerSummariesLive(selection: PeriodSelection, deals: Deal[]): TeamManagerSummary[] {
    const bounds = resolvePeriodBounds(selection);

    return teamManagers.map((tm) => {
        const bookedTotal = getNodeBookedTotal("tmId", tm.id, bounds, deals);
        const unitsAchieved = deals.filter((d) => d.tmId === tm.id && inRange(d.booking.bookedOn, bounds)).length;
        return {
            id: tm.id,
            name: tm.name,
            bookedTotal,
            unitsAchieved,
            unitTarget: resolveUnitTargetForPersona(selection, { role: "tm", tmId: tm.id }),
            ats: unitsAchieved === 0 ? 0 : Math.round(bookedTotal / unitsAchieved),
        };
    });
}
