import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, CreditCard01, FileCheck02 } from "@untitledui/icons";
import type { Deal } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

/** TEMP(dev): floating QA control pad for driving the learner's side of a deal — this prototype
 * has no learner-facing surface, so there's otherwise no way to move a deal past "sent"/"shared"
 * without hand-editing seed data. Docked to the right edge as a slim vertical tab; click it to
 * pop out the full control list (all three actions always shown, individually disabled when not
 * applicable to the open deal's current state) — deliberately styled as a debug tool (not part of
 * the Figma design) so it reads as scaffolding. Delete this file, its import in
 * `deal-detail.tsx`, and the three `sim*` actions on `DealsProvider` once no longer needed. */
export const LearnerSimPad = ({ deal }: { deal: Deal }) => {
    const { simFillApplication, simAcceptOffer, simMakePayment } = useDeals();
    const [open, setOpen] = useState(false);

    const canFill = deal.status.id === "APP_PENDING";
    const canAccept = deal.offer.state === "shared";
    const unpaidCount = deal.installments.filter((i) => i.status !== "Paid").length;
    const canPay = deal.offer.state === "accepted" && unpaidCount > 0;

    const actions = [
        { key: "fill", label: "Fill Application", icon: FileCheck02, enabled: canFill, onClick: () => simFillApplication(deal.id) },
        { key: "accept", label: "Accept Offer", icon: CheckCircle, enabled: canAccept, onClick: () => simAcceptOffer(deal.id) },
        {
            key: "pay",
            label: unpaidCount > 0 ? `Make Payment (${unpaidCount} left)` : "Make Payment",
            icon: CreditCard01,
            enabled: canPay,
            onClick: () => simMakePayment(deal.id),
        },
    ];

    return (
        <motion.div
            layout
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed right-0 bottom-24 z-50 flex items-stretch gap-2 rounded-l-xl border border-r-0 border-dashed border-amber-500/40 bg-neutral-900/95 py-3 pr-3 pl-2 shadow-xl backdrop-blur"
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="shrink-0 self-stretch font-mono text-[9px] font-semibold tracking-wider whitespace-nowrap text-amber-400 uppercase"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
                Learner Sim · QA only
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="actions"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex flex-col justify-center gap-2 overflow-hidden"
                    >
                        {actions.map(({ key, label, icon: Icon, enabled, onClick }) => (
                            <button
                                key={key}
                                type="button"
                                disabled={!enabled}
                                onClick={onClick}
                                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left text-xs font-medium whitespace-nowrap text-white transition duration-100 ease-linear hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <Icon className="size-4 shrink-0 text-white/70" />
                                {label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
