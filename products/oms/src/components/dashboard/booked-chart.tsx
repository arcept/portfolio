import { AnimatePresence, motion } from "motion/react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { ChartPoint, PeriodChartData } from "@/data/dashboard-data";

const fadeTransition = { duration: 0.25, ease: "easeOut" as const };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Custom (not the shared ChartTooltipContent — its single title/payload-list shape can't carry
 * this tooltip's two-tier hierarchy) — same visual language as the Deal Stages/Sales Funnel
 * tooltips built earlier: bold title, a divider, a breakdown, another divider, a second
 * breakdown. Cumulative totals come first (what the curve's own position represents), that
 * day's own amount after — a holiday's ~₹0 there is exactly where it should read as the reason
 * the cumulative line above it went flat, not the other way around. */
const BookedChartTooltip = ({
    active,
    payload,
    holidays,
}: {
    active?: boolean;
    // Recharts doesn't type its own tooltip payload correctly, and types it `readonly`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: readonly any[];
    holidays: { x: number; label: string }[];
}) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload as ChartPoint;
    const holiday = holidays.find((h) => h.x === point.x);
    const dateLabel = point.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className="flex w-max flex-col gap-1.5 rounded-lg bg-primary-solid px-3 py-2.5 shadow-lg">
            <p className="text-xs font-semibold text-white">
                {dateLabel}
                {holiday && <span className="text-fg-warning-secondary"> — {holiday.label}</span>}
            </p>

            <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
                <div className="flex items-center justify-between gap-4 text-[11px] text-tooltip-supporting-text">
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 shrink-0 rounded-full bg-fg-brand-primary" />
                        Booked (cumulative)
                    </span>
                    <span className="font-mono">{inr(point.booked)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[11px] text-tooltip-supporting-text">
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 shrink-0 rounded-full bg-fg-success-primary" />
                        Realised (cumulative)
                    </span>
                    <span className="font-mono">{inr(point.realised)}</span>
                </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
                <div className="flex items-center justify-between gap-4 text-[11px] font-medium text-white">
                    <span>Booked today</span>
                    <span className="font-mono">{inr(point.dailyBooked)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[11px] text-tooltip-supporting-text">
                    <span>Realised today</span>
                    <span className="font-mono">{inr(point.dailyRealised)}</span>
                </div>
            </div>
        </div>
    );
};

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
                                tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "var(--color-text-tertiary)" }}
                                padding={{ left: 12, right: 12 }}
                            />

                            <Tooltip
                                content={({ active, payload }) => <BookedChartTooltip active={active} payload={payload} holidays={data.holidays} />}
                                cursor={{ stroke: "var(--color-border-secondary)" }}
                            />

                            {/* National holidays (e.g. Independence Day) — the curve itself already shows
                                a stagnant dip there (see applyHolidayStagnation). No permanent label on
                                the line itself; the name only surfaces in the tooltip above, on hovering
                                that exact day. */}
                            {data.holidays.map((holiday) => (
                                <ReferenceLine key={holiday.x} x={holiday.x} stroke="var(--color-fg-warning-secondary)" strokeDasharray="4 3" strokeWidth={1} />
                            ))}

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
