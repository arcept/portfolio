import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Dot } from "@/components/foundations/dot-icon";
import type { FunnelStage, PeriodSelection } from "@/data/dashboard-data";
import { getPeriodSelectionKey, teamManagers } from "@/data/dashboard-data";
import { getFunnelCohortsLive, getTeamManagerFunnelCardData } from "@/data/dashboard-metrics";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { cx } from "@/utils/cx";
import { FadeOnSelection } from "./stat-cards";
import { TeamManagerFunnelCard } from "./team-manager-funnel-card";

export const FunnelStageCard = ({ stage }: { stage: FunnelStage }) => (
    <div className="flex flex-1 flex-col gap-5 rounded-xl border border-secondary bg-primary p-4">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary">{stage.label}</span>
            <Badge color="gray" type="modern" size="sm">
                {stage.fraction}
            </Badge>
        </div>

        <div className="flex items-baseline gap-1">
            <span className="text-display-xs font-semibold text-primary">{stage.value}</span>
            {stage.denominator !== undefined && <span className="text-lg font-medium text-tertiary">/ {stage.denominator}</span>}
        </div>
        {stage.caption && <p className="-mt-3 text-sm text-tertiary">{stage.caption}</p>}

        <ul className="flex flex-col gap-2">
            {stage.breakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-tertiary">
                        <Dot size="sm" className={item.dotClassName} />
                        {item.label}
                    </span>
                    <span className="font-mono text-[13px] text-secondary">{item.count}</span>
                </li>
            ))}
        </ul>
    </div>
);

export const OverviewPerformanceToggle = ({ id }: { id: string }) => {
    const [view, setView] = useState("overview");

    return (
        <ButtonGroup selectedKeys={[view]} onSelectionChange={(keys) => setView(Array.from(keys)[0] as string)} size="sm" aria-label={`${id} view`}>
            <ButtonGroupItem id="overview">Overview</ButtonGroupItem>
            <ButtonGroupItem id="performance">Performance</ButtonGroupItem>
        </ButtonGroup>
    );
};

// `type: "tween"` is load-bearing, not decoration — Framer Motion's `layout` animations default
// to spring physics unless told otherwise, and a spring naturally overshoots its target and
// settles back, regardless of the `duration`/`ease` values also passed here. That overshoot is
// what read as a card visibly moving past its target and bouncing back, and — since the whole
// grid's total height was overshooting too — as everything below the grid (the BDR drilldown
// section, plain reflow, no animation of its own) jostling along with it (Manik's report,
// 2026-09-11). A tween is a strict duration/ease interpolation with no overshoot.
const gridLayoutTransition = { type: "tween" as const, duration: 0.3, ease: "easeOut" as const };

// Matches the grid's own `gap-6`. Kept as one constant instead of two literals so the height math
// below and the actual gap can never quietly drift apart.
const GRID_GAP_PX = 24;

