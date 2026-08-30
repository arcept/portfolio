import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { FunnelSection } from "@/components/dashboard/funnel-section";
import { StatCardsRow } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";

export const DashboardSalesHead = () => {
    return (
        <div className="flex min-h-dvh bg-primary">
            <DashboardSidebar />

            <main className="min-w-0 flex-1 px-4 py-8 lg:px-8">
                <div className="mx-auto flex max-w-360 flex-col gap-8">
                    <DashboardHeader />
                    <StatCardsRow />
                    <FunnelSection />
                    <TeamDrilldown />
                </div>
            </main>
        </div>
    );
};
