#!/usr/bin/env node
// Browser check of the site nav and its phone menu (components/Nav.js, MobileMenu.js).
//
//   cd <a folder that has playwright-core installed>
//   node <repo>/scripts/verify-nav.mjs [--origin http://localhost:3000] [--shots ./shots]
//
// Needs the dev server (or a static server on the exported site). Exit code 1 if anything fails.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(path.join(process.cwd(), 'x.js'));
const { chromium } = require('playwright-core');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const ORIGIN = args.origin ?? 'http://localhost:3000';
const SHOTS = args.shots ?? null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
let pass = 0;
let fail = 0;
const ok = (name, cond, note = '') => {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${note ? '  ' + note : ''}`);
};

const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
async function open(url, opts = {}) {
  const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  await page.goto(ORIGIN + url, { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  return { ctx, page, errors };
}
const burger = (page) => page.locator('.site-nav__menu');
const menu = (page) => page.locator('#site-menu');
// Wait for the wipe to finish opening (or the layer to be gone).
const opened = (page) => page.waitForFunction(() => { const m = document.getElementById('site-menu'); if (!m || !m.classList.contains('is-open')) return false; const radius = parseFloat(getComputedStyle(m).clipPath.match(/circle\(([\d.]+)px/)?.[1] ?? '0'); return radius >= parseFloat(m.style.getPropertyValue('--r')) - 1; }, null, { timeout: 6000 });
const gone = (page) => page.waitForFunction(() => !document.getElementById('site-menu'), null, { timeout: 5000 });

// ------------------------------------------------------------------ wide screens keep the links in the bar
{
  const { ctx, page } = await open('/');
  const v = await page.evaluate(() => ({ burger: getComputedStyle(document.querySelector('.site-nav__menu')).display, links: [...document.querySelectorAll('.site-nav__link')].map((a) => getComputedStyle(a).display !== 'none' && a.textContent) }));
  ok('wide: the three links are in the bar and there is no hamburger', v.burger === 'none' && v.links.join('|') === 'Work|About|Contact', JSON.stringify(v));
  await ctx.close();
}

// ------------------------------------------------------------------ the controls in the bar are big enough to tap
for (const w of [320, 360, 390]) {
  const { ctx, page } = await open('/case-study-placement', { ...phone, viewport: { width: w, height: 800 } });
  const r = await page.evaluate(() => {
    const out = {};
    for (const [key, sel] of [['language', '.cs-lang__button'], ['theme', '.cs-switch'], ['menu', '.site-nav__menu']]) {
      const el = document.querySelector(sel);
      const b = el.getBoundingClientRect();
      // the tap area: a point 4px outside each edge must still land on the control
      const probe = (x, y) => document.elementFromPoint(x, y)?.closest(sel) !== null;
      out[key] = { w: Math.round(b.width), h: Math.round(b.height), tap: probe(b.left - 3, b.top + b.height / 2) && probe(b.right + 3, b.top + b.height / 2) && probe(b.left + b.width / 2, b.top - 3) && probe(b.left + b.width / 2, b.bottom + 3) };
    }
    const nav = document.querySelector('.site-nav').getBoundingClientRect();
    out.bar = Math.round(nav.height);
    out.right = Math.round(document.querySelector('.site-nav__menu').getBoundingClientRect().right);
    return out;
  });
  ok(`phone ${w}px: language, theme and menu are 36px tall (at least as wide as tall), each with a 44px tap area`, ['language', 'theme', 'menu'].every((k) => r[k].h === 36 && r[k].w >= 36 && r[k].tap), JSON.stringify(r));
  ok(`phone ${w}px: the bar is still ${'56–57'}px tall and everything stays inside the screen`, r.bar >= 56 && r.bar <= 57 && r.right <= w - 12, `bar ${r.bar}px, ends at ${r.right}`);
  await ctx.close();
}

// ------------------------------------------------------------------ the phone menu, on a case study (it has the language and theme switches)
for (const [pageUrl, label] of [['/case-study-placement', 'a case study'], ['/', 'the home page']]) {
  const { ctx, page, errors } = await open(pageUrl, phone);
  const v = await page.evaluate(() => ({ burger: getComputedStyle(document.querySelector('.site-nav__menu')).display !== 'none', links: [...document.querySelectorAll('.site-nav__link')].every((a) => getComputedStyle(a).display === 'none'), right: document.querySelector('.site-nav__links').lastElementChild.getBoundingClientRect().right, vw: innerWidth }));
  ok(`phone, ${label}: the links are gone from the bar and a hamburger takes their place, inside the screen`, v.burger && v.links && v.right <= v.vw - 8);
  ok(`phone, ${label}: it is labelled and closed (aria-expanded=false, no layer in the page)`, (await burger(page).getAttribute('aria-label')) === 'Open menu' && (await burger(page).getAttribute('aria-expanded')) === 'false' && (await menu(page).count()) === 0);

  const y0 = await page.evaluate(() => scrollY);
  await burger(page).tap();
  await opened(page);
  ok(`phone, ${label}: tapping it wipes a full-screen menu open, and the button becomes a close mark`, (await burger(page).getAttribute('aria-expanded')) === 'true' && (await burger(page).getAttribute('aria-label')) === 'Close menu' && (await menu(page).getAttribute('role')) === 'dialog' && (await menu(page).getAttribute('aria-modal')) === 'true');
  const box = await menu(page).boundingBox();
  ok(`phone, ${label}: it covers the whole screen`, box.x === 0 && box.y === 0 && box.width === 390 && box.height === 844, JSON.stringify(box));
  // The inert item is a span, which may not carry aria-label, so its name is its text.
  const links = await menu(page).locator('.mm__link').evaluateAll((els) => els.map((e) => ({ name: e.getAttribute('aria-label') ?? e.querySelector('.mm__word')?.textContent ?? null, href: e.getAttribute('href') })));
  // Contact is listed but has no destination yet: it waits for its own page, so it carries no href.
  ok(`phone, ${label}: its links are Work, About and Contact, from the same list as the bar`, links.map((l) => l.name).join('|') === 'Work|About|Contact' && links[0].href === '/#work' && links[2].href === null, JSON.stringify(links.map((l) => ({ name: l.name, href: l.href }))));
  ok(`phone, ${label}: focus moves into the menu`, await page.evaluate(() => document.activeElement?.classList.contains('mm__link')));
  ok(`phone, ${label}: the page behind cannot scroll`, (await page.evaluate(() => document.documentElement.style.overflow)) === 'hidden');
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(300);
  ok(`phone, ${label}: and does not move when you try`, (await page.evaluate(() => scrollY)) === y0);
  const top = await page.evaluate(() => { const b = document.querySelector('.site-nav__menu').getBoundingClientRect(); const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); const nav = document.querySelector('.site-nav'); return { burgerOnTop: el?.closest('.site-nav__menu') !== null, navZ: getComputedStyle(nav).zIndex, menuZ: getComputedStyle(document.getElementById('site-menu')).zIndex, dockZ: getComputedStyle(document.getElementById('nr-dock') ?? document.body).zIndex }; });
  ok(`phone, ${label}: the bar (and its switches) stays above the menu`, top.burgerOnTop && Number(top.navZ) > Number(top.menuZ), JSON.stringify(top));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `menu-${pageUrl === '/' ? 'home' : 'case-study'}.png`) });

  // keyboard: Tab never leaves the bar and the menu
  const seen = new Set();
  let leaked = false;
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => { const a = document.activeElement; return a?.closest('.site-nav') ? 'bar' : a?.closest('#site-menu') ? 'menu' : 'outside'; });
    seen.add(where);
    if (where === 'outside') leaked = true;
  }
  ok(`phone, ${label}: Tab cycles through the bar and the menu and never reaches the page behind`, !leaked && seen.has('menu') && seen.has('bar'), [...seen].join(','));

  await page.keyboard.press('Escape');
  await gone(page);
  ok(`phone, ${label}: Escape closes it, returns focus to the button and gives the page its scrolling back`, (await page.evaluate(() => document.activeElement?.classList.contains('site-nav__menu'))) && (await page.evaluate(() => document.documentElement.style.overflow)) !== 'hidden' && (await burger(page).getAttribute('aria-expanded')) === 'false');
  ok(`phone, ${label}: no errors`, errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------------------------ choosing a link, and resizing
{
  const { ctx, page } = await open('/', phone);
  await burger(page).tap();
  await opened(page);
  await menu(page).locator('.mm__link').nth(0).tap();
  await gone(page);
  await page.waitForTimeout(600);
  ok('choosing "Work" closes the menu and then goes there (#work)', page.url().endsWith('/#work') && (await page.evaluate(() => scrollY)) > 200, `${page.url()} scrollY ${await page.evaluate(() => scrollY)}`);
  await ctx.close();
}
{
  const { ctx, page } = await open('/', { ...phone, viewport: { width: 600, height: 800 } });
  await burger(page).tap();
  await opened(page);
  await page.setViewportSize({ width: 900, height: 800 });
  await gone(page);
  ok('growing the window past the phone size while it is open drops the menu', (await menu(page).count()) === 0 && (await page.evaluate(() => document.documentElement.style.overflow)) !== 'hidden');
  await ctx.close();
}

// ------------------------------------------------------------------ with the theme and the language
{
  const { ctx, page } = await open('/case-study-placement', phone);
  await burger(page).tap();
  await opened(page);
  const before = await menu(page).evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.locator('.cs-switch').tap();
  await page.waitForTimeout(400);
  const after = await menu(page).evaluate((el) => getComputedStyle(el).backgroundColor);
  ok('the theme switch still works with the menu open, and the menu follows it', before !== after, `${before} → ${after}`);
  await page.locator('.cs-lang__button').tap();
  await page.locator('.cs-lang__item[lang="de"]').tap();
  await page.waitForFunction(() => document.documentElement.lang === 'de' && document.querySelector('.site-nav__menu').getAttribute('aria-label') === 'Menü schließen', null, { timeout: 8000 });
  ok('so does the language switch: the menu and its button speak German', (await burger(page).getAttribute('aria-label')) === 'Menü schließen' && (await menu(page).getAttribute('aria-label')) === 'Menü');
  await ctx.close();
}

// ------------------------------------------------------------------ reduced motion
{
  const { ctx, page } = await open('/', { ...phone, reducedMotion: 'reduce' });
  await burger(page).tap();
  await page.waitForFunction(() => document.getElementById('site-menu')?.classList.contains('is-open'), null, { timeout: 5000 });
  await page.waitForTimeout(500);
  const v = await menu(page).evaluate((el) => ({ clip: getComputedStyle(el).clipPath, opacity: getComputedStyle(el).opacity, ticker: getComputedStyle(el.querySelector('.mm__ticker-track')).animationName, word: getComputedStyle(el.querySelector('.mm__enter')).transform }));
  ok('reduced motion: no circle wipe (a plain fade), the ticker stands still and the words are simply there', v.clip === 'none' && v.opacity === '1' && v.ticker === 'none' && (v.word === 'none' || v.word === 'matrix(1, 0, 0, 1, 0, 0)'), JSON.stringify(v));
  await ctx.close();
}

// ------------------------------------------------------------------ accessibility of the open menu
{
  const axeSrc = require('fs').readFileSync(require.resolve('axe-core/axe.min.js', { paths: [process.cwd()] }), 'utf8');
  const { ctx, page } = await open('/case-study-placement', phone);
  await burger(page).tap();
  await opened(page);
  await page.waitForTimeout(1500);
  await page.evaluate(axeSrc);
  const r = await page.evaluate(() => axe.run({ include: [['#site-menu'], ['.site-nav']] }, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
  ok('axe finds nothing wrong with the open menu and the bar', r.violations.length === 0, r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`).join('; '));
  await ctx.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
