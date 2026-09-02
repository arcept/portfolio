import { AdminFunnelAggregateRow, FunnelSection } from "@/components/dashboard/funnel-section";
import { StatCardsRow } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";
import type { PeriodSelection } from "@/data/dashboard-data";
import { RoleProvider } from "@/providers/role-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Persona } from "@/types/role";

/**
 * Isolated, chrome-free renders of single dashboard pieces, for embedding
 * directly (not a screenshot) in the portfolio case study — see main.tsx for
 * how `?embed=` selects this render path instead of the full app. Reuses
 * the real components and data, so any future change to the dashboard
 * shows up here automatically; there is nothing to keep in sync by hand.
 */
export type EmbedViewKey = "admin-funnel" | "team-manager-funnel" | "team-drilldown" | "stat-cards";

const DEFAULT_SELECTION: PeriodSelection = { kind: "preset", id: "this-month" };

// Fixed personas, not the RoleProvider default (always "admin") — the case
// study needs a specific, deterministic scoped view (a real Team Manager's
// own funnel), not whatever a visitor's session happens to be set to.
const EMBED_PERSONAS: Record<EmbedViewKey, Persona> = {
    "admin-funnel": { role: "admin" },
    "team-manager-funnel": { role: "tm", tmId: "ish-kumar" },
    "team-drilldown": { role: "admin" },
    "stat-cards": { role: "admin" },
};

const EMBED_COMPONENTS: Record<EmbedViewKey, () => React.ReactElement> = {
    "admin-funnel": () => <AdminFunnelAggregateRow selection={DEFAULT_SELECTION} />,
    "team-manager-funnel": () => <FunnelSection selection={DEFAULT_SELECTION} />,
    "team-drilldown": () => <TeamDrilldown selection={DEFAULT_SELECTION} />,
    "stat-cards": () => <StatCardsRow selection={DEFAULT_SELECTION} />,
};

// The funnel and stat-card views are bare grids of individually-bordered
// cards with no outer frame of their own, so the wrapper's padding is the
// only breathing room they get. TeamDrilldown renders its own complete card
// (border, radius, background, padding) — wrapping that in more padding
// just adds a visible gap around an already-framed box, so it gets none.
const EMBED_PADDING: Record<EmbedViewKey, string> = {
    "admin-funnel": "p-6",
    "team-manager-funnel": "p-6",
    "team-drilldown": "",
    "stat-cards": "",
};

export const EmbedView = ({ view }: { view: EmbedViewKey }) => {
    const Component = EMBED_COMPONENTS[view];

    return (
        <ThemeProvider defaultTheme="dark">
            <RoleProvider initialPersona={EMBED_PERSONAS[view]}>
                <div className={`bg-primary ${EMBED_PADDING[view]}`}>
                    <Component />
                </div>
            </RoleProvider>
        </ThemeProvider>
    );
};
