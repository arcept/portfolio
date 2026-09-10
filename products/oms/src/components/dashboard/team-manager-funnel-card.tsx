import type { FC } from "react";
import { ArrowDown, ArrowUp, Bank, Certificate01, LetterSpacing01 } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Dot } from "@/components/foundations/dot-icon";
import type { DealHealthColor, FunnelPanelData, TeamManagerFunnelCardData } from "@/data/dashboard-data";
import { formatIndianNumber } from "@/data/dashboard-data";
import { cx } from "@/utils/cx";
import { unitTargetAttainmentTone } from "./sales-funnel-section";

const FunnelTag = ({ children }: { children: string }) => (
    <span className="shrink-0 rounded-md bg-primary-solid px-2 py-1 font-mono text-xs font-medium whitespace-nowrap text-white/80">{children}</span>
);

const UNIT_TARGET_SEGMENT_COUNT = 5;

/** Same red/orange/amber/green pace-against-goal bands as `unitTargetAttainmentTone`'s text
 * color, just as a `bg-*` class for the segment bar below. Returns literal class strings rather
 * than deriving one from `unitTargetAttainmentTone`'s output via `.replace()` — Tailwind's
 * compiler only generates CSS for class names it can find as literal text in the source, so a
 * runtime-constructed "bg-utility-orange-500" (never appearing verbatim anywhere) would compile
 * to a class with no matching rule and render invisible, which is exactly what happened here. */
const unitTargetAttainmentBarClass = (pct: number) => {
    if (pct < 20) return "bg-utility-red-500";
    if (pct < 40) return "bg-utility-orange-500";
    if (pct < 60) return "bg-utility-amber-500";
    return "bg-utility-green-500";
};

/** Unit Sales/Target's segment bar — each of the 5 segments is 20% of attainment, lit in the
 * same pace-against-goal color as the % badge beside it, unlit segments falling back to the
 * neutral progress-bar track color (`bg-quaternary`). Not a decorative fixed gradient — the lit
 * count and color both track real attainment (Manik's call, 2026-09-11). */
const UnitTargetSegmentBar = ({ attainmentPct }: { attainmentPct: number | null }) => {
    const litCount =
        attainmentPct === null ? 0 : Math.max(0, Math.min(UNIT_TARGET_SEGMENT_COUNT, Math.round((attainmentPct / 100) * UNIT_TARGET_SEGMENT_COUNT)));
    const litClass = attainmentPct === null ? "bg-quaternary" : unitTargetAttainmentBarClass(attainmentPct);

    return (
        <div className="flex gap-1">
            {Array.from({ length: UNIT_TARGET_SEGMENT_COUNT }, (_, i) => (
                <div key={i} className={cx("h-2 flex-1 rounded-full", i < litCount ? litClass : "bg-quaternary")} />
            ))}
        </div>
    );
};

const HEALTH_COLOR_CLASS: Record<DealHealthColor, string> = {
    green: "bg-fg-success-primary",
    amber: "bg-fg-warning-secondary",
    blue: "bg-fg-brand-secondary",
    gray: "bg-fg-quaternary",
    red: "bg-fg-error-primary",
};

/** One 12px square per cohort deal (see `getTeamManagerFunnelCardData`'s `dealsHealth`, already
 * sorted healthiest-first) — a fixed 10-column grid, height following the deal count rather than
 * a hardcoded 6 rows, so it never clips a Team Manager with an unusually large/small cohort.
 * Grayscale by default, full color on hover — keeps the color coding as a deliberate reveal
 * rather than a wall of color competing with the rest of the card at rest. */
const DealsHealthGrid = ({ colors }: { colors: DealHealthColor[] }) => (
    <div
        className="grid gap-1 grayscale transition-[filter] duration-300 ease-out hover:grayscale-0"
        style={{ gridTemplateColumns: "repeat(10, 12px)" }}
    >
        {colors.map((color, i) => (
            <div key={i} className={cx("size-3 rounded-[4px]", HEALTH_COLOR_CLASS[color])} />
        ))}
    </div>
);

