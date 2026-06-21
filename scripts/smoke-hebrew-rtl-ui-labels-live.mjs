#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function absoluteUrl(baseUrl, route) {
  return `${baseUrl}${route}`;
}

async function fetchText(baseUrl, route) {
  const response = await fetch(absoluteUrl(baseUrl, route), {
    headers: {
      accept: route.endsWith('.js') ? 'text/javascript,*/*;q=0.8' : 'text/html,application/xhtml+xml,*/*;q=0.8',
      'cache-control': 'no-cache',
      'user-agent': 'codex-hebrew-rtl-ui-label-live-smoke',
    },
  });
  const text = await response.text();
  assert(response.status === 200, `${route} expected 200, got ${response.status}: ${text.slice(0, 300)}`);
  return text;
}

function checkContains(text, snippets, route) {
  for (const snippet of snippets) {
    assert(text.includes(snippet), `${route} is missing expected snippet: ${snippet}`);
  }
}

function checkNotContains(text, snippets, route) {
  for (const snippet of snippets) {
    assert(!text.includes(snippet), `${route} still contains disallowed snippet: ${snippet}`);
  }
}

function snippetWindow(text, anchor, route, before = 800, after = 1800) {
  const index = text.indexOf(anchor);
  assert(index >= 0, `${route} is missing expected anchor: ${anchor}`);
  return text.slice(Math.max(0, index - before), index + anchor.length + after);
}

async function runCheck(report, name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.checks.push({
      name,
      ok: true,
      duration_ms: Date.now() - started,
      details,
    });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({
      name,
      ok: false,
      duration_ms: Date.now() - started,
      error: error.message,
    });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-hebrew-rtl-ui-label-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-hebrew-rtl-ui-label-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Hebrew RTL UI Label Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => {
      const suffix = check.error ? ` - ${check.error}` : '';
      return `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name} (${check.duration_ms}ms)${suffix}`;
    }),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = {
    started_at: new Date().toISOString(),
    app_url: options.baseUrl,
    success: false,
    checks: [],
  };

  const pages = {};
  await runCheck(report, 'fetch live Hebrew UI surfaces', async () => {
    const entries = await Promise.all(
      ['/parent.html', '/student.html', '/signup-he.html', '/js/bna-site-nav.js', '/provider.html'].map(async (route) => [
        route,
        await fetchText(options.baseUrl, route),
      ])
    );
    for (const [route, text] of entries) pages[route] = text;
    return { routes: entries.map(([route]) => route) };
  });

  if (pages['/parent.html']) {
    await runCheck(report, 'parent Hebrew student-login labels are translated', async () => {
      const hebrewLoginBlock = snippetWindow(pages['/parent.html'], "studentLoginSettings: 'הגדרות כניסת תלמיד'", '/parent.html');
      checkContains(
        hebrewLoginBlock,
        [
          "studentLoginSettings: 'הגדרות כניסת תלמיד'",
          "studentLoginFor: 'כניסה לפורטל תלמיד עבור'",
          "studentUsername: 'שם משתמש לתלמיד'",
          "studentPassword: 'סיסמת תלמיד חדשה'",
          "studentLoginReady: 'כניסה עם שם משתמש וסיסמה פעילה.'",
          "studentAccessFallback: 'גיבוי קוד גישה'",
        ],
        '/parent.html'
      );
      checkNotContains(
        hebrewLoginBlock,
        [
          "studentLoginSettings: 'Student login settings'",
          "studentLoginFor: 'Student portal login for'",
          "studentUsername: 'Student username'",
        ],
        '/parent.html'
      );
      checkContains(pages['/parent.html'], ["language === 'he' ? 'עברית / RTL'"], '/parent.html');
      checkNotContains(pages['/parent.html'], ["language === 'he' ? 'Hebrew / RTL'"], '/parent.html');
      return { labels: 7 };
    });
  }

  if (pages['/student.html']) {
    await runCheck(report, 'student Hebrew login and portal labels are translated', async () => {
      const hebrewLoginBlock = snippetWindow(pages['/student.html'], "enterCode: 'כניסת תלמיד'", '/student.html');
      checkContains(
        hebrewLoginBlock,
        [
          "enterCode: 'כניסת תלמיד'",
          "accessHelp: 'היכנס עם שם המשתמש והסיסמה שההורה הגדיר עבורך.'",
          "studentUsername: 'שם משתמש'",
          "studentPassword: 'סיסמה'",
          "studentLogin: 'כניסה'",
          "clearCode: 'יציאה'",
        ],
        '/student.html'
      );
      checkContains(
        snippetWindow(pages['/student.html'], "classroomSource: 'כיתה'", '/student.html'),
        ["classroomSource: 'כיתה'"],
        '/student.html'
      );
      checkNotContains(
        hebrewLoginBlock,
        [
          "enterCode: 'Student Login'",
          "accessHelp: 'Sign in with the username and password your parent set for you.'",
          "studentUsername: 'Username'",
          "studentPassword: 'Password'",
          "studentLogin: 'Sign In'",
          "clearCode: 'Clear code'",
        ],
        '/student.html'
      );
      return { labels: 7 };
    });
  }

  if (pages['/signup-he.html']) {
    await runCheck(report, 'Hebrew signup page remains RTL and Hebrew-first', async () => {
      checkContains(
        pages['/signup-he.html'],
        ['<html lang="he" dir="rtl">', 'data-nav-language="he"', 'name="form_language" value="he"'],
        '/signup-he.html'
      );
      return { rtl: true };
    });
  }

  if (pages['/js/bna-site-nav.js']) {
    await runCheck(report, 'public Hebrew navigation labels are translated', async () => {
      checkContains(
        pages['/js/bna-site-nav.js'],
        [
          "school: 'בית הספר'",
          "parents: 'משפחות'",
          "serviceProviders: 'ספקי שירות'",
          "portals: 'כניסה לפורטלים'",
          "operationsLogin: 'כניסת צוות'",
        ],
        '/js/bna-site-nav.js'
      );
      return { labels: 5 };
    });
  }

  if (pages['/provider.html']) {
    await runCheck(report, 'provider portal is documented English-only for now', async () => {
      checkContains(pages['/provider.html'], ['<html lang="en">'], '/provider.html');
      checkNotContains(pages['/provider.html'], ['data-nav-language="he"', 'dir="rtl"'], '/provider.html');
      return { language: 'en' };
    });
  }

  report.success = report.checks.length > 0 && report.checks.every((check) => check.ok);
  const paths = writeReports(report);
  console.log(`Report: ${paths.markdown}`);
  if (!report.success) process.exitCode = 1;
}

main();
