import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { FilterLines, Link03, Mail01, Pencil01, RefreshCcw01, SearchLg, Send01, Upload02, XClose } from "@untitledui/icons";
import { motion } from "motion/react";
import type { DateValue } from "react-aria-components";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { AppShell } from "@/components/application/app-shell";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PaginationPageDefault } from "@/components/application/pagination/pagination";
import { Table, TableCard } from "@/components/application/table/table";
import { toast } from "@/components/application/toast/toast";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ApplicationLinkDialog } from "@/components/deals/application-link-dialog";
import type { ApplicationLinkRequest } from "@/components/deals/application-link-dialog";
import { AssigneeCell } from "@/components/deals/assignee-cell";
import { DealsFilterChips, DealsFilterPanel, EMPTY_FILTERS } from "@/components/deals/deals-filter-panel";
import type { DealFilters } from "@/components/deals/deals-filter-panel";
import { OfferLetterComposer } from "@/components/deals/offer-letter-composer";
import { PaymentPlanEditor } from "@/components/deals/payment-plan-editor";
import { ShareOfferDialog, WithdrawOfferDialog } from "@/components/deals/share-offer-dialog";
import { ActionNeededBadge, DealStatusBadge } from "@/components/deals/status-badge";
import { DATA_WINDOW_END, DATA_WINDOW_START, PROTOTYPE_TODAY, periods } from "@/data/dashboard-data";
import type { PeriodId, PeriodSelection } from "@/data/dashboard-data";
import { inRange, resolvePeriodBounds } from "@/data/dashboard-metrics";
import type { Deal } from "@/data/deals-data";
import {
    COUNTRY_FLAG,
    STATUS,
    applicationFormUrl,
    canCreateLetter,
    canCreatePlan,
    canResendApplication,
    canShareLetter,
    canWithdraw,
    dealsForPersona,
} from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { ROLE_LABELS } from "@/types/role";
import { cx } from "@/utils/cx";

type Tab = { key: string; label: string; action?: boolean; test: (d: Deal) => boolean };

const TABS: Tab[] = [
    { key: "all", label: "All", test: () => true },
    { key: "action", label: "Action Required", action: true, test: (d) => d.status.action },
    { key: "new", label: "New", test: (d) => d.status.id === "APP_NEW" },
    { key: "application", label: "Application", test: (d) => d.status.stage === "Application" },
    // "Plan" dropped as its own tab — every Plan-stage deal (Not Started, Draft, Awaiting
    // Approval) now surfaces under "Offer" alongside the Offer-stage statuses. Tab/filter-level
    // merge only: PLAN_DRAFT and the other Plan statuses keep their own badges, guards, and row
    // actions untouched (deals-data.ts's four-gate model is unaffected).
    { key: "offer", label: "Offer", test: (d) => d.status.stage === "Plan" || d.status.stage === "Offer" },
    { key: "payment", label: "Payment", test: (d) => d.status.stage === "Payment" },
    { key: "completed", label: "Completed", test: (d) => d.status.id === "PAY_COMPLETED" },
    { key: "cancelled", label: "Cancelled", test: (d) => d.status.id === "ENR_CANCELLED" },
    { key: "not-interested", label: "Not Interested", test: (d) => d.status.id === "NOT_INTERESTED" },
    { key: "rejected", label: "Rejected", test: (d) => d.status.id === "REJECTED" },
    { key: "saved", label: "Saved", test: (d) => d.status.id === "SAVED" },
];

