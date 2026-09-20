import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import type { NavTab } from "@/components/navbar";
import { NotificationToastHost } from "@/components/notification-toast";
import { QaOpsSimulator } from "@/components/qa-ops-simulator";
import { useJobs } from "@/data/jobs-store";
import type { HomeListState } from "@/pages/home";
import { Home } from "@/pages/home";
import { InterestForm } from "@/pages/interest-form";
import { JobDescription } from "@/pages/job-description";
import type { JobsListState } from "@/pages/jobs";
import { Jobs } from "@/pages/jobs";
import { Profile } from "@/pages/profile";
import { Resources } from "@/pages/resources";

const TAB_ORDER: Record<NavTab, number> = { home: 0, jobs: 1, resources: 2 };

// Cross-fade between top-level "pages" (the tabbed AppShell, a JD page, My Profile) — distinct
// from AppShell's own Home<->Jobs slide, which stays untouched since it's a different transition
// (tab order direction, not a page navigation).
const VIEW_TRANSITION = { type: "spring" as const, stiffness: 300, damping: 32 };
const viewVariants = {
    enter: { opacity: 0, y: 12 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

interface NavState {
    active: NavTab;
    direction: 1 | -1;
}

// Which list a job was opened from — decides the JD page's back-button label/destination
// ("Back to Jobs" vs "Back to Home Page") independent of `nav.active`, which never actually
// changes when opening a job (both lists live under their own tab and stay the active tab).
type JobSource = "jobs" | "home";

export const App = () => {
    const jobs = useJobs();
    const [nav, setNav] = useState<NavState>({ active: "home", direction: 1 });
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedJobSource, setSelectedJobSource] = useState<JobSource>("jobs");
    const [showProfile, setShowProfile] = useState(false);
    const [showInterestForm, setShowInterestForm] = useState(false);
    // Lifted out of Jobs/Home so filter/sort/page survive a "view job -> Back" round trip.
    const [jobsListState, setJobsListState] = useState<JobsListState>({ filter: "all", sortBy: "relevance", page: 1 });
    const [homeListState, setHomeListState] = useState<HomeListState>({ sortBy: "newest", page: 1, pastSortBy: "newest", pastPage: 1 });

    const navigate = (tab: NavTab) => {
        setShowInterestForm(false);
        setSelectedJobId(null);
        setNav((prev) => ({ active: tab, direction: TAB_ORDER[tab] >= TAB_ORDER[prev.active] ? 1 : -1 }));
    };

    const selectJobFrom = (source: JobSource) => (jobId: string) => {
        setSelectedJobSource(source);
        setSelectedJobId(jobId);
    };

    const selectedJob = selectedJobId ? jobs.find((job) => job.id === selectedJobId) : undefined;

    // A notification (bell panel or toast) can be clicked from anywhere — Profile, Resources, mid
    // Home/Jobs tab — so this overrides whatever page-level state would otherwise keep showing:
    // drops out of Profile, steers off the resources tab (which would otherwise take precedence
    // over the job selection below), then opens the JD page like any other job selection.
    const handleNotificationNavigateJob = (jobId: string) => {
        setShowProfile(false);
        setShowInterestForm(false);
        setNav((prev) => (prev.active === "resources" ? { ...prev, active: "home" } : prev));
        selectJobFrom("home")(jobId);
    };

    // Only the page *type* participates in the key — e.g. selecting a different job, or switching
    // tabs within AppShell, must NOT retrigger this transition (those have their own animations).
    const viewKey = showProfile ? "profile" : showInterestForm ? "interest-form" : selectedJob ? "job" : nav.active === "resources" ? "resources" : "shell";

    // Views are swapped in place (no real route change), so the browser keeps whatever scroll offset
    // the page we just left had — e.g. coming back from the bottom of a long form to a Home page
    // that then opens scrolled halfway down. Every view change should land at the top. Layout
    // effect + instant so there's never a frame at the stale offset. (Selecting a different job
    // while already on a JD page doesn't change viewKey, hence selectedJobId.)
    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [viewKey, selectedJobId, nav.active]);

    let content: ReactNode;
    if (showProfile) {
        content = <Profile onBack={() => setShowProfile(false)} onNavigateJob={handleNotificationNavigateJob} />;
    } else if (showInterestForm) {
        content = (
            <InterestForm onBack={() => setShowInterestForm(false)} onNavigate={navigate} onNavigateProfile={() => setShowProfile(true)} onNavigateJob={handleNotificationNavigateJob} />
        );
    } else if (nav.active === "resources") {
        content = <Resources onNavigate={navigate} onNavigateProfile={() => setShowProfile(true)} onNavigateJob={handleNotificationNavigateJob} />;
    } else if (selectedJob) {
        const backLabel = selectedJobSource === "home" ? "Back to Home Page" : "Back to Jobs";
        content = (
            <JobDescription
                job={selectedJob}
                backLabel={backLabel}
                onBack={() => setSelectedJobId(null)}
                onViewApplications={() => navigate("home")}
                onViewMoreJobs={() => navigate("jobs")}
                onNavigateProfile={() => setShowProfile(true)}
                onNavigateJob={handleNotificationNavigateJob}
            />
        );
    } else {
        content = (
            <AppShell active={nav.active} direction={nav.direction} onNavigate={navigate} onNavigateProfile={() => setShowProfile(true)} onNavigateJob={handleNotificationNavigateJob}>
                {nav.active === "jobs" ? (
                    <Jobs state={jobsListState} onStateChange={setJobsListState} onSelectJob={selectJobFrom("jobs")} />
                ) : (
                    <Home state={homeListState} onStateChange={setHomeListState} onSelectJob={selectJobFrom("home")} onNavigateProfile={() => setShowProfile(true)} onOpenInterestForm={() => setShowInterestForm(true)} />
                )}
            </AppShell>
        );
    }

    return (
        <>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={viewKey} variants={viewVariants} initial="enter" animate="center" exit="exit" transition={VIEW_TRANSITION}>
                    {content}
                </motion.div>
            </AnimatePresence>
            <NotificationToastHost onNavigateJob={handleNotificationNavigateJob} />
            <QaOpsSimulator currentJobId={selectedJob?.id} />
        </>
    );
};
