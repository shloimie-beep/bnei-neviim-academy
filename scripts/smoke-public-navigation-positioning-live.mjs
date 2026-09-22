#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL,
    reportDir: path.join('ops', 'live-smokes'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    } else if (arg === '--report-dir') {
      options.reportDir = argv[index + 1] || options.reportDir;
      index += 1;
    } else if (arg === '--no-report') {
      options.reportDir = '';
    }
  }
  options.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  return options;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchText(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`, {
    redirect: 'manual',
    headers: {
      accept: 'text/html,application/javascript,text/css;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
    },
  });
  const text = await response.text();
  return { route, response, text, location: response.headers.get('location') || '' };
}

function expectIncludes(text, expected, label) {
  for (const item of expected) {
    assert(text.includes(item), `${label} missing ${item}`);
  }
}

function expectNotIncludes(text, forbidden, label) {
  const hits = forbidden.filter((item) => text.includes(item));
  assert(!hits.length, `${label} still exposes ${hits.join(', ')}`);
}

function writeReport(options, startedAt, checks, result) {
  if (!options.reportDir) return '';
  fs.mkdirSync(options.reportDir, { recursive: true });
  const stamp = startedAt.replace(/[:.]/g, '-');
  const reportPath = path.join(options.reportDir, `${stamp}-public-navigation-positioning-smoke.md`);
  const lines = [
    `# Public Navigation Positioning Smoke - ${startedAt}`,
    '',
    `App: ${options.baseUrl}`,
    `Result: ${result}`,
    '',
    '## Checks',
    ...checks.map((check) => `- ${check.status} ${check.label}${check.detail ? ` (${check.detail})` : ''}`),
    '',
  ];
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  return reportPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const checks = [];
  let result = 'passed';

  function pass(label, detail = '') {
    checks.push({ status: 'PASS', label, detail });
    console.log(`PASS ${label}${detail ? ` - ${detail}` : ''}`);
  }

  function fail(label, detail = '') {
    result = 'failed';
    checks.push({ status: 'FAIL', label, detail });
    console.error(`FAIL ${label}${detail ? ` - ${detail}` : ''}`);
  }

  try {
    const home = await fetchText(options.baseUrl, '/');
    assert(home.response.status === 200, `/ expected 200, got ${home.response.status}`);
    expectIncludes(home.text, [
      'Schools / AI Microschool',
      'one-man Jewish AI microschool',
      'natural-language school management',
      'Families / Parent App',
      'family accountability app',
      'Service Provider Network',
      'AI reduces overhead',
      'better rabbi pay',
      'href="/school"',
      'href="/parents"',
      'href="/providers/join?onboard=provider"',
    ], 'homepage positioning');
    pass('homepage has audience and AI microschool positioning');

    const nav = await fetchText(options.baseUrl, '/js/bna-site-nav.js');
    assert(nav.response.status === 200, `/js/bna-site-nav.js expected 200, got ${nav.response.status}`);
    expectIncludes(nav.text, [
      'renderAudienceDropdown',
      'renderPortalDropdown',
      '/parent/login',
      '/student/login',
      '/provider',
    ], 'shared nav');
    expectNotIncludes(nav.text, ['/operations-login.html', 'href="/operations"'], 'shared nav');
    pass('shared nav has grouped audience and safe public portal destinations');

    const parents = await fetchText(options.baseUrl, '/parents');
    assert(parents.response.status === 200, `/parents expected 200, got ${parents.response.status}`);
    expectIncludes(parents.text, [
      'Families / Parent App',
      'family accountability app',
      'href="/parent/login">Open Parent Login',
      'Parent app screenshots coming soon',
    ], 'parents page');
    pass('parents page uses family app positioning and safe login CTA');

    for (const route of ['/parent/login', '/student/login', '/provider']) {
      const page = await fetchText(options.baseUrl, route);
      assert(page.response.status === 200, `${route} expected 200, got ${page.response.status}`);
      expectIncludes(page.text, ['Safe portal navigation', 'href="/"'], route);
      expectNotIncludes(page.text, ['href="/operations"'], route);
      pass(`${route} exposes safe portal topbar links only`);
    }

    const operations = await fetchText(options.baseUrl, '/operations');
    assert([302, 401].includes(operations.response.status), `/operations expected 302/401, got ${operations.response.status}`);
    if (operations.location) {
      assert(/\/operations-login\.html/.test(operations.location), `/operations redirected to ${operations.location}`);
    }
    pass('/operations does not expose anonymous private dashboard', operations.location || String(operations.response.status));
  } catch (error) {
    fail('public navigation positioning smoke', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    const reportPath = writeReport(options, startedAt, checks, result);
    if (reportPath) console.log(`Report: ${reportPath}`);
  }
}

main();
