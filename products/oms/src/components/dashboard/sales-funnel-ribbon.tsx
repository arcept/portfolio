import type { FunnelFlow, FunnelFlowNodeId } from "@/data/dashboard-metrics";

/**
 * Hand-rolled SVG "glowing stream" ribbon, styled after Manik's reference (a continuous,
 * tapering multi-layer glow — no hard node boxes, floating pill labels with guide lines, a soft
 * blurred halo). No d3-sankey/@nivo dependency, same reasoning as before: the shape this needs
 * (one smooth path spanning all three checkpoints, a nested-glow fill built from re-scaled
 * copies of that same path, a hard minimum floor for the sparse case) is plain arithmetic and
 * bezier math, not a layout problem a Sankey library solves for us.
 *
 * Sub-status detail (Pending/Filled/etc.) intentionally isn't drawn as separate bands anymore —
 * the reference's bands read as glow/depth layers around ONE flowing shape, not a real
 * breakdown, so that detail moved into hover tooltips (see `titleFor`) instead of stacked rects.
 *
 * Colors come from `--color-sales-funnel-*` (theme.css) fed straight into SVG props as
 * `var(...)` strings — same convention as booked-chart.tsx — so light/dark theming (including
 * the dark-mode-only multi-hue swap) is automatic, zero JS color logic.
 */

const MIN_HALF_HEIGHT = 10;
const LABEL_GAP = 10;
const PILL_HEIGHT = 26;
const NODE_LABEL_HEIGHT = 18; // "Application" / "Offer" / "Payment" text sitting above the pill
const TOP_RESERVED = NODE_LABEL_HEIGHT + PILL_HEIGHT + LABEL_GAP + 6;
const BOTTOM_RESERVED = PILL_HEIGHT + LABEL_GAP + 6;
const DROPOUT_GAP = 26; // vertical gap between the main flow's bottom edge and the dropout lane's top
const DROPOUT_MAX_HALF = 22;
const DROPOUT_FADE_FRACTION = 0.62; // dropout ribbon dissipates to nothing this far into the gap to the next checkpoint

// Outer (widest, most transparent) to core (narrowest, brightest) — painted in this order so
// each layer sits on top of the wider one behind it.
const GLOW_LAYERS = [
    { scale: 1, color: "var(--color-sales-funnel-layer-4)", opacity: 0.14 },
    { scale: 0.72, color: "var(--color-sales-funnel-layer-3)", opacity: 0.32 },
    { scale: 0.46, color: "var(--color-sales-funnel-layer-2)", opacity: 0.6 },
    { scale: 0.22, color: "var(--color-sales-funnel-core)", opacity: 0.95 },
];

type Point = { x: number; y0: number; y1: number };

/** One continuous closed path across N checkpoints — top edge left-to-right, bottom edge
 * right-to-left, cubic beziers between consecutive checkpoints (control points at the
 * horizontal midpoint). Generalizes a single tapering ribbon to a multi-segment flowing shape
 * with no visible seam at the middle checkpoint. */
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

const titleFor = (nodeLabel: string, value: number, subBands: { label: string; count: number }[]) =>
    `${nodeLabel}: ${value} (${subBands.map((b) => `${b.label}: ${b.count}`).join(", ")})`;

export type SalesFunnelRibbonProps = {
    flow: FunnelFlow;
    width: number;
    height: number;
    onBandClick?: (nodeId: FunnelFlowNodeId, segmentKey: string) => void;
};

