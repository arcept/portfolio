import { useState } from "react";
import { ChevronDown } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import bankIcon from "@/assets/payment-icons/bank-icon.svg";
import razorpayWordmark from "@/assets/payment-icons/razorpay-wordmark.svg";
import stripeModeIcon from "@/assets/payment-icons/stripe-mode-icon.svg";
import type { Currency, Deal, DiscountBreakdown, Installment, InstallmentMode } from "@/data/deals-data";
import { cx } from "@/utils/cx";

/** Gateway used for the plan's single non-manual mode, keyed by currency — everything else
 * (Manual Bank Transfer) is currency-agnostic. */
export const GATEWAY_MODE: Record<Currency, InstallmentMode> = { INR: "Razorpay", USD: "Stripe" };
export const EMI_MODE: Record<Currency, InstallmentMode> = { INR: "EMI_3P", USD: "Stripe EMI" };

export function formatAmount(amount: number, currency: Currency): string {
    return Math.round(amount).toLocaleString(currency === "INR" ? "en-IN" : "en-US");
}
export function formatMoney(amount: number, currency: Currency): string {
    return `${currency === "INR" ? "₹" : "$"}${formatAmount(amount, currency)}`;
}

/** Percent-of-course-fee tiers round to a clean unit (nearest ₹100 / $10) rather than landing on
 * an odd number. */
export function tierAmount(courseFee: number, currency: Currency, pct: number): number {
    const roundTo = currency === "INR" ? 100 : 10;
    return Math.round((courseFee * pct) / 100 / roundTo) * roundTo;
}

/** Derived from the deal's actual installments rather than tracked separately — matches
 * whichever payment type most recently produced them. */
export function paymentTypeLabel(deal: Deal): "Upfront" | "Part Payment" | "EMI 3rd Party" {
    if (deal.installments.some((i) => i.isEmi)) return "EMI 3rd Party";
    return deal.installments.length > 1 ? "Part Payment" : "Upfront";
}

// ---------------------------------------------------------------------------
// Amount — the recurring "INR 12,345" pairing (muted currency code + bold value)
// ---------------------------------------------------------------------------

type AmountSize = "sm" | "md" | "lg" | "xl";
const AMOUNT_SIZE_CLASSES: Record<AmountSize, { code: string; value: string }> = {
    sm: { code: "text-xs opacity-60", value: "text-sm font-medium" },
    md: { code: "text-xs opacity-60", value: "text-md font-semibold" },
    lg: { code: "text-sm opacity-60", value: "text-lg font-semibold" },
    xl: { code: "text-md opacity-80", value: "text-display-xs font-semibold" },
};

const AMOUNT_TONE_CLASSES = { primary: "text-primary", tertiary: "text-tertiary", white: "text-white" };

export const AmountValue = ({
    currency,
    amount,
    size = "md",
    tone = "primary",
    className,
}: {
    currency: Currency;
    amount: number;
    size?: AmountSize;
    /** "tertiary" is the muted look used for un-emphasized rows (the discount breakdown list).
     * "white" is fixed-white regardless of theme — for the installment card, whose dark surface
     * never flips with the app theme, so its text can't use theme-aware tokens either. */
    tone?: "primary" | "tertiary" | "white";
    className?: string;
}) => {
    const s = AMOUNT_SIZE_CLASSES[size];
    return (
        <span className={cx("flex items-baseline gap-1", AMOUNT_TONE_CLASSES[tone], className)}>
            <span className={s.code}>{currency}</span>
            <span className={s.value}>{formatAmount(amount, currency)}</span>
        </span>
    );
};

const DottedRule = () => <div className="h-0 min-w-6 flex-1 border-b border-dashed border-tertiary" />;

// ---------------------------------------------------------------------------
// Fee Breakdown — Course Fees / Total Discount (expandable) / Net Payable
// ---------------------------------------------------------------------------

