#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data };
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-developer-tester-ticket-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-developer-tester-ticket-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Developer Tester Ticket Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const detail = step.error ? ` - ${step.error}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${detail}`;
    }),
    '',
    '## Result',
    `- ticket_id: ${report.result.ticket_id || 'n/a'}`,
    `- thread_id: ${report.result.thread_id || 'n/a'}`,
    `- support_ticket_id: ${report.result.support_ticket_id || 'n/a'}`,
    `- codex_status: ${report.result.codex_status || 'n/a'}`,
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required');
  const auth = basicAuthHeader(username, password);
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    result: {},
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.steps.push({
        name,
        ok: false,
        duration_ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  let assistantData = null;
  await step('developer tester creates a scoped ticket without Codex queue', async () => {
    const payload = {
      role: 'developer_tester',
      mode: 'developer_tester',
      action: 'create_ticket',
      title: 'Developer tester live smoke ticket',
      message: 'Developer tester live smoke: the setup page save button appears covered on mobile. Synthetic proof only.',
      tester_name: 'Codex Live Smoke',
      tester_email: `codex-live-smoke+${Date.now()}@example.test`,
      page_path: '/assistant-setup.html?student_id=123&household_id=456&providerProfileId=789&token=secret-smoke',
      page_url: `${appUrl}/assistant-setup.html?student_id=123&household_id=456&token=secret-smoke`,
      surface: 'setup_page',
      user_agent: 'CodexDeveloperTesterSmoke/1.0 token=secret-smoke',
      platform: 'Win32',
      context: {
        surface: 'setup_page',
        page_title: 'Assistant setup live smoke',
        viewport: { width: 390, height: 844 },
        device: { platform: 'Win32', devicePixelRatio: 2 },
        screenshot_ref: 'data:image/png;base64,c2VjcmV0LXNtb2tl',
        logs: {
          message: 'Synthetic layout note',
          student_id: 123,
          household_id: 456,
          token: 'secret-smoke',
        },
      },
      student_id: 123,
      household_id: 456,
      provider_profile_id: 789,
    };
    const { data } = await requestJson(`${appUrl}/api/bna/assistant/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assistantData = data;
    assert(data.success === true, 'assistant response did not return success');
    assert(data.actor?.type === 'developer_tester', `actor type was ${data.actor?.type}`);
    assert(data.actor?.can_use_codex === false, 'developer tester unexpectedly had Codex access');
    const ticketAction = (data.actions || []).find((action) => action.action_type === 'create_ticket');
    assert(ticketAction, 'create_ticket action was not returned');
    assert(ticketAction.status === 'completed', `ticket action status was ${ticketAction.status}`);
    assert(ticketAction.queued_codex !== true, 'developer tester ticket queued Codex');
    assert(!ticketAction.task?.id, 'developer tester ticket created a task');
    assert(ticketAction.ticket?.id, 'ticket id was not returned');
    report.result.ticket_id = ticketAction.ticket.id;
    report.result.support_ticket_id = ticketAction.support_ticket?.id || null;
    report.result.thread_id = data.thread?.id || null;
    report.result.codex_status = ticketAction.ticket.codex_status || 'none';
    return {
      ticket_id: ticketAction.ticket.id,
      support_ticket_id: ticketAction.support_ticket?.id || null,
      thread_id: data.thread?.id || null,
      action_status: ticketAction.status,
    };
  });

  await step('saved ticket keeps tester context sanitized', async () => {
    const ticketId = report.result.ticket_id;
    assert(ticketId, 'ticket id missing from previous step');
    const { data } = await requestJson(`${appUrl}/api/bna/tickets/${ticketId}`, {
      headers: { Authorization: auth },
    });
    const ticket = data.ticket;
    assert(ticket?.id || ticket?.ticket_id, 'ticket readback missing');
    assert(ticket.codex_status === 'none', `codex_status was ${ticket.codex_status}`);
    assert(!ticket.task_id, `ticket unexpectedly has task_id ${ticket.task_id}`);
    assert(String(ticket.assigned_to || '').toLowerCase() !== 'codex', `ticket assigned_to was ${ticket.assigned_to}`);
    const source = ticket.source_context || {};
    assert(source.actor_type === 'developer_tester', `source actor_type was ${source.actor_type}`);
    assert(source.no_external_send === true, 'ticket did not preserve no_external_send guard');
    assert(source.household_id === null || source.household_id === undefined, 'household id leaked into source context');
    assert(source.student_id === null || source.student_id === undefined, 'student id leaked into source context');
    assert(source.provider_profile_id === null || source.provider_profile_id === undefined, 'provider profile id leaked into source context');
    const serialized = JSON.stringify(source);
    assert(!/student_id=123|household_id=456|providerProfileId=789|token=secret-smoke/.test(serialized), 'private query context was not redacted');
    const testerContext = source.developer_tester_context || {};
    assert(testerContext.no_private_record_context === true, 'tester context did not assert no private record context');
    assert(testerContext.screenshot_ref?.type === 'redacted_data_url', 'screenshot data URL was not redacted');
    assert(!JSON.stringify(testerContext.log_context || {}).includes('secret-smoke'), 'log context leaked synthetic token');
    return {
      ticket_id: ticket.id || ticket.ticket_id,
      codex_status: ticket.codex_status,
      source_actor_type: source.actor_type,
      screenshot_ref_type: testerContext.screenshot_ref?.type || null,
    };
  });

  const paths = writeReports(report);
  console.log(`Report: ${paths.markdown}`);
  if (report.steps.some((step) => !step.ok)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
