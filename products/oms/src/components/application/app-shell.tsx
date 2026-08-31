import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

/** The one shell every screen in the app renders inside — sidebar + content container. Extracted
 * out of the dashboard page (which used to inline this) so the Deals screens share it instead of
 * copy-pasting the layout. */
export const AppShell = ({ children }: { children: ReactNode }) => (
    <div className="flex min-h-dvh bg-primary">
        <DashboardSidebar />

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-8">
            <div className="mx-auto flex max-w-360 flex-col gap-8">{children}</div>
        </main>
    </div>
);
