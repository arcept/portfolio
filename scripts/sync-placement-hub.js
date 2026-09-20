// Copies products/placement-hub's built output into
// public/case-studies/placement-hub/prototype/, where the Placement Hub case
// study embeds it in an iframe. Run via `npm run build:placement-hub`, which
// builds products/placement-hub first. Mirrors scripts/sync-oms-rebuild.js.
//
// Plain fs, no shell commands — cpSync/rmSync are portable.

const fs = require('fs');
const path = require('path');

const SOURCE_DIST = path.join(__dirname, '..', 'products', 'placement-hub', 'dist');
const TARGET_DIR = path.join(__dirname, '..', 'public', 'case-studies', 'placement-hub', 'prototype');

if (!fs.existsSync(SOURCE_DIST)) {
  console.error(`✗ ${SOURCE_DIST} doesn't exist — did the products/placement-hub build run first?`);
  process.exit(1);
}

fs.rmSync(TARGET_DIR, { recursive: true, force: true });
fs.cpSync(SOURCE_DIST, TARGET_DIR, { recursive: true });

console.log(`✓ Synced ${path.relative(process.cwd(), SOURCE_DIST)} -> ${path.relative(process.cwd(), TARGET_DIR)}`);
