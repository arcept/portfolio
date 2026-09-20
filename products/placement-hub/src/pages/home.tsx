import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { AppliedJobCard } from "@/components/applied-job-card";
import { CompleteProfileNudge } from "@/components/complete-profile-nudge";
import { EligibilityBanner } from "@/components/eligibility-banner";
import { InterestFormBanner } from "@/components/interest-form-banner";
import { InterestFormSubmittedStrip } from "@/components/interest-form-submitted-strip";
import { MotivationFooter } from "@/components/motivation-footer";
import { Pagination } from "@/components/pagination";
import type { SortOption } from "@/components/sort-dropdown";
import { SortDropdown, sortApplications } from "@/components/sort-dropdown";
import { useInterestFormSubmission } from "@/data/interest-form-store";
import { useJobs } from "@/data/jobs-store";
import { useProfileComplete } from "@/data/profile-store";
import type { ApplicationStatus } from "@/types/application";
import heroIllustration from "@/assets/hero-illustration.png";

const PAGE_SIZE = 4;

// Applications that have run their course one way or another — no further ops action applies
// (see OPS_ACTIONS), so they move out of the live "My Applications" list into "Past Applications"
// instead of sitting alongside active ones. offer_received/offer_accepted are deliberately NOT
// here — those stay in "My Offers", a decision separate from this closed/active split.
const PAST_APPLICATION_STATUSES = new Set<ApplicationStatus>(["rejected", "disqualified", "offer_declined", "inactive"]);

// Same staggered wave-in as the Jobs board's cards (src/pages/jobs.tsx) — left with `initial`
// unset (defaults to true) so it also plays on first mount, matching the "animate in as the
// homepage loads" ask instead of only animating on later sort/page changes.
const cardVariants = {
    initial: { opacity: 0, y: 16 },
    animate: (index: number) => ({ opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30, delay: index * 0.08 } }),
    exit: { opacity: 0, y: -16, transition: { duration: 0.15 } },
};

// Page-level entrance — every top-level block (greeting, banner, nudge, section headers, footer)
// rises in one after another on mount. Deliberately wraps only the *headers* of the My
// Offers/My Applications sections rather than their card grids below: those grids already run
// their own per-card cascade via `cardVariants` above, and nesting that inside another
// opacity-masked parent would finish it invisibly behind the parent's own fade before the parent
// itself became visible.
const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

export interface HomeListState {
    sortBy: SortOption;
    page: number;
    pastSortBy: SortOption;
    pastPage: number;
}

interface HomeProps {
    state: HomeListState;
    onStateChange: (state: HomeListState) => void;
    onSelectJob: (jobId: string) => void;
    onNavigateProfile: () => void;
    onOpenInterestForm: () => void;
}

