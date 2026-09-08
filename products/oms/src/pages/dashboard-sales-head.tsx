import { useState } from "react";
import { AppShell } from "@/components/application/app-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FunnelSection } from "@/components/dashboard/funnel-section";
import { SalesFunnelSection } from "@/components/dashboard/sales-funnel-section";
import { StatCardsRow } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";
import type { PeriodSelection } from "@/data/dashboard-data";
import { usePersona } from "@/providers/role-provider";
import type { Persona } from "@/types/role";

export const DashboardSalesHead = () => {
    const [selection, setSelection] = useState<PeriodSelection>({ kind: "preset", id: "this-month" });
    const { persona } = usePersona();
    // Org-wide by default for Admin; TeamDrilldown (below) can narrow it to a TM/TL/BDR via
    // onScopeChange — everyone else always sees their own scope, no picker needed.
    const [funnelScope, setFunnelScope] = useState<Persona>({ role: "admin" });

    return (
        <AppShell>
            <DashboardHeader selection={selection} onSelectionChange={setSelection} />
            <StatCardsRow selection={selection} />
            <SalesFunnelSection selection={selection} scope={persona.role === "admin" ? funnelScope : persona} />
            <FunnelSection selection={selection} />
            <TeamDrilldown selection={selection} onScopeChange={setFunnelScope} />
        </AppShell>
    );
};
