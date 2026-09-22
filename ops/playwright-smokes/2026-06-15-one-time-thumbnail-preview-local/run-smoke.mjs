import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

async function parseEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const result = {};
    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator <= 0) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

const root = process.cwd();
const env = { ...(await parseEnvFile(path.join(root, '.env.local'))), ...process.env };
const outDir = env.SMOKE_OUT_DIR
  ? path.resolve(root, env.SMOKE_OUT_DIR)
  : path.join(root, 'ops', 'playwright-smokes', '2026-06-15-one-time-thumbnail-preview-local');
await fs.mkdir(outDir, { recursive: true });

const operationsHtml = await fs.readFile(path.join(root, 'public', 'operations.html'), 'utf8');
const contractChecks = [
  ['oneTimeThumbnailPreviewData helper exists', /function oneTimeThumbnailPreviewData\(job = \{\}\)/.test(operationsHtml)],
  ['renderOneTimeThumbnailPreview helper exists', /function renderOneTimeThumbnailPreview\(job = \{\}\)/.test(operationsHtml)],
  ['thumbnail_brief metadata is consulted', /outputForJob\(job, 'thumbnail_brief'\)/.test(operationsHtml) && /contentOutputMetadata\(output\)/.test(operationsHtml)],
  ['metadata.thumbnail_url is accepted', /metadata\.thumbnail_url/.test(operationsHtml)],
  ['metadata.thumbnailUrl is accepted', /metadata\.thumbnailUrl/.test(operationsHtml)],
  ['parsed thumbnail URL fallback is accepted', /parsed\.thumbnail_url/.test(operationsHtml) && /parsed\.thumbnailUrl/.test(operationsHtml)],
  ['job thumbnail/image URL fallback is accepted', /job\.thumbnail_url/.test(operationsHtml) && /job\.image_url/.test(operationsHtml)],
  ['URL is limited to HTTP(S)', /\^https\?:\\\/\\\//.test(operationsHtml)],
  ['thumbnail preview card is rendered in One Time library card', /<div class="event-type">Thumbnail Preview<\/div>/.test(operationsHtml) && /renderOneTimeThumbnailPreview\(job\)/.test(operationsHtml)],
  ['Open Thumbnail link is rendered when URL exists', /Open Thumbnail/.test(operationsHtml)],
  ['missing state is rendered when URL is absent', /Thumbnail reference missing/.test(operationsHtml)],
  ['thumbnail CSS frame exists', /\.one-time-thumbnail-frame/.test(operationsHtml) && /object-fit:\s*cover/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static thumbnail contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
if (!username || !password) {
  throw new Error('Smoke Operations credentials are required');
}
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
let routedImageHits = 0;
await context.route('https://cdn.example.com/mishnah-aleph-thumb.jpg', async (route) => {
  routedImageHits += 1;
  await route.fulfill({
    status: 200,
    contentType: 'image/svg+xml',
    body: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#0f172a"/><rect x="38" y="36" width="564" height="288" rx="26" fill="#1d4ed8" opacity="0.9"/><circle cx="320" cy="180" r="58" fill="#f8fafc"/><polygon points="304,145 304,215 360,180" fill="#1d4ed8"/><text x="320" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#f8fafc">Mishnah Aleph Thumbnail</text></svg>`,
  });
});

const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

const returnTo = encodeURIComponent('/operations?workspace=rabbi_sheller_provider&view=content&section=one-time-library');
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 15000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => document.title === 'BNA Operations' && document.body.textContent.includes('One Time Library'), null, { timeout: 15000 });

const appContract = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  helperGlobals: {
    oneTimeThumbnailPreviewData: typeof window.oneTimeThumbnailPreviewData,
    renderOneTimeThumbnailPreview: typeof window.renderOneTimeThumbnailPreview,
    renderOneTimeLibraryCard: typeof window.renderOneTimeLibraryCard,
  },
  cssPresent: Array.from(document.querySelectorAll('style')).some((style) => style.textContent.includes('.one-time-thumbnail-frame')),
  oneTimeLibraryPresent: document.body.textContent.includes('One Time Library'),
}));
if (!appContract.cssPresent || !appContract.oneTimeLibraryPresent || appContract.helperGlobals.renderOneTimeLibraryCard !== 'function') {
  throw new Error(`Authenticated Operations contract missing: ${JSON.stringify(appContract)}`);
}

