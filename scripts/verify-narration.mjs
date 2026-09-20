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
const modeOf = (page) => page.evaluate(() => document.getElementById('nr-dock').dataset.mode);
// Wait for the card to be in `mode` with its size transition finished, rather than guessing a delay.
const settled = (page, mode) => page.waitForFunction((m) => { const d = document.getElementById('nr-dock'); return d.dataset.mode === m && d.getAnimations({ subtree: true }).length === 0; }, mode, { timeout: 5000 });
const trigger = (page) => page.getByRole('button', { name: /^(Listen to the short version, about 4 minutes|Pause the short version)$/ });
const miniButton = (page, name) => dock(page).locator('.nr-dock__mini').getByRole('button', { name });
const clockOf = (page) => page.locator('.nr-meta span').first().innerText();
const box = (page) => page.evaluate(() => { const r = document.getElementById('nr-dock').getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom), width: Math.round(r.width), height: Math.round(r.height) }; });
const isInert = async (page, sel) => (await page.locator(sel).getAttribute('inert')) !== null;
// Ignores a `?v=<version>` cache-busting query on the audio and data URLs.
const seen = (r, tail) => r.some((u) => u.split('?')[0].endsWith(tail));

// ------------------------------------------------------------------ desktop, dark: the whole flow
{
  const { ctx, page, errors, requests } = await open();
  ok('the hero trigger reads "Listen to the short version" with a loose length, and a sound-wave icon', (await trigger(page).count()) === 1 && (await trigger(page).innerText()).includes('~4 min') && !(await trigger(page).innerText()).includes('4:07') && (await trigger(page).locator('svg.nr-wave').count()) === 1);
  ok('nothing narration-related is fetched at load', !seen(requests, 'narration.json') && !seen(requests, 'narration.mp3'));
  ok('at rest the card is closed and inert', (await modeOf(page)) === 'closed' && (await isInert(page, '#nr-dock')));

  await trigger(page).hover();
  await page.waitForTimeout(700);
  ok('approaching the trigger loads narration.json (not the audio)', seen(requests, 'narration.json') && !seen(requests, 'narration.mp3'));

  const articleBefore = await page.evaluate(() => Math.round(document.getElementById('problem').getBoundingClientRect().width));

  // ---- the default: the small player
  await trigger(page).click();
  await settled(page, 'mini');
  // wait for the voice to actually start (a slow first request should not fail the check)
  await page.waitForFunction(() => (document.querySelector('.nr-mini__now span')?.textContent.length ?? 0) > 10, null, { timeout: 10000 });
  ok('pressing the trigger shows the small player and starts the voice', (await modeOf(page)) === 'mini' && seen(requests, 'narration.mp3') && (await miniButton(page, 'Pause narration').count()) === 1);
  ok('…and the trigger now offers to pause', (await trigger(page).innerText()).includes('Pause the short version'));
  const mini = await box(page);
  ok('desktop: the small player floats 20px in from the right and bottom, 510px wide', mini.right === 20 && mini.bottom === 20 && mini.width === 510 && mini.height === 96, JSON.stringify(mini));
  const nowLine = await page.evaluate(() => ({ chapter: document.querySelector('.nr-mini__now b').textContent, line: document.querySelector('.nr-mini__now span').textContent.length }));
  ok('the small player names the chapter and shows the current sentence', nowLine.chapter.length > 0 && nowLine.line > 10, JSON.stringify(nowLine));
  ok('the full player is inert and hidden while it is small', (await isInert(page, '.nr-dock__full')) && !(await isInert(page, '.nr-dock__miniwrap')) && !(await page.locator('.nr-dock__full').isVisible()));
  const t1 = sec(await page.locator('.nr-mini__clock').first().innerText());
  await page.waitForTimeout(2200);
  const t2 = sec(await page.locator('.nr-mini__clock').first().innerText());
  ok('the time keeps advancing', t2 > t1, `${t1}s → ${t2}s`);

  // ---- seeking and skipping in the small player
  const seekBox = await page.locator('.nr-mini__seek').boundingBox();
  await page.mouse.click(seekBox.x + seekBox.width * 0.5, seekBox.y + seekBox.height / 2);
  await page.waitForTimeout(500);
  const mid = sec(await page.locator('.nr-mini__clock').first().innerText());
  ok('clicking the middle of the small player\'s bar seeks to the middle', mid >= 110 && mid <= 130, `${mid}s of 239s`);
  await miniButton(page, 'Forward 10 seconds').click();
  await page.waitForTimeout(300);
  const fwd = sec(await page.locator('.nr-mini__clock').first().innerText());
  await miniButton(page, 'Back 10 seconds').click();
  await miniButton(page, 'Back 10 seconds').click();
  await page.waitForTimeout(300);
  const back = sec(await page.locator('.nr-mini__clock').first().innerText());
  ok('the small player has ±10 s buttons', fwd >= mid + 9 && back <= fwd - 19, `${mid}s → +10 → ${fwd}s → −20 → ${back}s`);
  const sizes = await page.evaluate(() => { const d = document.querySelector('.nr-mini__play'); const b = getComputedStyle(d, '::before'); return { box: Math.round(d.getBoundingClientRect().height), disc: Math.round(parseFloat(getComputedStyle(d).height) - 2 * parseFloat(b.top)) }; });
  ok('the small player\'s play button is a 36px disc in a 44px target', sizes.box === 44 && sizes.disc === 36, JSON.stringify(sizes));
  await shot(page, 'desktop-dark-mini');
  const panelSizeMini = await page.evaluate(() => document.querySelector('.nr-panel').offsetHeight);

  await trigger(page).click();
  await page.waitForTimeout(300);
  ok('pressing the trigger again pauses', (await miniButton(page, 'Play narration').count()) === 1 && (await trigger(page).innerText()).includes('Listen to the short version'));
  await miniButton(page, 'Play narration').click();
  await page.waitForTimeout(400);
  ok('the small player has its own play/pause', (await miniButton(page, 'Pause narration').count()) === 1);

  // ---- expanding
  await miniButton(page, /^Expand narration transcript/).click();
  await settled(page, 'expanded');
  const full = await box(page);
  ok('expanding grows the card upward: still 20px from the right and bottom, the same 510px width as the small player, under the nav', full.right === 20 && full.bottom === 20 && full.width === mini.width && full.top === 76 && full.height === 900 - 76 - 20, JSON.stringify(full));
  ok('it floats: rounded corners and clear of every edge', (await dock(page).evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))) >= 16 && full.top > 56 && full.right > 0 && full.bottom > 0);
  const articleAfter = await page.evaluate(() => Math.round(document.getElementById('problem').getBoundingClientRect().width));
  ok('the case study does not reflow when the card opens', articleBefore === articleAfter, `${articleBefore}px → ${articleAfter}px`);
  ok('the transcript keeps the same size while the card is small and expanded (no reflow)', (await page.evaluate(() => document.querySelector('.nr-panel').offsetHeight)) === panelSizeMini);
  const look = await dock(page).evaluate((el) => { const cs = getComputedStyle(el); const bar = getComputedStyle(el.querySelector('.nr-dock__bar')); return { border: cs.borderTopColor, shadow: cs.boxShadow !== 'none', barPad: parseFloat(bar.paddingLeft), play: Math.round(el.querySelector('.nr-play').getBoundingClientRect().height) }; });
  ok('the expanded card has a visible border, a shadow and roomy padding, and a smaller play button', /^(rgba?|color)\(/.test(look.border) && look.shadow && look.barPad >= 28 && look.play === 46, JSON.stringify(look));
  ok('focus moves into the card', await page.evaluate(() => document.getElementById('nr-dock').contains(document.activeElement)));
  // ---- the highlight must never change the layout: no word may move to another line while the voice plays
  const reflow = await page.evaluate(async () => {
    const words = [...document.querySelectorAll('.nr-panel [data-w]')];
    const tops = () => words.map((w) => w.offsetTop);
    let prev = tops();
    let moves = 0;
    const start = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        const now = tops();
        if (now.some((t, i) => t !== prev[i])) moves++;
        prev = now;
        if (performance.now() - start < 9000) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    return { moves, weights: [...new Set(words.map((w) => getComputedStyle(w).fontWeight))] };
  });
  ok('the highlight never reflows the text: no word changes line in 9 s of playback, and every word keeps one weight', reflow.moves === 0 && reflow.weights.length === 1, JSON.stringify(reflow));
  ok('the full player is live and the small player is inert', !(await isInert(page, '.nr-dock__full')) && (await isInert(page, '.nr-dock__miniwrap')));
  ok('expanding does not interrupt the audio', (await dock(page).locator('.nr-dock__full').getByRole('button', { name: 'Pause narration' }).count()) === 1);
  ok('the card has one title (no duplicate heading)', (await dock(page).locator('.nr-dock__label').innerText()) === 'Listen to the short version');
  ok('skip buttons are icons (circular arrows), not "-10s / +10s" text', (await dock(page).getByRole('button', { name: 'Back 10 seconds' }).count()) === 1 && (await dock(page).getByRole('button', { name: 'Forward 10 seconds' }).count()) === 1 && !(await dock(page).innerText()).includes('10s'));
  ok('chapters are small dots on the scrubber', (await dock(page).locator('.nr-chip').count()) === 0 && (await dock(page).locator('.nr-mark').count()) === 7);
  await shot(page, 'desktop-dark-open');

  const y0 = await page.evaluate(() => scrollY);
  await page.mouse.move(400, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(500);
  ok('non-modal: the page still scrolls beside the card (no scroll lock)', (await page.evaluate(() => scrollY)) > y0 + 200 && (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');

  await page.locator('.cs-switch').click();
  await page.waitForTimeout(300);
  ok('the site nav and theme switch stay usable while the card is open', (await page.evaluate(() => document.documentElement.dataset.csTheme)) === 'light');
  const lightBg = await page.evaluate(() => getComputedStyle(document.querySelector('.nr')).backgroundColor);
  await shot(page, 'desktop-light-open');
  await page.locator('.cs-switch').click();
  await page.waitForTimeout(300);
  ok('the card follows the theme', lightBg !== (await page.evaluate(() => getComputedStyle(document.querySelector('.nr')).backgroundColor)));

  await dock(page).locator('.nr-speed').focus(); // Escape acts while focus is inside the card
  await page.keyboard.press('Escape');
  await settled(page, 'mini');
  ok('Escape shrinks the card back to the small player', (await modeOf(page)) === 'mini');
  ok('focus returns to the button that expanded it', await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.startsWith('Expand narration transcript')));
  ok('the full player is inert again', await isInert(page, '.nr-dock__full'));
  ok('shrinking does not interrupt the audio', (await miniButton(page, 'Pause narration').count()) === 1);

  await miniButton(page, 'Pause narration').click();
  await page.waitForTimeout(300);
  ok('the small player pauses the audio', (await miniButton(page, 'Play narration').count()) === 1);
  await page.locator('.nr-mini__now').click();
  await settled(page, 'expanded');
  ok('clicking its words expands it too', (await modeOf(page)) === 'expanded');

  // ---- following: once the reader scrolls away the panel stays put, and "Follow along" is a proper pill
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

  // "Go to section" jumps the page while the card stays open
  await page.getByRole('button', { name: 'Jump to The product' }).click();
  await page.waitForTimeout(600);
  await dock(page).getByRole('link', { name: /Go to section The product/ }).click();
  await page.waitForTimeout(900);
  const top = await page.evaluate(() => Math.round(document.getElementById('product').getBoundingClientRect().top));
  ok('"Go to section" scrolls the page to that section, card still open', (await modeOf(page)) === 'expanded' && top < 400 && top > -200, `section top ${top}px`);

  await dock(page).getByRole('button', { name: 'Shrink to the small player' }).click();
  await settled(page, 'mini');
  ok('the shrink button returns to the small player', (await modeOf(page)) === 'mini');

  // per-section listen, with the small player showing
  await page.evaluate(() => document.getElementById('leadership').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).click();
  await page.waitForTimeout(2500);
  const lead = await page.evaluate(() => document.querySelector('.nr-mini__now b')?.textContent);
  ok('"Listen to this part" plays from that chapter in the small player', lead === 'Leadership' && (await modeOf(page)) === 'mini', `small player says "${lead}"`);
  ok('while it plays the button offers Pause', (await page.locator('#leadership').getByRole('button', { name: 'Pause narration' }).count()) === 1);
  await page.locator('#leadership').getByRole('button', { name: 'Pause narration' }).click();
  await page.waitForTimeout(300);
  ok('and pauses it', (await miniButton(page, 'Play narration').count()) === 1);

  // closing the small player: it pauses the voice and goes away, and returns when the voice starts again
  await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).click();
  await page.waitForTimeout(1200);
  await miniButton(page, 'Close narration player').click();
  await settled(page, 'closed');
  ok('closing the small player removes it, and pauses the narration', (await modeOf(page)) === 'closed' && (await isInert(page, '#nr-dock')) && (await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).count()) === 1);
  await page.locator('#leadership').getByRole('button', { name: /Listen to this part/ }).click();
  await page.waitForTimeout(1200);
  ok('…and it comes back the next time the voice starts', (await modeOf(page)) === 'mini');
  await shot(page, 'mini-with-close');

  ok('no console errors, page errors or failed requests', errors.length === 0, JSON.stringify(errors));
  ok('no requests to other hosts', !requests.some((u) => u.startsWith('http') && !u.startsWith(ORIGIN)));
  await ctx.close();
}

