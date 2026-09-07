import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, CreditCard01, FileCheck02 } from "@untitledui/icons";
import type { Deal } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

/** TEMP(dev): floating QA control pad for driving the learner's side of a deal — this prototype
 * has no learner-facing surface, so there's otherwise no way to move a deal past "sent"/"shared"
 * without hand-editing seed data. Docked to the right edge as a slim vertical tab that pops out
 * into buttons only while at least one is actually applicable — deliberately styled as a debug
 * tool (not part of the Figma design) so it reads as scaffolding. Delete this file, its import in
 * `deal-detail.tsx`, and the three `sim*` actions on `DealsProvider` once no longer needed. */
export const LearnerSimPad = ({ deal }: { deal: Deal }) => {
    const { simFillApplication, simAcceptOffer, simMakePayment } = useDeals();

    const canFill = deal.status.id === "APP_PENDING";
    const canAccept = deal.offer.state === "shared";
    const unpaidCount = deal.installments.filter((i) => i.status !== "Paid").length;
    const canPay = deal.offer.state === "accepted" && unpaidCount > 0;

    const actions: { key: string; label: string; icon: typeof FileCheck02; onClick: () => void }[] = [];
    if (canFill) actions.push({ key: "fill", label: "Fill Application", icon: FileCheck02, onClick: () => simFillApplication(deal.id) });
    if (canAccept) actions.push({ key: "accept", label: "Accept Offer", icon: CheckCircle, onClick: () => simAcceptOffer(deal.id) });
    if (canPay) {
        actions.push({
            key: "pay",
            label: unpaidCount > 1 ? `Make Payment (${unpaidCount} left)` : "Make Payment",
            icon: CreditCard01,
            onClick: () => simMakePayment(deal.id),
        });
    }

    return (
        <motion.div
            layout
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed right-0 bottom-24 z-50 flex items-stretch gap-2 rounded-l-xl border border-r-0 border-dashed border-amber-500/40 bg-neutral-900/95 py-3 pr-3 pl-2 shadow-xl backdrop-blur"
        >
            <span
                className="shrink-0 self-center font-mono text-[9px] font-semibold tracking-wider whitespace-nowrap text-amber-400 uppercase"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
                Learner Sim · QA only
            </span>
            <AnimatePresence initial={false}>
                {actions.length > 0 && (
                    <motion.div
                        key="actions"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex flex-col justify-center gap-2 overflow-hidden"
                    >
                        {actions.map(({ key, label, icon: Icon, onClick }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={onClick}
                                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left text-xs font-medium whitespace-nowrap text-white transition duration-100 ease-linear hover:bg-white/15"
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
