import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
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

// When built for a subpath deployment (e.g. embedded as a static file at
// /case-studies/oms/rebuild/index.html), the host serves this app at the
// literal `index.html` path rather than resolving a directory index — so
// the router's basename must include it too, or root-route matching fails.
const basename = import.meta.env.BASE_URL === "/" ? "/" : `${import.meta.env.BASE_URL}index.html`;

const EMBED_VIEW_KEYS: EmbedViewKey[] = ["admin-funnel", "team-manager-funnel", "team-drilldown", "stat-cards"];

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
                        <BrowserRouter basename={basename}>
                            <RouteProvider>
                                <Routes>
                                    <Route path="/" element={<DashboardSalesHead />} />
                                    <Route path="/deals" element={<DealsList />} />
                                    <Route path="/deals/:dealId" element={<DealDetail />} />
                                    <Route path="/starter" element={<HomeScreen />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </RouteProvider>
                        </BrowserRouter>
                        <ToastHost />
                    </DealsProvider>
                </RoleProvider>
            </ThemeProvider>
        )}
    </StrictMode>,
);
