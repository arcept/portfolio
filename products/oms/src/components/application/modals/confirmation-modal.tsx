import { useEffect, useState } from "react";
import type { FC, ReactNode } from "react";
import { Copy04 } from "@untitledui/icons";
import confirmationBanner from "@/assets/modals/confirmation-banner.jpg";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";

export type ConfirmationModalTint = "default" | "brand";

export type ConfirmationModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** "brand" lays a purple mix-blend tint over the banner artwork — Figma's variant for a
     * repeat action (e.g. resend) so it reads visually distinct from the first-time one. */
    tint?: ConfirmationModalTint;
    title: string;
    description: ReactNode;
    /** Optional content between the header and the actions row — e.g. `ConfirmationModal.MetaRow`. */
    children?: ReactNode;
    /** When set, renders a "Yes, ... is correct"-style checkbox that gates the confirm button
     * until checked. Omit for confirmations that don't need an explicit acknowledgement. */
    acknowledgementLabel?: string;
    cancelLabel?: string;
    /** Leading icon on the cancel button — e.g. Share Offer's "Go back" (Figma node 466:43276). */
    cancelIcon?: FC<{ className?: string }>;
    confirmLabel: string;
    onConfirm: () => void;
    /** Extra condition (e.g. a permission guard) that disables confirm regardless of acknowledgement. */
    isConfirmDisabled?: boolean;
};

/** Shared shell for "this actually goes out" confirmations — Figma's painted-banner modal (node
 * 412:13057, Send/Resend Application Form). Built as one reusable component rather than one-off
 * markup per action since this exact style is meant to cover every future confirmation of this
 * kind (share, regenerate, withdraw, ...), not just the application-form flows it launched with. */
export const ConfirmationModal = ({
    isOpen,
    onOpenChange,
    tint = "default",
    title,
    description,
    children,
    acknowledgementLabel,
    cancelLabel = "Cancel",
    cancelIcon,
    confirmLabel,
    onConfirm,
    isConfirmDisabled,
}: ConfirmationModalProps) => {
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        if (isOpen) setAcknowledged(false);
    }, [isOpen]);

    const close = () => onOpenChange(false);
    const confirmDisabled = (!!acknowledgementLabel && !acknowledged) || !!isConfirmDisabled;

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-[640px]">
                    <Dialog>
                        {() => (
                            <div className="relative flex w-full flex-col overflow-hidden rounded-2xl shadow-xl">
                                <div className="relative h-14 w-full shrink-0 overflow-hidden">
                                    <img src={confirmationBanner} alt="" className="absolute top-[-168.75%] left-[-2.23%] h-[437.5%] w-[104.45%] max-w-none" />
                                    {tint === "brand" && <div aria-hidden className="absolute inset-0 bg-[#6600ff] mix-blend-color" />}
                                </div>

                                <div className="flex w-full flex-col items-start bg-primary">
                                    <div className="flex w-full items-start gap-4 px-6 pt-6">
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <h2 className="text-lg font-semibold text-primary">{title}</h2>
                                            <p className="text-sm text-tertiary">{description}</p>
                                        </div>
                                        <CloseButton size="sm" onClick={close} />
                                    </div>

                                    {children && <div className="flex w-full flex-col gap-1 px-6 pt-6 pb-2">{children}</div>}

                                    <div className="flex w-full items-center gap-3 px-6 pt-4 pb-6">
                                        {acknowledgementLabel && (
                                            <Checkbox size="sm" label={acknowledgementLabel} isSelected={acknowledged} onChange={setAcknowledged} />
                                        )}
                                        <div className="flex flex-1 items-center justify-end gap-3">
                                            <Button color="secondary" size="md" iconLeading={cancelIcon} onClick={close}>
                                                {cancelLabel}
                                            </Button>
                                            <Button
                                                color="primary"
                                                size="md"
                                                className="!bg-green-600 px-5 py-3 !ring-green-400 hover:!bg-green-700"
                                                isDisabled={confirmDisabled}
                                                onClick={onConfirm}
                                            >
                                                {confirmLabel}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

/** The "Email Address" style meta row inside the modal body — label above value, with an
 * optional copy affordance next to the value (matches the app's `MetaField` label/value idiom). */
const MetaRow = ({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) => (
    <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-tertiary">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-sm text-primary">{value}</span>
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
        </div>
    </div>
);

ConfirmationModal.MetaRow = MetaRow;
