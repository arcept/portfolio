import type { FunnelFlow, FunnelFlowNodeId } from "@/data/dashboard-metrics";

/**
 * Hand-rolled SVG Sankey ribbon — no d3-sankey/@nivo dependency. Neither library's automatic
 * layout cleanly fit two requirements this diagram actually needs: (1) a node can have
 * population with NO outgoing link at all (still-pending/still-accepted deals that haven't
 * resolved either way yet — a node's height must include that even though nothing flows out of
 * it), and (2) a hard minimum pixel floor per segment so a low-volume BDR view never collapses
 * to an invisible sliver. Both are a few lines of plain arithmetic here; fighting a layout
 * library into supporting them would've been more code, not less. Colors are fed as CSS
 * `var(--color-*)` strings straight into SVG props, same convention as booked-chart.tsx, so
 * dark/light theming is automatic — no JS color resolution.
 */

const NODE_THICKNESS = 16;
const MIN_NODE_HEIGHT = 28;
const MIN_SEGMENT_HEIGHT = 6;
const COLUMN_GAP_FRACTION = 0.34; // fraction of width between a node's right edge and the next node's left edge
// Reserved space above/below the node columns for the label and count text — without this, the
// largest node (Application, which the whole diagram scales against) fills close to the full
// height and its own label/count get clipped by the SVG's own edges.
const LABEL_PADDING = 30;

type SegmentRole = "remainder" | "forward" | "dropout";
type Segment = { key: string; label: string; count: number; y0: number; y1: number; role: SegmentRole; fill: string };
type LayoutNode = { id: FunnelFlowNodeId; label: string; value: number; x: number; y0: number; y1: number; segments: Segment[] };
type Ribbon = { key: string; kind: "forward" | "dropout"; from: FunnelFlowNodeId; sourceX: number; sourceY0: number; sourceY1: number; targetX: number; targetY0: number; targetY1: number };

const REMAINDER_FILLS: Record<string, string> = {
    pending: "var(--color-utility-orange-300)",
    filled: "var(--color-utility-amber-500)",
    withdrawn: "var(--color-utility-orange-400)",
    accepted: "var(--color-utility-amber-500)",
};
// Ongoing (still live) gets the warm palette; Completed gets the fullest saturation ("arrived");
// Cancelled/Went-Cold are negative outcomes after the fact, so they read as the same muted gray
// as the dropout band rather than the live orange/amber path, even though they never left the
// Payment node.
const PAYMENT_FILLS: Record<string, string> = {
    ongoing: "var(--color-utility-amber-500)",
    completed: "var(--color-utility-orange-600)",
    cancelled: "var(--color-fg-quaternary)",
    "went-cold": "var(--color-fg-quaternary)",
};

function layoutColumn(id: FunnelFlowNodeId, label: string, value: number, maxValue: number, totalHeight: number, remainderKeys: [string, number][], forward: number, dropout: number): LayoutNode {
    const columnHeight = totalHeight - LABEL_PADDING * 2;
    const pxPerUnit = maxValue === 0 ? 0 : columnHeight / maxValue;
    const rawHeight = value * pxPerUnit;
    const height = Math.max(MIN_NODE_HEIGHT, rawHeight);
    const y0 = LABEL_PADDING + (columnHeight - height) / 2;

    const order: { key: string; label: string; count: number; role: SegmentRole; fill: string }[] = [
        ...remainderKeys.map(([key, count]) => ({ key, label: key, count, role: "remainder" as const, fill: REMAINDER_FILLS[key] ?? "var(--color-utility-amber-500)" })),
        ...(forward > 0 || id !== "payment" ? [{ key: "forward", label: "Continuing", count: forward, role: "forward" as const, fill: "var(--color-utility-orange-600)" }] : []),
        ...(dropout > 0 || id !== "payment" ? [{ key: "dropout", label: "Dropped", count: dropout, role: "dropout" as const, fill: "var(--color-fg-quaternary)" }] : []),
    ].filter((s) => id === "payment" || s.count > 0 || s.role !== "remainder");

    let cursor = y0;
    const totalCount = order.reduce((sum, s) => sum + s.count, 0) || 1;
    const segments: Segment[] = order.map((s) => {
        const segHeight = Math.max(s.count > 0 ? MIN_SEGMENT_HEIGHT : 0, (s.count / totalCount) * height);
        const seg: Segment = { key: s.key, label: s.label, count: s.count, y0: cursor, y1: cursor + segHeight, role: s.role, fill: s.fill };
        cursor += segHeight;
        return seg;
    });

    return { id, label, value, x: 0, y0, y1: cursor, segments };
}

