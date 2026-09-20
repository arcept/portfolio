#!/usr/bin/env node
// Browser check of the narration on the real case study page.
//
//   cd <a folder that has playwright-core installed>      # e.g. a scratch dir: npm i playwright-core
//   node <repo>/scripts/verify-narration.mjs [--url http://localhost:3000/case-study-placement] [--shots ./shots]
//
// Uses your installed Chrome (CHROME=/path if it isn't the macOS default). Needs the dev server (or a static
// server on the exported site) running. Exit code 1 if anything fails. Playwright is deliberately not a
// dependency of the repo. The unit tests are `npm run test:narration`; data is checked by `npm run validate:narration`.

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(path.join(process.cwd(), 'x.js'));
const { chromium } = require('playwright-core');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const PAGE = args.url ?? 'http://localhost:3000/case-study-placement';
const ORIGIN = new URL(PAGE).origin;
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
const shot = (page, name) => SHOTS && page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
const sec = (clock) => {
  const [m, s] = clock.split(':').map(Number);
  return m * 60 + s;
};

async function open(opts = {}, url = PAGE) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', ...opts });
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  return { ctx, page, errors, requests };
}
const dock = (page) => page.locator('#nr-dock');
// Wait for the slide to finish (transform back to none) rather than guessing a delay.
const settled = (page) => page.waitForFunction(() => { const d = document.getElementById('nr-dock'); return d.classList.contains('is-open') && getComputedStyle(d).transform === 'none'; }, null, { timeout: 5000 });
const isOpen = (page) => page.evaluate(() => document.getElementById('nr-dock').classList.contains('is-open'));
const trigger = (page) => page.getByRole('button', { name: /^Listen to the short version, about 4 minutes$/ });
const clockOf = (page) => page.locator('.nr-meta span').first().innerText();
// Ignores a `?v=<version>` cache-busting query on the audio and data URLs.
const seen = (r, tail) => r.some((u) => u.split('?')[0].endsWith(tail));