// Reference column widths, in their Figma proportions (node 442:29859, "Table header").
// `buildColumns` below scales every column from these ratios to whatever width the table's
// container actually measures, rather than using these as literal locked pixel values — the
// embed's real deployed width (1536px, see `frameWidth` in app/case-study-oms/page.js) is
// narrower than the ~1740px canvas these numbers were sized for, so using them unscaled left a
// horizontal scrollbar in production even though this same scaling comfortably avoids one.
const FIGMA_COLUMNS: { id: string; label: string; allowsSorting?: boolean; figmaWidth: number }[] = [
    { id: "name", label: "Applicant", figmaWidth: 200 },
    { id: "mobile", label: "Mobile", figmaWidth: 192 },
    { id: "course", label: "Course", figmaWidth: 118 },
    { id: "status", label: "Status", figmaWidth: 280 },
    { id: "createdOn", label: "Created On", allowsSorting: true, figmaWidth: 144 },
    { id: "lastUpdate", label: "Last Update", allowsSorting: true, figmaWidth: 144 },
    { id: "assigned", label: "Assigned", figmaWidth: 80 },
];
const FIGMA_COLUMNS_TOTAL = FIGMA_COLUMNS.reduce((sum, c) => sum + c.figmaWidth, 0);
const FIGMA_ACTIONS_WIDTH = 118; // Figma's own Actions column width — used only for its scale ratio.
// Table's own selection-checkbox column width for size="md" (see table.tsx's `w-11` on that
// column) — not exposed as a constant there, so tracked here to size everything else below.
const CHECKBOX_COLUMN_WIDTH = 44;
const ACTIONS_MIN_WIDTH = 190; // Comfortably fits the busiest row (up to 4 action icons).

/** Scales every column from its Figma ratio to fill `containerWidth` exactly, so the table
 * always fills its container with no leftover gap — while keeping Actions no smaller than
 * `ACTIONS_MIN_WIDTH` (Chromium doesn't honor `min-width`/`calc()` on a `table-fixed` header
 * cell, verified empirically, so that floor has to be enforced here rather than in CSS): if
 * Actions' proportional share would fall under the floor, it locks to the floor instead and the
 * other 7 columns scale down further to make room, so the total still matches `containerWidth`
 * precisely. */
function buildColumns(containerWidth: number) {
    const available = Math.max(0, containerWidth - CHECKBOX_COLUMN_WIDTH);
    const scale = available / (FIGMA_COLUMNS_TOTAL + FIGMA_ACTIONS_WIDTH);
    const actionsWidth = Math.max(ACTIONS_MIN_WIDTH, Math.round(FIGMA_ACTIONS_WIDTH * scale));
    const columnScale = Math.max(0, available - actionsWidth) / FIGMA_COLUMNS_TOTAL;
    const scaled: { id: string; label: string; allowsSorting?: boolean; width: number }[] = FIGMA_COLUMNS.map((c) => ({
        id: c.id,
        label: c.label,
        allowsSorting: c.allowsSorting,
        width: Math.round(c.figmaWidth * columnScale),
    }));
    return [...scaled, { id: "actions", label: "Actions", width: actionsWidth }];
}

const PAGE_SIZE = 20;

const toCalendarDate = (date: Date) => new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
const REFERENCE_TODAY = toCalendarDate(DATA_WINDOW_END);
const MIN_VALUE = toCalendarDate(DATA_WINDOW_START);
const MAX_VALUE = REFERENCE_TODAY;

const DEFAULT_PERIOD: PeriodSelection = { kind: "preset", id: "this-month" };
const isPeriodId = (id: string): id is PeriodId => periods.some((p) => p.id === id);

