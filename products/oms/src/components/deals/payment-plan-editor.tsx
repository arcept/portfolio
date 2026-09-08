import { useEffect, useMemo, useState } from "react";
import { Check, CreditCardPlus } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import bankIcon from "@/assets/payment-icons/bank-icon.svg";
import razorpayModeIcon from "@/assets/payment-icons/razorpay-mode-icon.svg";
import stripeModeIcon from "@/assets/payment-icons/stripe-mode-icon.svg";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { EMI_MODE, FeeBreakdown, GATEWAY_MODE, InstallmentPreviewCard, formatMoney, tierAmount } from "@/components/deals/payment-plan-shared";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import type { Currency, Deal, DiscountBreakdown, Installment, InstallmentMode } from "@/data/deals-data";
import { canEditPlan } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

// ---------------------------------------------------------------------------
// Discount tiers — a fixed menu (Early Bird, Merit, Super Merit, custom) so a BDR
// can't apply an arbitrary, unaudited discount. Upfront additionally auto-applies
// its own one-time discount on top of whichever tier is selected (§ stacking).
// ---------------------------------------------------------------------------

type PaymentType = "upfront" | "part" | "emi";
type DiscountTierId = "early-bird" | "merit" | "super-merit" | "custom";
type InstallmentPlanId = "dp3" | "dp6";
type EmiTenure = 3 | 6 | 12;

const UPFRONT_AUTO_PCT = 5;
const EARLY_BIRD_PCT = 10;
const MERIT_PCT = 15;
const SUPER_MERIT_PCT = 25;
const CUSTOM_DISCOUNT_MAX_PCT = 10;
const EMI_TENURES: EmiTenure[] = [3, 6, 12];
const EMI_INTEREST_PCT: Record<EmiTenure, number> = { 3: 3, 6: 6, 12: 10 };

/** Early Bird is a live promotion, not a permanent discount tier — on only for the last week of
 * the month (a flash-sale window), off the rest of the time. Read off `PROTOTYPE_TODAY`, this
 * prototype's frozen clock, not the real system date. */
function isEarlyBirdAvailable(now: Date): boolean {
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return now.getDate() >= totalDays - 6;
}

function isoInDays(n: number): string {
    return new Date(PROTOTYPE_TODAY.getTime() + n * 86_400_000).toISOString().slice(0, 10);
}

function blankInstallment(label: string, amount: number, mode: InstallmentMode, deadline: string): Installment {
    return { label, amount, mode, isEmi: false, emiMonths: null, emiInterest: null, deadline, status: "Unpaid", paidOn: null };
}

function buildUpfrontInstallments(netPayable: number, mode: InstallmentMode): Installment[] {
    return [blankInstallment("Full payment", netPayable, mode, isoInDays(14))];
}

/** Downpayment is a fixed 15% of Net Payable; the remainder splits evenly across the chosen
 * tenure, with the final installment absorbing any rounding remainder so the total always lands
 * exactly on Net Payable — there's no "Amount Left" leftover to reconcile like the old freeform
 * builder had. */
function buildPartPaymentInstallments(netPayable: number, currency: Currency, months: number, mode: InstallmentMode): Installment[] {
    const roundTo = currency === "INR" ? 100 : 10;
    const downpayment = Math.round((netPayable * 0.15) / roundTo) * roundTo;
    const per = Math.round((netPayable - downpayment) / months / roundTo) * roundTo;
    const rows: Installment[] = [blankInstallment("Downpayment", downpayment, mode, isoInDays(14))];
    let assigned = downpayment;
    for (let i = 0; i < months; i++) {
        const isLast = i === months - 1;
        const amount = isLast ? netPayable - assigned : per;
        assigned += amount;
        rows.push(blankInstallment(`Installment ${i + 1}`, amount, mode, isoInDays(14 + (i + 1) * 30)));
    }
    return rows;
}

