import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { FunnelFlow, FunnelFlowNodeId, FunnelFlowSubBand } from "@/data/dashboard-metrics";
import { useCountUp } from "@/hooks/use-count-up";

/**
 * Hand-rolled SVG "glowing stream" ribbon, styled after Manik's reference (a continuous,
 * tapering multi-layer glow — no hard node boxes, floating pill labels with guide lines, a soft
 * blurred halo). No d3-sankey/@nivo dependency, same reasoning as before: the shape this needs
 * (one smooth path spanning all four checkpoints, a nested-glow fill built from re-scaled copies
 * of that same path, a hard minimum floor for the sparse case) is plain arithmetic and bezier
 * math, not a layout problem a Sankey library solves for us.
 *
 * Color carries two meanings, not just glow depth: the ribbon is filled with one horizontal
 * gradient (`sf-flow-gradient`) that shifts hue left-to-right across Application → Offer →
 * Payment → Completed (stage), and a junction whose conversion % falls below
 * WEAK_CONVERSION_THRESHOLD swaps the *next* stage's stop for the warning `--color-sf-weak`
 * tone (health). The 4 nested depth layers all share that same gradient — depth is conveyed
 * purely by scale/opacity, not by separate hues, so the two dimensions (stage/health vs. depth)
 * don't fight each other. Stage colors are `--color-sf-<stage>-hue` (theme.css), NOT a shared
 * `--color-sales-funnel-stage-*` family — Tailwind v4's @theme silently drops every member past
 * the first from a `--color-<family>-<shade>` group once it has 3+ non-numeric shade names, so
 * each stage gets its own unmistakably-unique token name instead.
 *
 * Sub-status detail (Pending/Filled/etc.) intentionally isn't drawn as separate bands — the
 * reference's bands read as glow/depth layers around ONE flowing shape, not a real breakdown —
 * it surfaces on hover instead, via the floating tooltip below.
 *
 * Interactivity: the whole visible width is covered by exactly one of `nodeIds.length` "zone"
 * hit-areas (no dead space between the old per-checkpoint hit-rects — that was the bug where
 * most clicks did nothing), each spanning from the previous zone boundary to the next and the
 * full node+pill height, plus up to `nodeIds.length - 1` dropout hit-areas below. Hover shows a
 * rich tooltip (matching the app's existing ChartTooltipContent styling) and brightens just the
 * hovered zone's own glow (a clipped, boosted-opacity duplicate of that zone's layers) — no
 * dimming elsewhere, no wash. The tooltip is rendered via a portal to document.body in
 * `position: fixed` viewport coordinates (not absolutely inside the card) — the card's own
 * `overflow-x-auto` wrapper (needed so the ribbon can scroll on narrow viewports) implicitly
 * clips overflow-y too per the CSS spec's mixed-visible/auto coercion rule, which was cropping
 * the tooltip whenever it opened near the top of the card. Escaping to body sidesteps that
 * entirely; a small clamp/flip keeps it inside the actual browser viewport too.
 *
 * The Application node's pill is rendered larger and in a solid accent fill ("hero" treatment)
 * since it's the one number meant to read as "this is the scale we started from" — every other
 * node stays at the smaller neutral pill style. The whole flow also draws in left-to-right (a
 * clip-path wipe) and every displayed number counts up, on mount and whenever the underlying
 * data changes.
 *
 * Colors come from `--color-sales-funnel-*` (theme.css) fed straight into SVG props as
 * `var(...)` strings — same convention as booked-chart.tsx — so light/dark theming (including
 * the dark-mode-only multi-hue swap) is automatic, zero JS color logic.
 */

