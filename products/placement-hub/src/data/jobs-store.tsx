import { Bell01 } from "@untitledui/icons";
import { useSyncExternalStore } from "react";
import { getStatusConfig } from "@/components/status-badge";
import { JOBS as INITIAL_JOBS } from "@/data/jobs";
import { notificationsStore } from "@/data/notifications-store";
import { APPLICATION_MESSAGE_BY_STATUS } from "@/lib/application-messages";
import { appToday } from "@/lib/app-clock";
import type { ApplicationStatus } from "@/types/application";
import type { Job } from "@/types/job";

// A tiny external store (not context/redux) so the handful of places that read the job list —
// Jobs board, My Applications, the JD page's "another job already has an offer" check, the QA ops
// simulator — all see the same live array after a mutation, without prop-drilling `jobs` through App.
let jobs: Job[] = INITIAL_JOBS;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const today = () => appToday().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const jobsStore = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot: () => jobs,
    applyToJob: (jobId: string) => {
        jobsStore.setApplicationStatus(jobId, "applied");
    },
    // Simulates the placement ops team moving an application to a new stage — used by both the
    // "Apply" flow (-> applied) and the QA simulator (any stage -> any other stage). Every change
    // also raises a live notification (bell + toast), the same way a real status-change event would.
    setApplicationStatus: (jobId: string, status: ApplicationStatus) => {
        const job = jobs.find((candidate) => candidate.id === jobId);
        if (!job) return;

        jobs = jobs.map((candidate) =>
            candidate.id === jobId
                ? {
                      ...candidate,
                      applicationStatus: status,
                      applicationMessage: APPLICATION_MESSAGE_BY_STATUS[status],
                      applicationDate: candidate.applicationDate ?? today(),
                      applicationLastUpdate: "Updated just now",
                  }
                : candidate,
        );
        notify();

        notificationsStore.push({
            avatar: job.logoSrc ? { kind: "logo", src: job.logoSrc } : { kind: "icon", icon: Bell01, bgClassName: "bg-blue-dark-600" },
            message:
                status === "offer_received" ? (
                    <>
                        You've received an offer for <b>{job.role}</b> at <b>{job.companyName}</b>.
                    </>
                ) : (
                    <>
                        Your application for <b>{job.role}</b> at <b>{job.companyName}</b> is now <b>{getStatusConfig(status).label}</b>.
                    </>
                ),
            jobId: job.id,
        });
    },
    // Same transition as setApplicationStatus(jobId, "offer_declined"), but also stashes the reason
    // captured in RejectOfferModal's form so the "offer rejected" JD page can show it back.
    rejectOffer: (jobId: string, reason: string, details: string) => {
        jobs = jobs.map((candidate) => (candidate.id === jobId ? { ...candidate, offerRejectionReason: reason, offerRejectionDetails: details } : candidate));
        jobsStore.setApplicationStatus(jobId, "offer_declined");
    },
    // Withdraws the application entirely, returning the job to the Jobs board — mirrors what
    // happened manually to the offer_received/offer_accepted/disqualified fixture jobs earlier.
    removeApplication: (jobId: string) => {
        jobs = jobs.map((job) => {
            if (job.id !== jobId) return job;
            const { applicationStatus: _status, applicationMessage: _message, applicationDate: _date, applicationLastUpdate: _lastUpdate, ...rest } = job;
            return rest;
        });
        notify();
    },
};

export const useJobs = () => useSyncExternalStore(jobsStore.subscribe, jobsStore.getSnapshot);