function buildEmiInstallment(netPayable: number, currency: Currency, tenure: EmiTenure): Installment {
    return {
        label: "Full Payment",
        amount: netPayable,
        mode: EMI_MODE[currency],
        isEmi: true,
        emiMonths: tenure,
        emiInterest: Math.round(netPayable * (EMI_INTEREST_PCT[tenure] / 100)),
        deadline: isoInDays(14),
        status: "Unpaid",
        paidOn: null,
    };
}

/** Everything from the old wizard's step 1 — Upfront/Part Payment/EMI toggle, discount, live fee
 * breakdown, payment mode, generated installment preview — now a standalone form that saves
 * independently of letter creation (2026-09-05 offer-separation brief §5). */
export const PaymentPlanForm = ({ deal, onSaved }: { deal: Deal; onSaved?: () => void }) => {
    const { savePlan } = useDeals();
    const currency = deal.currency;

    const [paymentType, setPaymentType] = useState<PaymentType>(() =>
        deal.installments.some((i) => i.isEmi) ? "emi" : deal.installments.length > 1 ? "part" : "upfront",
    );
    // Multiple tiers can be selected at once (Early Bird + Merit + a Custom amount, any
    // combination) — Super Merit never enters this set since it's permanently locked.
    const [selectedTiers, setSelectedTiers] = useState<Set<DiscountTierId>>(() => new Set());
    const [customDiscount, setCustomDiscount] = useState(0);
    const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlanId>(() => (deal.installments.length - 1 > 3 ? "dp6" : "dp3"));
    const [emiTenure, setEmiTenure] = useState<EmiTenure>(() => (deal.installments.find((i) => i.isEmi)?.emiMonths as EmiTenure) || 6);
    const [paymentMode, setPaymentMode] = useState<InstallmentMode>(() => (deal.installments[0]?.mode === "Manual" ? "Manual" : GATEWAY_MODE[currency]));

    const toggleTier = (id: DiscountTierId) => {
        setSelectedTiers((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const earlyBirdAvailable = isEarlyBirdAvailable(PROTOTYPE_TODAY);
    const upfrontAutoDiscount = paymentType === "upfront" ? tierAmount(deal.courseFee, currency, UPFRONT_AUTO_PCT) : 0;
    // Capped relative to this deal's own fee, not a flat number — a fixed rupee cap would be
    // trivial on a large course fee and too tight on a small one.
    const customDiscountMax = tierAmount(deal.courseFee, currency, CUSTOM_DISCOUNT_MAX_PCT);

    const discountBreakdown: DiscountBreakdown = useMemo(() => {
        const items: DiscountBreakdown["items"] = [];
        if (selectedTiers.has("early-bird")) items.push({ label: "Early Bird Offer", amount: tierAmount(deal.courseFee, currency, EARLY_BIRD_PCT) });
        if (selectedTiers.has("merit")) items.push({ label: "Merit Scholarship", amount: tierAmount(deal.courseFee, currency, MERIT_PCT) });
        if (selectedTiers.has("custom")) items.push({ label: "Custom BDR Discount", amount: Math.min(customDiscount, customDiscountMax) });
        return { upfront: upfrontAutoDiscount, items };
    }, [selectedTiers, customDiscount, customDiscountMax, deal.courseFee, currency, upfrontAutoDiscount]);

    const totalDiscount = discountBreakdown.upfront + discountBreakdown.items.reduce((sum, i) => sum + i.amount, 0);
    const netPayable = Math.max(0, deal.courseFee - totalDiscount);

    const installments = useMemo(() => {
        if (paymentType === "upfront") return buildUpfrontInstallments(netPayable, paymentMode);
        if (paymentType === "part") return buildPartPaymentInstallments(netPayable, currency, installmentPlan === "dp3" ? 3 : 6, paymentMode);
        return [buildEmiInstallment(netPayable, currency, emiTenure)];
    }, [paymentType, netPayable, paymentMode, installmentPlan, currency, emiTenure]);

    const isFirstSave = deal.installments.length === 0;
    const save = () => {
        savePlan(deal.id, { discount: totalDiscount, discountBreakdown, installments });
        onSaved?.();
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 px-2">
                <span className="text-sm text-tertiary">Payment Type</span>
                <PaymentTypeTabs value={paymentType} onChange={setPaymentType} />
            </div>

            {paymentType === "upfront" && <UpfrontAutoDiscountBanner amount={upfrontAutoDiscount} currency={currency} pct={UPFRONT_AUTO_PCT} />}

            <DiscountTierList
                currency={currency}
                courseFee={deal.courseFee}
                selected={selectedTiers}
                onToggle={toggleTier}
                earlyBirdAvailable={earlyBirdAvailable}
                customDiscount={customDiscount}
                customDiscountMax={customDiscountMax}
                onCustomDiscountChange={setCustomDiscount}
            />

            <FeeBreakdown currency={currency} courseFee={deal.courseFee} discountBreakdown={discountBreakdown} netPayable={netPayable} />

            <PaymentModeSelector currency={currency} value={paymentMode} onChange={setPaymentMode} />

            {paymentType === "part" && <InstallmentPlanPicker value={installmentPlan} onChange={setInstallmentPlan} />}
            {paymentType === "emi" && <EmiTenurePicker currency={currency} netPayable={netPayable} value={emiTenure} onChange={setEmiTenure} />}

            <div className="grid grid-cols-2 gap-2">
                {installments.map((row, i) => (
                    <InstallmentPreviewCard key={i} installment={row} currency={currency} isNext={i === 0} />
                ))}
            </div>

            <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-tertiary/10 to-tertiary p-6 shadow-lg">
                <p className="text-sm text-primary">Please save/create the payment plan only when you’ve reverified every detail.</p>
                <Button
                    color="primary"
                    size="md"
                    iconLeading={CreditCardPlus}
                    onClick={save}
                    className="w-max !bg-green-600 !ring-green-400 hover:!bg-green-700"
                >
                    {isFirstSave ? "Create Payment Plan" : "Save Payment Plan"}
                </Button>
            </div>
        </div>
    );
};

/** Slideout wrapper around `PaymentPlanForm` — used from the deals list (§6) where there's no
 * deal page to embed the form inline on; the deal-detail page (§7) embeds the same form directly
 * in the section instead. */
export const PaymentPlanEditor = ({ dealId, onOpenChange }: { dealId: string | null; onOpenChange: (open: boolean) => void }) => {
    const { deals, createPlan } = useDeals();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!deal) return;
        if (deal.plan.state === "none") createPlan(deal.id);
        setReady(true);
    }, [dealId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!deal) return null;
    const editable = canEditPlan(deal).allowed || deal.plan.state === "none";

    return (
        <SlideoutMenu.Trigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <SlideoutMenu>
                {({ close }) => (
                    <>
                        <SlideoutMenu.Header onClose={close}>
                            <div className="flex flex-col gap-1">
                                <span className="text-md font-semibold text-primary">Payment Plan</span>
                                <span className="text-xs text-tertiary">
                                    {deal.name} · {deal.course.short}
                                </span>
                            </div>
                        </SlideoutMenu.Header>
                        <SlideoutMenu.Content>
                            {ready && editable ? (
                                <PaymentPlanForm deal={deal} onSaved={close} />
                            ) : (
                                <p className="text-sm text-tertiary">{canEditPlan(deal).reason ?? "This plan can't be edited right now."}</p>
                            )}
                        </SlideoutMenu.Content>
                    </>
                )}
            </SlideoutMenu>
        </SlideoutMenu.Trigger>
    );
};

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = { upfront: "Upfront", part: "Part Payment", emi: "EMI 3rd Party" };

const PaymentTypeTabs = ({ value, onChange }: { value: PaymentType; onChange: (v: PaymentType) => void }) => (
    <div className="flex w-max items-center gap-1 rounded-[20px] border border-secondary bg-secondary_alt p-1">
        {(["upfront", "part", "emi"] as const).map((type) => (
            <button
                key={type}
                type="button"
                onClick={() => onChange(type)}
                className={`flex h-9 items-center justify-center rounded-2xl px-4 text-sm font-semibold whitespace-nowrap transition duration-150 ease-linear ${
                    value === type ? "bg-white text-neutral-900 shadow-sm" : "text-placeholder opacity-60 hover:opacity-100"
                }`}
            >
                {PAYMENT_TYPE_LABEL[type]}
            </button>
        ))}
    </div>
);

const UpfrontAutoDiscountBanner = ({ amount, currency, pct }: { amount: number; currency: Currency; pct: number }) => (
    <div className="flex items-start gap-3 px-2">
        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-fg-success-primary bg-success-solid">
            <Check className="size-2.5 text-white" />
        </span>
        <div className="flex flex-col gap-1">
            <span className="text-sm text-success-primary">Upfront One Time Discount (Auto Applied)</span>
            <span className="text-md font-semibold text-primary">
                {formatMoney(amount, currency)} off ({pct}%)
            </span>
        </div>
    </div>
);

type TierMeta = {
    id: DiscountTierId;
    title: string;
    sub?: string;
    /** Only "Merit Scholarship"'s sub-label is italic in Figma — a literal authoring detail, not
     * a rule tied to selection state. */
    italicSub?: boolean;
    pct?: number;
    badge: { label: string; tone: "success" | "warning" };
    locked?: boolean;
};
const BADGE_TONE_CLASSES: Record<"success" | "warning", string> = { success: "text-success-primary", warning: "text-warning-primary" };

const DiscountTierList = ({
    currency,
    courseFee,
    selected,
    onToggle,
    earlyBirdAvailable,
    customDiscount,
    customDiscountMax,
    onCustomDiscountChange,
}: {
    currency: Currency;
    courseFee: number;
    /** Multiple tiers can be active at once — this isn't a radio group. */
    selected: Set<DiscountTierId>;
    onToggle: (id: DiscountTierId) => void;
    earlyBirdAvailable: boolean;
    customDiscount: number;
    customDiscountMax: number;
    onCustomDiscountChange: (v: number) => void;
}) => {
    const tiers: TierMeta[] = [
        {
            id: "early-bird",
            title: "Early Bird Offer",
            sub: "Only active in the last week of the month",
            pct: EARLY_BIRD_PCT,
            badge: earlyBirdAvailable ? { label: "Available", tone: "success" } : { label: "Unavailable", tone: "warning" },
            locked: !earlyBirdAvailable,
        },
        {
            id: "merit",
            title: "Merit Scholarship",
            sub: "Includes the merit/need-based scholarship line.",
            italicSub: true,
            pct: MERIT_PCT,
            badge: { label: "Available", tone: "success" },
        },
        {
            id: "super-merit",
            title: "Super Merit Scholarship",
            sub: "Need Sales Ops Approval.",
            pct: SUPER_MERIT_PCT,
            badge: { label: "Approval Required", tone: "warning" },
            locked: true,
        },
        { id: "custom", title: "Custom BDR Discount", badge: { label: "Available", tone: "success" } },
    ];

    return (
        <div className="flex flex-col gap-2 px-2">
            <span className="text-sm text-tertiary">Discount</span>
            <div className="flex flex-col gap-1">
                {tiers.map((tier) => (
                    <div key={tier.id}>
                        <DiscountTierRow
                            tier={tier}
                            isSelected={selected.has(tier.id)}
                            amount={tier.pct ? tierAmount(courseFee, currency, tier.pct) : customDiscount}
                            currency={currency}
                            onClick={() => !tier.locked && onToggle(tier.id)}
                        />
                        {tier.id === "custom" && selected.has("custom") && (
                            <CustomDiscountInput
                                currency={currency}
                                customDiscount={customDiscount}
                                max={customDiscountMax}
                                onApply={onCustomDiscountChange}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DiscountTierRow = ({
    tier,
    isSelected,
    amount,
    currency,
    onClick,
}: {
    tier: TierMeta;
    isSelected: boolean;
    amount: number;
    currency: Currency;
    onClick: () => void;
}) => (
    <button
        type="button"
        disabled={tier.locked}
        onClick={onClick}
        className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition duration-100 ease-linear disabled:cursor-not-allowed ${
            isSelected ? "bg-tertiary/50" : "opacity-60 hover:opacity-100"
        }`}
    >
        <span className="flex w-4 shrink-0 items-center justify-center py-1">
            {isSelected ? (
                <span className="flex size-4 items-center justify-center rounded-full border border-fg-success-primary bg-success-solid">
                    <Check className="size-2.5 text-white" />
                </span>
            ) : (
                <span className="size-3 rounded-full border border-secondary" />
            )}
        </span>
        <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm ${isSelected ? "text-success-primary" : "text-secondary"}`}>{tier.title}</span>
                {tier.sub && <span className={`text-[10px] text-tertiary ${tier.italicSub ? "italic" : ""}`}>{tier.sub}</span>}
            </div>
            {/* Once expanded, the input below is the source of truth for the amount — showing it
             * here too would just be a second, staler copy of the same number (Figma node
             * 481:8552, Property1=Variant2). */}
            {!(tier.id === "custom" && isSelected) && (
                <span className="text-md font-semibold text-primary">
                    {tier.id === "custom" ? `${formatMoney(amount, currency)} off` : `${formatMoney(amount, currency)} off (${tier.pct}%)`}
                </span>
            )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE_TONE_CLASSES[tier.badge.tone]}`}>{tier.badge.label}</span>
    </button>
);

/** Custom BDR Discount's expanded state (Figma node 481:8552, Property1=Variant2) — a staged
 * input rather than live-as-you-type, so a BDR can enter a number, reconsider it, and only commit
 * with "Apply Discount" rather than every keystroke immediately changing Net Payable. */
const CustomDiscountInput = ({
    currency,
    customDiscount,
    max,
    onApply,
}: {
    currency: Currency;
    customDiscount: number;
    max: number;
    onApply: (v: number) => void;
}) => {
    const [draft, setDraft] = useState(String(customDiscount));

    return (
        <div className="flex flex-col gap-2 py-2 pr-3 pl-9">
            <div className="flex h-[34px] items-center gap-2">
                <div className="flex h-full flex-1 items-center rounded border border-fg-quaternary px-2 py-1">
                    <input
                        type="number"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full bg-transparent text-md font-semibold text-primary outline-none"
                    />
                </div>
                <Button
                    size="sm"
                    color="primary"
                    className="!bg-green-600 !ring-green-400 hover:!bg-green-700"
                    onClick={() => onApply(Math.min(max, Math.max(0, Number(draft) || 0)))}
                >
                    Apply Discount
                </Button>
            </div>
            <span className="text-sm text-tertiary">Maximum Discount {formatMoney(max, currency)}</span>
        </div>
    );
};

const RadioDot = ({ selected }: { selected: boolean }) => (
    <span className={`flex size-4 shrink-0 items-center justify-center rounded-full ${selected ? "bg-success-solid" : "border-2 border-secondary"}`}>
        {selected && <span className="size-1.5 rounded-full bg-white" />}
    </span>
);

/** Always shows all three modes — Razorpay only makes sense for INR and Stripe only for USD, so
 * whichever gateway doesn't match the deal's currency is disabled rather than hidden. */
const PaymentModeSelector = ({ currency, value, onChange }: { currency: Currency; value: InstallmentMode; onChange: (m: InstallmentMode) => void }) => {
    const razorpayDisabled = currency !== "INR";
    const stripeDisabled = currency !== "USD";
    return (
        <div className="flex flex-col gap-2 px-2">
            <span className="text-sm text-tertiary">Payment Mode</span>
            <div className="flex flex-wrap items-center gap-6">
                {/* `AriaButton`, not a plain `<button>` — a hover-triggered `Tooltip` only reaches
                 * components that call react-aria's `useFocusable` internally, which a bare host
                 * element never does. And deliberately not `isDisabled` on it either: react-aria
                 * renders that as the native `disabled` attribute (no pointer events fire on that
                 * at all) *and* separately skips forwarding the tooltip's own hover props whenever
                 * `isDisabled` is set. `aria-disabled` gets the same visual/semantic disabled state
                 * — the click handler below is what actually blocks switching to it. */}
                <Tooltip title="Only available for INR deals" placement="bottom" isDisabled={!razorpayDisabled}>
                    <AriaButton
                        aria-disabled={razorpayDisabled || undefined}
                        onPress={() => !razorpayDisabled && onChange("Razorpay")}
                        className="flex cursor-pointer items-center gap-3 p-2 outline-hidden aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
                    >
                        <RadioDot selected={value === "Razorpay"} />
                        <img src={razorpayModeIcon} alt="Razorpay" className="h-6 w-auto" />
                    </AriaButton>
                </Tooltip>
                <Tooltip title="Only available for USD deals" placement="bottom" isDisabled={!stripeDisabled}>
                    <AriaButton
                        aria-disabled={stripeDisabled || undefined}
                        onPress={() => !stripeDisabled && onChange("Stripe")}
                        className="flex cursor-pointer items-center gap-3 p-2 outline-hidden aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
                    >
                        <RadioDot selected={value === "Stripe"} />
                        <img src={stripeModeIcon} alt="Stripe" className="h-6 w-auto" />
                    </AriaButton>
                </Tooltip>
                <button type="button" onClick={() => onChange("Manual")} className="flex items-center gap-3 p-2 text-left">
                    <RadioDot selected={value === "Manual"} />
                    <img src={bankIcon} alt="" className="size-8" />
                    <span className="text-sm font-semibold text-tertiary">
                        Manual Bank
                        <br />
                        Transfer
                    </span>
                </button>
            </div>
        </div>
    );
};

const INSTALLMENT_PLAN_LABEL: Record<InstallmentPlanId, { top: string; bottom: string }> = {
    dp3: { top: "Downpayment+", bottom: "3 Monthly Instalments" },
    dp6: { top: "Downpayment+", bottom: "6 Monthly Instalments" },
};

const InstallmentPlanPicker = ({ value, onChange }: { value: InstallmentPlanId; onChange: (v: InstallmentPlanId) => void }) => (
    <div className="flex flex-col gap-2 px-2">
        <span className="text-sm text-tertiary">Instalment Plan</span>
        <div className="flex flex-wrap gap-6">
            {(["dp3", "dp6"] as const).map((id) => (
                <button key={id} type="button" onClick={() => onChange(id)} className="flex items-center gap-3 p-2 text-left">
                    <RadioDot selected={value === id} />
                    <span className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">{INSTALLMENT_PLAN_LABEL[id].top}</span>
                        <span className="text-md font-semibold text-primary">{INSTALLMENT_PLAN_LABEL[id].bottom}</span>
                    </span>
                </button>
            ))}
        </div>
    </div>
);

/** No Figma design exists for this tab yet — adapted from the old freeform builder's EMI tenure
 * cards (3/6/12 months with computed monthly + interest), reskinned to match the rest of this
 * section's new visual language rather than left as a placeholder. */
const EmiTenurePicker = ({
    currency,
    netPayable,
    value,
    onChange,
}: {
    currency: Currency;
    netPayable: number;
    value: EmiTenure;
    onChange: (v: EmiTenure) => void;
}) => (
    <div className="flex flex-col gap-2 px-2">
        <span className="text-sm text-tertiary">EMI Tenure</span>
        <div className="grid grid-cols-3 gap-2">
            {EMI_TENURES.map((months) => {
                const monthly = Math.round(netPayable / months);
                const interest = Math.round(netPayable * (EMI_INTEREST_PCT[months] / 100));
                const selected = value === months;
                return (
                    <button
                        key={months}
                        type="button"
                        onClick={() => onChange(months)}
                        className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition duration-100 ease-linear ${
                            selected ? "border-brand bg-secondary" : "border-secondary hover:bg-secondary_hover"
                        }`}
                    >
                        <span className="text-md font-semibold text-primary">{formatMoney(monthly, currency)}/mo</span>
                        <span className="text-xs text-tertiary">
                            for {months} months · {formatMoney(interest, currency)} interest
                        </span>
                    </button>
                );
            })}
        </div>
        <p className="text-xs text-tertiary">Payment link will be sent to the learner directly by the 3rd-party financier.</p>
    </div>
);
