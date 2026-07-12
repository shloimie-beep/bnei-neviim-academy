#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-11-onetime-p0p1-corrective');

async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch (error) {
    const bundledNodeModules = process.env.CODEX_NODE_MODULES
      || process.env.CODEX_WORKSPACE_NODE_MODULES
      || path.join(
        process.env.USERPROFILE || 'C:\\Users\\User',
        '.cache',
        'codex-runtimes',
        'codex-primary-runtime',
        'dependencies',
        'node',
        'node_modules'
      );
    return require(path.join(bundledNodeModules, 'playwright')).chromium;
  }
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

function json(res, body, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function serve(req, res, baseUrl) {
  const url = new URL(req.url || '/', baseUrl);
  if (url.pathname === '/api/one-time/interest') {
    json(res, {
      success: true,
      lead: { id: 7101, crm_lead_id: 8101 },
      product_lead_id: 7101,
      crm_lead_id: 8101,
      no_send: true,
      no_checkout: true,
      no_access_granted: true,
      no_email_sent: true,
      no_whatsapp_or_wapi_sent: true,
      no_telegram_reminder_sent: true,
      external_write_performed: false
    });
    return;
  }
  if (url.pathname === '/api/one-time/mishnah/onboarding') {
    json(res, {
      success: true,
      dry_run: false,
      no_send: true,
      no_checkout: true,
      no_access_granted: true,
      external_write_performed: false,
      lead_id: 7101,
      contact_id: 9101
    });
    return;
  }
  if (url.pathname.startsWith('/api/')) {
    json(res, { success: true, messages: [], threads: [], no_send: true, external_write_performed: false });
    return;
  }

  let requested = url.pathname;
  if (requested === '/' || requested === '/one-time') requested = '/one-time/index.html';
  if (requested === '/one-time-onboarding' || requested === '/one-time-preview' || requested === '/preview/one-time-mishnah') {
    requested = '/one-time-preview.html';
  }
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(publicDir, safePath);
  try {
    const bytes = await readFile(filePath);
    res.writeHead(200, { 'content-type': contentType(filePath), 'cache-control': 'no-store' });
    res.end(bytes);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

async function startServer() {
  await mkdir(outDir, { recursive: true });
  const server = createServer((req, res) => {
    const baseUrl = `http://${req.headers.host || '127.0.0.1'}`;
    serve(req, res, baseUrl).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error.stack || error.message);
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function main() {
  const { server, baseUrl } = await startServer();
  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    screenshots: [],
    assertions: []
  };

  function ok(name, details = {}) {
    report.assertions.push({ name, ok: true, ...details });
  }

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
    await page.goto(`${baseUrl}/one-time`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, 'one-time-landing-1440.png'), fullPage: true });
    report.screenshots.push('ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-landing-1440.png');

    await page.getByText('Worldwide Mishnah learning').waitFor();
    await page.getByText('Live from Israel. Every day at 7 p.m. Israel time.').waitFor();
    const ctaTexts = await page.locator('[data-signup-trigger]').evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()));
    if (!ctaTexts.length || ctaTexts.some((text) => text !== 'Sign Up Now')) throw new Error(`Unexpected CTA labels: ${ctaTexts.join(', ')}`);
    ok('landing_cta_labels', { count: ctaTexts.length });

    const bodyText = await page.locator('body').innerText();
    for (const forbidden of ['See How It Works', 'Join the Free Class', 'Preview only', 'TBD', 'Approval checklist']) {
      if (bodyText.includes(forbidden)) throw new Error(`Forbidden landing text remains: ${forbidden}`);
    }
    ok('landing_forbidden_text_absent');

    await page.locator('[data-signup-trigger]:visible').first().click();
    await page.locator('[data-signup-modal].open').waitFor();
    const modalText = await page.locator('[data-signup-modal]').innerText();
    if (/student name/i.test(modalText)) throw new Error('Signup modal still asks for student name.');
    await page.locator('input[name="parent_name"]').fill('Local Smoke Parent');
    await page.locator('input[name="email"]').fill('parent@example.invalid');
    await page.locator('input[name="phone"]').fill('+15550101188');
    await page.locator('[data-signup-form] button[type="submit"]').click();
    await page.locator('[data-success-step].active').waitFor();
    await page.locator('input[name="signup_audience"][value="family"]').check();
    await page.screenshot({ path: path.join(outDir, 'one-time-signup-success-1440.png'), fullPage: true });
    report.screenshots.push('ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-signup-success-1440.png');
    await page.locator('[data-continue-onboarding]').click();
    await page.waitForURL(/\/one-time-onboarding/);
    ok('signup_to_onboarding_handoff', { url: page.url() });

    await page.getByText('Finish your signup for Rabbi Scheller').waitFor();
    await page.getByText('No email, WhatsApp, Telegram, or campaign message is sent.').waitFor();
    await page.locator('input[name="audience_type"][value="school"]').check();
    await page.locator('input[name="school_name"]').fill('Local Smoke Yeshiva');
    await page.locator('input[name="school_role"]').fill('Principal');
    await page.locator('textarea[name="school_questions"]').fill('We want to review the daily schedule.');
    await page.locator('[data-action-id="ACTION-ONETIME-ONBOARDING-SUBMIT"]').click();
    await page.getByText('Saved. The One Time team will review the right next step. No external message was sent.').waitFor();
    await page.screenshot({ path: path.join(outDir, 'one-time-onboarding-school-success-1440.png'), fullPage: true });
    report.screenshots.push('ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-onboarding-school-success-1440.png');
    ok('onboarding_school_success');

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await mobile.goto(`${baseUrl}/one-time`, { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: path.join(outDir, 'one-time-landing-390.png'), fullPage: true });
    report.screenshots.push('ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-landing-390.png');
    const launcherAvatar = mobile.locator('.bna-bot-launcher .bna-bot-avatar');
    await launcherAvatar.waitFor({ timeout: 5000 });
    await mobile.locator('.bna-bot-launcher').screenshot({ path: path.join(outDir, 'one-time-robot-launcher-390.png') });
    report.screenshots.push('ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-robot-launcher-390.png');
    const avatarState = await launcherAvatar.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        tagName: node.tagName.toLowerCase(),
        src: node.getAttribute('src') || '',
        objectFit: style.objectFit,
        width: Math.round(node.getBoundingClientRect().width),
        height: Math.round(node.getBoundingClientRect().height),
      };
    });
    if (avatarState.tagName !== 'img' || !avatarState.src.includes('robot-scheller-whatsapp.png') || avatarState.objectFit !== 'contain') {
      throw new Error(`Robot avatar is not using contained full-body asset: ${JSON.stringify(avatarState)}`);
    }
    ok('robot_scheller_contained_asset', avatarState);

    await mobile.goto(`${baseUrl}/one-time-onboarding?audience=family&product_lead_id=7101&crm_lead_id=8101`, { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: path.join(outDir, 'one-time-onboarding-family-390.png'), fullPage: true });
    report.screenshots.push('ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-onboarding-family-390.png');
    const onboardingText = await mobile.locator('body').innerText();
    for (const forbidden of ['Preview only', 'TBD', 'Approval checklist']) {
      if (onboardingText.includes(forbidden)) throw new Error(`Forbidden onboarding text remains: ${forbidden}`);
    }
    ok('onboarding_forbidden_text_absent');
  } finally {
    await browser.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
  }

  await writeFile(path.join(outDir, 'public-onboarding-smoke.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'public-onboarding-smoke.md'), [
    '# One Time Public Onboarding Smoke',
    '',
    `Generated: ${report.generated_at}`,
    `Base URL: ${report.base_url}`,
    '',
    '## Assertions',
    '',
    ...report.assertions.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name}`),
    '',
    '## Screenshots',
    '',
    ...report.screenshots.map((item) => `- ${item}`),
    ''
  ].join('\n'));
  console.log(JSON.stringify({ ok: true, report: 'ops/ui-audits/2026-07-11-onetime-p0p1-corrective/public-onboarding-smoke.md', screenshots: report.screenshots }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
