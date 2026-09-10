import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { type PeriodSelection, formatIndianNumber, getPeriodSelectionKey, getPersonaLabel } from "@/data/dashboard-data";
import { getSalesFunnelFlow, getSalesFunnelHeadline } from "@/data/dashboard-metrics";
import type { FunnelFlowNodeId } from "@/data/dashboard-metrics";
import { useCountUp } from "@/hooks/use-count-up";
import { useDeals } from "@/providers/deals-provider";
import type { Persona } from "@/types/role";
import { cx } from "@/utils/cx";
import { SalesFunnelRibbon } from "./sales-funnel-ribbon";
import { FadeOnSelection } from "./stat-cards";

/** Below this many deals in the cohort, the ribbon renders too small/sparse to read
 * meaningfully (this is exactly the case that broke a previous attempt at date-scoping this
 * chart, per the brief) — a plain text fallback with the raw counts reads better than a
 * collapsed diagram. Starting default; tune once real data volumes are in front of us. */
const SANKEY_MIN_COHORT_SIZE = 8;

const RIBBON_WIDTH = 880;
const RIBBON_HEIGHT = 300;
const RIBBON_MAX_HEIGHT = 400;

/** Unit Sales/Target's badge (Figma node 576:8946) isn't a growth indicator like its siblings —
 * it's a pace-against-goal reading, so its color is a flat 4-band scale off the raw attainment
 * %, not a green/red up-or-down call (Manik's call, 2026-09-10). Exported for reuse by the
 * Admin Funnel per-Team-Manager card (team-manager-funnel-card.tsx), which reads the same
 * attainment % off `getSalesFunnelHeadline`. */
export const unitTargetAttainmentTone = (pct: number) => {
    if (pct < 20) return "text-utility-red-500";
    if (pct < 40) return "text-utility-orange-500";
    if (pct < 60) return "text-utility-amber-500";
    return "text-utility-green-500";
};

/** Figma node 576:8635/8642/8946 — three of these sit side by side in the card header. Value
 * typography matches the Figma export exactly (28px IBM Plex Mono, no `tracking-tight`, unlike
 * the display-scale numbers used elsewhere in the app) rather than reusing an existing
 * `text-display-*` token, since none of them land on 28px. The %-change badge text is
 * deliberately NOT `font-mono` here (every other %-change badge in the app is) — the Figma
 * export explicitly re-styles all three of this card's badges to Inter, a specific typography
 * change Manik made to this card only, not an accidental default. `tone` picks the badge's
 * color: the default green/red up-or-down reading for the two growth figures, or
 * `unitTargetAttainmentTone` for Unit Sales/Target's flat pace-band reading (paired with
 * `hideArrow` there too — a 4-band color already carries the "how are we doing" signal, so a
 * directional arrow next to it would just be noise/redundant, per Manik's ask). */
