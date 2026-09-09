import { useNavigate } from "react-router";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Copy01, Download01, Edit01 } from "@untitledui/icons";
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

const HeadlineFigure = ({ label, value, changePct, changeSuffix }: { label: string; value: string; changePct: number | null; changeSuffix: string }) => (
    <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-secondary">{label}</p>
        <div className="flex items-baseline gap-2">
            <span className="font-mono text-display-md font-semibold tracking-tight text-primary">{value}</span>
            {changePct !== null && (
                <span className={cx("font-mono text-sm font-medium", changePct >= 0 ? "text-fg-success-secondary" : "text-fg-error-secondary")}>
                    {changePct >= 0 ? "+" : ""}
                    {changePct.toFixed(0)}% <span className="font-sans">{changeSuffix}</span>
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

    return (
        <div className="relative flex min-w-0 flex-col gap-6 rounded-xl border border-secondary bg-primary px-8 py-6">
            <div className="absolute top-6 right-8">
                <CardActionsMenu />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-secondary">Sales Funnel</h2>
                        <span className="rounded-md bg-primary_alt px-1.5 py-0.5 text-xs font-medium text-secondary shadow-xs">Showing: {scopeLabel}</span>
                    </div>
                    <p className="text-xs text-tertiary">Application → Offer → Payment → Completed, with where deals drop out along the way</p>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                    <HeadlineFigure label="Applications Sent" value={String(animatedApplicationsSent)} changePct={headline.applicationsSentChangePct} changeSuffix="vs prior period" />
                    <HeadlineFigure label="Overall Conversion" value={`${animatedConversionPct}%`} changePct={headline.conversionChangePct} changeSuffix="vs prior period" />
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
                <div className="min-w-0 overflow-x-auto">
                    <SalesFunnelRibbon flow={flow} width={RIBBON_WIDTH} height={RIBBON_HEIGHT} onBandClick={(nodeId) => goToDeals(`tab=${TAB_BY_NODE[nodeId]}`)} />
                </div>
            )}
        </div>
    );
};
