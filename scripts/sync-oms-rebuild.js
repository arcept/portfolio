// Copies products/oms's built output into public/case-studies/oms/rebuild/,
// where the case study embeds it (both the full prototype and the isolated
// ?embed=<view> pieces — see products/oms/src/main.tsx). Run via
// `npm run build:oms-rebuild`, which builds products/oms first.
//
// Plain fs, no shell commands — cpSync/rmSync are portable and don't
// depend on a Unix shell being available.

const fs = require('fs');
const path = require('path');

const SOURCE_DIST = path.join(__dirname, '..', 'products', 'oms', 'dist');
const TARGET_DIR = path.join(__dirname, '..', 'public', 'case-studies', 'oms', 'rebuild');

if (!fs.existsSync(SOURCE_DIST)) {
  console.error(`✗ ${SOURCE_DIST} doesn't exist — did the products/oms build run first?`);
  process.exit(1);
}

fs.rmSync(TARGET_DIR, { recursive: true, force: true });
fs.cpSync(SOURCE_DIST, TARGET_DIR, { recursive: true });

console.log(`✓ Synced ${path.relative(process.cwd(), SOURCE_DIST)} -> ${path.relative(process.cwd(), TARGET_DIR)}`);
