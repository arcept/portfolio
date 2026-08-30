import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { bookedTrend } from "@/data/dashboard-data";

export const BookedChart = () => {
    return (
        <div className="h-full min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={bookedTrend} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                        <linearGradient id="booked-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-fg-brand-primary)" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="var(--color-fg-brand-primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke="var(--color-border-secondary)" />

                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        ticks={[1, 5, 10, 15, 20, 25, 30]}
                        tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
                        padding={{ left: 12, right: 12 }}
                    />

                    <Tooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--color-border-secondary)" }} />

                    <Area type="monotone" dataKey="booked" stroke="var(--color-fg-brand-primary)" strokeWidth={2} fill="url(#booked-fill)" name="Booked" />
                    <Line
                        type="monotone"
                        dataKey="realised"
                        stroke="var(--color-fg-success-primary)"
                        strokeWidth={2}
                        dot={false}
                        name="Realised"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
