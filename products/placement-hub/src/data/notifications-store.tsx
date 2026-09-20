import { useSyncExternalStore } from "react";
import type { ComponentType, ReactNode } from "react";
import { BellRinging01, Star06, Zap } from "@untitledui/icons";
import { COMPANY_LOGOS } from "@/data/company-logos";

export type NotificationAvatar = { kind: "logo"; src: string } | { kind: "icon"; icon: ComponentType<{ className?: string }>; bgClassName: string };

export interface NotificationItem {
    id: string;
    avatar: NotificationAvatar;
    message: ReactNode;
    timestamp: string;
    unread: boolean;
    /** Set when this notification is about a specific job — makes it clickable, routing to that
     *  job's JD page (e.g. an offer notification opens straight to the offer). */
    jobId?: string;
}

// Static dummy content, same caveat as the rest of this app's data — just enough for the UI, no
// backend wiring. Real notifications get pushed on top via `notificationsStore.push` (see
// jobs-store.ts, which pushes one on every application status change).
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: "seed-1",
        avatar: { kind: "logo", src: COMPANY_LOGOS["United Network Studio"] },
        message: (
            <>
                Your application for <b>BIM Engineer</b> has been <b>successfully shared</b> with the Hiring Partner.
            </>
        ),
        timestamp: "15 mins ago",
        unread: true,
    },
    {
        id: "seed-2",
        avatar: { kind: "logo", src: COMPANY_LOGOS["AECOM Architects"] },
        message: (
            <>
                Your application for <b>Sr. BIM Engineer</b> is currently <b>being reviewed</b>
            </>
        ),
        timestamp: "30 mins ago",
        unread: true,
    },
    {
        id: "seed-3",
        avatar: { kind: "logo", src: COMPANY_LOGOS["United Network Studio"] },
        message: (
            <>
                Your application for <b>BIM Engineer</b> has been <b>successfully shared</b> with the Hiring Partner.
            </>
        ),
        timestamp: "1 day ago",
        unread: true,
    },
    {
        id: "seed-4",
        avatar: { kind: "icon", icon: Zap, bgClassName: "bg-yellow-400" },
        message: "A new opportunity that best matches your skills has been added to the job board",
        timestamp: "2 days ago",
        unread: false,
    },
    {
        id: "seed-5",
        avatar: { kind: "icon", icon: BellRinging01, bgClassName: "bg-orange-dark-500" },
        message: "Last 12 hrs left to apply for the job at AECOM. Apply now! It takes less than 2 mins",
        timestamp: "2 days ago",
        unread: false,
    },
    {
        id: "seed-6",
        avatar: { kind: "logo", src: COMPANY_LOGOS["Diller Scofidio + Renfro"] },
        message: (
            <>
                Unfortunately, your application for Architect at <b>Diller Scofidio + Renfro</b> has been unsuccessful.
            </>
        ),
        timestamp: "3 days ago",
        unread: false,
    },
    {
        id: "seed-7",
        avatar: { kind: "icon", icon: Star06, bgClassName: "bg-success-500" },
        message: "There are 2 new Featured Jobs listed at the job board. Grab the opportunity soon!",
        timestamp: "3 days ago",
        unread: false,
    },
];

let notifications = INITIAL_NOTIFICATIONS;
let idCounter = 0;
const listeners = new Set<() => void>();
const toastListeners = new Set<(notification: NotificationItem) => void>();

const notify = () => listeners.forEach((listener) => listener());

export const notificationsStore = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot: () => notifications,
    subscribeToast: (listener: (notification: NotificationItem) => void) => {
        toastListeners.add(listener);
        return () => {
            toastListeners.delete(listener);
        };
    },
    markAllAsRead: () => {
        notifications = notifications.map((n) => ({ ...n, unread: false }));
        notify();
    },
    // Adds a new unread notification to the top of the list AND fires the toast/snackbar —
    // the single entry point every real event (an application status change, etc.) goes through.
    push: (input: { avatar: NotificationAvatar; message: ReactNode; jobId?: string }) => {
        const item: NotificationItem = { id: `live-${++idCounter}`, timestamp: "Just now", unread: true, ...input };
        notifications = [item, ...notifications];
        notify();
        toastListeners.forEach((listener) => listener(item));
    },
};

export const useNotifications = () => useSyncExternalStore(notificationsStore.subscribe, notificationsStore.getSnapshot);
