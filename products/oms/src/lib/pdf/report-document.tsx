import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
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
import type { FunnelStage, PeriodChartData, TeamManagerSummary } from "@/data/dashboard-data";
import { formatIndianNumber } from "@/data/dashboard-data";

// Registered as four distinct families (not one "Inter" family with four weight variants) —
// registering multiple font files under one shared family name reintroduced glyph corruption
// on a full-length document even after the woff2→woff fix above (isolated single-weight test
// PDFs were clean; the real multi-section report, with several weights registered together,
// dropped different glyphs in different spots). One family per file exactly matches the
// confirmed-clean configuration, at the cost of setting `fontFamily` instead of `fontWeight`
// wherever a heavier weight is needed below.
Font.register({ family: "Inter-Regular", src: Regular });
Font.register({ family: "Inter-Medium", src: Medium });
Font.register({ family: "Inter-SemiBold", src: SemiBold });
Font.register({ family: "Inter-Bold", src: Bold });

// Known cosmetic limitation, not fixed: fontkit (bundled with @react-pdf/renderer) rasterizes
// capital "A" from Inter's SemiBold/Bold faces slightly heavier than the surrounding glyphs of
// the same weight — reproduced in isolation with each file registered completely alone, so it's
// a fontkit/Inter-glyph-construction interaction, not a registration or subsetting bug on our
// end. Purely visual (every letter is present and correctly spelled); not worth chasing further
// against a third-party rendering engine. Revisit if a future @react-pdf/renderer release fixes
// it upstream.

const BRAND = "#7f56d9";
const INK = "#181d27";
const GRAY_700 = "#414651";
const GRAY_500 = "#717680";
const GRAY_400 = "#a4a7ae";
const HAIRLINE = "#e9eaeb";
const GREEN = "#079455";
const AMBER = "#b54708";

const rupee = (value: number) => `₹${formatIndianNumber(value)}`;

const styles = StyleSheet.create({
    page: { paddingTop: 40, paddingBottom: 48, paddingHorizontal: 40, fontFamily: "Inter-Regular", fontSize: 10, color: GRAY_700 },

    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
    eyebrowDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND },
    eyebrow: { fontFamily: "Inter-SemiBold", fontSize: 9, letterSpacing: 0.6, color: GRAY_500 },
    title: { fontFamily: "Inter-Bold", fontSize: 22, color: INK, marginBottom: 4 },
    subtitle: { fontSize: 10, color: GRAY_500 },
    rolePill: { fontFamily: "Inter-Bold", fontSize: 8, letterSpacing: 0.4, color: BRAND, backgroundColor: "#f4ebff", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },

    hairline: { borderBottomWidth: 1, borderBottomColor: HAIRLINE, marginTop: 12, marginBottom: 16 },

    sectionLabel: { fontFamily: "Inter-Bold", fontSize: 9, letterSpacing: 0.6, color: GRAY_500, marginBottom: 12 },
    section: { marginBottom: 8 },

    kpiRow: { flexDirection: "row" },
    kpiTile: { flex: 1, paddingRight: 16 },
    kpiLabel: { fontFamily: "Inter-Bold", fontSize: 8, letterSpacing: 0.4, color: GRAY_500, marginBottom: 6, textTransform: "uppercase" },
    kpiValue: { fontFamily: "Inter-Bold", fontSize: 16, color: INK, marginBottom: 4 },
    kpiDeltaPositive: { fontFamily: "Inter-SemiBold", fontSize: 8.5, color: GREEN },
    kpiDeltaNeutral: { fontFamily: "Inter-SemiBold", fontSize: 8.5, color: AMBER },

    revenueRow: { flexDirection: "row" },
    revenueCol: { flex: 1, paddingRight: 24 },
    revenueLabel: { fontFamily: "Inter-Bold", fontSize: 8, letterSpacing: 0.4, color: GRAY_500, marginBottom: 6, textTransform: "uppercase" },
    revenueValue: { fontFamily: "Inter-Bold", fontSize: 15, color: INK, marginBottom: 6 },
    revenueNote: { fontSize: 8.5, color: GRAY_500, lineHeight: 1.4 },

    tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: HAIRLINE, paddingBottom: 6, marginBottom: 2 },
    tableRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: HAIRLINE },
    th: { fontFamily: "Inter-Bold", fontSize: 8, letterSpacing: 0.3, color: GRAY_500, textTransform: "uppercase" },
    td: { fontSize: 9, color: GRAY_700 },
    tdStrong: { fontFamily: "Inter-SemiBold", fontSize: 9, color: INK },
    tdRight: { textAlign: "right" },

    funnelStageCol: { width: "22%" },
    funnelBreakdownCol: { width: "58%", paddingRight: 12 },
    funnelTotalCol: { width: "20%" },

    tmNameCol: { width: "28%" },
    tmNumCol: { width: "24%" },

    footnote: { fontSize: 8, color: GRAY_400, marginTop: 4, lineHeight: 1.4 },

    footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: HAIRLINE, paddingTop: 8 },
    footerText: { fontSize: 8, color: GRAY_400 },
});

