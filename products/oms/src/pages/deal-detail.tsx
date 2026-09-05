import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import {
    ArrowUpRight,
    Bookmark,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    Copy04,
    CreditCard01,
    DotsVertical,
    LinkExternal01,
    Pencil01,
    Receipt,
    RefreshCcw01,
    Shield01,
    SlashCircle01,
    XCircle,
} from "@untitledui/icons";
import { AppShell } from "@/components/application/app-shell";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/application/toast/toast";
import { BadgeWithFlag } from "@/components/base/badges/badges";
import type { FlagTypes } from "@/components/base/badges/badge-types";
import { Dot } from "@/components/foundations/dot-icon";
import { OfferWizard } from "@/components/deals/offer-wizard";
import { ActionNeededBadge, DealStatusBadge } from "@/components/deals/status-badge";
import HubspotIcon from "@/components/foundations/integration-icons/hubspot-icon";
import WhatsappIcon from "@/components/foundations/integration-icons/whatsapp-icon";
import offerLetterPreview from "@/assets/offer-letter-preview.png";
import { bdrs, teamLeads, teamManagers } from "@/data/dashboard-data";
import type { ActivityLogEntry, Deal, Installment } from "@/data/deals-data";
import { OFFER_TEMPLATES, STATUS, stateForCity } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

/** ISO-3166 codes for `BadgeWithFlag` — only the countries `CITIES` (deals-data.ts) uses. */
const COUNTRY_FLAG: Record<string, FlagTypes> = {
    India: "IN",
    UAE: "AE",
    Singapore: "SG",
    UK: "GB",
    Canada: "CA",
    Australia: "AU",
    Nigeria: "NG",
};

function copyToClipboard(value: string, label: string) {
    navigator.clipboard?.writeText(value).catch(() => {});
    toast(`${label} copied`);
}

function hashId(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h);
}
function pickStable<T>(id: string, arr: T[]): T {
    return arr[hashId(id) % arr.length];
}

