const fs = require("fs");
const path = require("path");

// Resolve everything relative to this file, not the caller's cwd, so
// `npm run build:oms` works the same whether invoked from the repo root
// or from inside this folder.
const SRC = __dirname;
const OUT_DIR = path.join(__dirname, "..", "..", "public", "case-studies", "oms");

const cssFiles = ["css/tokens.css", "css/base.css", "css/app.css"];
const jsFiles = [
  "js/data.js", "js/utils.js", "js/icons.js", "js/store.js",
  "js/components/charts.js", "js/components/nav.js", "js/components/funnel.js",
  "js/components/dashboard.js", "js/components/dealsList.js", "js/components/dealDetail.js",
  "js/components/offerWizard.js", "js/app.js"
];

const css = cssFiles.map(f => `/* === ${f} === */\n` + fs.readFileSync(path.join(SRC, f), "utf8")).join("\n\n");
const js = jsFiles.map(f => `/* === ${f} === */\n` + fs.readFileSync(path.join(SRC, f), "utf8")).join("\n\n");

// Self-hosted (Latin subset only) — avoids the external Google Fonts
// dependency, which caused intermittent load failures when embedded.
// Font files live in this folder's fonts/ (used by index.html for local
// preview) and are also copied to public/case-studies/oms/fonts/, which
// is where the built dist.html/embed.html actually resolve `url(fonts/...)`
// from once they're written there by this script.
const FONTS = `<style>
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 400 800; font-display: swap; src: url(fonts/Inter-normal-variable.woff2) format('woff2'); }
@font-face { font-family: 'Inter'; font-style: italic; font-weight: 400; font-display: swap; src: url(fonts/Inter-italic-400.woff2) format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; font-display: swap; src: url(fonts/IBMPlexMono-400.woff2) format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 500; font-display: swap; src: url(fonts/IBMPlexMono-500.woff2) format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 600; font-display: swap; src: url(fonts/IBMPlexMono-600.woff2) format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 700; font-display: swap; src: url(fonts/IBMPlexMono-700.woff2) format('woff2'); }
</style>`;

const BODY = `<a class="skip-link" href="#main">Skip to content</a>

<div id="app-view">
  <div class="mobile-topbar" id="mobile-topbar"></div>
  <div class="sidebar-scrim" id="sidebar-scrim"></div>
  <div class="app-shell">
    <aside class="sidebar" id="app-sidebar"></aside>
    <div class="app-main"><main id="app-content" role="main"></main></div>
  </div>
</div>`;

// ---- standalone build (published as the Artifact) ----
const standalone = `<meta charset="utf-8" />
<title>OMS Prototype</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FONTS}
<style>
${css}
</style>

${BODY}

<script>
${js}
</script>
`;

const distPath = path.join(OUT_DIR, "dist.html");
fs.writeFileSync(distPath, standalone);
console.log("Built", path.relative(process.cwd(), distPath), "—", (fs.statSync(distPath).size / 1024 / 1024).toFixed(2), "MB");

// ---- embedded build (meant to be loaded into an iframe inside the
// case study, fully isolated from the case study's own CSS/JS) ----
const embedded = `<!doctype html><html><head><meta charset="utf-8" />
<title>OMS</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FONTS}
<style>
${css}
html, body { height: 100%; }
</style>
</head><body>
${BODY}
<script>
${js}
</script>
</body></html>`;

const embedPath = path.join(OUT_DIR, "embed.html");
fs.writeFileSync(embedPath, embedded);
console.log("Built", path.relative(process.cwd(), embedPath), "—", (fs.statSync(embedPath).size / 1024 / 1024).toFixed(2), "MB");
