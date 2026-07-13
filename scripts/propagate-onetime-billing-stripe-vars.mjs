#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { buildOneTimeExternalSetupReadiness } from './check-onetime-external-setup-readiness.mjs';

const require = createRequire(import.meta.url);
const { loadSecret, safeSecretSourceLabel } = require('../src/lib/integrations/secret-loader');

const DEFAULT_REPORT_BASE = path.join(
  'ops',
  'deploy-readbacks',
  '2026-07-13-onetime-billing-railway-propagation',
);

function parseArgs(argv = []) {
  const args = {
    json: false,
    dryRun: false,
    outBase: DEFAULT_REPORT_BASE,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--out-base') {
      args.outBase = argv[index + 1] || args.outBase;
      index += 1;
    }
  }
  return args;
}

function normalize(value) {
  return String(value || '').replace(/^\uFEFF/, '').trim();
}

function isStripeTestKey(value) {
  return /^(?:sk|rk)_test_/i.test(normalize(value));
}

function redactText(value = '') {
  return String(value || '')
    .replace(/\b(?:sk|rk)_(?:test|live)_[A-Za-z0-9._-]{12,}\b/g, '[redacted_stripe_key]')
    .replace(/\bwhsec_[A-Za-z0-9._-]{8,}\b/g, '[redacted_webhook_secret]')
    .replace(/\brailway_[A-Za-z0-9._-]{16,}\b/g, '[redacted_railway_token]');
}

function loadRequiredSecret(spec) {
  const loaded = loadSecret(spec);
  const value = normalize(loaded.value);
  return {
    key: spec.envName,
    configured: Boolean(value),
    value,
    source: loaded.configured ? safeSecretSourceLabel(loaded) : 'not configured',
    length: value.length,
  };
}

function railwayCommandForPlatform(args) {
  return process.platform === 'win32'
    ? { command: 'cmd.exe', args: ['/d', '/s', '/c', 'railway.cmd', ...args] }
    : { command: 'railway', args };
}

function setRailwayVariable({
  key,
  value,
  secret = true,
  service = 'one-time-web',
  environment = 'production',
  runner = spawnSync,
  repoRoot = process.cwd(),
  dryRun = false,
}) {
  if (dryRun) {
    return {
      key,
      ok: true,
      dry_run: true,
      value_sent_via_stdin: secret,
      value_printed: false,
    };
  }

  const railwayArgs = [
    'variable',
    'set',
    '--service',
    service,
    '--environment',
    environment,
    '--skip-deploys',
    '--json',
  ];
  if (secret) railwayArgs.push('--stdin', key);
  else railwayArgs.push(`${key}=${value}`);

  const { command, args } = railwayCommandForPlatform(railwayArgs);
  const result = runner(command, args, {
    cwd: repoRoot,
    env: process.env,
    input: secret ? `${value}\n` : undefined,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 4,
  });

  const text = redactText(`${result.stderr || ''}\n${result.stdout || ''}`.trim());
  return {
    key,
    ok: !result.error && result.status === 0,
    exit_code: result.status,
    value_sent_via_stdin: secret,
    value_printed: false,
    reason: result.error ? redactText(result.error.message || String(result.error)) : result.status === 0 ? '' : text.split(/\r?\n/)[0],
  };
}

function renderMarkdown(report) {
  return [
    '# One Time Billing Railway Propagation',
    '',
    `Generated: ${report.generated_at}`,
    '',
    `Dry run: ${report.dry_run}`,
    `External write performed: ${report.external_write_performed}`,
    `Credential mutation performed: ${report.credential_mutation_performed}`,
    `Deployment triggered: ${report.deployment_triggered}`,
    `Live payment performed: ${report.live_payment_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    `Target service: ${report.target.service}`,
    `Target environment: ${report.target.environment}`,
    '',
    '## Variables',
    '',
    ...report.variables.map((item) => [
      `### ${item.key}`,
      `- configured locally: ${item.configured}`,
      `- source: ${item.source}`,
      `- length: ${item.length}`,
      `- set ok: ${item.set_result.ok}`,
      `- value sent via stdin: ${item.set_result.value_sent_via_stdin}`,
      `- value printed: ${item.set_result.value_printed}`,
      item.set_result.reason ? `- reason: ${item.set_result.reason}` : '- reason: none',
      '',
    ].join('\n')),
    '## Readback After',
    '',
    `- all billing setup ready: ${report.after?.all_required_external_setup_ready === true}`,
    `- ready_count: ${report.after?.ready_count || 0}/${report.after?.total_count || 0}`,
    `- stripe_sandbox_config_ready: ${report.after?.railway_variable_readback?.stripe_sandbox_config_ready === true}`,
    `- stripe_webhook_secret_present: ${report.after?.railway_variable_readback?.stripe_webhook_secret_present === true}`,
    `- stripe_test_secret_key_present: ${report.after?.railway_variable_readback?.stripe_test_secret_key_present === true}`,
    `- stripe_price_present: ${report.after?.railway_variable_readback?.stripe_price_present === true}`,
    '',
    '## Guardrails',
    '',
    '- The script refuses to propagate a non-test Stripe secret key.',
    '- Values are supplied by stdin for secret-bearing variables and are not written to the report.',
    '- `--skip-deploys` is used for every Railway variable mutation.',
    '',
  ].join('\n');
}

