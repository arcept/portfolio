import { Check, CheckCircle, SlashCircle01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface CriterionRowProps {
    title: string;
    children: React.ReactNode;
    met: boolean;
}

const CriterionRow = ({ title, children, met }: CriterionRowProps) => (
    <div className="relative pl-8">
        <span className={cx("absolute top-6 left-0 flex size-5 items-center justify-center rounded-full", met ? "bg-success-solid" : "bg-neutral-300")}>
            {met ? <Check className="size-3 stroke-[3px] text-white" /> : <SlashCircle01 className="size-3 text-white" />}
        </span>
        <div className="rounded-xl bg-secondary_subtle p-5">
            <h4 className="mb-3 text-base font-semibold text-primary">{title}</h4>
            {children}
        </div>
    </div>
);

type EligibilityVariant = "eligible_complete" | "eligible_incomplete" | "not_eligible";

interface EligibilityCriteriaPanelProps {
    variant: EligibilityVariant;
}

const HEADER: Record<EligibilityVariant, { description: string; badge: string; badgeClassName: string }> = {
    eligible_complete: {
        description: "You have successfully met the eligibilty criteria. Now celebrate and wait patiently for new jobs to start hoping up.",
        badge: "Eligible",
        badgeClassName: "bg-success-primary text-success-primary",
    },
    eligible_incomplete: {
        description: "You have successfully met the eligibility criteria. Now complete your profile to be able to apply to new jobs.",
        badge: "Profile Incomplete",
        badgeClassName: "bg-warning-primary text-warning-primary",
    },
    not_eligible: {
        description: "Ensure you meet the following criteria to unlock amazing career opportunities:",
        badge: "Not Eligible",
        badgeClassName: "bg-error-primary text-error-primary",
    },
};

// Matches hub-eligible-complete.png / hub-eligible-incomplete.png / hub-not-eligible.png — one
// shell, three data variants (credits, profile sub-statuses, evaluation day met or not).
export const EligibilityCriteriaPanel = ({ variant }: EligibilityCriteriaPanelProps) => {
    const header = HEADER[variant];
    const creditsMet = variant !== "not_eligible";
    const evalMet = variant !== "not_eligible";

    return (
        <div className="rounded-2xl border border-secondary bg-primary p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-primary">Eligibility Criteria for Placement Services</h3>
                    <p className="mt-1 text-sm text-tertiary">{header.description}</p>
                </div>
                <span className={cx("flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-medium", header.badgeClassName)}>
                    {variant === "not_eligible" ? <SlashCircle01 className="size-4" /> : <CheckCircle className="size-4" />}
                    {header.badge}
                </span>
            </div>

            <div className="flex flex-col gap-6">
                <CriterionRow title={creditsMet ? "Credit Requirement met" : "Credit Requirement unmet"} met={creditsMet}>
                    <div className="flex items-start justify-between gap-4">
                        <p className="max-w-xs text-sm text-tertiary">Through a combination of Learn Mode, Capstone Project, and Evaluation Day.</p>
                        <div className="w-40 shrink-0 text-right">
                            <p className="text-lg font-semibold text-primary">
                                {creditsMet ? 984 : 284} <span className="text-sm font-normal text-tertiary">/ 1500</span>
                            </p>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                                <div className={cx("h-full rounded-full", creditsMet ? "bg-success-solid" : "bg-neutral-500")} style={{ width: creditsMet ? "66%" : "19%" }} />
                            </div>
                            <p className="mt-1 text-xs text-tertiary">Eligible at 700 credits</p>
                        </div>
                    </div>
                </CriterionRow>

                {variant === "eligible_complete" && (
                    <CriterionRow title="Profile Completed" met>
                        <div className="flex flex-col gap-2.5">
                            {["Personal & Professional Details", "Resume Submission", "Portfolio Upload"].map((label) => (
                                <div key={label} className="flex items-center justify-between border-b border-dashed border-secondary pb-2.5 last:border-0 last:pb-0">
                                    <span className="text-sm text-secondary">{label}</span>
                                    <span className="rounded-full bg-success-solid px-2.5 py-0.5 text-xs font-medium text-white">Complete</span>
                                </div>
                            ))}
                        </div>
                    </CriterionRow>
                )}

                {variant === "eligible_incomplete" && (
                    <CriterionRow title="Complete Your Profile Now!" met={false}>
                        <div className="flex flex-col gap-2.5">
                            {[
                                { label: "Personal & Professional Details", tag: "Attention Needed", tagClassName: "bg-warning-solid text-white" },
                                { label: "Resume Submission", tag: "Complete", tagClassName: "bg-success-solid text-white" },
                                { label: "Portfolio Upload", tag: "Post Capstone", tagClassName: "bg-utility-blue-100 text-utility-blue-700" },
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between border-b border-dashed border-secondary pb-2.5 last:border-0 last:pb-0">
                                    <span className="text-sm text-secondary">{row.label}</span>
                                    <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-medium", row.tagClassName)}>{row.tag}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-secondary p-3">
                            <span className="text-sm text-brand-secondary">Enhance your chances by completing your profile</span>
                            <button type="button" className="text-sm font-semibold text-primary">
                                My Profile ↗
                            </button>
                        </div>
                    </CriterionRow>
                )}

                {variant === "not_eligible" && (
                    <CriterionRow title="Profile Incomplete" met={false}>
                        <div className="flex flex-col gap-2.5">
                            {[
                                { label: "Personal & Professional Details", tag: "Attention Needed", tagClassName: "bg-neutral-200 text-secondary" },
                                { label: "Resume Submission", tag: "Complete", tagClassName: "bg-neutral-200 text-secondary" },
                                { label: "Portfolio Upload", tag: "Post Capstone", tagClassName: "bg-neutral-200 text-secondary" },
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between border-b border-dashed border-secondary pb-2.5 last:border-0 last:pb-0">
                                    <span className="text-sm text-secondary">{row.label}</span>
                                    <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-medium", row.tagClassName)}>{row.tag}</span>
                                </div>
                            ))}
                        </div>
                    </CriterionRow>
                )}

                <CriterionRow title={evalMet ? "Evaluation day succeeded" : "Evaluation day absent"} met={evalMet}>
                    <p className="max-w-lg text-sm text-tertiary">
                        Your final review is crucial. This day marks the culmination of your hard work throughout the course and plays a significant role in your eligibility for placement
                        assistance."
                    </p>
                </CriterionRow>
            </div>

            <div className="my-6 border-t border-secondary" />

            <p className="text-sm font-semibold text-primary">Your career success is our priority. Stay focused, stay prepared!</p>
            <p className="mt-1 text-sm text-tertiary">At Novatr, we stand for cultivating exceptional professionals. It's about your growth journey, not a race. Let's grow together, purposefully. 🚀</p>
        </div>
    );
};
