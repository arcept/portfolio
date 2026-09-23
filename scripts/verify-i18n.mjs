#!/usr/bin/env node
// Browser check of the language switch on the Placement Hub case study.
//
//   cd <a folder that has playwright-core installed>
//   node <repo>/scripts/verify-i18n.mjs [--url http://localhost:3000/case-study-placement] [--shots ./shots]
//
// Needs the dev server (or a static server on the exported site). Exit code 1 if anything fails.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(path.join(process.cwd(), 'x.js'));
const { chromium } = require('playwright-core');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const PAGE = args.url ?? 'http://localhost:3000/case-study-placement';
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

async function open(opts = {}, url = PAGE) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  return { ctx, page, errors };
}
const langButton = (page) => page.locator('.cs-lang__button');
const menu = (page) => page.locator('.cs-lang__menu');
const lang = (page) => page.evaluate(() => document.documentElement.lang);
const chooseLang = async (page, code) => {
  await langButton(page).click();
  await menu(page).locator(`[role="option"][lang="${code}"]`).click();
  await page.waitForFunction((c) => document.documentElement.lang === c, code, { timeout: 8000 });
  await page.waitForTimeout(500);
};
// Scroll through the whole page so every counting figure has finished, then read what the page shows.
async function read(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(2200);
  await page.evaluate(() => scrollTo(0, 0));
  return page.evaluate(() => {
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const root = document.querySelector('.ph-page');
    const main = root.querySelector('main');
    return {
      text: norm(root.textContent),
      main: norm(main.textContent),
      h1: root.querySelector('h1').getAttribute('aria-label'),
      eyebrows: [...root.querySelectorAll('.lx-eyebrow')].map((e) => norm(e.textContent)),
      nav: [...document.querySelectorAll('.cs-toc a')].map((a) => norm(a.textContent)),
      title: document.title,
      overflow: document.documentElement.scrollWidth - innerWidth,
      alts: [...root.querySelectorAll('img[alt]')].map((i) => i.alt),
    };
  });
}
// Every number on the page, with decimal separators removed, so 55.5 and 55,5 count as the same figure.
const digits = (s) => (s.replace(/(?<=\d)[.,](?=\d)/g, '').match(/\d+/g) ?? []).join(' ');
const englishWords = (s) => (s.match(/\b(the|and|with|that|which|their)\b/gi) ?? []).length;

