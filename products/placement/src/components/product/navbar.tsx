import { ChevronDown } from "@untitledui/icons";
import { cx } from "@/utils/cx";

// Fixed Novatr brand blue for the logo/active-tab — separate from the Purple "brand" token, which
// is reserved for modal/popup accents (see button.tsx). Approximate hex pending a pixel-level check
// against the reference screens during the fidelity pass.
export const NOVATR_BLUE = "#1570EF";

export type NavTab = "home" | "jobs" | "applications";

interface NavbarProps {
    active: NavTab;
    userName: string;
    /** Focus mode (placed) or restricted (declined-invalid) subdues Jobs/My Applications. */
    variant?: "default" | "subdued" | "locked";
    jobsHasUpdate?: boolean;
    breadcrumbColor?: "blue" | "dark";
}

const TABS: Array<{ key: NavTab; label: string }> = [
    { key: "home", label: "Home" },
    { key: "jobs", label: "Jobs" },
    { key: "applications", label: "My Applications" },
];

export const Navbar = ({ active, userName, variant = "default", jobsHasUpdate, breadcrumbColor = "blue" }: NavbarProps) => {
    const isLocked = variant === "locked";
    const isSubdued = variant === "subdued";

    return (
        <div className="border-b border-secondary bg-primary">
            <div className="flex h-16 items-center justify-between px-8">
                <div className="flex items-center gap-1.5 text-lg font-bold">
                    <span style={{ color: NOVATR_BLUE }}>NOVATR</span>
                    <span className="font-normal text-quaternary">/</span>
                    <span className={breadcrumbColor === "blue" ? "font-medium" : "font-medium text-primary"} style={breadcrumbColor === "blue" ? { color: NOVATR_BLUE } : undefined}>
                        Placement Hub
                    </span>
                </div>
                <button type="button" className="flex items-center gap-1.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-secondary">{userName.charAt(0)}</span>
                    <span className="text-sm font-medium text-secondary">{userName}</span>
                    <ChevronDown className="size-4 text-quaternary" />
                </button>
            </div>
            <div className="flex items-center gap-1 bg-secondary px-8 py-3">
                {TABS.map((tab) => {
                    const isActive = tab.key === active;
                    const tabIsLocked = isLocked && tab.key !== "home";
                    const tabIsSubdued = isSubdued && tab.key !== "home";

                    return (
                        <div key={tab.key} className="relative">
                            <button
                                type="button"
                                disabled={tabIsLocked}
                                className={cx(
                                    "rounded-full px-4 py-1.5 text-sm font-medium transition duration-100 ease-linear",
                                    isActive ? "text-white" : "text-tertiary hover:text-secondary",
                                    tabIsLocked && "cursor-not-allowed opacity-50",
                                    tabIsSubdued && !isActive && "opacity-60",
                                )}
                                style={isActive ? { backgroundColor: NOVATR_BLUE } : undefined}
                            >
                                {tab.label}
                                {tab.key === "jobs" && jobsHasUpdate && !tabIsLocked && <span className="ml-1 inline-block size-1.5 rounded-full bg-warning-solid align-super" />}
                            </button>
                            {tabIsLocked && <span className="absolute top-full left-1/2 -translate-x-1/2 pt-0.5 text-[10px] font-medium tracking-wide text-quaternary uppercase">Locked</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
