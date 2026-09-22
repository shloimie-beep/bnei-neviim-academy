#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || process.env.BNA_APP_URL || DEFAULT_BASE_URL,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    }
  }
  options.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  return options;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchText(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      accept: options.accept || 'text/html,application/javascript,*/*;q=0.8',
      'cache-control': 'no-cache',
      'user-agent': 'codex-mobile-assistant-keyboard-live-smoke',
    },
  });
  const text = await response.text();
  return { response, text };
}

async function runCheck(report, name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.checks.push({ name, ok: true, duration_ms: Date.now() - started, details });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({ name, ok: false, duration_ms: Date.now() - started, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-mobile-assistant-keyboard-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-mobile-assistant-keyboard-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Mobile Assistant Keyboard Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name} (${check.duration_ms}ms)${check.error ? ` - ${check.error}` : ''}`),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function smokeKeyboardScenario(baseUrl, scenario) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: scenario.width, height: scenario.height },
    isMobile: true,
    hasTouch: true,
  });
  try {
    await page.route('**/api/bna/assistant/**', async (route) => {
      const url = route.request().url();
      const body = /\/chat$/.test(url)
        ? {
            success: true,
            anonymous_id: 'codex-mobile-keyboard-smoke',
            thread: { id: 560 },
            messages: [{ author_type: 'assistant', body: 'Layout smoke response.' }],
          }
        : { success: true, anonymous_id: 'codex-mobile-keyboard-smoke', threads: [], messages: [] };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(`${baseUrl}/?codex_mobile_assistant_keyboard_smoke=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.bna-bot-launcher', { timeout: 10000 });
    await page.evaluate((dir) => {
      document.documentElement.dir = dir;
      document.documentElement.lang = dir === 'rtl' ? 'he' : 'en';
    }, scenario.dir);
    await page.click('.bna-bot-launcher');
    await page.waitForSelector('.bna-bot-panel.is-open', { timeout: 10000 });
    await page.focus('.bna-bot-input');
    await page.waitForTimeout(340);
    await page.evaluate((keyboardHeight) => {
      const visibleHeight = Math.max(320, window.innerHeight - keyboardHeight);
      document.documentElement.style.setProperty('--app-vh', `${visibleHeight}px`);
      document.documentElement.style.setProperty('--keyboard-offset', `${keyboardHeight}px`);
      document.body.classList.add('bna-assistant-keyboard-open');
    }, scenario.keyboardHeight);
    await page.waitForTimeout(120);
    const metrics = await page.evaluate((keyboardHeight) => {
      const panel = document.querySelector('.bna-bot-panel');
      const form = document.querySelector('.bna-bot-form');
      const thread = document.querySelector('.bna-bot-thread');
      const launcher = document.querySelector('.bna-bot-launcher');
      const panelRect = panel.getBoundingClientRect();
      const formRect = form.getBoundingClientRect();
      const threadRect = thread.getBoundingClientRect();
      const doc = document.documentElement;
      const visibleBottom = window.innerHeight - keyboardHeight;
      return {
        app_vh: getComputedStyle(doc).getPropertyValue('--app-vh').trim(),
        keyboard_offset: getComputedStyle(doc).getPropertyValue('--keyboard-offset').trim(),
        panel_top: Math.round(panelRect.top),
        panel_bottom: Math.round(panelRect.bottom),
        panel_width: Math.round(panelRect.width),
        form_top: Math.round(formRect.top),
        form_bottom: Math.round(formRect.bottom),
        thread_height: Math.round(threadRect.height),
        visible_bottom: Math.round(visibleBottom),
        viewport_width: window.innerWidth,
        document_client_width: doc.clientWidth,
        document_scroll_width: doc.scrollWidth,
        body_scroll_width: document.body.scrollWidth,
        launcher_display: getComputedStyle(launcher).display,
      };
    }, scenario.keyboardHeight);
    assert(metrics.keyboard_offset === `${scenario.keyboardHeight}px`, `keyboard offset was ${metrics.keyboard_offset}`);
    assert(metrics.panel_top >= 0, `panel top is above viewport: ${metrics.panel_top}`);
    assert(metrics.form_bottom <= metrics.visible_bottom + 2, `composer bottom ${metrics.form_bottom} exceeds visible keyboard top ${metrics.visible_bottom}`);
    assert(metrics.thread_height > 80, `thread scroll region is too small: ${metrics.thread_height}`);
    assert(metrics.panel_width <= scenario.width - 14, `panel width ${metrics.panel_width} exceeds mobile viewport`);
    assert(metrics.document_scroll_width <= metrics.document_client_width + 2, `document horizontal overflow ${metrics.document_scroll_width}/${metrics.document_client_width}`);
    assert(metrics.body_scroll_width <= metrics.document_client_width + 2, `body horizontal overflow ${metrics.body_scroll_width}/${metrics.document_client_width}`);
    assert(metrics.launcher_display === 'none', `launcher should hide while keyboard is open, got ${metrics.launcher_display}`);
    return metrics;
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = {
    started_at: new Date().toISOString(),
    app_url: options.baseUrl,
    success: false,
    checks: [],
  };

  await runCheck(report, 'live assistant widget exposes keyboard layout contract', async () => {
    const { response, text } = await fetchText(options.baseUrl, '/js/bna-bot-widget.js', { accept: 'application/javascript,*/*;q=0.8' });
    assert(response.status === 200, `widget returned ${response.status}`);
    for (const snippet of [
      '--assistant-mobile-panel-height',
      'var(--keyboard-offset)',
      'keepAssistantComposerReachable',
      'handleAssistantViewportChange',
      'bna-assistant-keyboard-open',
    ]) {
      assert(text.includes(snippet), `widget missing ${snippet}`);
    }
    return { bytes: text.length };
  });

  for (const scenario of [
    { name: 'ltr 390px keyboard', width: 390, height: 844, keyboardHeight: 320, dir: 'ltr' },
    { name: 'rtl 360px keyboard', width: 360, height: 740, keyboardHeight: 280, dir: 'rtl' },
  ]) {
    await runCheck(report, `live helper stays above keyboard - ${scenario.name}`, async () => smokeKeyboardScenario(options.baseUrl, scenario));
  }

  report.success = report.checks.length > 0 && report.checks.every((check) => check.ok);
  const paths = writeReports(report);
  console.log(`Report: ${paths.markdown}`);
  if (!report.success) process.exitCode = 1;
}

main();
