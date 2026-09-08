import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

/** Figma's subtle diagonal sheen — layered over `--color-bg-primary` rather than Figma's own
 * hardcoded `#0A0A0A` fallback so it still adapts to light mode instead of only ever matching
 * the dark-mode export. Global across every screen (Home included), not just Deals. */
const GRADIENT_BACKGROUND = "linear-gradient(123deg, rgba(255, 255, 255, 0.04) 0%, rgba(153, 153, 153, 0.02) 77.43%), var(--color-bg-primary)";

/** The one shell every screen in the app renders inside — sidebar + content container. Extracted
 * out of the dashboard page (which used to inline this) so every screen shares it instead of
 * copy-pasting the layout. */
export const AppShell = ({ children }: { children: ReactNode }) => (
    <div className="flex min-h-dvh" style={{ background: GRADIENT_BACKGROUND }}>
        <DashboardSidebar />

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-8">
            <div className="mx-auto flex max-w-360 flex-col gap-8">{children}</div>
        </main>
    </div>
);
