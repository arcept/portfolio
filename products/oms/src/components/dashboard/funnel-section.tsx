import { useState } from "react";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Badge } from "@/components/base/badges/badges";
import { Dot } from "@/components/foundations/dot-icon";
import { cx } from "@/utils/cx";
import { usePersona } from "@/providers/role-provider";
import type { FunnelStage, PeriodSelection } from "@/data/dashboard-data";
import { getFunnelCohorts, getSelectedPeriodChartData, scalePeriodDataForPersona } from "@/data/dashboard-data";

export const FunnelStageCard = ({ stage }: { stage: FunnelStage }) => (
    <div className="flex flex-1 flex-col gap-5 rounded-xl border border-secondary bg-primary p-4">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary">{stage.label}</span>
            <Badge color="gray" type="modern" size="sm">
                {stage.fraction}
            </Badge>
        </div>

        <div className="flex items-baseline gap-1">
            <span className="text-display-xs font-semibold text-primary">{stage.value}</span>
            {stage.denominator !== undefined && <span className="text-lg font-medium text-tertiary">/ {stage.denominator}</span>}
        </div>
        {stage.caption && <p className="-mt-3 text-sm text-tertiary">{stage.caption}</p>}

        <ul className="flex flex-col gap-2">
            {stage.breakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-tertiary">
                        <Dot size="sm" className={item.dotClassName} />
                        {item.label}
                    </span>
                    <span className="font-mono text-[13px] text-secondary">{item.count}</span>
                </li>
            ))}
        </ul>
    </div>
);

export const OverviewPerformanceToggle = ({ id }: { id: string }) => {
    const [view, setView] = useState("overview");

    return (
        <ButtonGroup selectedKeys={[view]} onSelectionChange={(keys) => setView(Array.from(keys)[0] as string)} size="sm" aria-label={`${id} view`}>
            <ButtonGroupItem id="overview">Overview</ButtonGroupItem>
            <ButtonGroupItem id="performance">Performance</ButtonGroupItem>
        </ButtonGroup>
    );
};

export const FunnelSection = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const data = scalePeriodDataForPersona(getSelectedPeriodChartData(selection), persona);
    const cohorts = getFunnelCohorts(data, persona);
    const isAggregateHeading = persona.role === "admin";

    return (
        <section className="flex flex-col gap-6">
            {isAggregateHeading && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-display-xs font-bold text-primary">ADMIN Funnel — Sales Head</h2>
                        <p className="text-sm text-tertiary">Aggregate metrics across all cohorts</p>
                    </div>
                    <OverviewPerformanceToggle id="admin-funnel" />
                </div>
            )}

            {cohorts.map((cohort, index) => (
                <div key={cohort.id} className={cx("flex flex-col gap-4", index > 0 && "border-t border-secondary pt-6")}>
                    {/*
                     * The aggregate row's Figma name/toggle header ("ADMIN Funnel — Sales Head") is
                     * identical to the section header above — Manik flagged this as a likely WIP
                     * duplicate in the file, so it's skipped here for the aggregate row only.
                     */}
                    {(!isAggregateHeading || index > 0) && (
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h3 className="text-md font-semibold text-primary">{cohort.name}</h3>
                            <OverviewPerformanceToggle id={cohort.id} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cohort.stages.map((stage) => (
                            <FunnelStageCard key={stage.label} stage={stage} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
};

/** Just the first ("aggregate") row of the admin funnel — the header plus
 * one 4-card grid — without the per-Team-Manager cohorts FunnelSection also
 * renders below it for the admin persona. Used by the embed view so the
 * case study can show exactly the Admin Funnel row in isolation, rather
 * than the whole admin sweep across every team. */
export const AdminFunnelAggregateRow = ({ selection }: { selection: PeriodSelection }) => {
    const data = scalePeriodDataForPersona(getSelectedPeriodChartData(selection), { role: "admin" });
    const [aggregate] = getFunnelCohorts(data, { role: "admin" });

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-display-xs font-bold text-primary">ADMIN Funnel — Sales Head</h2>
                    <p className="text-sm text-tertiary">Aggregate metrics across all cohorts</p>
                </div>
                <OverviewPerformanceToggle id="admin-funnel" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {aggregate.stages.map((stage) => (
                    <FunnelStageCard key={stage.label} stage={stage} />
                ))}
            </div>
        </section>
    );
};
