import { useEffect, useRef, useState } from "react";
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
    /** Lifted up to `dashboard-sales-head.tsx` and shared with `TeamDrilldown`'s own BDR search
     * (mirrors the existing `funnelScope` lift for the same page/component pair) — so this field
     * and `TeamDrilldown`'s "Search BDR..." input stay in sync as two entry points to one search. */
    search: string;
    onSearchChange: (value: string) => void;
}

export const DashboardHeader = ({ selection, onSelectionChange, search, onSearchChange }: DashboardHeaderProps) => {
    const { persona } = usePersona();
    const { showReportButton } = getVisibleSections(persona);
    const [pickedRange, setPickedRange] = useState<{ start: DateValue; end: DateValue } | null>(null);
    // Whether the filters bar (period tabs + search + Generate Report) has actually detached into
    // its sticky "stuck" position, vs. still sitting in its normal spot below the greeting —
    // drives whether it gets a background (Manik's ask, 2026-09-12: it should blend into the page
    // until it's genuinely pinned at the top with cards scrolling underneath it, since that's the
    // only time it actually needs a backdrop to stay legible/separated from that content).
    // `position: sticky` alone can't answer "am I currently stuck" — there's no reliable, broadly-
    // supported CSS query for that yet — so this watches a zero-height sentinel placed immediately
    // above the bar: once that sentinel scrolls out of view above the viewport, the bar must have
    // hit its sticky offset (the standard technique for this exact "sticky header, conditional
    // backdrop" pattern).
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), { threshold: 0 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

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
        <>
            {/* Greeting + sentinel bundled into one self-contained flex item (its own local gap-5,
                same as this component's original single-wrapper layout) rather than exposed as two
                more top-level Fragment siblings — keeps their spacing predictable and independent
                of the page-level `gap-8` below, so only the transition into the sticky bar (the one
                pairing that actually needs to escape into the page's own flow — see the comment on
                that div) needs its own explicit correction. */}
            <div className="flex flex-col gap-5">
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

                {/* Zero-height, unstyled — purely a scroll-position marker for the sticky bar's own
                    "am I stuck" detection above, not part of the visible layout. */}
                <div ref={sentinelRef} aria-hidden="true" className="h-0" />
            </div>

            {/* Single row, per Figma's "Filters bar" (node 118:28874): period tabs + Custom Date
                Range on the left, Search + Generate Report on the right — `justify-between`
                rather than everything in one un-split flex-wrap run. Sticky (Manik's ask,
                2026-09-12) — this same period selection also drives the Team Performance cards
                further down the page, so keeping it in view means switching periods doesn't
                require scrolling back up. `isStuck` toggles the background/border/shadow only
                once it's actually pinned — see the comment on `isStuck` above.

                Rendered as a top-level sibling here (not nested inside a small wrapper div) so
                its sticky containing block is the page's own full-height content column
                (`dashboard-sales-head.tsx`'s outer `flex-col gap-8`) rather than a div that only
                wraps the greeting — a short containing block gives `position: sticky` almost no
                room to actually stay pinned before it's forced to scroll away with everything
                else, which is why the bar wasn't visibly sticking at all.

                Since it's still nested inside the page's centered `max-w-360` content column (needed
                so its sticky containing block stays tall — see above), plain padding-cancelling
                margins can only bleed it out to that column's own edges, not truly full width once
                the column is centered with side gutters. To reach `<main>`'s real edges (flush
                against the sidebar on the left, flush against the viewport/scrollbar on the right)
                regardless of viewport width, this uses the classic "break out of a centered
                container" trick — `width: 100vw` (or `100vw` minus the sidebar's reserved width at
                `lg+`) combined with a `margin-left` computed from `50%` of its own box and `50vw`,
                which cancels out however far this element actually sits from the true viewport edges
                no matter how wide the centering gutter currently is. `280px`/`140px` mirror
                `SIDEBAR_WIDTH` in `dashboard-sidebar.tsx` (half of it, since the trick's `50vw`
                needs shifting by half the sidebar's width to account for the sidebar occupying only
                the left side) — literal pixel values, not the imported constant, because Tailwind's
                arbitrary-value classes must appear as literal text in source to compile.
                `-mt-8` cancels the page-level `gap-8` (32px) entirely, butting this bar flush
                against the sentinel/greeting above with no gap (Manik's ask, 2026-09-12). `-mb-6`
                pulls in the *other* `gap-8` — the one between this bar and the first card row below
                it — down to 8px (Manik's ask, same day, after noticing that gap was untouched by the
                top-side fix above).

                Padding and centering are deliberately two separate nested divs here (padding div,
                then a `mx-auto max-w-360` div inside it) rather than combined on one div — mirrors
                exactly how `app-shell.tsx` does it (`main`'s padding first, then a separate centered
                div). Putting both on the same div would center against the *un-padded* width, adding
                an extra unintended gutter on top of the padding and misaligning this row's content
                against the greeting/cards above and below it. The background/border themselves live
                on the outer, full-width box — not this padded/centered row — so the bleed actually
                paints, and no rounded corners here so the edge-to-edge bar reads as a true bar rather
                than a floating rounded panel. */}
            <div
                className={cx(
                    "sticky top-0 z-30 -mt-8 -mb-6 ml-[calc(50%_-_50vw)] w-screen lg:ml-[calc(50%_-_50vw_+_140px)] lg:w-[calc(100vw_-_280px)]",
                    "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
                    isStuck ? "border-b border-secondary bg-primary shadow-xs" : "border-b border-transparent bg-transparent",
                )}
            >
                <div className="px-4 py-3 lg:px-8">
                    <div className="mx-auto flex max-w-360 min-w-0 flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                            {/* Matches the Figma "Horizontal tabs" spec exactly (bg-primary/border-secondary
                                container, each tab individually rounded with a 2px gap — not a joined
                                segmented control), rather than the base ButtonGroup component's styling. */}
                            <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-lg border border-secondary bg-primary p-0">
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
                                    setPickedRange(
                                        selection.kind === "custom" ? { start: toCalendarDate(selection.from), end: toCalendarDate(selection.to) } : null,
                                    )
                                }
                            />
                        </div>

                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                            <Input
                                shortcut
                                size="sm"
                                aria-label="Search by BDR name"
                                placeholder="Search by BDR name"
                                icon={SearchLg}
                                value={search}
                                onChange={onSearchChange}
                                className="w-80 max-w-80 min-w-64 flex-1"
                            />

                            {showReportButton && <GenerateReportButton selection={selection} />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