export const FeeBreakdown = ({
    currency,
    courseFee,
    discountBreakdown,
    netPayable,
    compact = false,
}: {
    currency: Currency;
    courseFee: number;
    discountBreakdown: DiscountBreakdown;
    netPayable: number;
    /** Plan Created uses smaller amounts/tighter rows than Plan Not Created / In Progress. */
    compact?: boolean;
}) => {
    const totalDiscount = discountBreakdown.upfront + discountBreakdown.items.reduce((sum, i) => sum + i.amount, 0);
    // Starts collapsed whenever there's nothing to show (no discount applied yet — Plan Not
    // Created is always this) — once the BDR manually toggles it, that choice sticks regardless
    // of how the total changes afterward.
    const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
    const expanded = manualExpanded ?? (!compact && totalDiscount > 0);

    const rowPad = compact ? "py-2" : "py-3";
    const topSize: AmountSize = compact ? "md" : "lg";
    const topLabelClass = compact ? "text-sm font-normal text-primary" : "text-md font-semibold text-primary";

    return (
        <div className="flex w-full flex-col items-start px-2">
            <div className={cx("flex w-full items-center gap-6", rowPad, "px-2")}>
                <span className={cx("w-44 shrink-0", topLabelClass)}>Course Fees (A)</span>
                <DottedRule />
                <AmountValue currency={currency} amount={courseFee} size={topSize} />
            </div>

            <div className="flex w-full flex-col items-start">
                <div className={cx("flex w-full items-center gap-6", rowPad, "px-2")}>
                    <button
                        type="button"
                        onClick={() => setManualExpanded(!expanded)}
                        className="flex shrink-0 items-center gap-2 text-sm font-semibold text-placeholder"
                    >
                        Total Discount (B)
                        <ChevronDown className={cx("size-5 text-fg-quaternary transition-transform duration-150", expanded && "rotate-180")} />
                    </button>
                    <DottedRule />
                    <AmountValue currency={currency} amount={totalDiscount} size="md" />
                </div>

                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="w-full overflow-hidden"
                        >
                            <div className="flex w-full gap-2 pb-4 pl-4">
                                <div className="w-px shrink-0 self-stretch bg-secondary" />
                                <div className="flex min-w-0 flex-1 flex-col">
                                    {discountBreakdown.upfront > 0 && (
                                        <DiscountBreakdownRow label="Upfront Discount" amount={discountBreakdown.upfront} currency={currency} />
                                    )}
                                    {discountBreakdown.items.map((item, i) => (
                                        <DiscountBreakdownRow key={i} label={item.label} amount={item.amount} currency={currency} />
                                    ))}
                                    {totalDiscount === 0 && <p className="px-2 py-1 text-sm text-tertiary italic">No discount applied.</p>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={cx("flex w-full items-center gap-6 border-t border-primary px-2 py-4")}>
                <span className={cx("w-44 shrink-0", compact ? "text-sm font-semibold text-primary" : "text-md font-semibold text-primary")}>
                    Net Payable Fee (A-B)
                </span>
                <DottedRule />
                <AmountValue currency={currency} amount={netPayable} size={topSize} />
            </div>
        </div>
    );
};

const DiscountBreakdownRow = ({ label, amount, currency }: { label: string; amount: number; currency: Currency }) => (
    <div className="flex items-center gap-6 px-2 py-1">
        <span className="w-44 shrink-0 text-base text-placeholder">{label}</span>
        <DottedRule />
        <AmountValue currency={currency} amount={amount} size="sm" tone="tertiary" />
    </div>
);

// ---------------------------------------------------------------------------
// Installment preview card — the gradient "due/upcoming" card used everywhere
// installments are listed (In Progress preview + Plan Created read view).
// ---------------------------------------------------------------------------

/** Literal (not semantic) colors — this card's surface is always dark regardless of the app
 * theme (matches Figma exactly), so its text can't use theme-flipping tokens tuned for a
 * light-mode background or they'd go dark-on-dark. */
const STATUS_STYLES: Record<"due" | "upcoming" | "paid" | "overdue", { dot: string; label: string; text: string }> = {
    due: { dot: "bg-yellow-500", label: "Due", text: "text-yellow-500" },
    upcoming: { dot: "bg-neutral-400", label: "Upcoming Later", text: "text-neutral-400" },
    paid: { dot: "bg-green-400", label: "Paid", text: "text-green-400" },
    overdue: { dot: "bg-red-400", label: "Overdue", text: "text-red-400" },
};

function installmentCardStatus(installment: Installment, isNext: boolean): "due" | "upcoming" | "paid" | "overdue" {
    if (installment.status === "Paid") return "paid";
    if (installment.status === "Overdue") return "overdue";
    return isNext ? "due" : "upcoming";
}

/** Gradient wash behind the amount/date content — amber for the row that's next up (the one
 * carrying "Due"), neutral gray for everything else. Matches Figma's per-card tint exactly. */
const CARD_TINT: Record<"due" | "upcoming" | "paid" | "overdue", string> = {
    due: "from-[rgba(23,23,23,0.6)] to-[rgba(202,138,4,0.6)]",
    upcoming: "from-[rgba(23,23,23,0.6)] to-[rgba(64,64,64,0.6)]",
    paid: "from-[rgba(23,23,23,0.6)] to-[rgba(22,101,52,0.6)]",
    overdue: "from-[rgba(23,23,23,0.6)] to-[rgba(153,27,27,0.6)]",
};

/** The header logo swaps with the chosen payment mode — Razorpay/Stripe wordmarks for the
 * gateways, a bank icon + label for Manual Bank Transfer. Nothing renders for the 3rd-party EMI
 * modes since that financier's branding isn't this app's to show. */
const ModeMark = ({ mode }: { mode: InstallmentMode }) => {
    if (mode === "Razorpay") return <img src={razorpayWordmark} alt="Razorpay" className="h-4 w-auto" />;
    if (mode === "Stripe") return <img src={stripeModeIcon} alt="Stripe" className="h-4 w-auto" />;
    if (mode === "Manual") {
        return (
            <span className="flex items-center gap-1.5">
                <img src={bankIcon} alt="" className="size-4" />
                <span className="text-xs font-medium text-white/70">Manual Transfer</span>
            </span>
        );
    }
    return null;
};

export const InstallmentPreviewCard = ({ installment, currency, isNext }: { installment: Installment; currency: Currency; isNext: boolean }) => {
    const status = installmentCardStatus(installment, isNext);
    const dueDate = new Date(`${installment.deadline}T00:00:00`);
    const lastDate = new Date(dueDate.getTime() + 4 * 86_400_000);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="flex h-40 flex-col overflow-hidden rounded-2xl bg-primary-solid shadow-lg">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <span className="font-mono text-xs text-white/80">
                    {installment.label}
                    {installment.isEmi ? " · EMI" : ""}
                </span>
                <ModeMark mode={installment.mode} />
            </div>
            <div className={cx("flex flex-1 flex-col justify-between rounded-2xl bg-gradient-to-b px-4 pt-4 pb-6", CARD_TINT[status])}>
                <div className="flex items-center justify-between">
                    <AmountValue currency={currency} amount={installment.amount} size="xl" tone="white" />
                    <span className="flex items-center gap-1">
                        <span className={cx("size-1.5 rounded-full", STATUS_STYLES[status].dot)} />
                        <span className={cx("text-[10px] font-medium", STATUS_STYLES[status].text)}>{STATUS_STYLES[status].label}</span>
                    </span>
                </div>
                <div className="flex items-start justify-between pt-2">
                    <div className="flex flex-1 flex-col">
                        <span className="font-mono text-xs text-white/50">Due On</span>
                        <span className="text-sm font-semibold text-white/90">{fmt(dueDate)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-white/50">Last Date</span>
                        <span className="text-sm font-semibold text-white/90">{fmt(lastDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
