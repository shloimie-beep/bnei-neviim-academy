#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || '',
    reportDir: path.join(repoRoot, 'ops', 'local-smokes'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    } else if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
    } else if (arg === '--report-dir') {
      options.reportDir = path.resolve(argv[index + 1] || options.reportDir);
      index += 1;
    }
  }
  options.baseUrl = String(options.baseUrl || '').replace(/\/+$/, '');
  return options;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const separator = line.indexOf('=');
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function redact(text, env) {
  let output = String(text || '');
  for (const [key, value] of Object.entries(env)) {
    if (!/(PASSWORD|TOKEN|SECRET|API_KEY|DATABASE_URL|COOKIE|SESSION)/i.test(key)) continue;
    if (String(value || '').length < 6) continue;
    output = output.split(String(value)).join('[REDACTED]');
  }
  output = output.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, 'postgres://[REDACTED]');
  output = output.replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, 'sk-[REDACTED]');
  output = output.replace(/bna_ops_session=[^;,\s]+/gi, 'bna_ops_session=[REDACTED]');
  return output;
}

function assertIncludes(text, snippets, label) {
  for (const snippet of snippets) {
    assert.ok(text.includes(snippet), `${label} missing "${snippet}"`);
  }
}

function assertNotIncludes(text, snippets, label) {
  for (const snippet of snippets) {
    assert.equal(text.includes(snippet), false, `${label} unexpectedly included "${snippet}"`);
  }
}

function randomPort() {
  return 19100 + Math.floor(Math.random() * 900);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function authHeader(env) {
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required for the local smoke');
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function fetchText(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    redirect: 'manual',
    headers: {
      accept: options.accept || 'text/html,application/javascript;q=0.9,*/*;q=0.8',
      ...(options.auth ? { Authorization: options.auth } : {}),
    },
  });
  const text = await response.text();
  return { response, text };
}

async function fetchJson(baseUrl, route, options = {}) {
  const { response, text } = await fetchText(baseUrl, route, {
    ...options,
    accept: 'application/json,*/*;q=0.8',
  });
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(`${route} did not return JSON: ${error.message}`);
  }
  return { response, json };
}

function startServer(env, port) {
  const childEnv = {
    ...process.env,
    ...env,
    PORT: String(port),
    HOST: '127.0.0.1',
    BNA_BIND_HOST: '127.0.0.1',
    APP_URL: `http://127.0.0.1:${port}`,
    BNA_APP_URL: `http://127.0.0.1:${port}`,
    NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${port}`,
  };
  const child = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  const capture = (chunk) => {
    logs.push(redact(chunk.toString(), childEnv));
    while (logs.join('').length > 8000) logs.shift();
  };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  return { child, logs, env: childEnv };
}

async function waitForServer(baseUrl, server) {
  const deadline = Date.now() + 45000;
  let lastError = '';
  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) {
      throw new Error(`Local server exited with code ${server.child.exitCode}. ${server.logs.join('').trim()}`);
    }
    try {
      const { response } = await fetchJson(baseUrl, '/api/health');
      if (response.status < 500) return;
    } catch (error) {
      lastError = error.message;
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for local server. Last error: ${lastError}`);
}