const HeadlineFigure = ({
    label,
    value,
    valueSuffix,
    changePct,
    tone,
    hideArrow = false,
    minWidthPx,
}: {
    label: ReactNode;
    value: string;
    valueSuffix?: string;
    changePct: number | null;
    tone?: (pct: number) => string;
    hideArrow?: boolean;
    /** Reserves floor width for the value+badge row so `useCountUp`'s digit count growing/
     * shrinking mid-animation (e.g. "9" -> "67", or a shorter value on the next period switch)
     * doesn't reflow this block — and, since the three figures sit in one `justify-between` row
     * next to the title block, doesn't visibly shift the whole row sideways either (Manik's ask:
     * this read as the same jitter the Deal Stages grid column had, fixed the same way — pin the
     * width instead of leaving it content-driven). Each instance's value is set to the widest
     * real width that stat hits across every period preset, plus headroom. */
    minWidthPx?: number;
}) => (
    <div className="flex shrink-0 flex-col gap-1 px-2" style={minWidthPx ? { minWidth: minWidthPx } : undefined}>
        <p className="text-sm font-medium whitespace-nowrap text-secondary">{label}</p>
        <div className="flex items-center gap-2">
            <p className="font-mono text-[28px] font-semibold whitespace-nowrap text-primary">
                {value}
                {valueSuffix && <span className="font-light">{valueSuffix}</span>}
            </p>
            {changePct !== null && (
                <span
                    className={cx(
                        "inline-flex items-center gap-0.5 text-sm font-medium whitespace-nowrap",
                        tone ? tone(changePct) : changePct < 0 ? "text-fg-error-secondary" : "text-fg-success-secondary",
                    )}
                >
                    {!hideArrow && (changePct >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    {Math.abs(changePct).toFixed(0)}%
                </span>
            )}
        </div>
    </div>
);

/** Figma node 576:8926, sitting in the ribbon's own bottom-right corner — the empty space
 * beside the dropout row, since "Completed" is the one node with no drop-off badge under it.
 * Positioned via `absolute` (inside the ribbon wrapper's own `relative`) rather than reusing the
 * ribbon's internal SVG coordinate math, since that math is keyed to the ribbon's *dynamic*,
 * ResizeObserver-measured width — this stat isn't part of the ribbon drawing itself, so it stays
 * anchored to the corner at any width instead of chasing a fixed 698px Figma export position.
 * Typography intentionally differs from `HeadlineFigure` above (20px IBM Plex Sans SemiBold, not
 * 28px mono, one-line label not two) — that's what the Figma export specifies for this stat. */
const AverageTicketSizeStat = ({ value, changePct }: { value: number; changePct: number | null }) => (
    <div className="absolute right-0 bottom-0 flex flex-col gap-1 px-2">
        <p className="text-sm font-medium whitespace-nowrap text-secondary">Average Ticket Size</p>
        <div className="flex items-center gap-2">
            <p className="text-xl font-semibold whitespace-nowrap text-primary">₹ {formatIndianNumber(value)}</p>
            {changePct !== null && (
                <span
                    className={cx(
                        "inline-flex items-center gap-0.5 text-sm font-medium whitespace-nowrap",
                        changePct >= 0 ? "text-fg-success-secondary" : "text-fg-error-secondary",
                    )}
                >
                    {changePct >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {Math.abs(changePct).toFixed(0)}%
                </span>
            )}
        </div>
    </div>
);

const TAB_BY_NODE: Record<FunnelFlowNodeId, string> = { application: "application", offer: "offer", payment: "payment", completed: "completed" };

export const SalesFunnelSection = ({ selection, scope }: { selection: PeriodSelection; scope: Persona }) => {
    const { deals } = useDeals();
    const navigate = useNavigate();

    const flow = getSalesFunnelFlow(selection, scope, deals);
    const headline = getSalesFunnelHeadline(selection, scope, deals);
    const scopeLabel = scope.role === "admin" ? "Org-wide" : getPersonaLabel(scope);
    const selectionKey = getPeriodSelectionKey(selection);
    const animatedApplicationsSent = useCountUp(headline.applicationsSent);
    const animatedConversionPct = useCountUp(headline.conversionPct);
    const animatedUnitsAchieved = useCountUp(headline.unitsAchieved);

    const goToDeals = (params: string) => navigate(`/deals?${params}`);

    // The ribbon fills whatever vertical space is actually left in the card — no more fixed
    // aspect ratio leaving dead space at the bottom when this card sits in a grid row next to a
    // taller sibling (e.g. Booked Revenue) that stretches it. Falls back to the design-time
    // RIBBON_WIDTH/RIBBON_HEIGHT until the first real measurement lands, so it never flashes 0×0.
    // Capped at RIBBON_MAX_HEIGHT (matching the wrapper's own max-h-[400px] below) — the case
    // study embeds this card outside the grid context that normally bounds its height (a fixed,
    // unusually tall iframe viewport with no height-constraining sibling), where an unbounded
    // flex-1 + ResizeObserver loop was blowing the ribbon up to thousands of pixels tall.
    const ribbonWrapRef = useRef<HTMLDivElement>(null);
    const [ribbonSize, setRibbonSize] = useState({ width: RIBBON_WIDTH, height: RIBBON_HEIGHT });
    useEffect(() => {
        const el = ribbonWrapRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) =>
            setRibbonSize({ width: entry.contentRect.width, height: Math.min(entry.contentRect.height, RIBBON_MAX_HEIGHT) }),
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative flex min-w-0 flex-col gap-2 rounded-xl border border-secondary bg-primary px-8 py-6">
            <div className="flex items-start justify-between gap-4">
                <FadeOnSelection selectionKey={selectionKey} className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h2 className="shrink-0 text-xl font-semibold whitespace-nowrap text-secondary">Sales Funnel</h2>
                        <span className="shrink-0 rounded-md bg-primary_alt px-1.5 py-0.5 font-mono text-xs font-medium whitespace-nowrap text-secondary shadow-xs">
                            {scopeLabel}
                        </span>
                    </div>
                    <p className="text-xs text-tertiary">Application → Offer → Payment → Completed, with where deals drop out along the way</p>
                </FadeOnSelection>

                {/* Not wrapped in `FadeOnSelection` like the label block to its left — these two
                    figures already animate on every period switch via `useCountUp` (ticking from
                    the old value to the new one), which needs the component to stay mounted
                    across the switch. Remounting it inside a fade would reset the count to 0
                    every time instead of counting up from where it was. */}
                <div className="flex shrink-0 items-start gap-4">
                    <HeadlineFigure
                        label={
                            <>
                                Applications
                                <br />
                                Sent
                            </>
                        }
                        value={String(animatedApplicationsSent)}
                        changePct={headline.applicationsSentChangePct}
                        minWidthPx={140}
                    />
                    <HeadlineFigure
                        label={
                            <>
                                Overall
                                <br />
                                Conversion
                            </>
                        }
                        value={`${animatedConversionPct}%`}
                        changePct={headline.conversionChangePct}
                        minWidthPx={130}
                    />
                    <HeadlineFigure
                        label={
                            <>
                                Unit Sales
                                <br />
                                /Target
                            </>
                        }
                        value={String(animatedUnitsAchieved)}
                        valueSuffix={`/${headline.unitTarget}`}
                        changePct={headline.unitTargetAttainmentPct}
                        tone={unitTargetAttainmentTone}
                        hideArrow
                        minWidthPx={185}
                    />
                </div>
            </div>

            {flow.cohortSize < SANKEY_MIN_COHORT_SIZE ? (
                <EmptyState size="sm" className="mx-auto max-w-none py-6">
                    <EmptyState.Content>
                        <EmptyState.Description>
                            Not enough deals in this range to visualize — {flow.nodes[0].value} Application · {flow.nodes[1].value} Offer ·{" "}
                            {flow.nodes[2].value} Payment · {flow.nodes[3].value} Completed.
                        </EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            ) : (
                <div ref={ribbonWrapRef} className="relative max-h-[400px] min-h-0 min-w-0 flex-1 overflow-x-auto">
                    <SalesFunnelRibbon
                        flow={flow}
                        width={ribbonSize.width}
                        height={ribbonSize.height}
                        onBandClick={(nodeId) => goToDeals(`tab=${TAB_BY_NODE[nodeId]}`)}
                    />
                    <AverageTicketSizeStat value={headline.ats} changePct={headline.atsChangePct} />
                </div>
            )}
        </div>
    );
};
