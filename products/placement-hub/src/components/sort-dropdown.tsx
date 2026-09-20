import { Button as AriaButton, Label as AriaLabel, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, Popover as AriaPopover, Select as AriaSelect } from "react-aria-components";
import { SwitchVertical02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export type SortOption = "newest" | "oldest" | "status";

const OPTIONS: { id: SortOption; label: string }[] = [
    { id: "newest", label: "Newest first" },
    { id: "oldest", label: "Oldest first" },
    { id: "status", label: "Status" },
];

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

// Real, working sort control (not decorative) — the Figma frame just shows "Sort by" with no
// selected value, so the trigger label stays "Sort by" regardless of the active option, and the
// listbox shows a check against whichever is selected.
export const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
    return (
        <AriaSelect selectedKey={value} onSelectionChange={(key) => onChange(key as SortOption)} aria-label="Sort applications by">
            <AriaLabel className="sr-only">Sort by</AriaLabel>
            <AriaButton className="flex shrink-0 cursor-pointer items-center gap-2 outline-none">
                <span className="text-sm font-medium whitespace-nowrap text-gray-700">Sort by</span>
                <SwitchVertical02 className="size-4 shrink-0 text-gray-500" />
            </AriaButton>
            <AriaPopover placement="bottom end" className="min-w-[160px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg outline-none">
                <AriaListBox className="outline-none">
                    {OPTIONS.map((opt) => (
                        <AriaListBoxItem
                            key={opt.id}
                            id={opt.id}
                            className={({ isSelected, isFocused }) =>
                                cx("cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 outline-none", isFocused && "bg-gray-50", isSelected && "font-semibold text-blue-dark-700")
                            }
                        >
                            {opt.label}
                        </AriaListBoxItem>
                    ))}
                </AriaListBox>
            </AriaPopover>
        </AriaSelect>
    );
};

export const sortApplications = <T extends { applicationLastUpdate?: string; applicationStatus?: string }>(applications: T[], sortBy: SortOption): T[] => {
    // Fixture data doesn't carry real timestamps, only display strings like "7d ago" — parse the
    // leading number of days so "Newest"/"Oldest" are genuinely functional, not just relabels.
    const daysAgo = (text?: string) => {
        const match = text?.match(/(\d+)d ago/);
        return match ? Number(match[1]) : 0;
    };

    const sorted = [...applications];
    if (sortBy === "newest") sorted.sort((a, b) => daysAgo(a.applicationLastUpdate) - daysAgo(b.applicationLastUpdate));
    else if (sortBy === "oldest") sorted.sort((a, b) => daysAgo(b.applicationLastUpdate) - daysAgo(a.applicationLastUpdate));
    else if (sortBy === "status") sorted.sort((a, b) => (a.applicationStatus ?? "").localeCompare(b.applicationStatus ?? ""));
    return sorted;
};
