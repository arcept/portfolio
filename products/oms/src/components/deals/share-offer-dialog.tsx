import { useState } from "react";
import { AlertTriangle, Check } from "@untitledui/icons";
import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { canShareLetter, canWithdraw } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

function formatMoney(amount: number, currency: "INR" | "USD"): string {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US")}`;
}
function formatDeadline(iso: string): string {
    // Spelled-out local datetime (§5) — the letter's window has no real time-of-day in this
    // prototype, so it's pinned to close of day for the deadline reader.
    return `${new Date(`${iso}T23:59:59`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, 11:59 PM`;
}

/** A confirmation, not a step — the wizard's old step 3 becomes this dialog's success state.
 * The fee lock moves here: sharing is what commits the plan (2026-09-05 offer-separation brief
 * §5, §8). */
export const ShareOfferDialog = ({ dealId, onOpenChange }: { dealId: string | null; onOpenChange: (open: boolean) => void }) => {
    const { deals, shareLetter } = useDeals();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;
    const [shared, setShared] = useState(false);

    if (!deal) return null;
    const guard = canShareLetter(deal);
    const close = () => {
        onOpenChange(false);
        setShared(false);
    };
    const confirm = () => {
        shareLetter(deal.id);
        setShared(true);
    };

    return (
        <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-md">
                    <Dialog>
                        {() => (
                            <div className="relative flex w-full flex-col gap-5 rounded-2xl bg-primary p-6 shadow-xl">
                                <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />
                                {shared ? (
                                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                                        <span className="flex size-12 items-center justify-center rounded-full bg-success-primary">
                                            <Check className="size-6 text-fg-success-primary" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-semibold text-primary">Offer shared with {deal.name.split(" ")[0]}!</span>
                                            <span className="max-w-sm text-sm text-tertiary">They'll receive it by email, with a link back to their offer. The payment plan is now locked.</span>
                                        </div>
                                        <Button color="primary" size="sm" onClick={close}>
                                            Done
                                        </Button>
                                    </div>
                                ) : !guard.allowed ? (
                                    <>
                                        <span className="text-md font-semibold text-primary">Can't share yet</span>
                                        <p className="text-sm text-tertiary">{guard.reason}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-md font-semibold text-primary">Share offer letter?</span>
                                            <span className="text-xs text-tertiary">This sends the letter and locks the payment plan.</span>
                                        </div>
                                        <div className="flex flex-col gap-2 rounded-lg border border-secondary p-3 text-sm">
                                            <Row label="Recipient" value={`${deal.name} · ${deal.email}`} />
                                            <Row label="Template" value={deal.offer.template?.name ?? "—"} />
                                            <Row label="Deadline" value={deal.offer.deadline ? formatDeadline(deal.offer.deadline) : "—"} />
                                            <Row label="Net Payable" value={formatMoney(deal.netPayable, deal.currency)} />
                                        </div>
                                        <div className="flex flex-col gap-1 rounded-lg bg-secondary p-3">
                                            <span className="text-xs font-semibold tracking-wide text-quaternary uppercase">Installment schedule</span>
                                            {deal.installments.map((i, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs text-secondary">
                                                    <span>
                                                        {i.label} · {i.mode}
                                                    </span>
                                                    <span className="font-medium">{formatMoney(i.amount, deal.currency)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium text-warning-primary">The payment plan will lock when this is shared.</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button color="secondary" size="sm" onClick={close}>
                                                Cancel
                                            </Button>
                                            <Button color="primary" size="sm" onClick={confirm}>
                                                Share offer letter
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-tertiary">{label}</span>
        <span className="text-right font-medium text-secondary">{value}</span>
    </div>
);

/** Withdraw — revenue-neutral, unlocks the plan. Mandatory free-text reason; withdrawing an
 * already-accepted offer gets a stronger confirmation since the learner has agreed to these
 * terms already (§7). Blocked once any installment is Paid via `canWithdraw`, not by hiding the
 * button — this dialog still checks the guard so it can't be raced open on a paid deal. */
export const WithdrawOfferDialog = ({ dealId, onOpenChange }: { dealId: string | null; onOpenChange: (open: boolean) => void }) => {
    const { deals, withdrawOffer } = useDeals();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;
    const [reason, setReason] = useState("");

    if (!deal) return null;
    const guard = canWithdraw(deal);
    const close = () => {
        onOpenChange(false);
        setReason("");
    };
    const confirm = () => {
        if (!reason.trim()) return;
        withdrawOffer(deal.id, reason.trim());
        close();
    };

    return (
        <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-md">
                    <Dialog>
                        {() => (
                            <div className="relative flex w-full flex-col gap-5 rounded-2xl bg-primary p-6 shadow-xl">
                                <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />
                                {!guard.allowed ? (
                                    <>
                                        <span className="text-md font-semibold text-primary">Can't withdraw</span>
                                        <p className="text-sm text-tertiary">{guard.reason}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-md font-semibold text-primary">Withdraw offer letter?</span>
                                            <span className="text-xs text-tertiary">Reopens the payment plan for editing. Revenue-neutral — nothing has been booked yet.</span>
                                        </div>
                                        {deal.offer.state === "accepted" && (
                                            <div className="flex items-start gap-2 rounded-lg bg-warning-secondary p-3 text-xs text-warning-primary">
                                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                                <span>{deal.name.split(" ")[0]} has already accepted these terms — withdrawing will surprise them. Make sure they've been told first.</span>
                                            </div>
                                        )}
                                        <Input label="Reason" placeholder="Why is this offer being withdrawn?" size="sm" isRequired value={reason} onChange={setReason} />
                                        <div className="flex items-center justify-end gap-2">
                                            <Button color="secondary" size="sm" onClick={close}>
                                                Cancel
                                            </Button>
                                            <Button color="primary-destructive" size="sm" isDisabled={!reason.trim()} onClick={confirm}>
                                                Withdraw offer
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