// ------------------------------------------------------------------ desktop, dark: the whole flow
{
  const { ctx, page, errors, requests } = await open();
  ok('the hero trigger reads "Listen to the short version" with a loose length, and a sound-wave icon', (await trigger(page).count()) === 1 && (await trigger(page).innerText()).includes('~4 min') && !(await trigger(page).innerText()).includes('4:07') && (await trigger(page).locator('svg.nr-wave').count()) === 1);
  ok('nothing narration-related is fetched at load', !seen(requests, 'narration.json') && !seen(requests, 'narration.mp3'));
  ok('the panel is closed and inert at rest', !(await isOpen(page)) && (await dock(page).getAttribute('inert')) !== null);

  await trigger(page).hover();
  await page.waitForTimeout(700);
  ok('approaching the trigger loads narration.json (not the audio)', seen(requests, 'narration.json') && !seen(requests, 'narration.mp3'));

  await trigger(page).click();
  await settled(page);
  ok('clicking the trigger opens the panel', (await isOpen(page)) && (await trigger(page).getAttribute('aria-expanded')) === 'true');
  ok('focus moves into the panel', await page.evaluate(() => document.getElementById('nr-dock').contains(document.activeElement)));
  const geo = await page.evaluate(() => { const r = document.getElementById('nr-dock').getBoundingClientRect(); return { top: Math.round(r.top), right: Math.round(innerWidth - r.right), width: Math.round(r.width), bottom: Math.round(innerHeight - r.bottom) }; });
  ok('desktop: docked right, under the site nav, 460px wide', geo.right === 0 && geo.top === 56 && geo.width === 460 && geo.bottom === 0, JSON.stringify(geo));
  ok('the panel is not inert once open', (await dock(page).getAttribute('inert')) === null);
  ok('the panel has one title (no duplicate heading)', (await dock(page).locator('.nr-dock__label').innerText()) === 'Listen to the short version');
  ok('skip buttons are icons (circular arrows), not "-10s / +10s" text', (await dock(page).getByRole('button', { name: 'Back 10 seconds' }).count()) === 1 && (await dock(page).getByRole('button', { name: 'Forward 10 seconds' }).count()) === 1 && !(await dock(page).innerText()).includes('10s'));
  ok('the chapter pills are gone; chapters are small dots on the scrubber', (await dock(page).locator('.nr-chip').count()) === 0 && (await dock(page).locator('.nr-mark').count()) === 7);
  await shot(page, 'desktop-dark-open');

  const y0 = await page.evaluate(() => scrollY);
  await page.mouse.move(400, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(500);
  ok('non-modal: the page still scrolls beside the open panel (no scroll lock)', (await page.evaluate(() => scrollY)) > y0 + 200 && (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');

  // the theme switch stays reachable above the panel
  await page.locator('.cs-switch').click();
  await page.waitForTimeout(300);
  ok('the site nav and theme switch stay usable while the panel is open', (await page.evaluate(() => document.documentElement.dataset.csTheme)) === 'light');
  const lightBg = await page.evaluate(() => getComputedStyle(document.querySelector('.nr')).backgroundColor);
  await shot(page, 'desktop-light-open');
  await page.locator('.cs-switch').click();
  await page.waitForTimeout(300);
  ok('the panel follows the theme', lightBg !== (await page.evaluate(() => getComputedStyle(document.querySelector('.nr')).backgroundColor)));

  // play, then close: audio must keep going, with the mini bar
  await page.getByRole('button', { name: 'Play narration' }).first().click();
  await page.waitForTimeout(2500);
  ok('the audio is requested only after play', seen(requests, 'narration.mp3'));
  ok('the mini bar is hidden while the panel is open', (await page.locator('.nr-mini').count()) === 0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  ok('Escape closes the panel', !(await isOpen(page)));
  ok('focus returns to the trigger', await page.evaluate(() => document.activeElement?.textContent?.includes('Listen') && document.activeElement.getAttribute('aria-controls') === 'nr-dock'));
  ok('the closed panel is inert again', (await dock(page).getAttribute('inert')) !== null);
  ok('closing the panel does not interrupt the audio', (await page.locator('.nr-mini').getByRole('button', { name: 'Pause narration' }).count()) === 1);
  const t1 = sec(await page.locator('.nr-mini__time').innerText().then((s) => s.split(' / ')[0]));
  await page.waitForTimeout(2200);
  const t2 = sec(await page.locator('.nr-mini__time').innerText().then((s) => s.split(' / ')[0]));
  ok('…and the time keeps advancing', t2 > t1, `${t1}s → ${t2}s`);
  const mini = await page.evaluate(() => { const m = document.querySelector('.nr-mini'); return { chapter: m.querySelector('b').textContent, line: m.querySelector('.nr-mini__now span').textContent.length, bottom: Math.round(innerHeight - m.getBoundingClientRect().bottom) }; });
  ok('the mini bar names the chapter and shows the current sentence', mini.chapter.length > 0 && mini.line > 10, JSON.stringify(mini));
  await shot(page, 'desktop-dark-mini');

  ok('the mini bar has a close button', (await page.locator('.nr-mini').getByRole('button', { name: 'Close narration player' }).count()) === 1);
  await page.locator('.nr-mini').getByRole('button', { name: 'Pause narration' }).click();
  await page.waitForTimeout(300);
  ok('the mini bar pauses the audio', (await page.locator('.nr-mini').getByRole('button', { name: 'Play narration' }).count()) === 1);
  await page.locator('.nr-mini__now').click();
  await page.waitForTimeout(700);
  ok('the mini bar text reopens the panel, and the mini bar goes away', (await isOpen(page)) && (await page.locator('.nr-mini').count()) === 0);

  // ---- following: once the reader scrolls away the panel stays put, and "Follow along" is a proper pill
  await page.locator('.nr-mini__now').click().catch(() => {});
  if (!(await isOpen(page))) await trigger(page).click();
  await settled(page);
  await page.getByRole('button', { name: 'Jump to Evidence' }).click();
  await page.waitForTimeout(2200);
  const panelBox = await page.locator('.nr-panel').boundingBox();
  await page.mouse.move(panelBox.x + 200, panelBox.y + 300);
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(800);
  const follow = page.getByRole('button', { name: 'Follow along' });
  ok('scrolling away from the voice shows "Follow along"', (await follow.count()) === 1);
  const pill = await follow.evaluate((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const p = el.closest('.nr-read').getBoundingClientRect(); return { padL: parseFloat(cs.paddingLeft), padR: parseFloat(cs.paddingRight), h: Math.round(r.height), textFits: el.scrollWidth <= el.clientWidth + 1, centred: Math.abs((r.left + r.width / 2) - (p.left + p.width / 2)) < 3, arrow: el.querySelector('svg').style.transform }; });
  ok('…and it is a real pill: padded, text inside it, centred', pill.padL >= 12 && pill.padR >= 12 && pill.h >= 34 && pill.textFits && pill.centred, JSON.stringify(pill));
  ok('…its arrow points back toward the voice (up: the voice is above)', pill.arrow.includes('rotate(180deg)'));
  await shot(page, 'follow-pill');
  const stay0 = await page.evaluate(() => document.querySelector('.nr-panel').scrollTop);
  await page.waitForTimeout(8500);
  const stay1 = await page.evaluate(() => document.querySelector('.nr-panel').scrollTop);
  ok('the panel does NOT snap back on its own while you read elsewhere (8 s later)', Math.abs(stay1 - stay0) < 4 && (await follow.count()) === 1, `${stay0} → ${stay1}`);
  await follow.click();
  await page.waitForTimeout(1100);
  ok('clicking Follow along returns to the voice and the pill goes away', (await follow.count()) === 0 && Math.abs((await page.evaluate(() => document.querySelector('.nr-panel').scrollTop)) - stay1) > 300);
  await page.getByRole('button', { name: 'Jump to Handover' }).click();
  await page.waitForTimeout(2200);
  await page.mouse.move(panelBox.x + 200, panelBox.y + 300); // the wheel scrolls whatever is under the pointer
  await page.mouse.wheel(0, -6000);
  await page.waitForTimeout(800);
  const flipped = { pills: await follow.count(), transform: (await follow.count()) ? await follow.evaluate((el) => el.querySelector('svg').style.transform) : null, panelTop: await page.evaluate(() => document.querySelector('.nr-panel').scrollTop) };
  ok('scrolling the other way flips the arrow (down: the voice is below)', flipped.pills === 1 && flipped.transform === '', JSON.stringify(flipped));
  await page.locator('.nr-panel [data-w]').nth(20).click();
  await page.waitForTimeout(900);
  ok('clicking a word also resumes following', (await follow.count()) === 0);
  ok('the chapter line uses the page\'s section numbers', /^(\d\d )?[A-Z]/.test(await page.locator('.nr-meta__chapter').innerText()));

  // "Go to section" jumps the page while the panel stays open
  await page.getByRole('button', { name: 'Jump to The product' }).click();
  await page.waitForTimeout(600);
  await dock(page).getByRole('link', { name: /Go to section The product/ }).click();
  await page.waitForTimeout(900);
  const top = await page.evaluate(() => Math.round(document.getElementById('product').getBoundingClientRect().top));
  ok('"Go to section" scrolls the page to that section, panel still open', (await isOpen(page)) && top < 400 && top > -200, `section top ${top}px`);

  // close with the button
  await dock(page).getByRole('button', { name: 'Close narration' }).click();
  await page.waitForTimeout(600);
  ok('the close button closes it', !(await isOpen(page)));

  // per-section listen, panel closed
  await page.evaluate(() => document.getElementById('leadership').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).click();
  await page.waitForTimeout(2500);
  const lead = await page.evaluate(() => document.querySelector('.nr-mini b')?.textContent);
  ok('"Listen to this part" plays from that chapter without opening the panel', lead === 'Leadership' && !(await isOpen(page)), `mini bar says "${lead}"`);
  ok('while it plays the button offers Pause', (await page.locator('#leadership').getByRole('button', { name: 'Pause narration' }).count()) === 1);
  await page.locator('#leadership').getByRole('button', { name: 'Pause narration' }).click();
  await page.waitForTimeout(300);
  ok('and pauses it', (await page.locator('.nr-mini').getByRole('button', { name: 'Play narration' }).count()) === 1);

  // closing the mini bar: it pauses the voice and goes away, and returns when the voice starts again
  await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).click();
  await page.waitForTimeout(1200);
  await page.locator('.nr-mini').getByRole('button', { name: 'Close narration player' }).click();
  await page.waitForTimeout(400);
  ok('closing the mini bar removes it and pauses the narration', (await page.locator('.nr-mini').count()) === 0 && (await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).count()) === 1);
  await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).click();
  await page.waitForTimeout(1200);
  ok('…and it comes back the next time the voice starts', (await page.locator('.nr-mini').count()) === 1);
  await shot(page, 'mini-with-close');

  ok('no console errors, page errors or failed requests', errors.length === 0, JSON.stringify(errors));
  ok('no requests to other hosts', !requests.some((u) => u.startsWith('http') && !u.startsWith(ORIGIN)));
  await ctx.close();
}

// ------------------------------------------------------------------ remembered position
{
  const { ctx, page } = await open();
  await trigger(page).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Jump to Handover' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Pause narration' }).first().click();
  const before = sec(await clockOf(page));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await trigger(page).click();
  await page.waitForTimeout(1200);
  const after = sec(await clockOf(page));
  ok('the position is remembered across a reload (this visit only)', Math.abs(after - before) <= 2 && after > 100, `${before}s → ${after}s`);
  ok('…and nothing autoplays', (await page.getByRole('button', { name: 'Play narration' }).count()) >= 1 && (await page.getByRole('button', { name: 'Pause narration' }).count()) === 0);
  await ctx.close();
}

