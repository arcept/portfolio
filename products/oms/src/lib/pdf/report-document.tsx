import { Defs, Document, Font, G, LinearGradient, Line, Page, Path, Rect, Stop, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
// @fontsource ships Inter's real glyph coverage as .woff/.woff2 per subset, and the latin-ext
// subset (not the default `latin`) is the one carrying the ₹ glyph — verified by extracting and
// checking coverage. Deliberately `.woff`, not `.woff2`, despite react-pdf's fontkit claiming
// woff2 support: empirically (rendered and visually inspected a real PDF), this exact Inter
// build's .woff2 silently drops specific glyphs — U+0041 'A' and U+20B9 '₹' both vanished with
// every other character intact — while the byte-identical-content .woff renders perfectly. Keep
// this .woff import even if it looks like a downgrade; re-test before ever switching back.
import Regular from "@fontsource/inter/files/inter-latin-ext-400-normal.woff";
import Medium from "@fontsource/inter/files/inter-latin-ext-500-normal.woff";
import SemiBold from "@fontsource/inter/files/inter-latin-ext-600-normal.woff";
import Bold from "@fontsource/inter/files/inter-latin-ext-700-normal.woff";
import type { Persona } from "@/types/role";
import { ROLE_LABELS } from "@/types/role";
import type { DealStageBar, PeriodChartData, TeamManagerSummary } from "@/data/dashboard-data";
import { formatIndianNumber } from "@/data/dashboard-data";
import type { FunnelFlow } from "@/data/dashboard-metrics";
import type { SalesFunnelCourseRow } from "@/data/dashboard-metrics";

// Registered as ONE "Inter" family with four fontWeight-tagged variants — not four separate
// family names (Inter-Regular/Medium/SemiBold/Bold), which was tried first and is what actually
// caused a corrupted, heavy-looking capital "A" in every uppercase/letter-spaced label once a
// full multi-section document exercised several of those "families" together. Root-caused by
// re-registering the identical font files this one-family/fontWeight way and confirming a clean
// render at every weight, with or without uppercase/letterSpacing — reproduced with both the
// .woff files here and .ttf conversions, so it's a registration antipattern, not a WOFF/WOFF2 or
// Inter glyph defect. Don't split this back into per-weight families.
Font.register({
    family: "Inter",
    fonts: [
        { src: Regular, fontWeight: 400 },
        { src: Medium, fontWeight: 500 },
        { src: SemiBold, fontWeight: 600 },
        { src: Bold, fontWeight: 700 },
    ],
});

// ---------------------------------------------------------------------------
// Colors — brand/ink/gray unchanged from the original report; the rest below are hex pulled
// straight from `theme.css`'s LIGHT-mode tokens (the case study/dashboard's actual theme, not
// dark mode) via a one-off oklch→sRGB conversion, since @react-pdf/renderer's SVG can't resolve
// CSS custom properties or oklch() — everything here has to be a literal hex string. Re-derive
// from theme.css (not guess new values) if any of these ever drift from the live dashboard.
// ---------------------------------------------------------------------------

const BRAND = "#7f56d9";
const INK = "#181d27";
const GRAY_700 = "#414651";
const GRAY_500 = "#717680";
const GRAY_400 = "#a4a7ae";
const HAIRLINE = "#e9eaeb";
const GREEN = "#079455";
const AMBER = "#b54708";
const RED = "#e7000b";

// Sales Funnel ribbon — light-mode dashboard palette (`--color-sf-*`): one orange hue per
// checkpoint, deepening stage to stage, swapping to red at a junction whose conversion is weak
// (<45%, same threshold `sales-funnel-ribbon.tsx` uses).
const SF_APPLICATION_HUE = "#ffb86a"; // orange-300
const SF_OFFER_HUE = "#ff6900"; // orange-500
const SF_PAYMENT_HUE = "#f54900"; // orange-600
const SF_COMPLETED_HUE = "#ca3500"; // orange-700
const SF_WEAK = "#fb2c36"; // red-500
const SF_PILL_DARK = "#0a0a0a"; // bg-primary-solid, light mode
const SF_PILL_ACCENT = "#00a63e"; // fg-success-primary, light mode (green-600)
const SF_DROPOUT_FILL = "#a1a1a1"; // fg-quaternary, light mode
const WEAK_CONVERSION_THRESHOLD = 45;

// Deal Stages table — `colorClassName` (a `bg-<token>` utility from `dashboard-metrics.ts`)
// mapped to its light-mode hex, used for the table's per-stage dot.
const DEAL_STAGE_COLOR_HEX: Record<string, string> = {
    "bg-utility-blue-400": "#51a2ff",
    "bg-utility-purple-400": "#c27aff",
    "bg-fg-warning-secondary": "#f0b100",
    "bg-fg-error-secondary": "#fb2c36",
    "bg-fg-success-primary": "#00a63e",
    "bg-fg-tertiary": "#525252",
    "bg-utility-brand-700": "#6941c6",
    "bg-fg-error-primary": "#e7000b",
};
const rupee = (value: number) => `₹${formatIndianNumber(value)}`;

const CONTENT_WIDTH = 515;

// ---------------------------------------------------------------------------
// Sales Funnel ribbon geometry — ported from `sales-funnel-ribbon.tsx` (ported here without its
// interactivity/animation/hover/blur-glow layers, none of which apply to a static print artifact
// — see that file's own header comment for the full design rationale this shape follows). Kept
// as plain functions, not a shared module, since the browser component's version depends on
// React state/refs/portals this static renderer has no use for.
// ---------------------------------------------------------------------------

const RIBBON_MIN_HALF_HEIGHT = 10;
const RIBBON_MAIN_PILL_HEIGHT = 36;
const RIBBON_PILL_GUIDE_GAP = 6;
const RIBBON_PILL_LOWER_OFFSET = 12;
const RIBBON_TOP_RESERVED = RIBBON_MAIN_PILL_HEIGHT + RIBBON_PILL_GUIDE_GAP - RIBBON_PILL_LOWER_OFFSET;
const RIBBON_DROPOUT_PILL_HEIGHT = 24;
const RIBBON_LABEL_GAP = 10;
const RIBBON_BOTTOM_RESERVED = RIBBON_DROPOUT_PILL_HEIGHT + RIBBON_LABEL_GAP + 6;
const RIBBON_DROPOUT_GAP = 24;
const RIBBON_DROPOUT_MAX_HALF = 18;
const RIBBON_DROPOUT_FADE_FRACTION = 0.62;
const RIBBON_RIGHT_COLUMN_MARGIN_FRACTION = 0.06;
const RIBBON_DRAMA_EXPONENT = 1.4;
const RIBBON_TAPER_TO_BLOCK_RATIO = 0.45;
const RIBBON_CORNER_RADIUS = 6;

function ribbonColumnXFor(count: number, width: number): number[] {
    if (count === 1) return [width / 2];
    const span = width - RIBBON_RIGHT_COLUMN_MARGIN_FRACTION * width;
    return Array.from({ length: count }, (_, i) => (span * i) / (count - 1));
}

type StageSegment = { xLeft: number; xRight: number; half: number };

function stageSegmentsFor(count: number, halves: number[], width: number): StageSegment[] {
    const blockWidth = width / (count + (count - 1) * RIBBON_TAPER_TO_BLOCK_RATIO);
    const stride = blockWidth + RIBBON_TAPER_TO_BLOCK_RATIO * blockWidth;
    return Array.from({ length: count }, (_, i) => {
        const xLeft = i * stride;
        return { xLeft, xRight: xLeft + blockWidth, half: halves[i] };
    });
}

type PolyPoint = { x: number; y: number };

function roundedClosedPolygonPath(points: PolyPoint[], radius: number, sharpIndices: Set<number>): string {
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
    const sharpIndices = new Set([0, top.length - 1, top.length, points.length - 1]);
    return roundedClosedPolygonPath(points, RIBBON_CORNER_RADIUS, sharpIndices);
}

type DropPoint = { x: number; y0: number; y1: number };

function buildDropoutPath(points: DropPoint[]): string {
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

/** `SVGTextProps`'s published type omits `fontSize`/`fontWeight` even though the renderer itself
 * reads both off a text run's resolved style (`@react-pdf/textkit`'s `attributes.fontSize`) — a
 * gap in `@react-pdf/types`, not a real runtime restriction. Routing them through `style` (cast
 * once here, not per call site) is the same pattern react-pdf's own SVG chart examples use. */
const SvgLabel = ({
    x,
    y,
    fontSize,
    fontWeight,
    fill,
    textAnchor = "middle",
    opacity,
    children,
}: {
    x: number;
    y: number;
    fontSize: number;
    fontWeight?: number;
    fill: string;
    textAnchor?: "start" | "middle" | "end";
    opacity?: number;
    children: string;
}) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Text x={x} y={y} textAnchor={textAnchor} fill={fill} opacity={opacity} style={{ fontFamily: "Inter", fontSize, fontWeight } as any}>
        {children}
    </Text>
);

const RIBBON_NODE_LABELS = ["Application", "Offer", "Payment", "Completed"];

const SalesFunnelRibbonPdf = ({ flow, width, height }: { flow: FunnelFlow; width: number; height: number }) => {
    const nodes = flow.nodes;
    const maxValue = Math.max(nodes[0].value, 1);

    const columnX = ribbonColumnXFor(4, width);
    const centerY = RIBBON_TOP_RESERVED + (height - RIBBON_TOP_RESERVED - RIBBON_BOTTOM_RESERVED) * 0.42;
    const mainAreaHeight = height - RIBBON_TOP_RESERVED - RIBBON_BOTTOM_RESERVED;

    const halfHeightFor = (value: number) => Math.max(RIBBON_MIN_HALF_HEIGHT, Math.pow(value / maxValue, RIBBON_DRAMA_EXPONENT) * (mainAreaHeight / 2));
    const mainHalf = nodes.map((n) => halfHeightFor(n.value));
    const mainSegments = stageSegmentsFor(4, mainHalf, width);
    const blockCenterX = mainSegments.map((s) => (s.xLeft + s.xRight) / 2);

    const stopColorFor = (nodeIndex: number) => {
        if (nodeIndex === 0) return SF_APPLICATION_HUE;
        const hueByIndex = [SF_APPLICATION_HUE, SF_OFFER_HUE, SF_PAYMENT_HUE, SF_COMPLETED_HUE];
        return flow.conversionPct[nodeIndex - 1] < WEAK_CONVERSION_THRESHOLD ? SF_WEAK : hueByIndex[nodeIndex];
    };
    const gradientStopOffset = (x: number) => (x - columnX[0]) / (columnX[columnX.length - 1] - columnX[0]);

    const depths = [
        { scale: 1, opacity: 0.14 },
        { scale: 0.8333, opacity: 0.32 },
        { scale: 0.6667, opacity: 0.6 },
        { scale: 0.5, opacity: 0.95 },
    ];

    const dropoutBaseY = centerY + mainHalf[0] + RIBBON_DROPOUT_GAP;
    const dropoutHalfFor = (value: number) => (value === 0 ? 0 : Math.max(6, Math.min(RIBBON_DROPOUT_MAX_HALF, (value / maxValue) * (mainAreaHeight / 2))));

    const dropoutRibbons = [0, 1, 2]
        .filter((i) => flow.dropouts[i] > 0)
        .map((i) => {
            const half = dropoutHalfFor(flow.dropouts[i]);
            const startX = columnX[i];
            const endX = startX + (columnX[i + 1] - startX) * RIBBON_DROPOUT_FADE_FRACTION;
            const halfAtLabelX =
                blockCenterX[i] <= startX ? half : blockCenterX[i] >= endX ? 0 : half * (1 - (blockCenterX[i] - startX) / (endX - startX));
            return {
                zoneIndex: i,
                count: flow.dropouts[i],
                path: buildDropoutPath([
                    { x: startX, y0: dropoutBaseY - half, y1: dropoutBaseY + half },
                    { x: endX, y0: dropoutBaseY, y1: dropoutBaseY },
                ]),
                labelX: blockCenterX[i],
                labelY: dropoutBaseY + halfAtLabelX,
            };
        });

    return (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <Defs>
                <LinearGradient id="sf-flow" x1={columnX[0]} y1={0} x2={columnX[columnX.length - 1]} y2={0} gradientUnits="userSpaceOnUse">
                    {columnX.map((x, i) => (
                        <Stop key={i} offset={gradientStopOffset(x)} stopColor={stopColorFor(i)} />
                    ))}
                </LinearGradient>
            </Defs>

            {dropoutRibbons.map((r) => (
                <Path key={`drop-${r.zoneIndex}`} d={r.path} fill={SF_DROPOUT_FILL} opacity={0.5} />
            ))}

            {depths.map((d, i) => (
                <Path key={i} d={buildStagedRibbonPath(mainSegments, centerY, d.scale)} fill="url(#sf-flow)" opacity={d.opacity} />
            ))}

            {RIBBON_NODE_LABELS.map((label, i) => {
                const isAccent = i === 3;
                const x = blockCenterX[i];
                const text = String(nodes[i].value);
                const pillW = Math.max(52, 26 + text.length * 13);
                const pillH = RIBBON_MAIN_PILL_HEIGHT;
                const pillY = Math.max(0, RIBBON_TOP_RESERVED - RIBBON_PILL_GUIDE_GAP - pillH);
                return (
                    <G key={label}>
                        <Line x1={x} y1={pillY + pillH} x2={x} y2={centerY - mainHalf[i]} stroke={HAIRLINE} strokeWidth={1} />
                        <Rect x={x - pillW / 2} y={pillY} width={pillW} height={pillH} rx={pillH / 2} fill={isAccent ? SF_PILL_ACCENT : SF_PILL_DARK} />
                        <SvgLabel x={x} y={pillY + pillH / 2 + 5} fontSize={16} fontWeight={700} fill="#ffffff">
                            {text}
                        </SvgLabel>
                    </G>
                );
            })}

            {RIBBON_NODE_LABELS.map((label, i) => (
                <SvgLabel key={label} x={blockCenterX[i]} y={centerY + 4} fontSize={12} fontWeight={600} fill="#ffffff" opacity={0.95}>
                    {label}
                </SvgLabel>
            ))}

            {[0, 1, 2].map((i) => (
                <SvgLabel key={i} x={(mainSegments[i].xRight + mainSegments[i + 1].xLeft) / 2} y={centerY + 4} fontSize={11} fontWeight={700} fill="#ffffff" opacity={0.9}>
                    {`${flow.conversionPct[i]}%`}
                </SvgLabel>
            ))}

            {dropoutRibbons.map((r) => {
                const text = String(r.count);
                const pillW = Math.max(34, 18 + text.length * 9);
                const pillY = height - RIBBON_BOTTOM_RESERVED + RIBBON_LABEL_GAP - 6;
                return (
                    <G key={`drop-pill-${r.zoneIndex}`}>
                        <Line x1={r.labelX} y1={r.labelY} x2={r.labelX} y2={pillY} stroke={HAIRLINE} strokeWidth={1} />
                        <Rect x={r.labelX - pillW / 2} y={pillY} width={pillW} height={RIBBON_DROPOUT_PILL_HEIGHT} rx={RIBBON_DROPOUT_PILL_HEIGHT / 2} fill={GRAY_400} />
                        <SvgLabel x={r.labelX} y={pillY + RIBBON_DROPOUT_PILL_HEIGHT / 2 + 4} fontSize={10} fontWeight={700} fill={INK}>
                            {text}
                        </SvgLabel>
                    </G>
                );
            })}
        </Svg>
    );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    page: { paddingTop: 40, paddingBottom: 48, paddingHorizontal: 40, fontFamily: "Inter", fontWeight: 400, fontSize: 10, color: GRAY_700 },

    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
    eyebrowDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND },
    eyebrow: { fontWeight: 600, fontSize: 9, letterSpacing: 0.6, color: GRAY_500 },
    title: { fontWeight: 700, fontSize: 22, color: INK, marginBottom: 4 },
    subtitle: { fontSize: 10, color: GRAY_500 },
    rolePill: { fontWeight: 700, fontSize: 8, letterSpacing: 0.4, color: BRAND, backgroundColor: "#f4ebff", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },

    hairline: { borderBottomWidth: 1, borderBottomColor: HAIRLINE, marginTop: 8, marginBottom: 9 },

    sectionLabel: { fontWeight: 700, fontSize: 9, letterSpacing: 0.6, color: GRAY_500, marginBottom: 4 },
    sectionSubtitle: { fontSize: 8, color: GRAY_400, lineHeight: 1.4, marginBottom: 7 },
    section: { marginBottom: 6 },

    kpiRow: { flexDirection: "row", marginBottom: 10 },
    kpiTile: { flex: 1, paddingRight: 16 },
    kpiLabel: { fontWeight: 700, fontSize: 7.5, letterSpacing: 0.4, color: GRAY_500, marginBottom: 5, textTransform: "uppercase" },
    kpiValue: { fontWeight: 700, fontSize: 15, color: INK, marginBottom: 3 },
    kpiDeltaPositive: { fontWeight: 600, fontSize: 8, color: GREEN },
    kpiDeltaNeutral: { fontWeight: 600, fontSize: 8, color: AMBER },
    kpiDeltaNegative: { fontWeight: 600, fontSize: 8, color: RED },

    revenueRow: { flexDirection: "row" },
    revenueCol: { flex: 1, paddingRight: 24 },
    revenueLabel: { fontWeight: 700, fontSize: 8, letterSpacing: 0.4, color: GRAY_500, marginBottom: 6, textTransform: "uppercase" },
    revenueValue: { fontWeight: 700, fontSize: 15, color: INK, marginBottom: 6 },
    revenueNote: { fontSize: 8.5, color: GRAY_500, lineHeight: 1.4 },

    tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: HAIRLINE, paddingBottom: 6, marginBottom: 2 },
    tableRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: HAIRLINE },
    th: { fontWeight: 700, fontSize: 8, letterSpacing: 0.3, color: GRAY_500, textTransform: "uppercase" },
    td: { fontSize: 9, color: GRAY_700 },
    tdStrong: { fontWeight: 600, fontSize: 9, color: INK },
    tdRight: { textAlign: "right" },

    funnelStageCol: { width: "22%" },
    funnelBreakdownCol: { width: "58%", paddingRight: 12 },
    funnelTotalCol: { width: "20%" },

    tmNameCol: { width: "28%" },
    tmNumCol: { width: "24%" },

    footnote: { fontSize: 7.5, color: GRAY_400, marginTop: 4, lineHeight: 1.4 },

    footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: HAIRLINE, paddingTop: 8 },
    footerText: { fontSize: 8, color: GRAY_400 },

    legendRow: { flexDirection: "row", gap: 16, marginTop: 4, marginBottom: 6 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    legendDot: { width: 6, height: 6, borderRadius: 3 },
    legendText: { fontSize: 8, color: GRAY_500 },

    captionRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
    captionCard: { flex: 1, backgroundColor: "#fafafa", borderRadius: 8, padding: 10 },
    captionTitle: { fontWeight: 700, fontSize: 8, color: INK, marginBottom: 4 },
    captionLine: { flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: GRAY_500, marginBottom: 1 },
    captionValue: { fontWeight: 600, fontSize: 8, color: GRAY_700 },
    dropoutCardText: { fontSize: 8, color: GRAY_500, lineHeight: 1.4 },

    dealStageTh: { fontWeight: 700, fontSize: 7.5, letterSpacing: 0.3, color: GRAY_500, textTransform: "uppercase" },
    dealStageRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: HAIRLINE },
    dealStageDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },

    lostDealsBanner: { backgroundColor: "#fef2f2", borderRadius: 8, padding: 12, marginTop: 10, marginBottom: 4 },
    lostDealsTitle: { fontWeight: 700, fontSize: 10, color: RED, marginBottom: 2 },
    lostDealsBody: { fontSize: 8.5, color: "#991b1b" },
});

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

