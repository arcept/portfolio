import { useState } from "react";
import { useNavigate } from "react-router";
import { AppShell } from "@/components/application/app-shell";
import { ConversionCard } from "@/components/dashboard/conversion-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FunnelSection } from "@/components/dashboard/funnel-section";
import { SalesFunnelSection } from "@/components/dashboard/sales-funnel-section";
import { BookedRevenueCard, DealStagesCard, RealisedAndTicketCards } from "@/components/dashboard/stat-cards";
import { TeamDrilldown } from "@/components/dashboard/team-drilldown";
import type { PeriodSelection } from "@/data/dashboard-data";
import { usePersona } from "@/providers/role-provider";
import type { Persona } from "@/types/role";

export const DashboardSalesHead = () => {
    const [selection, setSelection] = useState<PeriodSelection>({ kind: "preset", id: "this-month" });
    const { persona } = usePersona();
    const navigate = useNavigate();
    // Org-wide by default for Admin; TeamDrilldown (below) can narrow it to a TM/TL/BDR via
    // onScopeChange — everyone else always sees their own scope, no picker needed.
    const [funnelScope, setFunnelScope] = useState<Persona>({ role: "admin" });
    // Lifted the same way as `funnelScope` above: `DashboardHeader`'s "Search by BDR name" field
    // and `TeamDrilldown`'s own "Search BDR..." field are two entry points into one search.
    const [bdrSearch, setBdrSearch] = useState("");

    return (
        <AppShell>
            <DashboardHeader selection={selection} onSelectionChange={setSelection} search={bdrSearch} onSearchChange={setBdrSearch} />

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1fr_1.44fr]">
                <BookedRevenueCard selection={selection} />
                <SalesFunnelSection selection={selection} scope={persona.role === "admin" ? funnelScope : persona} />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr] 2xl:grid-cols-[0.78fr_1fr_1.26fr]">
                <RealisedAndTicketCards selection={selection} />
                <ConversionCard selection={selection} onCourseClick={(courseId) => navigate(`/deals?course=${courseId}`)} />
                <DealStagesCard selection={selection} />
            </div>

            <FunnelSection selection={selection} />
            <TeamDrilldown selection={selection} onScopeChange={setFunnelScope} search={bdrSearch} onSearchChange={setBdrSearch} />
        </AppShell>
    );
};
