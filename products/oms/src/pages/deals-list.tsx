import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FilterLines, Globe02, Link03, Mail01, RefreshCcw01, SearchLg, Send01, XClose } from "@untitledui/icons";
import { AppShell } from "@/components/application/app-shell";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { PaginationPageDefault } from "@/components/application/pagination/pagination";
import { Table, TableCard } from "@/components/application/table/table";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/application/toast/toast";
import { AssigneeCell } from "@/components/deals/assignee-cell";
import { DealsFilterChips, DealsFilterPanel, EMPTY_FILTERS } from "@/components/deals/deals-filter-panel";
import { PaymentPlanEditor } from "@/components/deals/payment-plan-editor";
import { OfferLetterComposer } from "@/components/deals/offer-letter-composer";
import { ShareOfferDialog, WithdrawOfferDialog } from "@/components/deals/share-offer-dialog";
import type { DealFilters } from "@/components/deals/deals-filter-panel";
import { DealStatusBadge, ActionNeededBadge } from "@/components/deals/status-badge";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import type { Deal } from "@/data/deals-data";
import { canCreateLetter, canCreatePlan, canShareLetter, canWithdraw, dealsForPersona, STATUS } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { ROLE_LABELS } from "@/types/role";

type Tab = { key: string; label: string; action?: boolean; test: (d: Deal) => boolean };

const TABS: Tab[] = [
    { key: "all", label: "All", test: () => true },
    { key: "action", label: "Action Required", action: true, test: (d) => d.status.action },
    { key: "application", label: "Application", test: (d) => d.status.stage === "Application" },
    { key: "plan", label: "Plan", test: (d) => d.status.stage === "Plan" },
    { key: "offer", label: "Offer", test: (d) => d.status.stage === "Offer" },
    { key: "payment", label: "Payment", test: (d) => d.status.stage === "Payment" },
    { key: "cancelled", label: "Cancelled", test: (d) => d.status.id === "ENR_CANCELLED" },
    { key: "not-interested", label: "Not Interested", test: (d) => d.status.id === "NOT_INTERESTED" },
    { key: "rejected", label: "Rejected", test: (d) => d.status.id === "REJECTED" },
    { key: "saved", label: "Saved", test: (d) => d.status.id === "SAVED" },
];

const COLUMNS: { id: string; label: string; allowsSorting?: boolean }[] = [
    { id: "name", label: "Applicant" },
    { id: "mobile", label: "Mobile" },
    { id: "course", label: "Course" },
    { id: "status", label: "Status" },
    { id: "createdOn", label: "Created On", allowsSorting: true },
    { id: "lastUpdate", label: "Last Update", allowsSorting: true },
    { id: "assigned", label: "Assigned" },
    { id: "actions", label: "" },
];