const Kpi = ({ label, value, delta, deltaTone }: { label: string; value: string; delta: string; deltaTone: "positive" | "neutral" }) => (
    <View style={styles.kpiTile}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={deltaTone === "positive" ? styles.kpiDeltaPositive : styles.kpiDeltaNeutral}>{delta}</Text>
    </View>
);

const stageBreakdownText = (stage: FunnelStage) => stage.breakdown.map((item) => `${item.label} ${item.count}`).join(" · ");
const stageTotalText = (stage: FunnelStage) => (stage.denominator !== undefined ? `${stage.value} / ${stage.denominator}` : String(stage.value));

export type DashboardReportDocumentProps = {
    data: PeriodChartData;
    persona: Persona;
    scopeLabel: string;
    periodLabel: string;
    generatedAt: Date;
    funnelStages: FunnelStage[];
    teamManagerSummaries: TeamManagerSummary[] | null;
};

export const DashboardReportDocument = ({ data, persona, scopeLabel, periodLabel, generatedAt, funnelStages, teamManagerSummaries }: DashboardReportDocumentProps) => {
    const generatedLabel = generatedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const realisedPercentText = `${data.bookedTotal === 0 ? "0" : Math.round((data.totalRealised / data.bookedTotal) * 100)}% of booked`;
    const unitProgressPercent = data.unitTarget === 0 ? 0 : Math.round((data.unitsAchieved / data.unitTarget) * 100);

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
                        <Kpi
                            label="Unit Sales · Target vs Achieved"
                            value={`${data.unitsAchieved} / ${data.unitTarget}`}
                            delta={`${unitProgressPercent}% of target`}
                            deltaTone={unitProgressPercent >= 100 ? "positive" : "neutral"}
                        />
                        <Kpi label="Revenue Booked" value={rupee(data.bookedTotal)} delta={data.changeText.replace(/^Out of which.*is realised/, "").trim() || "vs last period"} deltaTone="positive" />
                        <Kpi label="Revenue Realised" value={rupee(data.totalRealised)} delta={realisedPercentText} deltaTone="neutral" />
                        <Kpi label="Average Ticket Size" value={rupee(data.ats)} delta="per unit sold" deltaTone="positive" />
                    </View>
                </View>

                <View style={styles.hairline} />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{`REVENUE — BOOKED VS. REALISED (${periodLabel.toUpperCase()})`}</Text>
                    <View style={styles.revenueRow}>
                        <View style={styles.revenueCol}>
                            <Text style={styles.revenueLabel}>Booked</Text>
                            <Text style={styles.revenueValue}>{rupee(data.bookedTotal)}</Text>
                            <Text style={styles.revenueNote}>Total value of payment plans created in the period, whether or not collected yet.</Text>
                        </View>
                        <View style={styles.revenueCol}>
                            <Text style={styles.revenueLabel}>Realised</Text>
                            <Text style={styles.revenueValue}>
                                <Text>{rupee(data.totalRealised)} </Text>
                                <Text style={{ color: GREEN, fontSize: 11 }}>{`(${realisedPercentText.replace(" of booked", "")})`}</Text>
                            </Text>
                            <Text style={styles.revenueNote}>{`Cash actually collected, including ${rupee(data.realisedOfPreviouslyBooked)} against deals booked in earlier periods.`}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.hairline} />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>APPLICATION FUNNEL</Text>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, styles.funnelStageCol]}>Stage</Text>
                        <Text style={[styles.th, styles.funnelBreakdownCol]}>Breakdown</Text>
                        <Text style={[styles.th, styles.funnelTotalCol, styles.tdRight]}>Total</Text>
                    </View>
                    {funnelStages.map((stage) => (
                        <View key={stage.label} style={styles.tableRow}>
                            <Text style={[styles.tdStrong, styles.funnelStageCol]}>{stage.label}</Text>
                            <Text style={[styles.td, styles.funnelBreakdownCol]}>{stageBreakdownText(stage)}</Text>
                            <Text style={[styles.tdStrong, styles.funnelTotalCol, styles.tdRight]}>{stageTotalText(stage)}</Text>
                        </View>
                    ))}
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
