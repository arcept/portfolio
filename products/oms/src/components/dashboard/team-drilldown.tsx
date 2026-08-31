import { useMemo, useState } from "react";
import { SearchLg, SwitchVertical01, Users01 } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Input } from "@/components/base/input/input";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { cx } from "@/utils/cx";
import { usePersona } from "@/providers/role-provider";
import { getVisibleSections } from "@/utils/role-visibility";
import type { OrgBdr, OrgTeamLead, OrgTeamManager, PeriodSelection } from "@/data/dashboard-data";
import {
    TM_TOTAL_WEIGHT,
    bdrs,
    getFunnelCohorts,
    getSelectedPeriodChartData,
    scaleForWeight,
    scalePeriodDataForPersona,
    teamLeads,
    teamManagers,
} from "@/data/dashboard-data";
import { FunnelStageCard } from "./funnel-section";

type Row = { id: string; name: string; amount: string; changePercent: string };

/** Rows always show a real, absolute org-wide rupee share — walked fresh from `orgWideData`
 * through the node's actual ancestor weights, regardless of which persona is currently
 * browsing (a TM's own TLs still show real rupees, not a total re-based to their own 100%). */
const toRow = (node: { id: string; name: string }, absoluteAmount: number): Row => ({
    id: node.id,
    name: node.name,
    amount: `₹${(absoluteAmount / 100_000).toFixed(2)} L`,
    changePercent: "0%",
});

