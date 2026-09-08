import { useState } from "react";
import {
    ArrowUpRight,
    Bookmark,
    ChevronDown,
    Copy04,
    DotsVertical,
    LinkExternal01,
    MagicWand01,
    RefreshCcw01,
    SlashCircle01,
    XCircle,
} from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { Button as AriaButton } from "react-aria-components";
import { useLocation, useParams } from "react-router";
import { AppShell } from "@/components/application/app-shell";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { toast } from "@/components/application/toast/toast";
import { BadgeWithFlag } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { ApplicationLinkDialog } from "@/components/deals/application-link-dialog";
import type { ApplicationLinkRequest } from "@/components/deals/application-link-dialog";
import { ApplicationSectionCard } from "@/components/deals/application-section-card";
import { GlobalStatusDialog } from "@/components/deals/global-status-dialog";
import type { GlobalStatusRequest } from "@/components/deals/global-status-dialog";
import { LearnerSimPad } from "@/components/deals/learner-sim-pad";
import { OfferEmailModal } from "@/components/deals/offer-email-preview";
import { OfferLetterComposer } from "@/components/deals/offer-letter-composer";
import { PaymentPlanSectionCard } from "@/components/deals/payment-plan-section-card";
import { ShareOfferDialog, WithdrawOfferDialog } from "@/components/deals/share-offer-dialog";
import { ActionNeededBadge, DealStatusBadge } from "@/components/deals/status-badge";
import { Dot } from "@/components/foundations/dot-icon";
import HubspotIcon from "@/components/foundations/integration-icons/hubspot-icon";
import WhatsappIcon from "@/components/foundations/integration-icons/whatsapp-icon";
import { bdrs, teamLeads, teamManagers } from "@/data/dashboard-data";
import type { ActivityLogEntry, Deal } from "@/data/deals-data";
import { COUNTRY_FLAG, STATUS, applicationFormUrl, canCreateLetter, canResendApplication, canResendLetter, canWithdraw, stateForCity } from "@/data/deals-data";
import { resolveOfferEmail } from "@/data/offer-emails";
import { useDeals } from "@/providers/deals-provider";
import { cx } from "@/utils/cx";

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
/** Deadline, date + time — §"deadline visibility": the old display was date-only. Pinned to
 * 11:59 PM, the same convention `ShareOfferDialog` and the offer emailers use, since the plan
 * only carries a calendar date. */
function formatDeadlineDateTime(iso: string): string {
    const d = new Date(`${iso}T23:59:59`);
    return `${formatDate(d)}, 11:59 PM`;
}
/** "Feb 12, 2024, 6:10 PM" — the Offer Letter section's real-timestamp fields (Accepted On,
 * Payment made on, Withdrawn on), matching Figma's node 466-42458 date style. */
