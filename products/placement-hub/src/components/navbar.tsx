import { Backpack, LayoutAlt01, StickerCircle } from "@untitledui/icons";
import { motion } from "motion/react";
import { TopBar } from "@/components/top-bar";
import { Tooltip } from "@/components/tooltip";
import { cx } from "@/utils/cx";

export type NavTab = "home" | "jobs" | "resources";

const PILL_TRANSITION = { type: "spring" as const, stiffness: 400, damping: 35 };

const TABS: Array<{ key: NavTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { key: "home", label: "Home", icon: LayoutAlt01 },
    { key: "jobs", label: "Jobs", icon: Backpack },
    { key: "resources", label: "Resources", icon: StickerCircle },
];

interface NavbarProps {
    /** null on pages that live under the navbar but aren't one of its tabs (e.g. the Interest Form). */
    active: NavTab | null;
    onNavigate?: (tab: NavTab) => void;
    onNavigateProfile: () => void;
    onNavigateJob?: (jobId: string) => void;
    /** False on focused task pages (the Interest Form) that shouldn't offer the Home/Jobs/Resources tabs. */
    showTabs?: boolean;
}

export const Navbar = ({ active, onNavigate, onNavigateProfile, onNavigateJob, showTabs = true }: NavbarProps) => {
    if (!showTabs) {
        return (
            <div className="sticky top-0 z-10 w-full bg-gray-25 max-md:contents">
                <TopBar onNavigateProfile={onNavigateProfile} onNavigateJob={onNavigateJob} />
            </div>
        );
    }

    return (
        <div className="sticky top-0 z-10 flex w-full flex-col bg-gray-25 max-md:contents">
            <TopBar onNavigateProfile={onNavigateProfile} onNavigateJob={onNavigateJob} />

            <div className="flex w-full items-center justify-center gap-2 px-[120px] py-4 max-xl:px-8 max-md:sticky max-md:top-0 max-md:z-10 max-md:bg-gray-25 max-md:px-4 max-md:py-2">
                <div className="flex w-full max-w-[1400px] flex-1 items-center gap-2 max-md:gap-1 max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
                    {TABS.map((tab) => {
                        const isActive = tab.key === active;

                        if (tab.key === "resources") {
                            return (
                                <Tooltip key={tab.key} label="Coming soon">
                                    <button
                                        type="button"
                                        onClick={(e) => e.preventDefault()}
                                        aria-disabled="true"
                                        tabIndex={-1}
                                        className="flex cursor-not-allowed items-center gap-2 rounded-3xl px-6 py-3 text-base font-semibold text-gray-400 max-md:shrink-0 max-md:px-4 max-md:py-2.5 max-[380px]:px-3 max-[380px]:text-sm"
                                    >
                                        <tab.icon className="size-6" />
                                        {tab.label}
                                    </button>
                                </Tooltip>
                            );
                        }

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => onNavigate?.(tab.key)}
                                className="group relative flex items-center gap-2 rounded-3xl px-6 py-3 text-base font-semibold max-md:shrink-0 max-md:px-4 max-md:py-2.5 max-[380px]:px-3 max-[380px]:text-sm"
                            >
                                {isActive && <motion.span layoutId="navbar-active-pill" transition={PILL_TRANSITION} className="absolute inset-0 rounded-3xl bg-blue-dark-800" />}
                                <span
                                    className={cx(
                                        "relative z-10 flex items-center gap-2 transition-colors duration-150",
                                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600",
                                        tab.key === "jobs" && !isActive && "text-gray-500",
                                    )}
                                >
                                    <tab.icon className="size-6" />
                                    {tab.label}
                                </span>
                                {tab.key === "jobs" && <span className="absolute top-3 right-3 z-10 size-1 rounded-full bg-yellow-400 max-md:top-2.5 max-md:right-2.5" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
