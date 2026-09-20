import { cx } from "@/utils/cx";

export interface ProfileTab {
    id: string;
    label: string;
}

export const PROFILE_TABS: ProfileTab[] = [
    { id: "personal", label: "Personal" },
    { id: "professional-skills", label: "Professional Skills" },
    { id: "work-experience", label: "Work Experience" },
    { id: "education", label: "Education" },
    { id: "publications", label: "Publications" },
    { id: "certifications", label: "Certifications" },
];

interface ProfileTabsProps {
    active: string;
    onSelect: (id: string) => void;
}

// Scroll-spy tab bar — sticky under the page header, highlights whichever section is currently
// in view and jumps there on click. There's no per-tab content swap; it's one continuous page.
export const ProfileTabs = ({ active, onSelect }: ProfileTabsProps) => {
    return (
        <div className="sticky top-[132px] z-10 max-md:top-0 flex w-full items-center gap-2 overflow-x-auto rounded-lg bg-gray-cool-50 px-2 py-2">
            {PROFILE_TABS.map((tab, index) => (
                <div key={tab.id} className="flex shrink-0 items-center">
                    {index > 0 && <span className="mx-2 h-4 w-px bg-gray-200" />}
                    <button
                        type="button"
                        onClick={() => onSelect(tab.id)}
                        className={cx("flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap", active === tab.id ? "font-semibold text-black" : "text-gray-600 hover:text-gray-900")}
                    >
                        {active === tab.id && <span className="size-2 rounded-full bg-black" />}
                        {tab.label}
                    </button>
                </div>
            ))}
        </div>
    );
};