// The Home tab's unique content — rendered inside AppShell's animated left column.
// Navbar, the sidebar (Col 2), and the footer are owned by AppShell and stay static across tabs.
// Sort/page live in the parent (not local state) so they survive visiting a job's description
// page and coming back via "Back to Home Page".
export const Home = ({ state, onStateChange, onSelectJob, onNavigateProfile, onOpenInterestForm }: HomeProps) => {
    const { sortBy, page, pastSortBy, pastPage } = state;
    const jobs = useJobs();
    const interestSubmission = useInterestFormSubmission();
    const profileComplete = useProfileComplete();
    // Once an offer has been extended, the card moves out of the plain applications list into its
    // own "My Offers" section above it — an offer_received/offer_accepted job never appears twice.
    const offerJobs = useMemo(() => jobs.filter((job) => job.applicationStatus === "offer_received" || job.applicationStatus === "offer_accepted"), [jobs]);
    // Active vs. past is the same split OPS_ACTIONS uses to decide whether an application can still
    // move — anything with an action left (applied/shared/in_process) stays in My Applications;
    // anything terminal (rejected/disqualified/offer_declined/inactive) moves to Past Applications.
    const appliedJobs = useMemo(
        () => jobs.filter((job) => job.applicationStatus && !PAST_APPLICATION_STATUSES.has(job.applicationStatus) && job.applicationStatus !== "offer_received" && job.applicationStatus !== "offer_accepted"),
        [jobs],
    );
    const pastJobs = useMemo(() => jobs.filter((job) => job.applicationStatus && PAST_APPLICATION_STATUSES.has(job.applicationStatus)), [jobs]);
    const sortedOffers = useMemo(() => sortApplications(offerJobs, "newest"), [offerJobs]);

    const sorted = useMemo(() => sortApplications(appliedJobs, sortBy), [appliedJobs, sortBy]);
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const pastSorted = useMemo(() => sortApplications(pastJobs, pastSortBy), [pastJobs, pastSortBy]);
    const pastTotalPages = Math.ceil(pastSorted.length / PAGE_SIZE);
    const pastVisible = pastSorted.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE);

    const handleSortChange = (value: SortOption) => onStateChange({ ...state, sortBy: value, page: 1 });
    const handlePageChange = (value: number) => onStateChange({ ...state, page: value });
    const handlePastSortChange = (value: SortOption) => onStateChange({ ...state, pastSortBy: value, pastPage: 1 });
    const handlePastPageChange = (value: number) => onStateChange({ ...state, pastPage: value });

    return (
        <motion.div className="flex w-full flex-col items-start gap-6" variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={sectionVariants} className="flex w-full flex-col gap-10 rounded-2xl px-2 py-4">
                <div className="flex w-full items-center gap-6 max-md:gap-3">
                    <div className="flex flex-1 flex-col gap-2">
                        <p className="text-2xl font-semibold text-gray-cool-900">Hi Manik Madaan</p>
                        <p className="text-2xl leading-8 font-semibold text-blue-dark-700 max-md:text-xl max-md:leading-7">
                            Welcome to Your Career Gateway!
                            <br />
                            Find all your placement related updates here!
                        </p>
                    </div>
                    <img src={heroIllustration} alt="" className="h-28 w-auto shrink-0 object-contain max-md:h-16" />
                </div>
            </motion.div>

            <motion.div variants={sectionVariants} className="w-full">
                <EligibilityBanner />
            </motion.div>

            <motion.div variants={sectionVariants} className="w-full">
                {interestSubmission ? (
                    <InterestFormSubmittedStrip submittedAt={interestSubmission.submittedAt} onReview={onOpenInterestForm} />
                ) : (
                    <InterestFormBanner onFillForm={onOpenInterestForm} />
                )}
            </motion.div>

            {!profileComplete && (
                <motion.div variants={sectionVariants} className="w-full">
                    <CompleteProfileNudge onNavigateProfile={onNavigateProfile} />
                </motion.div>
            )}

            {sortedOffers.length > 0 && (
                <div className="flex w-full flex-col gap-6 py-6">
                    <motion.div variants={sectionVariants} className="flex w-full items-center gap-2 px-4 py-2">
                        <p className="text-2xl font-semibold text-gray-cool-900">My Offers</p>
                        <span className="flex size-8 items-center justify-center rounded-xl bg-gray-cool-100 text-base font-semibold text-gray-cool-800">
                            {String(sortedOffers.length).padStart(2, "0")}
                        </span>
                    </motion.div>

                    <div className="flex w-full flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {sortedOffers.map((job, index) => (
                                <motion.div key={job.id} layout custom={index} variants={cardVariants} initial="initial" animate="animate" exit="exit">
                                    <AppliedJobCard job={job} onSelect={onSelectJob} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <div className="flex w-full flex-col gap-6 py-6">
                <motion.div variants={sectionVariants} className="flex w-full items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-semibold text-gray-cool-900">My Applications</p>
                        <span className="flex size-8 items-center justify-center rounded-xl bg-gray-cool-100 text-base font-semibold text-gray-cool-800">{appliedJobs.length}</span>
                    </div>
                    <SortDropdown value={sortBy} onChange={handleSortChange} />
                </motion.div>

                <div className="flex w-full flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {visible.map((job, index) => (
                            <motion.div key={job.id} layout custom={index} variants={cardVariants} initial="initial" animate="animate" exit="exit">
                                <AppliedJobCard job={job} onSelect={onSelectJob} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
            </div>

            {pastJobs.length > 0 && (
                <div className="flex w-full flex-col gap-6 py-6">
                    <motion.div variants={sectionVariants} className="flex w-full items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-semibold text-gray-cool-900">Past Applications</p>
                            <span className="flex size-8 items-center justify-center rounded-xl bg-gray-cool-100 text-base font-semibold text-gray-cool-800">{pastJobs.length}</span>
                        </div>
                        <SortDropdown value={pastSortBy} onChange={handlePastSortChange} />
                    </motion.div>

                    <div className="flex w-full flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {pastVisible.map((job, index) => (
                                <motion.div key={job.id} layout custom={index} variants={cardVariants} initial="initial" animate="animate" exit="exit">
                                    <AppliedJobCard job={job} onSelect={onSelectJob} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <Pagination page={pastPage} totalPages={pastTotalPages} onChange={handlePastPageChange} />
                </div>
            )}

            <motion.div variants={sectionVariants} className="w-full">
                <MotivationFooter />
            </motion.div>
        </motion.div>
    );
};
