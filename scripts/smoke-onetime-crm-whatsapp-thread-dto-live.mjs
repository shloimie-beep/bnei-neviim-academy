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
    'Read-only live smoke; no contact IDs, names, phone numbers, addresses, message bodies, message IDs, sends, payments, access grants, or external writes are saved.',
    'The smoke records only aggregate counts, channel flags, no-send flags, and whether an existing WhatsApp DTO was found.',
    'If production has no scoped One Time WhatsApp thread rows, the probe records a skip rather than creating synthetic data or sending a message.',
  ],
};

let cookie = null;
let phoneCandidateCards = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-crm-whatsapp-thread-dto-live-smoke.${ext}`);
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
    `# One Time CRM WhatsApp Thread DTO Live Smoke - ${report.started_at}`,
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

function isWhatsappConversation(item = {}) {
  const haystack = `${item.open_action || ''} ${item.channel || ''} ${item.source || ''} ${item.provider || ''} ${item.communication_type || ''}`.toLowerCase();
  return /whatsapp|wapi|whapi/.test(haystack);
}

async function main() {
  await step('operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  const authHeaders = { cookie: cookieHeader(cookie) };

  await step('scoped One Time CRM cards expose phone candidates without external writes', async () => {
    const route = `/api/bna/crm/contacts?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}&sort=last_activity_desc&limit=100`;
    const data = await fetchJson(route, authHeaders);
    assert(Array.isArray(data.cards), 'CRM response did not include cards array');
    assert(data.external_write_performed !== true, 'CRM list reported an external write');
    assert(data.no_send === true || data.no_send === undefined, 'CRM list no-send flag was false');
    phoneCandidateCards = data.cards.filter((card) => String(card?.phone || '').replace(/\D+/g, '').length >= 7);
    report.crm_cards_count = data.cards.length;
    report.phone_candidate_count = phoneCandidateCards.length;
    return {
      cards_count: data.cards.length,
      phone_candidate_count: phoneCandidateCards.length,
      no_send: data.no_send !== false,
    };
  });

  await step('selected contact conversations DTO includes scoped WhatsApp thread when live WhatsApp data exists', async () => {
    if (!phoneCandidateCards.length) {
      report.status = 'skipped_no_phone_candidates';
      return {
        skipped: true,
        reason: 'No scoped One Time CRM cards with phone candidates returned from production.',
      };
    }

    const inspected = [];
    for (const card of phoneCandidateCards.slice(0, 25)) {
      const contactKey = String(card.id || '');
      if (!contactKey) continue;
      const route = `/api/bna/crm/contacts/${encodeURIComponent(contactKey)}/conversations?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}&limit=25`;
      const data = await fetchJson(route, authHeaders);
      assert(data.external_write_performed !== true, 'CRM conversations reported an external write');
      assert(data.no_send === true || data.no_send === undefined, 'CRM conversations no-send flag was false');
      const conversations = Array.isArray(data.conversations) ? data.conversations : [];
      const whatsappCount = conversations.filter(isWhatsappConversation).length;
      inspected.push({
        conversation_count: conversations.length,
        whatsapp_conversation_count: whatsappCount,
      });
      if (whatsappCount > 0) {
        report.selected_contact_whatsapp_thread_match = true;
        report.status = 'passed';
        return {
          inspected_candidates: inspected.length,
          matched_whatsapp_conversation: true,
          conversation_count: conversations.length,
          whatsapp_conversation_count: whatsappCount,
          no_send: data.no_send !== false,
        };
      }
    }

    report.status = 'skipped_no_live_whatsapp_threads';
    report.inspected_candidate_count = inspected.length;
    return {
      skipped: true,
      inspected_candidates: inspected.length,
      reason: 'Production phone candidates had no existing scoped WhatsApp conversation DTO rows.',
    };
  });

  if (report.status === 'unknown') report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    report: relative(paths.mdPath),
    phone_candidate_count: report.phone_candidate_count,
    selected_contact_whatsapp_thread_match: report.selected_contact_whatsapp_thread_match || false,
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