function formatEventDateTime(d: Date): string {
    return `${formatDate(d)}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}
function formatRelative(d: Date, now: Date): string {
    const diffHrs = Math.round((now.getTime() - d.getTime()) / 3_600_000);
    if (diffHrs < 1) return "just now";
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
    const diffDays = Math.round(diffHrs / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

/** Course-card duration facts (Figma's "24 Weeks" + "8 Months, online (8-10 hours/week)" pair)
 * — the weeks/months figures are independent mock labels, not a weeks-per-month conversion, so
 * each profile spells both out rather than deriving one from the other. */
const COURSE_DURATION_PROFILES = [
    { weeks: 24, months: 8, hoursPerWeek: "8-10" },
    { weeks: 36, months: 10, hoursPerWeek: "10-12" },
    { weeks: 48, months: 12, hoursPerWeek: "6-8" },
];

/** A third state beyond done/not-done — a substage that's actively underway (Figma node
 * 404:11525, Property1=Ongoing) rather than either finished or not started. Only "Payment Plan
 * Created" has a real underlying tri-state to read this off (`deal.plan.state`); every other
 * substage is a single discrete event, so it only ever lands on "done" or "pending". */
type MilestoneSubstageStatus = "done" | "ongoing" | "pending";
type MilestoneSubstage = { label: string; status: MilestoneSubstageStatus; ts: Date | null };
type MilestoneGroupStatus = "Completed" | "In Progress" | "Pending";
type MilestoneGroup = { name: string; status: MilestoneGroupStatus; substages: MilestoneSubstage[] };

function statusForSubstages(substages: MilestoneSubstage[]): MilestoneGroupStatus {
    const doneCount = substages.filter((s) => s.status === "done").length;
    if (doneCount === substages.length) return "Completed";
    if (doneCount > 0 || substages.some((s) => s.status === "ongoing")) return "In Progress";
    return "Pending";
}

/** Groups the deal's funnel into three stage-level milestones (Application / Offer / Payment &
 * Enrolment), each broken into the substages that `activityLog` already tracks — no separate
 * milestone data model, just a different read of the same log entries `buildActivityLog`
 * (deals-data.ts) always produces (Figma node 487:9788). Payment Plan Created lives under Offer,
 * not Application — a plan has to exist before a letter can be created off it, so it's the first
 * thing that happens in that stage. "Application Form Opened" and "Offer Letter Opened" have no
 * real signal behind them yet (this prototype has no learner-facing surface to detect it) — they
 * only move off "Pending" via the QA sim pad's matching buttons (TEMP(dev), see
 * `learner-sim-pad.tsx`). */
function getMilestoneGroups(deal: Deal): MilestoneGroup[] {
    const findEntry = (text: string): ActivityLogEntry | null => deal.activityLog.find((e) => e.text === text) ?? null;

    const appOpened = findEntry("Application form opened by learner");
    const appFilled = findEntry("Application filled by learner");
    const planCreated = findEntry("Payment plan created");
    const offerCreated = findEntry("Offer letter created");
    const offerShared = findEntry("Offer letter shared");
    const offerOpened = findEntry("Offer letter opened by learner");
    const offerAccepted = findEntry("Offer accepted by learner");
    const downPayment = findEntry("Down payment received");
    const paymentCompleted = findEntry("Final installment received — payment completed");
    const enrolled = deal.status.id === "PAY_COMPLETED";

    // Not started / drafted-or-with-Sales-Ops / locked — the three plan.state buckets that
    // actually matter for "is this substage done yet", rather than the flat "does a plan exist"
    // read `!!planCreated` gave every other state.
    const planStatus: MilestoneSubstageStatus =
        deal.plan.state === "none" ? "pending" : deal.plan.state === "committed" || deal.plan.state === "active" ? "done" : "ongoing";

    const application: MilestoneSubstage[] = [
        { label: "Application Sent", status: deal.application.sentOn ? "done" : "pending", ts: deal.application.sentOn },
        { label: "Application Form Opened", status: appOpened ? "done" : "pending", ts: appOpened?.ts ?? null },
        { label: "Application Filled", status: appFilled ? "done" : "pending", ts: appFilled?.ts ?? null },
    ];
    const offer: MilestoneSubstage[] = [
        { label: "Payment Plan Created", status: planStatus, ts: planCreated?.ts ?? null },
        { label: "Offer Letter Created", status: offerCreated ? "done" : "pending", ts: offerCreated?.ts ?? null },
        { label: "Offer Letter Shared", status: offerShared ? "done" : "pending", ts: offerShared?.ts ?? null },
        { label: "Offer Letter Opened", status: offerOpened ? "done" : "pending", ts: offerOpened?.ts ?? null },
        { label: "Offer Accepted", status: offerAccepted ? "done" : "pending", ts: offerAccepted?.ts ?? null },
    ];
    const paymentAndEnrolment: MilestoneSubstage[] = [
        { label: "Down Payment Received", status: downPayment ? "done" : "pending", ts: downPayment?.ts ?? null },
        { label: "Payment Completed", status: paymentCompleted ? "done" : "pending", ts: paymentCompleted?.ts ?? null },
        { label: "Enrolment", status: enrolled ? "done" : "pending", ts: enrolled ? deal.lastUpdate : null },
    ];

    return [
        { name: "Application", status: statusForSubstages(application), substages: application },
        { name: "Offer", status: statusForSubstages(offer), substages: offer },
        { name: "Payment & Enrolment", status: statusForSubstages(paymentAndEnrolment), substages: paymentAndEnrolment },
    ];
}

/** Dashed 18px ring used on the stage rail — color keys off the stage's own three-way status
 * (green/amber/gray), not just done-vs-not. Exact paths/colors from the Figma "Indicator" assets
 * (node 487:10163, Completed/In Progress/Upcoming). */
const STAGE_RING_COLOR: Record<MilestoneGroupStatus, string> = {
    Completed: "#22C55E",
    "In Progress": "#F59E0B",
    Pending: "#A3A3A3",
};
const StageRingIcon = ({ status }: { status: MilestoneGroupStatus }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="block">
        <path
            d="M9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1Z"
            stroke={STAGE_RING_COLOR[status]}
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

/** 12px empty ring — a substage that hasn't happened yet. Gray, matching the same "pending"
 * tone as the stage ring (#A3A3A3) — the exported "placeholder" asset's own stroke read purple,
 * but that's not what the pending state actually looks like in Figma. */
const PendingRingIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="block">
        <path
            d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
            stroke="#A3A3A3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/** 12px asterisk — a substage that's actively underway (e.g. a payment plan drafted but not
 * yet locked), distinct from done (check) and not-yet-started (empty ring). Exact path/color
 * from the Figma "asterisk-02" asset. */
const OngoingGlyph = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="block">
        <path d="M6 2V10M9 3L3 9M10 6H2M9 9L3 3" stroke="#F59E0B" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MILESTONE_DOT_COLOR: Record<MilestoneGroupStatus, string> = {
    Completed: "text-[#22C55E]",
    "In Progress": "text-[#EAB308]",
    Pending: "text-[#64748B]",
};

/** Neutral bordered pill with just the dot colored by status — the Figma milestone Badge,
 * distinct from the app's filled `BadgeWithDot`. Only the Pending badge fills solid
 * (bg-primary); Completed/In Progress stay border-only with brighter text (Figma node
 * 487:9788's three Badge instances). */
const MilestoneStageBadge = ({ status }: { status: MilestoneGroupStatus }) => (
    <span
        className={`flex items-center gap-1 rounded-md border border-primary py-0.5 pr-2 pl-1.5 text-[10px] font-medium shadow-xs ${
            status === "Pending" ? "bg-primary text-placeholder" : "text-secondary"
        }`}
    >
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
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(to bottom, var(--color-fg-quaternary) 0px, var(--color-fg-quaternary) 4px, transparent 4px, transparent 12px)",
                }}
            />
            {groups.map((group) => (
                <div key={group.name} className="flex flex-col gap-3">
                    <div className="relative flex items-center justify-between gap-2">
                        <span className="absolute top-1/2 -left-7 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary">
                            <StageRingIcon status={group.status} />
                            {group.status === "Completed" && <CheckGlyph className="absolute inset-0 m-auto" />}
                        </span>
                        <span className="text-lg font-semibold text-primary">{group.name}</span>
                        <MilestoneStageBadge status={group.status} />
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                        {group.substages.map((substage) => (
                            <div key={substage.label} className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex size-3 shrink-0 items-center justify-center">
                                        {substage.status === "done" ? (
                                            <CheckGlyph />
                                        ) : substage.status === "ongoing" ? (
                                            <OngoingGlyph />
                                        ) : (
                                            <PendingRingIcon />
                                        )}
                                    </span>
                                    <span className={`flex-1 text-xs ${substage.status === "done" ? "text-secondary" : "text-secondary_hover"}`}>
                                        {substage.label}
                                    </span>
                                    {substage.status === "ongoing" && <span className="font-mono text-[10px] text-[#EAB308]">Ongoing</span>}
                                    {substage.status === "pending" && <span className="font-mono text-[10px] text-tertiary">Pending</span>}
                                </div>
                                {substage.status === "done" && substage.ts && (
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
const SectionStatusBadge = ({ complete, label, dotClass }: { complete: boolean; label?: string; dotClass: string }) => (
    <span className="flex items-center gap-1 rounded-md border border-primary bg-primary px-1.5 py-0.5 text-[10px] font-medium text-secondary shadow-xs">
        <Dot size="sm" className={dotClass} />
        {label ?? (complete ? "Completed" : "Pending")}
    </span>
);

/** Collapsed placeholder row for a section that's locked behind the Application stage — Figma's
 * "dd-main" frame (404:9220) renders 02/03/04 this way whenever 01 isn't complete yet, each one
 * dimmer than the last (80% / 60% / 40%) to read as progressively further away, with the
 * trailing badge carrying its own nested 30% opacity on top of that. */
const LockedSectionRow = ({ number, title, opacity }: { number: string; title: string; opacity: number }) => (
    <div className="flex items-center justify-between rounded-lg bg-tertiary/30 px-4 py-6" style={{ opacity }}>
        <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-fg-quaternary">{number}</span>
            <span className="text-tertiary">{title}</span>
        </div>
        <div className="opacity-30">
            <SectionStatusBadge complete={false} dotClass="text-fg-quaternary" />
        </div>
    </div>
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
}) => {
    const dotClass = complete ? "text-fg-success-secondary" : "text-fg-quaternary";
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary">
            <div className="flex items-center justify-between gap-2 bg-secondary px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={dotClass}>{number}</span>
                    <span className="text-primary">{title}</span>
                </div>
                <SectionStatusBadge complete={complete} label={badgeLabel} dotClass={dotClass} />
            </div>
            <div className="flex flex-col gap-6 px-4 py-6">{children}</div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// "03 Offer Letter" — a bespoke, pixel-matched rebuild of Figma node 466-42458,
// not the generic `Section`/`MetaField` above. Five states now (2026-09-08
// Offer Letter redesign): Pending (offer.state "none"/"created" — a fleeting
// "created" only exists between clicking Share and confirming, so it reads as
// Pending too), Offer Shared, Accepted, Expired, and Withdrawn — "stale" is
// gone entirely (creating a letter always ends in sharing it now, so the
// unshared-edit window staleness needed no longer exists).
// ---------------------------------------------------------------------------

type OfferSectionState = "pending" | "shared" | "accepted" | "completed" | "expired" | "withdrawn";

const OFFER_BADGE: Record<OfferSectionState, { label: string; dotClass: string }> = {
    pending: { label: "Pending", dotClass: "text-utility-amber-500" },
    shared: { label: "Shared", dotClass: "text-utility-amber-500" },
    accepted: { label: "Accepted", dotClass: "text-utility-green-500" },
    completed: { label: "Completed", dotClass: "text-utility-green-500" },
    expired: { label: "Expired", dotClass: "text-utility-amber-500" },
    withdrawn: { label: "Withdrawn", dotClass: "text-utility-red-500" },
};

const OfferSectionBadge = ({ state }: { state: OfferSectionState }) => {
    const { label, dotClass } = OFFER_BADGE[state];
    return (
        <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-secondary shadow-xs">
            <Dot size="sm" className={dotClass} />
            {label}
        </span>
    );
};

/** IBM Plex Mono 12px label over an Inter/system 16px medium value — Figma's "at a glance" row,
 * distinct from the generic `MetaField` (14px value) used by 01/04 elsewhere on this page. */
const OfferField = ({ label, value, tone = "muted" }: { label: string; value: string; tone?: "muted" | "success" | "error" }) => (
    <div className="flex flex-col px-2">
        <span
            className={cx(
                "font-mono text-xs",
                tone === "success" ? "text-fg-success-primary" : tone === "error" ? "text-fg-error-primary" : "text-tertiary",
            )}
        >
            {label}
        </span>
        <span className="text-md font-medium text-primary">{value}</span>
    </div>
);

/** Figma's "Buttons/Button" component — flat `bg-secondary_hover`, no ring, the same
 * `shadow-xs-skeuomorphic` treatment the shared `Button` component's own colors use. Icons stay
 * the same muted gray regardless of emphasis; only the label brightens for the row's primary
 * action (matches Figma exactly — verified against the exported icon SVGs' own stroke colors). */
const OfferButton = ({
    icon: Icon,
    label,
    emphasis = "primary",
    isDisabled,
    disabledReason,
    onClick,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    emphasis?: "primary" | "secondary";
    isDisabled?: boolean;
    /** Shown on hover when disabled — not the native `disabled` attribute below, since a
     * natively-disabled button fires no pointer events at all and could never be hovered. */
    disabledReason?: string;
    onClick?: () => void;
}) => {
    // `AriaButton`, not a plain `<button>` — a hover-triggered `Tooltip` only reaches components
    // that call react-aria's `useFocusable` internally, which a bare host element never does. And
    // deliberately not `isDisabled` on it either: react-aria renders that as the native `disabled`
    // attribute (no pointer events fire on that at all) *and* separately skips forwarding the
    // tooltip's own hover props whenever `isDisabled` is set. `aria-disabled` gets the same
    // visual/semantic disabled state — the press handler below is what actually blocks the click.
    const button = (
        <AriaButton
            aria-disabled={isDisabled || undefined}
            onPress={() => !isDisabled && onClick?.()}
            className="relative inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-secondary_hover p-3 text-xs font-semibold shadow-xs-skeuomorphic outline-hidden transition duration-100 ease-linear hover:bg-quaternary aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
            <Icon className={cx("size-5 text-fg-quaternary", emphasis === "primary" ? "text-primary" : "text-secondary")} />
            <span className={emphasis === "primary" ? "text-primary" : "text-secondary"}>{label}</span>
        </AriaButton>
    );
    return isDisabled && disabledReason ? (
        <Tooltip title={disabledReason} placement="bottom">
            {button}
        </Tooltip>
    ) : (
        button
    );
};

/** Withdraw Offer — the one ghost/borderless button in the set, always paired with the red
 * slash-circle icon regardless of the label's own muted tone (matches the exported SVG). */
const OfferGhostButton = ({
    label,
    isDisabled,
    disabledReason,
    onClick,
}: {
    label: string;
    isDisabled?: boolean;
    disabledReason?: string;
    onClick?: () => void;
}) => {
    const button = (
        <AriaButton
            aria-disabled={isDisabled || undefined}
            onPress={() => !isDisabled && onClick?.()}
            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg p-3 text-xs font-semibold text-tertiary outline-hidden transition duration-100 ease-linear hover:text-secondary aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
            <SlashCircle01 className="size-4 text-red-500" />
            {label}
        </AriaButton>
    );
    return isDisabled && disabledReason ? (
        <Tooltip title={disabledReason} placement="bottom">
            {button}
        </Tooltip>
    ) : (
        button
    );
};

export const DealDetail = () => {
    const { dealId } = useParams<{ dealId: string }>();
    const location = useLocation();
    // Set by the Deals List row click — the exact list URL (tab/page/search/filters) the deal
    // was opened from, so leaving this page restores that view instead of resetting to "All".
    // Falls back to the bare list when there's no such state (a direct link, or a page refresh).
    const backTo = (location.state as { from?: string } | null)?.from || "/deals";
    const { deals, updateDeal, logActivity, resendLetter } = useDeals();
    const deal = deals.find((d) => d.id === dealId);

    const [applicationSlideoverOpen, setApplicationSlideoverOpen] = useState(false);
    const [letterComposerDealId, setLetterComposerDealId] = useState<string | null>(null);
    const [shareDealId, setShareDealId] = useState<string | null>(null);
    const [withdrawDealId, setWithdrawDealId] = useState<string | null>(null);
    const [emailModalDealId, setEmailModalDealId] = useState<string | null>(null);
    const [globalStatusRequest, setGlobalStatusRequest] = useState<GlobalStatusRequest>(null);
    const [applicationLinkRequest, setApplicationLinkRequest] = useState<ApplicationLinkRequest>(null);
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
    // Mirrors `PaymentPlanSectionCard`'s own "has a plan been saved" check — Offer Letter and
    // Enrolment stay locked (like 02/03/04 do while Application isn't complete) until there's an
    // actual plan to build an offer against, not just a "customise it" prompt.
    const planComplete = deal.installments.length > 0;
    const letterGuardCreate = canCreateLetter(deal);
    const letterGuardResend = canResendLetter(deal);
    const withdrawGuard = canWithdraw(deal);
    // A fleeting "created" (between clicking Share and confirming the send) reads as Pending
    // too — there's no more standalone "drafted, not shared" resting state to show separately.
    // An accepted offer further splits into "accepted" (nothing paid yet) vs "completed" (the
    // first payment has landed) — the same `booking.bookedOn` signal the "Payment made on" field
    // already reads from.
    const offerSectionState: OfferSectionState =
        deal.offer.state === "none" || deal.offer.state === "created"
            ? "pending"
            : deal.offer.state === "accepted" && deal.booking.bookedOn
              ? "completed"
              : deal.offer.state;
    // Shifted from >=2 to >=3 — ReachedStage grew a rank for the Plan stage (§3.3): old "reached
    // payment ongoing" (2) is now 3.
    const enrollComplete = deal.reachedStage >= 3;

    const handleReopen = () => {
        updateDeal(deal.id, { status: STATUS.APP_PENDING });
        logActivity(deal.id, "Deal Reopened", "Learner reached back out");
        toast(`Deal reopened for ${deal.name}`);
    };

    const durationProfile = pickStable(deal.id, COURSE_DURATION_PROFILES);
    const startDate = new Date(now.getTime() + 20 * 86_400_000);
    const lmsId = `LMS-${10000 + (hashId(deal.id) % 8999)}`;
    const firstSessionDate = new Date(now.getTime() + 12 * 86_400_000);
    const offerEmailHtml = resolveOfferEmail(deal, now);
    // "Accepted On" has no dedicated field — the same activity-log entry the milestone rail
    // already reads from is the single source of truth for when that happened.
    const acceptedLogEntry = deal.activityLog.find((e) => e.text === "Offer accepted by learner");
    // "Withdrawn on" / "Withdraw Reason" likewise aren't separate offer fields — they're exactly
    // what withdrawOffer already appends to offerHistory, so the most recent withdrawn entry
    // (there's only ever one, since a v2 letter start a fresh cycle) is the current withdrawal.
    const lastWithdrawal = deal.offerHistory.filter((h) => h.endedBy === "withdrawn").at(-1);

    return (
        <AppShell>
            <div className="flex flex-col gap-1">
                <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Deals", href: backTo }, { label: deal.id }]} />
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
                                <button
                                    type="button"
                                    onClick={() => setGlobalStatusRequest({ dealId: deal.id, kind: "not-interested" })}
                                    className="flex items-center justify-center gap-1 rounded-lg bg-secondary p-3 text-xs font-semibold text-primary shadow-xs-skeuomorphic transition-colors duration-100 ease-linear hover:bg-secondary_hover active:bg-quaternary"
                                >
                                    <SlashCircle01 className="size-4" />
                                    Not Interested
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGlobalStatusRequest({ dealId: deal.id, kind: "rejected" })}
                                    className="flex items-center justify-center gap-1 rounded-lg bg-secondary p-3 text-xs font-semibold text-primary shadow-xs-skeuomorphic transition-colors duration-100 ease-linear hover:bg-secondary_hover active:bg-quaternary"
                                >
                                    <XCircle className="size-4" />
                                    Mark Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGlobalStatusRequest({ dealId: deal.id, kind: "saved" })}
                                    className="col-span-2 flex items-center justify-center gap-1 rounded-lg bg-secondary p-3 text-xs font-semibold text-primary shadow-xs-skeuomorphic transition-colors duration-100 ease-linear hover:bg-secondary_hover active:bg-quaternary"
                                >
                                    <Bookmark className="size-4" />
                                    Save for Later
                                </button>
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
                    <ApplicationSectionCard
                        courseName={deal.course.name}
                        durationValue={`${durationProfile.weeks} Weeks, ${durationProfile.months} Months`}
                        effortsValue={`Online (${durationProfile.hoursPerWeek} hours/week)`}
                        startDateLabel={formatDate(startDate)}
                        status={appComplete ? "completed" : deal.status.id === "APP_NEW" ? "new" : deal.status.id === "APP_EXPIRED" ? "expired" : "pending"}
                        applicationUrl={applicationFormUrl(deal)}
                        sentOnLabel={deal.application.sentOn ? formatDate(deal.application.sentOn) : null}
                        resendCount={deal.application.resendCount}
                        canResend={canResendApplication(deal).allowed}
                        onSend={() => setApplicationLinkRequest({ dealId: deal.id, mode: "send" })}
                        onResend={() => setApplicationLinkRequest({ dealId: deal.id, mode: "resend" })}
                        onCopyLink={() => copyToClipboard(applicationFormUrl(deal), "Application link")}
                        onViewApplication={() => setApplicationSlideoverOpen(true)}
                    />

                    {!appComplete ? (
                        <>
                            <LockedSectionRow number="02" title="Payment Plan" opacity={0.8} />
                            <LockedSectionRow number="03" title="Offer Letter" opacity={0.6} />
                            <LockedSectionRow number="04" title="Enrolment" opacity={0.4} />
                        </>
                    ) : (
                        <>
                            <PaymentPlanSectionCard deal={deal} />

                            {!planComplete ? (
                                <>
                                    <LockedSectionRow number="03" title="Offer Letter" opacity={0.6} />
                                    <LockedSectionRow number="04" title="Enrolment" opacity={0.4} />
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col overflow-hidden rounded-xl bg-primary_alt">
                                        <div className="flex w-full items-center justify-between bg-tertiary/30 p-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <span className={OFFER_BADGE[offerSectionState].dotClass}>03</span>
                                                <span className="text-primary">Offer Letter</span>
                                            </div>
                                            <OfferSectionBadge state={offerSectionState} />
                                        </div>

                                        {offerSectionState === "pending" ? (
                                            <div className="w-full p-6">
                                                <div className="flex w-full flex-col items-start gap-4 rounded-2xl bg-gradient-to-b from-tertiary/10 to-tertiary p-6 shadow-lg">
                                                    <p className="text-sm text-primary">
                                                        {letterGuardCreate.allowed
                                                            ? "An Offer Letter hasn't been shared with the Learner yet."
                                                            : letterGuardCreate.reason}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        disabled={!letterGuardCreate.allowed}
                                                        onClick={() => setLetterComposerDealId(deal.id)}
                                                        className="relative inline-flex items-center justify-center gap-1 rounded-lg bg-fg-secondary_hover px-5 py-3 text-xs font-semibold text-neutral-900 shadow-xs-skeuomorphic transition duration-100 ease-linear hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <MagicWand01 className="size-5" />
                                                        Create Offer Letter
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex w-full flex-col gap-8 p-6">
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <OfferField label="Template Used" value={deal.offer.template?.name ?? "—"} />
                                                    <OfferField
                                                        label="Deadline"
                                                        value={deal.offer.deadline ? formatDeadlineDateTime(deal.offer.deadline) : "—"}
                                                    />
                                                    <OfferField
                                                        label="Net Payable (as shared)"
                                                        value={deal.offer.snapshot ? formatMoney(deal.offer.snapshot.netPayable, deal.currency) : "—"}
                                                    />
                                                    <OfferField
                                                        label="Version"
                                                        value={`v${deal.offer.version}${deal.offer.resendCount ? `.resent${deal.offer.resendCount}x` : ""}`}
                                                    />
                                                    {(offerSectionState === "accepted" || offerSectionState === "completed") && (
                                                        <>
                                                            <OfferField
                                                                label="Accepted On"
                                                                tone="success"
                                                                value={acceptedLogEntry ? formatEventDateTime(acceptedLogEntry.ts) : "—"}
                                                            />
                                                            <OfferField
                                                                label="Payment made on"
                                                                tone="success"
                                                                value={deal.booking.bookedOn ? formatEventDateTime(deal.booking.bookedOn) : "—"}
                                                            />
                                                        </>
                                                    )}
                                                    {offerSectionState === "withdrawn" && (
                                                        <>
                                                            <OfferField label="Withdraw Reason" tone="error" value={lastWithdrawal?.reason ?? "—"} />
                                                            <OfferField
                                                                label="Withdrawn on"
                                                                tone="error"
                                                                value={lastWithdrawal ? formatEventDateTime(lastWithdrawal.endedOn) : "—"}
                                                            />
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {offerSectionState === "shared" && (
                                                            <>
                                                                <OfferButton
                                                                    icon={ArrowUpRight}
                                                                    label="View Offer Letter"
                                                                    isDisabled={!offerEmailHtml}
                                                                    onClick={() => setEmailModalDealId(deal.id)}
                                                                />
                                                                <OfferButton
                                                                    icon={RefreshCcw01}
                                                                    label="Resend Letter"
                                                                    emphasis="secondary"
                                                                    isDisabled={!letterGuardResend.allowed}
                                                                    disabledReason={letterGuardResend.reason}
                                                                    onClick={() => resendLetter(deal.id)}
                                                                />
                                                            </>
                                                        )}
                                                        {(offerSectionState === "accepted" || offerSectionState === "completed") && (
                                                            <OfferButton
                                                                icon={ArrowUpRight}
                                                                label="View Offer Letter"
                                                                isDisabled={!offerEmailHtml}
                                                                onClick={() => setEmailModalDealId(deal.id)}
                                                            />
                                                        )}
                                                        {(offerSectionState === "expired" || offerSectionState === "withdrawn") && (
                                                            <>
                                                                <OfferButton
                                                                    icon={ArrowUpRight}
                                                                    label="View Last Offer Letter"
                                                                    isDisabled={!offerEmailHtml}
                                                                    onClick={() => setEmailModalDealId(deal.id)}
                                                                />
                                                                <OfferButton
                                                                    icon={RefreshCcw01}
                                                                    label="Create Offer Letter (v2)"
                                                                    emphasis="secondary"
                                                                    isDisabled={!letterGuardCreate.allowed}
                                                                    disabledReason={letterGuardCreate.reason}
                                                                    onClick={() => setLetterComposerDealId(deal.id)}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                    {offerSectionState === "shared" && (
                                                        <OfferGhostButton
                                                            label="Withdraw Offer"
                                                            isDisabled={!withdrawGuard.allowed}
                                                            disabledReason={withdrawGuard.reason}
                                                            onClick={() => setWithdrawDealId(deal.id)}
                                                        />
                                                    )}
                                                </div>
                                                {/* Resend and Withdraw only ever fail (in the one state either button renders)
                                                 * for the same reason — a payment has already landed — so one combined
                                                 * caption replaces what would otherwise be two identical-in-substance hints. */}
                                                {offerSectionState === "shared" && (!letterGuardResend.allowed || !withdrawGuard.allowed) && (
                                                    <span className="text-xs text-tertiary italic">
                                                        *Can't resend or withdraw offer. A payment has already been received.
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {offerSectionState !== "accepted" && offerSectionState !== "completed" ? (
                                        <LockedSectionRow number="04" title="Enrolment" opacity={0.4} />
                                    ) : (
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
                                    )}
                                </>
                            )}
                        </>
                    )}
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
                            className="-mx-1 flex w-full items-center justify-between gap-2 rounded px-1 py-0.5"
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
            <OfferEmailModal dealId={emailModalDealId} onOpenChange={(open) => !open && setEmailModalDealId(null)} />
            <GlobalStatusDialog request={globalStatusRequest} onOpenChange={(open) => !open && setGlobalStatusRequest(null)} />
            <ApplicationLinkDialog request={applicationLinkRequest} onOpenChange={(open) => !open && setApplicationLinkRequest(null)} />
            <LearnerSimPad deal={deal} />
        </AppShell>
    );
};


const FormSection = ({ title, children, divider = true, cols = 2 }: { title: string; children: React.ReactNode; divider?: boolean; cols?: 1 | 2 }) => (
    <div className={`flex flex-col gap-3 ${divider ? "border-b border-secondary pb-6" : ""}`}>
        <span className="text-md font-semibold text-primary">{title}</span>
        <div className={cols === 2 ? "grid grid-cols-2 gap-x-4 gap-y-4" : "flex flex-col gap-4"}>{children}</div>
    </div>
);
