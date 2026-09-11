/**
 * Live aggregation layer for the Home dashboard — every number here is computed from the real
 * `Deal[]` roster (via `useDeals()`/`dealsForPersona`), not the synthetic `MONTHS`/cascade model
 * in dashboard-data.ts (that file's `MONTHS`/`buildCascade` stay in place only as the generator
 * that seeded the roster in the first place — see its header comment). Mutating a deal through
 * the Learner Sim Pad now moves every card that reads through here.
 */
import type { Persona } from "@/types/role";
import type {
    ChartPoint,
    DealHealthColor,
    DealStageBar,
    DealStageCascade,
    FunnelCohort,
    FunnelPanelData,
    FunnelStage,
    OrgTeamManager,
    PeriodChartData,
    PeriodSelection,
    RealisedBucket,
    TeamManagerFunnelCardData,
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
import type { Deal, DealStatusId } from "./deals-data";
import { COURSES, STATUS, dealsForPersona } from "./deals-data";

// ---------------------------------------------------------------------------
// Date/period bounds — the live equivalent of dashboard-data.ts's buildMonthPeriod/
// buildQuarterPeriod, but resolving a selection to plain [from, to] bounds instead of
// bundling that together with synthetic-series generation.
// ---------------------------------------------------------------------------

export type PeriodBounds = { from: Date; to: Date; truncated: boolean };

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

// ---------------------------------------------------------------------------
// Realised Revenue chart — always exactly 10 buckets regardless of how long the period is
// (Manik's call, 2026-09-10: "do the maths and combine revenues of 3 days" for a ~30-day month,
// "~9 days" for a ~90-day quarter — i.e. period length / 10, not a fixed bucket width), each a
// stacked previous-period/this-period split of the same realised split `computeBookedRealised`
// already does for the period as a whole.
// ---------------------------------------------------------------------------

const REALISED_BUCKET_COUNT = 10;

function buildRealisedBuckets(personaDeals: Deal[], bounds: PeriodBounds): RealisedBucket[] {
    const totalDays = dayCount(bounds.from, bounds.to);
    const bucketCount = Math.min(REALISED_BUCKET_COUNT, totalDays);
    // Cumulative boundary math (not a fixed bucket width) so the days partition evenly — sizes
    // differ by at most 1 day — instead of a short/empty remainder bucket trailing at the end.
    const boundaries = Array.from({ length: bucketCount + 1 }, (_, i) => Math.floor((i * totalDays) / bucketCount));

    const buckets: RealisedBucket[] = Array.from({ length: bucketCount }, (_, i) => {
        const from = addDays(bounds.from, boundaries[i]);
        const to = addDays(bounds.from, boundaries[i + 1] - 1);
        return {
            index: i,
            from,
            to,
            label: from.getTime() === to.getTime() ? formatShortDate(from) : `${formatShortDate(from)} – ${formatShortDate(to)}`,
            previousRealised: 0,
            thisRealised: 0,
            total: 0,
        };
    });

    const bucketIndexForDay = (dayIdx: number) => {
        for (let i = boundaries.length - 2; i >= 0; i--) {
            if (dayIdx >= boundaries[i]) return i;
        }
        return 0;
    };

    for (const d of personaDeals) {
        const bookedBeforePeriod = d.booking.bookedOn !== null && d.booking.bookedOn.getTime() < bounds.from.getTime();
        for (const inst of d.installments) {
            if (!inRange(inst.paidOn, bounds)) continue;
            const dayIdx = dayCount(bounds.from, inst.paidOn!) - 1;
            const bucket = buckets[bucketIndexForDay(dayIdx)];
            const amount = toInr(inst.amount, d.currency);
            if (bookedBeforePeriod) bucket.previousRealised += amount;
            else bucket.thisRealised += amount;
        }
    }

    for (const b of buckets) b.total = b.previousRealised + b.thisRealised;
    return buckets;
}

function computeChangePercent(current: number, previous: number | null): number | null {
    if (previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

export function previousPeriodLabel(selection: PeriodSelection): string {
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

// Cosmetic-only: a pure cumulative sum starts at/near 0, which reads as an empty chart for the
// first few days. Biasing each series to open around 12% of its own peak (Manik's call, "10-15%")
// and compressing the rest to still land on the same final value keeps the line looking alive
// from day 1 without touching any real number — `computeBookedRealised` (the stat-card totals)
// sums straight off `personaDeals`, never off these biased points.
const CHART_BASELINE_FRACTION = 0.12;

function applyChartBaselineBias(cumulative: number[]): number[] {
    const peak = cumulative[cumulative.length - 1];
    if (peak <= 0) return cumulative;
    const baseline = peak * CHART_BASELINE_FRACTION;
    return cumulative.map((v) => baseline + (1 - CHART_BASELINE_FRACTION) * v);
}

// National holidays the BDR floor doesn't work — booking activity visibly stalls that day, so
// the Booked Revenue chart shows a flat, stagnant stretch there instead of implying growth
// continued as usual (Manik's call, 2026-09-10). India's official 2025 gazetted holiday list
// (Ministry of Personnel, Public Grievances & Pensions circular), filtered to the prototype's
// actual seeded data window (Jan–Aug 2025, per DATA_WINDOW_START/END) — already ≤3/month
// without needing to trim anything.
const NATIONAL_HOLIDAYS: { date: Date; label: string }[] = [
    { date: new Date(2025, 0, 26), label: "Republic Day" },
    { date: new Date(2025, 1, 26), label: "Maha Shivratri" },
    { date: new Date(2025, 2, 14), label: "Holi" },
    { date: new Date(2025, 2, 31), label: "Id-ul-Fitr" },
    { date: new Date(2025, 3, 10), label: "Mahavir Jayanti" },
    { date: new Date(2025, 3, 18), label: "Good Friday" },
    { date: new Date(2025, 4, 12), label: "Buddha Purnima" },
    { date: new Date(2025, 5, 7), label: "Bakrid (Id-ul-Zuha)" },
    { date: new Date(2025, 6, 6), label: "Muharram" },
    { date: new Date(2025, 7, 15), label: "Independence Day" },
    { date: new Date(2025, 7, 16), label: "Janmashtami" },
];

/** Cosmetic-only, same spirit as `applyChartBaselineBias`: zeroes out a holiday's own day-over-
 * day growth and redistributes it proportionally across every other day's own growth, so the
 * curve visibly plateaus right at the holiday and the final total (and every other day's
 * relative shape) is unchanged — `computeBookedRealised` never reads these adjusted points. */
function applyHolidayStagnation(cumulative: number[], bounds: PeriodBounds): number[] {
    const holidayIdx = new Set(NATIONAL_HOLIDAYS.map((h) => dayCount(bounds.from, h.date) - 1).filter((idx) => idx >= 0 && idx < cumulative.length));
    if (holidayIdx.size === 0) return cumulative;

    const increments = cumulative.map((v, i) => v - (i > 0 ? cumulative[i - 1] : 0));
    let removed = 0;
    for (const idx of holidayIdx) {
        removed += increments[idx];
        increments[idx] = 0;
    }
    const remainingTotal = increments.reduce((sum, v) => sum + v, 0);
    if (removed > 0 && remainingTotal > 0) {
        for (let i = 0; i < increments.length; i++) {
            if (holidayIdx.has(i)) continue;
            increments[i] += removed * (increments[i] / remainingTotal);
        }
    }

    let running = 0;
    return increments.map((inc) => (running += inc));
}

/** Which of `NATIONAL_HOLIDAYS` actually fall inside this period, with the same `x` (1-indexed
 * day-of-period) the chart's own points use — so the chart can mark them with a reference line
 * regardless of which period selection is active. */
function holidaysInRange(bounds: PeriodBounds): { x: number; label: string }[] {
    return NATIONAL_HOLIDAYS.filter((h) => inRange(h.date, bounds)).map((h) => ({ x: dayCount(bounds.from, h.date), label: h.label }));
}

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

    const bookedCumulative: number[] = [];
    const realisedCumulative: number[] = [];
    let bookedRunning = 0;
    let realisedRunning = 0;
    for (let i = 0; i < days; i++) {
        bookedRunning += bookedByDay.get(i) ?? 0;
        realisedRunning += realisedByDay.get(i) ?? 0;
        bookedCumulative.push(bookedRunning);
        realisedCumulative.push(realisedRunning);
    }

    const stagnantBooked = applyHolidayStagnation(bookedCumulative, bounds);
    const stagnantRealised = applyHolidayStagnation(realisedCumulative, bounds);
    // Day-over-day deltas off the stagnation-adjusted (not yet baseline-biased) series — a
    // holiday's own day reads as ~₹0 here too, matching its flat stretch on the curve, and day 1
    // isn't inflated by the cosmetic opening bump applied next.
    const dailyBooked = stagnantBooked.map((v, i) => Math.max(0, v - (i > 0 ? stagnantBooked[i - 1] : 0)));
    const dailyRealised = stagnantRealised.map((v, i) => Math.max(0, v - (i > 0 ? stagnantRealised[i - 1] : 0)));

    const biasedBooked = applyChartBaselineBias(stagnantBooked);
    const biasedRealised = applyChartBaselineBias(stagnantRealised);

    return biasedBooked.map((booked, i) => ({
        x: i + 1,
        date: addDays(bounds.from, i),
        booked,
        realised: biasedRealised[i],
        dailyBooked: Math.round(dailyBooked[i]),
        dailyRealised: Math.round(dailyRealised[i]),
    }));
}

function buildXAxisMeta(
    bounds: PeriodBounds,
    selection: PeriodSelection,
): { xDomain: [number, number]; xTicks: number[]; xTickFormatter: (x: number) => string } {
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

const DEAL_STAGE_BAR_GROUPS: {
    label: string;
    ids: DealStatusId[];
    colorClassName: string;
    hatched?: boolean;
    gradient?: string;
    attentionIds?: DealStatusId[];
    attentionLabel?: string;
}[] = [
    // "Needs attention" = New (assigned, form not even sent yet) + Expired (form sent but the
    // window lapsed with no action) — both are stalled and need a BDR to act, unlike Pending
    // (form sent, still within its live window).
    //
    // NOTE: APP_FILLED isn't claimed by any of the 8 groups below — it was previously folded
    // into "Offer Letters" as a stand-in, but that bar is now explicitly scoped to exactly
    // OFFER_PENDING/ACCEPTED/EXPIRED/WITHDRAWN per Manik's spec, with nowhere else specified for
    // it. Flagging rather than guessing again: any deal sitting at APP_FILLED currently isn't
    // counted in any Deal Stages bar.
    {
        label: "Application",
        ids: ["APP_NEW", "APP_PENDING", "APP_EXPIRED"],
        colorClassName: "bg-utility-blue-400",
        attentionIds: ["APP_NEW", "APP_EXPIRED"],
        attentionLabel: "need attention",
    },
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
    // Combined Payment Ongoing + Payment Due + Payment Overdue into one bar (every deal that's
    // paying but not yet complete) — total includes all three, but the attention count stays
    // scoped to just PAY_OVERDUE (past the grace period entirely), not PAY_DUE (still within it)
    // or PAY_ONGOING (on schedule). Kept the "Payment Overdue" label since Manik hasn't asked for
    // a rename — worth revisiting given the bar now covers on-schedule payments too.
    {
        label: "Payment Overdue",
        ids: ["PAY_ONGOING", "PAY_DUE", "PAY_OVERDUE"],
        colorClassName: "bg-fg-error-secondary",
        attentionIds: ["PAY_OVERDUE"],
        attentionLabel: "overdue",
    },
    // ENR_CANCELLED removed per Manik — not claimed by any bar below, same as APP_FILLED (see
    // the note above "Application"). Flagging rather than guessing a new home for it.
    {
        label: "Payment Completed",
        ids: ["PAY_COMPLETED"],
        colorClassName: "bg-fg-success-primary",
        gradient: "linear-gradient(to top, var(--color-fg-success-secondary), var(--color-fg-success-primary))",
    },
    // SAVED split out into its own bar below — this is just NOT_INTERESTED now.
    { label: "Not Interested", ids: ["NOT_INTERESTED"], colorClassName: "bg-fg-tertiary" },
    { label: "Saved for Later", ids: ["SAVED"], colorClassName: "bg-utility-brand-700" },
    // OFFER_EXPIRED moved to "Offer Letters" above per Manik's spec — kept here previously, now
    // just REJECTED so nothing is double-counted across bars.
    { label: "Rejected", ids: ["REJECTED"], colorClassName: "bg-fg-error-primary", hatched: true },
];

/** "Total Enrolled" (Manik's definition, 2026-09-10): Payment Completed, plus Payment Due deals
 * that have made at least one payment, plus Payment Overdue — a deliberately *overlapping* rollup
 * on top of the exhaustive `DEAL_STAGE_BAR_GROUPS` partition above (it double-counts against the
 * "Payment Overdue" and "Payment Completed" bars by design), not another partition bucket. Payment
 * Due with zero installments paid is excluded — that learner hasn't actually started paying yet,
 * so isn't "enrolled". Payment Ongoing is excluded too, per the same literal spec, even though
 * `PAY_ONGOING` also implies a first payment was made. */
function buildTotalEnrolledBar(cohort: Deal[]): DealStageBar {
    const completed = cohort.filter((d) => d.status.id === "PAY_COMPLETED");
    const dueWithPayment = cohort.filter((d) => d.status.id === "PAY_DUE" && d.installments.some((inst) => inst.paidOn !== null));
    const overdue = cohort.filter((d) => d.status.id === "PAY_OVERDUE");

    const breakdown = [
        { label: "Completed", count: completed.length, color: STATUS.PAY_COMPLETED.color },
        { label: "Due (paid at least 1 installment)", count: dueWithPayment.length, color: STATUS.PAY_DUE.color },
        { label: "Overdue", count: overdue.length, color: STATUS.PAY_OVERDUE.color },
    ]
        .filter((status) => status.count > 0)
        .sort((a, b) => b.count - a.count);

    return {
        label: "Total Enrolled",
        value: completed.length + dueWithPayment.length + overdue.length,
        colorClassName: "bg-fg-success-primary",
        // Figma "Gradient/Linear 69" — a one-off decorative gradient for this specific rollup
        // bar, not part of the semantic token system the other bars draw their colors from.
        gradient: "linear-gradient(135deg, #F74FAC 0%, #FCB24F 100%)",
        breakdown,
    };
}

/** Deal Stages (Figma node 548:15755) — 8 bars classified directly off each deal's real
 * `status.id`, the same way `buildLiveCascade` classifies its 6, just with finer splits where
 * the status model actually supports them (Payment Ongoing/Due vs Overdue; payment-plan-pending
 * as its own bucket; Not Interested and Rejected surfaced separately instead of folded into one
 * "expired" bucket). Every status *except* `APP_FILLED` and `ENR_CANCELLED` lands in exactly one
 * group — see the notes above the "Application" and "Payment Completed" entries in
 * `DEAL_STAGE_BAR_GROUPS` for why those two are unclaimed. A 9th bar, "Total Enrolled"
 * (`buildTotalEnrolledBar`), is appended after — it's a rollup, not part of the partition, so it
 * deliberately breaks the "every status counted once" rule the 8 bars above hold to.
 *
 * Unlike the Sales Funnel (which reads `getCohort`, scoped to deals whose application was
 * actually *sent*), this reads the raw `createdOn`-filtered roster — the same basis the Deals
 * List page uses — because the Application bar needs to surface `APP_NEW` deals (assigned but
 * not yet sent) as the "needs attention" count, and `getCohort` excludes those by design. */
export function getDealStageBars(selection: PeriodSelection, persona: Persona, deals: Deal[]): DealStageBar[] {
    const bounds = resolvePeriodBounds(selection);
    const cohort = dealsForPersona(persona, deals).filter((d) => inRange(d.createdOn, bounds));

    const bars = DEAL_STAGE_BAR_GROUPS.map((group) => {
        const groupDeals = cohort.filter((d) => group.ids.includes(d.status.id));
        const breakdown = group.ids
            .map((id) => ({ label: STATUS[id].label, count: groupDeals.filter((d) => d.status.id === id).length, color: STATUS[id].color }))
            .filter((status) => status.count > 0)
            .sort((a, b) => b.count - a.count);

        return {
            label: group.label,
            value: groupDeals.length,
            colorClassName: group.colorClassName,
            hatched: group.hatched,
            gradient: group.gradient,
            attentionValue: group.attentionIds ? groupDeals.filter((d) => group.attentionIds!.includes(d.status.id)).length : undefined,
            attentionLabel: group.attentionLabel,
            breakdown,
        };
    });

    return [...bars, buildTotalEnrolledBar(cohort)];
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
    // "Application Pending"/"Offer Pending"/"Ongoing" — Figma's own dot color for these
    // (Manik's call, 2026-09-11), distinct from the plain neutral gray the other "nothing to
    // report yet" statuses use elsewhere in these breakdowns.
    info: "text-utility-blue-500",
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

    // `>= 1`, not `>= 2` — creating the payment plan is part of the Offer stage's own workflow
    // (Manik's call, 2026-09-11), so a deal in any Plan sub-state already counts as "Offer",
    // same as `buildSalesFunnelFlow`'s own `offerCohort` above (the dev-time assertion at the
    // bottom of this file checks the two `.value`s can never drift apart).
    const offersCohort = cohort.filter((d) => d.reachedStage >= 1);
    const planNotStarted2 = countIds(offersCohort, ["PLAN_NOT_STARTED"]);
    const planDraft2 = countIds(offersCohort, ["PLAN_DRAFT"]);
    const planAwaitingApproval2 = countIds(offersCohort, ["PLAN_AWAITING_APPROVAL"]);
    const pending2 = countIds(offersCohort, ["OFFER_PENDING"]);
    const expired2 = countIds(offersCohort, ["OFFER_EXPIRED"]);
    const withdrawn2 = countIds(offersCohort, ["OFFER_WITHDRAWN"]);
    const accepted2 = offersCohort.length - pending2 - expired2 - withdrawn2 - planNotStarted2 - planDraft2 - planAwaitingApproval2;

    const stage2: FunnelStage = {
        label: "Offers Shared",
        fraction: "2 / 4",
        value: offersCohort.length,
        denominator: filled,
        caption: "of Filled",
        breakdown: [
            { label: "Plan Not Created", count: planNotStarted2, dotClassName: dot.neutral },
            { label: "Plan Created", count: planDraft2, dotClassName: dot.success },
            { label: "Plan Awaiting Approval", count: planAwaitingApproval2, dotClassName: dot.neutral },
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
    // The Offer node's boundary is `reachedStage >= 1`, not `>= 2` — creating the payment plan
    // is part of the Offer stage's own workflow (Manik's call, 2026-09-11: "Creating a plan is
    // a part of the Offer stage"), so a deal in any of the three Plan sub-states has already
    // moved out of Application, same as one that already has an Offer Letter. Must stay in sync
    // with `buildFunnelStages`'s own `offersCohort` threshold below — the dev-time assertion at
    // the bottom of this function checks the two never drift apart.
    const offerCohort = cohort.filter((d) => d.reachedStage >= 1);
    const paymentCohort = cohort.filter((d) => d.reachedStage >= 3);

    // Dropout attribution: `APP_EXPIRED`/`OFFER_EXPIRED` always carry a fixed `reachedStage`
    // (0 and 2 respectively, per STAGE_RANK). The three "Global" statuses (Not Interested /
    // Rejected / Saved) are seeded with a random `reachedStage` independent of their label —
    // exactly what "furthest point reached" means, so reading it here to place them is a
    // legitimate use of the same field, not a new interpretation of it. Boundary matches the
    // Application/Offer node split above — a Plan-stage drop (`reachedStage === 1`) now counts
    // as "dropped after Offer", not "dropped after Application".
    const dropped = cohort.filter((d) => DROPPED_STATUS_IDS.includes(d.status.id));
    const droppedAtApplicationDeals = dropped.filter((d) => d.reachedStage === 0);
    const droppedAtOfferDeals = dropped.filter((d) => d.reachedStage === 1 || d.reachedStage === 2);
    const droppedAtApplication = droppedAtApplicationDeals.length;
    const droppedAtOffer = droppedAtOfferDeals.length;
    const wentColdAtPaymentDeals = dropped.filter((d) => d.reachedStage === 3);

    const applicationNew = cohort.filter((d) => d.status.id === "APP_NEW").length;
    const applicationPending = cohort.filter((d) => d.status.id === "APP_PENDING").length;
    const applicationFilled = cohort.filter((d) => d.status.id === "APP_FILLED").length;

    // Plan Not Created / Plan Created / Plan Awaiting Approval — read off `offerCohort` now,
    // not the Application cohort, since they're part of the Offer node's own sub-bands (see the
    // boundary note above).
    const planNotStarted = offerCohort.filter((d) => d.status.id === "PLAN_NOT_STARTED").length;
    const planDraft = offerCohort.filter((d) => d.status.id === "PLAN_DRAFT").length;
    const planAwaitingApproval = offerCohort.filter((d) => d.status.id === "PLAN_AWAITING_APPROVAL").length;

    const offerPending = offerCohort.filter((d) => d.status.id === "OFFER_PENDING").length;
    const offerWithdrawn = offerCohort.filter((d) => d.status.id === "OFFER_WITHDRAWN").length;
    const offerAccepted =
        offerCohort.length - paymentCohort.length - droppedAtOffer - offerPending - offerWithdrawn - planNotStarted - planDraft - planAwaitingApproval;

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
            // "Filled" is only the deals CURRENTLY sitting at that sub-status — it already
            // excludes both the dropouts (a separate hover target on the ribbon itself) and
            // whoever has since moved on to Offer, so without a row for the latter, `total` here
            // (`cohort.length`) wouldn't visibly reconcile against Pending+Filled — a real
            // confusion Manik ran into (2026-09-11). "Moved to Offer" closes that gap so every
            // row + the dropout figure always sums back to `total`. "New" (assigned, form not
            // sent yet) stays at Application and never moves to Offer — it's included in
            // `cohort`/`total` via `getSalesFunnelFlow`'s own `createdOn`-based union, same date
            // field the Deal Stages card already uses for the same deals (Manik's call, 2026-09-11).
            subBands: [
                { key: "new", label: "New", count: applicationNew },
                { key: "pending", label: "Pending", count: applicationPending },
                { key: "filled", label: "Filled", count: applicationFilled },
                { key: "moved-to-offer", label: "Moved to Offer", count: offerCohort.length },
            ],
        },
        {
            id: "offer",
            label: "Offer",
            value: offerCohort.length,
            // Plan Not Created/Created/Awaiting Approval listed first — chronologically they
            // happen before the Offer Letter itself (Manik's call, 2026-09-11: plan creation is
            // part of this stage, not Application's). "Moved to Payment" closes the same
            // reconciliation gap as Application's "Moved to Offer" above.
            subBands: [
                { key: "plan-not-started", label: "Plan Not Created", count: planNotStarted },
                { key: "plan-draft", label: "Plan Created", count: planDraft },
                { key: "plan-awaiting-approval", label: "Plan Awaiting Approval", count: planAwaitingApproval },
                { key: "pending", label: "Pending", count: offerPending },
                { key: "withdrawn", label: "Withdrawn", count: offerWithdrawn },
                { key: "accepted", label: "Accepted", count: offerAccepted },
                { key: "moved-to-payment", label: "Moved to Payment", count: paymentCohort.length },
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
    const sentCohort = getCohort(persona, bounds, deals);
    // `getCohort` is scoped to `application.sentOn`, so a deal still at `APP_NEW` (assigned, form
    // not sent yet) has no `sentOn` to filter by and is excluded — union it in here by
    // `createdOn` instead, the same date field the Deal Stages card already reads for exactly
    // these deals (see `getDealStageBars`'s own comment). They stay at the Application node and
    // never reach Offer (Manik's call, 2026-09-11), which falls out naturally: `APP_NEW`'s
    // `reachedStage` is 0, same as Pending/Filled, so it can't qualify for `offerCohort` below.
    const newCohort = dealsForPersona(persona, deals).filter((d) => d.status.id === "APP_NEW" && inRange(d.createdOn, bounds));
    return buildSalesFunnelFlow([...sentCohort, ...newCohort]);
}

export function getSalesFunnelHeadline(
    selection: PeriodSelection,
    persona: Persona,
    deals: Deal[],
): {
    applicationsSent: number;
    applicationsSentChangePct: number | null;
    conversionPct: number;
    /** Percentage-POINT change vs last period (e.g. 35% -> 33% reads as -2), not the relative
     * `computeChangePercent` swing every other badge here uses — Overall Conversion is already
     * a %, so "% change of a %" reads as a confusing double-percentage next to it (Manik's call,
     * 2026-09-11). The badge itself still colors/signs off this number normally (red on a drop). */
    conversionChangePct: number | null;
    unitsAchieved: number;
    unitTarget: number;
    /** % of `unitTarget` reached so far — NOT a period-over-period change like the other two
     * badges above (Manik's call, 2026-09-10: this figure is about pace against the goal, not
     * growth vs the last equivalent period), so it's computed straight off `unitsAchieved`/
     * `unitTarget` rather than `computeChangePercent` against a previous-period cohort. */
    unitTargetAttainmentPct: number | null;
    ats: number;
    atsChangePct: number | null;
} {
    const bounds = resolvePeriodBounds(selection);
    const cohort = getCohort(persona, bounds, deals);
    // "Made any kind of payment" = `reachedStage >= 3` (Manik's call, 2026-09-11) — the same
    // threshold `paymentCohort` uses everywhere else in this file: at least one installment paid
    // (Ongoing/Due/Overdue), not just deals that finished paying in full (Completed/Cancelled,
    // reachedStage 4, are `>= 3` too since they necessarily passed through it on the way).
    const paidAtLeastOnce = cohort.filter((d) => d.reachedStage >= 3).length;
    const conversionPct = cohort.length === 0 ? 0 : Math.round((paidAtLeastOnce / cohort.length) * 100);

    // Unit Sales/Target (Figma node 576:8946) and Average Ticket Size (Figma node 576:8926) both
    // read off the same booked-deals population as the Booked Revenue card's own
    // `unitsAchieved`/`ats` — not the funnel's application-sent cohort above, which is a
    // different population (a deal counts here once it's booked, not once its application goes out).
    const personaDeals = dealsForPersona(persona, deals);
    const { unitsAchieved, ats } = computeBookedRealised(personaDeals, bounds);
    const unitTarget = resolveUnitTargetForPersona(selection, persona);
    const unitTargetAttainmentPct = unitTarget === 0 ? null : (unitsAchieved / unitTarget) * 100;

    const previousBounds = getPreviousEquivalentBounds(selection);
    let applicationsSentChangePct: number | null = null;
    let conversionChangePct: number | null = null;
    let atsChangePct: number | null = null;
    if (previousBounds) {
        const previousCohort = getCohort(persona, previousBounds, deals);
        applicationsSentChangePct = computeChangePercent(cohort.length, previousCohort.length);
        const previousPaidAtLeastOnce = previousCohort.filter((d) => d.reachedStage >= 3).length;
        const previousConversionPct = previousCohort.length === 0 ? 0 : (previousPaidAtLeastOnce / previousCohort.length) * 100;
        conversionChangePct = conversionPct - previousConversionPct;
        const previousAts = computeBookedRealised(personaDeals, previousBounds).ats;
        atsChangePct = computeChangePercent(ats, previousAts);
    }

    return {
        applicationsSent: cohort.length,
        applicationsSentChangePct,
        conversionPct,
        conversionChangePct,
        unitsAchieved,
        unitTarget,
        unitTargetAttainmentPct,
        ats,
        atsChangePct,
    };
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
        // `>= 1`, matching `buildSalesFunnelFlow`/`buildFunnelStages`'s own Offer boundary —
        // creating the payment plan is part of the Offer stage (Manik's call, 2026-09-11), not
        // still "Application".
        const offer = courseCohort.filter((d) => d.reachedStage >= 1).length;
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

// "Confirmed lost" — Not Interested / Rejected / Saved for Later only. Deliberately excludes
// APP_EXPIRED/OFFER_EXPIRED/ENR_CANCELLED (folded into `buildLiveCascade`'s "expired" bucket) —
// those are stalled/lapsed, not a deal someone actively walked away from, so they don't belong
// in a "lost" count per Manik's call.
const CONFIRMED_LOST_IDS = new Set<DealStatusId>(["NOT_INTERESTED", "REJECTED", "SAVED"]);

export function getLostDealsSummary(cohort: Deal[]): { percent: number; lostCount: number; cohortSize: number } {
    const cohortSize = cohort.length;
    const lostCount = cohort.filter((d) => CONFIRMED_LOST_IDS.has(d.status.id)).length;
    const percent = cohortSize === 0 ? 0 : Math.round((lostCount / cohortSize) * 100);
    return { percent, lostCount, cohortSize };
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
    if (selection.id === "lifetime") return "This Year";
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
    const previousComputed = previousBounds ? computeBookedRealised(personaDeals, previousBounds) : null;
    const previousBookedTotal = previousComputed?.bookedTotal ?? null;
    const changeText = computeChangeText(bookedTotal, previousBookedTotal, selection);
    const realisedOfPreviouslyBookedChangePct = computeChangePercent(realisedOfPreviouslyBooked, previousComputed?.realisedOfPreviouslyBooked ?? null);
    const totalRealisedChangePct = computeChangePercent(totalRealised, previousComputed?.totalRealised ?? null);

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
        realisedOfPreviouslyBookedChangePct,
        totalRealisedChangePct,
        realisedBuckets: buildRealisedBuckets(personaDeals, bounds),
        cascade: buildLiveCascade(cohort),
        paymentModes: [], // payment-modes-pie.tsx isn't wired into any page — nothing reads this live
        points: buildDailyChartPoints(personaDeals, bounds),
        holidays: holidaysInRange(bounds),
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

// ---------------------------------------------------------------------------
// Admin Funnel — per-Team-Manager card (Figma node 609:10888, "Priya Nair") — a richer per-TM
// view than `buildFunnelStages`/`getFunnelCohortsLive`'s generic 4-stage cards. Reuses the same
// cohort/reachedStage thresholds as `buildFunnelStages` throughout so the two never drift, but
// condenses Offers Shared's 7-way status breakdown down to 4, merges Converted + Payment
// Clearance into one Payment panel (dropping Cancelled — Manik's call, 2026-09-11: not shown on
// this card at all), and pulls Saved/Not-Interested/Rejected out into their own per-panel
// fallout counts instead of one cohort-wide bucket.
// ---------------------------------------------------------------------------

const GLOBAL_STATUS_IDS: DealStatusId[] = ["SAVED", "NOT_INTERESTED", "REJECTED"];

// Deals Health's color meaning (Manik's call, 2026-09-11) is "what does this deal need right
// now", not a 1:1 mirror of `STATUS[id].color` (which reads more like a generic status-family
// tag — e.g. it puts PAY_DUE/PAY_OVERDUE in the same "green" family as PAY_ONGOING, and OFFER_
// PENDING/APP_PENDING don't get their own family at all). Exhaustive over every `DealStatusId`
// so TypeScript catches it if a new status is ever added without a health color:
// green = booked and on track; amber = needs the BDR's attention; blue = pending from the
// learner's own side, nothing wrong; lightGray = saved for later; darkGray = not interested;
// red = rejected outright. `ENR_CANCELLED` isn't one of the six categories Manik named — grouped
// under red alongside Rejected as the closest fit (both a negative terminal outcome), flagged to
// Manik rather than assumed silently.
const DEAL_HEALTH_COLOR: Record<DealStatusId, DealHealthColor> = {
    PAY_ONGOING: "green",
    PAY_COMPLETED: "green",
    APP_NEW: "amber",
    APP_FILLED: "amber",
    APP_EXPIRED: "amber",
    PLAN_NOT_STARTED: "amber",
    PLAN_DRAFT: "amber",
    PLAN_AWAITING_APPROVAL: "amber",
    OFFER_ACCEPTED: "amber",
    OFFER_WITHDRAWN: "amber",
    OFFER_EXPIRED: "amber",
    PAY_DUE: "amber",
    PAY_OVERDUE: "amber",
    APP_PENDING: "blue",
    OFFER_PENDING: "blue",
    SAVED: "lightGray",
    NOT_INTERESTED: "darkGray",
    REJECTED: "red",
    ENR_CANCELLED: "red",
};

// Healthiest-first sort order for the heatmap grid — green (booked, on track) reads best; blue
// (a normal wait on the learner, nothing actually wrong) ranks above amber (something needs the
// BDR); the two fallout grays sit below that; red is worst.
const DEAL_HEALTH_RANK: Record<DealHealthColor, number> = { green: 0, blue: 1, amber: 2, lightGray: 3, darkGray: 4, red: 5 };

function falloutCounts(falloutDeals: Deal[]): FunnelPanelData["fallout"] {
    return {
        saved: falloutDeals.filter((d) => d.status.id === "SAVED").length,
        notInterested: falloutDeals.filter((d) => d.status.id === "NOT_INTERESTED").length,
        rejected: falloutDeals.filter((d) => d.status.id === "REJECTED").length,
    };
}

export function getTeamManagerFunnelCardData(selection: PeriodSelection, tm: OrgTeamManager, deals: Deal[]): TeamManagerFunnelCardData {
    const bounds = resolvePeriodBounds(selection);
    const previousBounds = getPreviousEquivalentBounds(selection);
    const persona: Persona = { role: "tm", tmId: tm.id };
    const cohort = getCohort(persona, bounds, deals);

    // Deals Health heatmap — one cell per cohort deal, colored by its own status and sorted
    // healthiest-first so the grid reads as a left-to-right/top-to-bottom gradient, same as the
    // Figma frame (Manik's call, 2026-09-11: real per-deal data, not a decorative fixed pattern).
    const dealsHealth = cohort.map((d) => DEAL_HEALTH_COLOR[d.status.id]).sort((a, b) => DEAL_HEALTH_RANK[a] - DEAL_HEALTH_RANK[b]);

    const cohortTags = Array.from(new Set(cohort.map((d) => d.course.short))).sort();

    // Applications panel
    const appNew = cohort.filter((d) => d.status.id === "APP_NEW").length;
    const appPending = cohort.filter((d) => d.status.id === "APP_PENDING").length;
    const appExpired = cohort.filter((d) => d.status.id === "APP_EXPIRED").length;
    const appFallout = cohort.filter((d) => d.reachedStage === 0 && GLOBAL_STATUS_IDS.includes(d.status.id));
    const appComplete = cohort.length - appNew - appPending - appExpired - appFallout.length;

    const applications: FunnelPanelData = {
        count: cohort.length,
        breakdown: [
            { label: "Complete", count: appComplete, dotClassName: dot.success },
            { label: "Expired", count: appExpired, dotClassName: dot.error },
            { label: "New", count: appNew, dotClassName: dot.neutral },
            { label: "Application Pending", count: appPending, dotClassName: dot.info },
        ],
        fallout: falloutCounts(appFallout),
    };

    // Offers panel — `>= 1`, matching `buildFunnelStages`'s own `offersCohort` threshold.
    const offersCohort = cohort.filter((d) => d.reachedStage >= 1);
    const offerFallout = offersCohort.filter((d) => (d.reachedStage === 1 || d.reachedStage === 2) && GLOBAL_STATUS_IDS.includes(d.status.id));
    const offerPending = offersCohort.filter((d) => d.status.id === "OFFER_PENDING").length;
    const offerExpired = offersCohort.filter((d) => d.status.id === "OFFER_EXPIRED").length;
    const offerNotShared = offersCohort.filter((d) =>
        (["PLAN_NOT_STARTED", "PLAN_DRAFT", "PLAN_AWAITING_APPROVAL", "OFFER_WITHDRAWN"] as DealStatusId[]).includes(d.status.id),
    ).length;
    // Remainder, same pattern as `buildFunnelStages`'s `accepted2` — naturally folds in every deal
    // that progressed past Offer (reachedStage >= 3), not just ones still sitting at OFFER_ACCEPTED.
    const offerAccepted = offersCohort.length - offerFallout.length - offerPending - offerExpired - offerNotShared;

    const offers: FunnelPanelData = {
        count: offersCohort.length,
        breakdown: [
            { label: "Accepted", count: offerAccepted, dotClassName: dot.success },
            { label: "Expired", count: offerExpired, dotClassName: dot.error },
            { label: "Offer Not Shared", count: offerNotShared, dotClassName: dot.neutral },
            { label: "Offer Pending", count: offerPending, dotClassName: dot.info },
        ],
        fallout: falloutCounts(offerFallout),
    };

    // Payment panel — `>= 3`, matching `buildFunnelStages`'s own `paidCohort` threshold. Completed
    // is cohort-wide (same population `buildFunnelStages`'s `completed4` uses) since a fully paid
    // deal is `reachedStage` 4, not 3, so it wouldn't otherwise show up in `paidCohort` itself.
    const paidCohort = cohort.filter((d) => d.reachedStage >= 3);
    const payFallout = paidCohort.filter((d) => GLOBAL_STATUS_IDS.includes(d.status.id));
    const payCompleted = cohort.filter((d) => d.status.id === "PAY_COMPLETED").length;
    const payOngoing = paidCohort.filter((d) => d.status.id === "PAY_ONGOING").length;
    const payDue = paidCohort.filter((d) => d.status.id === "PAY_DUE").length;
    const payOverdue = paidCohort.filter((d) => d.status.id === "PAY_OVERDUE").length;

    const payment: FunnelPanelData = {
        count: paidCohort.length,
        breakdown: [
            { label: "Completed", count: payCompleted, dotClassName: dot.success },
            { label: "Ongoing", count: payOngoing, dotClassName: dot.info },
            { label: "Due", count: payDue, dotClassName: dot.warning },
            { label: "Overdue", count: payOverdue, dotClassName: dot.error },
        ],
        fallout: falloutCounts(payFallout),
    };

    // Booked / Realised / Avg Ticket Size — same underlying figures the Booked Revenue / Revenue
    // Realised cards show (`getNodeBookedTotal`/`getPeriodChartDataLive`), just scoped to this TM.
    const bookedTotal = getNodeBookedTotal("tmId", tm.id, bounds, deals);
    const previousBookedTotal = previousBounds ? getNodeBookedTotal("tmId", tm.id, previousBounds, deals) : null;
    const chart = getPeriodChartDataLive(selection, persona, deals);
    const headline = getSalesFunnelHeadline(selection, persona, deals);

    // Top Performers — top 2 BDRs under this TM by booked revenue this period.
    const topPerformers = bdrs
        .filter((bdr) => bdr.tmId === tm.id)
        .map((bdr) => {
            const bookedDeals = deals.filter((d) => d.bdrId === bdr.id && inRange(d.booking.bookedOn, bounds));
            const courseCounts = new Map<string, number>();
            for (const d of bookedDeals) courseCounts.set(d.course.short, (courseCounts.get(d.course.short) ?? 0) + 1);
            const topCourse = [...courseCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
            return {
                id: bdr.id,
                name: bdr.name,
                roleTag: topCourse ? `BDR | ${topCourse}` : "BDR",
                revenue: getNodeBookedTotal("bdrId", bdr.id, bounds, deals),
                units: bookedDeals.length,
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 2);

    // Pending Actions (Figma node 626:17776's collapsed-state list) — deals whose next step is
    // BDR/TM-owned, not the learner's (Manik's call, 2026-09-11): Applications is New + Expired
    // only (Pending is genuinely the learner's turn); Offers is the "Offer Not Shared" work plus
    // Expired; Payment is Due + Overdue. Reuses the same counts already computed above for the
    // full panels — deliberately a different population than those panels' own totals.
    const pendingActions = {
        applications: appNew + appExpired,
        offers: offerNotShared + offerExpired,
        payment: payDue + payOverdue,
    };

    return {
        id: tm.id,
        name: tm.name,
        cohortTags,
        dealsHealth,
        unitsAchieved: headline.unitsAchieved,
        unitTarget: headline.unitTarget,
        unitTargetAttainmentPct: headline.unitTargetAttainmentPct,
        booked: { amount: bookedTotal, changePct: computeChangePercent(bookedTotal, previousBookedTotal) },
        realised: { amount: chart.totalRealised, changePct: chart.totalRealisedChangePct },
        avgTicketSize: { amount: headline.ats, changePct: headline.atsChangePct },
        applications,
        offers,
        payment,
        pendingActions,
        topPerformers,
    };
}
