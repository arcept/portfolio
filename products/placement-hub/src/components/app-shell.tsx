import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { FaqCard } from "@/components/faq-card";
import type { NavTab } from "@/components/navbar";
import { Navbar } from "@/components/navbar";
import { NeedHelpCard } from "@/components/need-help-card";
import { SelfPlacementCard } from "@/components/self-placement-card";
import { SiteFooter } from "@/components/site-footer";

const CONTENT_TRANSITION = { type: "spring" as const, stiffness: 300, damping: 32 };

// Col 2's own entrance stagger — independent of Col 1's slide transition above (different element,
// different trigger: Col 2 never unmounts across Home<->Jobs, so this only plays on first mount and
// whenever AppShell itself remounts, e.g. returning here from My Profile or a job's JD page).
const sidebarContainerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const sidebarCardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

// direction: 1 = navigating forward (Home -> Jobs), -1 = navigating back (Jobs -> Home).
// The entering page always slides in from the direction of travel while the outgoing page
// slides out the opposite way, so the two reverse cleanly into each other.
const slideVariants = {
    enter: (direction: 1 | -1) => ({ opacity: 0, x: direction * 56 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: 1 | -1) => ({ opacity: 0, x: direction * -56 }),
};

interface AppShellProps {
    active: Extract<NavTab, "home" | "jobs"> | null;
    direction: 1 | -1;
    onNavigate: (tab: NavTab) => void;
    onNavigateProfile: () => void;
    onNavigateJob?: (jobId: string) => void;
    /** False hides the Home/Jobs/Resources tab row (the Interest Form is a focused task page). */
    showTabs?: boolean;
    children: ReactNode;
}

// Navbar, the sidebar (Col 2), and the footer are mounted once here and never unmount when
// switching between Home and Jobs — only the left column (passed in as `children`) swaps.
export const AppShell = ({ active, direction, onNavigate, onNavigateProfile, onNavigateJob, showTabs = true, children }: AppShellProps) => {
    return (
        <div className="flex min-h-screen w-full flex-col items-start bg-gray-25">
            <Navbar active={active} onNavigate={onNavigate} onNavigateProfile={onNavigateProfile} onNavigateJob={onNavigateJob} showTabs={showTabs} />

            <div className="flex w-full flex-col items-center px-[120px] py-2 max-xl:px-8 max-md:px-4">
                <div className="flex w-full max-w-[1400px] items-start gap-6 max-lg:flex-col max-lg:items-stretch">
                    {/* Col 1 — animated, unique per tab */}
                    <div className="relative flex-1 overflow-clip max-lg:w-full max-lg:flex-none">
                        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                            <motion.div
                                key={active ?? "none"}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={CONTENT_TRANSITION}
                                className="flex w-full flex-col items-start gap-6 pb-20 max-lg:pb-6"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Col 2 — sidebar, stays static across tab switches */}
                    <motion.div
                        className="flex w-[440px] shrink-0 flex-col items-start gap-4 max-lg:w-full"
                        variants={sidebarContainerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.div variants={sidebarCardVariants} className="w-full">
                            <SelfPlacementCard />
                        </motion.div>
                        <motion.div variants={sidebarCardVariants} className="w-full">
                            <FaqCard />
                        </motion.div>
                        <motion.div variants={sidebarCardVariants} className="w-full">
                            <NeedHelpCard />
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <SiteFooter />
        </div>
    );
};
