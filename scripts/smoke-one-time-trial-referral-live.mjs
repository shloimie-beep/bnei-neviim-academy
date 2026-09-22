#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function parseSetCookie(response) {
  const raw = response.headers.get('set-cookie') || '';
  const first = raw.split(';')[0] || '';
  const index = first.indexOf('=');
  if (index <= 0) return null;
  return { name: first.slice(0, index), value: first.slice(index + 1) };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestJson(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  try {
    return { response, data: text ? JSON.parse(text) : {} };
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
}

async function requestText(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html, text/plain, */*',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  return { response, text };
}

async function loginOperationsSession(appUrl, username, password) {
  const { response, data } = await requestJson(`${appUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
    },
    body: JSON.stringify({ username, password }),
  });
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return cookie;
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-trial-referral-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-trial-referral-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Trial Referral Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Policy Snapshot',
    `- Trial days: ${report.trial_days ?? 'n/a'}`,
    `- Renewal cents: ${report.renewal_amount_cents ?? 'n/a'}`,
    `- Card required: ${report.card_required ?? 'n/a'}`,
    `- Referral trigger: ${report.referral_trigger || 'n/a'}`,
    `- Acceptance table: ${report.acceptance_table || 'n/a'}`,
    `- Promotion policy count: ${report.promotion_policy_count ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only: it does not create checkout sessions, payment links, charges, invoices, invoice credits, access grants, email sends, WhatsApp sends, or external CRM writes.',
    '- The report records policy metadata only and does not include raw private contact bodies or payment credentials.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(root, '.env.local')),
    ...loadEnvFile(path.join(root, '.env')),
    ...process.env,
  };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required for live smoke');

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
  };
  const step = async (name, fn) => {
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, detail: typeof detail === 'string' ? detail : '' });
      return detail;
    } catch (error) {
      report.steps.push({ name, ok: false, detail: error.message });
      throw error;
    }
  };

  let cookie;
  await step('Operations login', async () => {
    cookie = await loginOperationsSession(appUrl, username, password);
    return `cookie ${cookie.name}`;
  });

  const authHeaders = {
    authorization: basicAuthHeader(username, password),
    cookie: `${cookie.name}=${cookie.value}`,
  };

  await step('Trial/referral config API responds with no-write policy', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/trial-referral-config`, {
      headers: authHeaders,
    });
    assert(data.success === true, 'trial/referral endpoint did not return success');
    const config = data.trial_referral_config || {};
    const trial = config.launch_trial || {};
    const referral = config.referral_credit || {};
    const acceptance = config.acceptance_storage || {};
    const guardrails = config.guardrails || {};
    const policies = Array.isArray(config.promotion_policies) ? config.promotion_policies : [];
    assert(config.requirement_id === 'REQ-20260621-906', 'requirement id mismatch');
    assert(trial.trial_days === 30, 'trial days are not 30');
    assert(trial.renewal?.amount_cents === 6700, 'renewal amount is not 6700 cents');
    assert(trial.rules?.card_required === true, 'card-required rule missing');
    assert(trial.rules?.one_intro_trial_per_household === true, 'one-intro-trial rule missing');
    assert(referral.activation_trigger === 'first_successful_paid_cycle', 'referral trigger missing');
    assert(referral.gates?.invoice_credit_enabled === false, 'referral invoice credits are enabled');
    assert(acceptance.table === 'bna_one_time_policy_acceptances', 'acceptance table missing');
    assert(guardrails.live_charges_enabled === false, 'live charges are enabled');
    assert(guardrails.real_invoice_credits_enabled === false, 'real invoice credits are enabled');
    assert(guardrails.external_write_performed === false, 'external write was reported');
    assert(config.promotion_policy_count >= 2, 'promotion policy rows are missing');
    assert(policies.some((policy) => policy.policy_key === 'one_time_warm_lead_intro_trial'), 'trial policy row missing');
    assert(policies.some((policy) => policy.policy_key === 'one_time_referral_credit_after_first_paid_cycle'), 'referral policy row missing');
    assert(policies.every((policy) => policy.live_billing_enabled === false), 'a promotion policy enabled live billing');
    assert(policies.every((policy) => policy.invoice_credit_enabled === false), 'a promotion policy enabled invoice credits');
    report.trial_days = trial.trial_days;
    report.renewal_amount_cents = trial.renewal?.amount_cents;
    report.card_required = trial.rules?.card_required;
    report.referral_trigger = referral.activation_trigger;
    report.acceptance_table = acceptance.table;
    report.promotion_policy_count = config.promotion_policy_count;
    return '30-day trial, $67 renewal, card rule, first-paid-cycle referral, and no-write gates returned';
  });

  await step('Operations ships trial/referral UX markers', async () => {
    const { text } = await requestText(`${appUrl}/operations`, {
      headers: authHeaders,
    });
    assert(text.includes('data-one-time-trial-referral-config'), 'Operations HTML missing trial/referral marker');
    assert(text.includes('REQ-20260621-906'), 'Operations HTML missing Batch 9F requirement id');
    assert(text.includes('30-day warm-lead intro trial'), 'Operations HTML missing trial copy');
    assert(text.includes('One intro trial per household'), 'Operations HTML missing one-intro-trial copy');
    assert(text.includes('Referral credit activates only after the first successful paid cycle'), 'Operations HTML missing referral trigger copy');
    assert(text.includes('bna_one_time_policy_acceptances'), 'Operations HTML missing acceptance storage table');
    assert(text.includes('No live charge, payment link, or real invoice credit is enabled'), 'Operations HTML missing no-charge/no-credit guardrail');
    return 'Trial/referral panel markers shipped';
  });

  const paths = writeReports(report);
  console.log(JSON.stringify({
    ok: true,
    report: path.relative(root, paths.mdPath).replace(/\\/g, '/'),
    trial_days: report.trial_days,
    renewal_amount_cents: report.renewal_amount_cents,
    referral_trigger: report.referral_trigger,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