export function computeSalesFunnelLayout(flow: FunnelFlow, width: number, height: number) {
    const [application, offer, payment] = flow.nodes;
    const maxValue = Math.max(application.value, 1);

    const columnX = [width * 0.06, width * 0.5, width * (1 - 0.06) - NODE_THICKNESS];

    const applicationSubBands = application.subBands.filter((b) => b.key !== "forward");
    const offerSubBands = offer.subBands.filter((b) => b.key !== "forward");

    const nodes: LayoutNode[] = [
        {
            ...layoutColumn(
                "application",
                application.label,
                application.value,
                maxValue,
                height,
                applicationSubBands.map((b) => [b.key, b.count]),
                offer.value,
                flow.dropouts[0],
            ),
            x: columnX[0],
        },
        {
            ...layoutColumn("offer", offer.label, offer.value, maxValue, height, offerSubBands.map((b) => [b.key, b.count]), payment.value, flow.dropouts[1]),
            x: columnX[1],
        },
        {
            ...layoutColumn(
                "payment",
                payment.label,
                payment.value,
                maxValue,
                height,
                payment.subBands.map((b) => [b.key, b.count]),
                0,
                0,
            ),
            x: columnX[2],
        },
    ];
    // Payment's sub-bands use their own fill map (ongoing/completed/cancelled/went-cold), not
    // the remainder palette every other node's leftover segments use.
    nodes[2].segments = nodes[2].segments.map((s) => ({ ...s, fill: PAYMENT_FILLS[s.key] ?? s.fill }));

    const [applicationNode, offerNode, paymentNode] = nodes;
    const ribbonTargetInset = (columnX[1] - columnX[0]) * COLUMN_GAP_FRACTION;

    const forwardSeg = (n: LayoutNode) => n.segments.find((s) => s.role === "forward");
    const dropoutSeg = (n: LayoutNode) => n.segments.find((s) => s.role === "dropout");

    const ribbons: Ribbon[] = [];
    const appForward = forwardSeg(applicationNode);
    if (appForward) {
        ribbons.push({
            key: "app-offer",
            kind: "forward",
            from: "application",
            sourceX: applicationNode.x + NODE_THICKNESS,
            sourceY0: appForward.y0,
            sourceY1: appForward.y1,
            targetX: offerNode.x,
            targetY0: offerNode.y0,
            targetY1: offerNode.y1,
        });
    }
    const appDropout = dropoutSeg(applicationNode);
    if (appDropout && appDropout.count > 0) {
        ribbons.push({
            key: "app-dropout",
            kind: "dropout",
            from: "application",
            sourceX: applicationNode.x + NODE_THICKNESS,
            sourceY0: appDropout.y0,
            sourceY1: appDropout.y1,
            targetX: applicationNode.x + NODE_THICKNESS + ribbonTargetInset * 2.4,
            targetY0: appDropout.y0,
            targetY1: appDropout.y1,
        });
    }
    const offerForward = forwardSeg(offerNode);
    if (offerForward) {
        ribbons.push({
            key: "offer-payment",
            kind: "forward",
            from: "offer",
            sourceX: offerNode.x + NODE_THICKNESS,
            sourceY0: offerForward.y0,
            sourceY1: offerForward.y1,
            targetX: paymentNode.x,
            targetY0: paymentNode.y0,
            targetY1: paymentNode.y1,
        });
    }
    const offerDropout = dropoutSeg(offerNode);
    if (offerDropout && offerDropout.count > 0) {
        ribbons.push({
            key: "offer-dropout",
            kind: "dropout",
            from: "offer",
            sourceX: offerNode.x + NODE_THICKNESS,
            sourceY0: offerDropout.y0,
            sourceY1: offerDropout.y1,
            targetX: offerNode.x + NODE_THICKNESS + ribbonTargetInset * 2.4,
            targetY0: offerDropout.y0,
            targetY1: offerDropout.y1,
        });
    }

    return { nodes, ribbons, columnX };
}

