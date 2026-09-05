import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";
import { Bookmark, SlashCircle01, XCircle } from "@untitledui/icons";
import { DialogTrigger, Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import type { Deal } from "@/data/deals-data";
import { STATUS } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";

export type GlobalStatusKind = "not-interested" | "rejected" | "saved";

type Theme = "gray" | "error" | "brand";

const THEME_CLASSES: Record<Theme, { bg: string; fg: string; ring: string }> = {
    gray: { bg: "bg-secondary", fg: "text-fg-secondary", ring: "bg-fg-quaternary" },
    error: { bg: "bg-error-secondary", fg: "text-fg-error-primary", ring: "bg-fg-error-primary" },
    brand: { bg: "bg-brand-secondary", fg: "text-fg-brand-primary", ring: "bg-fg-brand-primary" },
};

const CONFIG: Record<GlobalStatusKind, { statusId: "NOT_INTERESTED" | "REJECTED" | "SAVED"; icon: FC<{ className?: string }>; title: string; body: string; confirmLabel: string; doneTitle: string; reason: string; theme: Theme; confirmColor: "secondary" | "primary-destructive" }> = {
    "not-interested": {
        statusId: "NOT_INTERESTED",
        icon: SlashCircle01,
        title: "Mark as Not Interested?",
        body: "This deal moves to Not Interested and drops out of your active pipeline. It can be reopened later if the learner comes back.",
        confirmLabel: "Mark Not Interested",
        doneTitle: "Marked Not Interested",
        reason: "No longer pursuing this cohort",
        theme: "gray",
        confirmColor: "secondary",
    },
    rejected: {
        statusId: "REJECTED",
        icon: XCircle,
        title: "Reject this deal?",
        body: "This disqualifies the applicant for this cohort. Use it when the learner doesn't meet course prerequisites, not as a substitute for Not Interested.",
        confirmLabel: "Reject Deal",
        doneTitle: "Deal Rejected",
        reason: "Does not meet course prerequisites",
        theme: "error",
        confirmColor: "primary-destructive",
    },
    saved: {
        statusId: "SAVED",
        icon: Bookmark,
        title: "Save this deal for later?",
        body: "Parks the deal outside the active pipeline without closing it out — pick it back up for a future intake whenever you're ready.",
        confirmLabel: "Save for Later",
        doneTitle: "Saved for Later",
        reason: "Parked for the next intake",
        theme: "brand",
        confirmColor: "secondary",
    },
};

/** A small looping "idle" flourish behind the icon while the dialog waits for confirmation —
 * distinct per kind, so the animation itself hints at what the action means rather than being
 * decoration for its own sake. */
const IdleMotif = ({ kind, theme }: { kind: GlobalStatusKind; theme: Theme }) => {
    const t = THEME_CLASSES[theme];
    if (kind === "not-interested") {
        return (
            <motion.span
                aria-hidden
                className={`absolute inset-0 rounded-full border-2 border-dashed ${t.fg} opacity-30`}
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
        );
    }
    if (kind === "rejected") {
        return (
            <motion.span
                aria-hidden
                className={`absolute inset-0 rounded-full ${t.ring}`}
                animate={{ scale: [1, 1.35, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
        );
    }
    // saved — a couple of small sparkle dots orbiting loosely, like something being tucked away.
    return (
        <>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    aria-hidden
                    className={`absolute top-1/2 left-1/2 size-1.5 rounded-full ${t.ring}`}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                        x: [0, Math.cos((i * 2 * Math.PI) / 3) * 30, Math.cos((i * 2 * Math.PI) / 3) * 30],
                        y: [0, Math.sin((i * 2 * Math.PI) / 3) * 30, Math.sin((i * 2 * Math.PI) / 3) * 30],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                />
            ))}
        </>
    );
};

/** The icon's one-time entrance, distinct per kind — a rejection shakes (firm, negative), a
 * save-for-later drops in and settles (gentle, positive), not-interested just pops in cleanly
 * (neutral). */
const ICON_ENTRANCE: Record<GlobalStatusKind, object> = {
    "not-interested": { initial: { scale: 0.4, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: "spring", stiffness: 340, damping: 18 } },
    rejected: {
        initial: { scale: 0.4, opacity: 0, x: 0 },
        animate: { scale: 1, opacity: 1, x: [0, -8, 8, -5, 5, 0] },
        transition: { scale: { type: "spring", stiffness: 340, damping: 18 }, opacity: { duration: 0.2 }, x: { duration: 0.45, delay: 0.15, ease: "easeInOut" } },
    },
    saved: {
        initial: { y: -40, opacity: 0, scale: 0.6 },
        animate: { y: 0, opacity: 1, scale: 1 },
        transition: { type: "spring", stiffness: 260, damping: 14 },
    },
};

/** A handful of dots bursting outward from the icon — the shared "done" flourish across all
 * three kinds, so confirming always feels like a distinct, satisfying beat rather than the
 * dialog just vanishing. */
const Burst = ({ theme }: { theme: Theme }) => {
    const t = THEME_CLASSES[theme];
    const dots = Array.from({ length: 8 });
    return (
        <>
            {dots.map((_, i) => {
                const angle = (i / dots.length) * 2 * Math.PI;
                const distance = 46;
                return (
                    <motion.span
                        key={i}
                        aria-hidden
                        className={`absolute top-1/2 left-1/2 size-1.5 rounded-full ${t.ring}`}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scale: 0.4 }}
                        transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                    />
                );
            })}
        </>
    );
};

