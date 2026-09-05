import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

/** Figma's subtle diagonal sheen for the Deals screens (list + detail) — layered over
 * `--color-bg-primary` rather than Figma's own hardcoded `#0A0A0A` fallback so it still adapts
 * to light mode instead of only ever matching the dark-mode export. */
const GRADIENT_BACKGROUND = "linear-gradient(123deg, rgba(255, 255, 255, 0.04) 0%, rgba(153, 153, 153, 0.02) 77.43%), var(--color-bg-primary)";

/** The one shell every screen in the app renders inside — sidebar + content container. Extracted
 * out of the dashboard page (which used to inline this) so the Deals screens share it instead of
 * copy-pasting the layout. `background` defaults to the plain dashboard look; Deals screens opt
 * into the gradient explicitly rather than it becoming the app-wide default. */
export const AppShell = ({ children, background = "default" }: { children: ReactNode; background?: "default" | "gradient" }) => (
    <div className={`flex min-h-dvh ${background === "default" ? "bg-primary" : ""}`} style={background === "gradient" ? { background: GRADIENT_BACKGROUND } : undefined}>
        <DashboardSidebar />

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-8">
            <div className="mx-auto flex max-w-360 flex-col gap-8">{children}</div>
        </main>
    </div>
);
