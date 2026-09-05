import { useEffect, useState } from "react";
import { Check } from "@untitledui/icons";
import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import type { Deal } from "@/data/deals-data";
import { OFFER_TEMPLATES, canCreateLetter } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

function isoInDays(n: number): string {
    return new Date(PROTOTYPE_TODAY.getTime() + n * 86_400_000).toISOString().slice(0, 10);
}
function formatMoney(amount: number, currency: "INR" | "USD"): string {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US")}`;
}

/** The old wizard's step 2 — three template cards, the deadline field, the live email preview —
 * now its own step: **Create** persists the letter and takes its snapshot. Nothing is sent; that
 * only happens from `ShareOfferDialog` (2026-09-05 offer-separation brief §5). */
export const OfferLetterComposer = ({ dealId, onOpenChange }: { dealId: string | null; onOpenChange: (open: boolean) => void }) => {
    const { deals, createLetter } = useDeals();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;

    const [templateId, setTemplateId] = useState(OFFER_TEMPLATES[2].id);
    const [deadline, setDeadline] = useState(isoInDays(7));

    useEffect(() => {
        if (!deal) return;
        setTemplateId(deal.offer.template?.id ?? OFFER_TEMPLATES[2].id);
        setDeadline(isoInDays(7));
    }, [dealId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!deal) return null;
    const guard = canCreateLetter(deal);
    const close = () => onOpenChange(false);

    const create = () => {
        const template = OFFER_TEMPLATES.find((t) => t.id === templateId)!;
        createLetter(deal.id, { template, deadline });
        close();
    };

    return (
        <DialogTrigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-2xl">
                    <Dialog>
                        {() => (
                            <div className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl bg-primary shadow-xl">
                                <header className="relative shrink-0 border-b border-secondary px-6 pt-6 pb-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-md font-semibold text-primary">Create offer letter</span>
                                        <span className="text-xs text-tertiary">
                                            {deal.name} · {deal.course.short}
                                        </span>
                                    </div>
                                    <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />
                                </header>

                                <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-auto px-6 py-6">
                                    {!guard.allowed ? (
                                        <p className="text-sm text-tertiary">{guard.reason}</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                            <div className="flex flex-col gap-4">
                                                {OFFER_TEMPLATES.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setTemplateId(t.id)}
                                                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition duration-100 ease-linear ${
                                                            templateId === t.id ? "border-brand bg-secondary" : "border-secondary hover:bg-secondary_hover"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${templateId === t.id ? "border-brand bg-brand-solid" : "border-secondary"}`}
                                                        >
                                                            {templateId === t.id && <Check className="size-2.5 text-white" />}
                                                        </span>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-semibold text-primary">{t.name}</span>
                                                            <span className="text-xs text-tertiary">{t.blurb}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                                <Input label="Choose deadline" type="date" size="sm" value={deadline} onChange={setDeadline} />
                                            </div>
                                            <EmailPreview deal={deal} templateId={templateId} deadline={deadline} />
                                        </div>
                                    )}
                                </div>

                                {guard.allowed && (
                                    <footer className="flex shrink-0 items-center justify-between border-t border-secondary px-6 py-4">
                                        <span className="text-xs text-tertiary">*Nothing is sent yet — Create just prepares the letter.</span>
                                        <Button color="primary" size="sm" onClick={create}>
                                            Create offer letter
                                        </Button>
                                    </footer>
                                )}
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

const EmailPreview = ({ deal, templateId, deadline }: { deal: Deal; templateId: string; deadline: string }) => {
    const template = OFFER_TEMPLATES.find((t) => t.id === templateId)!;
    const discountPct = deal.courseFee ? Math.round((deal.discount / deal.courseFee) * 100) : 0;
    const benefits = ["No-cost EMI options, up to 24 months", "Reduced down payment for the next cohort", "Recorded material for two electives", "Early access to pre-course material"];

    return (
        <div className="flex flex-col gap-4 rounded-xl bg-primary-solid p-5 text-white">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                <span className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">Exclusive offer</span>
                <span className="text-sm font-semibold">{deal.course.name} — for Career Growth</span>
            </div>
            <p className="text-sm text-white/80">Hi {deal.name.split(" ")[0]},</p>
            <p className="text-sm text-white/80">
                Congratulations — you're one step away from starting <span className="font-semibold text-white">{deal.course.name}</span>. This offer ({template.name}) is valid until{" "}
                <span className="font-semibold text-white">{new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>.
            </p>
            <div className="w-max rounded-md bg-brand-solid px-4 py-2 text-sm font-semibold">Accept Your Offer</div>
            {deal.discount > 0 && (
                <p className="text-sm text-white/80">
                    Your personalised scholarship: <span className="font-semibold text-brand-secondary">{formatMoney(deal.discount, deal.currency)} ({discountPct}% off)</span>
                </p>
            )}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                {benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-white/80">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-fg-success-secondary" />
                        {b}
                    </div>
                ))}
            </div>
        </div>
    );
};
