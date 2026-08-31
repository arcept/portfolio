import { useState } from "react";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { SearchLg } from "@untitledui/icons";
import type { DateValue } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { Input } from "@/components/base/input/input";
import { GenerateReportButton } from "@/components/dashboard/generate-report-button";
import { usePersona } from "@/providers/role-provider";
import { getVisibleSections } from "@/utils/role-visibility";
import { cx } from "@/utils/cx";
import { ROLE_LABELS } from "@/types/role";
import type { PeriodId, PeriodSelection } from "@/data/dashboard-data";
import { DATA_WINDOW_END, DATA_WINDOW_START, periods, prototypeTodayLabel } from "@/data/dashboard-data";

const toCalendarDate = (date: Date) => new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

const REFERENCE_TODAY = toCalendarDate(DATA_WINDOW_END);
const MIN_VALUE = toCalendarDate(DATA_WINDOW_START);
const MAX_VALUE = REFERENCE_TODAY;

interface DashboardHeaderProps {
    selection: PeriodSelection;
    onSelectionChange: (selection: PeriodSelection) => void;
}

export const DashboardHeader = ({ selection, onSelectionChange }: DashboardHeaderProps) => {
    const { persona } = usePersona();
    const { showReportButton } = getVisibleSections(persona);
    const [pickedRange, setPickedRange] = useState<{ start: DateValue; end: DateValue } | null>(null);

    const handlePresetChange = (id: PeriodId) => {
        setPickedRange(null);
        onSelectionChange({ kind: "preset", id });
    };

    const handleApplyCustomRange = () => {
        if (!pickedRange) return;
        onSelectionChange({
            kind: "custom",
            from: pickedRange.start.toDate(getLocalTimeZone()),
            to: pickedRange.end.toDate(getLocalTimeZone()),
        });
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex min-w-80 flex-1 flex-col gap-0.5">
                    <Button color="link-color" size="sm" className="p-0!">
                        {prototypeTodayLabel}
                    </Button>

                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-primary">Good Evening, Manik</h1>
                        <Badge color="indigo" type="color" size="sm">
                            {ROLE_LABELS[persona.role].toUpperCase()}
                        </Badge>
                    </div>

                    <p className="text-xs text-tertiary">Here&apos;s how the floor is tracking</p>
                </div>

                <Input
                    shortcut
                    size="sm"
                    aria-label="Search deals"
                    placeholder="Search deals"
                    icon={SearchLg}
                    className="max-w-70 min-w-50 flex-1"
                />

                {showReportButton && <GenerateReportButton selection={selection} />}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Matches the Figma "Horizontal tabs" spec exactly (bg-primary/border-secondary
                    container, each tab individually rounded with a 2px gap — not a joined
                    segmented control), rather than the base ButtonGroup component's styling. */}
                <div className="flex items-center gap-0.5 rounded-lg border border-secondary bg-primary p-0">
                    {periods.map((filter) => {
                        const isActive = selection.kind === "preset" && selection.id === filter.id;
                        return (
                            <button
                                key={filter.id}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => handlePresetChange(filter.id)}
                                className={cx(
                                    "cursor-pointer rounded-lg px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition duration-100 ease-linear",
                                    isActive
                                        ? "border border-primary bg-secondary text-secondary shadow-xs"
                                        : "border border-transparent text-quaternary hover:rounded-none hover:bg-secondary_hover hover:text-secondary",
                                )}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                <DateRangePicker
                    size="sm"
                    placeholder="Custom Date Range"
                    showPresets={false}
                    active={selection.kind === "custom"}
                    referenceToday={REFERENCE_TODAY}
                    minValue={MIN_VALUE}
                    maxValue={MAX_VALUE}
                    value={pickedRange}
                    onChange={setPickedRange}
                    onApply={handleApplyCustomRange}
                    onCancel={() =>
                        setPickedRange(selection.kind === "custom" ? { start: toCalendarDate(selection.from), end: toCalendarDate(selection.to) } : null)
                    }
                />
            </div>
        </div>
    );
};
