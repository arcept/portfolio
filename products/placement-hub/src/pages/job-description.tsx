import { ChevronLeft } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AcceptOfferModal } from "@/components/accept-offer-modal";
import { ApplicationTrackerCard } from "@/components/application-tracker-card";
import { ApplyModal } from "@/components/apply-modal";
import { CompanyAboutCard } from "@/components/company-about-card";
import { FaqCard } from "@/components/faq-card";
import { JobJdCard } from "@/components/job-jd-card";
import { JobOfferCard } from "@/components/job-offer-card";
import { JobOfferRejectedCard } from "@/components/job-offer-rejected-card";
import { RejectOfferModal } from "@/components/reject-offer-modal";
import { NeedHelpCard } from "@/components/need-help-card";
import { SelfPlacementCard } from "@/components/self-placement-card";
import { SidePanel } from "@/components/side-panel";
import { SiteFooter } from "@/components/site-footer";
import { TopBar } from "@/components/top-bar";
import { LEARNER } from "@/data/learner";
import { jobsStore, useJobs } from "@/data/jobs-store";
import { getCtaState } from "@/lib/cta-state";
import type { Job } from "@/types/job";

// Fade-and-stack entrance for the page's content blocks — each card rises in slightly after the
// one before it, so the page reads as settling into place rather than popping in all at once.
const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

interface JobDescriptionProps {
    job: Job;
    backLabel: string;
    onBack: () => void;
    onViewApplications: () => void;
    onViewMoreJobs: () => void;
    onNavigateProfile: () => void;
    onNavigateJob?: (jobId: string) => void;
}

export const JobDescription = ({ job, backLabel, onBack, onViewApplications, onViewMoreJobs, onNavigateProfile, onNavigateJob }: JobDescriptionProps) => {
    const jobs = useJobs();
    // The job prop can go stale the instant the apply flow marks it applied (the modal reads the
    // live store to re-render its own state) — re-resolve from the store so the CTA/tracker below
    // react to that change without needing App to re-select the job.
    const liveJob = jobs.find((candidate) => candidate.id === job.id) ?? job;
    const state = getCtaState(liveJob, LEARNER, jobs);
    const showsOffer = liveJob.applicationStatus === "offer_received";
    const showsRejectedOffer = liveJob.applicationStatus === "offer_declined";
    const showsSidePanel = state === "expired" || state === "irrelevant";
    const showsTracker = Boolean(liveJob.applicationStatus) && !showsOffer && !showsRejectedOffer;
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isAcceptOfferOpen, setIsAcceptOfferOpen] = useState(false);
    const [isRejectOfferOpen, setIsRejectOfferOpen] = useState(false);

    // Opening a JD page never causes a real route change, so the browser keeps whatever scrollY
    // the previous page (e.g. a scrolled-down My Applications list) was at instead of resetting it.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col items-start bg-gray-25">
            <div className="sticky top-0 z-10 flex w-full flex-col bg-gray-25 max-md:static">
                <TopBar onNavigateProfile={onNavigateProfile} onNavigateJob={onNavigateJob} />
                <div className="flex w-full items-center justify-center px-[120px] py-4 max-xl:px-8 max-md:px-4 max-md:py-2">
                    <div className="flex w-full max-w-[1400px] flex-1 items-center">
                        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-2 py-1 text-base font-semibold text-gray-cool-900 hover:bg-gray-50">
                            <ChevronLeft className="size-6" />
                            {backLabel}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-col items-center px-[120px] py-2 max-xl:px-8 max-md:px-4">
                <motion.div className="flex w-full max-w-[1400px] items-start gap-6 max-lg:flex-col max-lg:items-stretch" variants={containerVariants} initial="hidden" animate="show">
                    <div className="flex flex-1 flex-col items-start gap-6 pb-20 max-lg:flex-none max-lg:pb-2">
                        {showsOffer && (
                            <motion.div className="w-full" variants={cardVariants}>
                                <JobOfferCard job={liveJob} onRequestAccept={() => setIsAcceptOfferOpen(true)} onRequestReject={() => setIsRejectOfferOpen(true)} />
                            </motion.div>
                        )}
                        {showsRejectedOffer && (
                            <motion.div className="w-full" variants={cardVariants}>
                                <JobOfferRejectedCard job={liveJob} />
                            </motion.div>
                        )}
                        <motion.div className="w-full" variants={cardVariants}>
                            <JobJdCard job={liveJob} onApply={() => setIsApplyOpen(true)} showCta={!showsOffer && !showsRejectedOffer} />
                        </motion.div>
                        <motion.div className="w-full" variants={cardVariants}>
                            <CompanyAboutCard companyName={liveJob.companyName} />
                        </motion.div>
                    </div>

                    <div className="flex w-[440px] shrink-0 flex-col items-start gap-4 max-lg:w-full">
                        <motion.div className="w-full" variants={cardVariants}>
                            {showsTracker ? (
                                <ApplicationTrackerCard job={liveJob} />
                            ) : showsSidePanel ? (
                                <SidePanel job={liveJob} variant={state as "expired" | "irrelevant"} />
                            ) : (
                                <SelfPlacementCard />
                            )}
                        </motion.div>
                        <motion.div className="w-full" variants={cardVariants}>
                            <FaqCard />
                        </motion.div>
                        <motion.div className="w-full" variants={cardVariants}>
                            <NeedHelpCard />
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <SiteFooter />

            <AnimatePresence>
                {isApplyOpen && (
                    <ApplyModal
                        job={liveJob}
                        onClose={() => setIsApplyOpen(false)}
                        onViewApplications={() => {
                            setIsApplyOpen(false);
                            onViewApplications();
                        }}
                        onViewMoreJobs={() => {
                            setIsApplyOpen(false);
                            onViewMoreJobs();
                        }}
                    />
                )}
                {isAcceptOfferOpen && (
                    <AcceptOfferModal job={liveJob} onClose={() => setIsAcceptOfferOpen(false)} onConfirm={() => jobsStore.setApplicationStatus(liveJob.id, "offer_accepted")} />
                )}
                {isRejectOfferOpen && (
                    <RejectOfferModal job={liveJob} onClose={() => setIsRejectOfferOpen(false)} onConfirm={(reason, details) => jobsStore.rejectOffer(liveJob.id, reason, details)} />
                )}
            </AnimatePresence>
        </div>
    );
};
