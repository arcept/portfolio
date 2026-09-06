import { useState } from "react";
import { Copy04, CreditCardPlus, FlipBackward, Pencil01, Shield01 } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "@/components/application/toast/toast";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PaymentPlanForm } from "@/components/deals/payment-plan-editor";
import { FeeBreakdown, InstallmentPreviewCard, formatMoney, paymentTypeLabel } from "@/components/deals/payment-plan-shared";
import { Dot } from "@/components/foundations/dot-icon";
import type { Deal } from "@/data/deals-data";
import { canEditPlan, paymentPlanUrl } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

function copyToClipboard(value: string, label: string) {
    navigator.clipboard?.writeText(value).catch(() => {});
    toast(`${label} copied`);
}

const fadeProps = {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.18, ease: "easeInOut" as const },
};

/** "02 · Payment Plan" card — redesigned from the Figma OMS-v3 export (frame "Section —
 * Application", node 429:23060) covering all 3 states × payment-type variations, rather than
 * the previous stock Untitled UI card. The EMI 3rd Party tab inside "In Progress" has no Figma
 * source (composed from the Upfront/Part Payment components per the brief). */
export const PaymentPlanSectionCard = ({ deal }: { deal: Deal }) => {
    const { createPlan } = useDeals();
    const state = deal.plan.state;
    // A saved plan (any installments assigned) reads as "Plan Created" immediately, matching
    // Figma — editing it back open is a deliberate action via the Edit button, not an automatic
    // consequence of the state machine still technically calling it a "draft".
    const hasPlan = deal.installments.length > 0;
    const [forceEditing, setForceEditing] = useState(false);
    const view: "not-created" | "in-progress" | "created" = state === "none" ? "not-created" : forceEditing || !hasPlan ? "in-progress" : "created";
    const tone = view === "created" ? "text-utility-green-500" : "text-utility-amber-500";
    // The badge follows what's actually on screen, not the raw (still-technically-editable)
    // plan state — Figma's "Plan Created" frame always reads "Completed", regardless of whether
    // the underlying draft could still be reopened via Edit.
    const badgeLabel = view === "created" ? (state === "awaiting_approval" ? "Awaiting approval" : "Completed") : "In Progress";

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary_alt">
            <div className="flex items-center justify-between gap-2 bg-tertiary/30 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={tone}>02</span>
                    <span className="text-primary">Payment Plan</span>
                </div>
                <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-secondary shadow-xs">
                    <Dot size="sm" className={tone} />
                    {badgeLabel}
                </span>
            </div>

            <div className="overflow-hidden p-6">
                <AnimatePresence mode="wait" initial={false}>
                    {view === "not-created" && (
                        <motion.div key="not-created" {...fadeProps}>
                            <PlanNotCreatedView deal={deal} onCustomise={() => createPlan(deal.id)} />
                        </motion.div>
                    )}
                    {view === "in-progress" && (
                        <motion.div key="in-progress" {...fadeProps}>
                            <PaymentPlanForm deal={deal} onSaved={() => setForceEditing(false)} />
                        </motion.div>
                    )}
                    {view === "created" && (
                        <motion.div key="created" {...fadeProps}>
                            <PlanCreatedView deal={deal} onEditRequest={() => setForceEditing(true)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

/** No plan exists yet — Course Fees is the only real number, so the breakdown shows zero
 * discount (not the deal's seed/default discountBreakdown, which doesn't apply until a plan
 * actually picks one). */
const PlanNotCreatedView = ({ deal, onCustomise }: { deal: Deal; onCustomise: () => void }) => (
    <div className="flex flex-col gap-6">
        <FeeBreakdown currency={deal.currency} courseFee={deal.courseFee} discountBreakdown={{ upfront: 0, items: [] }} netPayable={deal.courseFee} />
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-tertiary/10 to-tertiary p-6 shadow-lg">
            <p className="text-sm text-primary">A Payment Plan hasn’t been custom made for this deal yet.</p>
            <Button
                color="primary"
                size="md"
                iconLeading={CreditCardPlus}
                onClick={onCustomise}
                className="w-max !bg-yellow-500 !text-neutral-900 !ring-yellow-400 hover:!bg-yellow-600 *:data-icon:!text-neutral-900"
            >
                Customise Payment Plan
            </Button>
        </div>
    </div>
);

const PlanCreatedView = ({ deal, onEditRequest }: { deal: Deal; onEditRequest: () => void }) => {
    const { resolveApproval } = useDeals();
    const guard = canEditPlan(deal);
    const type = paymentTypeLabel(deal);
    const nextIndex = deal.installments.findIndex((i) => i.status !== "Paid");
    const url = paymentPlanUrl(deal);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2 px-2">
                <span className="text-sm text-tertiary">Payment Type</span>
                <span className="text-sm font-semibold text-primary">{type}</span>
            </div>

            <FeeBreakdown currency={deal.currency} courseFee={deal.courseFee} discountBreakdown={deal.discountBreakdown} netPayable={deal.netPayable} compact />

            <div className="grid grid-cols-2 gap-2">
                {deal.installments.map((installment, i) => (
                    <InstallmentPreviewCard key={i} installment={installment} currency={deal.currency} isNext={i === nextIndex} />
                ))}
            </div>

            {deal.plan.state === "active" &&
                deal.installments.map((installment, i) => installment.isEmi && <EmiResubmitRow key={i} deal={deal} installment={installment} />)}

            {deal.plan.state === "awaiting_approval" && <SimulateApprovalControl onDecide={(decision, reason) => resolveApproval(deal.id, decision, reason)} />}

            <div className="flex flex-col gap-1">
                <div className="flex items-start gap-2">
                    <Button color="secondary" size="md" iconLeading={FlipBackward} isDisabled={!guard.allowed} onClick={onEditRequest} className="w-max">
                        Edit Payment Plan
                    </Button>
                    <PaymentLinkField value={url} onCopy={() => copyToClipboard(url, "Payment link")} />
                </div>
                {!guard.allowed && <span className="px-2 text-xs text-tertiary italic">*{guard.reason}</span>}
            </div>
        </div>
    );
};

const PaymentLinkField = ({ value, onCopy }: { value: string; onCopy: () => void }) => (
    <div className="flex h-11 min-w-[220px] flex-1 items-stretch overflow-hidden rounded-lg shadow-xs">
        <div className="flex flex-1 items-center overflow-hidden rounded-l-lg border-y border-l border-secondary px-3.5">
            <span className="truncate text-sm text-placeholder">{value}</span>
        </div>
        <button
            type="button"
            onClick={onCopy}
            aria-label="Copy payment link"
            className="flex shrink-0 items-center justify-center rounded-r-lg border border-secondary bg-secondary px-3 text-fg-quaternary transition-colors duration-100 ease-linear hover:bg-secondary_hover hover:text-fg-secondary active:bg-quaternary"
        >
            <Copy04 className="size-4" />
        </button>
    </div>
);

/** Post-payment EMI restructuring — proposing new terms on an already-active plan's EMI
 * installment freezes the plan for Sales Ops approval (`submitPlanForApproval`). No Figma frame
 * covers this state, so it's kept as a plain inline control below the card grid rather than
 * redesigned into it. */
const EmiResubmitRow = ({ deal, installment }: { deal: Deal; installment: Deal["installments"][number] }) => {
    const { submitPlanForApproval } = useDeals();
    const [editing, setEditing] = useState(false);
    const [months, setMonths] = useState(String(installment.emiMonths ?? ""));
    const [amount, setAmount] = useState(String(installment.amount));

    if (!editing) {
        return (
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 self-start px-2 text-xs font-medium text-tertiary transition-colors duration-100 ease-linear hover:text-secondary"
            >
                <Pencil01 className="size-3.5" />
                Propose new EMI terms for {installment.label}
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-secondary p-3">
            <div className="grid grid-cols-2 gap-2">
                <Input label="Tenure (months)" type="number" size="sm" value={months} onChange={setMonths} />
                <Input label="Monthly amount" type="number" size="sm" value={amount} onChange={setAmount} />
            </div>
            <div className="flex items-center gap-2">
                <Button color="secondary" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    onClick={() => {
                        const newMonths = Number(months) || installment.emiMonths || 0;
                        const newAmount = Number(amount) || 0;
                        submitPlanForApproval(deal.id, `${installment.label}: new terms ${newMonths} months at ${formatMoney(newAmount, deal.currency)}/mo`);
                        toast("EMI change submitted for Sales Ops approval");
                        setEditing(false);
                    }}
                >
                    Submit for re-approval
                </Button>
            </div>
        </div>
    );
};

/** "Simulate Sales Ops decision" — there's no Sales Ops persona in this prototype, so this
 * stands in for one. Labeled visibly as a prototype affordance. */
const SimulateApprovalControl = ({ onDecide }: { onDecide: (decision: "approved" | "rejected", reason?: string | null) => void }) => {
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");

    return (
        <div className="border-warning-primary flex flex-col gap-3 rounded-lg border border-dashed bg-warning-secondary p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-warning-primary">
                <Shield01 className="size-3.5" />
                Simulate Sales Ops decision (prototype affordance — no Sales Ops persona exists)
            </div>
            {rejecting ? (
                <div className="flex flex-col gap-2">
                    <Input label="Rejection reason" size="sm" isRequired value={reason} onChange={setReason} />
                    <div className="flex items-center gap-2">
                        <Button color="secondary" size="sm" onClick={() => setRejecting(false)}>
                            Cancel
                        </Button>
                        <Button color="primary-destructive" size="sm" isDisabled={!reason.trim()} onClick={() => onDecide("rejected", reason.trim())}>
                            Confirm rejection
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Button color="primary" size="sm" onClick={() => onDecide("approved")}>
                        Approve
                    </Button>
                    <Button color="secondary-destructive" size="sm" onClick={() => setRejecting(true)}>
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
};
