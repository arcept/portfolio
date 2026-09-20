import { Beaker01, XClose } from "@untitledui/icons";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { interestFormStore, useInterestFormSubmission } from "@/data/interest-form-store";
import { useJobs, jobsStore } from "@/data/jobs-store";
import { profileStore, useProfileComplete } from "@/data/profile-store";
import { OPS_ACTIONS } from "@/lib/ops-actions";
import { cx } from "@/utils/cx";

interface QaOpsSimulatorProps {
    /** The job currently open on the JD page, if any — lets the tool default to "whatever I'm
     *  looking at" instead of an arbitrary first-in-list application. */
    currentJobId?: string;
}

// Dev-only tool (not part of the product UI a learner would see) for simulating the placement ops
// team advancing/rejecting an application without needing a real backend — lets QA exercise every
// tracker/CTA/status-banner state on demand instead of hand-editing fixture data each time.
export const QaOpsSimulator = ({ currentJobId }: QaOpsSimulatorProps) => {
    const [open, setOpen] = useState(false);
    const jobs = useJobs();
    const profileComplete = useProfileComplete();
    const interestSubmitted = !!useInterestFormSubmission();
    const appliedJobs = useMemo(() => jobs.filter((job) => job.applicationStatus), [jobs]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // Whenever the JD page you're looking at is itself an applied job, snap the simulator to it —
    // re-runs on every navigation, but a manual pick from the dropdown still sticks until the next
    // time you land on a different applied job's JD page.
    useEffect(() => {
        if (currentJobId && appliedJobs.some((job) => job.id === currentJobId)) {
            setSelectedJobId(currentJobId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentJobId]);

    const selectedJob = appliedJobs.find((job) => job.id === selectedJobId) ?? appliedJobs[0];
    const actions = selectedJob?.applicationStatus ? OPS_ACTIONS[selectedJob.applicationStatus] : undefined;

    return (
        <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-3 max-md:right-3 max-md:bottom-3">
            {open && (
                <div className="flex w-96 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-card-lg)] max-md:max-h-[70dvh] max-md:w-[calc(100vw-24px)] max-md:overflow-y-auto">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Beaker01 className="size-5 text-purple-700" />
                            <p className="text-base font-semibold text-gray-900">QA: Ops Simulator</p>
                        </div>
                        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex size-7 items-center justify-center rounded-lg hover:bg-gray-50">
                            <XClose className="size-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">My Profile</span>
                            <span className="text-sm font-semibold text-gray-900">{profileComplete ? "Complete" : "Incomplete"}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => (profileComplete ? profileStore.resetProfile() : profileStore.completeProfile())}
                            className={cx(
                                "rounded-lg px-3 py-2 text-xs font-semibold",
                                profileComplete ? "border border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-purple-800 text-white hover:bg-purple-700",
                            )}
                        >
                            {profileComplete ? "Reset to Incomplete" : "Complete Profile"}
                        </button>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Placement Interest Form</span>
                            <span className="text-sm font-semibold text-gray-900">{interestSubmitted ? "Submitted" : "Not submitted"}</span>
                        </div>
                        <button
                            type="button"
                            disabled={!interestSubmitted}
                            onClick={() => interestFormStore.reset()}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Reset form
                        </button>
                    </div>

                    {appliedJobs.length === 0 ? (
                        <p className="text-sm text-gray-500">No active applications right now — apply to a job first, then come back here to simulate ops actions on it.</p>
                    ) : (
                        <>
                            <label className="flex w-full flex-col gap-1">
                                <span className="text-xs font-semibold text-gray-500">Application</span>
                                <select
                                    value={selectedJob?.id}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                                >
                                    {appliedJobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.companyName} — {job.role}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {selectedJob?.applicationStatus && (
                                <div className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                    <span className="text-xs font-medium text-gray-500">Current status</span>
                                    <StatusBadge status={selectedJob.applicationStatus} />
                                </div>
                            )}

                            <div className="flex w-full flex-col gap-2">
                                {actions && actions.length > 0 ? (
                                    actions.map((action) => (
                                        <button
                                            key={action.next}
                                            type="button"
                                            onClick={() => selectedJob && jobsStore.setApplicationStatus(selectedJob.id, action.next)}
                                            className={cx(
                                                "w-full rounded-lg px-4 py-2 text-sm font-semibold",
                                                action.tone === "primary" ? "bg-purple-800 text-white hover:bg-purple-700" : "border border-error-600 text-error-600 hover:bg-error-25",
                                            )}
                                        >
                                            {action.label}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">This application has reached a terminal state — no further ops actions apply.</p>
                                )}
                            </div>

                            <div className="flex w-full items-center gap-2 border-t border-gray-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => selectedJob && jobsStore.setApplicationStatus(selectedJob.id, "applied")}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Reset to Applied
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectedJob && jobsStore.removeApplication(selectedJob.id)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Withdraw (back to board)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle QA ops simulator"
                className="flex size-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-[var(--shadow-card-lg)] hover:bg-gray-800"
            >
                <Beaker01 className="size-5" />
            </button>
        </div>
    );
};
