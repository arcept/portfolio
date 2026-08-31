import { Tooltip } from "@/components/base/tooltip/tooltip";
import { bdrs, teamLeads, teamManagers } from "@/data/dashboard-data";

/** One "Assigned" column showing the LC's first name, with the full LC / TL / TM chain on
 * hover — replaces the legacy Figma's four separate assignee columns (the documented P1-3 fix:
 * the four columns ate half the table's width for information only occasionally needed). */
export const AssigneeCell = ({ bdrId }: { bdrId: string }) => {
    const bdr = bdrs.find((b) => b.id === bdrId);
    const tl = teamLeads.find((t) => t.id === bdr?.tlId);
    const tm = teamManagers.find((t) => t.id === bdr?.tmId);

    if (!bdr) return <span className="text-sm text-tertiary">—</span>;

    return (
        <Tooltip
            title={
                <div className="flex flex-col gap-1">
                    <Row label="LC" value={bdr.name} />
                    {tl && <Row label="TL" value={tl.name} />}
                    {tm && <Row label="TM" value={tm.name} />}
                </div>
            }
            placement="top"
        >
            <span className="cursor-default text-sm font-medium text-secondary underline decoration-dotted underline-offset-2">{bdr.name.split(" ")[0]}</span>
        </Tooltip>
    );
};

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className="w-6 shrink-0 font-semibold text-tooltip-supporting-text">{label}</span>
        <span className="text-white">{value}</span>
    </div>
);