const Kpi = ({
    label,
    value,
    delta,
    deltaTone,
}: {
    label: string;
    value: string;
    delta: string;
    deltaTone: "positive" | "neutral" | "negative";
}) => (
    <View style={styles.kpiTile}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={deltaTone === "positive" ? styles.kpiDeltaPositive : deltaTone === "negative" ? styles.kpiDeltaNegative : styles.kpiDeltaNeutral}>{delta}</Text>
    </View>
);

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export type DashboardReportDocumentProps = {
    data: PeriodChartData;
    persona: Persona;
    scopeLabel: string;
    periodLabel: string;
    generatedAt: Date;
    teamManagerSummaries: TeamManagerSummary[] | null;
    headline: {
        applicationsSent: number;
        applicationsSentDelta: { text: string; tone: "positive" | "neutral" | "negative" };
        conversionPct: number;
        conversionDelta: { text: string; tone: "positive" | "neutral" | "negative" };
        unitsAchieved: number;
        unitTarget: number;
        unitProgressPercent: number;
        ats: number;
        atsDelta: { text: string; tone: "positive" | "neutral" | "negative" };
    };
    flow: FunnelFlow;
    dealStages: DealStageBar[];
    courseRows: SalesFunnelCourseRow[];
    lostDeals: { percent: number; lostCount: number; cohortSize: number };
};

