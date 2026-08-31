import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ToastHost } from "@/components/application/toast/toast";
import { DashboardSalesHead } from "@/pages/dashboard-sales-head";
import { DealDetail } from "@/pages/deal-detail";
import { DealsList } from "@/pages/deals-list";
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

createRoot(document.getElementById("root")!).render(
    <StrictMode>
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
    </StrictMode>,
);
