import { AlertTriangle, ArrowsRight, ClockSnooze, MessageXSquare, Share06, ThumbsUp, Trophy01, XCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import type { ApplicationStatus } from "@/types/application";

interface StatusConfig {
    label: string;
    icon: React.FC<{ className?: string }>;
    badgeClassName: string;
    messageClassName: string;
}

// Colors/icons/labels taken directly from the Figma dev handoff for each status pill.
const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    applied: { label: "Applied", icon: ThumbsUp, badgeClassName: "bg-blue-100 text-blue-800", messageClassName: "bg-blue-50 text-blue-600" },
    shared: { label: "Shared", icon: Share06, badgeClassName: "bg-indigo-100 text-indigo-700", messageClassName: "bg-indigo-50 text-indigo-600" },
    in_process: { label: "In Process", icon: ArrowsRight, badgeClassName: "bg-green-50 text-green-800", messageClassName: "bg-success-100/40 text-success-600" },
    offer_received: { label: "Offer Received", icon: () => <span className="text-[16px] leading-none">✨</span>, badgeClassName: "bg-purple-700 text-purple-50", messageClassName: "bg-purple-50 text-purple-800" },
    offer_accepted: { label: "Offer Accepted", icon: Trophy01, badgeClassName: "bg-blue-dark-800 text-white", messageClassName: "bg-blue-dark-50 text-blue-dark-800" },
    rejected: { label: "Rejected", icon: MessageXSquare, badgeClassName: "bg-blue-gray-200 text-blue-gray-700", messageClassName: "bg-gray-cool-100 text-blue-gray-700" },
    offer_declined: { label: "Offer Declined", icon: XCircle, badgeClassName: "bg-error-50 text-error-600", messageClassName: "bg-error-50 text-error-600" },
    inactive: { label: "Inactive", icon: ClockSnooze, badgeClassName: "bg-gray-true-200 text-gray-true-700", messageClassName: "bg-gray-cool-100 text-gray-true-700" },
    disqualified: { label: "Disqualified", icon: AlertTriangle, badgeClassName: "bg-orange-dark-50 text-orange-dark-700", messageClassName: "bg-orange-dark-100 text-orange-dark-700" },
};

export const getStatusConfig = (status: ApplicationStatus) => STATUS_CONFIG[status];

export const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
    const { label, icon: Icon, badgeClassName } = STATUS_CONFIG[status];
    return (
        <span className={cx("inline-flex items-center gap-1 rounded-2xl px-3 py-1 text-sm font-semibold whitespace-nowrap", badgeClassName)}>
            <Icon className="size-4" />
            {label}
        </span>
    );
};
