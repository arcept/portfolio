import { Check, Send01, Star01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Modal } from "@/components/product/modal";
import type { Job } from "@/state/learner-state";

// Step 1 — confirm accept. Reference: popup-accept-confirm.png
export const PopupAcceptConfirm = ({ job }: { job: Job }) => (
    <Modal>
        <h3 className="text-lg font-semibold text-primary">Confirm Job Offer</h3>
        <p className="mt-1 text-sm text-tertiary">
            Are you sure you want to accept the offer for a {job.role} at {job.company}
        </p>
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-secondary p-4">
            <div className="flex items-center gap-2 border-b border-secondary pb-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{job.company.charAt(0)}</span>
                <div>
                    <p className="text-sm font-semibold text-primary">{job.company}</p>
                    <p className="text-xs text-tertiary">{job.role}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-tertiary">Location</span>
                <span className="flex items-center gap-1.5 font-medium text-primary">
                    {job.location}, {job.workType}
                    <Check className="size-4 rounded-full bg-success-solid p-0.5 text-white" />
                </span>
            </div>
        </div>
        <Button color="brand" size="md" className="mt-5 w-full justify-center">
            Accept Offer
        </Button>
        <div className="mt-4 flex items-center justify-between border-t border-secondary pt-4">
            <div>
                <p className="text-sm font-semibold text-primary">Having some issue with the offer?</p>
                <p className="text-sm text-tertiary">Let us know, We will try to improve</p>
            </div>
            <button type="button" className="text-sm font-semibold text-brand-secondary">
                Contact us
            </button>
        </div>
    </Modal>
);

const CELEBRATION_HEADER = (job: Job) => (
    <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex size-16 items-center justify-center rounded-full bg-warning-primary text-2xl">🏆</span>
        <h3 className="text-lg font-semibold text-brand-secondary">
            Congratulations 🎉🎉
            <br />
            You've accepted offer from {job.company}
        </h3>
    </div>
);

// Step 2 — congrats + empty rating stars. Reference: popup-offer-accepted-a.png
export const PopupOfferAccepted1 = ({ job }: { job: Job }) => (
    <Modal>
        {CELEBRATION_HEADER(job)}
        <div className="mt-5 flex items-center justify-between border-t border-secondary pt-5">
            <p className="text-sm font-semibold text-primary">Rate your experience</p>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star01 key={i} className="size-5 text-neutral-300" />
                ))}
            </div>
        </div>
    </Modal>
);

// Step 3 — rating selected, review textarea appears. Reference: popup-offer-accepted-b.png
export const PopupOfferAccepted2 = ({ job }: { job: Job }) => (
    <Modal>
        {CELEBRATION_HEADER(job)}
        <div className="mt-5 flex items-center justify-between border-t border-secondary pt-5">
            <p className="text-sm font-semibold text-primary">Rate your experience</p>
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <Star01 key={i} className="size-5 fill-warning-solid text-warning-solid" />
                ))}
                <Star01 className="size-5 text-neutral-300" />
            </div>
        </div>
        <div className="mt-4">
            <p className="mb-1.5 text-sm font-medium text-primary">Add detailed Review</p>
            <textarea className="w-full rounded-lg border border-primary p-3 text-sm text-secondary" rows={3} placeholder="Enter a description..." />
        </div>
        <Button color="brand" size="md" className="mt-4 w-full justify-center">
            Submit
        </Button>
    </Modal>
);

// Step 4 — redirecting, loading. Reference: popup-offer-accepted-c.png
export const PopupOfferAccepted3 = ({ job }: { job: Job }) => (
    <Modal>
        {CELEBRATION_HEADER(job)}
        <div className="mt-5 flex flex-col items-center gap-2 border-t border-secondary pt-5 text-center">
            <p className="text-sm text-tertiary">Redirecting back to home in 10s...</p>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                Click here to go to home →
            </button>
            <div className="mt-2 size-6 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-solid" />
        </div>
    </Modal>
);

// Step 5 — redirecting + thank you feedback received. Reference: popup-offer-accepted-d.png
export const PopupOfferAccepted4 = ({ job }: { job: Job }) => (
    <Modal>
        {CELEBRATION_HEADER(job)}
        <div className="mt-5 flex flex-col items-center gap-2 border-t border-secondary pt-5 text-center">
            <p className="text-sm text-tertiary">Redirecting back to home in 10s...</p>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                Click here to go to home →
            </button>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                <Send01 className="size-4 text-warning-solid" />
                Thank you Feedback Recieved
            </p>
        </div>
    </Modal>
);
