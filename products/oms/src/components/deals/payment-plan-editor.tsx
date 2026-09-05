import { useEffect, useState } from "react";
import { Plus, Trash01 } from "@untitledui/icons";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import type { Deal, Installment, InstallmentMode } from "@/data/deals-data";
import { canEditPlan } from "@/data/deals-data";
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

/** Everything from the old wizard's step 1 — Upfront/Part Payment toggle, Discount, Course Fee,
 * live Net Payable, installment rows, the Amount Left validator — now a standalone form that
 * saves independently of letter creation (2026-09-05 offer-separation brief §5). Amount Left ≠
 * 0 no longer blocks saving; it only blocks `canCreateLetter`. */
export const PaymentPlanForm = ({ deal, onSaved }: { deal: Deal; onSaved?: () => void }) => {
    const { savePlan } = useDeals();
    const [planType, setPlanType] = useState<"upfront" | "part">(deal.installments.length > 1 ? "part" : "upfront");
    const [discount, setDiscount] = useState(deal.discount || 0);
    const [installments, setInstallments] = useState<DraftInstallment[]>(draftFromDeal(deal));

    const netPayable = Math.max(0, deal.courseFee - discount);
    const totalAssigned = installments.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const amountLeft = planType === "upfront" ? 0 : netPayable - totalAssigned;
    const settled = amountLeft === 0;
    const modes = deal.currency === "INR" ? MODES_INR : MODES_USD;

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

    const save = () => {
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
        savePlan(deal.id, { discount, installments: finalInstallments });
        onSaved?.();
    };

    return (
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
                    {!settled && <span className="text-xs text-tertiary">Amount Left must be ₹0 before an offer letter can be created — the plan saves fine either way.</span>}
                </div>
            )}

            <Button color="primary" size="sm" onClick={save} className="self-start">
                Save payment plan
            </Button>
        </div>
    );
};

/** Slideout wrapper around `PaymentPlanForm` — used from the deals list (§6) where there's no
 * deal page to embed the form inline on; the deal-detail page (§7) opens the same slideout for
 * its "Create payment plan" / "Edit" affordances. */
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
