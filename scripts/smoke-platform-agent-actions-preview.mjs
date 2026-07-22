import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

function option(name, fallback = '') {
  const args = process.argv.slice(2);
  const index = args.findIndex((arg) => arg === name || arg.startsWith(`${name}=`));
  if (index < 0) return fallback;
  if (args[index].includes('=')) return args[index].split('=').slice(1).join('=');
  return args[index + 1] || fallback;
}

const baseUrl = String(option('--base-url', 'http://127.0.0.1:8096')).replace(/\/+$/, '');
const outputDir = path.resolve(option('--output-dir', 'ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview'));
const jobId = option('--job-id', 'GHL-UI-01');

async function requestJson(route, init = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`${route} returned non-JSON status ${response.status}`);
  }
  if (!response.ok) throw new Error(`${route} returned ${response.status}: ${payload.error || text.slice(0, 200)}`);
  return payload;
}

async function saveResult(csrfToken, action, idempotencyKey, extra = {}) {
  return requestJson(`/api/platform/agent-actions/${encodeURIComponent(jobId)}/results`, {
    method: 'POST',
    headers: { 'x-bna-agent-action-csrf': csrfToken },
    body: JSON.stringify({
      action,
      idempotency_key: idempotencyKey,
      summary: `Window D local preview lifecycle: ${action}`,
      evidence: [`synthetic:${action}`],
      completion_checklist: ['Local preview only', 'No provider send'],
      ...extra,
    }),
  });
}

fs.mkdirSync(outputDir, { recursive: true });

const hub = await requestJson('/api/platform/agent-actions');
assert.equal(hub.success, true);
assert.ok(hub.jobs.some((job) => job.job_id === jobId), `${jobId} was not imported into the local preview`);
assert.ok(hub.csrf_token, 'Agent Action CSRF token missing');
assert.equal(hub.result_persistence.ghl_completion_blocked_by_hub, false);
assert.equal(hub.rabbi_telegram_foundation.console_key, 'one_time_rabbi_torah_console');
assert.equal(hub.rabbi_telegram_foundation.mode, 'provider_off');
assert.equal(hub.rabbi_telegram_foundation.customer_messages_sent, 0);

const csrf = hub.csrf_token;
const claim = await saveResult(csrf, 'claim', `window-d:${jobId}:claim`);
assert.equal(claim.result.status, 'claimed');

const started = await saveResult(csrf, 'i_started', `window-d:${jobId}:in-progress`);
assert.equal(started.result.status, 'in_progress');

const partial = await saveResult(csrf, 'save_partial', `window-d:${jobId}:partial`, {
  completion_intent: 'partial',
});
assert.equal(partial.result.status, 'saved');
assert.equal(partial.result.metadata.completion_intent, 'partial');

const partialReplay = await saveResult(csrf, 'save_partial', `window-d:${jobId}:partial`, {
  completion_intent: 'partial',
});
assert.equal(partialReplay.result_ref, partial.result_ref);

const completed = await saveResult(csrf, 'save_completed', `window-d:${jobId}:completed`, {
  completion_intent: 'completed',
  expected_asset_ids: ['synthetic-ghl-asset-id'],
});
assert.equal(completed.result.status, 'saved');
assert.equal(completed.completion_requires_readback, true);
assert.equal(completed.result_persistence.hub.required_for_ghl_completion, false);
assert.equal(completed.result_persistence.github_fallback.sanitized_result_only, true);
assert.equal(completed.result_persistence.github_fallback.external_write_performed, false);

const readback = await requestJson(completed.readback_url);
assert.equal(readback.result.status, 'verified');
assert.equal(readback.result.readback_verified, true);

const superseded = await saveResult(csrf, 'supersede', `window-d:${jobId}:superseded`);
assert.equal(superseded.result.status, 'superseded');

const browserChecks = [];
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/operations/agent-actions`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /^Agent Actions$/i }).waitFor();
  await page.locator(`[data-agent-action-job="${jobId}"]`).first().waitFor();
  browserChecks.push({ route: '/operations/agent-actions', passed: true });
  await page.screenshot({ path: path.join(outputDir, 'agent-action-hub.png'), fullPage: true });

  await page.goto(`${baseUrl}/operations/agent-actions/${encodeURIComponent(jobId)}`, { waitUntil: 'networkidle' });
  await page.locator(`[data-agent-action-job="${jobId}"]`).first().waitFor();
  browserChecks.push({ route: `/operations/agent-actions/${jobId}`, passed: true });

  await page.goto(`${baseUrl}/operations/agent-actions/${encodeURIComponent(jobId)}/dropoff`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Save Completed Result/i }).waitFor();
  browserChecks.push({ route: `/operations/agent-actions/${jobId}/dropoff`, passed: true });

  await page.goto(`${baseUrl}/operations/school`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /School workspace/i }).waitFor();
  browserChecks.push({ route: '/operations/school', passed: true });

  await page.goto(`${baseUrl}/operations/workspaces/one-time`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Rabbi Telegram foundation/i }).waitFor();
  await page.getByText('provider_off', { exact: true }).waitFor();
  browserChecks.push({ route: '/operations/workspaces/one-time', passed: true });

  const actionableConsoleErrors = consoleErrors.filter((message) => !/ERR_NETWORK_ACCESS_DENIED/.test(message));
  assert.deepEqual(actionableConsoleErrors, []);
  browserChecks.push({
    check: 'console_errors',
    passed: true,
    ignored_external_network_denied: consoleErrors.length - actionableConsoleErrors.length,
  });
} finally {
  await browser.close();
}

const report = {
  generated_at: new Date().toISOString(),
  base_url: baseUrl,
  job_id: jobId,
  lifecycle: {
    claim: claim.result.status,
    in_progress: started.result.status,
    partial_save: partial.result.status,
    partial_idempotency_result_ref_match: partialReplay.result_ref === partial.result_ref,
    completed_save: completed.result.status,
    completed_readback: readback.result.status,
    result_readback_verified: readback.result.readback_verified,
    supersede: superseded.result.status,
  },
  result_persistence: {
    hub_preferred: true,
    github_fallback_repository: completed.result_persistence.github_fallback.repository,
    github_fallback_path: completed.result_persistence.github_fallback.path,
    sanitized_result_only: completed.result_persistence.github_fallback.sanitized_result_only,
    ghl_completion_blocked_by_hub: completed.result_persistence.ghl_completion_blocked_by_hub,
  },
  rabbi_telegram_foundation: {
    console_key: hub.rabbi_telegram_foundation.console_key,
    mode: hub.rabbi_telegram_foundation.mode,
    adapter: hub.rabbi_telegram_foundation.adapter,
    customer_messages_sent: hub.rabbi_telegram_foundation.customer_messages_sent,
  },
  browser_checks: browserChecks,
  customer_messages_sent: 0,
  production_changed: false,
  external_write_performed: false,
};

fs.writeFileSync(path.join(outputDir, 'preview-smoke.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
