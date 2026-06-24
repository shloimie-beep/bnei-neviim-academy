#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.cwd();
const runId = '2026-06-24-owner-review-public-visual';
const outDir = path.join(root, 'ops', 'playwright-smokes', runId);
const docsDir = path.join(root, 'docs', 'owner-review');
const reportJson = path.join(outDir, 'report.json');
const reportMd = path.join(outDir, 'report.md');
const visualDoc = path.join(docsDir, 'PUBLIC-VISUAL-AUDIT.md');
const productionUrl = process.env.BNA_PUBLIC_PRODUCTION_URL || 'https://bneineviimacademy.org/';

const viewports = [
  { id: 'mobile-390', width: 390, height: 844 },
  { id: 'tablet-768', width: 768, height: 1024 },
  { id: 'desktop-1440', width: 1440, height: 900 },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
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
    if (child.exitCode !== null) throw new Error(`Local server exited early with code ${child.exitCode}`);
    try {
      const response = await fetch(baseUrl, { headers: { 'cache-control': 'no-cache' } });
      if (response.status === 200) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Local server did not become ready: ${lastError}`);
}

function parseRgb(value) {
  const match = String(value || '').match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const [r, g, b, a = '1'] = match[1].split(',').map((part) => Number(part.trim()));
  if (![r, g, b].every(Number.isFinite)) return null;
  return { r, g, b, a: Number.isFinite(a) ? a : 1 };
}

function srgb(value) {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  return 0.2126 * srgb(color.r) + 0.7152 * srgb(color.g) + 0.0722 * srgb(color.b);
}

function contrastRatio(foreground, background) {
  if (!foreground || !background) return null;
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function escapeMd(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

async function gitHead() {
  return await new Promise((resolve) => {
    const child = spawn('git', ['rev-parse', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.on('close', () => resolve(output.trim() || 'unknown'));
  });
}

async function inspectPage(page, url, targetId, viewport) {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon|Failed to load resource/i.test(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForSelector('.hero', { timeout: 12000 });
  await page.waitForTimeout(750);

  const screenshotPath = path.join(outDir, `${targetId}-${viewport.id}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const metrics = await page.evaluate(() => {
    function visible(el) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    }
    const header = Array.from(document.querySelectorAll('.bna-site-nav, body > nav')).find(visible);
    const hero = document.querySelector('.hero');
    const headerRect = header?.getBoundingClientRect();
    const heroRect = hero?.getBoundingClientRect();
    const activeCandidates = Array.from(document.querySelectorAll(
      '.home-filter-chip.is-active, .bna-site-nav-link.is-active, [role="tab"][aria-selected="true"], [aria-current="page"]',
    )).filter(visible);
    const tabMetrics = activeCandidates.map((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        selector: el.matches('.home-filter-chip') ? '.home-filter-chip.is-active'
          : el.matches('.bna-site-nav-link') ? '.bna-site-nav-link.is-active'
            : el.getAttribute('role') === 'tab' ? '[role="tab"][aria-selected="true"]'
              : '[aria-current="page"]',
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80),
        color: style.color,
        backgroundColor: style.backgroundColor,
        ariaCurrent: el.getAttribute('aria-current') || '',
        ariaSelected: el.getAttribute('aria-selected') || '',
        ariaPressed: el.getAttribute('aria-pressed') || '',
        role: el.getAttribute('role') || '',
        width: rect.width,
        height: rect.height,
      };
    });
    const placeholders = Array.from(document.querySelectorAll('body *'))
      .filter(visible)
      .map((el) => (el.textContent || '').trim())
      .filter((text) => /graphic placeholder|placeholder|coming soon/i.test(text))
      .slice(0, 20);
    return {
      title: document.title,
      url: window.location.href,
      header: headerRect ? { top: headerRect.top, bottom: headerRect.bottom, height: headerRect.height } : null,
      hero: heroRect ? { top: heroRect.top, bottom: heroRect.bottom, height: heroRect.height } : null,
      heroMarginTop: hero ? getComputedStyle(hero).marginTop : null,
      tabMetrics,
      placeholders,
      horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    };
  });

  const gapPx = metrics.header && metrics.hero ? metrics.hero.top - metrics.header.bottom : null;
  const tabs = metrics.tabMetrics.map((tab) => {
    const ratio = contrastRatio(parseRgb(tab.color), parseRgb(tab.backgroundColor));
    const semanticOk = tab.selector === '.home-filter-chip.is-active'
      ? tab.ariaPressed === 'true'
      : Boolean(tab.ariaCurrent || tab.ariaSelected === 'true' || tab.role === 'tab');
    return {
      ...tab,
      contrastRatio: ratio == null ? null : Number(ratio.toFixed(2)),
      contrastOk: ratio != null && ratio >= 4.5,
      semanticOk,
    };
  });
  return {
    target: targetId,
    viewport: viewport.id,
    url,
    screenshot: rel(screenshotPath),
    headerHeroGapPx: gapPx == null ? null : Number(gapPx.toFixed(2)),
    headerHeroGapOk: gapPx != null && Math.abs(gapPx) <= 1,
    heroMarginTop: metrics.heroMarginTop,
    horizontalOverflowPx: metrics.horizontalOverflowPx,
    tabs,
    activeTabContrastOk: tabs.every((tab) => tab.contrastOk),
    activeTabSemanticsOk: tabs.every((tab) => tab.semanticOk),
    placeholders: metrics.placeholders,
    consoleErrors,
  };
}

