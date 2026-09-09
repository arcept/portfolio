import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Copy01, Download01, Edit01, TrendUp02 } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import type { PeriodSelection } from "@/data/dashboard-data";
import { formatIndianCompact, formatIndianNumber, getPeriodSelectionKey } from "@/data/dashboard-data";
import { changeDirectionFromText, getDealStageBars, getPeriodChartDataLive } from "@/data/dashboard-metrics";
import { BookedChart } from "./booked-chart";

const CardActionsMenu = () => (
    <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover className="w-min">
            <Dropdown.Menu>
                <Dropdown.Item icon={Edit01}>
                    <span className="pr-4">Edit widget</span>
                </Dropdown.Item>
                <Dropdown.Item icon={Download01}>
                    <span className="pr-4">Export</span>
                </Dropdown.Item>
                <Dropdown.Item icon={Copy01}>
                    <span className="pr-4">Copy link</span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown.Root>
);

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
    <div className={cx("relative flex flex-col gap-4 rounded-xl border border-secondary bg-primary px-8 py-6 shadow-xs", className)}>{children}</div>
);

const HeadingAndNumber = ({ heading, value }: { heading: string; value: string }) => (
    <div className="flex flex-col gap-1">
        <p className="text-md font-normal text-secondary">{heading}</p>
        <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-medium text-tertiary">INR</span>
            <span className="font-mono text-xl font-semibold tracking-tight text-primary">{value}</span>
        </div>
    </div>
);

const fadeTransition = { duration: 0.25, ease: "easeOut" as const };

/** Wraps a card's contents in the same crossfade used everywhere else a card follows the
 * period selection, so switching periods always reads as "refreshed", not a hard cut. */
export const FadeOnSelection = ({ selectionKey, className, children }: { selectionKey: string; className?: string; children: ReactNode }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={selectionKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={fadeTransition}
            className={className}
        >
            {children}
        </motion.div>
    </AnimatePresence>
);

/** Row 1, left card — Booked Revenue + its own realised-of-this-period line. Sits beside
 * `SalesFunnelSection` in the page's top grid row (Figma Container 118:28881). */
export const BookedRevenueCard = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const booked = getPeriodChartDataLive(selection, persona, deals);
    const selectionKey = getPeriodSelectionKey(selection);
    const changeDirection = changeDirectionFromText(booked.changeText);

    return (
        <Card className="min-h-104 min-w-0">
            <div className="absolute top-6 right-8">
                <CardActionsMenu />
            </div>

            <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-secondary">Booked Revenue</p>
                    <Badge color="gray" type="color" size="sm">
                        {booked.badgeLabel}
                    </Badge>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-medium text-primary">INR</span>
                        <span className="font-mono text-display-sm font-semibold tracking-tight text-primary">{formatIndianNumber(booked.bookedTotal)}</span>
                        <span className="ml-1 flex items-center gap-0.5">
                            {changeDirection === "up" && <ArrowUpRight className="size-3.5 text-fg-success-secondary" />}
                            {changeDirection === "down" && <ArrowDownRight className="size-3.5 text-fg-error-secondary" />}
                            <span className="font-mono text-sm font-medium text-secondary">{booked.changeText}</span>
                        </span>
                    </div>

                    <p className="text-md text-tertiary">
                        Out of which <span className="font-mono">{formatIndianCompact(booked.realisedTotal)}</span> is realised (
                        <span className="font-mono">{booked.realisedPercent.toFixed(2)}%</span>)
                    </p>
                </div>
            </FadeOnSelection>

            <div className="min-h-0 flex-1">
                <BookedChart data={booked} selectionKey={selectionKey} />
            </div>
        </Card>
    );
};

/** Row 2, left column — the two short stacked mini-cards (Figma Frame 1000012501), rendered as
 * one flex column so they behave as a single grid item next to the taller Conversion/Deal Stages
 * cards. */
export const RealisedAndTicketCards = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const booked = getPeriodChartDataLive(selection, persona, deals);
    const selectionKey = getPeriodSelectionKey(selection);

    return (
        <div className="flex h-full min-w-0 flex-col gap-4">
            {/* Realised of previously booked + Total Realised — "previously booked" is the
                backlog-ledger draw, "Total Realised" is that plus the period's own bookings
                realised (booked.totalRealised), so the two always sum. `flex-1` on both cards
                (rather than a fixed height) so the pair always fills the row's full height to
                match Conversion/Deal Stages beside them, whatever that height ends up being. */}
            <Card className="flex-1">
                <div className="absolute top-6 right-8">
                    <CardActionsMenu />
                </div>
                <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                    <HeadingAndNumber heading="Realised of Previously Booked" value={formatIndianNumber(booked.realisedOfPreviouslyBooked)} />
                    <HeadingAndNumber heading={`Total Realised - ${booked.periodLabel}`} value={formatIndianNumber(booked.totalRealised)} />
                </FadeOnSelection>
            </Card>

            <Card className="flex-1">
                <div className="absolute top-6 right-8">
                    <CardActionsMenu />
                </div>
                <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                    <HeadingAndNumber heading="Average Ticket Size" value={formatIndianNumber(booked.ats)} />
                    <div className="flex flex-col gap-1">
                        <p className="text-md font-normal text-secondary">Unit Sales / Target</p>
                        <span className="font-mono text-xl font-semibold text-primary">
                            {booked.unitsAchieved} / {booked.unitTarget}
                        </span>
                    </div>
                </FadeOnSelection>
            </Card>
        </div>
    );
};

