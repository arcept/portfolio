import { BadgeWithDot } from "@/components/base/badges/badges";
import type { BadgeColors } from "@/components/base/badges/badge-types";
import type { DealStatus } from "@/data/deals-data";

// Product colour language (2026-08-31 Deals Page brief §3) mapped onto Untitled UI Badge
// colours — blue = waiting on the learner, amber = timed out, green = progress, red = action/
// cancelled, gray = cross-cutting global status.
const COLOR_MAP: Record<DealStatus["color"], BadgeColors> = {
    blue: "blue",
    amber: "warning",
    green: "success",
    red: "error",
    gray: "gray",
};

// "modern" badge type (flat bg-primary chrome, colored dot only) — matches the redesigned
// Deals List frame (Figma node 442:29862 "Deal Row New" / Status column), which drops the old
// filled colored-pill badges in favor of this flatter, dot-led style everywhere.
export const DealStatusBadge = ({ status }: { status: DealStatus }) => (
    <BadgeWithDot color={COLOR_MAP[status.color]} size="sm" type="modern">
        {/* "Global" isn't a funnel stage a BDR recognizes — Not Interested/Rejected/Saved read on
         * their own, so skip the stage prefix these three otherwise share with every other row. */}
        {status.stage === "Global" ? status.label : `${status.stage} · ${status.label}`}
    </BadgeWithDot>
);

export const ActionNeededBadge = () => (
    <BadgeWithDot color="error" size="sm" type="modern">
        Action
    </BadgeWithDot>
);