const PAGE_SIZE = 13;

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
    const { deals, updateDeal, refreshLetter, resendLetter } = useDeals();
    const navigate = useNavigate();

    const personaKey = persona.role === "admin" ? "admin" : persona.role === "tm" ? persona.tmId : persona.role === "tl" ? persona.tlId : persona.bdrId;
    const scoped = useMemo(() => dealsForPersona(persona, deals), [persona, deals]);

    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<DealFilters>(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<{ column: string; direction: "ascending" | "descending" }>({ column: "lastUpdate", direction: "descending" });

    // Debounced search (~140ms), matching the prototype.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 140);
        return () => clearTimeout(t);
    }, [search]);

    // Switching persona (Preview as) must never leave a stale filter selecting someone out of
    // scope, or a page number past the end of a now-smaller list.
    useEffect(() => {
        setFilters(EMPTY_FILTERS);
        setTab("all");
        setSearch("");
        setPage(1);
    }, [personaKey]);

    useEffect(() => {
        setPage(1);
    }, [tab, debouncedSearch, filters]);

    // The single filtered set — tab counts AND the table both read from this, so they can never
    // disagree (the P0-1 fix from the brief: the bug was two separate computations that could
    // drift, not a missing recompute).
    const filteredDeals = useMemo(() => {
        return scoped.filter((d) => {
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
    }, [scoped, debouncedSearch, filters]);

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
        toast(`Application link copied for ${deal.name}`);
    }, []);

    // Row actions become stage-conditional (§6 of the offer-separation brief), replacing the
    // single `onOffer` handler — each opens the surface that owns that transition (the same
    // three components deal-detail.tsx uses), except Refresh/Resend which are one-click.
    const [planEditorDealId, setPlanEditorDealId] = useState<string | null>(null);
    const [letterComposerDealId, setLetterComposerDealId] = useState<string | null>(null);
    const [shareDealId, setShareDealId] = useState<string | null>(null);
    const [withdrawDealId, setWithdrawDealId] = useState<string | null>(null);
    const handleCreatePlan = useCallback((deal: Deal) => setPlanEditorDealId(deal.id), []);
    const handleCreateLetter = useCallback((deal: Deal) => setLetterComposerDealId(deal.id), []);
    const handleShare = useCallback((deal: Deal) => setShareDealId(deal.id), []);
    const handleWithdraw = useCallback((deal: Deal) => setWithdrawDealId(deal.id), []);
    const handleRefresh = useCallback(
        (deal: Deal) => {
            refreshLetter(deal.id);
            toast(`Offer letter refreshed for ${deal.name}`);
        },
        [refreshLetter],
    );
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
            onRefresh: handleRefresh,
            onResend: handleResend,
            onWithdraw: handleWithdraw,
        }),
        [handleNotInterested, handleCopyLink, handleCreatePlan, handleCreateLetter, handleShare, handleRefresh, handleResend, handleWithdraw],
    );

    return (
        <AppShell>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Deals" }]} />
                    <h1 className="text-xl font-semibold text-primary">Deals</h1>
                    <p className="text-sm text-tertiary">
                        {scoped.length} deal{scoped.length === 1 ? "" : "s"} in view — scoped to {scopeLabel(roleLabel)}.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Input aria-label="Search name or email" placeholder="Search name or email…" icon={SearchLg} size="sm" className="w-64" value={search} onChange={setSearch} />
                    <Button color="secondary" size="sm" iconLeading={FilterLines} onClick={() => setFiltersOpen((v) => !v)}>
                        Filters
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
                            className={`flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap transition duration-100 ease-linear ${
                                isActive
                                    ? "border-fg-brand-primary_alt text-brand-secondary"
                                    : t.action
                                      ? "border-transparent text-error-primary hover:text-error-primary"
                                      : "border-transparent text-quaternary hover:text-secondary"
                            }`}
                        >
                            {t.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${isActive ? "bg-brand-primary_alt text-brand-secondary" : "bg-secondary text-tertiary"}`}>
                                {tabCounts[i]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {filtersOpen && <DealsFilterPanel persona={persona} filters={filters} onChange={setFilters} />}
            <DealsFilterChips filters={filters} onChange={setFilters} />

            <TableCard.Root>
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
                        onRowAction={(key) => navigate(`/deals/${key}`)}
                        size="md"
                    >
                        <Table.Header columns={COLUMNS}>{(column) => <Table.Head id={column.id} allowsSorting={column.allowsSorting} label={column.label} />}</Table.Header>
                        <Table.Body items={pageDeals}>
                            {(deal) => (
                                <Table.Row id={deal.id} columns={COLUMNS} className="cursor-pointer">
                                    {(column) => <Table.Cell>{renderCell(deal, column.id, rowHandlers)}</Table.Cell>}
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                )}
            </TableCard.Root>

            {sortedTabDeals.length > 0 && (
                <PaginationPageDefault page={page} total={totalPages} onPageChange={setPage} />
            )}

            <PaymentPlanEditor dealId={planEditorDealId} onOpenChange={(open) => !open && setPlanEditorDealId(null)} />
            <OfferLetterComposer dealId={letterComposerDealId} onOpenChange={(open) => !open && setLetterComposerDealId(null)} />
            <ShareOfferDialog dealId={shareDealId} onOpenChange={(open) => !open && setShareDealId(null)} />
            <WithdrawOfferDialog dealId={withdrawDealId} onOpenChange={(open) => !open && setWithdrawDealId(null)} />
        </AppShell>
    );
};

type RowHandlers = {
    onNotInterested: (d: Deal) => void;
    onCopyLink: (d: Deal) => void;
    onCreatePlan: (d: Deal) => void;
    onCreateLetter: (d: Deal) => void;
    onShare: (d: Deal) => void;
    onRefresh: (d: Deal) => void;
    onResend: (d: Deal) => void;
    onWithdraw: (d: Deal) => void;
};

/** The §6 row-action table, one branch per deal state. Every button reads its enabled state off
 * the same guards Section 02/03 read on the deal-detail page (§2.3) — disabled-with-tooltip,
 * never hidden, so the reason is always visible. */
function primaryRowActions(deal: Deal, handlers: RowHandlers) {
    if (deal.status.id === "APP_FILLED" || deal.status.id === "PLAN_NOT_STARTED") {
        const guard = canCreatePlan(deal);
        return [<ButtonUtility key="plan" size="sm" color="tertiary" tooltip={guard.allowed ? "Create payment plan" : guard.reason} icon={Mail01} isDisabled={!guard.allowed} onClick={() => handlers.onCreatePlan(deal)} />];
    }
    if (deal.status.id === "PLAN_DRAFT") {
        if (deal.offer.state === "stale") {
            return [<ButtonUtility key="refresh" size="sm" color="tertiary" tooltip="Refresh offer letter" icon={RefreshCcw01} onClick={() => handlers.onRefresh(deal)} />];
        }
        if (deal.offer.state === "created") {
            const guard = canShareLetter(deal);
            return [<ButtonUtility key="share" size="sm" color="tertiary" tooltip={guard.allowed ? "Share offer letter" : guard.reason} icon={Send01} isDisabled={!guard.allowed} onClick={() => handlers.onShare(deal)} />];
        }
        const guard = canCreateLetter(deal);
        return [<ButtonUtility key="letter" size="sm" color="tertiary" tooltip={guard.allowed ? "Create offer letter" : guard.reason} icon={Mail01} isDisabled={!guard.allowed} onClick={() => handlers.onCreateLetter(deal)} />];
    }
    if (deal.status.id === "PLAN_AWAITING_APPROVAL") {
        return [<ButtonUtility key="waiting" size="sm" color="tertiary" tooltip="With Sales Ops" icon={Mail01} isDisabled />];
    }
    if (deal.status.id === "OFFER_PENDING" || deal.status.id === "OFFER_ACCEPTED") {
        const withdrawGuard = canWithdraw(deal);
        return [
            <ButtonUtility key="resend" size="sm" color="tertiary" tooltip="Resend offer" icon={RefreshCcw01} onClick={() => handlers.onResend(deal)} />,
            <ButtonUtility key="withdraw" size="sm" color="tertiary" tooltip={withdrawGuard.allowed ? "Withdraw offer" : withdrawGuard.reason} icon={XClose} isDisabled={!withdrawGuard.allowed} onClick={() => handlers.onWithdraw(deal)} />,
        ];
    }
    if (deal.status.id === "OFFER_EXPIRED" || deal.status.id === "OFFER_WITHDRAWN") {
        const guard = canCreateLetter(deal);
        return [<ButtonUtility key="v2" size="sm" color="tertiary" tooltip="Create offer letter (v2)" icon={Mail01} isDisabled={!guard.allowed} onClick={() => handlers.onCreateLetter(deal)} />];
    }
    return [];
}

function renderCell(deal: Deal, columnId: string, handlers: RowHandlers) {
    switch (columnId) {
        case "name":
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        {deal.name}
                        {deal.intlFlag && <Globe02 className="size-3.5 text-fg-quaternary" aria-label="International" />}
                    </div>
                    <div className="font-mono text-xs text-tertiary">{deal.id}</div>
                </div>
            );
        case "mobile":
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm text-secondary">{deal.phone}</span>
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
            return (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {primaryRowActions(deal, handlers)}
                    <ButtonUtility size="sm" color="tertiary" tooltip="Mark as not interested" icon={XClose} onClick={() => handlers.onNotInterested(deal)} />
                    <ButtonUtility size="sm" color="tertiary" tooltip="Get form link" icon={Link03} onClick={() => handlers.onCopyLink(deal)} />
                </div>
            );
        }
        default:
            return null;
    }
}
