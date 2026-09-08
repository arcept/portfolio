import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import { ToastHost } from "@/components/application/toast/toast";
import { DashboardSalesHead } from "@/pages/dashboard-sales-head";
import { DealDetail } from "@/pages/deal-detail";
import { DealsList } from "@/pages/deals-list";
import type { EmbedViewKey } from "@/pages/embed-view";
import { EmbedView } from "@/pages/embed-view";
import { HomeScreen } from "@/pages/home-screen";
import { NotFound } from "@/pages/not-found";
import { DealsProvider } from "@/providers/deals-provider";
import { RoleProvider } from "@/providers/role-provider";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

// Hash-based routing rather than `BrowserRouter` — this app is embedded as a plain static
// file at /case-studies/oms/rebuild/index.html with no server-side rewrites available, so a
// hard refresh on a deep route (e.g. /deals/DL-2216) requested the literal nested path and
// 500'd wherever the host couldn't resolve a file with that name. Since the fragment after
// `#` never reaches the server, every refresh just re-requests index.html itself.
const EMBED_VIEW_KEYS: EmbedViewKey[] = ["admin-funnel", "team-manager-funnel", "team-drilldown", "stat-cards", "sales-funnel"];

// A plain query param, not a route: the host page requests this exact same
// index.html on a static file server (no server-side rewrites available
// for a nested path), so routing has to resolve from something a single
// static file naturally receives on any direct load — a query string does.
const embedView = new URLSearchParams(window.location.search).get("embed") as EmbedViewKey | null;
const resolvedEmbedView = embedView && EMBED_VIEW_KEYS.includes(embedView) ? embedView : null;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {resolvedEmbedView ? (
            <EmbedView view={resolvedEmbedView} />
        ) : (
            <ThemeProvider>
                <RoleProvider>
                    <DealsProvider>
                        <HashRouter>
                            <RouteProvider>
                                <Routes>
                                    <Route path="/" element={<DashboardSalesHead />} />
                                    <Route path="/deals" element={<DealsList />} />
                                    <Route path="/deals/:dealId" element={<DealDetail />} />
                                    <Route path="/starter" element={<HomeScreen />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </RouteProvider>
                        </HashRouter>
                        <ToastHost />
                    </DealsProvider>
                </RoleProvider>
            </ThemeProvider>
        )}
    </StrictMode>,
);