// ------------------------------------------------------------------ English is the default, and the control is there
const en = {};
{
  const { ctx, page, errors } = await open();
  ok('English is the default: <html lang="en">', (await lang(page)) === 'en');
  ok('the language menu is beside the theme switch, and reads "EN"', (await page.locator('.cs-lang + .cs-switch').count()) === 1 && (await page.locator('.cs-lang__code').innerText()) === 'EN');
  ok('it is labelled for screen readers ("Language: English") and is collapsed', (await langButton(page).getAttribute('aria-label')) === 'Language: English' && (await langButton(page).getAttribute('aria-expanded')) === 'false' && (await menu(page).count()) === 0);
  await langButton(page).click();
  const items = await menu(page).locator('[role="option"]').evaluateAll((els) => els.map((e) => ({ text: e.textContent.trim(), lang: e.lang, selected: e.getAttribute('aria-selected'), flag: !!e.querySelector('.cs-lang__flag'), globe: !!e.querySelector('.cs-lang__globe') })));
  ok('the list holds English, Deutsch and Italiano, with the German and Italian flags (English has the globe)', items.map((i) => i.text).join('|') === 'English|Deutsch|Italiano' && items[0].globe && items[1].flag && items[2].flag && items[0].selected === 'true' && items[1].selected === 'false', JSON.stringify(items));
  const geo = await page.evaluate(() => { const b = document.querySelector('.cs-lang__button').getBoundingClientRect(); const m = document.querySelector('.cs-lang__menu').getBoundingClientRect(); const t = document.querySelector('.cs-switch').getBoundingClientRect(); const cs = getComputedStyle(document.querySelector('.cs-lang__menu')); return { below: Math.round(m.top - b.bottom), rightEdge: Math.round(m.right - b.right), overlapsTheme: !(m.right < t.left || m.left > t.right || m.bottom < t.top || m.top > t.bottom), bg: cs.backgroundColor, radius: parseFloat(cs.borderTopLeftRadius), shadow: cs.boxShadow !== 'none', itemH: Math.round(document.querySelector('.cs-lang__item').getBoundingClientRect().height) }; });
  ok('the list opens BELOW the button, lined up with its right edge, and does not cover the theme switch', geo.below >= 6 && geo.below <= 16 && geo.rightEdge === 0 && !geo.overlapsTheme, JSON.stringify({ below: geo.below, rightEdge: geo.rightEdge, overlapsTheme: geo.overlapsTheme }));
  ok('it is styled like the rest of the site: a solid surface, rounded, with a shadow, and 40px rows', geo.bg !== 'rgba(0, 0, 0, 0)' && geo.radius >= 12 && geo.shadow && geo.itemH >= 40, JSON.stringify({ bg: geo.bg, r: geo.radius, h: geo.itemH }));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'menu-open.png'), clip: { x: 1000, y: 0, width: 440, height: 220 } });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('Escape closes it and returns focus to the button', (await menu(page).count()) === 0 && (await page.evaluate(() => document.activeElement?.classList.contains('cs-lang__button'))));
  await langButton(page).click();
  await page.mouse.click(300, 400);
  await page.waitForTimeout(200);
  ok('a click elsewhere closes it', (await menu(page).count()) === 0);
  await langButton(page).focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.documentElement.lang === 'de', null, { timeout: 8000 });
  ok('by keyboard alone: ArrowDown opens, ArrowDown moves, Enter chooses Deutsch, and focus returns to the button', (await lang(page)) === 'de' && (await page.evaluate(() => document.activeElement?.classList.contains('cs-lang__button'))));
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
  Object.assign(en, await read(page));
  ok('nothing changed in the URL or in storage just by loading', !page.url().includes('lang=') && (await page.evaluate(() => sessionStorage.getItem('cs-lang'))) === null);
  ok('no errors loading in English', errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------------------------ German, then Italian
const got = {};
for (const [code, expect] of [['de', { h1: 'Vermittlungsprozess', eyebrow: 'Das Problem', navFirst: 'Das Problem', title: 'Vermittlung sichtbar', trigger: 'Kurzfassung anhören', note: 'Audio und Transkript sind auf Englisch.', story: 'Die 2-Minuten-Version' }], ['it', { h1: 'processo di placement', eyebrow: 'Il problema', navFirst: 'Il problema', title: 'Rendere visibile', trigger: 'Ascolta la versione breve', note: 'Audio e trascrizione sono in inglese.', story: 'La versione in 2 minuti' }]]) {
  const { ctx, page, errors } = await open();
  const started = Date.now();
  await chooseLang(page, code);
  const took = Date.now() - started;
  ok(`${code}: choosing it changes the page in place (no navigation) in under 3 s`, took < 3000 && (await lang(page)) === code, `${took} ms`);
  const view = await read(page);
  got[code] = view;
  ok(`${code}: the headline, section labels, contents nav and tab title are translated`, view.h1.includes(expect.h1) && view.eyebrows[0].includes(expect.eyebrow) && view.nav[0].includes(expect.navFirst) && view.title.includes(expect.title), JSON.stringify({ h1: view.h1.slice(0, 50), e: view.eyebrows[0], n: view.nav[0], t: view.title }));
  ok(`${code}: the URL is shareable (?lang=${code}) and the choice is kept for the visit`, page.url().includes(`lang=${code}`) && (await page.evaluate(() => sessionStorage.getItem('cs-lang'))) === code);
  ok(`${code}: no English is left in the article (a stray English sentence would show up here)`, englishWords(view.main) <= 2, `${englishWords(view.main)} English function words (2 are allowed: a quotation from a screenshot)`);
  ok(`${code}: every figure on the page is the same as in English`, digits(view.text.replace(/\bENEnglishDeutschItaliano\b/, '')) === digits(en.text.replace(/\bENEnglishDeutschItaliano\b/, '')), '');
  ok(`${code}: the page is no wider than the window`, view.overflow <= 0, `overflow ${view.overflow}px`);
  ok(`${code}: every image still has alt text`, view.alts.length === en.alts.length && view.alts.every((a, i) => (en.alts[i] === '' ? a === '' : a.length > 10 && a !== en.alts[i])));
  const trig = await page.locator('.nr-trigger').innerText();
  ok(`${code}: the hero button is translated and says the audio is English`, trig.includes(expect.trigger) && /EN/.test(trig), trig.replace(/\n/g, ' '));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${code}-hero.png`) });
  await page.locator('.nr-trigger').click();
  await page.waitForTimeout(1200);
  const spoken = await page.evaluate(() => document.querySelector('.nr-mini__now b')?.textContent);
  ok(`${code}: the narration still plays (English audio) and the small player is translated`, /^[A-Z]/.test(spoken ?? '') && (await page.locator('#nr-dock').getAttribute('data-mode')) === 'mini' && !!(await page.locator('.nr-mini__play').getAttribute('aria-label')));
  await page.locator('.nr-mini__btn').first().click();
  await page.waitForTimeout(900);
  ok(`${code}: the expanded card says the audio and transcript are English`, (await page.locator('.nr-dock__note').innerText()) === expect.note);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.locator('.nr-mini__btn').nth(1).click(); // close (pauses)
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /2[- ]Minuten|2 minuti/ }).first().click();
  await page.waitForTimeout(1000);
  ok(`${code}: the 2-minute story opens in ${code} (dialog title and first step)`, (await page.locator('[role="dialog"]').first().getAttribute('aria-label')) === expect.story && (await page.locator('.st__kicker').first().innerText()).toLowerCase().includes(expect.eyebrow.toLowerCase()), await page.locator('.st__kicker').first().innerText());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  ok(`${code}: no console or page errors`, errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------------------------ remembering, links, and back to English
{
  const { ctx, page } = await open();
  await chooseLang(page, 'de');
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.lang === 'de', null, { timeout: 8000 });
  ok('a reload keeps the language for the visit', (await page.locator('.cs-lang__code').innerText()) === 'DE');
  await chooseLang(page, 'en');
  ok('switching back to English removes ?lang= and sets <html lang="en">', !page.url().includes('lang=') && (await lang(page)) === 'en');
  const back = await read(page);
  ok('…and the English page is exactly what it was (nothing left over from German)', back.text === en.text, back.text === en.text ? '' : 'differs');
  await ctx.close();
}
{
  const { ctx, page } = await open({}, `${PAGE}?lang=it`);
  await page.waitForFunction(() => document.documentElement.lang === 'it', null, { timeout: 8000 });
  ok('a link with ?lang=it opens the page in Italian', (await page.locator('.cs-lang__code').innerText()) === 'IT' && (await page.locator('h1').first().getAttribute('aria-label')).includes('placement'));
  await ctx.close();
}
{
  const { ctx, page } = await open({}, `${PAGE}?lang=xx`);
  ok('an unknown ?lang= is ignored: English stays', (await lang(page)) === 'en');
  await ctx.close();
}
{
  // the deep link for the narration still works alongside a language
  const { ctx, page } = await open({}, `${PAGE}?lang=de&listen=1&t=62`);
  await page.waitForFunction(() => document.documentElement.lang === 'de', null, { timeout: 8000 });
  await page.waitForTimeout(800);
  ok('?lang=de&listen=1&t=62 opens the German page with the player expanded at 1:02', (await page.locator('#nr-dock').getAttribute('data-mode')) === 'expanded' && (await page.locator('.nr-meta span').first().innerText()) === '1:02');
  await ctx.close();
}

// ------------------------------------------------------------------ phone
for (const code of ['de', 'it']) {
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const bar = await page.evaluate(() => { const r = document.querySelector('.cs-lang').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), vw: innerWidth }; });
  ok(`phone: the language button fits inside the nav (${bar.w}×${bar.h}px)`, bar.right <= bar.vw);
  await langButton(page).tap();
  const mm = await page.evaluate(() => { const m = document.querySelector('.cs-lang__menu').getBoundingClientRect(); return { left: Math.round(m.left), right: Math.round(m.right), vw: innerWidth }; });
  ok(`phone: the list opens inside the screen, below the button`, mm.left >= 8 && mm.right <= mm.vw - 8, JSON.stringify(mm));
  await menu(page).locator(`[role="option"][lang="${code}"]`).tap();
  await page.waitForFunction((c) => document.documentElement.lang === c, code, { timeout: 8000 });
  const v = await read(page);
  ok(`phone, ${code}: no horizontal overflow at 390px`, v.overflow <= 0, `overflow ${v.overflow}px`);
  const tall = await page.evaluate(() => document.querySelector('.cs-lang__button').getBoundingClientRect().height);
  ok(`phone: the language button is as tall as the theme switch (28px)`, tall >= 28);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${code}-phone.png`) });
  ok(`phone, ${code}: no errors`, errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------------------------ the two browser frames
{
  const { ctx, page } = await open();
  const hero = await page.evaluate(() => { const f = document.querySelector('.cs-hero-frame'); const bar = f?.querySelector('.proto-frame-bar'); const img = f?.querySelector('img'); return { bar: !!bar, dots: bar?.querySelectorAll('.proto-frame-dots span').length, url: bar?.querySelector('.proto-frame-url')?.textContent, barAboveImage: bar && img ? bar.getBoundingClientRect().bottom <= img.getBoundingClientRect().top + 1 : false }; });
  ok('the hero image sits in a browser frame: three dots and an address bar above it', hero.bar && hero.dots === 3 && hero.url === 'placement-hub.novatr.internal/home' && hero.barAboveImage, JSON.stringify(hero));
  await page.evaluate(() => document.getElementById('prototype').scrollIntoView());
  await page.waitForFunction(() => document.querySelector('.proto-frame-live.is-on'), null, { timeout: 15000 }).catch(() => {});
  const live = await page.evaluate(() => { const url = document.querySelector('.proto-frame .proto-frame-url'); const l = url?.querySelector('.proto-frame-live'); return { text: l?.textContent, inside: !!l, opacity: l ? getComputedStyle(l).opacity : null, after: l && url ? l.getBoundingClientRect().left > url.querySelector('.proto-frame-live').previousSibling.parentElement.getBoundingClientRect().left : false }; });
  ok('the live prototype\'s browser bar says "Live" beside the address once it has loaded', live.text === 'Live' && live.inside && live.opacity === '1', JSON.stringify(live));
  await ctx.close();
}

// ------------------------------------------------------------------ the nav must fit on real phone widths
for (const w of [320, 360, 375, 390]) {
  const { ctx, page } = await open({ viewport: { width: w, height: 700 }, hasTouch: true, isMobile: true });
  const r = await page.evaluate(() => ({ nameH: document.querySelector('.site-nav__name').getBoundingClientRect().height, right: document.querySelector('.cs-switch').getBoundingClientRect().right, vw: innerWidth }));
  ok(`phone ${w}px: the nav (brand, links, language, theme) fits on one line inside the screen`, r.nameH <= 26 && r.right <= r.vw - 8, `switch ends at ${Math.round(r.right)} of ${r.vw}`);
  await ctx.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
