import { useState } from "react";
import { SearchLg, SwitchVertical01, Users01 } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Input } from "@/components/base/input/input";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { cx } from "@/utils/cx";
import type { TeamManager } from "@/data/dashboard-data";
import { teamManagers } from "@/data/dashboard-data";

const TeamManagerRow = ({ manager, isSelected, onSelect }: { manager: TeamManager; isSelected: boolean; onSelect: () => void }) => (
    <button
        type="button"
        onClick={onSelect}
        className={cx(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2",
            isSelected && "bg-active",
        )}
    >
        <Avatar size="xs" placeholderIcon={Users01} />
        <span className="shrink-0 text-sm font-medium text-secondary">{manager.name}</span>
        <span className="mx-2 h-px flex-1 border-t border-dashed border-secondary" />
        <span className="shrink-0 font-mono text-sm text-secondary">{manager.amount}</span>
        <span className="w-8 shrink-0 text-right text-sm text-tertiary">{manager.changePercent}</span>
    </button>
);

const DrilldownColumn = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="flex flex-1 flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-quaternary uppercase">{title}</p>
        {children}
    </div>
);

const WaitingForSelection = ({ label }: { label: string }) => (
    <EmptyState size="sm" className="mx-auto max-w-none py-6">
        <EmptyState.Content>
            <EmptyState.Description>{label}</EmptyState.Description>
        </EmptyState.Content>
    </EmptyState>
);

export const TeamDrilldown = () => {
    const [selectedManagerId, setSelectedManagerId] = useState<string>(teamManagers[0].id);

    return (
        <div className="flex flex-col gap-6 rounded-xl border border-secondary bg-primary p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <SwitchVertical01 className="size-4 text-fg-quaternary" />
                    Team Managers → Team Leads → BDRs
                </div>
                <Input size="sm" aria-label="Search BDR" placeholder="Search BDR..." icon={SearchLg} className="max-w-50" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <DrilldownColumn title="Team Managers">
                    <div className="flex flex-col gap-1">
                        {teamManagers.map((manager) => (
                            <TeamManagerRow
                                key={manager.id}
                                manager={manager}
                                isSelected={manager.id === selectedManagerId}
                                onSelect={() => setSelectedManagerId(manager.id)}
                            />
                        ))}
                    </div>
                </DrilldownColumn>

                <DrilldownColumn title="Team Leads">
                    <WaitingForSelection label="Select a Team Manager" />
                </DrilldownColumn>

                <DrilldownColumn title="BDRs">
                    <WaitingForSelection label="Select a Team Lead" />
                </DrilldownColumn>
            </div>

            <div className="border-t border-secondary pt-6">
                <EmptyState size="sm" className="mx-auto max-w-none">
                    <EmptyState.Content>
                        <EmptyState.Description>Select a BDR above to view their funnel.</EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            </div>
        </div>
    );
};