const CheckDraw = () => (
    <motion.svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <motion.path
            d="M4 12.5l5 5L20 7"
            stroke="currentColor"
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
        />
    </motion.svg>
);

export type GlobalStatusRequest = { dealId: string; kind: GlobalStatusKind } | null;

/** Confirmation for the three left-rail Global Status actions — each with a distinct animated
 * icon flourish (idle motif while confirming, a shared "burst + checkmark" once confirmed)
 * rather than a plain "are you sure?" prompt. */
export const GlobalStatusDialog = ({ request, onOpenChange }: { request: GlobalStatusRequest; onOpenChange: (open: boolean) => void }) => {
    const { deals, updateDeal, logActivity } = useDeals();
    const deal: Deal | undefined = request ? deals.find((d) => d.id === request.dealId) : undefined;
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDone(false);
    }, [request?.dealId, request?.kind]);

    if (!request || !deal) return null;
    const cfg = CONFIG[request.kind];
    const t = THEME_CLASSES[cfg.theme];
    const Icon = cfg.icon;

    const close = () => onOpenChange(false);
    const confirm = () => {
        updateDeal(deal.id, { status: STATUS[cfg.statusId] });
        logActivity(deal.id, `Deal marked ${STATUS[cfg.statusId].label}`, cfg.reason);
        setDone(true);
    };

    return (
        <DialogTrigger isOpen={!!request} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-md">
                    <Dialog>
                        {() => (
                            <div className="relative flex w-full flex-col items-center gap-4 overflow-hidden rounded-2xl bg-primary p-6 text-center shadow-xl">
                                <CloseButton size="sm" className="absolute top-3 right-3" onClick={close} />

                                <div className={`relative flex size-16 items-center justify-center rounded-full ${t.bg}`}>
                                    <AnimatePresence mode="wait">
                                        {!done ? (
                                            <motion.div key="idle" className="relative flex size-16 items-center justify-center" exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }}>
                                                <IdleMotif kind={request.kind} theme={cfg.theme} />
                                                <motion.span {...(ICON_ENTRANCE[request.kind] as object)} className={`relative flex ${t.fg}`}>
                                                    <Icon className="size-7" />
                                                </motion.span>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="done" className="relative flex size-16 items-center justify-center" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 20 }}>
                                                <Burst theme={cfg.theme} />
                                                <span className={t.fg}>
                                                    <CheckDraw />
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!done ? (
                                        <motion.div key="confirm-copy" className="flex flex-col gap-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                                            <span className="text-md font-semibold text-primary">{cfg.title}</span>
                                            <span className="text-sm text-tertiary">{cfg.body}</span>
                                            <span className="text-xs text-quaternary italic">Logged as: {cfg.reason}</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="done-copy" className="flex flex-col gap-1" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.2 }}>
                                            <span className="text-md font-semibold text-primary">{cfg.doneTitle}</span>
                                            <span className="text-sm text-tertiary">{deal.name} has been updated.</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!done ? (
                                    <div className="mt-1 flex w-full items-center justify-center gap-2">
                                        <Button color="secondary" size="sm" onClick={close}>
                                            Cancel
                                        </Button>
                                        <Button color={cfg.confirmColor} size="sm" onClick={confirm}>
                                            {cfg.confirmLabel}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button color="secondary" size="sm" className="mt-1" onClick={close}>
                                        Done
                                    </Button>
                                )}
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
