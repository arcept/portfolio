import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    // The build's output is synced into the portfolio at this exact subpath
    // (public/case-studies/oms/rebuild/) and served from there, not from the
    // site root — without this, the built index.html references /assets/...
    // instead of /case-studies/oms/rebuild/assets/..., which 404s wherever
    // the site's own root doesn't happen to have an assets/ folder.
    base: "/case-studies/oms/rebuild/",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
