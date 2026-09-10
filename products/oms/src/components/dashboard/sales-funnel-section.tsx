import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { ArrowDown, ArrowUp } from "@untitledui/icons";
import { useDeals } from "@/providers/deals-provider";
import { useCountUp } from "@/hooks/use-count-up";
import { cx } from "@/utils/cx";
import { getPersonaLabel, type PeriodSelection } from "@/data/dashboard-data";
import { getSalesFunnelFlow, getSalesFunnelHeadline } from "@/data/dashboard-metrics";
import type { FunnelFlowNodeId } from "@/data/dashboard-metrics";
import type { Persona } from "@/types/role";
import { SalesFunnelRibbon } from "./sales-funnel-ribbon";

/** Below this many deals in the cohort, the ribbon renders too small/sparse to read
 * meaningfully (this is exactly the case that broke a previous attempt at date-scoping this
 * chart, per the brief) — a plain text fallback with the raw counts reads better than a
 * collapsed diagram. Starting default; tune once real data volumes are in front of us. */
const SANKEY_MIN_COHORT_SIZE = 8;

const RIBBON_WIDTH = 880;
const RIBBON_HEIGHT = 300;
const RIBBON_MAX_HEIGHT = 400;

const HeadlineFigure = ({ label, value, changePct }: { label: string; value: string; changePct: number | null }) => (
    <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-secondary">{label}</p>
        <div className="flex items-baseline gap-2">
            <span className="font-mono text-display-md font-semibold tracking-tight text-primary">{value}</span>
            {changePct !== null && (
                <span
                    className={cx(
                        "inline-flex items-center gap-0.5 font-mono text-sm font-medium",
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
    const animatedApplicationsSent = useCountUp(headline.applicationsSent);
    const animatedConversionPct = useCountUp(headline.conversionPct);

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
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h2 className="shrink-0 text-xl font-semibold whitespace-nowrap text-secondary">Sales Funnel</h2>
                        <span className="shrink-0 rounded-md bg-primary_alt px-1.5 py-0.5 font-mono text-xs font-medium whitespace-nowrap text-secondary shadow-xs">{scopeLabel}</span>
                    </div>
                    <p className="text-xs text-tertiary">Application → Offer → Payment → Completed, with where deals drop out along the way</p>
                </div>

                <div className="flex shrink-0 items-start gap-6">
                    <HeadlineFigure label="Applications Sent" value={String(animatedApplicationsSent)} changePct={headline.applicationsSentChangePct} />
                    <HeadlineFigure label="Overall Conversion" value={`${animatedConversionPct}%`} changePct={headline.conversionChangePct} />
                </div>
            </div>

            {flow.cohortSize < SANKEY_MIN_COHORT_SIZE ? (
                <EmptyState size="sm" className="mx-auto max-w-none py-6">
                    <EmptyState.Content>
                        <EmptyState.Description>
                            Not enough deals in this range to visualize — {flow.nodes[0].value} Application · {flow.nodes[1].value} Offer · {flow.nodes[2].value} Payment ·{" "}
                            {flow.nodes[3].value} Completed.
                        </EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            ) : (
                <div ref={ribbonWrapRef} className="min-h-0 max-h-[400px] min-w-0 flex-1 overflow-x-auto">
                    <SalesFunnelRibbon flow={flow} width={ribbonSize.width} height={ribbonSize.height} onBandClick={(nodeId) => goToDeals(`tab=${TAB_BY_NODE[nodeId]}`)} />
                </div>
            )}
        </div>
    );
};
