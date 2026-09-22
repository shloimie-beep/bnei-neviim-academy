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
    'Read-only live smoke; no contact IDs, names, addresses, subjects, bodies, message IDs, sends, payments, access grants, or external writes are saved.',
    'The smoke records only counts, channel/open-action flags, no-send flags, and whether a matching email DTO was found.',
    'If production has no scoped One Time cards with mailbox activity, the probe records a skip rather than creating data.',
  ],
};

let cookie = null;
let candidateCards = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-crm-email-thread-dto-live-smoke.${ext}`);
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
    `# One Time CRM Email Thread DTO Live Smoke - ${report.started_at}`,
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

function isEmailConversation(item = {}) {
  const haystack = `${item.open_action || ''} ${item.channel || ''} ${item.source || ''} ${item.provider || ''} ${item.communication_type || ''}`.toLowerCase();
  return /email|resend|mail/.test(haystack);
}

async function main() {
  await step('operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  const authHeaders = { cookie: cookieHeader(cookie) };

  await step('scoped One Time CRM cards expose mailbox activity candidates', async () => {
    const route = `/api/bna/crm/contacts?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}&sort=last_activity_desc&limit=100`;
    const data = await fetchJson(route, authHeaders);
    assert(Array.isArray(data.cards), 'CRM response did not include cards array');
    assert(data.external_write_performed !== true, 'CRM list reported an external write');
    candidateCards = data.cards.filter((card) => Number(card?.mailbox?.message_count || 0) > 0 || card?.mailbox?.latest_thread_key);
    report.crm_cards_count = data.cards.length;
    report.mailbox_candidate_count = candidateCards.length;
    return {
      cards_count: data.cards.length,
      mailbox_candidate_count: candidateCards.length,
      no_send: data.no_send !== false,
    };
  });

  await step('selected contact conversations DTO includes scoped email thread when live mailbox data exists', async () => {
    if (!candidateCards.length) {
      report.status = 'skipped_no_live_mailbox_data';
      return {
        skipped: true,
        reason: 'No scoped One Time CRM cards with mailbox activity returned from production.',
      };
    }

    const inspected = [];
    for (const card of candidateCards.slice(0, 10)) {
      const contactKey = String(card.id || '');
      if (!contactKey) continue;
      const route = `/api/bna/crm/contacts/${encodeURIComponent(contactKey)}/conversations?workspace=${encodeURIComponent(workspaceKey)}&project_key=${encodeURIComponent(projectKey)}&limit=25`;
      const data = await fetchJson(route, authHeaders);
      assert(data.external_write_performed !== true, 'CRM conversations reported an external write');
      assert(data.no_send === true || data.no_send === undefined, 'CRM conversations no-send flag was false');
      const conversations = Array.isArray(data.conversations) ? data.conversations : [];
      const emailCount = conversations.filter(isEmailConversation).length;
      inspected.push({
        mailbox_message_count: Number(card?.mailbox?.message_count || 0),
        conversation_count: conversations.length,
        email_conversation_count: emailCount,
      });
      if (emailCount > 0) {
        report.selected_contact_email_thread_match = true;
        return {
          inspected_candidates: inspected.length,
          matched_email_conversation: true,
          conversation_count: conversations.length,
          email_conversation_count: emailCount,
          no_send: data.no_send !== false,
        };
      }
    }

    report.selected_contact_email_thread_match = false;
    throw new Error(`Inspected ${inspected.length} mailbox candidate(s), but selected contact conversations did not include an email DTO.`);
  });

  if (report.status === 'unknown') report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    report: relative(paths.mdPath),
    mailbox_candidate_count: report.mailbox_candidate_count,
    selected_contact_email_thread_match: report.selected_contact_email_thread_match || false,
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
