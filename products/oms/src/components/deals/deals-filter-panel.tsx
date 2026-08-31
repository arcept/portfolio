import { X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import type { Persona } from "@/types/role";
import { COURSES } from "@/data/deals-data";
import { bdrs } from "@/data/dashboard-data";

export type DealFilters = { course: string; currency: string; updated: string; bdrId: string };
export const EMPTY_FILTERS: DealFilters = { course: "", currency: "", updated: "", bdrId: "" };

const UPDATED_OPTIONS = [
    { id: "", label: "Any time" },
    { id: "7", label: "Last 7 days" },
    { id: "30", label: "Last 30 days" },
    { id: "90", label: "Last 90 days" },
];
const CURRENCY_OPTIONS = [
    { id: "", label: "Any" },
    { id: "INR", label: "INR" },
    { id: "USD", label: "USD" },
];

function bdrOptionsFor(persona: Persona): { id: string; label: string }[] {
    const scoped =
        persona.role === "admin" ? bdrs : persona.role === "tm" ? bdrs.filter((b) => b.tmId === persona.tmId) : persona.role === "tl" ? bdrs.filter((b) => b.tlId === persona.tlId) : [];
    return [{ id: "", label: "Anyone" }, ...scoped.map((b) => ({ id: b.id, label: b.name }))];
}

/** Whether this persona should see the BDR filter at all — a BDR/ATL previewing their own
 * scope has no one else to filter by. */
export function canSeePeopleFilter(persona: Persona): boolean {
    return persona.role === "admin" || persona.role === "tm" || persona.role === "tl";
}

export const DealsFilterPanel = ({ persona, filters, onChange }: { persona: Persona; filters: DealFilters; onChange: (filters: DealFilters) => void }) => {
    const courseOptions = [{ id: "", label: "Any course" }, ...COURSES.map((c) => ({ id: c.id, label: c.short }))];

    return (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-secondary bg-primary p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select aria-label="Course" label="Course" size="sm" items={courseOptions} selectedKey={filters.course} onSelectionChange={(key) => onChange({ ...filters, course: key as string })}>
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
            <Select
                aria-label="Currency"
                label="Currency"
                size="sm"
                items={CURRENCY_OPTIONS}
                selectedKey={filters.currency}
                onSelectionChange={(key) => onChange({ ...filters, currency: key as string })}
            >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
            <Select
                aria-label="Last update"
                label="Last update"
                size="sm"
                items={UPDATED_OPTIONS}
                selectedKey={filters.updated}
                onSelectionChange={(key) => onChange({ ...filters, updated: key as string })}
            >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
            {canSeePeopleFilter(persona) && (
                <Select
                    aria-label="BDR"
                    label="BDR"
                    size="sm"
                    items={bdrOptionsFor(persona)}
                    selectedKey={filters.bdrId}
                    onSelectionChange={(key) => onChange({ ...filters, bdrId: key as string })}
                >
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
            )}
        </div>
    );
};

export const DealsFilterChips = ({ filters, onChange }: { filters: DealFilters; onChange: (filters: DealFilters) => void }) => {
    const chips: { key: keyof DealFilters; label: string }[] = [];
    if (filters.course) chips.push({ key: "course", label: COURSES.find((c) => c.id === filters.course)?.short ?? filters.course });
    if (filters.currency) chips.push({ key: "currency", label: filters.currency });
    if (filters.bdrId) chips.push({ key: "bdrId", label: bdrs.find((b) => b.id === filters.bdrId)?.name ?? filters.bdrId });
    if (filters.updated) chips.push({ key: "updated", label: `Updated ≤ ${filters.updated}d` });

    if (!chips.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-quaternary">
                {chips.length} filter{chips.length > 1 ? "s" : ""} applied
            </span>
            {chips.map((chip) => (
                <span key={chip.key} className="flex items-center gap-1 rounded-md bg-secondary py-1 pr-1.5 pl-2.5 text-sm text-secondary">
                    {chip.label}
                    <button type="button" onClick={() => onChange({ ...filters, [chip.key]: "" })} className="rounded p-0.5 text-fg-quaternary hover:bg-primary_hover">
                        <X className="size-3.5" />
                    </button>
                </span>
            ))}
            <Button color="tertiary" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
                Clear all
            </Button>
        </div>
    );
};
