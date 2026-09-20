#!/usr/bin/env node
// Verifies a case study page that has been moved onto the redesign kit.
//
//   cd <folder that has playwright-core installed>   # e.g. a scratch dir: npm i playwright-core
//   node <skill>/scripts/verify.mjs --url http://localhost:3000/case-study-oms [--others /,/case-study-cro] [--shots ./shots]
//
// Uses your installed Chrome (set CHROME=/path/to/chrome if it isn't the macOS default). A check whose
// element isn't on the page reports SKIP, not FAIL, so the script also works as a "before" audit of a
// page that hasn't been ported yet: every SKIP is something still to build. Exit code 1 if any FAIL.

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(path.join(process.cwd(), 'x.js'));
const { chromium } = require('playwright-core');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
if (!args.url) { console.error('usage: verify.mjs --url <page url> [--others /,/case-study-cro] [--shots dir]'); process.exit(2); }
const URL_ = args.url;
const ORIGIN = new URL(URL_).origin;
const OTHERS = (args.others || '/').split(',').filter(Boolean);
const SHOTS = args.shots || null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

let pass = 0, fail = 0, skip = 0;
const ok = (name, cond, note = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${note ? '  ' + note : ''}`); };
const skipped = (name, why) => { skip++; console.log(`SKIP  ${name}  (${why})`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const open = async (scheme, w = 1440, h = 900, extra = {}) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, ...extra });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await go(page, URL_);
  await page.waitForTimeout(2200);
  return { ctx, page, errors };
};
// Pages with live embeds or polling never reach "network idle", so wait for it briefly and carry on.
const go = async (page, url) => { await page.goto(url, { waitUntil: 'load' }); await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}); };
const has = (page, sel) => page.locator(sel).count().then((n) => n > 0);
const attr = (page) => page.evaluate(() => document.documentElement.getAttribute('data-cs-theme'));
const lines = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)); }, sel);
const toSection = (page, sel, off = 0) => page.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80 + o); }, [sel, off]);
const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
// Browsers serialise color-mix() results as color(srgb 0.7 0.7 0.7): channels are 0–1, not 0–255.
const parse = (s) => { const n = (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number); return s.startsWith('color(') ? n.map((v) => v * 255) : n; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// ---------------------------------------------------------------- theme
{
  const { ctx, page, errors } = await open('dark');
  const themed = (await attr(page)) !== null;
  if (!themed) skipped('theme mechanism', 'no data-cs-theme on <html> — the theme kit is not installed yet');
  else {
    ok('OS dark -> dark', (await attr(page)) === 'dark');
    ok('gate script is the first thing in the page wrapper', await page.evaluate(() => { const w = document.querySelector('.ph-page'); return !!w && w.firstElementChild?.tagName === 'SCRIPT'; }));
    await page.emulateMedia({ colorScheme: 'light' }); await page.waitForTimeout(400);
    ok('OS flips to light while open -> page follows (no reload)', (await attr(page)) === 'light' && page.url() === URL_);
    await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForTimeout(300);
    if (await has(page, '.cs-switch')) {
      await page.evaluate(() => { window.__m = 1; });
      await page.locator('.cs-switch').click(); await page.waitForTimeout(300);
      ok('switch flips the theme in place', (await attr(page)) === 'light' && (await page.evaluate(() => window.__m)) === 1);
      ok('switch aria-checked follows', (await page.locator('.cs-switch').getAttribute('aria-checked')) === 'false');
      await page.emulateMedia({ colorScheme: 'light' }); await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForTimeout(300);
      ok('a manual choice beats the OS for the visit', (await attr(page)) === 'light');
      await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
      ok('manual choice survives a reload', (await attr(page)) === 'light');
    } else skipped('theme switch', 'no .cs-switch in the nav');
    for (const other of OTHERS) {
      await go(page, ORIGIN + other);
      ok(`${other} is untouched by the theme (no attribute)`, (await attr(page)) === null);
    }
  }
  ok('no page errors or failed requests', errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------ contrast, both themes
for (const scheme of ['dark', 'light']) {
  const { ctx, page } = await open(scheme);
  if (!(await has(page, '.lx-body p'))) { skipped(`${scheme}: text contrast`, 'no .lx-body text — article kit not installed'); await ctx.close(); continue; }
  await toSection(page, '.lx-section'); await page.waitForTimeout(2200);
  const c = await page.evaluate(() => ({ body: getComputedStyle(document.querySelector('.lx-body p')).color, label: getComputedStyle(document.querySelector('.lx-margin__label')).color, page: getComputedStyle(document.body).backgroundColor }));
  const bg = parse(c.page);
  const r1 = ratio(parse(c.body), bg), r2 = ratio(parse(c.label), bg);
  ok(`${scheme}: body text >= 7:1`, r1 >= 7, r1.toFixed(1) + ':1');
  ok(`${scheme}: faintest labels >= 4.5:1 (WCAG AA)`, r2 >= 4.5, r2.toFixed(1) + ':1');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `article-${scheme}.png`) });
  await ctx.close();
}

// ------------------------------------------------ hero, progress, widths
{
  const { ctx, page } = await open('dark');
  if (!(await has(page, '.ph-h1'))) skipped('hero checks', 'no .ph-h1 — hero kit not installed');
  else {
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'hero-dark.png') });
    const n = await lines(page, '.ph-h1');
    ok('headline is at most three lines', n <= 3, `${n} lines`);
    const share = await page.evaluate(() => { const g = document.querySelector('.ph-hero .cs-header-grid'); const [a, c] = [...g.children].map((e) => e.getBoundingClientRect().width); return a / (a + c); });
    ok('hero text column takes about 60%', share > 0.56 && share < 0.62, (share * 100).toFixed(0) + '%');
    if (await has(page, '.ph-facts__toggle')) {
      const collapsed = (await has(page, '.ph-facts__more')) === false;
      await page.locator('.ph-facts__toggle').click(); await page.waitForTimeout(700);
      const same = await page.evaluate(() => { const L = (s) => [...document.querySelectorAll(s)].map((e) => Math.round(e.getBoundingClientRect().left)).join(); return L('.ph-facts__lead > div') === L('.ph-facts__more > div'); });
      ok('hero facts start collapsed, and expand into the same three columns', collapsed && same);
    } else skipped('hero facts', 'no .ph-facts__toggle');
    if (await has(page, '.ph-progress')) {
      const sc = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.ph-progress')).transform).a);
      const a = await sc();
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2)); await page.waitForTimeout(900);
      const b = await sc();
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(900);
      const c = await sc();
      ok('progress bar grows with scroll', a < 0.05 && b > 0.35 && b < 0.65 && c > 0.97, `${a.toFixed(2)} → ${b.toFixed(2)} → ${c.toFixed(2)}`);
    } else skipped('progress bar', 'no .ph-progress');
    if (await has(page, '.proto-note')) {
      await page.evaluate(() => document.querySelector('.proto-note').scrollIntoView({ block: 'center' })); await page.waitForTimeout(1200);
      const m = await lines(page, '.proto-note');
      ok('prototype note is at most two lines', m <= 2, `${m} lines`);
    } else skipped('prototype note', 'no .proto-note');
  }
  await ctx.close();
  const big = await open('dark', 1920, 1000);
  if (await has(big.page, '.cs-article-grid')) {
    const w = await big.page.evaluate(() => Math.round(document.querySelector('.cs-article-grid').getBoundingClientRect().width));
    ok('1920px screen: article container is 1600px', w === 1600, w + 'px');
  } else skipped('container width', 'no .cs-article-grid');
  await big.ctx.close();
}

// -------------------------------------------- blocks and overlays
{
  const { ctx, page } = await open('light');
  if (await has(page, '.px-peek__btn')) {
    const btn = page.locator('.px-peek__btn').first(), clip = page.locator('.px-peek__clip').first();
    const h = () => clip.evaluate((e) => Math.round(e.getBoundingClientRect().height));
    await btn.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
    const closed = await h(); await btn.click(); await page.waitForTimeout(900); const opened = await h();
    await btn.click(); await page.waitForTimeout(900);
    ok('expandable (Peek) opens and closes back to its fade', opened > closed && (await h()) === closed, `${closed} → ${opened}`);
  } else skipped('expandable', 'no .px-peek');
  if (await has(page, '.px-tile__frame')) {
    await toSection(page, '.px-gallery'); await page.waitForTimeout(1500);
    await page.locator('.px-tile__frame').first().click(); await page.waitForTimeout(700);
    ok('lightbox opens from a tile', await has(page, '.px-lb'));
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    ok('lightbox closes on Escape and releases page scroll', !(await has(page, '.px-lb')) && (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');
  } else skipped('lightbox', 'no .px-tile__frame');
  if (await has(page, '.px-seq')) {
    await toSection(page, '.px-seq', -120); await page.mouse.move(2, 2);
    const seen = new Set(); for (let i = 0; i < 16; i++) { await page.waitForTimeout(1000); seen.add(await page.locator('.px-seq__item.is-active .px-seq__label').first().innerText()); }
    ok('animated sequence cycles through its steps on its own', seen.size >= 3, [...seen].join(' → '));
  } else skipped('sequence', 'no .px-seq');
  if (await has(page, '.px-num')) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await toSection(page, '.px-num', -200); await page.waitForTimeout(2600);
    const live = await page.locator('.px-num__live').first().innerText(), label = await page.locator('.px-num').first().getAttribute('aria-label');
    ok('inline figure (Num) counts up to its value', live === label, `${live} vs ${label}`);
  } else skipped('inline figures', 'no .px-num');
  await ctx.close();
}
for (const scheme of ['dark', 'light']) {
  const { ctx, page } = await open(scheme);
  const trigger = page.getByRole('button', { name: /2-minute version/i });
  if (await trigger.count()) {
    await trigger.click(); await page.waitForTimeout(1400);
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.st')).backgroundColor);
    const L = lum(parse(bg));
    ok(`${scheme}: 2-minute story opens and follows the theme`, scheme === 'dark' ? L < 0.05 : L > 0.7, bg);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `story-${scheme}.png`) });
    const total = await page.locator('.st__seg').count(); let visited = 0;
    for (let i = 0; i < total - 1; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900); visited++; }
    ok(`${scheme}: story arrow keys reach the closing card`, (await has(page, '.st__end')), `${visited + 1} steps`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    ok(`${scheme}: Escape closes the story and releases scroll`, !(await has(page, '.st')) && (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');
  } else if (scheme === 'dark') skipped('2-minute story', 'no "2-minute version" button');
  await ctx.close();
}

// ------------------------------------------- reduced motion + phones
{
  const { ctx, page } = await open('dark', 1440, 900, { reducedMotion: 'reduce' });
  if (await has(page, '.ph-hero')) {
    const visible = await page.evaluate(() => [...document.querySelectorAll('.ph-rise, .ph-cover, .ph-word > span')].every((e) => getComputedStyle(e).opacity === '1' && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(e).transform)));
    ok('reduced motion: hero is fully shown at once', visible);
    if (await has(page, '.px-tile')) {
      await toSection(page, '.px-gallery'); await page.waitForTimeout(700);
      ok('reduced motion: gallery tiles are shown, not stuck hidden', await page.locator('.px-tile').evaluateAll((t) => t.every((e) => getComputedStyle(e).opacity === '1')));
    }
  } else skipped('reduced motion', 'no .ph-hero');
  await ctx.close();
}
for (const scheme of ['dark', 'light']) {
  const { ctx, page, errors } = await open(scheme, 390, 844, { hasTouch: true, isMobile: true });
  let worst = 0;
  const probe = async () => { worst = Math.max(worst, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)); };
  await probe();
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-lx-section], .lx-section')].map((e) => e.id).filter(Boolean));
  for (const id of ids) { await page.evaluate((i) => { const el = document.getElementById(i); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60); }, id); await page.waitForTimeout(700); await probe(); }
  // Sweep the whole page too, so pages without kit sections (or with content between them) are covered.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(250); await probe(); }
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `phone-${scheme}.png`) });
  ok(`phone (${scheme}): no horizontal overflow anywhere`, worst <= 0, `worst overflow ${worst}px across the whole page (${ids.length} kit sections)`);
  ok(`phone (${scheme}): no page errors`, errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
await browser.close();
process.exit(fail ? 1 : 0);