const RowButton = ({ row, isSelected, onSelect }: { row: Row; isSelected: boolean; onSelect: () => void }) => (
    <button
        type="button"
        onClick={onSelect}
        className={cx(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2",
            isSelected && "bg-active",
        )}
    >
        <Avatar size="xs" placeholderIcon={Users01} />
        <span className="shrink-0 text-sm font-medium text-secondary">{row.name}</span>
        <span className="mx-2 h-px flex-1 border-t border-dashed border-secondary" />
        <span className="shrink-0 font-mono text-sm text-secondary">{row.amount}</span>
        <span className="w-8 shrink-0 text-right text-sm text-tertiary">{row.changePercent}</span>
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

export const TeamDrilldown = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { drilldownColumns, showBdrSearch } = getVisibleSections(persona);

    const orgWideData = getSelectedPeriodChartData(selection);

    // Absolute-rupee walkers — always start from org-wide, so a node's amount is the same
    // real number no matter which persona is currently browsing the tree.
    const tmShareOf = (tmId: string): number => {
        const tm = teamManagers.find((t) => t.id === tmId);
        return tm ? scaleForWeight(orgWideData.bookedTotal, tm.weight, TM_TOTAL_WEIGHT) : 0;
    };
    const tlShareOf = (tl: OrgTeamLead): number => {
        const siblingTotal = teamLeads.filter((t) => t.tmId === tl.tmId).reduce((sum, t) => sum + t.weight, 0);
        return scaleForWeight(tmShareOf(tl.tmId), tl.weight, siblingTotal);
    };
    const bdrShareOf = (bdr: OrgBdr): number => {
        const tl = teamLeads.find((t) => t.id === bdr.tlId);
        if (!tl) return 0;
        const siblingTotal = bdrs.filter((b) => b.tlId === bdr.tlId).reduce((sum, b) => sum + b.weight, 0);
        return scaleForWeight(tlShareOf(tl), bdr.weight, siblingTotal);
    };

    // Admin's own TM column is real TMs; a TM persona has no TM column at all — their "top"
    // level is their own TLs directly, so `ownTmId` anchors everything below it.
    const ownTmId = persona.role === "tm" ? persona.tmId : undefined;

    const [selectedTmId, setSelectedTmId] = useState<string | undefined>(drilldownColumns === 3 ? teamManagers[0]?.id : ownTmId);
    const [selectedTlId, setSelectedTlId] = useState<string | undefined>(undefined);
    const [selectedBdrId, setSelectedBdrId] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState("");

    const activeTmId = drilldownColumns === 3 ? selectedTmId : ownTmId;
    const activeTm = teamManagers.find((t) => t.id === activeTmId);

    const tlSiblings = useMemo(() => teamLeads.filter((tl) => tl.tmId === activeTmId), [activeTmId]);
    const activeTl = teamLeads.find((tl) => tl.id === selectedTlId);

    const bdrSiblings = useMemo(() => bdrs.filter((b) => b.tlId === selectedTlId), [selectedTlId]);

    // Search scans every BDR in scope (this TM's tree for a TM persona, org-wide for Admin),
    // independent of the current TL selection, so a match can be found without drilling down first.
    const searchableBdrs = useMemo(() => (drilldownColumns === 3 ? bdrs : bdrs.filter((b) => b.tmId === ownTmId)), [drilldownColumns, ownTmId]);
    const searchResults = search.trim() ? searchableBdrs.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase())) : null;

    if (drilldownColumns === 0) return null;

    const selectBdr = (bdr: OrgBdr) => {
        setSelectedTlId(bdr.tlId);
        setSelectedBdrId(bdr.id);
        setSearch("");
    };

    const selectedBdr = bdrs.find((b) => b.id === selectedBdrId);
    const detailCohort = selectedBdr
        ? (() => {
              const bdrPersona = { role: "bdr" as const, tmId: selectedBdr.tmId, tlId: selectedBdr.tlId, bdrId: selectedBdr.id };
              return getFunnelCohorts(scalePeriodDataForPersona(orgWideData, bdrPersona), bdrPersona)[0];
          })()
        : null;

    return (
        <div className="flex flex-col gap-6 rounded-xl border border-secondary bg-primary p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <SwitchVertical01 className="size-4 text-fg-quaternary" />
                    {drilldownColumns === 3 ? "Team Managers → Team Leads → BDRs" : "Team Leads → BDRs"}
                </div>
                {showBdrSearch && (
                    <Input
                        size="sm"
                        aria-label="Search BDR"
                        placeholder="Search BDR..."
                        icon={SearchLg}
                        className="max-w-50"
                        value={search}
                        onChange={setSearch}
                    />
                )}
            </div>

            <div className={cx("grid grid-cols-1 gap-6", drilldownColumns === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
                {drilldownColumns === 3 && (
                    <DrilldownColumn title="Team Managers">
                        <div className="flex flex-col gap-1">
                            {teamManagers.map((tm: OrgTeamManager) => (
                                <RowButton
                                    key={tm.id}
                                    row={toRow(tm, tmShareOf(tm.id))}
                                    isSelected={tm.id === selectedTmId}
                                    onSelect={() => {
                                        setSelectedTmId(tm.id);
                                        setSelectedTlId(undefined);
                                        setSelectedBdrId(undefined);
                                    }}
                                />
                            ))}
                        </div>
                    </DrilldownColumn>
                )}

                <DrilldownColumn title="Team Leads">
                    {activeTm ? (
                        <div className="flex flex-col gap-1">
                            {tlSiblings.map((tl: OrgTeamLead) => (
                                <RowButton
                                    key={tl.id}
                                    row={toRow(tl, tlShareOf(tl))}
                                    isSelected={tl.id === selectedTlId}
                                    onSelect={() => {
                                        setSelectedTlId(tl.id);
                                        setSelectedBdrId(undefined);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <WaitingForSelection label="Select a Team Manager" />
                    )}
                </DrilldownColumn>

                <DrilldownColumn title="BDRs">
                    {searchResults ? (
                        searchResults.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {searchResults.map((bdr) => (
                                    <RowButton key={bdr.id} row={toRow(bdr, bdrShareOf(bdr))} isSelected={bdr.id === selectedBdrId} onSelect={() => selectBdr(bdr)} />
                                ))}
                            </div>
                        ) : (
                            <WaitingForSelection label="No BDRs match your search" />
                        )
                    ) : activeTl ? (
                        <div className="flex flex-col gap-1">
                            {bdrSiblings.map((bdr) => (
                                <RowButton key={bdr.id} row={toRow(bdr, bdrShareOf(bdr))} isSelected={bdr.id === selectedBdrId} onSelect={() => selectBdr(bdr)} />
                            ))}
                        </div>
                    ) : (
                        <WaitingForSelection label="Select a Team Lead" />
                    )}
                </DrilldownColumn>
            </div>

            <div className="border-t border-secondary pt-6">
                {detailCohort ? (
                    <div className="flex flex-col gap-4">
                        <h4 className="text-sm font-semibold text-primary">{detailCohort.name}</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {detailCohort.stages.map((stage) => (
                                <FunnelStageCard key={stage.label} stage={stage} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState size="sm" className="mx-auto max-w-none">
                        <EmptyState.Content>
                            <EmptyState.Description>Select a BDR above to view their funnel.</EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                )}
            </div>
        </div>
    );
};
