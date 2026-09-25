// Prints the two résumés to PDF: public/about/resume/resume-design.pdf and resume-ats.pdf, the files the
// "Download résumé" dialog serves. Run with the dev server up (npm run dev), then: npm run resume.
// The month and year for the download names are updated in app/about/resume/config.js.
import fs from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.RESUME_BASE ?? 'http://localhost:3000';
const OUT = 'public/about/resume';

const browser = await chromium.launch();
for (const [kind, file] of [
  ['design', 'resume-design.pdf'],
  ['ats', 'resume-ats.pdf'],
]) {
  const page = await browser.newPage();
  await page.goto(`${BASE}/about/resume/print?only=${kind}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.rs-doc');
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: `${OUT}/${file}`, preferCSSPageSize: true, printBackground: true });
  console.log(`${OUT}/${file}`);
  await page.close();
}
await browser.close();

// The download names carry the month and year the PDFs were made.
const now = new Date();
const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
const cfg = 'app/about/resume/config.js';
fs.writeFileSync(
  cfg,
  fs.readFileSync(cfg, 'utf8').replace(/export const RESUME_DATE = \{[^}]*\};/, `export const RESUME_DATE = { month: '${month}', year: ${now.getFullYear()} };`)
);
