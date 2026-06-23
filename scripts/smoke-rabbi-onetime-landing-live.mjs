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

function writeReport(options, startedAt, checks, result) {
  if (!options.reportDir) return '';
  fs.mkdirSync(options.reportDir, { recursive: true });
  const stamp = startedAt.replace(/[:.]/g, '-');
  const reportPath = path.join(options.reportDir, `${stamp}-rabbi-onetime-landing-smoke.md`);
  const lines = [
    `# Rabbi OneTime Landing Smoke - ${startedAt}`,
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
      'OneTimeOneTime - Rabbi Eli Scheller',
      '--yellow: #ffd400',
      'Preview mode only. The BNA homepage is not replaced.',
      'The public prices stay at $67 and $149',
      'Payment setup',
      'No live charge',
      '/js/rabbi-launch.js',
    ], '/rabbi');
    pass('/rabbi has OneTime branding, price copy, and safe setup language');

    const js = await fetchText(options.baseUrl, '/js/rabbi-launch.js', 'application/javascript,*/*;q=0.8');
    assert(js.response.status === 200, `/js/rabbi-launch.js expected 200, got ${js.response.status}`);
    expectIncludes(js.text, [
      '/api/rabbi/tiers',
      '/api/rabbi/checkout',
      'Payment setup blocked: add a Stripe or Green Invoice link in Operations',
      'stripeReady',
      'greenReady',
    ], 'rabbi-launch.js');
    pass('Rabbi launch script keeps blocked payment-link state explicit');

    const tiersResponse = await fetch(`${options.baseUrl}/api/rabbi/tiers`, {
      headers: {
        accept: 'application/json',
        'cache-control': 'no-cache',
      },
    });
    const tiersPayload = await tiersResponse.json();
    assert(tiersResponse.status === 200, `/api/rabbi/tiers expected 200, got ${tiersResponse.status}`);
    const tiers = Array.isArray(tiersPayload.tiers) ? tiersPayload.tiers : [];
    const library = tiers.find((tier) => tier.tier_key === 'library_only');
    const live = tiers.find((tier) => tier.tier_key === 'live_library');
    assert(library && Number(library.price_amount_cents) === 6700, 'library_only tier did not expose 6700 cents');
    assert(live && Number(live.price_amount_cents) === 14900, 'live_library tier did not expose 14900 cents');
    pass('public Rabbi tiers expose $67 and $149 pricing');
  } catch (error) {
    fail('Rabbi OneTime landing smoke', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    const reportPath = writeReport(options, startedAt, checks, result);
    if (reportPath) console.log(`Report: ${reportPath}`);
  }
}

main();
