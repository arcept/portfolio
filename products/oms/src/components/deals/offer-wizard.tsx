import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Check, ChevronLeft, Plus, Trash01 } from "@untitledui/icons";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import type { Deal, Installment, InstallmentMode } from "@/data/deals-data";
import { OFFER_TEMPLATES, STATUS } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

const MODES_INR: InstallmentMode[] = ["Razorpay", "Manual", "EMI_3P"];
const MODES_USD: InstallmentMode[] = ["Stripe", "Stripe EMI"];
const EMI_TENURES = [3, 6, 12] as const;

type DraftInstallment = { amount: number; mode: InstallmentMode; deadline: string; isEmi: boolean; emiMonths: number | null };

function isoInDays(n: number): string {
    return new Date(PROTOTYPE_TODAY.getTime() + n * 86_400_000).toISOString().slice(0, 10);
}
function formatMoney(amount: number, currency: "INR" | "USD"): string {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US")}`;
}

function draftFromDeal(deal: Deal): DraftInstallment[] {
    if (deal.installments.length) {
        return deal.installments.map((i) => ({ amount: i.amount, mode: i.mode, deadline: i.deadline, isEmi: i.isEmi, emiMonths: i.emiMonths }));
    }
    return [{ amount: Math.max(0, deal.courseFee - deal.discount), mode: deal.currency === "INR" ? "Razorpay" : "Stripe", deadline: isoInDays(14), isEmi: false, emiMonths: null }];
}

