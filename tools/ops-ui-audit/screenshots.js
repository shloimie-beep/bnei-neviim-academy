const fs = require('node:fs');
const path = require('node:path');
const { applyPrivacyRedactions } = require('./privacy');
const { screenshotFilename } = require('./state-discovery');

async function captureStateScreenshots(page, state, run, config) {
  const captured = [];
  for (const viewport of config.viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(150).catch(() => {});
    const redaction = await applyPrivacyRedactions(page, config.privacyMode);
    const dir = path.join(run.screenshotsDir, viewport.name);
    fs.mkdirSync(dir, { recursive: true });
    const filename = screenshotFilename(state.index, state, viewport.name, 'full');
    const screenshotPath = path.join(dir, filename);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const metrics = await page.evaluate(() => ({
      pageHeight: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
      pageWidth: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: window.innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    })).catch(() => ({}));
    captured.push({
      stateId: state.id,
      viewport: viewport.name,
      width: viewport.width,
      height: viewport.height,
      path: path.relative(run.dir, screenshotPath).replace(/\\/g, '/'),
      absolutePath: screenshotPath,
      redaction,
      metrics,
    });
  }
  return captured;
}

async function generateContactSheets(browser, run, config, screenshots) {
  const byViewport = new Map();
  for (const item of screenshots) {
    if (!byViewport.has(item.viewport)) byViewport.set(item.viewport, []);
    byViewport.get(item.viewport).push(item);
  }
  fs.mkdirSync(run.contactSheetsDir, { recursive: true });
  const outputs = [];
  for (const viewport of config.viewports) {
    const items = byViewport.get(viewport.name) || [];
    const html = contactSheetHtml(viewport.name, items);
    const htmlPath = path.join(run.contactSheetsDir, `${viewport.name}.html`);
    const pngPath = path.join(run.contactSheetsDir, `${viewport.name}.png`);
    fs.writeFileSync(htmlPath, html);
    const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
    await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.screenshot({ path: pngPath, fullPage: true });
    await page.close();
    fs.rmSync(htmlPath, { force: true });
    outputs.push(path.relative(run.dir, pngPath).replace(/\\/g, '/'));
  }
  return outputs;
}

function contactSheetHtml(viewportName, items) {
  const cards = items.map((item) => {
    const rel = path.relative(path.dirname(path.join('contact-sheets', `${viewportName}.html`)), item.path).replace(/\\/g, '/');
    return `<figure><img src="../${item.path}" alt="${escapeHtml(item.stateId)} ${escapeHtml(item.viewport)}"><figcaption>${escapeHtml(item.stateId)}<br>${escapeHtml(item.path)}</figcaption></figure>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(viewportName)} contact sheet</title>
<style>
body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:18px}
h1{font-size:24px;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
figure{margin:0;border:1px solid #cbd5e1;background:#fff;padding:8px;break-inside:avoid}
img{width:100%;height:260px;object-fit:contain;object-position:top;background:#e2e8f0}
figcaption{font-size:11px;line-height:1.35;margin-top:6px;word-break:break-word}
</style>
</head>
<body><h1>${escapeHtml(viewportName)} contact sheet</h1><div class="grid">${cards}</div></body></html>`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

module.exports = {
  captureStateScreenshots,
  contactSheetHtml,
  generateContactSheets,
};
