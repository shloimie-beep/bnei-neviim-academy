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
    } else if (/^https?:\/\//i.test(arg)) {
      options.baseUrl = arg;
    }
  }
  options.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  return options;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchText(baseUrl, route, accept = 'text/html,application/javascript;q=0.9,*/*;q=0.8') {
  const response = await fetch(`${baseUrl}${route}`, {
    redirect: 'manual',
    headers: {
      accept,
      'cache-control': 'no-cache',
    },
  });
  const text = await response.text();
  return { route, response, text };
}

function expectIncludes(text, expected, label) {
  for (const item of expected) {
    assert(text.includes(item), `${label} missing ${item}`);
  }
}

function expectNotMatches(text, pattern, label) {
  assert(!pattern.test(text), `${label} unexpectedly matched ${pattern}`);
}

function writeReport(options, startedAt, checks, result) {
  if (!options.reportDir) return '';
  fs.mkdirSync(options.reportDir, { recursive: true });
  const stamp = startedAt.replace(/[:.]/g, '-');
  const reportPath = path.join(options.reportDir, `${stamp}-rabbi-onetime-landing-smoke.md`);
  const lines = [
    `# Rabbi One Time Landing Smoke - ${startedAt}`,
    '',
    `App: ${options.baseUrl}`,
    `Result: ${result}`,
    '',
    '## Checks',
    ...checks.map((check) => `- ${check.status} ${check.label}${check.detail ? ` (${check.detail})` : ''}`),
    '',
    'No checkout POST, payment link creation, member creation, access grant, email, WhatsApp, social post, upload, charge, DNS write, or external connector write was performed.',
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
    const page = await fetchText(options.baseUrl, '/rabbi');
    assert(page.response.status === 200, `/rabbi expected 200, got ${page.response.status}`);
    expectIncludes(page.text, [
      'Give your son a love for learning Torah.',
      'One Time',
      'Rabbi Eli Scheller',
      'Sign Up Now',
      'href="/one-time/signup"',
      '/js/bna-bot-widget.js',
    ], '/rabbi');
    expectNotMatches(page.text, /data-signup-modal|signup-strip|id="interestForm"|signupStudentName|name="student/i, '/rabbi');
    expectNotMatches(page.text, /Bnei Neviim Academy|BNA Academy|Hebrew|data-language-toggle/i, '/rabbi');
    pass('/rabbi has focused One Time branding, direct signup CTA, and no Academy chrome');

    const signup = await fetchText(options.baseUrl, '/one-time/signup');
    assert(signup.response.status === 200, `/one-time/signup expected 200, got ${signup.response.status}`);
    expectIncludes(signup.text, [
      'name="contact_name"',
      'name="signup_as"',
      'data-signup-type-picker',
      'data-value="Family"',
      'data-value="School"',
      'name="email"',
      'name="phone"',
      '/api/one-time/interest',
    ], '/one-time/signup');
    expectNotMatches(signup.text, /<select[^>]+name="signup_as"|<option value="Family">Family<\/option>|<option value="School">School<\/option>|data-signup-type-trigger|data-signup-type-menu/i, '/one-time/signup');
    expectNotMatches(signup.text, /name="student|student_name|signupStudentName/i, '/one-time/signup');
    pass('/one-time/signup has lightweight Family/School signup fields');

    const configResponse = await fetch(`${options.baseUrl}/api/one-time/instance-config`, {
      headers: {
        accept: 'application/json',
        'cache-control': 'no-cache',
      },
    });
    const config = await configResponse.json();
    assert(configResponse.status === 200, `/api/one-time/instance-config expected 200, got ${configResponse.status}`);
    assert(config.app_instance === 'onetime', `expected app_instance onetime, got ${config.app_instance}`);
    assert(config.workspace_key === 'rabbi_sheller_provider', `expected rabbi_sheller_provider, got ${config.workspace_key}`);
    assert(config.project_key === 'one_time_mishnah_class', `expected one_time_mishnah_class, got ${config.project_key}`);
    pass('One Time instance config is scoped to Rabbi Scheller provider');
  } catch (error) {
    fail('Rabbi One Time landing smoke', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    const reportPath = writeReport(options, startedAt, checks, result);
    if (reportPath) console.log(`Report: ${reportPath}`);
  }
}

main();
