import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { PROTOTYPE_TODAY } from "@/data/dashboard-data";
import { DEALS } from "@/data/deals-data";
import type { Deal } from "@/data/deals-data";

interface DealsContextType {
    deals: Deal[];
    updateDeal: (id: string, patch: Partial<Deal>) => void;
    /** Appends an activity-log entry to a deal without otherwise changing it — the read-only
     * counterpart to `updateDeal` for actions that are purely "this happened", not a field
     * change (e.g. an EMI re-approval request). */
    logActivity: (id: string, text: string, reason?: string | null) => void;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export const useDeals = (): DealsContextType => {
    const context = useContext(DealsContext);
    if (context === undefined) {
        throw new Error("useDeals must be used within a DealsProvider");
    }
    return context;
};

/** Same shape as `RoleProvider`/`ThemeProvider` — the roster is generated once (module-level, in
 * deals-data.ts) and this just wraps it in React state so mutations (`setDealStatus`, activity
 * log entries, the wizard's submit) actually re-render instead of silently mutating a module-
 * level array React never sees. */
export const DealsProvider = ({ children }: { children: ReactNode }) => {
    const [deals, setDeals] = useState<Deal[]>(DEALS);

    const updateDeal = useCallback((id: string, patch: Partial<Deal>) => {
        setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, lastUpdate: PROTOTYPE_TODAY } : d)));
    }, []);

    const logActivity = useCallback((id: string, text: string, reason?: string | null) => {
        setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, activityLog: [...d.activityLog, { ts: PROTOTYPE_TODAY, text, reason: reason ?? null }] } : d)));
    }, []);

    return <DealsContext.Provider value={{ deals, updateDeal, logActivity }}>{children}</DealsContext.Provider>;
};
