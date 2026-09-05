import { useEffect, useState } from "react";
import { Check, Send01 } from "@untitledui/icons";
import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { applicationFormUrl, canResendApplication, canSendApplication } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

export type ApplicationLinkRequest = { dealId: string; mode: "send" | "resend" } | null;

/** Confirmation for (re)sending the application-form link — a brand new deal (`APP_NEW`) hasn't
 * had it sent at all; a pending or expired one (`APP_PENDING`/`APP_EXPIRED`) gets the same link
 * resent. Both route through here rather than firing on a bare click, matching every other
 * "this actually goes to the learner" action in the app (Share Offer, Resend Letter). */
export const ApplicationLinkDialog = ({ request, onOpenChange }: { request: ApplicationLinkRequest; onOpenChange: (open: boolean) => void }) => {
    const { deals, sendApplication, resendApplication } = useDeals();
    const deal = request ? deals.find((d) => d.id === request.dealId) : undefined;
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDone(false);
    }, [request?.dealId, request?.mode]);

    if (!request || !deal) return null;
    const isResend = request.mode === "resend";
    const guard = isResend ? canResendApplication(deal) : canSendApplication(deal);
    const close = () => onOpenChange(false);
    const confirm = () => {
        if (isResend) resendApplication(deal.id);
        else sendApplication(deal.id);
        setDone(true);
    };

    return (
        <DialogTrigger isOpen={!!request} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-md">
                    <Dialog>
                        {() => (
                            <div className="relative flex w-full flex-col items-center gap-4 rounded-2xl bg-primary p-6 text-center shadow-xl">
                                <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />
                                {done ? (
                                    <>
                                        <span className="flex size-12 items-center justify-center rounded-full bg-success-primary">
                                            <Check className="size-6 text-fg-success-primary" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-md font-semibold text-primary">{isResend ? "Application form resent" : "Application form sent"}</span>
                                            <span className="text-sm text-tertiary">
                                                {deal.name} will receive it at {deal.email}.
                                            </span>
                                        </div>
                                        <Button color="secondary" size="sm" onClick={close}>
                                            Done
                                        </Button>
                                    </>
                                ) : !guard.allowed ? (
                                    <>
                                        <span className="text-md font-semibold text-primary">Can't {isResend ? "resend" : "send"}</span>
                                        <p className="text-sm text-tertiary">{guard.reason}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-md font-semibold text-primary">{isResend ? "Resend application form?" : "Send application form?"}</span>
                                            <span className="text-sm text-tertiary">
                                                {deal.name} · {deal.email}
                                            </span>
                                        </div>
                                        <div className="w-full rounded-lg border border-secondary p-3 text-left">
                                            <span className="font-mono text-xs break-all text-tertiary">{applicationFormUrl(deal)}</span>
                                        </div>
                                        <div className="flex w-full items-center justify-end gap-2">
                                            <Button color="secondary" size="sm" onClick={close}>
                                                Cancel
                                            </Button>
                                            <Button color="primary" size="sm" iconLeading={Send01} onClick={confirm}>
                                                {isResend ? "Resend" : "Send"} Application Form
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
