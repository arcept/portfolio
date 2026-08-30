import type { ReactNode } from "react";
import { ArrowNarrowRight, ArrowUpRight, Copy01, Download01, Edit01, TrendUp02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { dealStages, dealStagesMax } from "@/data/dashboard-data";
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

export const StatCardsRow = () => {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr] 2xl:grid-cols-[1.4fr_1fr_1fr]">
            {/* Booked - This Month */}
            <Card className="row-span-2 min-h-104">
                <div className="absolute top-4 right-4">
                    <CardActionsMenu />
                </div>

                <p className="max-w-[calc(100%-2rem)] text-xs font-medium text-tertiary">Booked - This Month (August)</p>

                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-medium text-primary">INR</span>
                    <span className="text-display-sm font-semibold tracking-tight text-primary">18,88,000</span>
                </div>

                <div className="flex w-max items-center gap-1 rounded-md bg-primary_alt px-1.5 py-0.5 shadow-xs">
                    <ArrowUpRight className="size-3 text-fg-success-secondary" />
                    <span className="text-sm font-medium text-secondary">Out of which ₹4.22 L is realised (22.35%)</span>
                </div>

                <div className="min-h-0 flex-1">
                    <BookedChart />
                </div>
            </Card>

            {/* Realised of Previous Month + Total Realised - This Month */}
            <Card>
                <div className="absolute top-4 right-4">
                    <CardActionsMenu />
                </div>
                <HeadingAndNumber heading="Realised of Previous Month" value="8,42,000" />
                <HeadingAndNumber heading="Total Realised - This Month" value="12,64,000" />
            </Card>

            {/* Average Ticket Size + Unit Sales / Target */}
            <Card>
                <div className="absolute top-4 right-4">
                    <CardActionsMenu />
                </div>
                <HeadingAndNumber heading="Average Ticket Size" value="1,78,000" />
                <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-tertiary">Unit Sales / Target</p>
                    <span className="text-xl font-semibold text-primary">31 / 148</span>
                </div>
            </Card>

            {/* Deal Stages */}
            <Card>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-tertiary">Deal Stages</p>
                    <ButtonUtility size="sm" color="tertiary" tooltip="View trend" icon={TrendUp02} />
                </div>

                <div className="flex flex-col gap-3">
                    {dealStages.map((stage) => (
                        <div key={stage.label} className="flex items-center gap-3">
                            <span className="w-27.5 shrink-0 text-xs text-secondary">{stage.label}</span>
                            <ProgressBarBase value={stage.value} max={dealStagesMax} className="bg-quaternary" progressClassName={stage.colorClassName} />
                            <span className="w-4 shrink-0 text-right font-mono text-[13px] text-secondary">{stage.value}</span>
                        </div>
                    ))}
                </div>
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