const fixtureImageUrl = 'https://cdn.example.com/mishnah-aleph-thumb.jpg';

async function injectRenderedCard(targetPage) {
  await targetPage.evaluate((url) => {
    document.querySelector('#thumbnail-preview-smoke-fixture')?.remove();
    const now = new Date().toISOString();
    const fakeJob = {
      id: 999001,
      project_key: 'mishna',
      title: 'Mishnah Aleph Uploaded Video',
      caption: 'Display-only thumbnail preview smoke item',
      status: 'needs_approval',
      media_type: 'video',
      media_url: 'https://video.example.com/mishnah-aleph.mp4',
      hosted_media_url: 'https://video.example.com/hosted/mishnah-aleph.mp4',
      uploaded_at: now,
      created_at: now,
      parse_json: JSON.stringify({
        content_kind: 'one_time_video_library_item',
        summary: 'A short class upload ready for internal library review.',
        topics: ['Mishnah Aleph', 'Review'],
      }),
      outputs: [
        { output_type: 'video_library_item', status: 'approved', body: 'Library title and summary prepared for review.', metadata: '{}', updated_at: now, created_at: now },
        { output_type: 'transcript_review', status: 'approved', body: 'Transcript review complete for smoke verification.', metadata: '{}', updated_at: now, created_at: now },
        { output_type: 'thumbnail_brief', status: 'needs_approval', body: 'Use the uploaded class still with clear One Time Mishnah branding.', metadata: JSON.stringify({ thumbnail_url: url, thumbnail_status: 'thumbnail_received' }), updated_at: now, created_at: now },
      ],
    };
    const fixture = document.createElement('section');
    fixture.id = 'thumbnail-preview-smoke-fixture';
    fixture.style.cssText = 'max-width: 1100px; margin: 24px auto; padding: 0 16px;';
    fixture.innerHTML = `
      ${window.renderOneTimeLibraryCard(fakeJob)}
      <div class="content-library-card expanded one-time-library-item" id="one-time-missing-thumbnail-smoke">
        <div class="content-card-expanded" style="display:block;">
          <div class="content-section-grid">
            <div class="event-card">
              <div class="event-type">Missing Thumbnail State</div>
              ${window.renderOneTimeThumbnailPreview({ id: 999002, title: 'Missing Thumbnail Smoke', outputs: [] })}
            </div>
          </div>
        </div>
      </div>`;
    const main = document.querySelector('main') || document.body;
    main.prepend(fixture);
    fixture.scrollIntoView({ block: 'center' });
  }, fixtureImageUrl);
  await targetPage.waitForSelector('#thumbnail-preview-smoke-fixture .one-time-thumbnail-frame img', { timeout: 10000 });
  await targetPage.waitForTimeout(750);
}

