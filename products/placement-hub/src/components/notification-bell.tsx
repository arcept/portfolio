import { Bell01 } from "@untitledui/icons";
import { useEffect, useRef, useState } from "react";
import type { NotificationAvatar } from "@/data/notifications-store";
import { notificationsStore, useNotifications } from "@/data/notifications-store";
import { cx } from "@/utils/cx";

const NotificationAvatarIcon = ({ avatar }: { avatar: NotificationAvatar }) => {
    if (avatar.kind === "logo") {
        return (
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-700">
                <img src={avatar.src} alt="" className="size-full object-cover" />
            </span>
        );
    }
    return (
        <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-full", avatar.bgClassName)}>
            <avatar.icon className="size-4 text-white" />
        </span>
    );
};

interface NotificationBellProps {
    onNavigateJob?: (jobId: string) => void;
}

export const NotificationBell = ({ onNavigateJob }: NotificationBellProps) => {
    const [open, setOpen] = useState(false);
    const notifications = useNotifications();
    const containerRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => n.unread).length;

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100"
            >
                <Bell01 className="size-4 text-gray-cool-900" />
                {unreadCount > 0 && (
                    <span className="absolute top-[-5px] right-[-5px] flex size-4 items-center justify-center rounded-[4px] bg-warning-600 text-xs font-semibold text-white">{unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-20 flex max-h-[600px] w-[440px] flex-col max-md:fixed max-md:inset-x-4 max-md:top-16 max-md:max-h-[calc(100dvh-80px)] max-md:w-auto overflow-hidden rounded-lg border border-gray-100 bg-gray-100 shadow-[var(--shadow-card-lg)]">
                    <div className="flex w-full shrink-0 items-center justify-between border-b border-gray-200 p-4 text-xs font-semibold text-black">
                        <p>Notifications</p>
                        <button type="button" onClick={notificationsStore.markAllAsRead} className="cursor-pointer hover:underline">
                            Mark all as Read
                        </button>
                    </div>
                    <div className="flex w-full flex-col overflow-y-auto">
                        {notifications.map((notification) => {
                            const clickable = Boolean(notification.jobId && onNavigateJob);
                            return (
                                <div
                                    key={notification.id}
                                    role={clickable ? "button" : undefined}
                                    tabIndex={clickable ? 0 : undefined}
                                    onClick={
                                        clickable
                                            ? () => {
                                                  onNavigateJob!(notification.jobId!);
                                                  setOpen(false);
                                              }
                                            : undefined
                                    }
                                    className={cx("flex w-full items-center gap-12 bg-gray-50 p-4", clickable && "cursor-pointer hover:bg-gray-100")}
                                >
                                    <div className="flex flex-1 items-start gap-2">
                                        <NotificationAvatarIcon avatar={notification.avatar} />
                                        <div className="flex flex-1 flex-col gap-2">
                                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                            <p className="text-xs text-black">{notification.timestamp}</p>
                                        </div>
                                    </div>
                                    {notification.unread && <span className="size-2 shrink-0 rounded-full bg-gray-cool-900" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
