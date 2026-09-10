import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownRight, ArrowUpRight, Copy01, Download01, Edit01, TrendUp02 } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import type { DealStageBar, DealStageBarStatus, PeriodSelection } from "@/data/dashboard-data";
import { formatIndianCompact, formatIndianNumber, getPeriodSelectionKey } from "@/data/dashboard-data";
import { changeDirectionFromText, getDealStageBars, getPeriodChartDataLive } from "@/data/dashboard-metrics";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { cx } from "@/utils/cx";
import { BookedChart } from "./booked-chart";
import { RealisedBucketsChart } from "./realised-buckets-chart";

const CardActionsMenu = () => (
    <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover className="w-min">
            <Dropdown.Menu>
                <Dropdown.Item icon={Edit01}>
                    <span className="pr-4">Edit widget</span>
                </Dropdown.Item>
                <Dropdown.Item icon={Download01}>
                    <span className="pr-4">Export</span>
                </Dropdown.Item>
                <Dropdown.Item icon={Copy01}>
                    <span className="pr-4">Copy link</span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown.Root>
);

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
    <div className={cx("relative flex flex-col gap-4 rounded-xl border border-secondary bg-primary px-8 py-6 shadow-xs", className)}>{children}</div>
);

/** One of the Revenue Realised card's two summary figures — same up/down arrow + %-change
 * treatment used everywhere else in the dashboard, just at a smaller scale for this compact
 * card. `changePct` is already signed (computeChangePercent); null when there's nothing to
 * compare against (e.g. Lifetime has no prior period). */
const RealisedStat = ({ label, value, changePct }: { label: string; value: string; changePct: number | null }) => (
    <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-normal text-secondary">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold whitespace-nowrap text-primary">{value}</span>
            {changePct !== null && (
                <span
                    className={cx(
                        "inline-flex items-center gap-0.5 font-mono text-xs font-medium",
                        changePct >= 0 ? "text-fg-success-secondary" : "text-fg-error-secondary",
                    )}
                >
                    {changePct >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {Math.abs(changePct).toFixed(0)}%
                </span>
            )}
        </div>
    </div>
);

const fadeTransition = { duration: 0.25, ease: "easeOut" as const };

/** Wraps a card's contents in the same crossfade used everywhere else a card follows the
 * period selection, so switching periods always reads as "refreshed", not a hard cut. */
export const FadeOnSelection = ({ selectionKey, className, children }: { selectionKey: string; className?: string; children: ReactNode }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={selectionKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={fadeTransition}
            className={className}
        >
            {children}
        </motion.div>
    </AnimatePresence>
);

/** Row 1, left card — Booked Revenue + its own realised-of-this-period line. Sits beside
 * `SalesFunnelSection` in the page's top grid row (Figma Container 118:28881). */
export const BookedRevenueCard = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const booked = getPeriodChartDataLive(selection, persona, deals);
    const selectionKey = getPeriodSelectionKey(selection);
    const changeDirection = changeDirectionFromText(booked.changeText);

    return (
        <Card className="min-h-104 min-w-0">
            <div className="absolute top-6 right-8">
                <CardActionsMenu />
            </div>

            <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-secondary">Booked Revenue</p>
                    <Badge color="gray" type="color" size="sm">
                        {booked.badgeLabel}
                    </Badge>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-medium text-primary">INR</span>
                        <span className="font-mono text-display-sm font-semibold tracking-tight text-primary">{formatIndianNumber(booked.bookedTotal)}</span>
                        <span className="ml-1 flex items-center gap-0.5">
                            {changeDirection === "up" && <ArrowUpRight className="size-3.5 text-fg-success-secondary" />}
                            {changeDirection === "down" && <ArrowDownRight className="size-3.5 text-fg-error-secondary" />}
                            <span className="font-mono text-sm font-medium text-secondary">{booked.changeText}</span>
                        </span>
                    </div>

                    <p className="text-md text-tertiary">
                        Out of which <span className="font-mono">{formatIndianCompact(booked.realisedTotal)}</span> is realised (
                        <span className="font-mono">{booked.realisedPercent.toFixed(2)}%</span>)
                    </p>
                </div>
            </FadeOnSelection>

            <div className="min-h-0 flex-1">
                <BookedChart data={booked} selectionKey={selectionKey} />
            </div>
        </Card>
    );
};

/** Row 2, left column — Revenue Realised (Figma node 576:8167), the sole card in this grid
 * slot now that Average Ticket Size has been removed (Manik's call, 2026-09-10) — `h-full`
 * fills the row's full height to match Conversion/Deal Stages beside it, same as before, just
 * with one card claiming it all instead of splitting it with a second stacked card. A 10-bucket
 * mini bar chart (see RealisedBucketsChart), each bucket a previous-period/this-period stack,
 * with the same two totals the old plain-text version showed underneath — "previously booked" is
 * the backlog-ledger draw, "Total" is that plus the period's own bookings realised, so the two
 * always sum. */
export const RealisedRevenueCard = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const booked = getPeriodChartDataLive(selection, persona, deals);
    const selectionKey = getPeriodSelectionKey(selection);

    return (
        <Card className="h-full max-h-[400px] min-w-0">
            <div className="absolute top-6 right-8">
                <CardActionsMenu />
            </div>
            <FadeOnSelection selectionKey={selectionKey} className="flex h-full flex-col gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-md font-normal text-secondary">Revenue Realised</p>
                    <Badge color="gray" type="color" size="sm">
                        {booked.badgeLabel}
                    </Badge>
                </div>

                <div className="min-h-0 flex-1">
                    <RealisedBucketsChart buckets={booked.realisedBuckets} />
                </div>

                <div className="flex gap-4">
                    <RealisedStat
                        label="Previous Period"
                        value={`₹${formatIndianCompact(booked.realisedOfPreviouslyBooked)}`}
                        changePct={booked.realisedOfPreviouslyBookedChangePct}
                    />
                    <RealisedStat label="Total" value={`₹${formatIndianCompact(booked.totalRealised)}`} changePct={booked.totalRealisedChangePct} />
                </div>
            </FadeOnSelection>
        </Card>
    );
};

