import { CheckCircle, CreditCard01, FileCheck02 } from "@untitledui/icons";
import type { Deal } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

/** TEMP(dev): floating QA control pad for driving the learner's side of a deal — this prototype
 * has no learner-facing surface, so there's otherwise no way to move a deal past "sent"/"shared"
 * without hand-editing seed data. Bottom-right overlay, deliberately styled as a debug tool (not
 * part of the Figma design) so it reads as scaffolding. Delete this file, its import in
 * `deal-detail.tsx`, and the three `sim*` actions on `DealsProvider` once no longer needed. */
export const LearnerSimPad = ({ deal }: { deal: Deal }) => {
    const { simFillApplication, simAcceptOffer, simMakePayment } = useDeals();

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
        <div className="fixed right-4 bottom-4 z-50 flex w-56 flex-col gap-2 rounded-xl border border-dashed border-amber-500/40 bg-neutral-900/95 p-3 shadow-xl backdrop-blur">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-amber-400 uppercase">Learner Sim — QA only</span>
            {actions.map(({ key, label, icon: Icon, enabled, onClick }) => (
                <button
                    key={key}
                    type="button"
                    disabled={!enabled}
                    onClick={onClick}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left text-xs font-medium text-white transition duration-100 ease-linear hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <Icon className="size-4 shrink-0 text-white/70" />
                    {label}
                </button>
            ))}
        </div>
    );
};
