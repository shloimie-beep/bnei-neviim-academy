#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const env = loadSmokeEnv({ root: repoRoot });
const oneTimeRailwayEnv = {
  ...env,
  OPS_USERNAME: '',
  OPS_PASSWORD: '',
  BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
  BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
  BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
};
const baseUrl = String(
  process.env.ONE_TIME_PUBLIC_BASE_URL ||
  process.env.ONE_TIME_APP_URL ||
  process.env.ONETIME_BASE_URL ||
  env.ONE_TIME_PUBLIC_BASE_URL ||
  env.ONE_TIME_APP_URL ||
  env.ONETIME_BASE_URL ||
  'https://join.onetimeonetime.com'
).replace(/\/+$/, '');
const workspaceKey = 'rabbi_sheller_provider';
const projectKey = 'one_time_mishnah_class';
const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');

const report = {
  started_at: startedAt,
  base_url: baseUrl,
  workspace_key: workspaceKey,
  project_key: projectKey,
  status: 'unknown',
  deployment_id: process.env.BNA_DEPLOYMENT_ID || '',
  commit: process.env.BNA_DEPLOYED_COMMIT || '',
  steps: [],
  guardrails: [
    'Read-only live smoke; no contact IDs, names, addresses, recipients, message bodies, payload bodies, provider error text, sends, payments, access grants, or external writes are saved.',
    'The smoke records only aggregate counts, no-send flags, and whether selected-contact Activity exposes assistant_dead_letters rows.',
    'Dead-letter rows are expected in Activity/timeline only and must not appear in selected-contact Conversations.',
    'If production has no scoped One Time dead-letter rows, the probe records a skip rather than creating synthetic data.',
  ],
};

let cookie = null;
let canonicalCards = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-crm-dead-letter-dto-live-smoke.${ext}`);
}

function cookieHeader(value) {
  return `${value.name}=${value.value}`;
}

async function fetchJson(route, headers = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      accept: 'application/json',
      ...headers,
    },
  });
  const text = await response.text();
  assert(response.status === 200, `${route} returned ${response.status}: ${text.slice(0, 500)}`);
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${route} did not return JSON: ${error.message}`);
  }
}