function formatDateShort(d: Date): string {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(d: Date): string {
    const diffMs = PROTOTYPE_TODAY.getTime() - d.getTime();
    const diffHrs = Math.round(diffMs / 3_600_000);
    if (diffHrs < 1) return "just now";
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
    const diffDays = Math.round(diffHrs / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    const diffMonths = Math.round(diffDays / 30);
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

const scopeLabel = (roleLabel: string) => (roleLabel === "Admin" ? "the whole floor" : roleLabel === "BDR" || roleLabel === "ATL" ? "you" : "your team");

export const DealsList = () => {
    const { persona } = usePersona();
    const { deals, updateDeal, resendLetter } = useDeals();
    const navigate = useNavigate();
    const location = useLocation();

    const personaKey = persona.role === "admin" ? "admin" : persona.role === "tm" ? persona.tmId : persona.role === "tl" ? persona.tlId : persona.bdrId;
    const scoped = useMemo(() => dealsForPersona(persona, deals), [persona, deals]);

    // Tab/page/search/filters live in the URL (not just component state) so that navigating to a
    // deal's detail page and back — via the "Back to Deals" link or the browser's own back button
    // — restores the exact list view you left, instead of resetting to the default "All" tab.
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState(() => searchParams.get("tab") ?? "all");
    const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
    const [debouncedSearch, setDebouncedSearch] = useState(() => (searchParams.get("q") ?? "").trim().toLowerCase());
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<DealFilters>(() => ({
        course: searchParams.get("course") ?? "",
        currency: searchParams.get("currency") ?? "",
        updated: searchParams.get("updated") ?? "",
        bdrId: searchParams.get("bdr") ?? "",
    }));
    const [period, setPeriod] = useState<PeriodSelection>(() => {
        const presetParam = searchParams.get("period");
        if (presetParam && isPeriodId(presetParam)) return { kind: "preset", id: presetParam };
        const fromParam = searchParams.get("periodFrom");
        const toParam = searchParams.get("periodTo");
        if (fromParam && toParam) return { kind: "custom", from: new Date(fromParam), to: new Date(toParam) };
        return DEFAULT_PERIOD;
    });
    const [pickedRange, setPickedRange] = useState<{ start: DateValue; end: DateValue } | null>(() =>
        period.kind === "custom" ? { start: toCalendarDate(period.from), end: toCalendarDate(period.to) } : null,
    );
    const [page, setPage] = useState(() => {
        const fromUrl = Number(searchParams.get("page"));
        return Number.isInteger(fromUrl) && fromUrl > 0 ? fromUrl : 1;
    });
    const [sort, setSort] = useState<{ column: string; direction: "ascending" | "descending" }>({ column: "lastUpdate", direction: "descending" });

    // Measures the table's own container so every column can be scaled from its Figma ratio to
    // an already-resolved pixel width every render (see `buildColumns` above for why this can't
    // be done in CSS alone).
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(1536); // real deployed embed frameWidth, as a sane pre-measurement default
    useLayoutEffect(() => {
        const el = tableWrapperRef.current;
        if (!el) return;
        setContainerWidth(el.getBoundingClientRect().width);
        const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    const columns = useMemo(() => buildColumns(containerWidth), [containerWidth]);

    // Debounced search (~140ms), matching the prototype.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 140);
        return () => clearTimeout(t);
    }, [search]);

    // Switching persona (Preview as) must never leave a stale filter selecting someone out of
    // scope, or a page number past the end of a now-smaller list — but must not fire on mount,
    // or it would immediately wipe out a tab/page/filters state just restored from the URL when
    // navigating back from a deal's detail page. Compares against the *previous* personaKey
    // (rather than a "have we mounted yet" boolean ref) specifically because React StrictMode
    // double-invokes effects once in dev — a boolean flag gets consumed by that throwaway first
    // pass, so the real pass would see it as already-mounted and fire anyway; comparing values
    // is idempotent and safe to run twice.
    const prevPersonaKeyRef = useRef(personaKey);
    useEffect(() => {
        if (prevPersonaKeyRef.current === personaKey) return;
        prevPersonaKeyRef.current = personaKey;
        setFilters(EMPTY_FILTERS);
        setTab("all");
        setSearch("");
        setPeriod(DEFAULT_PERIOD);
        setPickedRange(null);
        setPage(1);
    }, [personaKey]);

    // Same reasoning — must not reset the just-restored page number back to 1 on mount.
    const prevPageResetDepsRef = useRef({ tab, debouncedSearch, filters, period });
    useEffect(() => {
        const prev = prevPageResetDepsRef.current;
        prevPageResetDepsRef.current = { tab, debouncedSearch, filters, period };
        if (prev.tab === tab && prev.debouncedSearch === debouncedSearch && prev.filters === filters && prev.period === period) return;
        setPage(1);
    }, [tab, debouncedSearch, filters, period]);

    // Keep the URL in sync with the list view (replacing, not pushing, so tab/page/search/filter
    // changes don't spam browser history) — this is what lets the browser's own back button, and
    // "Back to Deals" on a deal's detail page, return to the exact view you left.
    useEffect(() => {
        const params = new URLSearchParams();
        if (tab !== "all") params.set("tab", tab);
        if (page !== 1) params.set("page", String(page));
        if (search) params.set("q", search);
        if (filters.course) params.set("course", filters.course);
        if (filters.currency) params.set("currency", filters.currency);
        if (filters.updated) params.set("updated", filters.updated);
        if (filters.bdrId) params.set("bdr", filters.bdrId);
        if (period.kind === "preset" && period.id !== "this-month") params.set("period", period.id);
        if (period.kind === "custom") {
            params.set("periodFrom", period.from.toISOString().slice(0, 10));
            params.set("periodTo", period.to.toISOString().slice(0, 10));
        }
        if (params.toString() === searchParams.toString()) return;
        setSearchParams(params, { replace: true });
    }, [tab, page, search, filters, period, setSearchParams, searchParams]);

    // The single filtered set — tab counts AND the table both read from this, so they can never
    // disagree (the P0-1 fix from the brief: the bug was two separate computations that could
    // drift, not a missing recompute).
    const filteredDeals = useMemo(() => {
        const periodBounds = resolvePeriodBounds(period);
        return scoped.filter((d) => {
            if (!inRange(d.createdOn, periodBounds)) return false;
            if (debouncedSearch && !d.name.toLowerCase().includes(debouncedSearch) && !d.email.toLowerCase().includes(debouncedSearch)) return false;
            if (filters.course && d.course.id !== filters.course) return false;
            if (filters.currency && d.currency !== filters.currency) return false;
            if (filters.bdrId && d.bdrId !== filters.bdrId) return false;
            if (filters.updated) {
                const days = Number(filters.updated);
                const diffDays = (PROTOTYPE_TODAY.getTime() - d.lastUpdate.getTime()) / 86_400_000;
                if (diffDays > days) return false;
            }
            return true;
        });
    }, [scoped, debouncedSearch, filters, period]);

    const tabCounts = useMemo(() => TABS.map((t) => filteredDeals.filter(t.test).length), [filteredDeals]);
    const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

    const sortedTabDeals = useMemo(() => {
        const tabDeals = filteredDeals.filter(activeTab.test);
        const sorted = [...tabDeals].sort((a, b) => {
            const av = (sort.column === "createdOn" ? a.createdOn : a.lastUpdate).getTime();
            const bv = (sort.column === "createdOn" ? b.createdOn : b.lastUpdate).getTime();
            return sort.direction === "ascending" ? av - bv : bv - av;
        });
        return sorted;
    }, [filteredDeals, activeTab, sort]);

    const totalPages = Math.max(1, Math.ceil(sortedTabDeals.length / PAGE_SIZE));
    const pageDeals = sortedTabDeals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const roleLabel = ROLE_LABELS[persona.role];

    // Stable across re-renders — react-aria-components memoizes dynamic Table collection output,
    // so row/cell renderers that close over freshly-recreated handlers on every render risk
    // stale closures inside that memoization. `updateDeal`/`toast` are already stable.
    const handleNotInterested = useCallback(
        (deal: Deal) => {
            updateDeal(deal.id, { status: STATUS.NOT_INTERESTED });
            toast(`Marked ${deal.name} as Not Interested`);
        },
        [updateDeal],
    );
    const handleCopyLink = useCallback((deal: Deal) => {
        navigator.clipboard?.writeText(applicationFormUrl(deal)).catch(() => {});
        toast(`Application link copied for ${deal.name}`);
    }, []);

    const handlePeriodPresetChange = (id: PeriodId) => {
        setPickedRange(null);
        setPeriod({ kind: "preset", id });
    };
    const handleApplyCustomRange = () => {
        if (!pickedRange) return;
        setPeriod({ kind: "custom", from: pickedRange.start.toDate(getLocalTimeZone()), to: pickedRange.end.toDate(getLocalTimeZone()) });
    };

    // Row actions become stage-conditional (§6 of the offer-separation brief), replacing the
    // single `onOffer` handler — each opens the surface that owns that transition (the same
    // three components deal-detail.tsx uses), except Refresh/Resend which are one-click.
    const [planEditorDealId, setPlanEditorDealId] = useState<string | null>(null);
    const [letterComposerDealId, setLetterComposerDealId] = useState<string | null>(null);
    const [shareDealId, setShareDealId] = useState<string | null>(null);
    const [withdrawDealId, setWithdrawDealId] = useState<string | null>(null);
    const [applicationLinkRequest, setApplicationLinkRequest] = useState<ApplicationLinkRequest>(null);
    const handleCreatePlan = useCallback((deal: Deal) => setPlanEditorDealId(deal.id), []);
    const handleCreateLetter = useCallback((deal: Deal) => setLetterComposerDealId(deal.id), []);
    const handleShare = useCallback((deal: Deal) => setShareDealId(deal.id), []);
    const handleWithdraw = useCallback((deal: Deal) => setWithdrawDealId(deal.id), []);
    const handleSendApplication = useCallback((deal: Deal) => setApplicationLinkRequest({ dealId: deal.id, mode: "send" }), []);
    const handleResendApplication = useCallback((deal: Deal) => setApplicationLinkRequest({ dealId: deal.id, mode: "resend" }), []);
    const handleResend = useCallback(
        (deal: Deal) => {
            resendLetter(deal.id);
            toast(`Offer letter resent to ${deal.name}`);
        },
        [resendLetter],
    );
    const rowHandlers = useMemo(
        () => ({
            onNotInterested: handleNotInterested,
            onCopyLink: handleCopyLink,
            onCreatePlan: handleCreatePlan,
            onCreateLetter: handleCreateLetter,
            onShare: handleShare,
            onResend: handleResend,
            onWithdraw: handleWithdraw,
            onSendApplication: handleSendApplication,
            onResendApplication: handleResendApplication,
        }),
        [
            handleNotInterested,
            handleCopyLink,
            handleCreatePlan,
            handleCreateLetter,
            handleShare,
            handleResend,
            handleWithdraw,
            handleSendApplication,
            handleResendApplication,
        ],
    );

    return (
        <AppShell>
            <div className="flex flex-col gap-1">
                <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Deals" }]} />
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-primary">Deals</h1>
                    <Badge type="color" color="indigo" size="sm" className="uppercase">
                        {roleLabel}
                    </Badge>
                </div>
                <p className="text-md text-tertiary">
                    {scoped.length} deal{scoped.length === 1 ? "" : "s"} in view — scoped to {scopeLabel(roleLabel)}.
                </p>
            </div>

            <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3">
                <div className="flex min-w-0 flex-wrap items-end gap-4">
                    <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-lg border border-secondary bg-primary p-0">
                        {periods.map((filter) => {
                            const isActive = period.kind === "preset" && period.id === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => handlePeriodPresetChange(filter.id)}
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
                        active={period.kind === "custom"}
                        referenceToday={REFERENCE_TODAY}
                        minValue={MIN_VALUE}
                        maxValue={MAX_VALUE}
                        value={pickedRange}
                        onChange={setPickedRange}
                        onApply={handleApplyCustomRange}
                        onCancel={() => setPickedRange(period.kind === "custom" ? { start: toCalendarDate(period.from), end: toCalendarDate(period.to) } : null)}
                    />

                    <Button color="secondary" size="sm" iconLeading={FilterLines} onClick={() => setFiltersOpen((v) => !v)} className="shrink-0">
                        Filters
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        aria-label="Search name or email"
                        placeholder="Search by name or email"
                        icon={SearchLg}
                        size="sm"
                        shortcut
                        className="w-64"
                        value={search}
                        onChange={setSearch}
                    />
                    <Button color="secondary" size="sm" iconLeading={Upload02} isDisabled title="Export — coming soon">
                        Export
                    </Button>
                </div>
            </div>

            <div className="-mt-4 flex flex-wrap items-center gap-2 overflow-x-auto border-b border-secondary pb-0.5">
                {TABS.map((t, i) => {
                    const isActive = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`relative flex shrink-0 items-center gap-2 px-1 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-100 ease-linear ${
                                isActive
                                    ? "text-brand-secondary"
                                    : t.action
                                      ? "text-error-primary hover:text-error-primary"
                                      : "text-quaternary hover:text-secondary"
                            }`}
                        >
                            {t.label}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${isActive ? "bg-brand-primary_alt text-brand-secondary" : "bg-secondary text-tertiary"}`}
                            >
                                {tabCounts[i]}
                            </span>
                            {/* Shared `layoutId` — motion animates this sliding from the
                             * previously active tab to this one instead of the underline
                             * just jumping straight there. */}
                            {isActive && (
                                <motion.div
                                    layoutId="deals-tab-indicator"
                                    className="absolute inset-x-0 -bottom-px h-0.5 bg-fg-brand-primary_alt"
                                    transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {filtersOpen && <DealsFilterPanel persona={persona} filters={filters} onChange={setFilters} />}
            <DealsFilterChips filters={filters} onChange={setFilters} />

            <TableCard.Root ref={tableWrapperRef}>
                {pageDeals.length === 0 ? (
                    <EmptyState size="sm">
                        <EmptyState.Content>
                            <EmptyState.Description>No deals match these filters.</EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                ) : (
                    // Note: interacting with this table (row click, tab/sort change) logs a
                    // "recovered from concurrent rendering error" (React error #520 in prod
                    // builds too, not just dev) — a known react-aria-components@1.20 + React 19
                    // interaction with dynamic Table collections. React's own recovery always
                    // succeeds (confirmed via extensive interaction testing, including a
                    // production build): every render lands with correct data, no visible
                    // corruption. Tried the library's documented fix (memoize row-render
                    // closures via useCallback/useMemo — see rowHandlers above); didn't
                    // eliminate the console error, only the underlying staleness risk it warns
                    // about. Not chasing further into third-party library internals.
                    <Table
                        aria-label="Deals"
                        selectionMode="multiple"
                        sortDescriptor={sort}
                        onSortChange={(descriptor) => setSort({ column: String(descriptor.column), direction: descriptor.direction ?? "descending" })}
                        onRowAction={(key) => navigate(`/deals/${key}`, { state: { from: `/deals${location.search}` } })}
                        size="md"
                    >
                        <Table.Header columns={columns}>
                            {(column) => (
                                <Table.Head
                                    id={column.id}
                                    allowsSorting={column.allowsSorting}
                                    label={column.label}
                                    fixedWidth={column.width}
                                    labelAlign={column.id === "actions" ? "end" : "start"}
                                />
                            )}
                        </Table.Header>
                        <Table.Body items={pageDeals}>
                            {(deal) => (
                                <Table.Row id={deal.id} columns={columns} className="cursor-pointer">
                                    {(column) => <Table.Cell>{renderCell(deal, column.id, rowHandlers)}</Table.Cell>}
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                )}
            </TableCard.Root>

            {sortedTabDeals.length > 0 && (
                // `divider={false}`: matches the table's own now-borderless, background-less look
                // rather than reintroducing a line the rest of this page has deliberately dropped.
                <PaginationPageDefault page={page} total={totalPages} onPageChange={setPage} divider={false} />
            )}

            <PaymentPlanEditor dealId={planEditorDealId} onOpenChange={(open) => !open && setPlanEditorDealId(null)} />
            <OfferLetterComposer
                dealId={letterComposerDealId}
                onOpenChange={(open) => !open && setLetterComposerDealId(null)}
                onShareRequested={(id) => {
                    setLetterComposerDealId(null);
                    setShareDealId(id);
                }}
            />
            <ShareOfferDialog dealId={shareDealId} onOpenChange={(open) => !open && setShareDealId(null)} />
            <WithdrawOfferDialog dealId={withdrawDealId} onOpenChange={(open) => !open && setWithdrawDealId(null)} />
            <ApplicationLinkDialog request={applicationLinkRequest} onOpenChange={(open) => !open && setApplicationLinkRequest(null)} />
        </AppShell>
    );
};

type RowHandlers = {
    onNotInterested: (d: Deal) => void;
    onCopyLink: (d: Deal) => void;
    onCreatePlan: (d: Deal) => void;
    onCreateLetter: (d: Deal) => void;
    onShare: (d: Deal) => void;
    onResend: (d: Deal) => void;
    onWithdraw: (d: Deal) => void;
    onSendApplication: (d: Deal) => void;
    onResendApplication: (d: Deal) => void;
};

/** The §6 row-action table, one branch per deal state. Every button reads its enabled state off
 * the same guards Section 02/03 read on the deal-detail page (§2.3) — disabled-with-tooltip,
 * never hidden, so the reason is always visible. */
function primaryRowActions(deal: Deal, handlers: RowHandlers) {
    if (deal.status.id === "APP_NEW") {
        return [
            <ButtonUtility
                key="send-app"
                size="sm"
                color="tertiary"
                tooltip="Send application form"
                icon={Send01}
                onClick={() => handlers.onSendApplication(deal)}
            />,
        ];
    }
    if (deal.status.id === "APP_PENDING" || deal.status.id === "APP_EXPIRED") {
        const guard = canResendApplication(deal);
        return [
            <ButtonUtility
                key="resend-app"
                size="sm"
                color="tertiary"
                tooltip={guard.allowed ? "Resend application form" : guard.reason}
                icon={RefreshCcw01}
                isDisabled={!guard.allowed}
                onClick={() => handlers.onResendApplication(deal)}
            />,
        ];
    }
    if (deal.status.id === "APP_FILLED" || deal.status.id === "PLAN_NOT_STARTED") {
        const guard = canCreatePlan(deal);
        return [
            <ButtonUtility
                key="plan"
                size="sm"
                color="tertiary"
                tooltip={guard.allowed ? "Create payment plan" : guard.reason}
                icon={Mail01}
                isDisabled={!guard.allowed}
                onClick={() => handlers.onCreatePlan(deal)}
            />,
        ];
    }
    if (deal.status.id === "PLAN_DRAFT") {
        if (deal.offer.state === "created") {
            const guard = canShareLetter(deal);
            return [
                <ButtonUtility
                    key="edit"
                    size="sm"
                    color="tertiary"
                    tooltip="Edit offer letter"
                    icon={Pencil01}
                    onClick={() => handlers.onCreateLetter(deal)}
                />,
                <ButtonUtility
                    key="share"
                    size="sm"
                    color="tertiary"
                    tooltip={guard.allowed ? "Share offer letter" : guard.reason}
                    icon={Send01}
                    isDisabled={!guard.allowed}
                    onClick={() => handlers.onShare(deal)}
                />,
            ];
        }
        const guard = canCreateLetter(deal);
        return [
            <ButtonUtility
                key="letter"
                size="sm"
                color="tertiary"
                tooltip={guard.allowed ? "Create offer letter" : guard.reason}
                icon={Mail01}
                isDisabled={!guard.allowed}
                onClick={() => handlers.onCreateLetter(deal)}
            />,
        ];
    }
    if (deal.status.id === "PLAN_AWAITING_APPROVAL") {
        return [<ButtonUtility key="waiting" size="sm" color="tertiary" tooltip="With Sales Ops" icon={Mail01} isDisabled />];
    }
    if (deal.status.id === "OFFER_PENDING" || deal.status.id === "OFFER_ACCEPTED") {
        const withdrawGuard = canWithdraw(deal);
        return [
            <ButtonUtility key="resend" size="sm" color="tertiary" tooltip="Resend offer" icon={RefreshCcw01} onClick={() => handlers.onResend(deal)} />,
            <ButtonUtility
                key="withdraw"
                size="sm"
                color="tertiary"
                tooltip={withdrawGuard.allowed ? "Withdraw offer" : withdrawGuard.reason}
                icon={XClose}
                isDisabled={!withdrawGuard.allowed}
                onClick={() => handlers.onWithdraw(deal)}
            />,
        ];
    }
    if (deal.status.id === "OFFER_EXPIRED" || deal.status.id === "OFFER_WITHDRAWN") {
        const guard = canCreateLetter(deal);
        return [
            <ButtonUtility
                key="v2"
                size="sm"
                color="tertiary"
                tooltip="Create offer letter (v2)"
                icon={Mail01}
                isDisabled={!guard.allowed}
                onClick={() => handlers.onCreateLetter(deal)}
            />,
        ];
    }
    return [];
}

function renderCell(deal: Deal, columnId: string, handlers: RowHandlers) {
    switch (columnId) {
        case "name":
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                        {deal.name}
                        {deal.intlFlag && (
                            <img
                                src={`https://www.untitledui.com/images/flags/${COUNTRY_FLAG[deal.country] ?? "earth"}.svg`}
                                alt={deal.country}
                                title={deal.country}
                                className="size-4 shrink-0 rounded-full"
                            />
                        )}
                    </div>
                    <div className="font-mono text-xs text-tertiary">{deal.id}</div>
                </div>
            );
        case "mobile":
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-secondary">{deal.phone}</span>
                    <span className="max-w-40 truncate text-xs text-tertiary">{deal.email}</span>
                </div>
            );
        case "course":
            return <span className="text-sm text-secondary">{deal.course.short}</span>;
        case "status":
            return (
                <div className="flex items-center gap-1.5">
                    <DealStatusBadge status={deal.status} />
                    {deal.status.action && <ActionNeededBadge />}
                </div>
            );
        case "createdOn":
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-secondary">{formatDateShort(deal.createdOn)}</span>
                    <span className="text-xs text-tertiary">{formatRelative(deal.createdOn)}</span>
                </div>
            );
        case "lastUpdate":
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-secondary">{formatDateShort(deal.lastUpdate)}</span>
                    <span className="text-xs text-tertiary">{formatRelative(deal.lastUpdate)}</span>
                </div>
            );
        case "assigned":
            return <AssigneeCell bdrId={deal.bdrId} />;
        case "actions": {
            // The application form link is only relevant before the learner has filled it in —
            // hidden from APP_FILLED onward rather than staying visible (and pointing at a form
            // that's no longer the live next step) for the rest of the deal's lifecycle.
            const showFormLink = deal.status.id === "APP_NEW" || deal.status.id === "APP_PENDING" || deal.status.id === "APP_EXPIRED";
            return (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {primaryRowActions(deal, handlers)}
                    <ButtonUtility size="sm" color="tertiary" tooltip="Mark as not interested" icon={XClose} onClick={() => handlers.onNotInterested(deal)} />
                    {showFormLink && <ButtonUtility size="sm" color="tertiary" tooltip="Get form link" icon={Link03} onClick={() => handlers.onCopyLink(deal)} />}
                </div>
            );
        }
        default:
            return null;
    }
}
