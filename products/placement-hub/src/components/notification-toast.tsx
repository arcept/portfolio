import { XClose } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { NotificationAvatar, NotificationItem } from "@/data/notifications-store";
import { notificationsStore } from "@/data/notifications-store";
import { cx } from "@/utils/cx";

const TOAST_DURATION_MS = 5000;

const ToastAvatar = ({ avatar }: { avatar: NotificationAvatar }) => {
    if (avatar.kind === "logo") {
        return (
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-700">
                <img src={avatar.src} alt="" className="size-full object-cover" />
            </span>
        );
    }
    return (
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${avatar.bgClassName}`}>
            <avatar.icon className="size-4 text-white" />
        </span>
    );
};

interface NotificationToastHostProps {
    onNavigateJob?: (jobId: string) => void;
}

// A live snackbar for every notification the moment it's pushed (e.g. an application status
// change) — the bell's unread badge alone is easy to miss, this makes the update land in the
// moment instead of only being discoverable on the next click into the panel.
export const NotificationToastHost = ({ onNavigateJob }: NotificationToastHostProps) => {
    const [toasts, setToasts] = useState<NotificationItem[]>([]);

    useEffect(() => {
        return notificationsStore.subscribeToast((notification) => {
            setToasts((prev) => [...prev, notification]);
        });
    }, []);

    const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <div className="pointer-events-none fixed top-24 right-6 z-[110] flex w-[380px] flex-col gap-3 max-md:inset-x-4 max-md:top-16 max-md:w-auto">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastCard
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => dismiss(toast.id)}
                        onNavigateJob={
                            toast.jobId && onNavigateJob
                                ? () => {
                                      onNavigateJob(toast.jobId!);
                                      dismiss(toast.id);
                                  }
                                : undefined
                        }
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastCard = ({ toast, onDismiss, onNavigateJob }: { toast: NotificationItem; onDismiss: () => void; onNavigateJob?: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, TOAST_DURATION_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={onNavigateJob}
            className={cx(
                "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card-lg)]",
                onNavigateJob && "cursor-pointer hover:border-gray-300",
            )}
        >
            <ToastAvatar avatar={toast.avatar} />
            <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-xs font-semibold text-blue-dark-600">Application Update</p>
                <p className="text-sm font-medium text-gray-900">{toast.message}</p>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                aria-label="Dismiss notification"
                className="flex size-6 shrink-0 items-center justify-center rounded-lg hover:bg-gray-50"
            >
                <XClose className="size-4 text-gray-400" />
            </button>
        </motion.div>
    );
};
