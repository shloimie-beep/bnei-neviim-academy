import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('ops/ui-audits/2026-07-10-onetime-public-landing-production-rebuild');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { width: 1440, height: 1000 },
  { width: 1280, height: 900 },
  { width: 1024, height: 900 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 360, height: 800 },
  { width: 320, height: 740 },
];

const browser = await chromium.launch();
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text().slice(0, 500) });
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(String(error?.message || error).slice(0, 500));
  });
  await page.goto('http://127.0.0.1:3210/one-time', { waitUntil: 'networkidle' });
  await page.screenshot({
    path: path.join(outDir, `before-${viewport.width}.png`),
    fullPage: true,
  });
  const metrics = await page.evaluate(() => {
    const body = document.body;
    const doc = document.documentElement;
    const form = document.querySelector('#interestForm');
    const student = document.querySelector('[name="student_name"]');
    const faq = document.querySelector('#faq');
    const ctas = [...document.querySelectorAll('a, button')]
      .map((node) => (node.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return {
      title: document.title,
      h1_count: document.querySelectorAll('h1').length,
      h1_text: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      scroll_width: Math.max(body?.scrollWidth || 0, doc?.scrollWidth || 0),
      client_width: doc?.clientWidth || 0,
      has_horizontal_overflow: Math.max(body?.scrollWidth || 0, doc?.scrollWidth || 0) > (doc?.clientWidth || 0) + 1,
      form_present: Boolean(form),
      student_quick_field_present: Boolean(student),
      faq_present: Boolean(faq),
      cta_texts: ctas,
      body_classes: body?.className || '',
    };
  });
  results.push({ viewport, metrics, consoleMessages, pageErrors });
  await page.close();
}

await browser.close();
fs.writeFileSync(
  path.join(outDir, 'before-metrics.json'),
  `${JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2)}\n`
);

console.log(`Captured ${viewports.length} before screenshots in ${outDir}`);
