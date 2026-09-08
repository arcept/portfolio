import type { SalesFunnelCourseRow } from "@/data/dashboard-metrics";

export const SalesFunnelCourseTable = ({ rows, onRowClick }: { rows: SalesFunnelCourseRow[]; onRowClick?: (courseId: string) => void }) => (
    <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-sm">
            <thead>
                <tr className="border-b border-secondary text-xs text-tertiary">
                    <th className="py-2 pr-4 text-left font-medium">Course</th>
                    <th className="py-2 pr-4 text-right font-medium">Application</th>
                    <th className="py-2 pr-4 text-right font-medium">Offer</th>
                    <th className="py-2 pr-4 text-right font-medium">Payment</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr
                        key={row.courseId}
                        onClick={onRowClick ? () => onRowClick(row.courseId) : undefined}
                        className={onRowClick ? "cursor-pointer border-b border-secondary transition duration-100 ease-linear last:border-0 hover:bg-primary_hover" : "border-b border-secondary last:border-0"}
                    >
                        <td className="py-2.5 pr-4 font-medium text-primary">{row.courseLabel}</td>
                        <td className="py-2.5 pr-4 text-right font-mono text-secondary">{row.application}</td>
                        <td className="py-2.5 pr-4 text-right font-mono text-secondary">
                            {row.offer} <span className="text-tertiary">({row.offerConversionPct}%)</span>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono text-secondary">
                            {row.payment} <span className="text-tertiary">({row.paymentConversionPct}%)</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
