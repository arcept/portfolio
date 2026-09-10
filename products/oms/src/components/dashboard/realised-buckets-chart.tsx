import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/utils/cx";
import type { RealisedBucket } from "@/data/dashboard-data";
import { formatIndianNumber } from "@/data/dashboard-data";

/** Revenue Realised card's mini bar chart (Figma node 576:8167) — the track measures its own
 * available height via ResizeObserver (same recipe as Deal Stages' bars, `stat-cards.tsx`) so it
 * can fill the card's full height now that this is the card's only content. Deliberately NOT the
 * pattern that broke the Sales Funnel ribbon's standalone embed — that bug was an SVG `height:
 * 100%` resolving against an indeterminate ancestor, not this same ResizeObserver+pixel-height
 * technique on plain divs, which Deal Stages already proves safe in this exact embed context.
 *
 * Each bar is a stack of up to 2 segments — previous-period realised on top (a one-off
 * yellow-green gradient, Manik's exact Figma values, no established token to reuse) and
 * this-period realised on the bottom (the app's existing mint→cyan→blue gradient, same hex
 * already used for the Sales Funnel ribbon's core layer and the Deal Stages "Total Enrolled" bar)
 * — so a bucket with only one side reads as a single solid-color bar, matching Figma's own
 * asymmetric bars.
 *
 * Scaling: each bar's total height is proportional to its total value (relative to the tallest
 * bar). Within a stacked bar, a nonzero segment (previous-period or this-period) is floored to a
 * square — height == the bar's own rendered width — so a small slice never reads as a hairline;
 * the bar's total height grows past its natural proportional height when needed to fit both
 * segments' minimums. */

const ZERO_BAR_HEIGHT_PX = 4;
const SEGMENT_GAP_PX = 4;
const TRACK_GAP_PX = 12;

const PREVIOUS_GRADIENT = "linear-gradient(135deg, #F0FF00 0%, #58FBBA 100%)";
const THIS_PERIOD_GRADIENT = "linear-gradient(180deg, #70F9AF 0%, #00D3F3 55%, #2B7FFF 100%)";

type TooltipState = { bucket: RealisedBucket; x: number; y: number };

const inr = (n: number) => `₹${formatIndianNumber(Math.round(n))}`;

export const RealisedBucketsChart = ({ buckets }: { buckets: RealisedBucket[] }) => {
    const [hover, setHover] = useState<TooltipState | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [trackSize, setTrackSize] = useState({ width: 0, height: 96 });
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setTrackSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const barWidth = buckets.length > 0 ? Math.max(0, trackSize.width - TRACK_GAP_PX * (buckets.length - 1)) / buckets.length : 0;
    const maxTotal = Math.max(...buckets.map((b) => b.total), 1);

    return (
        <div ref={trackRef} className="relative flex h-full min-h-0 items-end gap-3">
            {buckets.map((bucket) => {
                const hasBoth = bucket.previousRealised > 0 && bucket.thisRealised > 0;
                const naturalHeight = bucket.total > 0 ? Math.round((bucket.total / maxTotal) * trackSize.height) : ZERO_BAR_HEIGHT_PX;
                const innerNatural = hasBoth ? naturalHeight - SEGMENT_GAP_PX : naturalHeight;

                let previousHeight = 0;
                let thisHeight = 0;
                if (bucket.total > 0) {
                    previousHeight = Math.round((bucket.previousRealised / bucket.total) * innerNatural);
                    thisHeight = Math.max(0, innerNatural - previousHeight);
                    if (bucket.previousRealised > 0) previousHeight = Math.max(previousHeight, barWidth);
                    if (bucket.thisRealised > 0) thisHeight = Math.max(thisHeight, barWidth);
                }

                const barHeight = bucket.total > 0 ? previousHeight + thisHeight + (hasBoth ? SEGMENT_GAP_PX : 0) : ZERO_BAR_HEIGHT_PX;

                return (
                    <div
                        key={bucket.index}
                        className="flex flex-1 cursor-pointer flex-col justify-end gap-1"
                        style={{ height: barHeight }}
                        onMouseEnter={(e) => setHover({ bucket, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => setHover({ bucket, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHover(null)}
                    >
                        {bucket.previousRealised > 0 && <div className="w-full shrink-0 rounded-full" style={{ height: previousHeight, background: PREVIOUS_GRADIENT }} />}
                        {bucket.thisRealised > 0 && (
                            <div className="w-full shrink-0 rounded-full opacity-95" style={{ height: thisHeight, background: THIS_PERIOD_GRADIENT }} />
                        )}
                        {bucket.total === 0 && <div className="w-full shrink-0 rounded-full bg-secondary" style={{ height: barHeight }} />}
                    </div>
                );
            })}

            {hover &&
                createPortal(
                    <div
                        className="pointer-events-none fixed z-50 flex w-max max-w-64 flex-col gap-1.5 rounded-lg bg-primary-solid px-3 py-2.5 shadow-lg"
                        style={{ left: hover.x, top: hover.y, transform: "translate(-50%, calc(-100% - 14px))" }}
                    >
                        <div className="flex items-baseline justify-between gap-4">
                            <span className="text-xs font-semibold text-white">{hover.bucket.label}</span>
                            <span className="font-mono text-xs font-semibold text-white">{inr(hover.bucket.total)}</span>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
                            <div className="flex items-center justify-between gap-4 text-[11px] text-tooltip-supporting-text">
                                <span className="flex items-center gap-1.5">
                                    <span className={cx("size-1.5 shrink-0 rounded-full")} style={{ background: PREVIOUS_GRADIENT }} />
                                    Previous Period
                                </span>
                                <span className="font-mono">{inr(hover.bucket.previousRealised)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-[11px] text-tooltip-supporting-text">
                                <span className="flex items-center gap-1.5">
                                    <span className={cx("size-1.5 shrink-0 rounded-full")} style={{ background: THIS_PERIOD_GRADIENT }} />
                                    This Period
                                </span>
                                <span className="font-mono">{inr(hover.bucket.thisRealised)}</span>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};
