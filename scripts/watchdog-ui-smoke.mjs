#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addFinding,
  isFailureSeverity,
  overallSeverity,
  printCliResult,
  readText,
  relative,
  repoRoot,
  writeWatchdogReport,
} from './lib/watchdog-common.mjs';

const DEFAULT_ROUTES = [
  { route: '/', file: 'public/index.html' },
  { route: '/parent/login', file: 'public/parent-login.html' },
  { route: '/parent', file: 'public/parent.html' },
  { route: '/student', file: 'public/student.html' },
  { route: '/provider', file: 'public/provider.html' },
  { route: '/operations', file: 'public/operations.html' },
];

function parseBaseUrl(argv = process.argv.slice(2)) {
  const arg = argv.find((item) => item.startsWith('--base-url='));
  return arg ? arg.split('=').slice(1).join('=') : '';
}

export async function buildUiSmokeAudit({ baseUrl = '', routes = DEFAULT_ROUTES } = {}) {
  const findings = [];
  const checked = [];
  for (const route of routes) {
    const filePath = path.join(repoRoot, route.file);
    const html = readText(filePath);
    if (!html) {
      addFinding(findings, {
        severity: 'high',
        category: 'ui-smoke',
        title: `Missing route file ${route.file}`,
        details: 'Core UI routes must have a static HTML entry or documented replacement.',
        evidence: [route.file],
        recommended_fix: 'Restore the route file or update the route registry and smoke plan.',
        goal_ids: ['GOAL-CORE-003'],
      });
      continue;
    }
    checked.push(route.route);
    if (!/<title\b/i.test(html)) {
      addFinding(findings, {
        severity: 'medium',
        category: 'ui-smoke',
        title: `${route.route} has no document title`,
        details: 'Core routes should have a title for polish and browser/tab usability.',
        evidence: [route.file],
        recommended_fix: 'Add a concise page title.',
        goal_ids: ['GOAL-CORE-001'],
      });
    }
    if (/<button(?![^>]*(?:aria-label|title)=)[^>]*>\s*<\/button>/i.test(html)) {
      addFinding(findings, {
        severity: 'medium',
        category: 'ui-smoke',
        title: `${route.route} has an empty button`,
        details: 'Visible actions need a label, icon aria-label, or disabled reason.',
        evidence: [route.file],
        recommended_fix: 'Add accessible text/aria-label or remove the empty button.',
        goal_ids: ['GOAL-CORE-002'],
      });
    }
    if (/overflow-x:\s*scroll|width:\s*100vw/i.test(html) && !/overflow-x:\s*hidden/i.test(html)) {
      addFinding(findings, {
        severity: 'low',
        category: 'ui-smoke',
        title: `${route.route} may need mobile overflow verification`,
        details: 'Static scan saw overflow-prone CSS; browser smoke should confirm mobile layout.',
        evidence: [route.file],
        recommended_fix: 'Run this script with --base-url and inspect 390px viewport if the route changed.',
        goal_ids: ['GOAL-CORE-004'],
      });
    }
  }

  if (baseUrl) {
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      for (const route of routes) {
        const url = `${baseUrl.replace(/\/+$/, '')}${route.route === '/' ? '/' : route.route}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const width = await page.evaluate(() => document.documentElement.scrollWidth);
        if (width > 410) {
          addFinding(findings, {
            severity: 'high',
            category: 'ui-smoke',
            title: `${route.route} has mobile horizontal overflow`,
            details: `390px viewport produced document width ${width}px.`,
            evidence: [url],
            recommended_fix: 'Fix the overflowing selector and rerun watchdog:ui.',
            goal_ids: ['GOAL-CORE-004'],
          });
        }
      }
      await browser.close();
    } catch (error) {
      addFinding(findings, {
        severity: 'medium',
        category: 'ui-smoke',
        title: 'Browser UI smoke skipped/failed',
        details: error instanceof Error ? error.message : String(error),
        evidence: [baseUrl],
        recommended_fix: 'Start the local app and rerun npm run watchdog:ui -- --base-url=http://localhost:PORT.',
        goal_ids: ['GOAL-CORE-001', 'GOAL-CORE-004'],
      });
    }
  }

  const report = writeWatchdogReport({
    kind: 'watchdog-ui-smoke',
    title: 'Watchdog UI Smoke',
    summaryLines: [
      `Static routes checked: ${checked.length}`,
      baseUrl ? `Browser base URL: ${baseUrl}` : 'Browser run: skipped; pass --base-url to enable.',
    ],
    findings,
  });
  const severity = overallSeverity(findings);
  return { ok: !findings.some((finding) => isFailureSeverity(finding.severity)), severity, findings, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = await buildUiSmokeAudit({ baseUrl: parseBaseUrl() });
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
