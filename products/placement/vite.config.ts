import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    // Synced into the portfolio at this exact subpath (public/case-studies/placement/prototype/)
    // and served from there — see products/oms/vite.config.ts for why this must match exactly.
    base: "/case-studies/placement/prototype/",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
