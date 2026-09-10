import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { FunnelFlow, FunnelFlowNodeId, FunnelFlowSubBand } from "@/data/dashboard-metrics";
import { useCountUp } from "@/hooks/use-count-up";

/**
 * Hand-rolled SVG "glowing stream" ribbon, styled after Manik's reference and geometry spec
 * (2026-09-10, Figma node 548:16020 + Manik's own explanation of the underlying logic). No
 * d3-sankey/@nivo dependency — the shape is plain arithmetic, not a layout problem a Sankey
 * library solves for us.
 *
 * Shape (`buildStagedRibbonPath`/`stageSegmentsFor`): every edge is a STRAIGHT line (rounded at
 * interior vertices only, see `RIBBON_CORNER_RADIUS`), not a smooth bezier curve throughout —
 * confirmed against Figma's own exported path data, which is a plain polyline. Each checkpoint
 * is a flat rectangular "block" sized to that stage's own value (`halfHeightFor`), and
 * consecutive blocks are joined by a diagonal taper — the taper's *shape* is what visually reads
 * as "this many deals were lost between these two stages", per Manik's own description of the
 * logic. All 4 blocks render at the SAME width (`BLOCK_WIDTH_FRACTION`); taper widths are NOT
 * forced equal (an edge stage's flush-against-the-SVG-edge block only draws from one gap, a
 * middle stage's from two, so equalizing block width necessarily leaves the edge tapers shorter
 * than the one between two middle stages). This is a from-scratch derived formula (not a
 * reverse-engineering of Figma's own hand-placed pixel values, which turned out asymmetric per
 * stage with no single consistent ratio) — it satisfies the same visual rules Manik described,
 * consistently and legibly for any data.
 *
 * Depth (`GLOW_DEPTHS`): only the innermost layer is real "signal" — the outer 3 are purely
 * decorative glow duplicates of the same shape, scaled up around `centerY`. Manik's explicit
 * ask: the core (real) ribbon should read as roughly half the combined stack's height, so scale
 * runs 1 → 0.5 linearly across the 4 layers (previously 1 → 0.22, which made the "real" ribbon
 * look like a thin sliver inside a much bigger glow).
 *
 * The 4 nested depth layers' fill AND opacity are theme-conditional (Manik's call, 2026-09-10):
 * dark mode uses 3 fixed left-to-right gradients at a solid opacity curve (Manik's exact Figma
 * stops — core reads bright mint→cyan→blue→violet, the two outer layers share one deep
 * indigo/violet halo tone), while light mode falls back to the original dynamic, stage-tinted
 * orange gradient (one hue per checkpoint, `stopColorFor`, all 4 layers sharing it, weak-
 * conversion-swaps-to-red intact) at a softer transparency falloff. Which gradient/opacity each
 * layer actually paints is picked in CSS, not JS — each layer reads `var(--sf-depth-N-fill)` and
 * `var(--sf-depth-N-opacity)`, and `.dark-mode` in theme.css repoints those 8 slots.
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
 * All four main-flow pills share one size (Figma node 548:15999) — only the last one, Completed,
 * gets a solid accent (success) fill; Application/Offer/Payment stay on the same neutral dark
 * pill, so nothing before the finish line reads as more "special" than the rest of the funnel.
 * The whole flow also draws in left-to-right (a clip-path wipe) and every displayed number counts
 * up, on mount and whenever the underlying data changes.
 *
 * Colors come from `--color-sales-funnel-*` (theme.css) fed straight into SVG props as
 * `var(...)` strings — same convention as booked-chart.tsx — so light/dark theming (including
 * the dark-mode-only multi-hue swap) is automatic, zero JS color logic.
 */

const MIN_HALF_HEIGHT = 10;
const LABEL_GAP = 10;
const PILL_HEIGHT = 26; // dropout pills only
const MAIN_PILL_HEIGHT = 36; // every main-flow node pill (Application/Offer/Payment/Completed)
// Trimmed as tight as the pill + a short guide-line will read (Manik's call, 2026-09-10 — no
// more label above the pill to make room for, that moved onto the ribbon itself) — a separate,
// smaller gap from LABEL_GAP (which still sizes the bottom/dropout area, left alone here).
const PILL_GUIDE_GAP = 6;
// Pulls the pills 24px closer to the ribbon (Manik's call, 2026-09-10) by reclaiming that much
// of their reserved band for the ribbon's own height instead — the pill itself still renders in
// full (see the clamp on `pillY` below), so at this offset it now sits slightly over the
// ribbon's top edge rather than floating clear above it on a full-length guide-line.
const PILL_LOWER_OFFSET = 12;
const TOP_RESERVED = MAIN_PILL_HEIGHT + PILL_GUIDE_GAP - PILL_LOWER_OFFSET;
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
// warning color instead of its normal stage hue — light-mode-only (see `stopColorFor`). Starting
// default; tune once real data volumes are in front of us, same spirit as SANKEY_MIN_COHORT_SIZE
// in the parent section.
const WEAK_CONVERSION_THRESHOLD = 45;