function formatMoney(amount: number, currency: "INR" | "USD"): string {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US")}`;
}
function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(d: Date): string {
    const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${date}, ${time} IST`;
}
function formatRelative(d: Date, now: Date): string {
    const diffHrs = Math.round((now.getTime() - d.getTime()) / 3_600_000);
    if (diffHrs < 1) return "just now";
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
    const diffDays = Math.round(diffHrs / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

type MilestoneSubstage = { label: string; done: boolean; ts: Date | null };
type MilestoneGroupStatus = "Completed" | "In Progress" | "Pending";
type MilestoneGroup = { name: string; status: MilestoneGroupStatus; substages: MilestoneSubstage[] };

function statusForSubstages(substages: MilestoneSubstage[]): MilestoneGroupStatus {
    const doneCount = substages.filter((s) => s.done).length;
    if (doneCount === 0) return "Pending";
    if (doneCount === substages.length) return "Completed";
    return "In Progress";
}

/** Groups the deal's funnel into the three stage-level milestones the redesigned timeline
 * shows (Application / Offer / Payment & Enrolment), each broken into the substages that
 * `activityLog` already tracks — no separate milestone data model, just a different read of
 * the same log entries `buildActivityLog` (deals-data.ts) always produces. */
function getMilestoneGroups(deal: Deal): MilestoneGroup[] {
    const findEntry = (text: string): ActivityLogEntry | null => deal.activityLog.find((e) => e.text === text) ?? null;

    const appFilled = findEntry("Application filled by learner");
    const offerSent = findEntry("Offer letter sent");
    const offerAccepted = findEntry("Offer accepted by learner");
    const downPayment = findEntry("Down payment received");
    const paymentCompleted = findEntry("Final installment received — payment completed");
    const enrolled = deal.status.id === "PAY_COMPLETED";

    const application: MilestoneSubstage[] = [
        { label: "Application Sent", done: true, ts: deal.createdOn },
        { label: "Application Filled", done: !!appFilled, ts: appFilled?.ts ?? null },
    ];
    const offer: MilestoneSubstage[] = [
        { label: "Offer Sent", done: !!offerSent, ts: offerSent?.ts ?? null },
        { label: "Offer Accepted", done: !!offerAccepted, ts: offerAccepted?.ts ?? null },
    ];
    const paymentAndEnrolment: MilestoneSubstage[] = [
        { label: "Down Payment Received", done: !!downPayment, ts: downPayment?.ts ?? null },
        { label: "Payment Completed", done: !!paymentCompleted, ts: paymentCompleted?.ts ?? null },
        { label: "Enrolment", done: enrolled, ts: enrolled ? deal.lastUpdate : null },
    ];

    return [
        { name: "Application", status: statusForSubstages(application), substages: application },
        { name: "Offer", status: statusForSubstages(offer), substages: offer },
        { name: "Payment & Enrolment", status: statusForSubstages(paymentAndEnrolment), substages: paymentAndEnrolment },
    ];
}

/** Dashed 18px ring used on the stage rail — green+check when the stage is done, blue (no
 * check) otherwise. Exact path/colors from the Figma "Indicator" + "check" assets. */
const StageRingIcon = ({ done }: { done: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="block">
        <path
            d="M9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1Z"
            stroke={done ? "#22C55E" : "#60A5FA"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 4"
        />
    </svg>
);

/** 8px checkmark — used both as the stage ring's "done" overlay and next to a completed
 * substage. Exact path/color from the Figma "check" asset. */
const CheckGlyph = ({ className }: { className?: string }) => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className={className}>
        <path d="M6.66667 2L3 5.66667L1.33333 4" stroke="#22C55E" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/** 12px empty ring — a substage that hasn't happened yet. Exact path/color from the Figma
 * "placeholder" asset. */
const PendingRingIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="block">
        <path
            d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
            stroke="#7F56D9"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const MILESTONE_DOT_COLOR: Record<MilestoneGroupStatus, string> = {
    Completed: "text-fg-success-secondary",
    "In Progress": "text-fg-brand-primary",
    Pending: "text-fg-quaternary",
};

/** Neutral bordered pill (bg-primary/border-primary) with just the dot colored by status —
 * the Figma milestone Badge, distinct from the app's filled `BadgeWithDot`. */
const MilestoneStageBadge = ({ status }: { status: MilestoneGroupStatus }) => (
    <span className="flex items-center gap-1 rounded-md border border-primary bg-primary py-0.5 pr-2 pl-1.5 text-[10px] font-medium text-secondary shadow-xs">
        <Dot size="sm" className={MILESTONE_DOT_COLOR[status]} />
        {status}
    </span>
);

const MilestoneTimeline = ({ deal }: { deal: Deal }) => {
    const groups = getMilestoneGroups(deal);
    return (
        <div className="relative flex flex-col gap-5 pl-7">
            {/* Continuous dashed rail — evenly-spaced marks via a repeating gradient rather than
             * `border-dashed` (whose dash rhythm isn't controllable and reads as near-solid at
             * small widths). Each ring below punches a clean gap in it via its own bg-primary
             * mask, so the line never visibly touches a ring. */}
            <div
                aria-hidden
                className="absolute top-0 bottom-0 left-0 w-0.5 -translate-x-1/2"
                style={{ backgroundImage: "repeating-linear-gradient(to bottom, var(--color-fg-quaternary) 0px, var(--color-fg-quaternary) 4px, transparent 4px, transparent 12px)" }}
            />
            {groups.map((group) => (
                <div key={group.name} className="flex flex-col gap-3">
                    <div className="relative flex items-center justify-between gap-2">
                        <span className="absolute top-1/2 -left-7 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary">
                            <StageRingIcon done={group.status === "Completed"} />
                            {group.status === "Completed" && <CheckGlyph className="absolute inset-0 m-auto" />}
                        </span>
                        <span className="text-lg font-semibold text-primary">{group.name}</span>
                        <MilestoneStageBadge status={group.status} />
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                        {group.substages.map((substage) => (
                            <div key={substage.label} className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex size-3 shrink-0 items-center justify-center">{substage.done ? <CheckGlyph /> : <PendingRingIcon />}</span>
                                    <span className={`flex-1 text-xs ${substage.done ? "text-secondary" : "text-secondary_hover"}`}>{substage.label}</span>
                                    {!substage.done && <span className="font-mono text-[10px] text-tertiary">Pending</span>}
                                </div>
                                {substage.ts && (
                                    <span className="pl-5 font-mono text-[10px] text-placeholder">
                                        {formatDate(substage.ts)}, {substage.ts.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

/** One labelled field in the left rail's identity stack — label above value, Figma's
 * "dd-meta-line" pattern. `onCopy` renders a copy-to-clipboard affordance next to the value. */
const MetaField = ({
    label,
    value,
    mono,
    onCopy,
    leading,
    trailing,
}: {
    label: string;
    value: string;
    mono?: boolean;
    onCopy?: () => void;
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
}) => (
    <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-tertiary">{label}</span>
        <div className="flex items-center gap-2">
            {leading}
            <span className={`text-sm text-primary ${mono ? "font-mono font-semibold" : ""}`}>{value}</span>
            {onCopy && (
                <button
                    type="button"
                    onClick={onCopy}
                    aria-label={`Copy ${label}`}
                    className="rounded p-0.5 text-fg-quaternary transition-colors duration-100 ease-linear hover:bg-secondary_hover hover:text-fg-secondary active:bg-quaternary"
                >
                    <Copy04 className="size-4" />
                </button>
            )}
            {trailing}
        </div>
    </div>
);

const SideRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-tertiary">{label}</span>
        <span className="text-right font-medium text-secondary">{value}</span>
    </div>
);

/** Neutral bordered pill matching `MilestoneStageBadge`'s look, reused here for section
 * completion state ("Completed" vs "Pending") since the redesign uses the same badge
 * language for both. */
const SectionStatusBadge = ({ complete, label }: { complete: boolean; label?: string }) => (
    <span className="flex items-center gap-1 rounded-md border border-primary bg-primary px-1.5 py-0.5 text-[10px] font-medium text-secondary shadow-xs">
        <Dot size="sm" className={complete ? "text-fg-success-secondary" : "text-fg-quaternary"} />
        {label ?? (complete ? "Completed" : "Pending")}
    </span>
);

/** A numbered, always-expanded section card — the redesign drops the old collapse/expand
 * toggle entirely (every chevron in the Figma rework is hidden) in favor of a fixed
 * number + title + status badge header. */
const Section = ({
    number,
    title,
    complete,
    badgeLabel,
    children,
}: {
    number: string;
    title: string;
    complete: boolean;
    badgeLabel?: string;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary">
        <div className="flex items-center justify-between gap-2 bg-secondary px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-blue-400">{number}</span>
                <span className="text-primary">{title}</span>
            </div>
            <SectionStatusBadge complete={complete} label={badgeLabel} />
        </div>
        <div className="flex flex-col gap-6 px-4 py-6">{children}</div>
    </div>
);

/** One row of the Payment Plan fee ledger — label, a dashed connector, and a right-aligned
 * amount with a muted currency-code prefix (the new ledger uses "INR 2,45,000", not the "$"
 * symbol the installment rows below still use). */
const FeeRow = ({
    label,
    amount,
    currency,
    emphasis = false,
    compact = false,
    icon,
}: {
    label: string;
    amount: number;
    currency: "INR" | "USD";
    emphasis?: boolean;
    compact?: boolean;
    icon?: boolean;
}) => (
    <div className={`flex items-center gap-6 px-2 ${compact ? "py-1" : "py-3"}`}>
        <span className={`flex w-44 shrink-0 items-center gap-1.5 ${emphasis ? "text-base font-semibold text-primary" : "text-base text-placeholder"}`}>
            {label}
            {icon && <CheckCircle className="size-4 text-fg-success-secondary" />}
        </span>
        <div className="h-0 flex-1 border-b border-dashed border-tertiary" />
        <span className={`shrink-0 text-right ${emphasis ? "text-lg font-semibold text-primary" : "text-sm font-medium text-tertiary"}`}>
            <span className="mr-1 text-xs opacity-60">{currency}</span>
            {amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US")}
        </span>
    </div>
);

const InstallmentRow = ({ deal, installment, index, onEmiSubmit }: { deal: Deal; installment: Installment; index: number; onEmiSubmit: (index: number, months: number, amount: number) => void }) => {
    const [editing, setEditing] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [months, setMonths] = useState(String(installment.emiMonths ?? ""));
    const [amount, setAmount] = useState(String(installment.emiMonths ? Math.round(installment.amount / installment.emiMonths) : ""));

    const colorClass = installment.status === "Paid" ? "bg-fg-success-secondary" : installment.status === "Overdue" ? "bg-fg-warning-primary" : "bg-fg-brand-primary";

    return (
        <div className="group flex flex-col gap-2 rounded-lg border border-secondary p-3">
            <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    {installment.isEmi ? <CreditCard01 className="size-4 text-tertiary" /> : <Receipt className="size-4 text-tertiary" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-secondary">
                            {installment.label}
                            {installment.isEmi ? " · EMI" : ""}
                        </span>
                        <span className="font-semibold text-primary">{formatMoney(installment.amount, deal.currency)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-tertiary">
                        <span className={`inline-block size-1.5 rounded-full ${colorClass}`} />
                        {installment.status}
                        <span>·</span>
                        <span>{installment.mode}</span>
                        <span>·</span>
                        {installment.isEmi ? <span>{installment.emiMonths} months</span> : <span>Due {formatDate(new Date(installment.deadline))}</span>}
                    </div>
                </div>
                {installment.isEmi && !submitted && (
                    <button
                        type="button"
                        onClick={() => setEditing((v) => !v)}
                        className="rounded p-1 text-fg-quaternary opacity-0 transition-colors duration-100 ease-linear group-hover:opacity-100 hover:bg-secondary_hover hover:text-fg-secondary active:bg-quaternary"
                        title="Edit EMI terms"
                    >
                        <Pencil01 className="size-4" />
                    </button>
                )}
            </div>

            {editing && !submitted && (
                <div className="flex flex-col gap-3 border-t border-secondary pt-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Tenure (months)" type="number" size="sm" value={months} onChange={setMonths} />
                        <Input label="Monthly amount" type="number" size="sm" value={amount} onChange={setAmount} />
                    </div>
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => {
                            onEmiSubmit(index, Number(months) || installment.emiMonths || 0, Number(amount) || 0);
                            setSubmitted(true);
                            setEditing(false);
                        }}
                    >
                        Submit for re-approval
                    </Button>
                </div>
            )}
            {submitted && (
                <div className="flex items-center gap-1.5 border-t border-secondary pt-3 text-xs text-warning-primary">
                    <Shield01 className="size-3.5" />
                    Awaiting Sales Ops approval
                </div>
            )}
        </div>
    );
};

export const DealDetail = () => {
    const { dealId } = useParams<{ dealId: string }>();
    const navigate = useNavigate();
    const { deals, updateDeal, logActivity } = useDeals();
    const deal = deals.find((d) => d.id === dealId);

    const [applicationSlideoverOpen, setApplicationSlideoverOpen] = useState(false);
    const [offerWizardOpen, setOfferWizardOpen] = useState(false);
    const [activityLogOpen, setActivityLogOpen] = useState(true);
    const now = deals[0]?.lastUpdate ?? new Date();

    if (!deal) {
        return (
            <AppShell>
                <EmptyState size="sm">
                    <EmptyState.Content>
                        <EmptyState.Description>Deal not found.</EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            </AppShell>
        );
    }

    const bdr = bdrs.find((b) => b.id === deal.bdrId);
    const tl = teamLeads.find((t) => t.id === deal.tlId);
    const tm = teamManagers.find((t) => t.id === deal.tmId);

    const appComplete = deal.reachedStage >= 1 || deal.status.id === "APP_FILLED";
    const planComplete = deal.installments.length > 0;
    const offerComplete = deal.reachedStage >= 1;
    const enrollComplete = deal.reachedStage >= 2;

    const handleGlobalStatus = (statusId: "NOT_INTERESTED" | "REJECTED" | "SAVED") => {
        const reasons: Record<string, string> = {
            NOT_INTERESTED: "No longer pursuing this cohort",
            REJECTED: "Does not meet course prerequisites",
            SAVED: "Parked for the next intake",
        };
        updateDeal(deal.id, { status: STATUS[statusId] });
        logActivity(deal.id, `Deal marked ${STATUS[statusId].label}`, reasons[statusId]);
        toast(`${deal.name} → ${STATUS[statusId].label}`);
    };

    const handleReopen = () => {
        updateDeal(deal.id, { status: STATUS.APP_PENDING });
        logActivity(deal.id, "Deal Reopened", "Learner reached back out");
        toast(`Deal reopened for ${deal.name}`);
    };

    const handleOfferCta = () => setOfferWizardOpen(true);

    const handleEmiSubmit = (index: number, newMonths: number, newAmount: number) => {
        logActivity(deal.id, `EMI revision requested on Installment ${index + 1}`, `New terms: ${newMonths} months at ${formatMoney(newAmount, deal.currency)}/mo — pending Sales Ops approval`);
        toast("EMI change submitted for Sales Ops approval");
    };

    const duration = pickStable(deal.id, ["6 months", "9 months", "12 months"]);
    const startDate = new Date(now.getTime() + 20 * 86_400_000);
    const offerTemplate = offerComplete ? pickStable(deal.id, OFFER_TEMPLATES) : null;
    const lmsId = `LMS-${10000 + (hashId(deal.id) % 8999)}`;
    const firstSessionDate = new Date(now.getTime() + 12 * 86_400_000);

    return (
        <AppShell>
            <div className="flex flex-col gap-1">
                <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Deals", href: "/deals" }, { label: deal.id }]} />
                <button
                    type="button"
                    onClick={() => navigate("/deals")}
                    className="-mx-2 flex w-max items-center gap-1 rounded px-2 py-1 text-sm font-medium text-tertiary transition-colors duration-100 ease-linear hover:bg-secondary_hover hover:text-secondary active:bg-quaternary"
                >
                    <ChevronLeft className="size-4" />
                    Back to Deals
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr_320px]">
                {/* Left rail */}
                <div className="flex flex-col gap-8">
                    <div className="relative flex flex-col gap-6 opacity-80">
                        <button
                            type="button"
                            aria-label="More actions"
                            className="absolute top-0.5 right-0.5 rounded p-1 text-fg-quaternary transition-colors duration-100 ease-linear hover:bg-secondary_hover hover:text-fg-secondary active:bg-quaternary"
                        >
                            <DotsVertical className="size-5" />
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                            <DealStatusBadge status={deal.status} />
                            {deal.status.action && <ActionNeededBadge />}
                            <BadgeWithFlag size="sm" type="pill-color" color="slate" flag={COUNTRY_FLAG[deal.country] ?? "IN"}>
                                {deal.currency}
                            </BadgeWithFlag>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h1 className="text-display-sm font-semibold text-primary">{deal.name}</h1>
                            <span className="text-sm text-primary">
                                {deal.city}, {deal.country} {deal.postalCode}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <MetaField label="Course" value={deal.course.name} />
                            <MetaField label="Cohort" value={deal.cohort} />
                            <MetaField label="Application ID" value={deal.id} mono onCopy={() => copyToClipboard(deal.id, "Application ID")} />
                            <MetaField label="Email Address" value={deal.email} onCopy={() => copyToClipboard(deal.email, "Email address")} />
                            <MetaField label="Phone" value={deal.phone} onCopy={() => copyToClipboard(deal.phone, "Phone number")} />
                            <MetaField label="Created" value={formatDate(deal.createdOn)} />
                            <span className="text-xs text-tertiary">Updated {formatRelative(deal.lastUpdate, now)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => toast("Opening in HubSpot…")}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary p-3 text-xs font-semibold text-primary shadow-xs-skeuomorphic transition-colors duration-100 ease-linear hover:bg-secondary_hover active:bg-quaternary"
                        >
                            View On
                            <HubspotIcon className="h-5 w-auto" />
                        </button>
                        <button
                            type="button"
                            onClick={() => toast("Opening WhatsApp…")}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary p-3 text-xs font-semibold text-primary shadow-xs-skeuomorphic transition-colors duration-100 ease-linear hover:bg-secondary_hover active:bg-quaternary"
                        >
                            Chat On
                            <WhatsappIcon className="size-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-mono text-xs text-tertiary">GLOBAL STATUS</h4>
                        {deal.status.id === "NOT_INTERESTED" ? (
                            <Button color="secondary" size="sm" iconLeading={RefreshCcw01} onClick={handleReopen}>
                                Reopen deal
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Button color="secondary" size="sm" iconLeading={SlashCircle01} onClick={() => handleGlobalStatus("NOT_INTERESTED")}>
                                    Not Interested
                                </Button>
                                <Button color="secondary" size="sm" iconLeading={XCircle} onClick={() => handleGlobalStatus("REJECTED")}>
                                    Mark Reject
                                </Button>
                                <Button className="col-span-2" color="secondary" size="sm" iconLeading={Bookmark} onClick={() => handleGlobalStatus("SAVED")}>
                                    Save for Later
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <h4 className="font-mono text-xs text-tertiary">ASSIGNMENT</h4>
                        <div className="flex flex-col gap-3">
                            {bdr && <SideRow label="LC" value={bdr.name} />}
                            {tl && <SideRow label="TL" value={tl.name} />}
                            {tm && <SideRow label="TM" value={tm.name} />}
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="flex flex-col gap-4">
                    <Section number="01" title="Application" complete={appComplete}>
                        {appComplete ? (
                            <>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-medium text-primary">{deal.course.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-tertiary">
                                        <span>
                                            Duration: <span className="font-bold">{duration}</span>
                                        </span>
                                        <span className="h-3 w-px bg-[var(--color-border-tertiary)]" />
                                        <span>
                                            Starts: <span className="font-bold">{formatDate(startDate)}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button color="link-gray" size="sm" onClick={() => setApplicationSlideoverOpen(true)}>
                                        View application
                                    </Button>
                                    <Button color="link-color" size="sm" iconTrailing={ArrowUpRight} isDisabled>
                                        Edit Application
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-tertiary">Application not filled yet.</p>
                        )}
                    </Section>

                    <Section number="02" title="Payment Plan" complete={planComplete}>
                        {planComplete ? (
                            <>
                                <div className="flex flex-col">
                                    <FeeRow label="Course Fees (A)" amount={deal.courseFee} currency={deal.currency} emphasis />
                                    <FeeRow label="Total Discount (B)" amount={deal.discount} currency={deal.currency} emphasis />
                                    <div className="my-1 ml-4 flex flex-col border-l border-secondary pl-4">
                                        <FeeRow label="Upfront Discount" amount={deal.discountBreakdown.upfront} currency={deal.currency} icon compact />
                                        <FeeRow label="Scholarship" amount={deal.discountBreakdown.scholarship} currency={deal.currency} compact />
                                        <FeeRow label="BDR Discount" amount={deal.discountBreakdown.bdr} currency={deal.currency} compact />
                                    </div>
                                    <div className="border-t border-secondary">
                                        <FeeRow label="Net Payable Fee (A-B)" amount={deal.netPayable} currency={deal.currency} emphasis />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <p className="px-2 text-xs font-semibold tracking-wide text-quaternary uppercase">Installments</p>
                                    <div className="flex flex-col gap-3">
                                        {deal.installments.map((installment, i) => (
                                            <InstallmentRow key={i} deal={deal} installment={installment} index={i} onEmiSubmit={handleEmiSubmit} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button color="secondary" size="sm" isDisabled>
                                        Edit Course Fee Structure
                                    </Button>
                                    <span className="text-xs text-tertiary italic">*Can't update structure once payment plan is created.</span>
                                </div>
                            </>
                        ) : (
                            <EmptyState size="sm" className="mx-auto max-w-none py-4">
                                <EmptyState.Content>
                                    <EmptyState.Description>No payment plan yet.</EmptyState.Description>
                                </EmptyState.Content>
                                <Button color="primary" size="sm" onClick={handleOfferCta}>
                                    Send offer letter
                                </Button>
                            </EmptyState>
                        )}
                    </Section>

                    <Section number="03" title="Offer Letter" complete={offerComplete}>
                        {offerComplete && offerTemplate ? (
                            <>
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-xs text-tertiary">Template Used</span>
                                    <span className="text-base font-medium text-primary">{offerTemplate.name}</span>
                                </div>
                                <div className="overflow-hidden rounded-2xl">
                                    <img src={offerLetterPreview} alt="Offer letter preview" className="h-auto w-full object-cover" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button color="link-gray" size="sm" onClick={() => toast("Opening offer letter…")}>
                                        View Offer Letter
                                    </Button>
                                    <Button color="link-color" size="sm" iconTrailing={ArrowUpRight} isDisabled>
                                        Edit Offer Letter
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-tertiary">No offer sent yet — build a payment plan first.</p>
                                <Button color="secondary" size="sm" onClick={handleOfferCta}>
                                    {deal.reachedStage >= 1 ? "Revise offer letter" : "Send offer letter"}
                                </Button>
                            </>
                        )}
                    </Section>

                    <Section number="04" title="Enrolment" complete={enrollComplete}>
                        {enrollComplete ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <MetaField label="Applicant Name" value={deal.name} />
                                <MetaField label="Admission Counsellor" value={bdr?.name ?? "—"} />
                                <MetaField label="Application ID" value={deal.id} onCopy={() => copyToClipboard(deal.id, "Application ID")} />
                                <MetaField label="LMS ID" value={lmsId} onCopy={() => copyToClipboard(lmsId, "LMS ID")} />
                                <MetaField label="First Session at" value={formatDateTime(firstSessionDate)} />
                            </div>
                        ) : (
                            <p className="text-sm text-tertiary">Enrolment unlocks after the first payment.</p>
                        )}
                    </Section>
                </div>

                {/* Right rail */}
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-6 px-2">
                        <h4 className="font-mono text-sm text-tertiary">MILESTONES</h4>
                        <MilestoneTimeline deal={deal} />
                    </div>

                    <div className="flex flex-col gap-6 px-2">
                        <button
                            type="button"
                            onClick={() => setActivityLogOpen((v) => !v)}
                            className="flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 -mx-1"
                        >
                            <span className="font-mono text-sm text-tertiary">ACTIVITY LOG</span>
                            <ChevronDown className={`size-4 text-fg-quaternary transition-transform duration-150 ${activityLogOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence initial={false}>
                            {activityLogOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-col gap-4 border-l border-secondary_alt pl-4">
                                        {[...deal.activityLog]
                                            .slice()
                                            .reverse()
                                            .map((entry, i) => (
                                                <div key={i} className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1 font-mono text-[10px] text-placeholder">
                                                        <span>{formatDate(entry.ts)}</span>
                                                        <span>{entry.ts.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                                                    </div>
                                                    <span className={`text-xs text-tertiary ${entry.reason ? "font-semibold" : ""}`}>{entry.text}</span>
                                                    {entry.reason && <span className="text-xs text-tertiary italic">Reason: {entry.reason}</span>}
                                                </div>
                                            ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <SlideoutMenu.Trigger isOpen={applicationSlideoverOpen} onOpenChange={setApplicationSlideoverOpen}>
                <SlideoutMenu>
                    {({ close }) => (
                        <>
                            <SlideoutMenu.Header onClose={close}>
                                <div className="flex flex-col gap-2">
                                    <span className="text-md font-semibold text-primary">Application Details</span>
                                    <Button color="link-color" size="sm" iconTrailing={ArrowUpRight} isDisabled>
                                        Edit Application
                                    </Button>
                                </div>
                            </SlideoutMenu.Header>
                            <SlideoutMenu.Content>
                                <FormSection title="Basic Information">
                                    <MetaField label="Name" value={deal.name} />
                                    <MetaField label="Phone" value={deal.phone} onCopy={() => copyToClipboard(deal.phone, "Phone number")} />
                                    <MetaField label="Email Address" value={deal.email} onCopy={() => copyToClipboard(deal.email, "Email address")} />
                                    <MetaField label="City" value={deal.city} />
                                    <MetaField label="State" value={stateForCity(deal.city)} />
                                    <MetaField
                                        label="Country"
                                        value={deal.country}
                                        leading={
                                            <img
                                                src={`https://www.untitledui.com/images/flags/${COUNTRY_FLAG[deal.country] ?? "IN"}.svg`}
                                                className="size-4 rounded-full"
                                                alt=""
                                            />
                                        }
                                    />
                                </FormSection>

                                <FormSection title="Professional Details">
                                    <MetaField label="Current Role" value={deal.applicationDetails.role} />
                                    <MetaField label="Experience" value={deal.applicationDetails.experience} />
                                    <MetaField label="English Proficiency" value={deal.applicationDetails.englishLevel} />
                                    <MetaField label="Income Band" value={deal.applicationDetails.incomeBand} />
                                    <MetaField label="Tools" value={deal.applicationDetails.tools} />
                                </FormSection>

                                <FormSection title="Educational Details">
                                    <MetaField label="Qualification" value={deal.applicationDetails.qualification} />
                                    <MetaField label="Percentage/CGPA" value={deal.applicationDetails.percentageCgpa} />
                                    <MetaField
                                        label="LinkedIn"
                                        value="Yes"
                                        trailing={
                                            <a
                                                href={`https://${deal.applicationDetails.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Open LinkedIn profile"
                                                className="text-fg-quaternary hover:text-fg-secondary"
                                            >
                                                <LinkExternal01 className="size-4" />
                                            </a>
                                        }
                                    />
                                    <MetaField
                                        label="CV/Resume"
                                        value="Yes"
                                        trailing={
                                            <button
                                                type="button"
                                                onClick={() => toast("Downloading CV…")}
                                                aria-label="Download CV"
                                                className="text-fg-quaternary hover:text-fg-secondary"
                                            >
                                                <LinkExternal01 className="size-4" />
                                            </button>
                                        }
                                    />
                                </FormSection>

                                <FormSection title="Statement of Purpose" divider={false} cols={1}>
                                    <MetaField label="What is your current knowledge in BIM?" value={deal.applicationDetails.bimKnowledge} />
                                    <MetaField label="Why do you want to learn BIM?" value={deal.applicationDetails.whyLearn} />
                                    <MetaField
                                        label="SOP"
                                        value={`Discovered Novatr through a ${deal.sopSource}. Looking to strengthen practical, industry-relevant skills in ${deal.course.name} to move into a more technical role within the next year.`}
                                    />
                                </FormSection>

                                <p className="text-[10px] text-tertiary italic">End of form</p>
                            </SlideoutMenu.Content>
                        </>
                    )}
                </SlideoutMenu>
            </SlideoutMenu.Trigger>

            <OfferWizard dealId={offerWizardOpen ? deal.id : null} onOpenChange={(open) => setOfferWizardOpen(open)} />
        </AppShell>
    );
};

const FormSection = ({
    title,
    children,
    divider = true,
    cols = 2,
}: {
    title: string;
    children: React.ReactNode;
    divider?: boolean;
    cols?: 1 | 2;
}) => (
    <div className={`flex flex-col gap-3 ${divider ? "border-b border-secondary pb-6" : ""}`}>
        <span className="text-md font-semibold text-primary">{title}</span>
        <div className={cols === 2 ? "grid grid-cols-2 gap-x-4 gap-y-4" : "flex flex-col gap-4"}>{children}</div>
    </div>
);