/** One pill-in-track bar of the Deal Stages chart (Figma node 548:15755) — bottom-anchored fill.
 * The two "loss" buckets (Payment Plan Pending, Rejected) get a fixed diagonal-hatch treatment
 * per the Figma spec — a style choice on those two positions, not a data-driven flag.
 *
 * `fraction` is precomputed by `DealStagesCard` (see `dealStageFraction` below) rather than
 * derived here from a simple `value/max` ratio — when the smallest bar's true ratio would fall
 * under the 64px floor, every bar's height is rescaled relative to *that* bar's value instead of
 * just flooring the one bar in isolation, so the whole chart stays on one consistent, kink-free
 * scale (per Manik's ask) rather than the floor visually lying about how much bigger the other
 * bars really are. */
const DEAL_STAGE_MIN_HEIGHT_PX = 64;

/** `colorClassName` is always a `bg-<token>` utility (see `cascadeToDealStages`) — deriving the
 * matching `--color-<token>` custom property from it lets the hatch stripes reuse the exact same
 * hue as the solid fill, without hardcoding a second color per hatched stage. */
const cssVarFromBgClass = (bgClassName: string) => `var(${bgClassName.replace(/^bg-/, "--color-")})`;

const STATUS_DOT_CLASS: Record<DealStageBarStatus["color"], string> = {
    blue: "bg-utility-blue-400",
    amber: "bg-fg-warning-secondary",
    green: "bg-fg-success-primary",
    red: "bg-fg-error-primary",
    gray: "bg-fg-tertiary",
};

/** Follows the cursor rather than anchoring to the (very tall) bar trigger — a react-aria
 * `Tooltip` anchors to the trigger's own box, which for a full-height bar column can land the
 * tooltip far from wherever on the bar the user is actually hovering. Portaled to `document.body`
 * so it renders relative to the real viewport even though `FadeOnSelection`'s `motion.div`
 * leaves an inline `transform` on an ancestor (which would otherwise hijack `position: fixed`
 * into being relative to that ancestor instead of the viewport). */
const DealStageBarTooltip = ({ x, y, label, value, breakdown, attentionValue, attentionLabel }: { x: number; y: number } & DealStageBar) => {
    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="pointer-events-none fixed z-50 flex w-max max-w-64 flex-col gap-1.5 rounded-lg bg-primary-solid px-3 py-2.5 shadow-lg"
            style={{ left: x + 16, top: y + 16 }}
        >
            <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs font-semibold text-white">{label}</span>
                <span className="font-mono text-xs font-semibold text-white">{value}</span>
            </div>

            {breakdown.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
                    {breakdown.map((status) => (
                        <div key={status.label} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-[11px] text-tooltip-supporting-text">
                                <span className={cx("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASS[status.color])} />
                                {status.label}
                            </span>
                            <span className="font-mono text-[11px] text-tooltip-supporting-text">{status.count}</span>
                        </div>
                    ))}
                </div>
            )}

            {!!attentionValue && (
                <div className="border-t border-white/10 pt-1.5 text-[11px] font-medium text-fg-warning-secondary">
                    {attentionValue} {attentionLabel ?? "need attention"}
                </div>
            )}
        </div>,
        document.body,
    );
};