// ------------------------------------------------------------------ deep link
{
  const { ctx, page, requests } = await open({}, `${PAGE}?listen=1&t=62`);
  await page.waitForTimeout(800);
  ok('?listen=1&t=62 opens the panel', await isOpen(page));
  const clock = await clockOf(page);
  ok('…parked at 1:02', clock === '1:02', clock);
  ok('…and does not start playing', (await page.getByRole('button', { name: 'Pause narration' }).count()) === 0 && !seen(requests, 'narration.mp3'));
  await ctx.close();
}
{
  const { ctx, page } = await open({}, `${PAGE}?listen=1&t=1:40`);
  ok('t=1:40 (m:ss) is understood too', (await clockOf(page)) === '1:40');
  await ctx.close();
}

// ------------------------------------------------------------------ phone
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await trigger(page).tap();
  await page.waitForFunction(() => { const d = document.getElementById('nr-dock'); return d.classList.contains('is-open') && getComputedStyle(d).transform === 'none'; }, null, { timeout: 5000 });
  const m = await page.evaluate(() => {
    const r = document.getElementById('nr-dock').getBoundingClientRect();
    const close = document.querySelector('.nr-close').getBoundingClientRect();
    return { left: Math.round(r.left), width: Math.round(r.width), top: Math.round(r.top), bottom: Math.round(innerHeight - r.bottom), closeH: Math.round(close.height), closeW: Math.round(close.width), over: document.documentElement.scrollWidth - innerWidth };
  });
  ok('phone: the panel is a full-width sheet under the nav', m.left === 0 && m.width === 390 && m.top === 56 && m.bottom === 0, JSON.stringify(m));
  ok('phone: a clear 44px close button', m.closeH >= 44 && m.closeW >= 44);
  ok('phone: no horizontal overflow', m.over <= 0);
  await shot(page, 'phone-sheet');
  await page.getByRole('button', { name: 'Play narration' }).first().tap();
  await page.waitForTimeout(2200);
  await page.getByRole('button', { name: 'Close narration' }).tap();
  await page.waitForTimeout(700);
  const mm = await page.evaluate(() => { const r = document.querySelector('.nr-mini').getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(innerWidth - r.right), h: Math.round(r.height) }; });
  ok('phone: closing the sheet leaves playback going, with a mini bar that fits', (await page.locator('.nr-mini').getByRole('button', { name: 'Pause narration' }).count()) === 1 && mm.left >= 8 && mm.right >= 8, JSON.stringify(mm));
  ok('phone: the mini bar controls are 44px', await page.evaluate(() => [...document.querySelectorAll('.nr-mini button')].every((b) => b.getBoundingClientRect().height >= 43.5)));
  await shot(page, 'phone-mini');
  ok('phone: no errors', errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------------------------ reduced motion
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  ok('reduced motion: the panel does not animate', (await page.evaluate(() => getComputedStyle(document.getElementById('nr-dock')).transitionDuration)) === '0s');
  await ctx.close();
}

// ------------------------------------------------------------------ JavaScript off
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(PAGE, { waitUntil: 'load' });
  const v = await page.evaluate(() => { const d = document.getElementById('nr-dock'); const r = d.getBoundingClientRect(); const cs = getComputedStyle(d); return { position: cs.position, visible: cs.visibility, w: Math.round(r.width) }; });
  const text = await page.locator('.nr-panel').innerText();
  // the closing sentence of the narration, read from the published data, so the check survives a new script
  const data = await (await fetch(`${ORIGIN}/case-studies/placement-hub/narration/narration.json`)).json();
  const lastParagraph = data.chapters.at(-1).paragraphs.at(-1).sentences.at(-1).words.map((w) => w.t).join(' ');
  ok('JS off: the transcript is laid out as a plain section, readable', v.position === 'static' && v.visible === 'visible' && text.replace(/\s+/g, ' ').includes(lastParagraph), JSON.stringify(v));
  ok('JS off: "Go to section" links work as ordinary anchors', (await page.locator('.nr-goto').count()) === 7);
  await shot(page, 'js-off');
  await ctx.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
