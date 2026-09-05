import { BarChartSquare02, CreditCard01, Cube01, List, Settings01 } from "@untitledui/icons";
import { useLocation } from "react-router";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { MobileNavigationHeader } from "@/components/application/app-navigation/base-components/mobile-header";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { openDealCount } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { ROLE_LABELS } from "@/types/role";
import { getPersonaLabel } from "@/data/dashboard-data";
import { PreviewAsSwitcher } from "./preview-as-switcher";
import { ThemeToggle } from "./theme-toggle";

/** Matches the padding rhythm of the dropdown's other sections ("Switch account" originally) —
 * label inset at `px-3`, content inset at `px-3` too since the selects need more room than the
 * account-row buttons did. */
const PreviewAsSwitcherSlot = () => (
    <div className="px-3 pt-1.5 pb-1.5">
        <PreviewAsSwitcher />
    </div>
);

const SIDEBAR_WIDTH = 280;

export const DashboardSidebar = () => {
    const { persona } = usePersona();
    const { pathname } = useLocation();
    const { deals } = useDeals();

    const navItems: NavItemType[] = [
        { label: "Home", href: "/", icon: Cube01 },
        { label: "Deals", href: "/deals", icon: BarChartSquare02, badge: <BadgeWithDot color="success">{openDealCount(persona, deals)}</BadgeWithDot> },
        { label: "Payments", href: "/payments", icon: CreditCard01 },
        { label: "Content", href: "/content", icon: List },
    ];

    const account = {
        id: "manik",
        name: persona.role === "admin" ? "Manik Madaan" : getPersonaLabel(persona),
        email: persona.role === "admin" ? "Sales Head | Admin" : ROLE_LABELS[persona.role],
        avatar: "",
        initials:
            persona.role === "admin"
                ? "MM"
                : getPersonaLabel(persona)
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase(),
        status: "online" as const,
    };

    const content = (
        <aside
            style={
                {
                    "--width": `${SIDEBAR_WIDTH}px`,
                    background: "linear-gradient(156deg, rgba(255, 255, 255, 0.04) 0%, rgba(153, 153, 153, 0.02) 36.69%), var(--color-bg-primary)",
                } as React.CSSProperties
            }
            className="flex h-full w-full max-w-full flex-col justify-between overflow-auto pt-4 lg:w-(--width) lg:pt-5 md:border-r border-secondary"
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

            <NavList items={navItems} activeUrl={pathname.startsWith("/deals") ? "/deals" : pathname} />

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

                <NavAccountCard items={[account]} selectedAccountId="manik" switchAccountSlot={<PreviewAsSwitcherSlot />} />
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
