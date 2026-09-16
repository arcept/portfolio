import type { ReactNode } from "react";
import { X } from "@untitledui/icons";

interface ModalProps {
    children: ReactNode;
    width?: number;
}

// Pop-up shell (components.md node 3519:71735) used by every apply/query/accept-offer/offer-concern
// popup. Non-focus-trapping for now — full React Aria Dialog semantics land during the chrome pass
// (products/placement/CLAUDE.md build order: "scenarios → chrome → ... → motion polish").
export const Modal = ({ children, width = 480 }: ModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-6">
            <div className="relative rounded-2xl bg-primary p-6 shadow-xl" style={{ width }}>
                <button type="button" className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-quaternary hover:bg-secondary_hover" aria-label="Close">
                    <X className="size-4" />
                </button>
                {children}
            </div>
        </div>
    );
};
