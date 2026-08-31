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

export const DealStatusBadge = ({ status }: { status: DealStatus }) => (
    <BadgeWithDot color={COLOR_MAP[status.color]} size="sm" type="pill-color">
        {status.stage} · {status.label}
    </BadgeWithDot>
);

export const ActionNeededBadge = () => (
    <BadgeWithDot color="error" size="sm" type="pill-color">
        Action needed
    </BadgeWithDot>
);
