import { Select } from "@/components/base/select/select";
import { usePersona } from "@/providers/role-provider";
import type { Role } from "@/types/role";
import { listAllBdrs, listAllTeamLeads, teamManagers } from "@/data/dashboard-data";

const ROLE_OPTIONS: { id: Role; label: string }[] = [
    { id: "admin", label: "Admin" },
    { id: "tm", label: "Team Manager" },
    { id: "tl", label: "Team Lead" },
    { id: "bdr", label: "BDR" },
];

// Capped to a couple of representative names per level rather than the full org (3 TMs / 6 TLs
// / 21 BDRs) — this is a "preview as" demo control, not a real account switcher, so it doesn't
// need to enumerate everyone the way the in-app Team Drilldown does.
const PREVIEW_OPTION_LIMIT = 2;
const curatedTeamManagers = teamManagers.slice(0, PREVIEW_OPTION_LIMIT);
const curatedTeamLeads = listAllTeamLeads().slice(0, PREVIEW_OPTION_LIMIT);
const curatedBdrs = listAllBdrs().slice(0, PREVIEW_OPTION_LIMIT);

/**
 * Same "same account, different lens" technique the original Figma mocks used for role
 * preview, made concrete against real tree data instead of four fixed screenshots. Presentation
 * -layer only — this is `persona` React state, not access control (see the role-based-data-
 * scoping brief's caveat); it exists to demonstrate the product's actual role-scoped IA.
 */
export const PreviewAsSwitcher = () => {
    const { persona, setPersona } = usePersona();

    const personOptions =
        persona.role === "tm"
            ? curatedTeamManagers.map((tm) => ({ id: tm.id, label: tm.name }))
            : persona.role === "tl"
              ? curatedTeamLeads.map((tl) => ({ id: tl.id, label: tl.label }))
              : persona.role === "bdr" || persona.role === "atl"
                ? curatedBdrs.map((b) => ({ id: b.id, label: b.label }))
                : [];

    const selectedPersonId = persona.role === "tm" ? persona.tmId : persona.role === "tl" ? persona.tlId : persona.role === "bdr" || persona.role === "atl" ? persona.bdrId : undefined;

    const handleRoleChange = (role: Role) => {
        if (role === "admin") {
            setPersona({ role: "admin" });
        } else if (role === "tm") {
            setPersona({ role: "tm", tmId: curatedTeamManagers[0].id });
        } else if (role === "tl") {
            const first = curatedTeamLeads[0];
            if (first) setPersona(first.persona);
        } else {
            const first = curatedBdrs[0];
            if (first) setPersona(first.persona);
        }
    };

    const handlePersonChange = (id: string) => {
        if (persona.role === "tm") setPersona({ role: "tm", tmId: id });
        else if (persona.role === "tl") {
            const match = curatedTeamLeads.find((tl) => tl.id === id);
            if (match) setPersona(match.persona);
        } else if (persona.role === "bdr" || persona.role === "atl") {
            const match = curatedBdrs.find((b) => b.id === id);
            if (match) setPersona(match.persona);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-quaternary">Preview as</span>
            <Select
                aria-label="Preview role"
                size="sm"
                items={ROLE_OPTIONS}
                selectedKey={persona.role === "atl" ? "bdr" : persona.role}
                onSelectionChange={(key) => handleRoleChange(key as Role)}
            >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>

            {personOptions.length > 0 && (
                <Select aria-label="Preview persona" size="sm" items={personOptions} selectedKey={selectedPersonId} onSelectionChange={(key) => handlePersonChange(key as string)}>
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
            )}
        </div>
    );
};
