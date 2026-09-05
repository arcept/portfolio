import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PROTOTYPE_TODAY, getPersonaLabel } from "@/data/dashboard-data";
import { DEALS, STATUS, planSnapshot, refreshOfferStaleness } from "@/data/deals-data";
import type { Deal, Installment, OfferTemplate, PlanState } from "@/data/deals-data";
import { usePersona } from "@/providers/role-provider";

interface DealsContextType {
    deals: Deal[];
    updateDeal: (id: string, patch: Partial<Deal>) => void;
    /** Appends an activity-log entry to a deal without otherwise changing it — the read-only
     * counterpart to `updateDeal` for actions that are purely "this happened", not a field
     * change. */
    logActivity: (id: string, text: string, reason?: string | null) => void;

    /** Payment Plan lifecycle (2026-09-05 offer-separation brief §4). */
    createPlan: (id: string) => void;
    savePlan: (id: string, patch: { discount: number; installments: Installment[] }) => void;
    submitPlanForApproval: (id: string, note?: string | null) => void;
    resolveApproval: (id: string, decision: "approved" | "rejected", reason?: string | null) => void;

    /** Offer Letter lifecycle. */
    createLetter: (id: string, opts: { template: OfferTemplate; deadline: string }) => void;
    refreshLetter: (id: string) => void;
    shareLetter: (id: string) => void;
    resendLetter: (id: string) => void;
    withdrawOffer: (id: string, reason: string) => void;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export const useDeals = (): DealsContextType => {
    const context = useContext(DealsContext);
    if (context === undefined) {
        throw new Error("useDeals must be used within a DealsProvider");
    }
    return context;
};

/** Same shape as `RoleProvider`/`ThemeProvider` — the roster is generated once (module-level, in
 * deals-data.ts) and this just wraps it in React state so mutations actually re-render instead
 * of silently mutating a module-level array React never sees.
 *
 * Every mutation below is a single `setDeals` call — a half-applied plan/offer transition is
 * impossible — and every activity-log entry names the actor (`usePersona()`, resolved via
 * `RoleProvider`, an ancestor of this provider in `main.tsx`) rather than being left anonymous. */
export const DealsProvider = ({ children }: { children: ReactNode }) => {
    const [deals, setDeals] = useState<Deal[]>(DEALS);
    const { persona } = usePersona();
    const actor = useMemo(() => getPersonaLabel(persona), [persona]);
    // Actor goes in `reason`, never appended to `text` — `getMilestoneGroups` (deal-detail.tsx)
    // and `buildActivityLog` (deals-data.ts) look these entries up by exact text (e.g. "Payment
    // plan created"), and a per-actor suffix would silently break that match.
    const withActor = useCallback((reason?: string | null) => (reason ? `${reason} — by ${actor}` : `By ${actor}`), [actor]);

    const updateDeal = useCallback((id: string, patch: Partial<Deal>) => {
        setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, lastUpdate: PROTOTYPE_TODAY } : d)));
    }, []);

    const logActivity = useCallback((id: string, text: string, reason?: string | null) => {
        setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text, reason: reason ?? null }] } : d)));
    }, []);

    const createPlan = useCallback(
        (id: string) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id || d.plan.state !== "none") return d;
                    const nextStatus = d.status.id === "APP_FILLED" || d.status.id === "PLAN_NOT_STARTED" ? STATUS.PLAN_DRAFT : d.status;
                    return {
                        ...d,
                        plan: { state: "draft_incomplete", createdOn: PROTOTYPE_TODAY, committedOn: null, activatedOn: null, approval: { state: "n/a", reason: null, decidedOn: null } },
                        status: nextStatus,
                        reachedStage: Math.max(d.reachedStage, 1) as Deal["reachedStage"],
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Payment plan created", reason: withActor() }],
                    };
                }),
            );
        },
        [withActor],
    );

    const savePlan = useCallback(
        (id: string, patch: { discount: number; installments: Installment[] }) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id) return d;
                    const netPayable = d.courseFee - patch.discount;
                    const totalAssigned = patch.installments.reduce((sum, i) => sum + i.amount, 0);
                    const planState: PlanState = totalAssigned === netPayable ? "draft_ready" : "draft_incomplete";
                    const next: Deal = {
                        ...d,
                        discount: patch.discount,
                        netPayable,
                        installments: patch.installments,
                        plan: { ...d.plan, state: planState },
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Payment plan edited", reason: withActor() }],
                    };
                    return refreshOfferStaleness(next);
                }),
            );
        },
        [withActor],
    );

    const submitPlanForApproval = useCallback(
        (id: string, note?: string | null) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id) return d;
                    // Pre-offer, this is the deal's whole story right now, so the top-level status
                    // reflects it. Post-payment (the existing per-installment EMI editor, scoped to
                    // active plans per §7), the deal's status stays whatever payment stage it's in —
                    // `plan.state` alone carries the "frozen, awaiting Sales Ops" nuance.
                    const preOffer = d.offer.state === "none" || d.offer.state === "created" || d.offer.state === "stale";
                    return {
                        ...d,
                        plan: { ...d.plan, state: "awaiting_approval", approval: { state: "pending", reason: null, decidedOn: null } },
                        status: preOffer ? STATUS.PLAN_AWAITING_APPROVAL : d.status,
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Submitted for Sales Ops approval", reason: withActor(note) }],
                    };
                }),
            );
        },
        [withActor],
    );

    const resolveApproval = useCallback(
        (id: string, decision: "approved" | "rejected", reason?: string | null) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id) return d;
                    const hasPaid = d.installments.some((i) => i.status === "Paid");
                    const revertState: PlanState = hasPaid ? "active" : "draft_ready";
                    const wasPreOffer = d.status.id === "PLAN_AWAITING_APPROVAL";
                    return {
                        ...d,
                        plan: { ...d.plan, state: revertState, approval: { state: decision, reason: reason ?? null, decidedOn: PROTOTYPE_TODAY } },
                        status: wasPreOffer ? STATUS.PLAN_DRAFT : d.status,
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [
                            ...d.activityLog,
                            { ts: PROTOTYPE_TODAY, text: decision === "approved" ? "Approval granted" : "Approval rejected", reason: withActor(reason) },
                        ],
                    };
                }),
            );
        },
        [withActor],
    );

    const createLetter = useCallback(
        (id: string, opts: { template: OfferTemplate; deadline: string }) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id) return d;
                    let offerHistory = d.offerHistory;
                    let version = 1;
                    if ((d.offer.state === "expired" || d.offer.state === "withdrawn") && d.offer.sharedOn && d.offer.template) {
                        offerHistory = [
                            ...offerHistory,
                            { version: d.offer.version, template: d.offer.template.name, sharedOn: d.offer.sharedOn, endedOn: PROTOTYPE_TODAY, endedBy: d.offer.state, reason: null },
                        ];
                        version = d.offer.version + 1;
                    } else if (d.offer.state === "created" || d.offer.state === "stale") {
                        // An unshared draft letter, discarded for a fresh one — nothing was ever
                        // delivered to the learner, so there's no history entry to push.
                        version = d.offer.version + 1;
                    }
                    const offer: Deal["offer"] = {
                        state: "created", template: opts.template, deadline: opts.deadline, version,
                        createdOn: PROTOTYPE_TODAY, sharedOn: null, resendCount: 0, snapshot: planSnapshot(d),
                    };
                    return {
                        ...d,
                        offer,
                        offerHistory,
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Offer letter created", reason: withActor(`${opts.template.name} template`) }],
                    };
                }),
            );
        },
        [withActor],
    );

    const refreshLetter = useCallback(
        (id: string) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id || d.offer.state !== "stale") return d;
                    return {
                        ...d,
                        offer: { ...d.offer, state: "created", snapshot: planSnapshot(d) },
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Offer letter refreshed", reason: withActor() }],
                    };
                }),
            );
        },
        [withActor],
    );

    const shareLetter = useCallback(
        (id: string) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id) return d;
                    return {
                        ...d,
                        plan: { ...d.plan, state: "committed", committedOn: PROTOTYPE_TODAY },
                        offer: { ...d.offer, state: "shared", sharedOn: PROTOTYPE_TODAY },
                        status: STATUS.OFFER_PENDING,
                        reachedStage: Math.max(d.reachedStage, 2) as Deal["reachedStage"],
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [
                            ...d.activityLog,
                            { ts: PROTOTYPE_TODAY, text: "Offer letter shared", reason: withActor(d.offer.template ? `${d.offer.template.name} template` : null) },
                        ],
                    };
                }),
            );
        },
        [withActor],
    );

    const resendLetter = useCallback(
        (id: string) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id || (d.offer.state !== "shared" && d.offer.state !== "accepted")) return d;
                    return {
                        ...d,
                        offer: { ...d.offer, resendCount: d.offer.resendCount + 1 },
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Offer letter resent", reason: withActor() }],
                    };
                }),
            );
        },
        [withActor],
    );

    const withdrawOffer = useCallback(
        (id: string, reason: string) => {
            setDeals((prev) =>
                prev.map((d) => {
                    if (d.id !== id) return d;
                    const offerHistory =
                        d.offer.sharedOn && d.offer.template
                            ? [...d.offerHistory, { version: d.offer.version, template: d.offer.template.name, sharedOn: d.offer.sharedOn, endedOn: PROTOTYPE_TODAY, endedBy: "withdrawn" as const, reason }]
                            : d.offerHistory;
                    return {
                        ...d,
                        plan: { ...d.plan, state: "draft_ready" },
                        offer: { ...d.offer, state: "withdrawn" },
                        offerHistory,
                        status: STATUS.PLAN_DRAFT,
                        lastUpdate: PROTOTYPE_TODAY,
                        activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text: "Offer withdrawn", reason: withActor(reason) }],
                    };
                }),
            );
        },
        [withActor],
    );

    return (
        <DealsContext.Provider
            value={{
                deals,
                updateDeal,
                logActivity,
                createPlan,
                savePlan,
                submitPlanForApproval,
                resolveApproval,
                createLetter,
                refreshLetter,
                shareLetter,
                resendLetter,
                withdrawOffer,
            }}
        >
            {children}
        </DealsContext.Provider>
    );
};