/** Closed, tapering ribbon path — two cubic beziers (top edge, bottom edge) meeting at the
 * source and target ends, control points at the horizontal midpoint. The standard technique
 * for an organic Sankey ribbon (plain cubic bezier math, no library needed). */
function ribbonPath(r: Ribbon): string {
    const midX = (r.sourceX + r.targetX) / 2;
    return [
        `M ${r.sourceX} ${r.sourceY0}`,
        `C ${midX} ${r.sourceY0}, ${midX} ${r.targetY0}, ${r.targetX} ${r.targetY0}`,
        `L ${r.targetX} ${r.targetY1}`,
        `C ${midX} ${r.targetY1}, ${midX} ${r.sourceY1}, ${r.sourceX} ${r.sourceY1}`,
        "Z",
    ].join(" ");
}

export type SalesFunnelRibbonProps = {
    flow: FunnelFlow;
    width: number;
    height: number;
    onBandClick?: (nodeId: FunnelFlowNodeId, segmentKey: string) => void;
};

export const SalesFunnelRibbon = ({ flow, width, height, onBandClick }: SalesFunnelRibbonProps) => {
    const { nodes, ribbons, columnX } = computeSalesFunnelLayout(flow, width, height);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="h-auto w-full min-w-160" role="img" aria-label="Sales funnel flow">
            <defs>
                <linearGradient id="sf-forward-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-utility-amber-500)" />
                    <stop offset="100%" stopColor="var(--color-utility-orange-600)" />
                </linearGradient>
                <linearGradient id="sf-dropout-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-fg-quaternary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-fg-quaternary)" stopOpacity={0} />
                </linearGradient>
            </defs>

            {ribbons.map((r) => (
                <path key={r.key} d={ribbonPath(r)} fill={r.kind === "forward" ? "url(#sf-forward-gradient)" : "url(#sf-dropout-gradient)"} opacity={r.kind === "forward" ? 0.85 : 1} />
            ))}

            {nodes.map((node) => (
                <g key={node.id}>
                    {node.segments.map((seg) => (
                        <rect
                            key={seg.key}
                            x={node.x}
                            y={seg.y0}
                            width={NODE_THICKNESS}
                            height={Math.max(0, seg.y1 - seg.y0)}
                            fill={seg.fill}
                            rx={2}
                            className={onBandClick ? "cursor-pointer" : undefined}
                            onClick={onBandClick ? () => onBandClick(node.id, seg.key) : undefined}
                        >
                            <title>
                                {seg.label}: {seg.count}
                            </title>
                        </rect>
                    ))}
                    <text x={node.x + NODE_THICKNESS / 2} y={node.y0 - 10} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-text-primary)">
                        {node.label}
                    </text>
                    <text x={node.x + NODE_THICKNESS / 2} y={node.y1 + 16} textAnchor="middle" fontSize={11} fill="var(--color-text-tertiary)">
                        {node.value}
                    </text>
                </g>
            ))}

            {[
                { x: (columnX[0] + columnX[1]) / 2, pct: flow.conversionPct[0] },
                { x: (columnX[1] + columnX[2]) / 2, pct: flow.conversionPct[1] },
            ].map((junction, i) => (
                <text key={i} x={junction.x} y={height / 2} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-text-secondary)">
                    {junction.pct}%
                </text>
            ))}
        </svg>
    );
};
