import { TrendUp02 } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import type { PeriodSelection } from "@/data/dashboard-data";
import { getPeriodSelectionKey } from "@/data/dashboard-data";
import { getLostDealsSummaryForSelection, getSalesFunnelCourseBreakdown, getSalesFunnelFlow } from "@/data/dashboard-metrics";
import { Card, FadeOnSelection } from "./stat-cards";

/** Row 2, middle column — course-by-course conversion table plus the Lost Deals summary folded
 * into its footer (Figma node 548:16168, re-fetched after the user merged Lost Deals into it —
 * previously a standalone "Lost deals" card in `stat-cards.tsx`). Only 4 columns
 * (Course/App/Offer/Payment) per the Figma spec — no Completed column, unlike
 * `SalesFunnelCourseTable`, which this replaces as the on-page course breakdown (that table's
 * render was removed from `sales-funnel-section.tsx`). */
export const ConversionCard = ({ selection, onCourseClick, onLostDealsClick }: { selection: PeriodSelection; onCourseClick?: (courseId: string) => void; onLostDealsClick?: () => void }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const selectionKey = getPeriodSelectionKey(selection);
    const rows = getSalesFunnelCourseBreakdown(selection, persona, deals);
    const flow = getSalesFunnelFlow(selection, persona, deals);
    const lost = getLostDealsSummaryForSelection(selection, persona, deals);

    const overall = {
        application: flow.nodes[0].value,
        offer: flow.nodes[1].value,
        offerConversionPct: flow.conversionPct[0],
        payment: flow.nodes[2].value,
        paymentConversionPct: flow.conversionPct[1],
    };

    return (
        <Card className="h-full min-w-0">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-tertiary">Conversion</p>
                <ButtonUtility size="sm" color="tertiary" tooltip="View trend" icon={TrendUp02} />
            </div>

            <FadeOnSelection selectionKey={selectionKey} className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="min-w-0 overflow-x-auto">
                    <table className="w-full min-w-72 border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-secondary text-xs text-tertiary">
                                <th className="py-2 pr-2 pl-2 text-left font-medium">Course</th>
                                <th className="py-2 pr-2 text-right font-medium">App</th>
                                <th className="py-2 pr-2 text-right font-medium">Offer</th>
                                <th className="py-2 pr-2 text-right font-medium">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.courseId}
                                    onClick={onCourseClick ? () => onCourseClick(row.courseId) : undefined}
                                    className={onCourseClick ? "cursor-pointer border-b border-secondary transition duration-100 ease-linear hover:bg-primary_hover" : "border-b border-secondary"}
                                >
                                    <td className="py-2.5 pr-2 pl-2 font-medium text-primary">{row.courseLabel}</td>
                                    <td className="py-2.5 pr-2 text-right font-mono text-secondary">{String(row.application).padStart(2, "0")}</td>
                                    <td className="py-2.5 pr-2 text-right font-mono text-secondary">
                                        {String(row.offer).padStart(2, "0")} <span className="text-tertiary">{row.offerConversionPct}%</span>
                                    </td>
                                    <td className="py-2.5 pr-2 text-right font-mono text-secondary">
                                        {String(row.payment).padStart(2, "0")} <span className="text-tertiary">{row.paymentConversionPct}%</span>
                                    </td>
                                </tr>
                            ))}
                            <tr className="font-semibold">
                                <td className="py-2.5 pr-2 pl-2 text-primary">Overall</td>
                                <td className="py-2.5 pr-2 text-right font-mono text-primary">{String(overall.application).padStart(2, "0")}</td>
                                <td className="py-2.5 pr-2 text-right font-mono text-primary">
                                    {String(overall.offer).padStart(2, "0")} <span className="font-normal text-fg-success-secondary">{overall.offerConversionPct}%</span>
                                </td>
                                <td className="py-2.5 pr-2 text-right font-mono text-primary">
                                    {String(overall.payment).padStart(2, "0")} <span className="font-normal text-fg-success-secondary">{overall.paymentConversionPct}%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto flex items-center gap-3 rounded-lg bg-primary_alt px-4 py-2">
                    <div className="flex flex-1 flex-col">
                        <div className="flex items-baseline gap-2">
                            <p className="text-md font-medium text-secondary">Lost Deals</p>
                            <span className="font-mono text-md font-medium text-primary">{lost.percent}%</span>
                        </div>
                        <p className="text-sm text-secondary">
                            You closed <span className="font-mono">{lost.closedCount}</span> out of <span className="font-mono">{lost.cohortSize}</span> deals
                        </p>
                    </div>
                    <ButtonUtility size="sm" color="tertiary" tooltip="All deals" icon={TrendUp02} onClick={onLostDealsClick} />
                </div>
            </FadeOnSelection>
        </Card>
    );
};
