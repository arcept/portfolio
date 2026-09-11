import type { Persona } from "@/types/role";
import { ROLE_LABELS } from "@/types/role";
import type { Deal } from "@/data/deals-data";
import type { PeriodSelection } from "@/data/dashboard-data";
import {
    getDealStageBars,
    getLostDealsSummaryForSelection,
    getPeriodChartDataLive,
    getSalesFunnelCourseBreakdown,
    getSalesFunnelFlow,
    getSalesFunnelHeadline,
    getTeamManagerSummariesLive,
    previousPeriodLabel,
} from "@/data/dashboard-metrics";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Shared shape for every "vs Last Month"-style KPI delta below — pre-formats the text and picks
 * a tone here (where `selection`, and so the correct comparison label, is in scope) rather than
 * pushing that decision into the presentational `report-document.tsx`. `null` (no prior period,
 * e.g. Lifetime) reads as neutral with a "No prior period data" label, matching the dashboard's
 * own `computeChangeText` convention for the same case. */
function formatPctDelta(pct: number | null, selection: PeriodSelection, unit: "%" | "pp" = "%"): { text: string; tone: "positive" | "neutral" | "negative" } {
    if (pct === null) return { text: "No prior period data", tone: "neutral" };
    const rounded = Math.round(pct);
    const text = `${rounded >= 0 ? "+" : ""}${rounded}${unit} ${previousPeriodLabel(selection)}`;
    return { text, tone: rounded === 0 ? "neutral" : rounded > 0 ? "positive" : "negative" };
}

/**
 * Builds and downloads the vector PDF report. Dynamically imports `@react-pdf/renderer` (and
 * the document it renders) so the bundle only pays for pdfkit + its layout engine on the click
 * that actually needs it — this button is admin-only and most sessions never touch it.
 */
export async function generateAndDownloadReport(selection: PeriodSelection, persona: Persona, deals: Deal[]): Promise<void> {
    const [{ pdf }, { DashboardReportDocument }] = await Promise.all([import("@react-pdf/renderer"), import("./report-document")]);

    const scopeLabel = persona.role === "admin" ? "Admin · All Teams" : ROLE_LABELS[persona.role];
    const generatedAt = new Date();

    const data = getPeriodChartDataLive(selection, persona, deals);
    const teamManagerSummaries = persona.role === "admin" ? getTeamManagerSummariesLive(selection, deals) : null;

    const headlineRaw = getSalesFunnelHeadline(selection, persona, deals);
    const unitProgressPercent = headlineRaw.unitTarget === 0 ? 0 : Math.round((headlineRaw.unitsAchieved / headlineRaw.unitTarget) * 100);
    const headline = {
        applicationsSent: headlineRaw.applicationsSent,
        applicationsSentDelta: formatPctDelta(headlineRaw.applicationsSentChangePct, selection),
        conversionPct: headlineRaw.conversionPct,
        conversionDelta: formatPctDelta(headlineRaw.conversionChangePct, selection, "pp"),
        unitsAchieved: headlineRaw.unitsAchieved,
        unitTarget: headlineRaw.unitTarget,
        unitProgressPercent,
        ats: headlineRaw.ats,
        atsDelta: formatPctDelta(headlineRaw.atsChangePct, selection),
    };

    const flow = getSalesFunnelFlow(selection, persona, deals);
    const dealStages = getDealStageBars(selection, persona, deals);
    const courseRows = getSalesFunnelCourseBreakdown(selection, persona, deals);
    const lostDeals = getLostDealsSummaryForSelection(selection, persona, deals);

    const doc = DashboardReportDocument({
        data,
        persona,
        scopeLabel,
        periodLabel: data.periodLabel,
        generatedAt,
        teamManagerSummaries,
        headline,
        flow,
        dealStages,
        courseRows,
        lostDeals,
    });

    const blob = await pdf(doc).toBlob();

    const scopeSlug = slugify(scopeLabel);
    const dateRangeSlug = slugify(data.periodLabel);
    const dateStamp = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
    const filename = `OMS-Dashboard-Report_${scopeSlug}_${dateRangeSlug}_${dateStamp}.pdf`;

    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
}
