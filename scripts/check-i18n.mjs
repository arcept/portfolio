#!/usr/bin/env node
// Checks each language's dictionaries against the keys the code asks for.
//
//   npm run check:i18n            list what is missing (it shows English) and what is unused (probably a typo)
//   npm run check:i18n -- --strict   also fail when anything is missing
//
// Keys are read from the source: t('key', …), t.list('key', …) and <T k="key">. Dictionaries are read as text (they
// contain JSX), so this needs no build.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const strict = process.argv.includes('--strict');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === '.next' || e.name === 'i18n' ? [] : walk(p);
    return /\.(js|jsx)$/.test(e.name) ? [p] : [];
  });

// Every source file that asks for a translation (the i18n/ folders hold dictionaries and the provider, so they are skipped).
const files = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'components')), path.join(root, 'components/i18n/LangSwitch.js')];
const used = new Map(); // key -> first place it is used
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bt(?:\.list)?\(\s*["'`]([\w.]+)["'`]/g)) used.set(m[1], used.get(m[1]) ?? path.relative(root, file));
  for (const m of src.matchAll(/<T\s+k="([\w.]+)"/g)) used.set(m[1], used.get(m[1]) ?? path.relative(root, file));
}

const dictionaries = {
  de: ['components/i18n/ui.de.js', 'app/case-study-placement/i18n/de.js'],
  it: ['components/i18n/ui.it.js', 'app/case-study-placement/i18n/it.js'],
};
let problems = 0;
for (const [lang, paths] of Object.entries(dictionaries)) {
  const have = new Set();
  for (const p of paths) for (const m of fs.readFileSync(path.join(root, p), 'utf8').matchAll(/^\s*'([\w.]+)':/gm)) have.add(m[1]);
  const missing = [...used.keys()].filter((k) => !have.has(k));
  const unused = [...have].filter((k) => !used.has(k));
  console.log(`${lang}: ${have.size} keys; ${missing.length} missing (shown in English); ${unused.length} unused`);
  for (const k of missing) console.log(`   missing  ${k}   (${used.get(k)})`);
  for (const k of unused) console.log(`   UNUSED   ${k}   (a typo, or the English piece was removed)`);
  if (unused.length || (strict && missing.length)) problems++;
}
console.log(`\n${used.size} keys are used by the code.`);
process.exit(problems ? 1 : 0);
