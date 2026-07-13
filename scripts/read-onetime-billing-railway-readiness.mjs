#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { buildOneTimeExternalSetupReadiness } from './check-onetime-external-setup-readiness.mjs';

const DEFAULT_BASE = path.join(
  'ops',
  'deploy-readbacks',
  '2026-07-13-onetime-billing-railway-readback',
);

function parseArgs(argv = []) {
  const args = {
    json: false,
    allowBlocked: false,
    outBase: DEFAULT_BASE,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--allow-blocked') args.allowBlocked = true;
    else if (arg === '--out-base') {
      args.outBase = argv[index + 1] || args.outBase;
      index += 1;
    }
  }
  return args;
}

function renderMarkdown(report) {
  const railway = report.railway_variable_readback || {};
  const stripeItem = report.items.find((item) => item.id === 'SETUP-ONETIME-STRIPE-001') || {};
  const railwayItem = report.items.find((item) => item.id === 'SETUP-ONETIME-RAILWAY-001') || {};
  return [
    '# One Time Billing Railway Readback',
    '',
    `Generated: ${report.generated_at}`,
    '',
    `Workspace/project: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `Mode: ${report.mode}`,
    `External write performed: ${report.external_write_performed}`,
    `Provider mutation performed: ${report.provider_mutation_performed}`,
    `Live payment performed: ${report.live_payment_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
    '## Railway Target',
    '',
    `- ready: ${railwayItem.ready === true}`,
    `- service: ${railway.service || 'unknown'}`,
    `- environment: ${railway.environment || 'unknown'}`,
    `- source: ${railway.source || 'unknown'}`,
    `- key_count: ${Number.isFinite(Number(railway.key_count)) ? railway.key_count : 'unknown'}`,
    `- one_time_public_domain_matches: ${railway.one_time_public_domain_matches === true}`,
    `- default_workspace_matches: ${railway.default_workspace_matches === true}`,
    `- default_project_matches: ${railway.default_project_matches === true}`,
    '',
    '## Stripe Billing',
    '',
    `- ready: ${stripeItem.ready === true}`,
    `- secret_key_present: ${railway.stripe_secret_key_present === true}`,
    `- secret_key_mode: ${railway.stripe_secret_key_mode || 'unknown'}`,
    `- test_secret_key_present: ${railway.stripe_test_secret_key_present === true}`,
    `- live_key_present: ${railway.stripe_live_key_present === true}`,
    `- webhook_secret_present: ${railway.stripe_webhook_secret_present === true}`,
    `- price_reference_present: ${railway.stripe_price_present === true}`,
    `- publishable_key_present: ${railway.stripe_publishable_key_present === true}`,
    `- mode_present: ${railway.stripe_mode_present === true}`,
    `- mode_live_requested: ${railway.stripe_mode_live_requested === true}`,
    `- sandbox_config_ready: ${railway.stripe_sandbox_config_ready === true}`,
    '',
    '## Missing Fields',
    '',
    stripeItem.missing_fields?.length ? stripeItem.missing_fields.map((item) => `- ${item}`).join('\n') : '- none',
    '',
    '## Guardrails',
    '',
    '- No live charge, refund, notice send, invoice/receipt send, access mutation, provider mutation, credential mutation, or production data mutation is performed by this readback.',
    '- No Stripe or Railway secret values are written to this report.',
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
  const report = buildOneTimeExternalSetupReadiness({
    ...options,
    repoRoot,
    billingOnly: true,
  });
  const paths = writeReport(report, repoRoot, args.outBase);
  const output = {
    ok: report.all_required_external_setup_ready,
    generated_at: report.generated_at,
    mode: report.mode,
    ready_count: report.ready_count,
    total_count: report.total_count,
    external_write_performed: report.external_write_performed,
    live_payment_performed: report.live_payment_performed,
    secret_values_printed: report.secret_values_printed,
    report_paths: paths,
    blockers: report.blockers,
  };
  if (args.json) console.log(JSON.stringify(output, null, 2));
  else console.log(renderMarkdown({ ...report, report_paths: paths }));
  if (!report.all_required_external_setup_ready && !args.allowBlocked) process.exitCode = 1;
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 2;
  });
}
