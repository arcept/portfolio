import { AnimatePresence, motion } from "motion/react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import type { PeriodChartData } from "@/data/dashboard-data";

const fadeTransition = { duration: 0.25, ease: "easeOut" as const };

export const BookedChart = ({ data, selectionKey }: { data: PeriodChartData; selectionKey: string }) => {
    return (
        <div className="relative h-full min-h-0 w-full">
            <AnimatePresence mode="wait" initial={false}>
                {/* Keyed by selection so switching periods swaps in a fresh chart with a plain
                    crossfade, rather than Recharts interpolating/morphing the old shape into the
                    new one (isAnimationActive is off below for the same reason). */}
                <motion.div
                    key={selectionKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fadeTransition}
                    className="absolute inset-0"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data.points} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                            <defs>
                                <linearGradient id="booked-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-fg-brand-primary)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--color-fg-brand-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} stroke="var(--color-border-secondary)" />

                            <XAxis
                                type="number"
                                dataKey="x"
                                domain={data.xDomain}
                                ticks={data.xTicks}
                                tickFormatter={data.xTickFormatter}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
                                padding={{ left: 12, right: 12 }}
                            />

                            <Tooltip
                                content={<ChartTooltipContent />}
                                cursor={{ stroke: "var(--color-border-secondary)" }}
                                labelFormatter={(x) => {
                                    const point = data.points.find((p) => p.x === x);
                                    return point?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "";
                                }}
                                formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                            />

                            <Area
                                type="monotone"
                                dataKey="booked"
                                stroke="var(--color-fg-brand-primary)"
                                strokeWidth={2}
                                fill="url(#booked-fill)"
                                name="Booked"
                                isAnimationActive={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="realised"
                                stroke="var(--color-fg-success-primary)"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={false}
                                name="Realised"
                                isAnimationActive={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