export const SalesFunnelRibbon = ({ flow, width, height, onBandClick }: SalesFunnelRibbonProps) => {
    const [application, offer, payment] = flow.nodes;
    const maxValue = Math.max(application.value, 1);

    const columnX = [width * 0.08, width * 0.5, width * 0.92];
    const centerY = TOP_RESERVED + (height - TOP_RESERVED - BOTTOM_RESERVED) * 0.42;
    const mainAreaHeight = height - TOP_RESERVED - BOTTOM_RESERVED;

    const halfHeightFor = (value: number) => Math.max(MIN_HALF_HEIGHT, (value / maxValue) * (mainAreaHeight / 2));
    const mainHalf = [halfHeightFor(application.value), halfHeightFor(offer.value), halfHeightFor(payment.value)];

    const mainPoints: Point[] = columnX.map((x, i) => ({ x, y0: centerY - mainHalf[i], y1: centerY + mainHalf[i] }));

    const dropoutBaseY = centerY + mainHalf[0] + DROPOUT_GAP;
    const dropoutHalfFor = (value: number) => (value === 0 ? 0 : Math.max(6, Math.min(DROPOUT_MAX_HALF, (value / maxValue) * (mainAreaHeight / 2))));

    const dropoutRibbons = [0, 1]
        .filter((i) => flow.dropouts[i] > 0)
        .map((i) => {
            const half = dropoutHalfFor(flow.dropouts[i]);
            const startX = columnX[i];
            const endX = startX + (columnX[i + 1] - startX) * DROPOUT_FADE_FRACTION;
            return {
                key: `dropout-${i}`,
                from: (i === 0 ? "application" : "offer") as FunnelFlowNodeId,
                count: flow.dropouts[i],
                path: buildFlowPath([
                    { x: startX, y0: dropoutBaseY - half, y1: dropoutBaseY + half },
                    { x: endX, y0: dropoutBaseY, y1: dropoutBaseY },
                ]),
                labelX: startX,
                labelY: dropoutBaseY + half,
            };
        });

    const nodeIds: FunnelFlowNodeId[] = ["application", "offer", "payment"];
    const nodes = [application, offer, payment];

    const pillWidth = (text: string) => Math.max(34, 18 + text.length * 9);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="h-auto w-full min-w-160" role="img" aria-label="Sales funnel flow">
            <defs>
                <filter id="sf-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="18" />
                </filter>
                <linearGradient id="sf-dropout-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-fg-quaternary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-fg-quaternary)" stopOpacity={0} />
                </linearGradient>
            </defs>

            {/* Soft ambient halo behind the flow — a blurred, oversized copy of the outermost layer. */}
            <path d={buildFlowPath(mainPoints)} fill="var(--color-sales-funnel-glow)" opacity={0.22} filter="url(#sf-glow-blur)" />

            {dropoutRibbons.map((r) => (
                <path
                    key={r.key}
                    d={r.path}
                    fill="url(#sf-dropout-gradient)"
                    className={onBandClick ? "cursor-pointer" : undefined}
                    onClick={onBandClick ? () => onBandClick(r.from, "dropout") : undefined}
                >
                    <title>Dropped after {r.from === "application" ? "Application" : "Offer"}: {r.count}</title>
                </path>
            ))}

            {GLOW_LAYERS.map((layer, i) => (
                <path
                    key={i}
                    d={buildFlowPath(mainPoints.map((p) => ({ x: p.x, y0: centerY - (centerY - p.y0) * layer.scale, y1: centerY + (p.y1 - centerY) * layer.scale })))}
                    fill={layer.color}
                    opacity={layer.opacity}
                />
            ))}

            {/* Invisible per-node hit areas — wide enough to click reliably, click-through target
                is the whole node now that sub-bands aren't separately drawn. */}
            {nodeIds.map((id, i) => (
                <rect
                    key={id}
                    x={columnX[i] - (i === 0 ? 40 : 55)}
                    y={centerY - mainHalf[i] - 4}
                    width={i === 0 ? 95 : 110}
                    height={mainHalf[i] * 2 + 8}
                    fill="transparent"
                    className={onBandClick ? "cursor-pointer" : undefined}
                    onClick={onBandClick ? () => onBandClick(id, "main") : undefined}
                >
                    <title>{titleFor(nodes[i].label, nodes[i].value, nodes[i].subBands)}</title>
                </rect>
            ))}

            {/* Node value pills, above the flow, with a guide line down to the ribbon. */}
            {nodeIds.map((id, i) => {
                const text = String(nodes[i].value);
                const w = pillWidth(text);
                const pillY = TOP_RESERVED - PILL_HEIGHT - LABEL_GAP;
                return (
                    <g key={id}>
                        <line x1={columnX[i]} y1={pillY + PILL_HEIGHT} x2={columnX[i]} y2={centerY - mainHalf[i]} stroke="var(--color-border-secondary)" strokeWidth={1} />
                        <rect x={columnX[i] - w / 2} y={pillY} width={w} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} fill="var(--color-bg-primary-solid)" />
                        <text x={columnX[i]} y={pillY + PILL_HEIGHT / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--color-text-primary_on-brand)">
                            {text}
                        </text>
                        <text x={columnX[i]} y={pillY - NODE_LABEL_HEIGHT + 14} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-text-secondary)">
                            {nodes[i].label}
                        </text>
                    </g>
                );
            })}

            {/* Dropout pills, below the flow, one per real transition. */}
            {dropoutRibbons.map((r) => {
                const text = String(r.count);
                const w = pillWidth(text);
                const pillY = height - BOTTOM_RESERVED + LABEL_GAP - 6;
                return (
                    <g key={r.key}>
                        <line x1={r.labelX} y1={r.labelY} x2={r.labelX} y2={pillY} stroke="var(--color-border-secondary)" strokeWidth={1} />
                        <rect x={r.labelX - w / 2} y={pillY} width={w} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} fill="var(--color-bg-secondary)" />
                        <text x={r.labelX} y={pillY + PILL_HEIGHT / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--color-text-secondary)">
                            {text}
                        </text>
                    </g>
                );
            })}

            {/* Conversion % at each junction's midpoint, centered in the ribbon. */}
            {[
                { x: (columnX[0] + columnX[1]) / 2, pct: flow.conversionPct[0] },
                { x: (columnX[1] + columnX[2]) / 2, pct: flow.conversionPct[1] },
            ].map((junction, i) => (
                <text key={i} x={junction.x} y={centerY + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--color-text-white)" opacity={0.9}>
                    {junction.pct}%
                </text>
            ))}
        </svg>
    );
};