function summarize(rows) {
  const localFailures = [];
  const productionDefects = [];
  for (const row of rows) {
    const rowFailures = [];
    if (!row.headerHeroGapOk) rowFailures.push({ target: row.target, viewport: row.viewport, check: 'header_hero_gap', value: row.headerHeroGapPx });
    if (!row.activeTabContrastOk) rowFailures.push({ target: row.target, viewport: row.viewport, check: 'active_tab_contrast', tabs: row.tabs.filter((tab) => !tab.contrastOk) });
    if (!row.activeTabSemanticsOk) rowFailures.push({ target: row.target, viewport: row.viewport, check: 'active_tab_semantics', tabs: row.tabs.filter((tab) => !tab.semanticOk) });
    if (row.horizontalOverflowPx > 1) rowFailures.push({ target: row.target, viewport: row.viewport, check: 'horizontal_overflow', value: row.horizontalOverflowPx });
    if (row.consoleErrors.length) rowFailures.push({ target: row.target, viewport: row.viewport, check: 'console_errors', value: row.consoleErrors });
    if (row.target === 'release-local') localFailures.push(...rowFailures);
    else productionDefects.push(...rowFailures);
  }
  return {
    ok: localFailures.length === 0,
    pr14_local_ok: localFailures.length === 0,
    production_public_ok: productionDefects.length === 0,
    failures: localFailures,
    production_defects: productionDefects,
  };
}

