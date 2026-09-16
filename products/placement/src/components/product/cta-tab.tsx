import { Bell01 as Bell } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

interface ApplyCtaBarProps {
    deadline: "hard_48h" | "soft";
}

// CTA Tab (components.md node 3956:189121) — "Apply" variant. Other variants (Expired, Offer
// already held, Profile incomplete, Irrelevant/Share concern, Accept Offer) get built when their
// screens come up (scenarios 02-04 / the Gate scenario).
export const ApplyCtaBar = ({ deadline }: ApplyCtaBarProps) => {
    return (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-warning-primary px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-warning-primary">
                <Bell className="size-4" />
                {deadline === "hard_48h" ? "First round applications to be assessed in 24 hours. Apply now!" : "Applications close soon. Apply now!"}
            </span>
            <Button color="primary" size="sm">
                Apply Now →
            </Button>
        </div>
    );
};
