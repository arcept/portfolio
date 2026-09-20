import { Button as AriaButton, Label as AriaLabel, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, Popover as AriaPopover, Select as AriaSelect } from "react-aria-components";
import { SwitchVertical02 } from "@untitledui/icons";
import type { JobSortOption } from "@/lib/job-sort";
import { cx } from "@/utils/cx";

const OPTIONS: { id: JobSortOption; label: string }[] = [
    { id: "posted", label: "Posted date" },
    { id: "deadline", label: "Application deadline" },
    { id: "relevance", label: "Relevance" },
];

interface JobSortDropdownProps {
    value: JobSortOption;
    onChange: (value: JobSortOption) => void;
}

export const JobSortDropdown = ({ value, onChange }: JobSortDropdownProps) => {
    return (
        <AriaSelect selectedKey={value} onSelectionChange={(key) => onChange(key as JobSortOption)} aria-label="Sort jobs by" className="max-md:self-end">
            <AriaLabel className="sr-only">Sort by</AriaLabel>
            <AriaButton className="flex shrink-0 cursor-pointer items-center gap-4 rounded-[40px] bg-gray-50 px-3 py-2 outline-none">
                <span className="text-sm font-medium whitespace-nowrap text-gray-700">Sort by</span>
                <SwitchVertical02 className="size-4 shrink-0 text-gray-500" />
            </AriaButton>
            <AriaPopover placement="bottom end" className="min-w-[200px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg outline-none">
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