function writeReport(report, env) {
  fs.mkdirSync(report.report_dir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(report.report_dir, `${stamp}-one-time-launch-safe-local-smoke.json`);
  const mdPath = path.join(report.report_dir, `${stamp}-one-time-launch-safe-local-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# One Time Launch Safe Local Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Result: ${report.ok ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? `: ${check.detail}` : ''}`),
    '',
    '## Guardrails',
    '- No email send was performed.',
    '- No DNS mutation was performed.',
    '- No Stripe checkout, charge, tax, refund, cancellation, or Connect action was performed.',
    '- No Green Invoice launch path was activated.',
    '- No GHL or external CRM write was performed.',
    '- No first-party DB import apply was performed by this smoke.',
    '- No raw contact data or secret values are included in this report.',
    '',
  ];
  fs.writeFileSync(mdPath, redact(lines.join('\n'), env));
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const fileEnv = parseEnvFile(path.join(repoRoot, '.env.local'));
  const env = { ...fileEnv, ...process.env };
  const report = {
    started_at: new Date().toISOString(),
    base_url: options.baseUrl,
    report_dir: options.reportDir,
    checks: [],
    ok: false,
  };
  let server = null;

  async function step(name, fn) {
    const started = Date.now();
    try {
      const detail = await fn();
      report.checks.push({ name, ok: true, duration_ms: Date.now() - started, detail });
      console.log(`PASS ${name}${detail ? ` - ${detail}` : ''}`);
    } catch (error) {
      report.checks.push({
        name,
        ok: false,
        duration_ms: Date.now() - started,
        detail: redact(error.message, env),
      });
      console.error(`FAIL ${name}: ${redact(error.message, env)}`);
      throw error;
    }
  }

  try {
    if (!report.base_url) {
      const port = randomPort();
      report.base_url = `http://127.0.0.1:${port}`;
      server = startServer(env, port);
      await waitForServer(report.base_url, server);
    }
    const auth = authHeader(env);

    await step('public Rabbi landing shows no-card Stripe-only safe copy', async () => {
      const { response, text } = await fetchText(report.base_url, '/rabbi');
      assert.equal(response.status, 200);
      assertIncludes(text, [
        'The launch trial starts with no credit card and no payment method.',
        'Paid conversion is Stripe-only after Operations approves the test-mode path.',
        'No live charge',
      ], '/rabbi');
      assertIncludes(text, ['Green Invoice and live billing are outside the current launch packet.'], '/rabbi');
      return 'no-card trial and live-charge guardrail copy visible';
    });

    await step('Rabbi launch script has no Green Invoice checkout branch', async () => {
      const { response, text } = await fetchText(report.base_url, '/js/rabbi-launch.js', { accept: 'application/javascript,*/*;q=0.8' });
      assert.equal(response.status, 200);
      assertIncludes(text, [
        '30-day free trial starts with no card.',
        'Stripe conversion setup is blocked',
      ], 'rabbi-launch.js');
      assertNotIncludes(text, ['greenReady', 'green_invoice', 'Green Invoice checkout'], 'rabbi-launch.js');
      return 'Stripe conversion remains blocked; no Green Invoice branch';
    });

    await step('Operations HTML contains One Time email workflow and no-send map', async () => {
      const { response, text } = await fetchText(
        report.base_url,
        '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications',
        { auth }
      );
      assert.equal(response.status, 200);
      assertIncludes(text, [
        'One Time Email Sequence',
        'Email Contacts Map',
        'one-time-list:rabbi-email-contacts',
        'one-time-no-send-until-approved',
        'No card at signup, no Green Invoice, no live charge',
      ], 'Operations HTML');
      return 'workflow preview template and no-send contact map are present';
    });

    await step('One Time email workflow API is preview-only and no-send', async () => {
      const { response, json } = await fetchJson(report.base_url, '/api/bna/one-time/email-workflow-preview', { auth });
      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.workspace_key, 'rabbi_sheller_provider');
      assert.equal(json.project_key, 'one_time_mishnah_class');
      assert.equal(json.from_email, 'info@onetimeonetime.com');
      assert.equal(json.no_send, true);
      assert.equal(json.external_write_performed, false);
      assert.equal(json.email_send_performed, false);
      assert.equal(json.bulk_send_enabled, false);
      assert.equal(json.test_send_enabled, false);
      assert.equal(Array.isArray(json.drafts), true);
      assert.equal(json.drafts.length, 8);
      assert.ok(json.filters.includes('campaign_candidate_30_day_free'));
      assert.ok(json.filters.includes('no_send'));
      assert.equal(json.drafts.every((draft) => draft.status === 'draft' && draft.email_send_performed === false), true);
      return '8 draft-only emails, sends disabled, no external write';
    });

    await step('One Time trial signup preview requires no card, checkout, send, or charge', async () => {
      const { response, json } = await fetchJson(
        report.base_url,
        '/api/bna/one-time/trial-signup-preview?email=smoke-parent%40example.test&student_name=Smoke%20Learner&referral_code=RABBI-SMOKE',
        { auth }
      );
      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.workspace_key, 'rabbi_sheller_provider');
      assert.equal(json.project_key, 'one_time_mishnah_class');
      assert.equal(json.no_send, true);
      assert.equal(json.preview_only, true);
      assert.equal(json.local_write_performed, false);
      assert.equal(json.external_write_performed, false);
      assert.equal(json.email_send_performed, false);
      assert.equal(json.stripe_checkout_created, false);
      assert.equal(json.live_charge_performed, false);
      assert.equal(json.access_status, 'trial');
      assert.equal(json.policy.trial.days, 30);
      assert.equal(json.policy.trial.card_required, false);
      assert.equal(json.policy.trial.payment_method_required_at_signup, false);
      assert.equal(json.policy.grace_period.access_during_grace, false);
      assert.equal(json.referral.captured, true);
      assert.equal(json.referral.reward_or_credit_created, false);
      return '30-day preview trial, referral captured, no checkout/send/charge/write';
    });

    await step('One Time integration readiness keeps external actions blocked', async () => {
      const { response, json } = await fetchJson(report.base_url, '/api/bna/one-time/integrations/readiness', { auth });
      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.preview_only, true);
      assert.equal(json.external_write_performed, false);
      const cards = Array.isArray(json.cards) ? json.cards : [];
      const byProvider = new Map(cards.map((card) => [card.provider, card]));
      for (const provider of ['resend', 'stripe']) {
        assert.ok(byProvider.has(provider), `${provider} readiness card missing`);
      }
      assert.ok((byProvider.get('resend').blocked_actions || []).includes('email_send'));
      assert.ok((byProvider.get('stripe').blocked_actions || []).includes('live_charge'));
      return 'Resend and Stripe cards are preview-only with blocked send/charge actions';
    });

    report.ok = report.checks.every((check) => check.ok);
  } finally {
    if (server?.child && server.child.exitCode === null) server.child.kill();
    if (server?.logs) report.server_log_tail = redact(server.logs.join('').slice(-3000), server.env);
    const paths = writeReport(report, env);
    console.log(JSON.stringify({ ok: report.ok, report: paths.markdown }, null, 2));
  }

  if (!report.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
