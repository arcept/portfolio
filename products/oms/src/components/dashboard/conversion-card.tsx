import { TrendUp02 } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import type { PeriodSelection } from "@/data/dashboard-data";
import { getPeriodSelectionKey } from "@/data/dashboard-data";
import { getLostDealsSummaryForSelection, getSalesFunnelCourseBreakdown } from "@/data/dashboard-metrics";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { Card, FadeOnSelection } from "./stat-cards";

/** Row 2, middle column — course-by-course conversion table plus the Lost Deals summary folded
 * into its footer (Figma node 548:16168, re-fetched after the user merged Lost Deals into it —
 * previously a standalone "Lost deals" card in `stat-cards.tsx`). Only 4 columns
 * (Course/App/Offer/Payment) per the Figma spec — no Completed column, unlike
 * `SalesFunnelCourseTable`, which this replaces as the on-page course breakdown (that table's
 * render was removed from `sales-funnel-section.tsx`). */
export const ConversionCard = ({
    selection,
    onCourseClick,
    onLostDealsClick,
}: {
    selection: PeriodSelection;
    onCourseClick?: (courseId: string) => void;
    onLostDealsClick?: () => void;
}) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const selectionKey = getPeriodSelectionKey(selection);
    const rows = getSalesFunnelCourseBreakdown(selection, persona, deals);
    const lost = getLostDealsSummaryForSelection(selection, persona, deals);

    // Summed straight off `rows` (not read from `getSalesFunnelFlow`) so "Overall" always
    // reconciles with the course rows above it — the ribbon's own Application total can now be
    // wider than this table's (it also counts APP_NEW deals, per Manik's call, 2026-09-11), and
    // this table's rows never did, so the two totals are legitimately different populations.
    const overall = {
        application: rows.reduce((sum, r) => sum + r.application, 0),
        offer: rows.reduce((sum, r) => sum + r.offer, 0),
        payment: rows.reduce((sum, r) => sum + r.payment, 0),
    };
    const overallOfferConversionPct = overall.application === 0 ? 0 : Math.round((overall.offer / overall.application) * 100);
    const overallPaymentConversionPct = overall.offer === 0 ? 0 : Math.round((overall.payment / overall.offer) * 100);

    return (
        <Card className="h-full max-h-[400px] min-w-0">
            <FadeOnSelection selectionKey={selectionKey} className="flex h-full min-w-0 flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-md font-normal text-secondary">Conversion</p>
                    <ButtonUtility size="sm" color="tertiary" tooltip="View trend" icon={TrendUp02} />
                </div>

                <div className="min-w-0 overflow-x-auto">
                    <table className="w-full min-w-72 border-collapse">
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
                                    className={
                                        onCourseClick
                                            ? "cursor-pointer border-b border-secondary transition duration-100 ease-linear hover:bg-primary_hover"
                                            : "border-b border-secondary"
                                    }
                                >
                                    <td className="py-2.5 pr-2 pl-2 text-md font-normal text-primary">{row.courseLabel}</td>
                                    <td className="py-2.5 pr-2 text-right font-mono text-md text-primary">{String(row.application).padStart(2, "0")}</td>
                                    <td className="py-2.5 pr-2 text-right font-mono text-md text-primary">
                                        {String(row.offer).padStart(2, "0")}{" "}
                                        <span className="text-[10px] font-normal text-success-primary">{row.offerConversionPct}%</span>
                                    </td>
                                    <td className="py-2.5 pr-2 text-right font-mono text-md text-primary">
                                        {String(row.payment).padStart(2, "0")}{" "}
                                        <span className="text-[10px] font-normal text-success-primary">{row.paymentConversionPct}%</span>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td className="py-2.5 pr-2 pl-2 text-md font-medium text-primary">Overall</td>
                                <td className="py-2.5 pr-2 text-right font-mono text-md font-semibold text-primary">
                                    {String(overall.application).padStart(2, "0")}
                                </td>
                                <td className="py-2.5 pr-2 text-right font-mono text-md font-semibold text-primary">
                                    {String(overall.offer).padStart(2, "0")}{" "}
                                    <span className="text-[10px] font-normal text-success-primary">{overallOfferConversionPct}%</span>
                                </td>
                                <td className="py-2.5 pr-2 text-right font-mono text-md font-semibold text-primary">
                                    {String(overall.payment).padStart(2, "0")}{" "}
                                    <span className="text-[10px] font-normal text-success-primary">{overallPaymentConversionPct}%</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto flex items-center gap-3 rounded-lg bg-primary_alt px-4 py-2">
                    <div className="flex flex-1 flex-col">
                        <div className="flex items-baseline gap-2">
                            <p className="text-md font-medium text-error-primary">Lost Deals</p>
                            <span className="font-mono text-md font-semibold text-fg-error-secondary">{lost.percent}%</span>
                        </div>
                        <p className="text-sm text-error-primary/60">
                            You lost <span className="font-mono">{lost.lostCount}</span> out of <span className="font-mono">{lost.cohortSize}</span> deals
                        </p>
                    </div>
                    <ButtonUtility
                        size="sm"
                        color="tertiary"
                        tooltip="All deals"
                        icon={TrendUp02}
                        onClick={onLostDealsClick}
                        className="text-fg-error-secondary"
                    />
                </div>
            </FadeOnSelection>
        </Card>
    );
};
