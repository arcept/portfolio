import { useState } from "react";
import { AppShell } from "@/components/application/app-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FunnelSection } from "@/components/dashboard/funnel-section";
import { StatCardsRow } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";
import type { PeriodSelection } from "@/data/dashboard-data";

export const DashboardSalesHead = () => {
    const [selection, setSelection] = useState<PeriodSelection>({ kind: "preset", id: "this-month" });

    return (
        <AppShell>
            <DashboardHeader selection={selection} onSelectionChange={setSelection} />
            <StatCardsRow selection={selection} />
            <FunnelSection selection={selection} />
            <TeamDrilldown selection={selection} />
        </AppShell>
    );
};