const MIN_HALF_HEIGHT = 10;
const LABEL_GAP = 10;
const PILL_HEIGHT = 26;
const PILL_HEIGHT_HERO = 36; // the Application (starting) node's pill — bigger, accent-filled
const NODE_LABEL_HEIGHT = 18; // "Application" / "Offer" / "Payment" / "Completed" text above the pill
const TOP_RESERVED = NODE_LABEL_HEIGHT + PILL_HEIGHT_HERO + LABEL_GAP + 6;
const BOTTOM_RESERVED = PILL_HEIGHT + LABEL_GAP + 6;
const DROPOUT_GAP = 26; // vertical gap between the main flow's bottom edge and the dropout lane's top
const DROPOUT_MAX_HALF = 22;
const DROPOUT_FADE_FRACTION = 0.62; // dropout ribbon dissipates to nothing this far into the gap to the next checkpoint
const REVEAL_DURATION_MS = 900;

// Tooltip viewport clamping: half its max-width (max-w-64 = 256px) plus a small margin, and
// roughly its tallest plausible height (title + a few lines + hint) plus the 14px gap above the
// cursor — below this from the top of the viewport there isn't room to show it above the cursor.
const TOOLTIP_HALF_WIDTH = 140;
const TOOLTIP_FLIP_THRESHOLD = 170;

// Below this, a junction's conversion % is weak enough that the stage stop past it swaps to the
// warning color instead of its normal stage hue. Starting default; tune once real data volumes
// are in front of us, same spirit as SANKEY_MIN_COHORT_SIZE in the parent section.
const WEAK_CONVERSION_THRESHOLD = 45;

// Outer (widest, most transparent) to core (narrowest, brightest) — painted in this order so
// each layer sits on top of the wider one behind it. Color comes from the shared gradient, not
// from here — depth is purely scale + opacity.
const GLOW_DEPTHS = [
    { scale: 1, opacity: 0.14 },
    { scale: 0.72, opacity: 0.32 },
    { scale: 0.46, opacity: 0.6 },
    { scale: 0.22, opacity: 0.95 },
];

// The visual gap between the Application node's near-max width and every later node's true
// proportional width is exaggerated (exponent > 1 on the value ratio) so the taper reads
// dramatically rather than strictly-to-scale — Application itself is unaffected (ratio 1 stays 1).
const DRAMA_EXPONENT = 1.4;

// Checkpoint x-positions as fractions of width — evenly spaced between a fixed left/right margin,
// generalized so adding/removing a stage doesn't require re-deriving these by hand.
const COLUMN_MARGIN_FRACTION = 0.06;
function columnFractionsFor(count: number): number[] {
    if (count === 1) return [0.5];
    const span = 1 - 2 * COLUMN_MARGIN_FRACTION;
    return Array.from({ length: count }, (_, i) => COLUMN_MARGIN_FRACTION + (span * i) / (count - 1));
}

const NODE_LABELS_BY_ID: Record<FunnelFlowNodeId, string> = { application: "Application", offer: "Offer", payment: "Payment", completed: "Completed" };
const DROPOUT_SOURCE: FunnelFlowNodeId[] = ["application", "offer", "payment"];

type Point = { x: number; y0: number; y1: number };

/** One continuous closed path across N checkpoints — top edge left-to-right, bottom edge
 * right-to-left, cubic beziers between consecutive checkpoints (control points at the
 * horizontal midpoint). Generalizes a single tapering ribbon to a multi-segment flowing shape
 * with no visible seam at the middle checkpoints. */
function buildFlowPath(points: Point[]): string {
    const top = points.map((p) => ({ x: p.x, y: p.y0 }));
    const bottom = [...points].reverse().map((p) => ({ x: p.x, y: p.y1 }));

    let d = `M ${top[0].x} ${top[0].y}`;
    for (let i = 1; i < top.length; i++) {
        const prev = top[i - 1];
        const cur = top[i];
        const midX = (prev.x + cur.x) / 2;
        d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
    }
    d += ` L ${bottom[0].x} ${bottom[0].y}`;
    for (let i = 1; i < bottom.length; i++) {
        const prev = bottom[i - 1];
        const cur = bottom[i];
        const midX = (prev.x + cur.x) / 2;
        d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
    }
    return `${d} Z`;
}

