import type { Persona } from "@/types/role";

/**
 * Per-role visibility matrix (role-based-data-scoping brief §3), made concrete against the
 * current component set. Kept in one place instead of scattering `persona.role === "..."`
 * checks through every component.
 */
export type VisibleSections = {
    /** Team Managers | Team Leads | BDRs drilldown — 0 means don't render it at all. */
    drilldownColumns: 0 | 2 | 3;
    showBdrSearch: boolean;
    showReportButton: boolean;
};

export function getVisibleSections(persona: Persona): VisibleSections {
    switch (persona.role) {
        case "admin":
            return { drilldownColumns: 3, showBdrSearch: true, showReportButton: true };
        case "tm":
            return { drilldownColumns: 2, showBdrSearch: true, showReportButton: false };
        case "tl":
        case "bdr":
        case "atl":
        default:
            return { drilldownColumns: 0, showBdrSearch: false, showReportButton: false };
    }
}
