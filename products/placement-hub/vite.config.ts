import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
    // The production build is synced into the portfolio and served from this subpath
    // (public/case-studies/placement-hub/prototype/), not from a site root — without it the built
    // index.html would request /assets/... and 404. Only `build` needs it: `vite` (dev) keeps "/"
    // so the dev URL stays http://localhost:5173/.
    base: command === "build" ? "/case-studies/placement-hub/prototype/" : "/",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