function metricScript() {
  const fixture = document.querySelector('#thumbnail-preview-smoke-fixture');
  const previewCard = Array.from(fixture.querySelectorAll('.event-card')).find((card) => card.textContent.includes('Thumbnail Preview'));
  const frame = previewCard.querySelector('.one-time-thumbnail-frame');
  const img = previewCard.querySelector('img');
  const openLink = previewCard.querySelector(`a[href="${img.getAttribute('src')}"]`);
  const missing = fixture.querySelector('.one-time-thumbnail-empty');
  const frameBox = frame.getBoundingClientRect();
  const imgBox = img.getBoundingClientRect();
  const linkBox = openLink.getBoundingClientRect();
  return {
    viewport: { width: innerWidth, height: innerHeight },
    frame: { width: Math.round(frameBox.width), height: Math.round(frameBox.height) },
    image: {
      width: Math.round(imgBox.width),
      height: Math.round(imgBox.height),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      currentSrc: img.currentSrc,
      alt: img.getAttribute('alt'),
    },
    linkText: openLink.textContent.trim(),
    linkHref: openLink.getAttribute('href'),
    missingText: missing.textContent.trim(),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
    linkBelowFrame: linkBox.top > frameBox.top,
    renderedThroughLibraryCard: Boolean(fixture.querySelector('#one-time-library-item-999001')),
    fixtureTextPresent: fixture.textContent.includes('Thumbnail Preview') && fixture.textContent.includes('Thumbnail reference missing'),
  };
}

await injectRenderedCard(page);
const desktopMetrics = await page.evaluate(metricScript);
if (!desktopMetrics.renderedThroughLibraryCard || !desktopMetrics.noHorizontalOverflow || desktopMetrics.frame.width < 280 || desktopMetrics.linkText !== 'Open Thumbnail' || desktopMetrics.linkHref !== fixtureImageUrl || desktopMetrics.missingText !== 'Thumbnail reference missing' || desktopMetrics.image.naturalWidth < 1) {
  throw new Error(`Desktop rendered-card metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

await page.setViewportSize({ width: 390, height: 900 });
await injectRenderedCard(page);
const mobileMetrics = await page.evaluate(metricScript);
if (!mobileMetrics.renderedThroughLibraryCard || !mobileMetrics.noHorizontalOverflow || mobileMetrics.frame.width > 390 || mobileMetrics.linkHref !== fixtureImageUrl || !mobileMetrics.fixtureTextPresent || mobileMetrics.image.naturalWidth < 1) {
  throw new Error(`Mobile rendered-card metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });

await browser.close();

const target = `${baseUrl}/operations?workspace=rabbi_sheller_provider&view=content&section=one-time-library`;
const report = `# One Time Thumbnail Preview ${env.SMOKE_LABEL || 'Local'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations loaded, the One Time library thumbnail preview contract is present in \`public/operations.html\`, and \`renderOneTimeLibraryCard\` rendered the new thumbnail preview card correctly at desktop and mobile sizes.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

- PASS login form accepted the smoke Operations credentials and redirected to authenticated Operations.
- PASS Operations page title was \`${appContract.title}\`.
- PASS One Time Library navigation text was visible.
- PASS thumbnail CSS was present in the loaded Operations page.
- PASS helper globals were callable in the authenticated page: ${JSON.stringify(appContract.helperGlobals)}.
- PASS actual \`renderOneTimeLibraryCard\` output produced \`#one-time-library-item-999001\` with \`Thumbnail Preview\`, loaded mock thumbnail image, and \`Open Thumbnail\` link.
- PASS actual \`renderOneTimeThumbnailPreview\` missing-state output rendered \`Thumbnail reference missing\`.
- PASS desktop rendered-card metrics: ${JSON.stringify(desktopMetrics)}
- PASS mobile rendered-card metrics: ${JSON.stringify(mobileMetrics)}
- INFO routed mock thumbnail hits during smoke: ${routedImageHits}

## Screenshots

- ${screenshotPrefix}desktop.png
- ${screenshotPrefix}mobile.png

## Guardrails

No email, WhatsApp, social post, checkout/access change, Drive/video-host write, external CRM write, member-library publish, or Buffer action was triggered. The smoke injected a local fake content job into the already-loaded Operations DOM only for visual verification.

## Console

${consoleErrors.length ? consoleErrors.map((line) => `- ${line}`).join('\n') : '- No page console errors captured during smoke.'}
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, appContract, desktopMetrics, mobileMetrics, routedImageHits, consoleErrors }, null, 2));
