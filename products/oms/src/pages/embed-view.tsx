import { AdminFunnelAggregateRow, FunnelSection } from "@/components/dashboard/funnel-section";
import { ConversionCard } from "@/components/dashboard/conversion-card";
import { SalesFunnelSection } from "@/components/dashboard/sales-funnel-section";
import { BookedRevenueCard, DealStagesCard, RealisedRevenueCard } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";
import type { PeriodSelection } from "@/data/dashboard-data";
import { DealsProvider } from "@/providers/deals-provider";
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
export type EmbedViewKey = "admin-funnel" | "team-manager-funnel" | "team-drilldown" | "stat-cards" | "sales-funnel";

const DEFAULT_SELECTION: PeriodSelection = { kind: "preset", id: "this-month" };

// Fixed personas, not the RoleProvider default (always "admin") — the case
// study needs a specific, deterministic scoped view (a real Team Manager's
// own funnel), not whatever a visitor's session happens to be set to.
const EMBED_PERSONAS: Record<EmbedViewKey, Persona> = {
    "admin-funnel": { role: "admin" },
    "team-manager-funnel": { role: "tm", tmId: "ish-kumar" },
    "team-drilldown": { role: "admin" },
    "stat-cards": { role: "admin" },
    "sales-funnel": { role: "admin" },
};

// "stat-cards" bundles everything the old single-grid `StatCardsRow` used to show — now split
// across the Booked card and the Realised/Conversion/Deal Stages row (per the Home redesign) —
// into one self-contained embeddable block, so this key's content stays equivalent.
const StatCardsBundle = () => (
    <div className="flex flex-col gap-4">
        <BookedRevenueCard selection={DEFAULT_SELECTION} />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr] 2xl:grid-cols-[0.78fr_1fr_594px]">
            <RealisedRevenueCard selection={DEFAULT_SELECTION} />
            <ConversionCard selection={DEFAULT_SELECTION} />
            <DealStagesCard selection={DEFAULT_SELECTION} />
        </div>
    </div>
);

const EMBED_COMPONENTS: Record<EmbedViewKey, () => React.ReactElement> = {
    "admin-funnel": () => <AdminFunnelAggregateRow selection={DEFAULT_SELECTION} />,
    "team-manager-funnel": () => <FunnelSection selection={DEFAULT_SELECTION} />,
    "team-drilldown": () => <TeamDrilldown selection={DEFAULT_SELECTION} />,
    "stat-cards": () => <StatCardsBundle />,
    "sales-funnel": () => <SalesFunnelSection selection={DEFAULT_SELECTION} scope={{ role: "admin" }} />,
};

// The funnel and stat-card views are bare grids of individually-bordered
// cards with no outer frame of their own, so the wrapper's padding is the
// only breathing room they get. TeamDrilldown/SalesFunnelSection render
// their own complete card (border, radius, background, padding) — wrapping
// that in more padding just adds a visible gap around an already-framed
// box, so they get none.
const EMBED_PADDING: Record<EmbedViewKey, string> = {
    "admin-funnel": "p-6",
    "team-manager-funnel": "p-6",
    "team-drilldown": "",
    "stat-cards": "",
    "sales-funnel": "",
};

export const EmbedView = ({ view }: { view: EmbedViewKey }) => {
    const Component = EMBED_COMPONENTS[view];

    return (
        <ThemeProvider defaultTheme="dark">
            <RoleProvider initialPersona={EMBED_PERSONAS[view]}>
                <DealsProvider>
                    <div className={`bg-primary ${EMBED_PADDING[view]}`}>
                        <Component />
                    </div>
                </DealsProvider>
            </RoleProvider>
        </ThemeProvider>
    );
};