type TooltipContent = { title: string; lines: string[]; hint?: string };

const formatSubBands = (subBands: FunnelFlowSubBand[]) => subBands.filter((b) => b.count > 0).map((b) => `${b.label}: ${b.count}`);

const pillWidth = (text: string, hero = false) => (hero ? Math.max(52, 26 + text.length * 13) : Math.max(34, 18 + text.length * 9));

export type SalesFunnelRibbonProps = {
    flow: FunnelFlow;
    width: number;
    height: number;
    onBandClick?: (nodeId: FunnelFlowNodeId, segmentKey: string) => void;
};

export const SalesFunnelRibbon = ({ flow, width, height, onBandClick }: SalesFunnelRibbonProps) => {
    const nodes = flow.nodes;
    const nodeIds = nodes.map((n) => n.id);
    const maxValue = Math.max(nodes[0].value, 1);
    const [hover, setHover] = useState<{ zone: string; content: TooltipContent; x: number; y: number; flip: boolean } | null>(null);

    // Fixed arity (flow.nodes/dropouts/conversionPct are always exactly 4/3/3-tuples), so calling
    // the hook a fixed number of times per array — not once per element in a .map() — stays
    // within the Rules of Hooks.
    const appCount = useCountUp(nodes[0].value);
    const offerCount = useCountUp(nodes[1].value);
    const paymentCount = useCountUp(nodes[2].value);
    const completedCount = useCountUp(nodes[3].value);
    const dropoutCount0 = useCountUp(flow.dropouts[0]);
    const dropoutCount1 = useCountUp(flow.dropouts[1]);
    const dropoutCount2 = useCountUp(flow.dropouts[2]);
    const conversionCount0 = useCountUp(flow.conversionPct[0]);
    const conversionCount1 = useCountUp(flow.conversionPct[1]);
    const conversionCount2 = useCountUp(flow.conversionPct[2]);
    const animatedNodeValues = [appCount, offerCount, paymentCount, completedCount];
    const animatedDropoutCounts = [dropoutCount0, dropoutCount1, dropoutCount2];
    const animatedConversionCounts = [conversionCount0, conversionCount1, conversionCount2];

    // Draws the flow in left-to-right (a clip-path wipe) on mount and whenever the underlying
    // data changes — period switch, scope switch, etc.
    const revealKey = `${nodes.map((n) => n.value).join(",")}|${flow.dropouts.join(",")}`;
    const [revealProgress, setRevealProgress] = useState(0);
    useEffect(() => {
        setRevealProgress(0);
        let raf: number;
        let start: number | null = null;
        const tick = (now: number) => {
            if (start === null) start = now;
            const t = Math.min(1, (now - start) / REVEAL_DURATION_MS);
            setRevealProgress(1 - Math.pow(1 - t, 3));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revealKey]);

    const columnX = columnFractionsFor(nodes.length).map((f) => f * width);
    const centerY = TOP_RESERVED + (height - TOP_RESERVED - BOTTOM_RESERVED) * 0.42;
    const mainAreaHeight = height - TOP_RESERVED - BOTTOM_RESERVED;

    const halfHeightFor = (value: number) => Math.max(MIN_HALF_HEIGHT, Math.pow(value / maxValue, DRAMA_EXPONENT) * (mainAreaHeight / 2));
    const mainHalf = nodes.map((n) => halfHeightFor(n.value));

    const mainPoints: Point[] = columnX.map((x, i) => ({ x, y0: centerY - mainHalf[i], y1: centerY + mainHalf[i] }));
    const glowPathFor = (scale: number) =>
        buildFlowPath(mainPoints.map((p) => ({ x: p.x, y0: centerY - (centerY - p.y0) * scale, y1: centerY + (p.y1 - centerY) * scale })));

    const dropoutBaseY = centerY + mainHalf[0] + DROPOUT_GAP;
    const dropoutHalfFor = (value: number) => (value === 0 ? 0 : Math.max(6, Math.min(DROPOUT_MAX_HALF, (value / maxValue) * (mainAreaHeight / 2))));

    const dropoutRibbons = DROPOUT_SOURCE.map((_, i) => i)
        .filter((i) => flow.dropouts[i] > 0)
        .map((i) => {
            const half = dropoutHalfFor(flow.dropouts[i]);
            const startX = columnX[i];
            const endX = startX + (columnX[i + 1] - startX) * DROPOUT_FADE_FRACTION;
            return {
                key: `dropout-${i}`,
                zoneIndex: i,
                from: DROPOUT_SOURCE[i],
                fromLabel: NODE_LABELS_BY_ID[DROPOUT_SOURCE[i]],
                count: flow.dropouts[i],
                breakdown: flow.dropoutBreakdown[i],
                path: buildFlowPath([
                    { x: startX, y0: dropoutBaseY - half, y1: dropoutBaseY + half },
                    { x: endX, y0: dropoutBaseY, y1: dropoutBaseY },
                ]),
                labelX: startX,
                labelY: dropoutBaseY + half,
            };
        });

    // Zone boundaries — the entire width is exactly one of these zones, so there's no dead space
    // between them (the bug in an earlier version: only narrow per-checkpoint hit-rects were
    // clickable, so most clicks on the visible ribbon did nothing).
    const zoneEdges = [0, ...columnX.slice(0, -1).map((_, i) => (columnX[i] + columnX[i + 1]) / 2), width];
    const mainZoneY0 = 0;
    const mainZoneY1 = dropoutBaseY - DROPOUT_GAP / 2;
    const dropoutZoneY1 = height;

    // Stage/health gradient stops — a junction below the weak threshold swaps the *next* stage's
    // stop to the warning color instead of its normal hue. First stop (Application) never swaps —
    // there's no transition before it to be weak about.
    const stopColorFor = (nodeIndex: number) => {
        if (nodeIndex === 0) return "var(--color-sf-application-hue)";
        const stageVar = ["", "offer", "payment", "completed"][nodeIndex];
        return flow.conversionPct[nodeIndex - 1] < WEAK_CONVERSION_THRESHOLD ? "var(--color-sf-weak)" : `var(--color-sf-${stageVar}-hue)`;
    };
    const gradientStopOffset = (x: number) => (x - columnX[0]) / (columnX[columnX.length - 1] - columnX[0]);

    const nodeTooltip = (i: number): TooltipContent => {
        const node = nodes[i];
        const lines = formatSubBands(node.subBands);
        if (i > 0) {
            const prevValue = nodes[i - 1].value;
            lines.push(`${flow.conversionPct[i - 1]}% of ${nodes[i - 1].label} (${node.value} of ${prevValue})`);
        }
        return { title: `${node.label} — ${node.value}`, lines, hint: `Click to view ${node.label} deals →` };
    };

    const dropoutTooltip = (r: (typeof dropoutRibbons)[number]): TooltipContent => ({
        title: `Dropped after ${r.fromLabel} — ${r.count}`,
        lines: formatSubBands(r.breakdown),
        hint: `Click to view these deals →`,
    });

    const showHover = (zone: string, content: TooltipContent, e: React.MouseEvent<SVGRectElement>) => {
        const x = Math.min(Math.max(e.clientX, TOOLTIP_HALF_WIDTH), window.innerWidth - TOOLTIP_HALF_WIDTH);
        const flip = e.clientY < TOOLTIP_FLIP_THRESHOLD;
        setHover({ zone, content, x, y: e.clientY, flip });
    };
    const moveHover = (zone: string, content: TooltipContent, e: React.MouseEvent<SVGRectElement>) => showHover(zone, content, e);
    const clearHover = () => setHover(null);

    const hoveredMainZone = hover?.zone.startsWith("main-") ? Number(hover.zone.split("-")[1]) : null;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block h-auto w-full min-w-160" role="img" aria-label="Sales funnel flow">
                <defs>
                    <filter id="sf-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="18" />
                    </filter>
                    <linearGradient id="sf-flow-gradient" gradientUnits="userSpaceOnUse" x1={columnX[0]} y1={centerY} x2={columnX[columnX.length - 1]} y2={centerY}>
                        {columnX.map((x, i) => (
                            <stop key={i} offset={gradientStopOffset(x)} stopColor={stopColorFor(i)} />
                        ))}
                    </linearGradient>
                    <linearGradient id="sf-dropout-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--color-fg-quaternary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-fg-quaternary)" stopOpacity={0} />
                    </linearGradient>
                    <clipPath id="sf-reveal-clip">
                        <rect x={0} y={0} width={width * revealProgress} height={height} />
                    </clipPath>
                    {hoveredMainZone !== null && (
                        <clipPath id="sf-zone-boost-clip">
                            <rect x={zoneEdges[hoveredMainZone]} y={0} width={zoneEdges[hoveredMainZone + 1] - zoneEdges[hoveredMainZone]} height={mainZoneY1} />
                        </clipPath>
                    )}
                </defs>

                <g clipPath="url(#sf-reveal-clip)">
                    {/* Soft ambient halo behind the flow — a blurred, oversized copy of the outermost layer. */}
                    <path d={buildFlowPath(mainPoints)} fill="var(--color-sf-glow)" opacity={0.22} filter="url(#sf-glow-blur)" />

                    {dropoutRibbons.map((r) => (
                        <path key={r.key} d={r.path} fill="url(#sf-dropout-gradient)" opacity={hover?.zone === r.key ? 1 : 0.85} />
                    ))}

                    {GLOW_DEPTHS.map((layer, i) => (
                        <path key={i} d={glowPathFor(layer.scale)} fill="url(#sf-flow-gradient)" opacity={layer.opacity} />
                    ))}

                    {/* Brighten just the hovered zone — a clipped, boosted-opacity duplicate of its own
                        layers. No dimming elsewhere, no wash over the rest of the ribbon. */}
                    {hoveredMainZone !== null && (
                        <g clipPath="url(#sf-zone-boost-clip)" style={{ pointerEvents: "none" }}>
                            {GLOW_DEPTHS.map((layer, i) => (
                                <path key={i} d={glowPathFor(layer.scale)} fill="url(#sf-flow-gradient)" opacity={Math.min(1, layer.opacity + 0.3)} />
                            ))}
                        </g>
                    )}
                </g>

                {/* Full-zone hit-areas for the main flow — the entire width is covered, no gaps. */}
                {nodeIds.map((id, i) => (
                    <rect
                        key={id}
                        x={zoneEdges[i]}
                        y={mainZoneY0}
                        width={zoneEdges[i + 1] - zoneEdges[i]}
                        height={mainZoneY1 - mainZoneY0}
                        fill="transparent"
                        className={onBandClick ? "cursor-pointer" : undefined}
                        onMouseEnter={(e) => showHover(`main-${i}`, nodeTooltip(i), e)}
                        onMouseMove={(e) => moveHover(`main-${i}`, nodeTooltip(i), e)}
                        onMouseLeave={clearHover}
                        onClick={onBandClick ? () => onBandClick(id, "main") : undefined}
                    />
                ))}

                {/* Dropout hit-areas, one per real transition. */}
                {dropoutRibbons.map((r) => (
                    <rect
                        key={r.key}
                        x={zoneEdges[r.zoneIndex]}
                        y={mainZoneY1}
                        width={zoneEdges[r.zoneIndex + 1] - zoneEdges[r.zoneIndex]}
                        height={dropoutZoneY1 - mainZoneY1}
                        fill="transparent"
                        className={onBandClick ? "cursor-pointer" : undefined}
                        onMouseEnter={(e) => showHover(r.key, dropoutTooltip(r), e)}
                        onMouseMove={(e) => moveHover(r.key, dropoutTooltip(r), e)}
                        onMouseLeave={clearHover}
                        onClick={onBandClick ? () => onBandClick(r.from, "dropout") : undefined}
                    />
                ))}

                {/* Node value pills, above the flow, with a guide line down to the ribbon. Application
                    gets the "hero" treatment (bigger, accent-filled) — it's the number meant to read as
                    the scale we started from. */}
                {nodeIds.map((id, i) => {
                    const isHero = i === 0;
                    const text = String(animatedNodeValues[i]);
                    const pillH = isHero ? PILL_HEIGHT_HERO : PILL_HEIGHT;
                    const w = pillWidth(text, isHero);
                    const pillBottomY = TOP_RESERVED - LABEL_GAP;
                    const pillY = pillBottomY - pillH;
                    return (
                        <g key={id} style={{ pointerEvents: "none" }}>
                            <line x1={columnX[i]} y1={pillBottomY} x2={columnX[i]} y2={centerY - mainHalf[i]} stroke="var(--color-border-secondary)" strokeWidth={1} />
                            <rect
                                x={columnX[i] - w / 2}
                                y={pillY}
                                width={w}
                                height={pillH}
                                rx={pillH / 2}
                                fill={isHero ? "var(--color-sf-application-hue)" : "var(--color-bg-primary-solid)"}
                            />
                            <text
                                x={columnX[i]}
                                y={pillY + pillH / 2 + (isHero ? 5 : 4)}
                                textAnchor="middle"
                                fontSize={isHero ? 18 : 12}
                                fontWeight={700}
                                fill={isHero ? "var(--color-text-white)" : "var(--color-text-primary_on-brand)"}
                            >
                                {text}
                            </text>
                            <text x={columnX[i]} y={pillY - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-text-secondary)">
                                {nodes[i].label}
                            </text>
                        </g>
                    );
                })}

                {/* Dropout pills, below the flow, one per real transition. */}
                {dropoutRibbons.map((r) => {
                    const text = String(animatedDropoutCounts[r.zoneIndex]);
                    const w = pillWidth(text);
                    const pillY = height - BOTTOM_RESERVED + LABEL_GAP - 6;
                    return (
                        <g key={r.key} style={{ pointerEvents: "none" }}>
                            <line x1={r.labelX} y1={r.labelY} x2={r.labelX} y2={pillY} stroke="var(--color-border-secondary)" strokeWidth={1} />
                            <rect x={r.labelX - w / 2} y={pillY} width={w} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} fill="var(--color-bg-secondary)" />
                            <text x={r.labelX} y={pillY + PILL_HEIGHT / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--color-text-secondary)">
                                {text}
                            </text>
                        </g>
                    );
                })}

                {/* Conversion % at each junction's midpoint, centered in the ribbon — also hoverable. */}
                {columnX.slice(0, -1).map((x, i) => (
                    <text
                        key={i}
                        x={(x + columnX[i + 1]) / 2}
                        y={centerY + 4}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={700}
                        fill="var(--color-text-white)"
                        opacity={0.9}
                        style={{ pointerEvents: "none" }}
                    >
                        {animatedConversionCounts[i]}%
                    </text>
                ))}
            </svg>

            {hover &&
                createPortal(
                    <div
                        className="pointer-events-none fixed z-50 flex w-max max-w-64 flex-col gap-0.5 rounded-lg bg-primary-solid px-3 py-2 shadow-lg"
                        style={{ left: hover.x, top: hover.y, transform: hover.flip ? "translate(-50%, 14px)" : "translate(-50%, calc(-100% - 14px))" }}
                    >
                        <p className="text-xs font-semibold text-white">{hover.content.title}</p>
                        {hover.content.lines.map((line, i) => (
                            <p key={i} className="text-xs text-tooltip-supporting-text">
                                {line}
                            </p>
                        ))}
                        {hover.content.hint && <p className="mt-1 text-xs font-medium text-tooltip-supporting-text">{hover.content.hint}</p>}
                    </div>,
                    document.body,
                )}
        </div>
    );
};
