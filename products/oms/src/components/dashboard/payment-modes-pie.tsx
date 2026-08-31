import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import type { PaymentModeBreakdown } from "@/data/dashboard-data";

/**
 * Pie breakdown of Total Realised by payment gateway (Manual / Razorpay / Stripe / EMI).
 * Data is real and reconciled (see paymentModesFor in dashboard-data.ts), but this
 * component isn't wired into any page yet — no UI slot exists for it until the
 * Stages/Modes toggle on the Deal Stages card is designed.
 */
const MODE_COLORS: Record<string, string> = {
    Manual: "var(--color-fg-quaternary)",
    Razorpay: "var(--color-fg-brand-primary)",
    Stripe: "var(--color-fg-success-primary)",
    EMI: "var(--color-fg-warning-primary)",
};

export const PaymentModesPie = ({ data }: { data: PaymentModeBreakdown }) => {
    return (
        <div className="flex h-full min-h-0 w-full items-center gap-6">
            <div className="h-full min-h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="amount" nameKey="mode" innerRadius="60%" outerRadius="100%" paddingAngle={2} stroke="none">
                            {data.map((entry) => (
                                <Cell key={entry.mode} fill={MODE_COLORS[entry.mode] ?? "var(--color-fg-quaternary)"} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent isPieChart />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <ul className="flex flex-1 flex-col gap-2">
                {data.map((entry) => (
                    <li key={entry.mode} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-secondary">
                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: MODE_COLORS[entry.mode] }} />
                            {entry.mode}
                        </span>
                        <span className="font-mono text-[13px] text-tertiary">{entry.percent}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
