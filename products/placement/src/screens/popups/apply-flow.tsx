import { AlertTriangle, Check, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Modal } from "@/components/product/modal";
import type { Job } from "@/state/learner-state";

// react-aria's Button always renders a real, focusable, role="button" element regardless of
// tabIndex/aria-hidden overrides (it manages both internally via its own filterDOMProps, which
// silently drops what it doesn't recognize) — confirmed by inspecting the rendered DOM after those
// overrides had no effect. These 3 modal buttons happen to read "Next"/"Back"/"Cancel"/"Confirm
// Apply", which — for "Next" and "Back" specifically — is the exact same accessible name as the
// walkthrough chrome's real Back/Next controls (components/chrome/step-controls.tsx), so a plain
// span keeps the reference's visual without a real second interactive element to collide with.
const DecorativeButton = ({ variant, children }: { variant: "secondary" | "brand"; children: React.ReactNode }) => (
    <span
        className={
            variant === "brand"
                ? "rounded-lg bg-brand-solid px-3.5 py-2.5 text-sm font-semibold text-white"
                : "rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-secondary shadow-xs ring-1 ring-primary ring-inset"
        }
    >
        {children}
    </span>
);

const ProgressDots = ({ step }: { step: 1 | 2 | 3 }) => (
    <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 w-10 rounded-full ${i <= step ? "bg-brand-solid" : "bg-neutral-200"}`} />
        ))}
    </div>
);

const ConfirmRow = ({ label, value, warn }: { label: string; value: string; warn?: boolean }) => (
    <div className="flex items-center justify-between text-sm">
        <span className="text-tertiary">{label}</span>
        <span className="flex items-center gap-1.5 font-medium text-primary">
            {value}
            {warn ? <AlertTriangle className="size-4 text-warning-primary" /> : <Check className="size-4 rounded-full bg-success-solid p-0.5 text-white" />}
        </span>
    </div>
);

// Step 1 — plain (no location issue). Reference: popup-apply-confirm.png
export const PopupApplyConfirm = ({ job }: { job: Job }) => (
    <Modal>
        <h3 className="text-lg font-semibold text-primary">Confirm Job Application</h3>
        <p className="mt-1 text-sm text-tertiary">
            Are you sure you want to apply for {job.role} at {job.company}
        </p>
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-secondary p-4">
            <div className="flex items-center gap-2 border-b border-secondary pb-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{job.company.charAt(0)}</span>
                <div>
                    <p className="text-sm font-semibold text-primary">{job.company}</p>
                    <p className="text-xs text-tertiary">{job.role}</p>
                </div>
            </div>
            <ConfirmRow label="Degree" value={job.degree} />
            <ConfirmRow label="Experience" value="Urban Planning" />
            <ConfirmRow label={`Location`} value={`${job.location}, ${job.workType}`} />
        </div>
        <div className="mt-5 flex items-center justify-between">
            <DecorativeButton variant="secondary">Cancel</DecorativeButton>
            <ProgressDots step={1} />
            <DecorativeButton variant="brand">Next</DecorativeButton>
        </div>
    </Modal>
);

// Step 1 — location mismatch variant. Reference: popup-apply-location-mismatch.png
export const PopupApplyLocationMismatch = ({ job, preferredLocation }: { job: Job; preferredLocation: string }) => (
    <Modal>
        <h3 className="text-lg font-semibold text-primary">Confirm Job Application</h3>
        <p className="mt-1 text-sm text-tertiary">
            Are you sure you want to apply for {job.role} at {job.company}
        </p>
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-secondary p-4">
            <div className="flex items-center gap-2 border-b border-secondary pb-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{job.company.charAt(0)}</span>
                <div>
                    <p className="text-sm font-semibold text-primary">{job.company}</p>
                    <p className="text-xs text-tertiary">{job.role}</p>
                </div>
            </div>
            <ConfirmRow label="Degree" value={job.degree} />
            <ConfirmRow label="Experience" value="Urban Planning" />
            <ConfirmRow label="Location" value={`${job.location}, ${job.workType}`} warn />
            <div className="rounded-lg bg-warning-primary p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-warning-primary">
                    <AlertTriangle className="size-4" />
                    Location mismatch
                </p>
                <p className="mt-0.5 text-sm text-warning-primary">This job isn't in your preferred location - {preferredLocation}</p>
            </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
            <DecorativeButton variant="secondary">Cancel</DecorativeButton>
            <ProgressDots step={1} />
            <DecorativeButton variant="brand">Next</DecorativeButton>
        </div>
    </Modal>
);

// Step 2 — policy reminder, shown regardless of location match. Reference: popup-apply-policy-reminder.png
export const PopupApplyPolicyReminder = ({ job }: { job: Job }) => (
    <Modal>
        <h3 className="text-lg font-semibold text-primary">Confirm Job Application</h3>
        <p className="mt-1 text-sm text-tertiary">
            Are you sure you want to apply for {job.role} at {job.company}
        </p>
        <div className="mt-4 rounded-xl bg-brand-secondary p-4">
            <p className="text-sm font-semibold text-brand-secondary">Placement policy reminder</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-tertiary">
                <li>By applying to this opening, you are marking interest in the role.</li>
                <li>Based on your profile and matchmaking with the role your profile will be forwarded to the company</li>
                <li>By applying to this position it is assumed you have read clearly through the requirements and agree to the role, job location requirements.</li>
            </ul>
        </div>
        <div className="mt-5 flex items-center justify-between">
            <DecorativeButton variant="secondary">Back</DecorativeButton>
            <ProgressDots step={2} />
            <DecorativeButton variant="brand">Confirm Apply</DecorativeButton>
        </div>
    </Modal>
);

// Step 3 — success. Reference: popup-apply-success.png
export const PopupApplySuccess = () => (
    <Modal>
        <div className="flex flex-col items-center py-2 text-center">
            <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-warning-primary text-warning-primary">
                <Send01 className="size-7 -rotate-12" />
            </span>
            <h3 className="text-lg font-semibold text-primary">Your job application has been submitted successfully</h3>
            <p className="mt-2 max-w-xs text-sm text-tertiary">We have received your application successfully for review to be shared with the recruiters. You can track your application under the 'My Applications' tab in the Hub.</p>
            <button type="button" className="mt-3 text-sm font-semibold text-brand-secondary underline">
                View Applications
            </button>
            <Button color="brand" size="md" className="mt-4 w-full">
                View more jobs
            </Button>
        </div>
    </Modal>
);
