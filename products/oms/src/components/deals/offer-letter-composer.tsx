import { useEffect, useState } from "react";
import { Calendar, Check, Mail01 } from "@untitledui/icons";
import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import { OFFER_TEMPLATES, canCreateLetter } from "@/data/deals-data";
import { renderOfferEmail } from "@/data/offer-emails";
import { useDeals } from "@/providers/deals-provider";

function isoInDays(n: number): string {
    return new Date(PROTOTYPE_TODAY.getTime() + n * 86_400_000).toISOString().slice(0, 10);
}

const SectionLabel = ({ number, label }: { number: string; label: string }) => (
    <div className="flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
        <span className="text-brand-secondary">{number}</span>
        <span className="font-semibold text-white/60">{label}</span>
    </div>
);

/** The old wizard's step 2 — three template cards, the deadline field, a live email preview —
 * now its own step, doing double duty as the **edit** surface for a letter that hasn't been
 * shared yet. Creating an offer is never a standalone, savable-for-later action — there's no
 * "created but not shared" resting state — so **Share Offer** is the only way out: it persists
 * the letter (creating, or editing in place on an already `created`/`stale` letter — same
 * version, nothing was ever delivered to the learner) and hands off to `ShareOfferDialog` for the
 * actual send confirmation (Figma node 398:5068, minus the removed Save path). Share Offer sits
 * at the bottom of the left column (not a full-width footer) and renders green, matching that
 * frame; the deadline stays a native date input — the project's shared `DatePicker` popover
 * defaults its visible month off the real system clock, which fights this prototype's frozen
 * "today". */
export const OfferLetterComposer = ({
    dealId,
    onOpenChange,
    onShareRequested,
}: {
    dealId: string | null;
    onOpenChange: (open: boolean) => void;
    /** Fired after Share Offer persists the letter — the parent opens `ShareOfferDialog` on this
     * deal for the actual send confirmation. */
    onShareRequested?: (dealId: string) => void;
}) => {
    const { deals, createLetter, editLetter } = useDeals();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;
    const isEdit = deal ? deal.offer.state === "created" || deal.offer.state === "stale" : false;

    const [templateId, setTemplateId] = useState(OFFER_TEMPLATES[2].id);
    const [deadline, setDeadline] = useState(isoInDays(3));

    useEffect(() => {
        if (!deal) return;
        setTemplateId(deal.offer.template?.id ?? OFFER_TEMPLATES[2].id);
        // Editing an existing letter keeps its deadline unless the BDR changes it; a brand new
        // letter defaults to the maximum 72-hour window.
        setDeadline(deal.offer.deadline ?? isoInDays(3));
    }, [dealId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!deal) return null;
    const guard = canCreateLetter(deal);
    const close = () => onOpenChange(false);
    const template = OFFER_TEMPLATES.find((t) => t.id === templateId)!;
    const previewHtml = renderOfferEmail(deal, template, deadline, PROTOTYPE_TODAY);

    const shareOffer = () => {
        if (isEdit) editLetter(deal.id, { template, deadline });
        else createLetter(deal.id, { template, deadline });
        onOpenChange(false);
        onShareRequested?.(deal.id);
    };

    return (
        <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-[1000px]">
                    <Dialog>
                        {() => (
                            <div
                                className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg shadow-xl"
                                style={{
                                    borderBottom: "1px solid #262626",
                                    background: "linear-gradient(180deg, rgba(38, 40, 29, 0.75) -5.43%, rgba(6, 8, 6, 0.80) 100%), rgba(0, 0, 0, 0.80)",
                                }}
                            >
                                <header className="relative shrink-0 border-b border-white/10 px-12 py-4">
                                    <div className="flex flex-col gap-1 pr-10">
                                        <span className="text-lg font-semibold text-white">{isEdit ? "Edit Offer Letter" : "Create Offer Letter"}</span>
                                        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-white/60">
                                            <span>{deal.name}</span>
                                            <span>{deal.course.short}</span>
                                            <span>{deal.email}</span>
                                        </div>
                                    </div>
                                    <CloseButton size="sm" theme="dark" className="absolute top-4 right-4" onClick={close} />
                                </header>

                                <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-auto px-8 py-5 lg:flex-row lg:items-stretch lg:gap-10">
                                    {!guard.allowed ? (
                                        <p className="text-sm text-white/60">{guard.reason}</p>
                                    ) : (
                                        <>
                                            <div className="flex w-full shrink-0 flex-col justify-between gap-8 px-4 lg:w-86">
                                                <div className="flex flex-col gap-11">
                                                    <div className="flex flex-col gap-3">
                                                        <SectionLabel number="01" label="Choose a Template" />
                                                        {OFFER_TEMPLATES.map((t) => {
                                                            const selected = templateId === t.id;
                                                            return (
                                                                <button
                                                                    key={t.id}
                                                                    type="button"
                                                                    onClick={() => setTemplateId(t.id)}
                                                                    className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition duration-100 ease-linear ${
                                                                        selected ? "border-white/20 bg-white/5" : "border-white/10 hover:bg-white/5"
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-fg-success-primary bg-success-solid" : "border-white/20"}`}
                                                                    >
                                                                        {selected && <Check className="size-2.5 text-white" />}
                                                                    </span>
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="text-sm font-semibold text-white">{t.name}</span>
                                                                        <span className="text-xs text-white/60">{t.blurb}</span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <SectionLabel number="02" label="Choose a Deadline" />
                                                        <div className="flex flex-col gap-1.5">
                                                            <Input icon={Calendar} type="date" size="sm" value={deadline} onChange={setDeadline} aria-label="Offer deadline" />
                                                            <p className="text-sm text-white/60">You can send a maximum deadline of 72hrs from the moment the offer letter is created.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        iconTrailing={Mail01}
                                                        className="h-11 w-full !bg-green-500 !text-neutral-900 !ring-green-400 hover:!bg-green-600 *:data-icon:!text-neutral-900"
                                                        onClick={shareOffer}
                                                    >
                                                        Share Offer
                                                    </Button>
                                                    <span className="text-xs text-white/60">*Lead will receive this offer on their email</span>
                                                </div>
                                            </div>

                                            <div className="h-[600px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10">
                                                {previewHtml && <iframe srcDoc={previewHtml} title="Offer letter email preview" className="h-full w-full border-0" />}
                                            </div>
                                        </>
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
