import type { FC, MouseEvent } from "react";
import { ArrowDown, ArrowUp, Bank, Certificate01, ChevronDown, LetterSpacing01 } from "@untitledui/icons";
import { motion } from "motion/react";
import { Avatar } from "@/components/base/avatar/avatar";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
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

/** Pending Actions (Figma node 626:17776's collapsed-state column) — deals whose next step is
 * BDR/TM-owned, not the learner's; see `getTeamManagerFunnelCardData` for the exact per-category
 * status sets. Always visible (both collapsed and expanded), unlike the full panels below. */
const PendingActionsList = ({ pendingActions }: { pendingActions: TeamManagerFunnelCardData["pendingActions"] }) => (
    <div className="flex flex-col gap-4 px-2">
        <div className="flex items-center gap-2">
            <div className="size-3 shrink-0 rounded-[4px] bg-fg-warning-secondary" />
            <p className="text-md whitespace-nowrap text-secondary">Pending Actions</p>
        </div>
        <div className="flex flex-col gap-2">
            {[
                { label: "Applications", count: pendingActions.applications },
                { label: "Offers", count: pendingActions.offers },
                { label: "Payment", count: pendingActions.payment },
            ].map((item) => (
                <div key={item.label} className="flex h-6 items-center rounded-full bg-secondary_hover">
                    <div className="flex h-full items-center gap-3 rounded-full bg-quaternary py-1 pr-2 pl-3">
                        <span className="text-xs font-medium whitespace-nowrap text-primary">{item.label}</span>
                        <span className="text-md font-semibold whitespace-nowrap text-primary">{String(item.count).padStart(2, "0")}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// green = booked & on track; amber = needs the BDR's attention; blue = pending from the learner's
// own side (same blue as the "Application Pending"/"Offer Pending" breakdown dots, `dot.info` in
// dashboard-metrics.ts — not the brand/purple foreground token used here before, Manik's call,
// 2026-09-11); lightGray = saved for later; darkGray = not interested; red = rejected/cancelled.
// See `DEAL_HEALTH_COLOR` in dashboard-metrics.ts for the full per-status mapping this consumes.
const HEALTH_COLOR_CLASS: Record<DealHealthColor, string> = {
    green: "bg-fg-success-primary",
    amber: "bg-fg-warning-secondary",
    blue: "bg-utility-blue-500",
    lightGray: "bg-fg-quaternary",
    darkGray: "bg-fg-tertiary",
    red: "bg-fg-error-primary",
};

/** One 12px square per cohort deal (see `getTeamManagerFunnelCardData`'s `dealsHealth`, already
 * sorted healthiest-first) — a fixed 10-column grid, height following the deal count rather than
 * a hardcoded 6 rows, so it never clips a Team Manager with an unusually large/small cohort.
 * Grayscale while the card is collapsed, full color once expanded (Figma node 626:17776 renders
 * an explicit grayscale "Filter" overlay only in its `Default` state) — tied to this card's own
 * expand state, not mouse hover (superseding the hover-reveal this had before this state was
 * added, Manik's call, 2026-09-11). */
const DealsHealthGrid = ({ colors, isExpanded }: { colors: DealHealthColor[]; isExpanded: boolean }) => (
    <div
        className={cx("grid gap-1 transition-[filter] duration-300 ease-out", !isExpanded && "grayscale")}
        style={{ gridTemplateColumns: "repeat(10, 12px)" }}
    >
        {colors.map((color, i) => (
            <div key={i} className={cx("size-3 rounded-[4px]", HEALTH_COLOR_CLASS[color])} />
        ))}
    </div>
);

const StatBlock = ({ label, amount, changePct }: { label: string; amount: number; changePct: number | null }) => (
    <div className="flex flex-col gap-2">
        <p className="text-sm font-medium whitespace-nowrap text-secondary opacity-80">{label}</p>
        <div className="flex items-center gap-2">
            <span className="font-mono text-[20px] font-semibold whitespace-nowrap text-primary">₹ {formatIndianNumber(amount)}</span>
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

/** Saved/Not-Interested/Rejected as individual circles, each only shown when its own count is
 * above zero — a panel with no fallout at all renders none of them, and a panel where only one
 * of the three occurred shows just that one. Opacity is assigned per label before filtering, so
 * "Saved" always reads at the same visual weight regardless of which of its siblings are also
 * nonzero this period, rather than shifting with whatever ends up adjacent to it. */
const falloutItems = (fallout: FunnelPanelData["fallout"]) =>
    [
        { label: "Saved", count: fallout.saved, opacityClass: FALLOUT_OPACITY[0] },
        { label: "Not Interested", count: fallout.notInterested, opacityClass: FALLOUT_OPACITY[1] },
        { label: "Rejected", count: fallout.rejected, opacityClass: FALLOUT_OPACITY[2] },
    ].filter((f) => f.count > 0);

const FunnelPanel = ({ icon: Icon, label, data }: { icon: FC<{ className?: string }>; label: string; data: FunnelPanelData }) => {
    const fallout = falloutItems(data.fallout);

    return (
        <div className="flex flex-1 flex-col gap-3 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <p className="text-md whitespace-nowrap text-secondary opacity-80">{label}</p>
                    <p className="text-2xl font-medium text-primary">{data.count}</p>
                </div>
                <Icon className="size-6 text-fg-quaternary" />
            </div>

            <ul className="flex flex-col gap-1">
                {data.breakdown.map((item) => (
                    <li
                        key={item.label}
                        className={cx(
                            "flex h-5 items-center justify-between gap-2 text-sm whitespace-nowrap",
                            // Figma indents "Due"/"Overdue" under "Ongoing" in the Payment panel
                            // specifically, reading as a nested breakdown of it — the only panel
                            // with those exact labels, so matching by label is enough without
                            // threading a per-panel flag through `FunnelPanelData`.
                            (item.label === "Due" || item.label === "Overdue") && "pl-2",
                        )}
                    >
                        <span className="flex items-center gap-1 text-tertiary">
                            {/* 4px — not the shared `Dot` component, whose smallest size is 8px */}
                            <span className={cx("size-1 shrink-0 rounded-full bg-current", item.dotClassName)} />
                            {item.label}
                        </span>
                        <span className="text-tertiary">{String(item.count).padStart(2, "0")}</span>
                    </li>
                ))}
            </ul>

            {fallout.length > 0 && (
                // Figma layers a group-level `opacity-60` on top of each circle's own background
                // alpha (50/30/20%) — the combined effect (≈30/18/12%) is a lot fainter than just
                // the per-circle alpha alone, and dims the numbers inside too, not just the fill.
                <div className="flex gap-2 opacity-60">
                    {fallout.map((f) => (
                        <Tooltip key={f.label} title={f.label} delay={150}>
                            {/* Real focusable buttons nested inside the now click-anywhere-toggles
                                card — stop the click from also bubbling up and collapsing it. */}
                            <TooltipTrigger onClick={(e: MouseEvent) => e.stopPropagation()}>
                                <div
                                    className={cx(
                                        "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium text-primary",
                                        f.opacityClass,
                                    )}
                                >
                                    {String(f.count).padStart(2, "0")}
                                </div>
                            </TooltipTrigger>
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};

/** Three fixed gradients lifted verbatim from the Figma export's Top Performers avatars — purely
 * decorative per-slot color, no semantic token equivalent, so kept as literal values rather than
 * forced into the design system's palette. */
const AVATAR_GRADIENT_CLASS = ["bg-gradient-to-br from-[#f49062] to-[#fd371f]", "bg-gradient-to-t from-[#009efd] to-[#2af598]", "bg-gradient-to-l from-[#6a11cb] to-[#2575fc]"];

const initialsFromName = (name: string) => {
    const [first, second] = name.trim().split(/\s+/);
    return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
};

const TopPerformer = ({ performer, gradientIndex }: { performer: TeamManagerFunnelCardData["topPerformers"][number]; gradientIndex: number }) => (
    <div className="group flex items-start gap-2 opacity-70 transition-opacity duration-300 ease-out hover:opacity-100">
        <Avatar
            size="sm"
            border
            // Not the `initials` prop — Avatar hardcodes its initials span to `text-quaternary`
            // (mid-gray) with no way to override just that color, which reads poorly against a
            // vivid gradient. `placeholder` renders in the same slot with full control instead.
            placeholder={<span className="text-sm font-semibold text-white">{initialsFromName(performer.name)}</span>}
            // `group-hover`, not `hover`, on the avatar itself — hovering anywhere on this
            // performer's row (name, revenue, units too) reveals the gradient, not just the
            // avatar circle.
            className="grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
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

/** Row 1's compact Unit Sales/Target (Figma node 626:17776) — percentage is the hero figure here
 * (achieved/target is the secondary one), the opposite emphasis of a plain stat readout, since
 * this row exists in both the collapsed and expanded states and needs to read at a glance. */
const UnitSalesTargetCompact = ({ data }: { data: TeamManagerFunnelCardData }) => (
    <div className="flex flex-col gap-5 px-2">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="size-3 shrink-0 rounded-[4px] bg-fg-success-primary" />
                <p className="text-md whitespace-nowrap text-secondary">Unit Sales/Target</p>
            </div>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
                {data.unitTargetAttainmentPct !== null && (
                    <span className={cx("text-2xl font-medium", unitTargetAttainmentTone(data.unitTargetAttainmentPct))}>
                        {Math.round(data.unitTargetAttainmentPct)}%
                    </span>
                )}
                <div className="flex items-center font-normal text-[16px] text-primary">
                    <p>{data.unitsAchieved}</p>
                    <p className="opacity-40">/{data.unitTarget}</p>
                </div>
            </div>
        </div>
        <UnitTargetSegmentBar attainmentPct={data.unitTargetAttainmentPct} />
    </div>
);

/** The Admin Funnel's per-Team-Manager card (Figma node 626:17776, states `Default`/`Variant2`)
 * — sits in place of the generic 4-card `FunnelStageCard` grid for each Team Manager row under
 * the admin persona. Row 1 (Deals Health, Pending Actions, Unit Sales/Target) and the
 * Booked/Realised/Avg Ticket Size stats are always visible — the latter moved out of the
 * expanded-only section per Manik's ask, 2026-09-11, deliberately departing from the Figma
 * frame's own Default state, which only showed it in `Variant2`. Only the three full funnel
 * panels and Top Performers stay gated behind `isExpanded`, animated in/out via height rather
 * than a hard show/hide. Exactly one card across the grid is expanded at a time — enforced by
 * the parent (`FunnelSection`), which owns `isExpanded`/`onToggleExpand` for every card. */
export const TeamManagerFunnelCard = ({
    data,
    isExpanded,
    onToggleExpand,
}: {
    data: TeamManagerFunnelCardData;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) => (
    <div
        onClick={onToggleExpand}
        // Not a `role="button"`/`tabIndex` target — the chevron below stays the fully keyboard-
        // accessible control (its own focus stop, activates on Enter/Space via its native
        // `<button>`); this is a mouse-only convenience so the whole card, not just the small
        // chevron, is clickable (Manik's ask, 2026-09-11). `hover:scale-[1.02]` is a plain CSS
        // transform, not a Framer one, so it can't fight the outer grid cell's own Framer-driven
        // `layout`/`animate` transforms in `FunnelSection` — and since `transform` never
        // participates in layout, it can't push siblings or resize the grid track either.
        className={cx(
            "flex h-full cursor-pointer flex-col gap-6 rounded-2xl border border-secondary bg-primary p-6 shadow-xs transition-[opacity,background-color,border-color,box-shadow,transform] duration-1000 delay-150 ease-in",
            isExpanded ? "opacity-100" : "opacity-80",
            // Hover effects only apply while collapsed — once expanded, the card is already the
            // "active"/full-attention one (full opacity, its own richer content), so the same
            // hover treatment stops applying here (Manik's ask, 2026-09-12). One shared timing for
            // every hover-transitioning property — opacity, background, border, shadow, and the
            // scale all move together on the same 1s/150ms-delay clock. `border-primary` is a
            // lighter gray than the base `border-secondary` in this dark theme (`neutral-700` vs.
            // `neutral-800`); `hover:bg-black/10`, not a semantic gray token like `bg-primary_hover`
            // — this app's whole dark-mode hover convention goes *lighter* on hover, which washed
            // out the contrast between this content-dense card and its own text.
            !isExpanded && "hover:scale-[1.02] hover:border-primary hover:bg-black/10 hover:opacity-100 hover:shadow-xl",
        )}
    >
        <div className="flex items-start justify-between gap-2">
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
            <ButtonUtility
                icon={ChevronDown}
                tooltip={isExpanded ? "Collapse" : "Expand"}
                // The whole card is now also a click target (see the root `onClick` above) — without
                // `stopPropagation` here, clicking the chevron itself would fire both this and the
                // card's own handler, toggling twice (net no-op, or worse, a visible double-flicker).
                onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    onToggleExpand();
                }}
                // `!ring-0` overrides `ButtonUtility`'s default `secondary` color, which otherwise
                // draws its border as a `ring` (box-shadow), not a literal `border` utility —
                // `!important` since a plain `ring-0` has the same specificity as the base style's
                // `ring-1` and isn't guaranteed to win by source order alone.
                className={cx(
                    "shrink-0 !ring-0 transition-transform duration-300 ease-out",
                    isExpanded && "rotate-180",
                )}
            />
        </div>

        {/* Collapsed, this (Row 1 + the revenue stats) is the card's only content —
            `flex-1 justify-center` lets it settle in the vertical middle of whatever height the
            card ends up at (its own natural height on first paint, or a taller synced height once
            any card has been expanded — see `FunnelSection`), instead of hugging the top and
            leaving a dead gap below it. Expanded, it sits naturally above the content that
            follows, so neither wrapper applies. */}
        <div className={cx("flex flex-col gap-6", !isExpanded && "flex-1 justify-center")}>
            <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col gap-4 px-2">
                    <p className="text-md whitespace-nowrap text-secondary">Deals Health</p>
                    <DealsHealthGrid colors={data.dealsHealth} isExpanded={isExpanded} />
                </div>

                <PendingActionsList pendingActions={data.pendingActions} />

                <UnitSalesTargetCompact data={data} />
            </div>

            <div
                className={cx(
                    "flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors duration-300 ease-out",
                    isExpanded ? "bg-primary_alt" : "bg-primary_alt/40",
                )}
            >
                <StatBlock label="Booked" amount={data.booked.amount} changePct={data.booked.changePct} />
                <StatBlock label="Realised" amount={data.realised.amount} changePct={data.realised.changePct} />
                <StatBlock label="Avg Ticket Size" amount={data.avgTicketSize.amount} changePct={data.avgTicketSize.changePct} />
            </div>
        </div>

        {/* Not an `AnimatePresence` height:auto↔0 block anymore — this content's own height used
            to drive the *outer* grid cell's height too (via that cell being `auto`-sized to fit
            its content), so two independent height animations (this one, and the grid cell's own
            row-track sizing) were fighting for control of the same visible transition, particular
            -ly on collapse. The grid cell (`FunnelSection`) now owns the height transition
            entirely on its own, animating between two real known numbers via Framer's `animate`
            — this block just needs to appear/fade, not separately animate size (Manik's report,
            2026-09-11: a card visibly moving in two separate steps instead of one smooth motion). */}
        {isExpanded && (
            <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-6 pt-6"
            >
                <div className="flex flex-wrap gap-2">
                    <FunnelPanel icon={LetterSpacing01} label="Applications" data={data.applications} />
                    <FunnelPanel icon={Certificate01} label="Offers" data={data.offers} />
                    <FunnelPanel icon={Bank} label="Payment" data={data.payment} />
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
            </motion.div>
        )}
    </div>
);