// Outer (widest) to core (narrowest, brightest) — painted in this order so each layer sits on
// top of the wider one behind it. Both fill AND opacity come from theme.css's `--sf-depth-N-*`
// slots (N = array index) — light mode points all 4 at the one shared dynamic gradient with a
// soft transparency falloff, dark mode repoints them at 3 fixed gradients with a more solid
// opacity curve (outer/mid-outer share the halo gradient). Zero JS color/opacity logic.
const GLOW_DEPTHS = [{ scale: 1 }, { scale: 0.8333 }, { scale: 0.6667 }, { scale: 0.5 }];

// The visual gap between the Application node's near-max width and every later node's true
// proportional width is exaggerated (exponent > 1 on the value ratio) so the taper reads
// dramatically rather than strictly-to-scale — Application itself is unaffected (ratio 1 stays 1).
const DRAMA_EXPONENT = 1.4;

// Checkpoint x-positions — evenly spaced between x=0 and a right margin, generalized so
// adding/removing a stage doesn't require re-deriving these by hand. The left side has NO
// margin (column 0 sits exactly at x=0) so the ribbon's leading edge lines up flush with the
// card's heading/content edge above it (Manik's screenshot) — the Application pill/label render
// left-anchored off that same x instead of centered on it, so nothing needs negative-x space and
// nothing clips against the SVG's own viewBox.
const RIGHT_COLUMN_MARGIN_FRACTION = 0.06;
function columnXFor(count: number, width: number): number[] {
    if (count === 1) return [width / 2];
    const span = width - RIGHT_COLUMN_MARGIN_FRACTION * width;
    return Array.from({ length: count }, (_, i) => (span * i) / (count - 1));
}

const NODE_LABELS_BY_ID: Record<FunnelFlowNodeId, string> = { application: "Application", offer: "Offer", payment: "Payment", completed: "Completed" };
const DROPOUT_SOURCE: FunnelFlowNodeId[] = ["application", "offer", "payment"];

// Every stage's flat block is the SAME width, AND every taper between two blocks is ALSO the
// same width as every other taper — just not necessarily the same width as a block (Manik's
// call, 2026-09-10, in two steps: first equalize block widths, then separately equalize taper
// widths — the two are independent knobs, not tied to each other). Laid out sequentially,
// flush left/right against the SVG's own edges: N·blockWidth + (N-1)·taperWidth = width has one
// equation and two unknowns, so TAPER_TO_BLOCK_RATIO (taperWidth / blockWidth) is the second,
// chosen constraint — lower = shorter, more "exaggerated" tapers relative to the blocks.
//
// This is computed independently of `columnX` (which still positions pills/guide-lines/
// gradients/hit-zones) — the two no longer share a coordinate scheme, since equal blocks +
// equal tapers + flush edges is incompatible with also centering every block on an evenly-spaced
// checkpoint (verified: every `columnX[i]` still lands inside its block's flat region, never in
// a taper, just not exactly at that block's centerpoint anymore).
const TAPER_TO_BLOCK_RATIO = 0.45; // Manik's call, 2026-09-10: another ~50% wider than 0.3

type StageSegment = { xLeft: number; xRight: number; half: number };

/** One flat block per checkpoint (`xLeft`..`xRight`, both at the same height), all the same
 * width, joined by equal-width tapers — see the constant comment above for the layout math.
 * `half` is the checkpoint's own half-height (pre-depth-scale); callers multiply it by a
 * `GLOW_DEPTHS` scale to get an actual y0/y1. */
function stageSegmentsFor(count: number, halves: number[], width: number): StageSegment[] {
    const blockWidth = width / (count + (count - 1) * TAPER_TO_BLOCK_RATIO);
    const stride = blockWidth + TAPER_TO_BLOCK_RATIO * blockWidth;
    return Array.from({ length: count }, (_, i) => {
        const xLeft = i * stride;
        return { xLeft, xRight: xLeft + blockWidth, half: halves[i] };
    });
}

