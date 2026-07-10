#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.cwd();
const outDir = path.join(root, 'ops', 'playwright-smokes', '2026-06-24-one-time-canonical-journey-local');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForReady(baseUrl, child) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < 30000) {
    if (child.exitCode !== null) throw new Error(`Local server exited before ready with code ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/one-time`, { headers: { 'cache-control': 'no-cache' } });
      if (response.status === 200) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Local server did not become ready: ${lastError}`);
}

async function runViewport(browser, baseUrl, viewport) {
  const context = await browser.newContext({
    viewport: viewport.size,
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
  });
  const page = await context.newPage();
  const screenshots = [];
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  async function snap(name) {
    const filePath = path.join(outDir, `${viewport.id}-${name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    screenshots.push(path.relative(root, filePath).replace(/\\/g, '/'));
  }

  await page.goto(`${baseUrl}/one-time`, { waitUntil: 'domcontentloaded' });
  assert(await page.locator('a[href="/rabbi-member"]').count() >= 1, 'One Time landing should link to canonical member home');
  assert(await page.locator('a[href="/rabbi-member"]:visible').count() >= 1, 'One Time landing should expose a visible canonical member home link');
  assert(!(await page.content()).includes('/one-time/member-login'), 'One Time landing should not link to legacy member-login alias');
  await snap('one-time-landing');

  await page.locator('a[href="/rabbi-member"]:visible').first().click();
  await page.waitForURL(/\/rabbi-member(?:$|\?)/);
  await page.locator('nav[aria-label="One Time member navigation"]').waitFor();
  for (const label of ['Home', 'Library', 'Classroom', 'Support', 'Logout']) {
    await page.getByText(label, { exact: true }).first().waitFor();
  }
  assert(!(await page.content()).includes('Return to public site'), 'logged-in One Time member home should not show public-return links');
  assert(!(await page.content()).includes('One Time home'), 'logged-in One Time member home should not show public-home links');
  await snap('member-home');

  await page.goto(`${baseUrl}/one-time/member-login`, { waitUntil: 'domcontentloaded' });
  assert(page.url().includes('/rabbi-member'), 'legacy /one-time/member-login should redirect to /rabbi-member');

  await page.goto(`${baseUrl}/member`, { waitUntil: 'domcontentloaded' });
  assert(page.url().includes('/rabbi-member'), 'legacy /member should redirect to /rabbi-member');

  await page.goto(`${baseUrl}/member-library`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Logout', { exact: true }).first().waitFor();
  await snap('member-library');
  await page.evaluate(() => {
    localStorage.setItem('rabbi_member_session', 'test-session');
    localStorage.setItem('one_time_member_library_code', 'test-code');
    localStorage.setItem('oneTimeClassroomCode', 'test-classroom');
  });
  await page.getByText('Logout', { exact: true }).first().click();
  await page.waitForURL(/\/rabbi-member/);
  const cleared = await page.evaluate(() => ({
    session: localStorage.getItem('rabbi_member_session'),
    library: localStorage.getItem('one_time_member_library_code'),
    classroom: localStorage.getItem('oneTimeClassroomCode'),
  }));
  assert(!cleared.session && !cleared.library && !cleared.classroom, 'Logout should clear One Time member local state');

  await page.goto(`${baseUrl}/one-time-classroom`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Logout', { exact: true }).first().waitFor();
  await snap('classroom');

  await context.close();
  return { viewport: viewport.id, screenshots, console_errors: consoleErrors };
}

function writeReport(report) {
  ensureDir(outDir);
  const jsonPath = path.join(outDir, 'report.json');
  const mdPath = path.join(outDir, 'report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    '# One Time Canonical Journey Local Smoke',
    '',
    `Started: ${report.started_at}`,
    `Base URL: ${report.base_url}`,
    `Result: ${report.ok ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    '- One Time landing links to `/rabbi-member` and not `/one-time/member-login`.',
    '- Legacy `/one-time/member-login` and `/member` redirect to `/rabbi-member`.',
    '- Home, library, classroom, support, and logout expose module navigation without public-return detours.',
    '- Logout clears local One Time member state.',
    '',
    '## Screenshots',
    ...report.viewports.flatMap((viewport) => viewport.screenshots.map((shot) => `- ${shot}`)),
    '',
    'Guardrail: local server ran with `ONE_TIME_REVIEW_ONLY_NO_DB=1`; no production readback, database mutation, external send, publish, upload, charge, DNS, OAuth, or secret request was performed.',
    '',
  ];
  fs.writeFileSync(mdPath, lines.join('\n'));
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  ensureDir(outDir);
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      ONE_TIME_REVIEW_ONLY_NO_DB: '1',
      DATABASE_URL: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));

  const report = {
    started_at: new Date().toISOString(),
    base_url: baseUrl,
    ok: false,
    viewports: [],
    server_log_tail: [],
  };

  let browser;
  try {
    await waitForReady(baseUrl, child);
    browser = await chromium.launch({ headless: true });
    for (const viewport of [
      { id: 'desktop', size: { width: 1280, height: 900 }, mobile: false },
      { id: 'mobile', size: { width: 390, height: 844 }, mobile: true },
    ]) {
      report.viewports.push(await runViewport(browser, baseUrl, viewport));
    }
    report.ok = true;
  } finally {
    if (browser) await browser.close();
    child.kill();
    report.server_log_tail = logs.join('').split(/\r?\n/).filter(Boolean).slice(-20);
    report.paths = writeReport(report);
  }

  if (!report.ok) {
    console.error(`One Time canonical journey local smoke failed. Reports: ${report.paths.markdown} ${report.paths.json}`);
    process.exitCode = 1;
  } else {
    console.log(`One Time canonical journey local smoke passed. Reports: ${report.paths.markdown} ${report.paths.json}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
