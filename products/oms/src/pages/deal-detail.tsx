import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronDown, ChevronLeft, Copy01, LinkExternal01, MessageChatCircle, Pencil01, RefreshCcw01, Shield01 } from "@untitledui/icons";
import { AppShell } from "@/components/application/app-shell";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/application/toast/toast";
import { OfferWizard } from "@/components/deals/offer-wizard";
import { ActionNeededBadge, DealStatusBadge } from "@/components/deals/status-badge";
import { bdrs, teamLeads, teamManagers } from "@/data/dashboard-data";
import type { Deal, Installment } from "@/data/deals-data";
import { OFFER_TEMPLATES, STATUS } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

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
function formatRelative(d: Date, now: Date): string {
    const diffHrs = Math.round((now.getTime() - d.getTime()) / 3_600_000);
    if (diffHrs < 1) return "just now";
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
    const diffDays = Math.round(diffHrs / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

const MILESTONES = ["Application Sent", "Application Filled", "Offer Shared", "Offer Accepted", "Payment Ongoing", "Payment Completed"];

/** Maps a deal's status to how far along the 6-step milestone timeline it should show as —
 * ported from the prototype's `milestoneIndexFor`, including its `reachedStage` fallback for
 * global-status deals (Not Interested/Rejected/Saved/Cancelled), which have no direct status
 * match in the list above. */
function milestoneIndexFor(deal: Deal): number {
    switch (deal.status.id) {
        case "APP_PENDING":
        case "APP_EXPIRED":
            return 0;
        case "APP_FILLED":
            return 1;
        case "OFFER_PENDING":
        case "OFFER_EXPIRED":
            return 2;
        case "OFFER_ACCEPTED":
            return 3;
        case "PAY_ONGOING":
            return 4;
        case "PAY_COMPLETED":
            return 5;
        default:
            return deal.reachedStage >= 3 ? 5 : deal.reachedStage >= 2 ? 4 : deal.reachedStage >= 1 ? 2 : 0;
    }
}

const MetaItem = ({ children }: { children: React.ReactNode }) => <span className="text-sm text-tertiary">{children}</span>;
const SideRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-tertiary">{label}</span>
        <span className="text-right font-medium text-secondary">{value}</span>
    </div>
);

const SectionCard = ({
    title,
    complete,
    isOpen,
    onToggle,
    children,
}: {
    title: string;
    complete: boolean;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-4">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
                <span
                    className={`flex size-5 items-center justify-center rounded-full text-xs ${complete ? "bg-fg-success-primary text-white" : "border border-secondary text-transparent"}`}
                >
                    ✓
                </span>
                <span className="text-sm font-semibold text-primary">{title}</span>
            </div>
            <ChevronDown className={`size-4 text-fg-quaternary transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && <div className="flex flex-col gap-3">{children}</div>}
    </div>
);

const InstallmentRow = ({ deal, installment, index, onEmiSubmit }: { deal: Deal; installment: Installment; index: number; onEmiSubmit: (index: number, months: number, amount: number) => void }) => {
    const [editing, setEditing] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [months, setMonths] = useState(String(installment.emiMonths ?? ""));
    const [amount, setAmount] = useState(String(installment.emiMonths ? Math.round(installment.amount / installment.emiMonths) : ""));

    const colorClass = installment.status === "Paid" ? "bg-fg-success-secondary" : installment.status === "Overdue" ? "bg-fg-warning-primary" : "bg-fg-brand-primary";

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-secondary p-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-secondary">
                        {installment.label}
                        {installment.isEmi ? " · EMI" : ""}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-tertiary">
                        <span className={`inline-block size-1.5 rounded-full ${colorClass}`} />
                        {installment.status}
                        <span>·</span>
                        <span>{installment.mode}</span>
                        <span>·</span>
                        {installment.isEmi ? <span>{installment.emiMonths} months</span> : <span>Due {formatDate(new Date(installment.deadline))}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{formatMoney(installment.amount, deal.currency)}</span>
                    {installment.isEmi && !submitted && (
                        <button type="button" onClick={() => setEditing((v) => !v)} className="rounded p-1 text-fg-quaternary hover:bg-secondary hover:text-fg-secondary" title="Edit EMI terms">
                            <Pencil01 className="size-4" />
                        </button>
                    )}
                </div>
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

    const [openSections, setOpenSections] = useState({ application: true, plan: true, offer: false, enrollment: false });
    const [applicationSlideoverOpen, setApplicationSlideoverOpen] = useState(false);
    const [offerWizardOpen, setOfferWizardOpen] = useState(false);
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

    const toggleSection = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

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
                <button type="button" onClick={() => navigate("/deals")} className="flex w-max items-center gap-1 text-sm font-medium text-tertiary hover:text-secondary">
                    <ChevronLeft className="size-4" />
                    Back to Deals
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <DealStatusBadge status={deal.status} />
                    {deal.status.action && <ActionNeededBadge />}
                </div>
                <h1 className="text-2xl font-semibold text-primary">{deal.name}</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <MetaItem>{deal.course.name}</MetaItem>
                    <span className="text-fg-quaternary">·</span>
                    <MetaItem>{deal.email}</MetaItem>
                    <span className="text-fg-quaternary">·</span>
                    <MetaItem>Created {formatDate(deal.createdOn)}</MetaItem>
                    <span className="text-fg-quaternary">·</span>
                    <MetaItem>Updated {formatRelative(deal.lastUpdate, now)}</MetaItem>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_280px]">
                {/* Left rail */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4">
                        <h4 className="text-xs font-semibold tracking-wide text-quaternary uppercase">Identity</h4>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard?.writeText(deal.applicationId).catch(() => {});
                                toast("Application ID copied");
                            }}
                            className="flex items-center gap-1.5 self-start rounded-md border border-secondary px-2 py-1 font-mono text-xs text-secondary hover:bg-secondary_hover"
                        >
                            <Copy01 className="size-3.5" />
                            {deal.applicationId}
                        </button>
                        <SideRow label="Phone" value={deal.phone} />
                        <SideRow label="Location" value={`${deal.city}, ${deal.country}`} />
                        <SideRow label="Currency" value={deal.currency} />
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl border border-secondary bg-primary p-4">
                        <button
                            type="button"
                            onClick={() => toast("Opening in HubSpot…")}
                            className="flex items-center justify-between gap-2 rounded-lg border border-secondary px-3 py-2 text-sm text-secondary hover:bg-secondary_hover"
                        >
                            <span>View on HubSpot</span>
                            <LinkExternal01 className="size-4 text-fg-quaternary" />
                        </button>
                        <button
                            type="button"
                            onClick={() => toast("Opening WhatsApp…")}
                            className="flex items-center justify-between gap-2 rounded-lg border border-secondary px-3 py-2 text-sm text-secondary hover:bg-secondary_hover"
                        >
                            <span className="flex items-center gap-1.5">
                                <MessageChatCircle className="size-4 text-fg-quaternary" />
                                Chat on WhatsApp
                            </span>
                            <LinkExternal01 className="size-4 text-fg-quaternary" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4">
                        <h4 className="text-xs font-semibold tracking-wide text-quaternary uppercase">Assignment</h4>
                        {bdr && <SideRow label="LC" value={bdr.name} />}
                        {tl && <SideRow label="TL" value={tl.name} />}
                        {tm && <SideRow label="TM" value={tm.name} />}
                        <SideRow label="Cohort" value={deal.cohort} />
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4">
                        <h4 className="text-xs font-semibold tracking-wide text-quaternary uppercase">Global status</h4>
                        {deal.status.id === "NOT_INTERESTED" ? (
                            <Button color="secondary" size="sm" iconLeading={RefreshCcw01} onClick={handleReopen}>
                                Reopen deal
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button color="secondary" size="sm" onClick={() => handleGlobalStatus("NOT_INTERESTED")}>
                                    Not interested
                                </Button>
                                <Button color="secondary" size="sm" onClick={() => handleGlobalStatus("REJECTED")}>
                                    Mark reject
                                </Button>
                                <Button color="secondary" size="sm" onClick={() => handleGlobalStatus("SAVED")}>
                                    Save for later
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main */}
                <div className="flex flex-col gap-4">
                    <SectionCard title="1 · Application" complete={appComplete} isOpen={openSections.application} onToggle={() => toggleSection("application")}>
                        <SideRow label="Course" value={deal.course.name} />
                        <SideRow label="Duration" value={duration} />
                        <SideRow label="Start date" value={formatDate(startDate)} />
                        <Button color="secondary" size="sm" iconLeading={LinkExternal01} onClick={() => setApplicationSlideoverOpen(true)}>
                            {appComplete ? "View application" : "Application not filled yet"}
                        </Button>
                    </SectionCard>

                    <SectionCard title="2 · Payment Plan" complete={planComplete} isOpen={openSections.plan} onToggle={() => toggleSection("plan")}>
                        {planComplete ? (
                            <>
                                <div className="flex flex-col gap-1.5 border-b border-secondary pb-3">
                                    <SideRow label="Course Fee" value={formatMoney(deal.courseFee, deal.currency)} />
                                    <SideRow label="Discount" value={`−${formatMoney(deal.discount, deal.currency)}`} />
                                    <div className="flex items-center justify-between text-sm font-semibold text-primary">
                                        <span>Net Payable Fee</span>
                                        <span>{formatMoney(deal.netPayable, deal.currency)}</span>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold tracking-wide text-quaternary uppercase">Installments</p>
                                {deal.installments.map((installment, i) => (
                                    <InstallmentRow key={i} deal={deal} installment={installment} index={i} onEmiSubmit={handleEmiSubmit} />
                                ))}
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
                    </SectionCard>

                    <SectionCard title="3 · Offer Letter" complete={offerComplete} isOpen={openSections.offer} onToggle={() => toggleSection("offer")}>
                        {offerComplete && offerTemplate ? (
                            <>
                                <SideRow label="Template used" value={offerTemplate.name} />
                                <SideRow label="Sent on" value={formatDate(deal.createdOn)} />
                            </>
                        ) : (
                            <p className="text-sm text-tertiary">No offer sent yet — build a payment plan first.</p>
                        )}
                        <Button color="secondary" size="sm" onClick={handleOfferCta}>
                            {deal.reachedStage >= 1 ? "Revise offer letter" : "Send offer letter"}
                        </Button>
                    </SectionCard>

                    <SectionCard title="4 · Enrollment" complete={enrollComplete} isOpen={openSections.enrollment} onToggle={() => toggleSection("enrollment")}>
                        {enrollComplete ? (
                            <>
                                <SideRow label="Applicant ID (LMS)" value={lmsId} />
                                <SideRow label="Admission Counsellor" value={bdr ? `${bdr.name} (BDR)` : "—"} />
                                <SideRow label="First session" value={formatDate(firstSessionDate)} />
                            </>
                        ) : (
                            <p className="text-sm text-tertiary">Enrollment unlocks after the first payment.</p>
                        )}
                    </SectionCard>
                </div>

                {/* Right rail */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4">
                        <h4 className="text-xs font-semibold tracking-wide text-quaternary uppercase">Milestones</h4>
                        <div className="flex flex-col gap-3">
                            {MILESTONES.map((m, i) => {
                                const current = milestoneIndexFor(deal);
                                const state = i < current ? "done" : i === current ? "current" : "upcoming";
                                return (
                                    <div key={m} className="flex items-center gap-2.5">
                                        <span
                                            className={`size-2 shrink-0 rounded-full ${state === "done" ? "bg-fg-success-primary" : state === "current" ? "bg-fg-brand-primary" : "bg-quaternary"}`}
                                        />
                                        <span className={`text-sm ${state === "upcoming" ? "text-quaternary" : "font-medium text-secondary"}`}>{m}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4">
                        <h4 className="text-xs font-semibold tracking-wide text-quaternary uppercase">Activity Log</h4>
                        <div className="flex flex-col gap-3">
                            {[...deal.activityLog]
                                .slice()
                                .reverse()
                                .map((entry, i) => (
                                    <div key={i} className="flex flex-col gap-0.5 border-b border-secondary pb-3 last:border-b-0 last:pb-0">
                                        <span className="text-sm text-secondary">{entry.text}</span>
                                        {entry.reason && <span className="text-xs text-tertiary italic">"{entry.reason}"</span>}
                                        <span className="text-xs text-quaternary">{formatDate(entry.ts)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <SlideoutMenu.Trigger isOpen={applicationSlideoverOpen} onOpenChange={setApplicationSlideoverOpen}>
                <SlideoutMenu>
                    {({ close }) => (
                        <>
                            <SlideoutMenu.Header onClose={close}>
                                <span className="text-md font-semibold text-primary">Application Details</span>
                            </SlideoutMenu.Header>
                            <SlideoutMenu.Content>
                                <ApplicationDetailGroup title="Basic Information" rows={[
                                    ["Name", deal.name],
                                    ["Mobile", deal.phone],
                                    ["Email", deal.email],
                                    ["City / Country", `${deal.city}, ${deal.country}`],
                                ]} />
                                <ApplicationDetailGroup title="Professional Details" rows={[
                                    ["Current role", deal.applicationDetails.role],
                                    ["Experience", deal.applicationDetails.experience],
                                    ["Tools", deal.applicationDetails.tools],
                                    ["English level", deal.applicationDetails.englishLevel],
                                    ["Income band", deal.applicationDetails.incomeBand],
                                ]} />
                                <ApplicationDetailGroup title="Educational Details" rows={[
                                    ["Qualification", deal.applicationDetails.qualification],
                                    ["CV uploaded", "Yes"],
                                    ["LinkedIn", deal.applicationDetails.linkedin],
                                ]} />
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-primary">Statement of Purpose</span>
                                    <p className="text-sm leading-relaxed text-tertiary">
                                        Discovered Novatr through a {deal.sopSource}. Looking to strengthen practical, industry-relevant skills in {deal.course.name} to move into a more
                                        technical role within the next year.
                                    </p>
                                </div>
                            </SlideoutMenu.Content>
                        </>
                    )}
                </SlideoutMenu>
            </SlideoutMenu.Trigger>

            <OfferWizard dealId={offerWizardOpen ? deal.id : null} onOpenChange={(open) => setOfferWizardOpen(open)} />
        </AppShell>
    );
};

const ApplicationDetailGroup = ({ title, rows }: { title: string; rows: [string, string][] }) => (
    <div className="flex flex-col gap-2 border-b border-secondary pb-4">
        <span className="text-sm font-semibold text-primary">{title}</span>
        {rows.map(([label, value]) => (
            <SideRow key={label} label={label} value={value} />
        ))}
    </div>
);
