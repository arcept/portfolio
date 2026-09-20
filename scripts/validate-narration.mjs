#!/usr/bin/env node
// Validates the Placement Hub narration data before it ships. `npm run validate:narration`
//
//   node scripts/validate-narration.mjs [--narration <narration.json>] [--script <script.json>] [--page <sections.js>]
//
// Exits 1 on any error. Warnings (e.g. no tool to measure the mp3) don't fail it. The rules live in
// components/narration/validate.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateNarration } from '../components/narration/validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));

const narrationPath = path.resolve(root, args.narration ?? 'public/case-studies/placement-hub/narration/narration.json');
const scriptPath = path.resolve(root, args.script ?? 'docs/narration/script.json');
const pagePath = path.resolve(root, args.page ?? 'app/case-study-placement/sections.js');

const narration = JSON.parse(fs.readFileSync(narrationPath, 'utf8'));
const script = fs.existsSync(scriptPath) ? JSON.parse(fs.readFileSync(scriptPath, 'utf8')) : undefined;

// The page's section ids, read from its source: <Section id="problem" …>.
const pageIds = fs.existsSync(pagePath) ? [...new Set([...fs.readFileSync(pagePath, 'utf8').matchAll(/\bid="([A-Za-z][\w-]*)"/g)].map((m) => m[1]))] : undefined;

// Measure the audio: ffprobe if there is one, otherwise macOS's afinfo, otherwise skip (with a warning).
function audioDuration(file) {
  if (!fs.existsSync(file)) return undefined;
  try {
    return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }));
  } catch {
    /* no ffprobe */
  }
  try {
    const match = execFileSync('afinfo', [file], { encoding: 'utf8' }).match(/estimated duration:\s*([\d.]+)/);
    return match ? parseFloat(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

const audioPath = path.join(path.dirname(narrationPath), narration.audio);
const duration = audioDuration(audioPath);
const { errors, warnings } = validateNarration(narration, { script, pageIds, audioDuration: duration });

console.log(`narration: ${path.relative(root, narrationPath)}  (${narration.engine}, ${narration.voice}, ${narration.duration}s)`);
if (duration !== undefined) console.log(`audio:     ${path.relative(root, audioPath)}  (${duration.toFixed(3)}s measured)`);
if (pageIds) console.log(`page ids:  ${pageIds.join(', ')}`);
for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`ERROR:   ${e}`);
console.log(errors.length ? `\n${errors.length} error(s)` : '\nnarration data is valid');
process.exit(errors.length ? 1 : 0);