export const FunnelSection = ({ selection }: { selection: PeriodSelection }) => {
    const { persona } = usePersona();
    const { deals } = useDeals();
    const cohorts = getFunnelCohortsLive(selection, persona, deals);
    const isAggregateHeading = persona.role === "admin";
    const selectionKey = getPeriodSelectionKey(selection);
    // Exactly one Team Manager card can be expanded at a time (Figma node 626:24214's usage
    // frame) — owned here, one level above the cards themselves, so toggling one can collapse
    // whichever other one was open.
    const [expandedTmId, setExpandedTmId] = useState<string | null>(null);
    // The two collapsed siblings' height is pinned to exactly half the expanded card's real
    // rendered height (minus the gap between them) so the grid reads as a clean rectangle instead
    // of leaving dead space below the shorter siblings (Manik's ask, 2026-09-11) — can't be a
    // fixed number since content height varies per Team Manager (Top Performers count, fallout
    // rows, etc.), so it's measured live off the actually-expanded card via `ResizeObserver`, the
    // same pattern `sales-funnel-ribbon.tsx` already uses for its own responsive sizing.
    //
    // Deliberately *not* reset back to `null` when collapsing to nothing-expanded — the last real
    // measurement is kept and reused as every card's resting height too (see the `style` below),
    // which is the actual mechanism behind "default state should look the same as a collapsed
    // sibling's state" (Manik's ask, 2026-09-11): there's no separate "small" baseline height to
    // fall back to, every collapsed card always uses whatever was last genuinely measured. The one
    // gap this leaves is the very first paint before any card has ever been expanded, where
    // there's nothing to measure yet — cards render at their natural (shorter) content height
    // until then.
    const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
    const expandedCardRef = useRef<HTMLDivElement>(null);
    // Kept alongside the effect below specifically so `onToggleExpand` can disconnect it
    // synchronously — see the comment there for why that matters.
    const observerRef = useRef<ResizeObserver | null>(null);
    const settleTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        const el = expandedCardRef.current;
        if (!el) return;
        // Debounced, not applied on every callback — while the expanded card's own height is
        // mid-animation, this fires on basically every animation frame, and pushing a fresh
        // `expandedHeight` on each one kept restarting the siblings' animation before it could
        // finish, which read as jittery/jumpy rather than smooth (Manik's report, 2026-09-11).
        // Waiting for the size to settle for a beat means the siblings get exactly one clean
        // target height to animate toward, once, instead of a constantly moving one.
        const observer = new ResizeObserver(([entry]) => {
            clearTimeout(settleTimeoutRef.current);
            const height = entry.contentRect.height;
            settleTimeoutRef.current = setTimeout(() => setExpandedHeight(height), 80);
        });
        observer.observe(el);
        observerRef.current = observer;
        return () => {
            clearTimeout(settleTimeoutRef.current);
            observer.disconnect();
            observerRef.current = null;
        };
    }, [expandedTmId]);

    const collapsedHeight = expandedHeight !== null ? (expandedHeight - GRID_GAP_PX) / 2 : undefined;

    // Admin's own org-wide aggregate row (`cohorts[0]`) isn't rendered here anymore — the section
    // header below already covers "aggregate metrics across all cohorts" at a glance, and the old
    // generic 4-card grid it used was the one row that didn't get the redesigned card (Figma node
    // 609:10888 is explicitly per-Team-Manager), so it just read as a leftover (Manik's call,
    // 2026-09-11: drop it rather than keep it in its old style). Still available standalone via
    // `AdminFunnelAggregateRow` below for the case-study embed's own "admin-funnel" key.
    const rows = isAggregateHeading ? cohorts.slice(1) : cohorts;

    return (
        <section className="flex flex-col gap-6">
            {isAggregateHeading && (
                <div className="px-4 pt-6">
                    <h2 className="text-display-xs font-bold text-primary">Team Performance</h2>
                    <p className="text-sm text-tertiary">Aggregate metrics across all cohorts</p>
                </div>
            )}

            {isAggregateHeading ? (
                // 2-column grid, dense auto-flow — the expanded card's `row-span-2` makes it fill
                // its whole column, and dense packing reflows the other two into the remaining
                // column above/below it (Figma node 626:24214, Manik's call 2026-09-11: standard
                // grid auto-placement, not a hand-pinned per-TM layout). `motion.div layout`
                // animates each card's position/size as the grid reflows.
                // `items-start`, overriding Grid's default `align-items: stretch` — without it, a
                // cell's rendered box height follows its *row track's* computed height, not just
                // its own set height. Two cards sharing a row (e.g. the top row before either is
                // expanded) means one's mid-collapse content — shrinking gradually over its own
                // 300ms `AnimatePresence` exit — keeps reshaping that shared row track every frame,
                // and its row-mate stretches to follow it the whole time. That's the sibling
                // "flinch" during collapse (Manik's report, 2026-09-11) — it happens to whichever
                // card shares a row with the one being toggled, regardless of which of the two is
                // collapsing. `items-start` makes each card size to its own height only, immune to
                // whatever its row-mate is doing mid-animation.
                //
                // `minHeight` on the container itself, once a real measurement exists — a belt-
                // and-suspenders guard so the grid's own outer footprint never shrinks/grows
                // mid-transition even if something inside briefly does, which is what let the page
                // below the whole grid visibly reflow along with it (Manik's report, 2026-09-11).
                <div
                    className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:grid-flow-row-dense"
                    style={expandedHeight !== null ? { minHeight: expandedHeight } : undefined}
                >
                    {rows.map((cohort) => {
                        const tm = teamManagers.find((t) => t.id === cohort.id);
                        if (!tm) return null;
                        const isExpanded = expandedTmId === tm.id;
                        // "auto" while nothing's been measured yet (first paint, before any card
                        // has ever been expanded) — same fallback `collapsedHeight` itself already
                        // has, just spelled out here since `animate` needs a value every render,
                        // not `undefined`.
                        const heightTarget = isExpanded ? "auto" : (collapsedHeight ?? "auto");

                        return (
                            <motion.div
                                key={cohort.id}
                                // `layout="position"` for grid-reflow repositioning (a translate, never
                                // distorts content) — `animate` owns height on its own, directly, via
                                // Framer's own engine rather than a raw CSS `style`/`transition`. Two
                                // earlier approaches both broke down here: a `min-height` floor let the
                                // collapsing card's real (still-shrinking) content keep the shared grid
                                // row inflated for nearly its whole ~300ms exit before snapping down: and
                                // a manual two-render "paint the old height, flip to the new one next
                                // frame" trick fixed that but split the *reflow* into two separate steps
                                // too, since the row's own height depends on this card's height — which
                                // is what read as a sibling moving in two distinct motions instead of
                                // one (Manik's reports, 2026-09-11). Framer's `animate` understands
                                // `"auto"` natively (the same mechanism already used for this card's own
                                // inner content) and smoothly interpolates from whatever the box's
                                // *actual current* height is to the new target in one continuous
                                // animation, in the same render/commit as the position change — nothing
                                // left needing a second step.
                                layout="position"
                                ref={isExpanded ? expandedCardRef : undefined}
                                initial={false}
                                animate={{ height: heightTarget }}
                                transition={gridLayoutTransition}
                                className={cx("overflow-hidden", isExpanded && "lg:row-span-2")}
                            >
                                <FadeOnSelection selectionKey={`${cohort.id}-${selectionKey}`} className="flex h-full flex-col">
                                    <TeamManagerFunnelCard
                                        data={getTeamManagerFunnelCardData(selection, tm, deals)}
                                        isExpanded={isExpanded}
                                        onToggleExpand={() => {
                                            // Disconnect the observer on the *currently* expanded card's box
                                            // right now, synchronously — not waiting for the effect below to
                                            // clean it up on the next render. That cleanup runs after this
                                            // click's DOM changes are already committed, and in that gap the
                                            // still-attached observer can catch one more resize callback off a
                                            // box that's already mid-way through losing its expanded layout —
                                            // a transient, wrong height that then got fed into every other
                                            // card's synced height, reading as a sibling briefly jumping in
                                            // size for no reason (Manik's report, 2026-09-11).
                                            clearTimeout(settleTimeoutRef.current);
                                            observerRef.current?.disconnect();
                                            observerRef.current = null;

                                            const next = expandedTmId === tm.id ? null : tm.id;
                                            // Only clear the stale measurement when jumping straight from one
                                            // expanded card to a *different* one — the new card's real height
                                            // gets re-measured by the effect above anyway, this just stops the
                                            // old card's leftover height flashing onto it for a frame first.
                                            // Collapsing to nothing-expanded deliberately does NOT clear it —
                                            // see the comment on `expandedHeight` above.
                                            if (next !== null && next !== expandedTmId) setExpandedHeight(null);
                                            setExpandedTmId(next);
                                        }}
                                    />
                                </FadeOnSelection>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                rows.map((cohort) => (
                    <div key={cohort.id} className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h3 className="text-md font-semibold text-primary">{cohort.name}</h3>
                            <OverviewPerformanceToggle id={cohort.id} />
                        </div>

                        <FadeOnSelection selectionKey={`${cohort.id}-${selectionKey}`} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {cohort.stages.map((stage) => (
                                <FunnelStageCard key={stage.label} stage={stage} />
                            ))}
                        </FadeOnSelection>
                    </div>
                ))
            )}
        </section>
    );
};

/** Just the first ("aggregate") row of the admin funnel — the header plus
 * one 4-card grid — without the per-Team-Manager cohorts FunnelSection also
 * renders below it for the admin persona. Used by the embed view so the
 * case study can show exactly the Admin Funnel row in isolation, rather
 * than the whole admin sweep across every team. */
export const AdminFunnelAggregateRow = ({ selection }: { selection: PeriodSelection }) => {
    const { deals } = useDeals();
    const [aggregate] = getFunnelCohortsLive(selection, { role: "admin" }, deals);
    const selectionKey = getPeriodSelectionKey(selection);

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-display-xs font-bold text-primary">ADMIN Funnel — Sales Head</h2>
                    <p className="text-sm text-tertiary">Aggregate metrics across all cohorts</p>
                </div>
                <OverviewPerformanceToggle id="admin-funnel" />
            </div>

            <FadeOnSelection selectionKey={selectionKey} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {aggregate.stages.map((stage) => (
                    <FunnelStageCard key={stage.label} stage={stage} />
                ))}
            </FadeOnSelection>
        </section>
    );
};
