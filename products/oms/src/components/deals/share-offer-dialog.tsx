import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Check } from "@untitledui/icons";
import confirmationBanner from "@/assets/modals/confirmation-banner.jpg";
import { ConfirmationModal } from "@/components/application/modals/confirmation-modal";
import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { canShareLetter, canWithdraw } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

function formatAmount(amount: number, currency: "INR" | "USD"): string {
    return Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US");
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

    useEffect(() => {
        setShared(false);
    }, [dealId]);

    if (!deal) return null;
    const guard = canShareLetter(deal);
    const close = () => onOpenChange(false);
    const confirm = () => {
        shareLetter(deal.id);
        setShared(true);
    };

    if (shared) {
        return (
            <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
                <ModalOverlay>
                    <Modal className="max-w-[640px]">
                        <Dialog>
                            {() => (
                                <div className="relative flex w-full flex-col overflow-hidden rounded-2xl shadow-xl">
                                    <div className="relative h-14 w-full shrink-0 overflow-hidden">
                                        <img src={confirmationBanner} alt="" className="absolute top-[-168.75%] left-[-2.23%] h-[437.5%] w-[104.45%] max-w-none" />
                                    </div>
                                    <div className="relative flex w-full flex-col items-center gap-3 bg-primary px-6 pt-10 pb-8 text-center">
                                        <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />
                                        <span className="flex size-12 items-center justify-center rounded-full bg-success-primary">
                                            <Check className="size-6 text-fg-success-primary" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-semibold text-primary">Offer shared with {deal.name.split(" ")[0]}!</span>
                                            <span className="max-w-sm text-sm text-tertiary">
                                                They'll receive it by email, with a link back to their offer. The payment plan is now locked.
                                            </span>
                                        </div>
                                        <Button color="primary" size="sm" onClick={close}>
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        );
    }

    if (!guard.allowed) {
        return (
            <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
                <ModalOverlay>
                    <Modal className="max-w-md">
                        <Dialog>
                            {() => (
                                <div className="relative flex w-full flex-col gap-5 rounded-2xl bg-primary p-6 shadow-xl">
                                    <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />
                                    <span className="text-md font-semibold text-primary">Can't share yet</span>
                                    <p className="text-sm text-tertiary">{guard.reason}</p>
                                </div>
                            )}
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        );
    }

    return (
        <ConfirmationModal
            isOpen={!!dealId}
            onOpenChange={onOpenChange}
            title="Share Offer Letter"
            description={`Are you sure you want to send the Offer Letter to the learner? They'll have until ${deal.offer.deadline ? formatDeadline(deal.offer.deadline) : "the deadline"} to accept the offer. This sends the letter and locks the payment plan.`}
            acknowledgementLabel="I understand that the payment plan will be locked when this offer letter is shared and I've verified every detail."
            cancelLabel="Go back"
            cancelIcon={ArrowLeft}
            confirmLabel="Confirm & Send"
            onConfirm={confirm}
        >
            <div className="flex w-full flex-col gap-3">
                <Row label="Recipient" value={deal.name} />
                <Row label="Email Address" value={deal.email} />
                <Row label="Template" value={deal.offer.template?.name ?? "—"} />
                <div className="flex w-full items-baseline justify-between gap-3">
                    <span className="text-md text-tertiary">Net Payable</span>
                    <span className="text-right text-lg font-semibold text-primary">
                        <span className="mr-1 text-xs font-normal text-primary/60">{deal.currency}</span>
                        {formatAmount(deal.netPayable, deal.currency)}
                    </span>
                </div>
            </div>
        </ConfirmationModal>
    );
};

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex w-full items-center justify-between gap-3">
        <span className="text-md text-tertiary">{label}</span>
        <span className="text-right text-lg font-semibold text-primary">{value}</span>
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