const StatBlock = ({ label, amount, changePct }: { label: string; amount: number; changePct: number | null }) => (
    <div className="flex flex-col gap-2">
        <p className="text-sm font-medium whitespace-nowrap text-secondary">{label}</p>
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold whitespace-nowrap text-primary">₹ {formatIndianNumber(amount)}</span>
            {changePct !== null && (
                <span
                    className={cx(
                        "inline-flex items-center gap-0.5 text-xs font-medium whitespace-nowrap",
                        changePct >= 0 ? "text-fg-success-secondary" : "text-fg-error-secondary",
                    )}
                >
                    {changePct >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {Math.abs(changePct).toFixed(0)}%
                </span>
            )}
        </div>
    </div>
);

/** Opacity steps match the Figma frame's three fallout circles exactly — a fixed per-position
 * treatment, not something derived from the counts themselves. */
const FALLOUT_OPACITY = ["bg-fg-quaternary/50", "bg-fg-quaternary/30", "bg-fg-quaternary/20"];

const FunnelPanel = ({ icon: Icon, label, data }: { icon: FC<{ className?: string }>; label: string; data: FunnelPanelData }) => (
    <div className="flex flex-1 flex-col gap-3 rounded-xl px-6 py-4">
        <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
                <p className="text-md whitespace-nowrap text-secondary">{label}</p>
                <p className="text-2xl font-medium text-primary">{data.count}</p>
            </div>
            <Icon className="size-6 text-fg-quaternary" />
        </div>

        <ul className="flex flex-col gap-1">
            {data.breakdown.map((item) => (
                <li key={item.label} className="flex h-5 items-center justify-between gap-2 text-sm whitespace-nowrap">
                    <span className="flex items-center gap-1 text-tertiary">
                        <Dot size="sm" className={item.dotClassName} />
                        {item.label}
                    </span>
                    <span className="text-tertiary">{String(item.count).padStart(2, "0")}</span>
                </li>
            ))}
        </ul>

        <div className="flex gap-2">
            {[
                { label: "Saved", count: data.fallout.saved },
                { label: "Not Interested", count: data.fallout.notInterested },
                { label: "Rejected", count: data.fallout.rejected },
            ].map((f, i) => (
                <div
                    key={f.label}
                    title={f.label}
                    className={cx("flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium text-primary", FALLOUT_OPACITY[i])}
                >
                    {String(f.count).padStart(2, "0")}
                </div>
            ))}
        </div>
    </div>
);

/** Three fixed gradients lifted verbatim from the Figma export's Top Performers avatars — purely
 * decorative per-slot color, no semantic token equivalent, so kept as literal values rather than
 * forced into the design system's palette. */
const AVATAR_GRADIENT_CLASS = ["bg-gradient-to-br from-[#f49062] to-[#fd371f]", "bg-gradient-to-t from-[#009efd] to-[#2af598]", "bg-gradient-to-l from-[#6a11cb] to-[#2575fc]"];

const initialsFromName = (name: string) => {
    const [first, second] = name.trim().split(/\s+/);
    return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
};

const TopPerformer = ({ performer, gradientIndex }: { performer: TeamManagerFunnelCardData["topPerformers"][number]; gradientIndex: number }) => (
    <div className="flex items-start gap-2">
        <Avatar
            size="sm"
            border
            initials={initialsFromName(performer.name)}
            contentClassName={AVATAR_GRADIENT_CLASS[gradientIndex % AVATAR_GRADIENT_CLASS.length]}
        />
        <div className="flex flex-col pr-2 whitespace-nowrap">
            <p className="text-sm font-semibold text-primary">{performer.name}</p>
            <p className="text-xs text-tertiary">{performer.roleTag}</p>
        </div>
        <div className="flex flex-col whitespace-nowrap">
            <p className="text-sm font-semibold text-primary">₹{formatIndianNumber(performer.revenue)}</p>
            <p className="text-xs text-tertiary">{String(performer.units).padStart(2, "0")} Units</p>
        </div>
    </div>
);

/** The Admin Funnel's per-Team-Manager card (Figma node 609:10888, "Priya Nair") — sits in place
 * of the generic 4-card `FunnelStageCard` grid for each Team Manager row under the admin
 * persona. Data comes from `getTeamManagerFunnelCardData` (dashboard-metrics.ts), which already
 * condenses/merges the underlying funnel stages the way this card's three panels expect. */
export const TeamManagerFunnelCard = ({ data }: { data: TeamManagerFunnelCardData }) => (
    <div className="flex flex-col gap-6 rounded-2xl border border-secondary bg-primary p-6 shadow-xs">
        <div className="flex flex-col gap-1 px-2">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-primary">{data.name}</h3>
                <FunnelTag>Team Manager</FunnelTag>
                {data.cohortTags.map((tag) => (
                    <FunnelTag key={tag}>{tag}</FunnelTag>
                ))}
            </div>
            <p className="min-w-full text-xs text-tertiary">Aggregate metrics across all cohorts. Overview & Performance</p>
        </div>

        <div className="flex flex-wrap items-stretch gap-6">
            <div className="flex flex-col justify-between gap-6 py-4">
                <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col gap-4 px-2">
                        <p className="text-md whitespace-nowrap text-secondary">Deals Health</p>
                        <DealsHealthGrid colors={data.dealsHealth} />
                    </div>

                    <div className="flex flex-col gap-5 px-2">
                        <div className="flex flex-col gap-2">
                            <p className="text-md whitespace-nowrap text-secondary">Unit Sales/Target</p>
                            <div className="flex items-baseline gap-2 whitespace-nowrap">
                                <div className="flex items-center font-mono text-[32px] text-primary">
                                    <p>{data.unitsAchieved}</p>
                                    <p className="opacity-40">/{data.unitTarget}</p>
                                </div>
                                {data.unitTargetAttainmentPct !== null && (
                                    <span className={cx("text-sm font-medium", unitTargetAttainmentTone(data.unitTargetAttainmentPct))}>
                                        {Math.round(data.unitTargetAttainmentPct)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <UnitTargetSegmentBar attainmentPct={data.unitTargetAttainmentPct} />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 px-2">
                    <StatBlock label="Booked" amount={data.booked.amount} changePct={data.booked.changePct} />
                    <StatBlock label="Realised" amount={data.realised.amount} changePct={data.realised.changePct} />
                    <StatBlock label="Avg Ticket Size" amount={data.avgTicketSize.amount} changePct={data.avgTicketSize.changePct} />
                </div>
            </div>

            <div className="hidden shrink-0 self-stretch border-l border-secondary lg:block" />

            <div className="flex flex-1 flex-wrap gap-3">
                <FunnelPanel icon={LetterSpacing01} label="Applications" data={data.applications} />
                <FunnelPanel icon={Certificate01} label="Offers" data={data.offers} />
                <FunnelPanel icon={Bank} label="Payment" data={data.payment} />
            </div>
        </div>

        {data.topPerformers.length > 0 && (
            <div className="flex flex-col gap-4 px-2">
                <p className="text-md whitespace-nowrap text-secondary">Top Performers</p>
                <div className="flex flex-wrap items-center gap-8">
                    {data.topPerformers.map((performer, i) => (
                        <div key={performer.id} className="flex items-center gap-8">
                            {i > 0 && <div className="h-6 shrink-0 border-l border-secondary" />}
                            <TopPerformer performer={performer} gradientIndex={i} />
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);
