import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export type BreadcrumbItem = { label: string; href?: string };

/** A small two-item (or more) breadcrumb — the scaffold ships none (the only name match,
 * `dropdown-account-breadcrumb.tsx`, is an account switcher, not this). First one in the app;
 * meant to be reused by every screen after Deals. */
export const Breadcrumb = ({ items, className }: { items: BreadcrumbItem[]; className?: string }) => (
    <nav className={cx("flex items-center gap-1.5 text-sm", className)} aria-label="Breadcrumb">
        {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const content: ReactNode = item.href && !isLast ? (
                <Link to={item.href} className="text-tertiary transition duration-100 ease-linear hover:text-secondary">
                    {item.label}
                </Link>
            ) : (
                <span className={isLast ? "font-medium text-secondary" : "text-tertiary"}>{item.label}</span>
            );

            return (
                <span key={item.label} className="flex items-center gap-1.5">
                    {index > 0 && <ChevronRight className="size-3.5 text-fg-quaternary" />}
                    {content}
                </span>
            );
        })}
    </nav>
);
