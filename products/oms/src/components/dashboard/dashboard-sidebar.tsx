import type { FC, ReactNode } from "react";
import { AlignCenter, Codepen, CreditCardCheck, Heading02, LetterSpacing01 } from "@untitledui/icons";
import { Link as AriaLink } from "react-aria-components";
import { useLocation } from "react-router";
import { NavAccountCard } from "@/components/application/app-navigation/base-components/nav-account-card";
import { MobileNavigationHeader } from "@/components/application/app-navigation/base-components/mobile-header";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { openDealCount } from "@/data/deals-data";
import { useDeals } from "@/providers/deals-provider";
import { usePersona } from "@/providers/role-provider";
import { ROLE_LABELS } from "@/types/role";
import { getPersonaLabel } from "@/data/dashboard-data";
import { cx } from "@/utils/cx";
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

type SidebarNavItemProps = {
    label: string;
    href?: string;
    icon: FC<{ className?: string }>;
    badge?: ReactNode;
    active?: boolean;
    /** No route exists behind it yet — Payments/Form/Content (Figma node 404:6283). Dimmed,
     * non-navigating, and explains why on hover rather than just vanishing or 404ing. */
    disabled?: boolean;
};

/** Plain dark pill, no dot — Figma's own nav-item badge (node 489:10683), distinct from the
 * app's usual `BadgeWithDot`. */
const SidebarNavBadge = ({ children }: { children: ReactNode }) => (
    <span className="shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-secondary shadow-xs">{children}</span>
);

/** One row of the primary nav list (Figma node 404:6283) — a 4px accent bar (brand purple in
 * light mode, gray in dark — `fg-brand-secondary_alt` already carries that swap) that's only
 * visible on the active item, then icon + label + optional badge. Three depths of emphasis:
 * active (full opacity, filled pill, accent bar), enabled-but-inactive (60% opacity, e.g. Home
 * when Deals is open), and disabled (40% opacity, regular instead of medium weight, not-allowed
 * cursor, "Coming soon" on hover — not the native `disabled` attribute, since anchors don't
 * support one and this keeps it hoverable for the tooltip regardless).
 *
 * The accent bar sits outside the link/tooltip trigger — for a disabled item the link itself
 * only hugs the icon+label (no badge to justify stretching it full-width), so the tooltip
 * anchors right against the content you're actually hovering rather than the row's far right
 * edge, 200+px from the cursor. */
const SidebarNavItem = ({ label, href, icon: Icon, badge, active, disabled }: SidebarNavItemProps) => {
    const link = (
        <AriaLink
            href={disabled ? undefined : href}
            aria-disabled={disabled || undefined}
            className={cx(
                "flex items-center overflow-hidden rounded-lg px-1 py-[5px] outline-hidden transition duration-100 ease-linear",
                disabled ? "cursor-not-allowed" : "w-full flex-1 cursor-pointer",
                active ? "bg-primary_alt" : disabled ? "opacity-40" : "opacity-60 hover:bg-primary_hover hover:opacity-100",
            )}
        >
            <span className="flex flex-1 items-center gap-3 rounded-md p-2">
                <span className="flex min-w-0 items-center gap-2">
                    <Icon className="size-5 shrink-0 text-primary" />
                    <span className={cx("truncate text-md text-primary", disabled ? "font-normal" : "font-medium")}>{label}</span>
                </span>
                {badge}
            </span>
        </AriaLink>
    );

    return (
        <div className="flex h-[50px] w-full items-center gap-2">
            <span
                className={cx(
                    "h-full w-1 shrink-0 rounded-lg bg-fg-brand-secondary_alt transition-opacity duration-100 ease-linear",
                    active ? "opacity-100" : "opacity-0",
                )}
            />
            {disabled ? (
                <Tooltip title="Coming soon" placement="right">
                    {link}
                </Tooltip>
            ) : (
                link
            )}
        </div>
    );
};

export const DashboardSidebar = () => {
    const { persona } = usePersona();
    const { pathname } = useLocation();
    const { deals } = useDeals();

    const activeUrl = pathname.startsWith("/deals") ? "/deals" : pathname;
    const navItems: SidebarNavItemProps[] = [
        { label: "Home", href: "/", icon: Codepen },
        { label: "Deals", href: "/deals", icon: AlignCenter, badge: <SidebarNavBadge>{openDealCount(persona, deals)}</SidebarNavBadge> },
        { label: "Payments", icon: CreditCardCheck, disabled: true },
        { label: "Form", icon: LetterSpacing01, disabled: true },
        { label: "Content", icon: Heading02, disabled: true },
    ].map((item) => ({ ...item, active: !!item.href && item.href === activeUrl }));

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
                    // Figma's own diagonal sheen (node 404:6283), layered over `--color-bg-primary`
                    // rather than its hardcoded `#0A0A0A` fallback so it still adapts to light mode
                    // instead of only ever matching the dark-mode export.
                    background: "linear-gradient(97.04deg, rgba(255, 255, 255, 0.04) 0%, rgba(153, 153, 153, 0.02) 74.282%), var(--color-bg-primary)",
                } as React.CSSProperties
            }
            className="flex h-full w-full max-w-full flex-col justify-between overflow-auto lg:w-(--width) md:border-r border-secondary"
        >
            <div className="flex flex-col">
                <div className="flex flex-col gap-5 px-5 pt-8 pb-5">
                    <div className="flex items-center gap-3">
                        <img src={`${import.meta.env.BASE_URL}oms-icon.png`} alt="" className="size-8 shrink-0 rounded-lg" />
                        <div className="flex items-baseline gap-1">
                            <span className="text-md font-semibold text-primary">Order Management System</span>
                            <span className="text-xs text-tertiary opacity-60">v3.0</span>
                        </div>
                    </div>
                </div>

                <ul className="flex flex-col gap-1 px-4 pt-8 pb-16">
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <SidebarNavItem {...item} />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-2 pb-5">
                <div className="px-4 py-[5px]">
                    <div className="flex items-center justify-between gap-3 rounded-md p-2">
                        <span className="text-sm text-primary">Preview Theme</span>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="px-3">
                    <NavAccountCard items={[account]} selectedAccountId="manik" switchAccountSlot={<PreviewAsSwitcherSlot />} />
                </div>
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
