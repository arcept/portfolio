import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowNarrowRight, ArrowUpRight, Copy01, Download01, Edit01, TrendUp02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { usePersona } from "@/providers/role-provider";
import type { PeriodSelection } from "@/data/dashboard-data";
import { cascadeToDealStages, formatIndianNumber, getPeriodSelectionKey, getSelectedPeriodChartData, scalePeriodDataForPersona } from "@/data/dashboard-data";
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

const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
    <div className={cx("relative flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-4 shadow-xs", className)}>{children}</div>
);

const HeadingAndNumber = ({ heading, value }: { heading: string; value: string }) => (
    <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-tertiary">{heading}</p>
        <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-medium text-primary">INR</span>
            <span className="text-xl font-semibold tracking-tight text-primary">{value}</span>
        </div>
    </div>
);

const fadeTransition = { duration: 0.25, ease: "easeOut" as const };

/** Wraps a card's contents in the same crossfade used everywhere else a card follows the
 * period selection, so switching periods always reads as "refreshed", not a hard cut. */
const FadeOnSelection = ({ selectionKey, className, children }: { selectionKey: string; className?: string; children: ReactNode }) => (
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

export const StatCardsRow = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const booked = scalePeriodDataForPersona(getSelectedPeriodChartData(selection), persona);
    const selectionKey = getPeriodSelectionKey(selection);
    const dealStages = cascadeToDealStages(booked.cascade);
    const dealStagesMax = Math.max(...dealStages.map((stage) => stage.value));

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr] 2xl:grid-cols-[1.4fr_1fr_1fr]">
            {/* Booked - selected period */}
            <Card className="row-span-2 min-h-104">
                <div className="absolute top-4 right-4">
                    <CardActionsMenu />
                </div>

                <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                    <p className="max-w-[calc(100%-2rem)] text-xs font-medium text-tertiary">{booked.headingLabel}</p>

                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-medium text-primary">INR</span>
                        <span className="text-display-sm font-semibold tracking-tight text-primary">{formatIndianNumber(booked.bookedTotal)}</span>
                    </div>

                    <div className="flex w-max items-center gap-1 rounded-md bg-primary_alt px-1.5 py-0.5 shadow-xs">
                        <ArrowUpRight className="size-3 text-fg-success-secondary" />
                        <span className="text-sm font-medium text-secondary">{booked.changeText}</span>
                    </div>
                </FadeOnSelection>

                <div className="min-h-0 flex-1">
                    <BookedChart data={booked} selectionKey={selectionKey} />
                </div>
            </Card>

            {/* Realised of previously booked + Total Realised — now follows the period pill too:
                "previously booked" is the backlog-ledger draw, "Total Realised" is that plus the
                period's own bookings realised (booked.totalRealised), so the two always sum. */}
            <Card>
                <div className="absolute top-4 right-4">
                    <CardActionsMenu />
                </div>
                <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                    <HeadingAndNumber heading="Realised of Previously Booked" value={formatIndianNumber(booked.realisedOfPreviouslyBooked)} />
                    <HeadingAndNumber heading={`Total Realised - ${booked.periodLabel}`} value={formatIndianNumber(booked.totalRealised)} />
                </FadeOnSelection>
            </Card>

            {/* Average Ticket Size + Unit Sales / Target — also follows the period pill. */}
            <Card>
                <div className="absolute top-4 right-4">
                    <CardActionsMenu />
                </div>
                <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-4">
                    <HeadingAndNumber heading="Average Ticket Size" value={formatIndianNumber(booked.ats)} />
                    <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-medium text-tertiary">Unit Sales / Target</p>
                        <span className="text-xl font-semibold text-primary">
                            {booked.unitsAchieved} / {booked.unitTarget}
                        </span>
                    </div>
                </FadeOnSelection>
            </Card>

            {/* Deal Stages — follows the period pill via the same cascade the Booked card reads. */}
            <Card>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-tertiary">Deal Stages</p>
                    <ButtonUtility size="sm" color="tertiary" tooltip="View trend" icon={TrendUp02} />
                </div>

                <FadeOnSelection selectionKey={selectionKey} className="flex flex-col gap-3">
                    {dealStages.map((stage) => (
                        <div key={stage.label} className="flex items-center gap-3">
                            <span className="w-27.5 shrink-0 text-xs text-secondary">{stage.label}</span>
                            <ProgressBarBase value={stage.value} max={dealStagesMax} className="bg-quaternary" progressClassName={stage.colorClassName} />
                            <span className="w-4 shrink-0 text-right font-mono text-[13px] text-secondary">{stage.value}</span>
                        </div>
                    ))}
                </FadeOnSelection>
            </Card>

            {/* Lost deals */}
            <Card>
                <p className="text-xs font-medium text-tertiary">Lost deals</p>
                <span className="text-display-md font-normal tracking-tight text-primary">4%</span>
                <p className="text-sm text-secondary">You closed 12 out of 124 deals</p>
                <Button color="link-color" size="sm" iconTrailing={ArrowNarrowRight}>
                    All deals
                </Button>
            </Card>
        </div>
    );
};
