import { useState } from "react";
import { Badge } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Dot } from "@/components/foundations/dot-icon";
import type { FunnelStage, PeriodSelection } from "@/data/dashboard-data";
import { getPeriodSelectionKey, teamManagers } from "@/data/dashboard-data";
import { getFunnelCohortsLive, getTeamManagerFunnelCardData } from "@/data/dashboard-metrics";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { cx } from "@/utils/cx";
import { FadeOnSelection } from "./stat-cards";
import { TeamManagerFunnelCard } from "./team-manager-funnel-card";

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
    const { deals } = useDeals();
    const cohorts = getFunnelCohortsLive(selection, persona, deals);
    const isAggregateHeading = persona.role === "admin";
    const selectionKey = getPeriodSelectionKey(selection);
    // Admin's own org-wide aggregate row (`cohorts[0]`) isn't rendered here anymore — the section
    // header below already covers "aggregate metrics across all cohorts" at a glance, and the old
    // generic 4-card grid it used was the one row that didn't get the redesigned card (Figma node
    // 609:10888 is explicitly per-Team-Manager), so it just read as a leftover (Manik's call,
    // 2026-09-11: drop it rather than keep it in its old style). Still available standalone via
    // `AdminFunnelAggregateRow` below for the case-study embed's own "admin-funnel" key.
    const rows = isAggregateHeading ? cohorts.slice(1) : cohorts;

    return (
        <section className="flex flex-col gap-6">
            {isAggregateHeading && (
                <div className="px-4 pt-6">
                    <h2 className="text-display-xs font-bold text-primary">Team Performance</h2>
                    <p className="text-sm text-tertiary">Aggregate metrics across all cohorts</p>
                </div>
            )}

            {rows.map((cohort, index) => {
                // Every row is now a Team Manager row for the admin persona (the aggregate row is
                // filtered out above), so it always gets the redesigned card — self-contained (own
                // name/badge header, no Overview/Performance toggle), hence the header block below
                // is skipped for it.
                const tm = isAggregateHeading ? teamManagers.find((t) => t.id === cohort.id) : undefined;

                return (
                    <div key={cohort.id} className={cx("flex flex-col gap-4", index > 0 && "border-t border-secondary pt-6")}>
                        {!tm && (
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h3 className="text-md font-semibold text-primary">{cohort.name}</h3>
                                <OverviewPerformanceToggle id={cohort.id} />
                            </div>
                        )}

                        {tm ? (
                            <FadeOnSelection selectionKey={`${cohort.id}-${selectionKey}`} className="flex flex-col">
                                <TeamManagerFunnelCard data={getTeamManagerFunnelCardData(selection, tm, deals)} />
                            </FadeOnSelection>
                        ) : (
                            <FadeOnSelection selectionKey={`${cohort.id}-${selectionKey}`} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {cohort.stages.map((stage) => (
                                    <FunnelStageCard key={stage.label} stage={stage} />
                                ))}
                            </FadeOnSelection>
                        )}
                    </div>
                );
            })}
        </section>
    );
};

/** Just the first ("aggregate") row of the admin funnel — the header plus
 * one 4-card grid — without the per-Team-Manager cohorts FunnelSection also
 * renders below it for the admin persona. Used by the embed view so the
 * case study can show exactly the Admin Funnel row in isolation, rather
 * than the whole admin sweep across every team. */
export const AdminFunnelAggregateRow = ({ selection }: { selection: PeriodSelection }) => {
    const { deals } = useDeals();
    const [aggregate] = getFunnelCohortsLive(selection, { role: "admin" }, deals);
    const selectionKey = getPeriodSelectionKey(selection);

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-display-xs font-bold text-primary">ADMIN Funnel — Sales Head</h2>
                    <p className="text-sm text-tertiary">Aggregate metrics across all cohorts</p>
                </div>
                <OverviewPerformanceToggle id="admin-funnel" />
            </div>

            <FadeOnSelection selectionKey={selectionKey} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {aggregate.stages.map((stage) => (
                    <FunnelStageCard key={stage.label} stage={stage} />
                ))}
            </FadeOnSelection>
        </section>
    );
};