export const DashboardReportDocument = ({
    data,
    persona,
    scopeLabel,
    periodLabel,
    generatedAt,
    teamManagerSummaries,
    headline,
    flow,
    dealStages,
    courseRows,
    lostDeals,
}: DashboardReportDocumentProps) => {
    const generatedLabel = generatedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const realisedPercentText = `${data.bookedTotal === 0 ? "0" : Math.round((data.totalRealised / data.bookedTotal) * 100)}% of booked`;

    // Sub-band/dropout caption cards — same `count > 0` filter the live ribbon's own hover
    // tooltip applies (`nodeTooltip`/`dropoutTooltip` in `sales-funnel-ribbon.tsx`), just always
    // printed instead of surfaced on hover, since a PDF can't hover.
    const stageCards = flow.nodes.filter((n) => n.subBands.some((b) => b.count > 0));
    const dropoutCards = [0, 1, 2].filter((i) => flow.dropouts[i] > 0);

    return (
        <Document title={`OMS Dashboard Report — ${scopeLabel}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.eyebrowRow}>
                    <View style={styles.eyebrowDot} />
                    <Text style={styles.eyebrow}>OMS · SALES PERFORMANCE</Text>
                </View>

                <View style={styles.headerRow}>
                    <Text style={styles.title}>Sales Performance Report</Text>
                    <Text style={styles.rolePill}>{`${ROLE_LABELS[persona.role].toUpperCase()} VIEW`}</Text>
                </View>
                <Text style={styles.subtitle}>{`${scopeLabel} · ${periodLabel} · Generated ${generatedLabel} IST`}</Text>

                <View style={styles.hairline} />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PERFORMANCE SUMMARY</Text>
                    <View style={styles.kpiRow}>
                        <Kpi label="Applications Sent" value={String(headline.applicationsSent)} delta={headline.applicationsSentDelta.text} deltaTone={headline.applicationsSentDelta.tone} />
                        <Kpi label="Overall Conversion" value={`${headline.conversionPct}%`} delta={headline.conversionDelta.text} deltaTone={headline.conversionDelta.tone} />
                        <Kpi
                            label="Unit Sales / Target"
                            value={`${headline.unitsAchieved} / ${headline.unitTarget}`}
                            delta={`${headline.unitProgressPercent}% of target`}
                            deltaTone={headline.unitProgressPercent >= 100 ? "positive" : "neutral"}
                        />
                    </View>
                    <View style={styles.kpiRow}>
                        <Kpi label="Revenue Booked" value={rupee(data.bookedTotal)} delta={data.changeText} deltaTone={data.changeText.startsWith("-") ? "negative" : "positive"} />
                        <Kpi label="Revenue Realised" value={rupee(data.totalRealised)} delta={realisedPercentText} deltaTone="neutral" />
                        <Kpi label="Average Ticket Size" value={rupee(headline.ats)} delta={headline.atsDelta.text} deltaTone={headline.atsDelta.tone} />
                    </View>
                </View>

                <View style={styles.hairline} />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SALES FUNNEL</Text>
                    <Text style={styles.sectionSubtitle}>
                        Application -&gt; Offer -&gt; Payment -&gt; Completed, drawn as the same flow ribbon used on the dashboard. On-screen this responds to
                        hover with a full breakdown — printed as the cards below instead.
                    </Text>

                    <SalesFunnelRibbonPdf flow={flow} width={CONTENT_WIDTH} height={185} />

                    {stageCards.length > 0 && (
                        <View style={[styles.captionRow, { marginTop: 10 }]}>
                            {stageCards.map((node) => (
                                <View key={node.id} style={styles.captionCard}>
                                    <Text style={styles.captionTitle}>{`${node.label} · ${node.value}`}</Text>
                                    {node.subBands
                                        .filter((b) => b.count > 0)
                                        .map((b) => (
                                            <View key={b.key} style={styles.captionLine}>
                                                <Text>{b.label}</Text>
                                                <Text style={styles.captionValue}>{b.count}</Text>
                                            </View>
                                        ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {dropoutCards.length > 0 && (
                        <View style={styles.captionRow}>
                            {dropoutCards.map((i) => (
                                <View key={i} style={styles.captionCard}>
                                    <Text style={styles.captionTitle}>{`After ${RIBBON_NODE_LABELS[i]} · ${flow.dropouts[i]} dropped`}</Text>
                                    <Text style={styles.dropoutCardText}>{flow.dropoutBreakdown[i].map((b) => `${b.count} ${b.label.toLowerCase()}`).join(" · ")}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Figures reflect dashboard data at generation time · confidential, internal use only</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>REVENUE — BOOKED VS. REALISED</Text>
                    <Text style={styles.revenueNote}>
                        {`Booked this period: ${rupee(data.bookedTotal)} · Realised this period: ${rupee(data.totalRealised)} (${realisedPercentText.replace(" of booked", "")}) · Of which ${rupee(data.realisedOfPreviouslyBooked)} came from deals booked before this period.`}
                    </Text>
                </View>

                <View style={styles.hairline} />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DEAL STAGES</Text>
                    <Text style={styles.sectionSubtitle}>
                        "Total Enrolled" intentionally overlaps other stages below (see footnote) — it's a rollup, not part of the partition the other 8
                        rows add up to.
                    </Text>

                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.dealStageTh, { width: "26%" }]}>Stage</Text>
                        <Text style={[styles.dealStageTh, { width: "12%" }]}>Total</Text>
                        <Text style={[styles.dealStageTh, { width: "20%" }]}>Attention</Text>
                        <Text style={[styles.dealStageTh, { width: "42%" }]}>Breakdown</Text>
                    </View>
                    {dealStages.map((bar) => {
                        const dotColor = bar.gradient ? (bar.label === "Payment Completed" ? "#00a63e" : "#181d27") : (DEAL_STAGE_COLOR_HEX[bar.colorClassName] ?? GRAY_500);
                        return (
                            <View key={bar.label} style={styles.dealStageRow}>
                                <View style={{ width: "26%", flexDirection: "row", alignItems: "center" }}>
                                    <View style={[styles.dealStageDot, { backgroundColor: dotColor }]} />
                                    <Text style={styles.tdStrong}>{bar.label}</Text>
                                </View>
                                <Text style={[styles.td, { width: "12%" }]}>{bar.value}</Text>
                                <Text style={[styles.td, { width: "20%", color: bar.attentionValue ? AMBER : GRAY_400, fontWeight: bar.attentionValue ? 600 : 400 }]}>
                                    {bar.attentionValue ? `${bar.attentionValue} ${bar.attentionLabel ?? "need attention"}` : "—"}
                                </Text>
                                <Text style={[styles.td, { width: "42%" }]}>{bar.breakdown.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(" · ")}</Text>
                            </View>
                        );
                    })}
                    <Text style={styles.footnote}>
                        "Total Enrolled" = Payment Completed, plus Payment Due deals with at least one installment paid, plus Payment Overdue.
                    </Text>
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Figures reflect dashboard data at generation time · confidential, internal use only</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>CONVERSION BY COURSE</Text>
                    <Text style={styles.sectionSubtitle}>Application -&gt; Offer -&gt; Payment conversion, sliced by course.</Text>

                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, { width: "34%" }]}>Course</Text>
                        <Text style={[styles.th, { width: "16%" }, styles.tdRight]}>App</Text>
                        <Text style={[styles.th, { width: "25%" }, styles.tdRight]}>Offer</Text>
                        <Text style={[styles.th, { width: "25%" }, styles.tdRight]}>Payment</Text>
                    </View>
                    {courseRows.map((row) => (
                        <View key={row.courseId} style={styles.tableRow}>
                            <Text style={[styles.tdStrong, { width: "34%" }]}>{row.courseLabel}</Text>
                            <Text style={[styles.td, { width: "16%" }, styles.tdRight]}>{row.application}</Text>
                            <Text style={[styles.td, { width: "25%" }, styles.tdRight]}>{`${row.offer}  ${row.offerConversionPct}%`}</Text>
                            <Text style={[styles.td, { width: "25%" }, styles.tdRight]}>{`${row.payment}  ${row.paymentConversionPct}%`}</Text>
                        </View>
                    ))}
                    {(() => {
                        const totals = courseRows.reduce(
                            (acc, r) => ({ application: acc.application + r.application, offer: acc.offer + r.offer, payment: acc.payment + r.payment }),
                            { application: 0, offer: 0, payment: 0 },
                        );
                        const offerPct = totals.application === 0 ? 0 : Math.round((totals.offer / totals.application) * 100);
                        const paymentPct = totals.offer === 0 ? 0 : Math.round((totals.payment / totals.offer) * 100);
                        return (
                            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                                <Text style={[styles.tdStrong, { width: "34%" }]}>Overall</Text>
                                <Text style={[styles.tdStrong, { width: "16%" }, styles.tdRight]}>{totals.application}</Text>
                                <Text style={[styles.tdStrong, { width: "25%" }, styles.tdRight]}>{`${totals.offer}  ${offerPct}%`}</Text>
                                <Text style={[styles.tdStrong, { width: "25%" }, styles.tdRight]}>{`${totals.payment}  ${paymentPct}%`}</Text>
                            </View>
                        );
                    })()}

                    <View style={styles.lostDealsBanner}>
                        <Text style={styles.lostDealsTitle}>{`Lost Deals · ${lostDeals.percent}%`}</Text>
                        <Text style={styles.lostDealsBody}>{`You lost ${lostDeals.lostCount} out of ${lostDeals.cohortSize} deals this period`}</Text>
                    </View>
                </View>

                {teamManagerSummaries && (
                    <>
                        <View style={styles.hairline} />
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>TEAM MANAGERS — REVENUE & TARGET VS. ACHIEVED</Text>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.th, styles.tmNameCol]}>Team Manager</Text>
                                <Text style={[styles.th, styles.tmNumCol, styles.tdRight]}>Revenue Booked</Text>
                                <Text style={[styles.th, styles.tmNumCol, styles.tdRight]}>Target vs Achieved</Text>
                                <Text style={[styles.th, styles.tmNumCol, styles.tdRight]}>%</Text>
                                <Text style={[styles.th, styles.tmNumCol, styles.tdRight]}>ATS</Text>
                            </View>
                            {teamManagerSummaries.map((tm) => {
                                const pct = tm.unitTarget === 0 ? 0 : Math.round((tm.unitsAchieved / tm.unitTarget) * 100);
                                return (
                                    <View key={tm.id} style={styles.tableRow}>
                                        <Text style={[styles.tdStrong, styles.tmNameCol]}>{tm.name}</Text>
                                        <Text style={[styles.td, styles.tmNumCol, styles.tdRight]}>{rupee(tm.bookedTotal)}</Text>
                                        <Text style={[styles.td, styles.tmNumCol, styles.tdRight]}>{`${tm.unitsAchieved} / ${tm.unitTarget}`}</Text>
                                        <Text style={[styles.tdStrong, { color: GREEN }, styles.tmNumCol, styles.tdRight]}>{`${pct}%`}</Text>
                                        <Text style={[styles.td, styles.tmNumCol, styles.tdRight]}>{rupee(tm.ats)}</Text>
                                    </View>
                                );
                            })}
                            <Text style={styles.footnote}>
                                {"Full Team Manager -> Team Lead -> BDR drill-down is available in-app; this report summarizes to Team Manager level for print legibility."}
                            </Text>
                        </View>
                    </>
                )}

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Figures reflect dashboard data at generation time · confidential, internal use only</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
};
