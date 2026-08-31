import type { Persona } from "@/types/role";
import { ROLE_LABELS } from "@/types/role";
import type { PeriodChartData } from "@/data/dashboard-data";
import { getFunnelCohorts, getTeamManagerSummaries } from "@/data/dashboard-data";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Builds and downloads the vector PDF report. Dynamically imports `@react-pdf/renderer` (and
 * the document it renders) so the bundle only pays for pdfkit + its layout engine on the click
 * that actually needs it — this button is admin-only and most sessions never touch it.
 */
export async function generateAndDownloadReport(data: PeriodChartData, persona: Persona): Promise<void> {
    const [{ pdf }, { DashboardReportDocument }] = await Promise.all([import("@react-pdf/renderer"), import("./report-document")]);

    const scopeLabel = persona.role === "admin" ? "Admin · All Teams" : ROLE_LABELS[persona.role];
    const generatedAt = new Date();

    const funnelStages = getFunnelCohorts(data, persona)[0].stages;
    const teamManagerSummaries = persona.role === "admin" ? getTeamManagerSummaries(data) : null;

    const doc = DashboardReportDocument({
        data,
        persona,
        scopeLabel,
        periodLabel: data.periodLabel,
        generatedAt,
        funnelStages,
        teamManagerSummaries,
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
