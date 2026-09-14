import { useState } from "react";
import { MemoryRouter } from "react-router";
import { AdminFunnelAggregateRow, FunnelSection } from "@/components/dashboard/funnel-section";
import { ConversionCard } from "@/components/dashboard/conversion-card";
import { SalesFunnelSection } from "@/components/dashboard/sales-funnel-section";
import { BookedRevenueCard, DealStagesCard, RealisedRevenueCard } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";
import { TeamManagerFunnelCard } from "@/components/dashboard/team-manager-funnel-card";
import { PaymentPlanSectionCard } from "@/components/deals/payment-plan-section-card";
import type { PeriodSelection } from "@/data/dashboard-data";
import { teamManagers } from "@/data/dashboard-data";
import { getTeamManagerFunnelCardData } from "@/data/dashboard-metrics";
import { DEALS } from "@/data/deals-data";
import { formatDate, MilestoneTimeline } from "@/pages/deal-detail";
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
export type EmbedViewKey =
    | "admin-funnel"
    | "team-manager-funnel"
    | "team-drilldown"
    | "stat-cards"
    | "sales-funnel"
    | "team-manager-card"
    | "offer-payment-plan"
    | "offer-milestones"
    | "deal-stages"
    | "realised-conversion"
    | "booked-revenue";

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
    "team-manager-card": { role: "admin" },
    "offer-payment-plan": { role: "admin" },
    "offer-milestones": { role: "admin" },
    "deal-stages": { role: "admin" },
    "realised-conversion": { role: "admin" },
    "booked-revenue": { role: "admin" },
};

// The one Team Manager the case study already scopes "team-manager-funnel" to — reused here so
// the new per-manager card (System §04's "Team performance, named per manager") shows the same
// person. `id` stayed "ish-kumar" through a display-name rename; "Arjun Khurana" is who actually
// shows up on screen.
const CASE_STUDY_TM = teamManagers.find((tm) => tm.id === "ish-kumar")!;

// One deterministic seed deal for the Offer Flow embeds (§06) — a deal with a plan already built
// and a real activity history, so the payment-plan card renders its "Created" state (not the
// empty "not-created" one) and the milestone rail/activity log below actually have something to
// show. `DEALS` is generated from a fixed seed (deals-data.ts: `seededRandom(770101)`), so this
// resolves to the same deal on every build.
const OFFER_FLOW_DEAL = DEALS.find((d) => d.installments.length > 0 && d.activityLog.length >= 6) ?? DEALS[0];

// "Two histories, on purpose" (§06 pull-quote): the milestone rail and the activity log read the
// same underlying `activityLog` two different ways. Lifted out of deal-detail.tsx's right rail
// (MILESTONES + ACTIVITY LOG panels) rather than iframing the whole deal-detail page, which also
// carries an unrelated left rail (identity fields, HubSpot/status actions) the case study isn't
// about.
const OfferMilestonesPanel = () => (
    <div className="flex flex-col gap-8 rounded-2xl border border-secondary bg-primary p-6">
        <div className="flex flex-col gap-6">
            <h4 className="font-mono text-sm text-tertiary">MILESTONES</h4>
            <MilestoneTimeline deal={OFFER_FLOW_DEAL} />
        </div>
        <div className="flex flex-col gap-6">
            <h4 className="font-mono text-sm text-tertiary">ACTIVITY LOG</h4>
            <div className="flex flex-col gap-4 border-l border-secondary_alt pl-4">
                {[...OFFER_FLOW_DEAL.activityLog]
                    .reverse()
                    .map((entry, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 font-mono text-[10px] text-placeholder">
                                <span>{formatDate(entry.ts)}</span>
                                <span>{entry.ts.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                            </div>
                            <span className={`text-xs text-tertiary ${entry.reason ? "font-semibold" : ""}`}>{entry.text}</span>
                            {entry.reason && <span className="text-xs text-tertiary italic">Reason: {entry.reason}</span>}
                        </div>
                    ))}
            </div>
        </div>
    </div>
);

// Standalone render of the same per-manager card System §04 shows inline in the admin funnel —
// defaults expanded (rather than mirroring the dashboard's collapsed-by-default state) since the
// case study has no adjacent click to reveal it.
const TeamManagerCardEmbed = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <TeamManagerFunnelCard
            data={getTeamManagerFunnelCardData(DEFAULT_SELECTION, CASE_STUDY_TM, DEALS)}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((v) => !v)}
        />
    );
};

