import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { CloseButton } from "@/components/base/buttons/close-button";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import { resolveOfferEmail } from "@/data/offer-emails";
import { useDeals } from "@/providers/deals-provider";

/** Full, scrollable render of the exact email the learner would receive — opened from Section
 * 03's "View Offer Letter" button. This prototype has no ESP, so it only ever previews. */
export const OfferEmailModal = ({ dealId, onOpenChange }: { dealId: string | null; onOpenChange: (open: boolean) => void }) => {
    const { deals } = useDeals();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;
    if (!deal) return null;
    const html = resolveOfferEmail(deal, deals[0]?.lastUpdate ?? PROTOTYPE_TODAY);

    return (
        <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-[600px]">
                    <Dialog>
                        {() => (
                            <div className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl bg-primary shadow-xl">
                                <header className="relative flex shrink-0 items-center justify-between border-b border-secondary px-6 py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-md font-semibold text-primary">Offer letter email</span>
                                        <span className="text-xs text-tertiary">
                                            {deal.name} · {deal.offer.template?.name ?? "—"}
                                        </span>
                                    </div>
                                    <CloseButton size="sm" onClick={() => onOpenChange(false)} />
                                </header>
                                <div className="flex-1 overflow-hidden bg-secondary">
                                    {html ? (
                                        <iframe srcDoc={html} title="Offer letter email" className="h-[75vh] w-full border-0" />
                                    ) : (
                                        <p className="p-6 text-sm text-tertiary">No offer letter has been created for this deal yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