// Small fillet radius (px, in the ribbon's own 0..width coordinate space) applied to every
// interior flat-block ↔ taper vertex — Manik's call, 2026-09-10: those bends read too sharp as
// pure angles. The shape's 4 real outer corners (the flush left/right edges) are deliberately
// excluded, staying crisp.
const RIBBON_CORNER_RADIUS = 8;

/** Walks a closed polygon through `points`, drawing a straight `L` to every vertex in
 * `sharpIndices` and a small quadratic-bezier fillet (pulled back `radius` px along each
 * adjacent edge, clamped to half that edge's own length so short segments can't overshoot past
 * their neighbor) through every other vertex. */
function roundedClosedPolygonPath(points: { x: number; y: number }[], radius: number, sharpIndices: Set<number>): string {
    const n = points.length;
    const d = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 1; i < n; i++) {
        const cur = points[i];
        if (sharpIndices.has(i)) {
            d.push(`L ${cur.x} ${cur.y}`);
            continue;
        }
        const prev = points[i - 1];
        const next = points[(i + 1) % n];
        const distIn = Math.hypot(cur.x - prev.x, cur.y - prev.y);
        const distOut = Math.hypot(next.x - cur.x, next.y - cur.y);
        if (distIn === 0 || distOut === 0) {
            d.push(`L ${cur.x} ${cur.y}`);
            continue;
        }
        const r = Math.min(radius, distIn / 2, distOut / 2);
        const inX = cur.x - ((cur.x - prev.x) / distIn) * r;
        const inY = cur.y - ((cur.y - prev.y) / distIn) * r;
        const outX = cur.x + ((next.x - cur.x) / distOut) * r;
        const outY = cur.y + ((next.y - cur.y) / distOut) * r;
        d.push(`L ${inX} ${inY}`, `Q ${cur.x} ${cur.y}, ${outX} ${outY}`);
    }
    d.push("Z");
    return d.join(" ");
}

/** Flat-block-per-stage, straight-diagonal-taper-between-stages ribbon (see the header comment
 * and `stageSegmentsFor`) — matches Figma's own exported path data (its "C" command turned out
 * to be a degenerate straight line — same start/end y — everywhere it appeared), with a small
 * fillet at every interior bend (`roundedClosedPolygonPath`). Top edge left-to-right through
 * each segment's (xLeft, xRight) at y0, bottom edge right-to-left through the same at y1. */
function buildStagedRibbonPath(segments: StageSegment[], centerY: number, scale: number): string {
    const top = segments.flatMap((s) => [
        { x: s.xLeft, y: centerY - s.half * scale },
        { x: s.xRight, y: centerY - s.half * scale },
    ]);
    const bottom = [...segments]
        .reverse()
        .flatMap((s) => [
            { x: s.xRight, y: centerY + s.half * scale },
            { x: s.xLeft, y: centerY + s.half * scale },
        ]);
    const points = [...top, ...bottom];
    // The 4 real outer corners — top-left/top-right of the top edge, bottom-right/bottom-left of
    // the bottom edge (which is built right-to-left) — are the shape's flush left/right edges.
    const sharpIndices = new Set([0, top.length - 1, top.length, points.length - 1]);
    return roundedClosedPolygonPath(points, RIBBON_CORNER_RADIUS, sharpIndices);
}

type Point = { x: number; y0: number; y1: number };

/** One continuous closed path across N checkpoints — top edge left-to-right, bottom edge
 * right-to-left, cubic beziers between consecutive checkpoints (control points at the
 * horizontal midpoint). Used only for the dropout "drip" ribbons below (a simple 2-point taper
 * to a vanishing point reads fine as a smooth curve) — the main flow uses the straight-edged
 * `buildStagedRibbonPath` above instead. */
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