// "stat-cards" bundles everything the old single-grid `StatCardsRow` used to show — now split
// across the Booked card and the Realised/Conversion/Deal Stages row (per the Home redesign) —
// into one self-contained embeddable block, so this key's content stays equivalent. Kept around
// even though System §04 now embeds the three below individually (Figma presents them as
// separate beats, not one bundle) — this key isn't referenced from the case study anymore, but
// nothing else needs it removed either.
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

// System §04 shows Realised and Conversion side by side as one beat (Figma: ~308px + 380px
// columns), separate from Deal Stages and Booked, which each get their own standalone beat.
const RealisedConversionRow = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr]">
        <RealisedRevenueCard selection={DEFAULT_SELECTION} />
        <ConversionCard selection={DEFAULT_SELECTION} />
    </div>
);

const EMBED_COMPONENTS: Record<EmbedViewKey, () => React.ReactElement> = {
    "admin-funnel": () => <AdminFunnelAggregateRow selection={DEFAULT_SELECTION} />,
    "team-manager-funnel": () => <FunnelSection selection={DEFAULT_SELECTION} />,
    "team-drilldown": () => <TeamDrilldown selection={DEFAULT_SELECTION} />,
    "stat-cards": () => <StatCardsBundle />,
    "sales-funnel": () => <SalesFunnelSection selection={DEFAULT_SELECTION} scope={{ role: "admin" }} />,
    "team-manager-card": () => <TeamManagerCardEmbed />,
    "offer-payment-plan": () => <PaymentPlanSectionCard deal={OFFER_FLOW_DEAL} />,
    "offer-milestones": () => <OfferMilestonesPanel />,
    // Deal Stages and Booked Revenue both size an inner element off their own card's height
    // (Deal Stages measures its bar track via ResizeObserver; Booked's chart fills a flex-grow
    // wrapper) — on the real dashboard that height comes from a stretched grid row. Standalone,
    // neither card has one, so each gets an explicit height here matching what it'd get there.
    "deal-stages": () => (
        <div style={{ height: 320 }}>
            <DealStagesCard selection={DEFAULT_SELECTION} />
        </div>
    ),
    "realised-conversion": () => <RealisedConversionRow />,
    "booked-revenue": () => <BookedRevenueCard selection={DEFAULT_SELECTION} />,
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
    "team-manager-card": "",
    "offer-payment-plan": "",
    "offer-milestones": "",
    "deal-stages": "",
    "realised-conversion": "",
    "booked-revenue": "",
};

export const EmbedView = ({ view }: { view: EmbedViewKey }) => {
    const Component = EMBED_COMPONENTS[view];

    return (
        // Some embedded components (e.g. SalesFunnelSection) call `useNavigate`/`useLocation` for
        // interactions that are real in the full app (jumping to a filtered deals list) but inert
        // here — there's no page for them to land on inside a bare embed. A `MemoryRouter` gives
        // those hooks the context they need without touching the iframe's actual URL, the way a
        // `HashRouter` would.
        <MemoryRouter>
            <ThemeProvider defaultTheme="dark">
                <RoleProvider initialPersona={EMBED_PERSONAS[view]}>
                    <DealsProvider>
                        <div className={`bg-primary ${EMBED_PADDING[view]}`}>
                            <Component />
                        </div>
                    </DealsProvider>
                </RoleProvider>
            </ThemeProvider>
        </MemoryRouter>
    );
};