/** One pill-in-track bar of the Deal Stages chart (Figma node 548:15755) — bottom-anchored fill,
 * proportional to `value/max` with a small floor so a near-zero stage still reads as a sliver
 * rather than vanishing, matching the precedent in `sales-funnel-ribbon.tsx`. The two "loss"
 * buckets (Payment Plan Pending, Rejected) get a fixed diagonal-hatch treatment per the Figma
 * spec — a style choice on those two positions, not a data-driven flag. */
const DEAL_STAGE_MIN_FILL_FRACTION = 0.08;

/** `colorClassName` is always a `bg-<token>` utility (see `cascadeToDealStages`) — deriving the
 * matching `--color-<token>` custom property from it lets the hatch stripes reuse the exact same
 * hue as the solid fill, without hardcoding a second color per hatched stage. */
const cssVarFromBgClass = (bgClassName: string) => `var(${bgClassName.replace(/^bg-/, "--color-")})`;

const DealStageBarColumn = ({
    label,
    value,
    colorClassName,
    hatched,
    gradient,
    attentionValue,
    attentionLabel,
    max,
}: {
    label: string;
    value: number;
    colorClassName: string;
    hatched?: boolean;
    gradient?: boolean;
    attentionValue?: number;
    attentionLabel?: string;
    max: number;
}) => {
    const fraction = max === 0 ? 0 : Math.max(value === 0 ? 0 : DEAL_STAGE_MIN_FILL_FRACTION, value / max);
    const hue = cssVarFromBgClass(colorClassName);
    // At least a third of the bar's own height, so the attention count stays legible even when
    // it's a small slice of a small bar — capped at the bar's full height.
    const attentionFraction = attentionValue && value > 0 ? Math.min(1, Math.max(1 / 3, attentionValue / value)) : 0;

    return (
        <Tooltip
            title={attentionValue ? `${label}: ${value} (${attentionValue} ${attentionLabel ?? "need attention"})` : `${label}: ${value}`}
            placement="top"
        >
            <TooltipTrigger className="flex h-full w-12 shrink-0 flex-col items-center justify-center gap-2">
                <div className="flex h-full w-full flex-1 items-end justify-center rounded-[40px] bg-quaternary">
                    <div
                        className={cx("relative flex w-full items-start justify-center overflow-hidden rounded-full p-1", !hatched && !gradient && colorClassName)}
                        style={{
                            height: `${Math.round(fraction * 100)}%`,
                            minHeight: value > 0 ? 64 : undefined,
                            ...(gradient && { background: `linear-gradient(to top, var(--color-fg-success-secondary), var(--color-fg-success-primary))` }),
                            ...(hatched && {
                                backgroundColor: `color-mix(in srgb, ${hue} 30%, transparent)`,
                                backgroundImage: `repeating-linear-gradient(45deg, ${hue} 0, ${hue} 2px, transparent 2px, transparent 6px)`,
                            }),
                        }}
                    >
                        {!!attentionValue && (
                            <div
                                className="flex w-full items-center justify-center rounded-full"
                                style={{
                                    height: `${Math.round(attentionFraction * 100)}%`,
                                    minHeight: 40,
                                    minWidth: 40,
                                    backgroundColor: `color-mix(in srgb, ${hue} 55%, black)`,
                                }}
                            >
                                <span className="font-mono text-sm font-semibold text-white">{attentionValue}</span>
                            </div>
                        )}
                    </div>
                </div>
                <span className="font-mono text-xs font-medium text-secondary">{String(value).padStart(2, "0")}</span>
            </TooltipTrigger>
        </Tooltip>
    );
};

/** Row 2, right column — the redesigned 8-bar Deal Stages chart (Figma node 548:15755),
 * replacing the old horizontal `ProgressBarBase` list. Reads the same shared cascade as the
 * Booked card so the two never drift apart for a given period. */
export const DealStagesCard = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const selectionKey = getPeriodSelectionKey(selection);
    const dealStages = getDealStageBars(selection, persona, deals);
    const dealStagesMax = Math.max(...dealStages.map((stage) => stage.value));

    return (
        <Card className="h-full min-w-0">
            <div className="flex items-center justify-between">
                <p className="text-md font-normal text-secondary">Deal Stages</p>
                <ButtonUtility size="sm" color="tertiary" tooltip="View trend" icon={TrendUp02} />
            </div>

            <div className="min-w-0 flex-1 overflow-x-auto">
                <FadeOnSelection selectionKey={selectionKey} className="flex h-full items-stretch gap-3">
                    {dealStages.map((stage) => (
                        <DealStageBarColumn key={stage.label} max={dealStagesMax} {...stage} />
                    ))}
                </FadeOnSelection>
            </div>
        </Card>
    );
};