const DealStageBarColumn = ({ fraction, ...bar }: DealStageBar & { fraction: number }) => {
    const { value, colorClassName, hatched, gradient, attentionValue } = bar;
    const hue = cssVarFromBgClass(colorClassName);
    // At least a third of the bar's own height, so the attention count stays legible even when
    // it's a small slice of a small bar — capped at the bar's full height.
    const attentionFraction = attentionValue && value > 0 ? Math.min(1, Math.max(1 / 3, attentionValue / value)) : 0;
    const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

    return (
        <div
            className="flex h-full w-12 shrink-0 flex-col items-center justify-center gap-2"
            onMouseEnter={(e) => setCursor({ x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setCursor(null)}
        >
            <div className="flex h-full w-full flex-1 items-end justify-center rounded-[40px] bg-[var(--color-bg-deal-stage-track)]">
                <div
                    className={cx("relative flex w-full items-start justify-center overflow-hidden rounded-full p-1", !hatched && !gradient && colorClassName)}
                    style={{
                        height: `${Math.round(fraction * 100)}%`,
                        minHeight: value > 0 ? 64 : undefined,
                        ...(gradient && { background: gradient }),
                        ...(hatched && {
                            backgroundColor: `color-mix(in srgb, ${hue} 30%, transparent)`,
                            backgroundImage: `repeating-linear-gradient(45deg, ${hue} 0, ${hue} 2px, transparent 2px, transparent 6px)`,
                        }),
                    }}
                >
                    {!!attentionValue && (
                        <div
                            className="flex w-full items-center justify-center rounded-full"
                            style={{
                                height: `${Math.round(attentionFraction * 100)}%`,
                                minHeight: 40,
                                minWidth: 40,
                                backgroundColor: `color-mix(in srgb, ${hue} 55%, black)`,
                            }}
                        >
                            <span className="font-mono text-sm font-semibold text-white">{attentionValue}</span>
                        </div>
                    )}
                </div>
            </div>
            <span className="font-mono text-xs font-medium text-secondary">{String(value).padStart(2, "0")}</span>

            {cursor && <DealStageBarTooltip x={cursor.x} y={cursor.y} {...bar} />}
        </div>
    );
};

/** Linear scale from [smallest nonzero value → the 64px floor] to [largest value → the track's
 * full height] — rather than a flat `value/max` ratio with the smallest bar independently
 * floored, this anchors the *whole* chart's scale on those two points so every bar's height
 * stays relative to the others on one consistent line, with no kink at the floor. When every
 * nonzero bar shares the same value (or there's only one), there's nothing to scale between, so
 * they all just fill the track. */
function dealStageFraction(value: number, values: number[], trackHeightPx: number): number {
    if (value === 0) return 0;
    const nonZero = values.filter((v) => v > 0);
    const min = Math.min(...nonZero);
    const max = Math.max(...nonZero);
    const floorFraction = trackHeightPx > 0 ? DEAL_STAGE_MIN_HEIGHT_PX / trackHeightPx : 0.2;
    if (max === min) return 1;

    const slope = (1 - floorFraction) / (max - min);
    return Math.min(1, Math.max(floorFraction, floorFraction + slope * (value - min)));
}

/** Row 2, right column — the redesigned 8-bar Deal Stages chart (Figma node 548:15755),
 * replacing the old horizontal `ProgressBarBase` list. Reads the same shared cascade as the
 * Booked card so the two never drift apart for a given period. */
export const DealStagesCard = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const selectionKey = getPeriodSelectionKey(selection);
    const dealStages = getDealStageBars(selection, persona, deals);
    const values = dealStages.map((stage) => stage.value);

    const trackRef = useRef<HTMLDivElement>(null);
    const [trackHeightPx, setTrackHeightPx] = useState(0);
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setTrackHeightPx(entry.contentRect.height));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <Card className="h-full max-h-[400px] min-w-0">
            <FadeOnSelection selectionKey={selectionKey} className="flex h-full flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-md font-normal text-secondary">Deal Stages</p>
                    <ButtonUtility size="sm" color="tertiary" tooltip="View trend" icon={TrendUp02} />
                </div>

                <div ref={trackRef} className="min-w-0 flex-1 overflow-x-auto">
                    <div className="flex h-full items-stretch gap-3">
                        {dealStages.map((stage) => (
                            <DealStageBarColumn key={stage.label} fraction={dealStageFraction(stage.value, values, trackHeightPx)} {...stage} />
                        ))}
                    </div>
                </div>
            </FadeOnSelection>
        </Card>
    );
};
