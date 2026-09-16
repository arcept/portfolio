import { Check, CheckCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface CriterionRowProps {
    title: string;
    children: React.ReactNode;
    complete: boolean;
}

const CriterionRow = ({ title, children, complete }: CriterionRowProps) => (
    <div className="relative pl-8">
        <span
            className={cx(
                "absolute top-6 left-0 flex size-5 items-center justify-center rounded-full",
                complete ? "bg-success-solid" : "bg-neutral-200",
            )}
        >
            <Check className="size-3 stroke-[3px] text-white" />
        </span>
        <div className="rounded-xl bg-secondary_subtle p-5">
            <h4 className="mb-3 text-base font-semibold text-primary">{title}</h4>
            {children}
        </div>
    </div>
);

interface EligibilityCriteriaPanelProps {
    profileComplete: boolean;
}

// Matches hub-eligible-complete.png — the not-eligible/incomplete states swap in different
// values/badges per-row but reuse this same shell (built when those screens come up).
export const EligibilityCriteriaPanel = ({ profileComplete }: EligibilityCriteriaPanelProps) => {
    return (
        <div className="rounded-2xl border border-secondary bg-primary p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-primary">Eligibility Criteria for Placement Services</h3>
                    <p className="mt-1 text-sm text-tertiary">You have successfully met the eligibilty criteria. Now celebrate and wait patiently for new jobs to start hoping up.</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-primary px-3 py-1 text-sm font-medium text-success-primary">
                    <CheckCircle className="size-4" />
                    Eligible
                </span>
            </div>

            <div className="flex flex-col gap-6 border-l border-dashed border-warning-primary pl-0 [&>div]:border-l-0">
                <CriterionRow title="Credit Requirement met" complete>
                    <div className="flex items-start justify-between gap-4">
                        <p className="max-w-xs text-sm text-tertiary">Through a combination of Learn Mode, Capstone Project, and Evaluation Day.</p>
                        <div className="w-40 shrink-0 text-right">
                            <p className="text-lg font-semibold text-primary">
                                984 <span className="text-sm font-normal text-tertiary">/ 1500</span>
                            </p>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                                <div className="h-full rounded-full bg-success-solid" style={{ width: "66%" }} />
                            </div>
                            <p className="mt-1 text-xs text-tertiary">Eligible at 700 credits</p>
                        </div>
                    </div>
                </CriterionRow>

                <CriterionRow title="Profile Completed" complete={profileComplete}>
                    <div className="flex flex-col gap-2.5">
                        {["Personal & Professional Details", "Resume Submission", "Portfolio Upload"].map((label) => (
                            <div key={label} className="flex items-center justify-between border-b border-dashed border-secondary pb-2.5 last:border-0 last:pb-0">
                                <span className="text-sm text-secondary">{label}</span>
                                <span className="rounded-full bg-success-solid px-2.5 py-0.5 text-xs font-medium text-white">Complete</span>
                            </div>
                        ))}
                    </div>
                </CriterionRow>

                <CriterionRow title="Evaluation day succeeded" complete>
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