// ------------------------------------------------------------------ remembered position
{
  const { ctx, page } = await open();
  await trigger(page).click();
  await settled(page, 'mini');
  await miniButton(page, /^Expand narration transcript/).click();
  await settled(page, 'expanded');
  await page.getByRole('button', { name: 'Jump to Handover' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Pause narration' }).first().click();
  const before = sec(await clockOf(page));
  await page.goto(`${PAGE}?listen=1`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const after = sec(await clockOf(page));
  ok('the position is remembered across a reload (this visit only)', Math.abs(after - before) <= 2 && after > 100, `${before}s → ${after}s`);
  ok('…and nothing autoplays', (await page.getByRole('button', { name: 'Play narration' }).count()) >= 1 && (await page.getByRole('button', { name: 'Pause narration' }).count()) === 0);
  await ctx.close();
}

// ------------------------------------------------------------------ deep link
{
  const { ctx, page, requests } = await open({}, `${PAGE}?listen=1&t=62`);
  await page.waitForTimeout(800);
  ok('?listen=1&t=62 opens the full card', (await modeOf(page)) === 'expanded');
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
  await settled(page, 'mini');
  await page.waitForTimeout(1500);
  const mm = await box(page);
  ok('phone: the small player is a bar 12px in from the sides and bottom', mm.left === 12 && mm.right === 12 && mm.bottom === 12 && mm.height === 96, JSON.stringify(mm));
  ok('phone: it is playing, and its controls are 44px', (await miniButton(page, 'Pause narration').count()) === 1 && (await page.evaluate(() => [...document.querySelectorAll('.nr-dock__mini button, .nr-mini__seek')].every((b) => b.getBoundingClientRect().height >= 43.5))));
  await shot(page, 'phone-mini');
  await miniButton(page, /^Expand narration transcript/).tap();
  await settled(page, 'expanded');
  const m = await page.evaluate(() => {
    const r = document.getElementById('nr-dock').getBoundingClientRect();
    const btn = document.querySelector('.nr-collapse').getBoundingClientRect();
    return { left: Math.round(r.left), width: Math.round(r.width), top: Math.round(r.top), bottom: Math.round(innerHeight - r.bottom), btnH: Math.round(btn.height), btnW: Math.round(btn.width), over: document.documentElement.scrollWidth - innerWidth };
  });
  ok('phone: the full player is a full-width sheet under the nav', m.left === 0 && m.width === 390 && m.top === 56 && m.bottom === 0, JSON.stringify(m));
  ok('phone: a clear 44px shrink button', m.btnH >= 44 && m.btnW >= 44);
  ok('phone: no horizontal overflow', m.over <= 0);
  await shot(page, 'phone-sheet');
  await page.getByRole('button', { name: 'Shrink to the small player' }).tap();
  await settled(page, 'mini');
  ok('phone: shrinking leaves playback going', (await miniButton(page, 'Pause narration').count()) === 1);
  ok('phone: no errors', errors.length === 0, JSON.stringify(errors));
  await ctx.close();
}

// ------------------------------------------------------------------ reduced motion
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  ok('reduced motion: the card does not animate', (await page.evaluate(() => getComputedStyle(document.getElementById('nr-dock')).transitionDuration)) === '0s');
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
