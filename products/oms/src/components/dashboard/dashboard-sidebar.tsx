import { BarChartSquare02, CreditCard01, Cube01, List, Settings01 } from "@untitledui/icons";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { MobileNavigationHeader } from "@/components/application/app-navigation/base-components/mobile-header";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ThemeToggle } from "./theme-toggle";

const navItems: NavItemType[] = [
    { label: "Home", href: "/", icon: Cube01 },
    { label: "Deals", href: "/deals", icon: BarChartSquare02, badge: <BadgeWithDot color="success">235</BadgeWithDot> },
    { label: "Payments", href: "/payments", icon: CreditCard01 },
    { label: "Content", href: "/content", icon: List },
];

const account = {
    id: "manik",
    name: "Manik Madaan",
    email: "Sales Head | Admin",
    avatar: "",
    initials: "MM",
    status: "online" as const,
};

const SIDEBAR_WIDTH = 280;

export const DashboardSidebar = () => {
    const content = (
        <aside
            style={{ "--width": `${SIDEBAR_WIDTH}px` } as React.CSSProperties}
            className="flex h-full w-full max-w-full flex-col justify-between overflow-auto bg-primary pt-4 lg:w-(--width) lg:pt-5 md:border-r border-secondary"
        >
            <div className="flex flex-col gap-5 px-4 lg:px-5">
                <div className="flex items-center gap-2">
                    <img src={`${import.meta.env.BASE_URL}oms-icon.png`} alt="" className="size-8 shrink-0 rounded-lg" />
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-primary">Order Management System</span>
                        <span className="text-xs text-tertiary">v3.0</span>
                    </div>
                </div>
            </div>

            <NavList items={navItems} activeUrl="/" />

            <div className="mt-auto flex flex-col gap-3 px-4 py-4 lg:py-5">
                <ul className="flex flex-col">
                    <li className="py-px">
                        <NavItemBase type="link" href="/settings" icon={Settings01}>
                            Settings
                        </NavItemBase>
                    </li>
                </ul>

                <div className="flex items-center justify-between border-t border-secondary pt-5">
                    <span className="text-xs font-medium text-quaternary">Preview theme</span>
                    <ThemeToggle />
                </div>

                <NavAccountCard items={[account]} selectedAccountId="manik" />
            </div>
        </aside>
    );

    return (
        <>
            <MobileNavigationHeader>{content}</MobileNavigationHeader>

            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex">{content}</div>

            <div style={{ paddingLeft: SIDEBAR_WIDTH }} className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block" />
        </>
    );
};