function writeReport(report, repoRoot, outBase) {
  const basePath = path.resolve(repoRoot, outBase);
  fs.mkdirSync(path.dirname(basePath), { recursive: true });
  const jsonPath = `${basePath}.json`;
  const mdPath = `${basePath}.md`;
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    md: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const repoRoot = options.repoRoot || process.cwd();
  const before = buildOneTimeExternalSetupReadiness({ repoRoot, billingOnly: true });
  const targetReady = before.items.some((item) => item.id === 'SETUP-ONETIME-RAILWAY-001' && item.ready === true);
  if (!targetReady) {
    throw new Error('One Time Railway target is not ready; refusing Stripe variable propagation.');
  }

  const stripeSecret = loadRequiredSecret({
    envName: 'RABBI_STRIPE_SECRET_KEY',
    names: ['rabbi-stripe-secret-key', 'rabbi-stripe-test-secret-key', 'one-time-stripe-test-secret-key'],
    fileNames: ['rabbi-stripe-secret-key.txt', 'rabbi-stripe-test-secret-key.txt', 'one-time-stripe-test-secret-key.txt', 'RABBI_STRIPE_SECRET_KEY.txt'],
    repoRoot,
  });
  if (!stripeSecret.configured) throw new Error('RABBI_STRIPE_SECRET_KEY test secret is not configured in keyholder/local secret storage.');
  if (!isStripeTestKey(stripeSecret.value)) throw new Error('Refusing to propagate a non-test Rabbi Stripe secret key.');

  const webhookSecret = loadRequiredSecret({
    envName: 'RABBI_STRIPE_WEBHOOK_SECRET',
    names: ['rabbi-stripe-webhook-secret', 'stripe-webhook-secret'],
    fileNames: ['rabbi-stripe-webhook-secret.txt', 'stripe-webhook-secret.txt', 'RABBI_STRIPE_WEBHOOK_SECRET.txt', 'STRIPE_WEBHOOK_SECRET.txt'],
    repoRoot,
  });
  if (!webhookSecret.configured) throw new Error('RABBI_STRIPE_WEBHOOK_SECRET is not configured in keyholder/local secret storage.');

  const priceId = loadRequiredSecret({
    envName: 'ONE_TIME_STRIPE_PRICE_ID',
    names: ['one-time-stripe-price-id', 'rabbi-stripe-price-id', 'stripe-price-67'],
    fileNames: ['one-time-stripe-price-id.txt', 'rabbi-stripe-price-id.txt', 'stripe-price-67.txt'],
    repoRoot,
  });
  if (!priceId.configured) throw new Error('ONE_TIME_STRIPE_PRICE_ID is not configured in keyholder/local secret storage.');

  const variables = [
    { key: 'RABBI_STRIPE_SECRET_KEY', value: stripeSecret.value, source: stripeSecret.source, length: stripeSecret.length, configured: stripeSecret.configured, secret: true },
    { key: 'RABBI_STRIPE_MODE', value: 'test', source: 'constant:test', length: 4, configured: true, secret: false },
    { key: 'RABBI_STRIPE_WEBHOOK_SECRET', value: webhookSecret.value, source: webhookSecret.source, length: webhookSecret.length, configured: webhookSecret.configured, secret: true },
    { key: 'ONE_TIME_STRIPE_PRICE_ID', value: priceId.value, source: priceId.source, length: priceId.length, configured: priceId.configured, secret: true },
    { key: 'STRIPE_LIVE_BILLING_ENABLED', value: 'false', source: 'constant:false', length: 5, configured: true, secret: false },
    { key: 'STRIPE_LIVE_APPROVED', value: 'false', source: 'constant:false', length: 5, configured: true, secret: false },
  ];

  const applied = variables.map((item) => ({
    key: item.key,
    configured: item.configured,
    source: item.source,
    length: item.length,
    set_result: setRailwayVariable({
      key: item.key,
      value: item.value,
      secret: item.secret,
      repoRoot,
      runner: options.runner || spawnSync,
      dryRun: args.dryRun,
    }),
  }));

  const allSet = applied.every((item) => item.set_result.ok);
  const after = args.dryRun ? null : buildOneTimeExternalSetupReadiness({ repoRoot, billingOnly: true });
  const report = {
    generated_at: new Date().toISOString(),
    dry_run: args.dryRun,
    external_write_performed: !args.dryRun,
    credential_mutation_performed: !args.dryRun,
    deployment_triggered: false,
    live_payment_performed: false,
    secret_values_printed: false,
    target: {
      service: 'one-time-web',
      environment: 'production',
    },
    before,
    variables: applied,
    after,
    ok: allSet && (args.dryRun || after?.all_required_external_setup_ready === true),
  };
  const paths = writeReport(report, repoRoot, args.outBase);
  const output = {
    ok: report.ok,
    generated_at: report.generated_at,
    dry_run: report.dry_run,
    external_write_performed: report.external_write_performed,
    credential_mutation_performed: report.credential_mutation_performed,
    deployment_triggered: report.deployment_triggered,
    live_payment_performed: report.live_payment_performed,
    secret_values_printed: report.secret_values_printed,
    variables: applied.map((item) => ({ key: item.key, ok: item.set_result.ok })),
    after_ready: after?.all_required_external_setup_ready === true,
    report_paths: paths,
  };
  if (args.json) console.log(JSON.stringify(output, null, 2));
  else console.log(renderMarkdown(report));
  if (!report.ok) process.exitCode = 1;
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(redactText(error?.message || String(error)));
    process.exitCode = 2;
  });
}