async function step(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
    console.log(`PASS ${name}`);
    return details;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
    console.error(`FAIL ${name}: ${message}`);
    throw error;
  }
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${[
    `# One Time CRM Dead Letter DTO Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Workspace: ${report.workspace_key}`,
    `Project: ${report.project_key}`,
    `Result: ${report.status}`,
    `Deployment: ${report.deployment_id || '(not provided)'}`,
    `Commit: ${report.commit || '(not provided)'}`,
    '',
    '## Checks',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ].join('\n')}\n`);
  return { jsonPath, mdPath };
}

function parseContext(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function isDeadLetterItem(item = {}) {
  const type = String(item.type || item.communication_type || '').toLowerCase();
  const channel = String(item.channel || '').toLowerCase();
  const source = String(item.source || '').toLowerCase();
  const context = parseContext(item.source_context);
  return type === 'delivery_dead_letter' ||
    channel === 'dead_letter' ||
    source === 'assistant_dead_letters' ||
    context.source_table === 'assistant_dead_letters';
}

function isDeliveryOperationalConversation(item = {}) {
  const type = String(item.communication_type || item.type || '').toLowerCase();
  const channel = String(item.channel || '').toLowerCase();
  const source = String(item.source || '').toLowerCase();
  const context = parseContext(item.source_context);
  return type === 'delivery_outbox' ||
    type === 'delivery_dead_letter' ||
    channel === 'dead_letter' ||
    source === 'assistant_delivery_outbox' ||
    source === 'assistant_dead_letters' ||
    context.source_table === 'assistant_delivery_outbox' ||
    context.source_table === 'assistant_dead_letters';
}

function assertDeadLetterRedaction(item = {}) {
  const context = parseContext(item.source_context);
  assert(context.source_table === 'assistant_dead_letters', 'Dead-letter timeline row did not carry assistant_dead_letters source_table');
  assert(context.no_send === true || context.no_send === 'true', 'Dead-letter context no_send flag was not true');
  assert(context.external_write_performed === false || context.external_write_performed === 'false', 'Dead-letter context reported external write');
  assert(context.reason_returned === false || context.reason_returned === 'false', 'Dead-letter context exposed reason_returned');
  assert(context.payload_returned === false || context.payload_returned === 'false', 'Dead-letter context exposed payload_returned');
  assert(context.message_body_returned === false || context.message_body_returned === 'false', 'Dead-letter context exposed message_body_returned');
  assert(context.recipient_returned === false || context.recipient_returned === 'false', 'Dead-letter context exposed recipient_returned');
}

async function main() {
  await step('operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  const authHeaders = { cookie: cookieHeader(cookie) };

  await step('scoped One Time CRM list exposes canonical contacts without external writes', async () => {
    const route = `/api/bna/crm/contacts?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}&sort=last_activity_desc&limit=100`;
    const data = await fetchJson(route, authHeaders);
    assert(Array.isArray(data.cards), 'CRM response did not include cards array');
    assert(data.external_write_performed !== true, 'CRM list reported an external write');
    assert(data.no_send === true || data.no_send === undefined, 'CRM list no-send flag was false');
    canonicalCards = data.cards.filter((card) => card?.source === 'bna_contacts' && card?.id);
    report.crm_cards_count = data.cards.length;
    report.canonical_contact_candidate_count = canonicalCards.length;
    return {
      cards_count: data.cards.length,
      canonical_contact_candidate_count: canonicalCards.length,
      no_send: data.no_send !== false,
    };
  });

  await step('selected contact Activity exposes dead-letter rows only when live dead-letter data exists', async () => {
    if (!canonicalCards.length) {
      report.status = 'skipped_no_live_canonical_contacts';
      return {
        skipped: true,
        reason: 'No scoped canonical One Time contacts returned from production.',
      };
    }

    const inspected = [];
    for (const card of canonicalCards.slice(0, 25)) {
      const contactKey = String(card.id || '');
      if (!contactKey) continue;
      const encoded = encodeURIComponent(contactKey);
      const timeline = await fetchJson(
        `/api/bna/crm/contacts/${encoded}/timeline?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}`,
        authHeaders
      );
      const conversations = await fetchJson(
        `/api/bna/crm/contacts/${encoded}/conversations?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}&limit=50`,
        authHeaders
      );
      assert(timeline.external_write_performed !== true, 'CRM timeline reported an external write');
      assert(conversations.external_write_performed !== true, 'CRM conversations reported an external write');
      assert(timeline.no_send === true || timeline.no_send === undefined, 'CRM timeline no-send flag was false');
      assert(conversations.no_send === true || conversations.no_send === undefined, 'CRM conversations no-send flag was false');

      const timelineItems = Array.isArray(timeline.timeline) ? timeline.timeline : [];
      const conversationItems = Array.isArray(conversations.conversations) ? conversations.conversations : [];
      const deadLetterItems = timelineItems.filter(isDeadLetterItem);
      const operationalConversationCount = conversationItems.filter(isDeliveryOperationalConversation).length;
      assert(operationalConversationCount === 0, 'Delivery operational row appeared in selected-contact Conversations');
      inspected.push({
        timeline_count: timelineItems.length,
        conversation_count: conversationItems.length,
        dead_letter_timeline_count: deadLetterItems.length,
        delivery_operational_conversation_count: operationalConversationCount,
      });
      if (deadLetterItems.length > 0) {
        deadLetterItems.forEach(assertDeadLetterRedaction);
        report.dead_letter_match = true;
        return {
          inspected_candidates: inspected.length,
          matched_dead_letter_timeline: true,
          dead_letter_timeline_count: deadLetterItems.length,
          delivery_operational_conversation_count: operationalConversationCount,
          no_send: timeline.no_send !== false && conversations.no_send !== false,
        };
      }
    }

    report.status = 'skipped_no_live_dead_letters';
    report.inspected_candidate_count = inspected.length;
    return {
      skipped: true,
      reason: 'Canonical One Time contacts were present, but no assistant_dead_letters DTO was returned from the inspected production sample.',
      inspected_candidates: inspected.length,
      inspected_counts: inspected,
    };
  });

  if (report.status === 'unknown') report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    report: relative(paths.mdPath),
    canonical_contact_candidate_count: report.canonical_contact_candidate_count,
    dead_letter_match: report.dead_letter_match || false,
  }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Preserve the original failure if report writing fails.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