const pillWidth = (text: string, large = false) => (large ? Math.max(52, 26 + text.length * 13) : Math.max(34, 18 + text.length * 9));

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

    const columnX = columnXFor(nodes.length, width);
    const centerY = TOP_RESERVED + (height - TOP_RESERVED - BOTTOM_RESERVED) * 0.42;
    const mainAreaHeight = height - TOP_RESERVED - BOTTOM_RESERVED;

    // Background bloom (Figma node 548:16742) — position/size as fractions of the full ribbon
    // box, carried over from Figma's fixed 698×264.82 frame (ellipse center (252, 101), rx 83,
    // ry 39) so it scales with the ribbon instead of being pinned to Figma's literal pixels.
    const bgGlowCx = width * 0.361;
    const bgGlowCy = height * 0.381;
    const bgGlowRx = width * 0.119;
    const bgGlowRy = height * 0.147;
    const bgGlowBlur = Math.max(bgGlowRx, bgGlowRy) * 0.6;

    const halfHeightFor = (value: number) => Math.max(MIN_HALF_HEIGHT, Math.pow(value / maxValue, DRAMA_EXPONENT) * (mainAreaHeight / 2));
    const mainHalf = nodes.map((n) => halfHeightFor(n.value));

    const mainSegments = stageSegmentsFor(columnX.length, mainHalf, width);
    const glowPathFor = (scale: number) => buildStagedRibbonPath(mainSegments, centerY, scale);
    // Pills and segment titles anchor to each block's own true horizontal center (Figma node
    // 548:15999) — NOT `columnX`, which only ever positioned guide-lines/gradients/hit-zones and
    // has drifted from each block's actual center since blocks/tapers were equalized.
    const blockCenterX = mainSegments.map((s) => (s.xLeft + s.xRight) / 2);

    // Every layer except the core (the real, innermost ribbon) fades out across the Completed
    // block itself — fully opaque at its left edge, fully gone by its horizontal midpoint — so
    // by the end of the flow only the core ribbon is left on screen, per Manik's spec.
    const completedSegment = mainSegments[mainSegments.length - 1];
    const decorativeFadeStartX = completedSegment.xLeft;
    const decorativeFadeEndX = (completedSegment.xLeft + completedSegment.xRight) / 2;

    const dropoutBaseY = centerY + mainHalf[0] + DROPOUT_GAP;
    const dropoutHalfFor = (value: number) => (value === 0 ? 0 : Math.max(6, Math.min(DROPOUT_MAX_HALF, (value / maxValue) * (mainAreaHeight / 2))));

    const dropoutRibbons = DROPOUT_SOURCE.map((_, i) => i)
        .filter((i) => flow.dropouts[i] > 0)
        .map((i) => {
            const half = dropoutHalfFor(flow.dropouts[i]);
            // Drip shape stays anchored on `columnX` (its original position, unchanged) — only
            // the pill/label below moves to `blockCenterX`, per Manik's call: the shape behind
            // wasn't meant to move, just the pill box sitting below it.
            const startX = columnX[i];
            const endX = startX + (columnX[i + 1] - startX) * DROPOUT_FADE_FRACTION;
            // The drip tapers from `half` at startX to 0 at endX — the guide line has to reach
            // whatever the shape's ACTUAL edge is at the pill's new x (blockCenterX), not the
            // wide end's half, or it dangles past where the shape has already narrowed/vanished.
            const halfAtLabelX =
                blockCenterX[i] <= startX ? half : blockCenterX[i] >= endX ? 0 : half * (1 - (blockCenterX[i] - startX) / (endX - startX));
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
                labelX: blockCenterX[i],
                labelY: dropoutBaseY + halfAtLabelX,
            };
        });

    // Zone boundaries — the entire width is exactly one of these zones, so there's no dead space
    // between them (the bug in an earlier version: only narrow per-checkpoint hit-rects were
    // clickable, so most clicks on the visible ribbon did nothing).
    const zoneEdges = [0, ...columnX.slice(0, -1).map((_, i) => (columnX[i] + columnX[i + 1]) / 2), width];
    const mainZoneY0 = 0;
    const mainZoneY1 = dropoutBaseY - DROPOUT_GAP / 2;
    const dropoutZoneY1 = height;

    // Light-mode fallback gradient stops — a junction below the weak threshold swaps the *next*
    // stage's stop to the warning color instead of its normal hue. First stop (Application) never
    // swaps — there's no transition before it to be weak about. Unused in dark mode (its 3 fixed
    // gradients don't reference this), but always rendered — an unreferenced SVG def costs nothing.
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
            <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block h-full w-full min-w-160" role="img" aria-label="Sales funnel flow">
                <defs>
                    <filter id="sf-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="18" />
                    </filter>
                    <filter id="sf-bg-glow-blur" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation={bgGlowBlur} />
                    </filter>
                    <linearGradient id="sf-layer-core" gradientUnits="userSpaceOnUse" x1={columnX[0]} y1={centerY} x2={columnX[columnX.length - 1]} y2={centerY}>
                        <stop offset="0%" stopColor="#70F9AF" />
                        <stop offset="50%" stopColor="#00D3F3" />
                        <stop offset="78.47%" stopColor="#2B7FFF" />
                        <stop offset="99.58%" stopColor="#835FFC" />
                    </linearGradient>
                    <linearGradient id="sf-layer-mid" gradientUnits="userSpaceOnUse" x1={columnX[0]} y1={centerY} x2={columnX[columnX.length - 1]} y2={centerY}>
                        <stop offset="0%" stopColor="#3F55B6" />
                        <stop offset="50%" stopColor="#3562D0" />
                        <stop offset="100%" stopColor="#3760CD" />
                    </linearGradient>
                    <linearGradient id="sf-layer-halo" gradientUnits="userSpaceOnUse" x1={columnX[0]} y1={centerY} x2={columnX[columnX.length - 1]} y2={centerY}>
                        <stop offset="0%" stopColor="#3D2373" />
                        <stop offset="50%" stopColor="#3140A3" />
                        <stop offset="100%" stopColor="#3141A4" />
                    </linearGradient>
                    <linearGradient id="sf-flow-gradient-light" gradientUnits="userSpaceOnUse" x1={columnX[0]} y1={centerY} x2={columnX[columnX.length - 1]} y2={centerY}>
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
                    {/* White (opaque) up to the Completed block's left edge, fading to black
                        (transparent) by its midpoint, pad-extended flat on both sides — masks
                        every decorative layer so only the core ribbon survives to the end. */}
                    <linearGradient id="sf-completed-fade-gradient" gradientUnits="userSpaceOnUse" x1={decorativeFadeStartX} y1={0} x2={decorativeFadeEndX} y2={0}>
                        <stop offset="0" stopColor="white" />
                        <stop offset="1" stopColor="black" />
                    </linearGradient>
                    <mask id="sf-completed-fade-mask">
                        <rect x={0} y={0} width={width} height={height} fill="url(#sf-completed-fade-gradient)" />
                    </mask>
                </defs>

                <g clipPath="url(#sf-reveal-clip)">
                    {/* Background bloom (Figma node 548:16742) — sits behind absolutely everything else;
                        the ribbon layers drawn on top of it fully cover its center, so only the soft blurred
                        glow peeking out past the ribbon's own edges ends up visible. */}
                    <ellipse
                        cx={bgGlowCx}
                        cy={bgGlowCy}
                        rx={bgGlowRx}
                        ry={bgGlowRy}
                        style={{ fill: "var(--sf-bg-glow-fill)", opacity: "var(--sf-bg-glow-opacity)" }}
                        filter="url(#sf-bg-glow-blur)"
                    />

                    {/* Soft ambient halo behind the flow — a blurred, oversized copy of the outermost layer.
                        It's decorative, not the core ribbon, so it fades out across Completed too. */}
                    <path d={glowPathFor(1)} fill="var(--color-sf-glow)" opacity={0.22} filter="url(#sf-glow-blur)" mask="url(#sf-completed-fade-mask)" />

                    {dropoutRibbons.map((r) => (
                        <path key={r.key} d={r.path} fill="url(#sf-dropout-gradient)" opacity={hover?.zone === r.key ? 1 : 0.85} />
                    ))}

                    {/* Only the LAST (core, i.e. real-data) layer skips the fade mask — every
                        decorative layer in front of it thins out across the Completed block so
                        the ribbon ends as just the core by the block's midpoint. */}
                    {GLOW_DEPTHS.map((layer, i) => (
                        <path
                            key={i}
                            d={glowPathFor(layer.scale)}
                            style={{ fill: `var(--sf-depth-${i}-fill)`, opacity: `var(--sf-depth-${i}-opacity)` }}
                            mask={i < GLOW_DEPTHS.length - 1 ? "url(#sf-completed-fade-mask)" : undefined}
                        />
                    ))}

                    {/* Brighten just the hovered zone — a clipped, boosted-opacity duplicate of its own
                        layers. No dimming elsewhere, no wash over the rest of the ribbon. */}
                    {hoveredMainZone !== null && (
                        <g clipPath="url(#sf-zone-boost-clip)" style={{ pointerEvents: "none" }}>
                            {GLOW_DEPTHS.map((layer, i) => (
                                <path
                                    key={i}
                                    d={glowPathFor(layer.scale)}
                                    style={{ fill: `var(--sf-depth-${i}-fill)`, opacity: `calc(var(--sf-depth-${i}-opacity) + 0.3)` }}
                                    mask={i < GLOW_DEPTHS.length - 1 ? "url(#sf-completed-fade-mask)" : undefined}
                                />
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

                {/* Node value pills, above the flow, with a guide line down into the ribbon —
                    centered on their block (`blockCenterX`), not `columnX`, per Manik's Figma
                    reference. Every pill shares one size — only Completed (the last node) gets
                    the solid accent fill. */}
                {nodeIds.map((id, i) => {
                    const isAccent = i === nodeIds.length - 1;
                    const text = String(animatedNodeValues[i]);
                    const pillH = MAIN_PILL_HEIGHT;
                    const w = pillWidth(text, true);
                    // Clamped at 0 — TOP_RESERVED is deliberately smaller than the pill's own
                    // height now (see PILL_LOWER_OFFSET), so the "ideal" backward-computed
                    // position would clip off the top of the SVG; the pill renders in full at
                    // y=0 instead, ending up sitting slightly over the ribbon's top edge.
                    const pillY = Math.max(0, TOP_RESERVED - PILL_GUIDE_GAP - pillH);
                    const pillBottomY = pillY + pillH;
                    const x = blockCenterX[i];
                    return (
                        <g key={id} style={{ pointerEvents: "none" }}>
                            <line x1={x} y1={pillBottomY} x2={x} y2={centerY - mainHalf[i]} stroke="var(--color-border-secondary)" strokeWidth={1} />
                            <rect
                                x={x - w / 2}
                                y={pillY}
                                width={w}
                                height={pillH}
                                rx={pillH / 2}
                                fill={isAccent ? "var(--color-fg-success-primary)" : "var(--color-bg-primary-solid)"}
                            />
                            <text
                                x={x}
                                y={pillY + pillH / 2 + 5}
                                textAnchor="middle"
                                fontSize={18}
                                fontWeight={700}
                                fontFamily="var(--font-mono)"
                                fill={isAccent ? "var(--color-text-white)" : "var(--color-text-primary_on-brand)"}
                            >
                                {text}
                            </text>
                        </g>
                    );
                })}

                {/* Segment titles, inside the ribbon itself at its vertical center — centered on
                    their own block, same as the pills above (Figma node 548:15999: the stage
                    name reads directly on the flow, not stacked with the pill). */}
                {nodeIds.map((id, i) => (
                    <text
                        key={id}
                        x={blockCenterX[i]}
                        y={centerY + 5}
                        textAnchor="middle"
                        fontSize={14}
                        fontWeight={600}
                        fill="var(--color-text-white)"
                        opacity={0.95}
                        style={{ pointerEvents: "none" }}
                    >
                        {nodes[i].label}
                    </text>
                ))}

                {/* Dropout pills, below the flow, one per real transition. */}
                {dropoutRibbons.map((r) => {
                    const text = String(animatedDropoutCounts[r.zoneIndex]);
                    const w = pillWidth(text);
                    const pillY = height - BOTTOM_RESERVED + LABEL_GAP - 6;
                    return (
                        <g key={r.key} style={{ pointerEvents: "none" }}>
                            <line x1={r.labelX} y1={r.labelY} x2={r.labelX} y2={pillY} stroke="var(--color-border-secondary)" strokeWidth={1} />
                            <rect x={r.labelX - w / 2} y={pillY} width={w} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} fill="var(--color-bg-secondary)" />
                            <text
                                x={r.labelX}
                                y={pillY + PILL_HEIGHT / 2 + 4}
                                textAnchor="middle"
                                fontSize={12}
                                fontWeight={700}
                                fontFamily="var(--font-mono)"
                                fill="var(--color-text-secondary)"
                            >
                                {text}
                            </text>
                        </g>
                    );
                })}

                {/* Conversion % centered in the TAPER itself (not the checkpoint gap's midpoint —
                    those no longer coincide now that block widths are equalized rather than the
                    taper always sitting exactly in the middle of its gap) — also hoverable. */}
                {columnX.slice(0, -1).map((_, i) => (
                    <text
                        key={i}
                        x={(mainSegments[i].xRight + mainSegments[i + 1].xLeft) / 2}
                        y={centerY + 4}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={700}
                        fontFamily="var(--font-mono)"
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