function writeReports(report) {
  ensureDir(outDir);
  ensureDir(docsDir);
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);
  const rows = report.rows.map((row) => [
    row.target,
    row.viewport,
    row.headerHeroGapPx,
    row.headerHeroGapOk ? 'yes' : 'no',
    row.heroMarginTop,
    row.activeTabContrastOk ? 'yes' : 'no',
    row.activeTabSemanticsOk ? 'yes' : 'no',
    row.horizontalOverflowPx,
    row.placeholders.length,
    row.consoleErrors.length,
    row.screenshot,
  ]);
  const lines = [
    '# Public Visual Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Release candidate SHA: ${report.release_candidate_sha}`,
    `Production URL: ${report.production_url}`,
    `Result: ${report.summary.ok ? 'PASS' : 'NEEDS REVIEW'}`,
    '',
    'Guardrail: production checks are anonymous public GET/browser reads only. No external credentials, production database reads, writes, deploys, sends, uploads, charges, DNS changes, or secret reads were performed.',
    '',
    '| Target | Viewport | Header/hero gap px | Gap <= 1px | Hero margin-top | Active contrast | Active semantics | Overflow px | Placeholder hits | Console errors | Screenshot |',
    '| --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...rows.map((row) => `| ${row.map(escapeMd).join(' | ')} |`),
    '',
    '## Active Tab Contrast Details',
    '',
    '| Target | Viewport | Selector | Text | Color | Background | Contrast | Contrast OK | Semantics OK |',
    '| --- | --- | --- | --- | --- | --- | ---: | --- | --- |',
    ...report.rows.flatMap((row) => row.tabs.map((tab) => `| ${[row.target, row.viewport, tab.selector, tab.text, tab.color, tab.backgroundColor, tab.contrastRatio ?? 'n/a', tab.contrastOk ? 'yes' : 'no', tab.semanticOk ? 'yes' : 'no'].map(escapeMd).join(' | ')} |`)),
    '',
    '## Defects',
    '',
    report.summary.failures.length ? JSON.stringify(report.summary.failures, null, 2) : 'No release-local blocking visual defects detected by computed assertions.',
    '',
    '## Production Public Delta',
    '',
    report.summary.production_defects.length ? JSON.stringify(report.summary.production_defects, null, 2) : 'No production-only visual defects detected by computed assertions.',
    '',
  ];
  fs.writeFileSync(reportMd, lines.join('\n'));
  fs.writeFileSync(visualDoc, lines.join('\n'));
}

async function main() {
  ensureDir(outDir);
  const port = await freePort();
  const localUrl = `http://127.0.0.1:${port}/`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', ONE_TIME_REVIEW_ONLY_NO_DB: '1', DATABASE_URL: '', BNA_OWNER_REVIEW_QA: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));
  let browser;
  const rows = [];
  try {
    await waitForReady(localUrl, child);
    browser = await chromium.launch({ headless: true });
    for (const viewport of viewports) {
      for (const target of [
        { id: 'release-local', url: localUrl },
        { id: 'production-public', url: productionUrl },
      ]) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.width < 768, hasTouch: viewport.width < 768 });
        if (target.id === 'release-local') {
          await context.route('**/api/torah-learning/public-summary', async (route) => {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                date: '2026-06-24',
                group: { groupPercentage: 15, tripUnlocked: false },
                metrics: {
                  activeStudentCount: 5,
                  completedStudentCount: 0,
                  averageClassTripPercentage: 15,
                  averageDailyCompletionPercentage: 0,
                },
              }),
            });
          });
        }
        const page = await context.newPage();
        try {
          rows.push(await inspectPage(page, target.url, target.id, viewport));
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    if (browser) await browser.close();
    child.kill();
  }
  const report = {
    generated_at: new Date().toISOString(),
    release_candidate_sha: await gitHead(),
    production_url: productionUrl,
    guardrails: {
      external_credentials: false,
      production_private_state_readback: false,
      production_database_mutation: false,
      deploy: false,
      external_write: false,
    },
    rows,
    summary: summarize(rows),
    server_log_tail: logs.join('').split(/\r?\n/).filter(Boolean).slice(-30),
  };
  writeReports(report);
  if (!report.summary.ok) {
    console.error(`Public visual audit needs release-candidate review. Reports: ${rel(reportMd)} ${rel(reportJson)}`);
    console.error(JSON.stringify(report.summary.failures, null, 2));
    process.exitCode = 1;
    return;
  }
  if (!report.summary.production_public_ok) {
    console.log(`Public visual audit passed for release-local; production still has recorded deltas. Reports: ${rel(reportMd)} ${rel(reportJson)}`);
    return;
  }
  console.log(`Public visual audit passed for release-local and production public. Reports: ${rel(reportMd)} ${rel(reportJson)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