export const OfferWizard = ({ dealId, onOpenChange }: { dealId: string | null; onOpenChange: (open: boolean) => void }) => {
    const { deals, updateDeal, logActivity } = useDeals();
    const navigate = useNavigate();
    const deal = dealId ? deals.find((d) => d.id === dealId) : undefined;

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [planType, setPlanType] = useState<"upfront" | "part">("upfront");
    const [discount, setDiscount] = useState(0);
    const [installments, setInstallments] = useState<DraftInstallment[]>([]);
    const [templateId, setTemplateId] = useState(OFFER_TEMPLATES[2].id);
    const [offerDeadline, setOfferDeadline] = useState(isoInDays(7));

    // Re-seed local wizard state whenever it opens on a (possibly different) deal — the wizard's
    // own state is a form, not app state, and only commits to the deal on Submit.
    useEffect(() => {
        if (!deal) return;
        setStep(1);
        setPlanType(deal.installments.length > 1 ? "part" : "upfront");
        setDiscount(deal.discount || 0);
        setInstallments(draftFromDeal(deal));
        setTemplateId(OFFER_TEMPLATES[2].id);
        setOfferDeadline(isoInDays(7));
    }, [dealId]);

    if (!deal) return null;

    const isRevise = deal.reachedStage >= 1;
    const netPayable = Math.max(0, deal.courseFee - discount);
    const totalAssigned = installments.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const amountLeft = planType === "upfront" ? 0 : netPayable - totalAssigned;
    const settled = amountLeft === 0;
    const modes = deal.currency === "INR" ? MODES_INR : MODES_USD;
    const nextDisabled = step === 1 && planType === "part" && amountLeft !== 0;

    const setPlanTypeAndReseed = (type: "upfront" | "part") => {
        setPlanType(type);
        if (type === "upfront") {
            setInstallments([{ amount: netPayable, mode: installments[0]?.mode ?? (deal.currency === "INR" ? "Razorpay" : "Stripe"), deadline: isoInDays(14), isEmi: false, emiMonths: null }]);
        } else if (installments.length === 1) {
            setInstallments([{ ...installments[0], amount: netPayable }]);
        }
    };

    const updateInstallment = (index: number, patch: Partial<DraftInstallment>) => {
        setInstallments((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const submit = () => {
        const finalInstallments: Installment[] = installments.map((r, i) => ({
            label: planType === "part" ? `Installment ${i + 1}` : "Full payment",
            amount: Number(r.amount) || 0,
            mode: r.mode,
            isEmi: r.isEmi,
            emiMonths: r.isEmi ? r.emiMonths : null,
            emiInterest: r.isEmi ? Math.round((Number(r.amount) || 0) * 0.06) : null,
            deadline: r.deadline,
            status: "Unpaid",
            paidOn: null,
        }));
        updateDeal(deal.id, {
            discount,
            netPayable,
            installments: finalInstallments,
            status: STATUS.OFFER_PENDING,
            reachedStage: Math.max(deal.reachedStage, 1) as Deal["reachedStage"],
        });
        const template = OFFER_TEMPLATES.find((t) => t.id === templateId)!;
        logActivity(deal.id, isRevise ? "Offer letter revised" : "Offer letter sent", `${template.name} template`);
        setStep(3);
    };

    const close = () => onOpenChange(false);

    return (
        <SlideoutMenu.Trigger isOpen={!!dealId} onOpenChange={onOpenChange}>
            <SlideoutMenu dialogClassName="max-w-2xl">
                {() => (
                    <>
                        <SlideoutMenu.Header onClose={close}>
                            <div className="flex flex-col gap-1">
                                <span className="text-md font-semibold text-primary">{isRevise ? "Revise" : "Send"} offer letter</span>
                                <span className="text-xs text-tertiary">
                                    {deal.name} · {deal.course.short}
                                </span>
                            </div>
                            {step < 3 && (
                                <div className="mt-3 flex items-center gap-2 text-xs">
                                    <StepDot active={step === 1} done={step > 1} label="Payment Plan" />
                                    <span className="h-px w-6 bg-border-secondary" />
                                    <StepDot active={step === 2} done={step > 2} label="Template" />
                                </div>
                            )}
                        </SlideoutMenu.Header>

                        <SlideoutMenu.Content>
                            {step === 1 && (
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-secondary">Payment type</span>
                                        <div className="flex w-max items-center gap-0.5 rounded-lg border border-secondary bg-primary p-0.5">
                                            {(["upfront", "part"] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setPlanTypeAndReseed(type)}
                                                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition duration-100 ease-linear ${
                                                        planType === type ? "bg-secondary text-secondary shadow-xs" : "text-quaternary hover:text-secondary"
                                                    }`}
                                                >
                                                    {type === "upfront" ? "Upfront" : "Part Payment"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Input
                                        label={`Discount (${deal.currency})`}
                                        type="number"
                                        size="sm"
                                        value={String(discount)}
                                        onChange={(v) => {
                                            const next = Number(v) || 0;
                                            setDiscount(next);
                                            if (planType === "upfront") setInstallments((prev) => [{ ...prev[0], amount: Math.max(0, deal.courseFee - next) }]);
                                        }}
                                    />

                                    <div className="flex flex-col gap-1.5 border-t border-secondary pt-4">
                                        <div className="flex items-center justify-between text-sm text-tertiary">
                                            <span>Course Fee</span>
                                            <span>{formatMoney(deal.courseFee, deal.currency)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm font-semibold text-primary">
                                            <span>Net Payable Fee</span>
                                            <span>{formatMoney(netPayable, deal.currency)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <span className="text-sm font-medium text-secondary">Installments</span>
                                        {installments.map((row, i) => (
                                            <InstallmentBuilderRow
                                                key={i}
                                                row={row}
                                                index={i}
                                                currency={deal.currency}
                                                modes={modes}
                                                planType={planType}
                                                canRemove={planType === "part" && installments.length > 1}
                                                onChange={(patch) => updateInstallment(i, patch)}
                                                onRemove={() => setInstallments((prev) => prev.filter((_, idx) => idx !== i))}
                                            />
                                        ))}
                                        {planType === "part" && (
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                iconLeading={Plus}
                                                onClick={() =>
                                                    setInstallments((prev) => [
                                                        ...prev,
                                                        { amount: Math.max(0, amountLeft), mode: deal.currency === "INR" ? "Razorpay" : "Stripe", deadline: isoInDays(21), isEmi: false, emiMonths: null },
                                                    ])
                                                }
                                            >
                                                Add Installment
                                            </Button>
                                        )}
                                    </div>

                                    {planType === "part" && (
                                        <div className="flex flex-col gap-2 rounded-lg border border-secondary p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-secondary">Amount Left</span>
                                                <span className={`text-sm font-semibold ${settled ? "text-success-primary" : "text-warning-primary"}`}>{formatMoney(amountLeft, deal.currency)}</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-quaternary">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-150 ${settled ? "bg-fg-success-primary" : "bg-fg-brand-primary"}`}
                                                    style={{ width: `${Math.min(100, Math.round((totalAssigned / (netPayable || 1)) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
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
                                                <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${templateId === t.id ? "border-brand bg-brand-solid" : "border-secondary"}`}>
                                                    {templateId === t.id && <Check className="size-2.5 text-white" />}
                                                </span>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-primary">{t.name}</span>
                                                    <span className="text-xs text-tertiary">{t.blurb}</span>
                                                </div>
                                            </button>
                                        ))}
                                        <Input label="Choose deadline" type="date" size="sm" value={offerDeadline} onChange={setOfferDeadline} />
                                    </div>
                                    <EmailPreview deal={deal} discount={discount} templateId={templateId} offerDeadline={offerDeadline} />
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col items-center gap-4 py-12 text-center">
                                    <span className="flex size-12 items-center justify-center rounded-full bg-success-primary">
                                        <Check className="size-6 text-fg-success-primary" />
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-lg font-semibold text-primary">Offer sent to {deal.name.split(" ")[0]}!</span>
                                        <span className="max-w-sm text-sm text-tertiary">They'll receive it by email, with a link back to their offer. You can track acceptance from their Deal.</span>
                                    </div>
                                    <Button
                                        color="primary"
                                        iconTrailing={ArrowRight}
                                        onClick={() => {
                                            close();
                                            navigate(`/deals/${deal.id}`);
                                        }}
                                    >
                                        View deal
                                    </Button>
                                </div>
                            )}
                        </SlideoutMenu.Content>

                        {step < 3 && (
                            <SlideoutMenu.Footer className="flex items-center justify-between">
                                <span className="text-xs text-tertiary">*Lead will receive this offer on their email</span>
                                <div className="flex items-center gap-2">
                                    {step === 2 && (
                                        <Button color="secondary" size="sm" iconLeading={ChevronLeft} onClick={() => setStep(1)}>
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        color="primary"
                                        size="sm"
                                        isDisabled={nextDisabled}
                                        onClick={() => {
                                            if (step === 1) setStep(2);
                                            else submit();
                                        }}
                                    >
                                        {step === 1 ? "Next Step" : "Send"}
                                    </Button>
                                </div>
                            </SlideoutMenu.Footer>
                        )}
                    </>
                )}
            </SlideoutMenu>
        </SlideoutMenu.Trigger>
    );
};

const StepDot = ({ active, done, label }: { active: boolean; done: boolean; label: string }) => (
    <span className={`flex items-center gap-1.5 ${active ? "text-secondary" : "text-quaternary"}`}>
        <span className={`flex size-4 items-center justify-center rounded-full text-[10px] ${active ? "bg-brand-solid text-white" : done ? "bg-fg-success-primary text-white" : "border border-secondary"}`}>
            {done ? <Check className="size-2.5" /> : label === "Payment Plan" ? "1" : "2"}
        </span>
        {label}
    </span>
);

const InstallmentBuilderRow = ({
    row,
    currency,
    modes,
    planType,
    canRemove,
    onChange,
    onRemove,
}: {
    row: DraftInstallment;
    index: number;
    currency: "INR" | "USD";
    modes: InstallmentMode[];
    planType: "upfront" | "part";
    canRemove: boolean;
    onChange: (patch: Partial<DraftInstallment>) => void;
    onRemove: () => void;
}) => {
    const modeOptions = modes.map((m) => ({ id: m, label: m }));

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-secondary p-3">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                <Input label="Amount" type="number" size="sm" value={String(row.amount)} onChange={(v) => onChange({ amount: Number(v) || 0 })} isDisabled={planType === "upfront"} />
                <Select
                    aria-label="Mode"
                    label="Mode"
                    size="sm"
                    items={modeOptions}
                    selectedKey={row.mode}
                    onSelectionChange={(key) => {
                        const mode = key as InstallmentMode;
                        onChange({ mode, isEmi: mode.includes("EMI"), emiMonths: mode.includes("EMI") ? (row.emiMonths ?? 6) : null });
                    }}
                >
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
                <Input label={row.isEmi ? "Start date" : "Deadline"} type="date" size="sm" value={row.deadline} onChange={(v) => onChange({ deadline: v })} />
                {canRemove ? (
                    <button type="button" onClick={onRemove} className="rounded-md p-2 text-fg-quaternary hover:bg-secondary_hover hover:text-fg-error-primary" title="Remove">
                        <Trash01 className="size-4" />
                    </button>
                ) : (
                    <span />
                )}
            </div>

            {row.isEmi && (
                <div className="grid grid-cols-3 gap-2">
                    {EMI_TENURES.map((months) => {
                        const monthly = Math.round((Number(row.amount) || 0) / months);
                        const interest = Math.round((Number(row.amount) || 0) * (months === 3 ? 0.03 : months === 6 ? 0.06 : 0.1));
                        return (
                            <button
                                key={months}
                                type="button"
                                onClick={() => onChange({ emiMonths: months })}
                                className={`flex flex-col gap-0.5 rounded-lg border p-2.5 text-left transition duration-100 ease-linear ${
                                    row.emiMonths === months ? "border-brand bg-secondary" : "border-secondary hover:bg-secondary_hover"
                                }`}
                            >
                                <span className="text-sm font-semibold text-primary">{formatMoney(monthly, currency)}/mo</span>
                                <span className="text-xs text-tertiary">
                                    for {months} months · {formatMoney(interest, currency)} interest
                                </span>
                            </button>
                        );
                    })}
                    <p className="col-span-3 text-xs text-tertiary">Payment link will be sent to the learner directly by the gateway.</p>
                </div>
            )}
        </div>
    );
};

const EmailPreview = ({ deal, discount, templateId, offerDeadline }: { deal: Deal; discount: number; templateId: string; offerDeadline: string }) => {
    const template = OFFER_TEMPLATES.find((t) => t.id === templateId)!;
    const discountPct = deal.courseFee ? Math.round((discount / deal.courseFee) * 100) : 0;
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
                <span className="font-semibold text-white">{new Date(offerDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>.
            </p>
            <div className="w-max rounded-md bg-brand-solid px-4 py-2 text-sm font-semibold">Accept Your Offer</div>
            {discount > 0 && (
                <p className="text-sm text-white/80">
                    Your personalised scholarship: <span className="font-semibold text-brand-secondary">{formatMoney(discount, deal.currency)} ({discountPct}% off)</span>
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
