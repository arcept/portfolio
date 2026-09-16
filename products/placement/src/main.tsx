import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import type { EmbedViewKey } from "@/pages/embed-view";
import { EmbedView } from "@/pages/embed-view";
import { NotFound } from "@/pages/not-found";
import { Walkthrough } from "@/pages/walkthrough";
import { RouteProvider } from "@/providers/router-provider";
import "@/styles/globals.css";

// Same pattern as products/oms: a plain query param (not a route) resolved here, since this app
// is embedded as a static file with no server-side rewrites for a nested path.
const EMBED_VIEW_KEYS: EmbedViewKey[] = ["walkthrough", "scenario-01", "scenario-02", "scenario-03", "scenario-04"];

const embedView = new URLSearchParams(window.location.search).get("embed") as EmbedViewKey | null;
const resolvedEmbedView = embedView && EMBED_VIEW_KEYS.includes(embedView) ? embedView : null;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {resolvedEmbedView ? (
            <EmbedView view={resolvedEmbedView} />
        ) : (
            <HashRouter>
                <RouteProvider>
                    <Routes>
                        <Route path="/" element={<Walkthrough />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </RouteProvider>
            </HashRouter>
        )}
    </StrictMode>,
);
