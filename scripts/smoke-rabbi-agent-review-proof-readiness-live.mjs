#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const latestReportDir = path.join(repoRoot, 'ops', 'agent-review-proof-readiness');
const env = loadSmokeEnv({ root: repoRoot });
const appUrl = String(process.env.BNA_APP_URL || env.BNA_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
const oneTimeUrl = String(
  process.env.ONE_TIME_PUBLIC_BASE_URL ||
  process.env.ONE_TIME_APP_URL ||
  process.env.ONETIME_BASE_URL ||
  env.ONE_TIME_PUBLIC_BASE_URL ||
  env.ONE_TIME_APP_URL ||
  env.ONETIME_BASE_URL ||
  'https://join.onetimeonetime.com'
).replace(/\/+$/, '');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

const promptChecks = [
  {
    key: 'rabbi-telegram-helper-ticket-smoke',
    requirement_id: 'REQ-20260708-101',
    markers: [
      'REQ-20260708-084',
      'REQ-20260708-100 scoped sidekick behavior',
      'REQ-20260708-101 all-contact/all-message scope',
      'TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER',
      'super-admin support ticket ding routing',
      'OPERATIONS_DROPOFF_SAVED',
      'OPERATIONS_DROPOFF_FAILED',
      'Do not send a WhatsApp message',
    ],
  },
  {
    key: 'rabbi-helper-tool-scope-map',
    requirement_id: 'REQ-20260708-093',
    markers: [
      'REQ-20260708-093',
      'RABBI-HELPER-SCOPE-001',
      'RABBI-HELPER-SCOPE-163',
      'all 163 current helper parity tool-needed contracts',
      'operations 97, parent 19, provider 30, rabbi 2, student 15',
      'If you cannot complete all 163 contracts in one Agent Mode run, save BLOCKED',
      'OPERATIONS_DROPOFF_SAVED',
      'OPERATIONS_DROPOFF_FAILED',
    ],
  },
];

const report = {
  started_at: new Date().toISOString(),
  app_url: appUrl,
  one_time_url: oneTimeUrl,
  status: 'unknown',
  steps: [],
  prompt_readbacks: [],
  artifact_readbacks: [],
  hub_prompt_state: [],
  remaining_blockers: [],
  next_agent_mode_prompts: [],
  guardrails: [
    'Read-only smoke only.',
    'No Agent Review result is saved by this script.',
    'No Telegram, email, WhatsApp/WAPI, payment, access, Drive, Vimeo, Zoom, DNS, credential, public publish, or external provider mutation is performed.',
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-rabbi-agent-review-proof-readiness-live.${ext}`);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function secretLikeText(text) {
  return /OPS_PASSWORD|API_KEY=|COOKIE=|Bearer\s+[A-Za-z0-9._-]{20,}|sk-[A-Za-z0-9._-]{20,}/.test(String(text || ''));
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url, options = {}) {
  const { response, text } = await fetchText(url, options);
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  return { response, data, text };
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

async function assertPublicPrompt(prompt) {
  const url = `${oneTimeUrl}/agent-review-prompts/${encodeURIComponent(prompt.key)}.md`;
  const { response, text } = await fetchText(url);
  assert(response.status === 200, `${prompt.key} prompt returned ${response.status}`);
  assert(!secretLikeText(text), `${prompt.key} prompt contains secret-like text`);
  for (const marker of prompt.markers) {
    assert(text.includes(marker), `${prompt.key} prompt missing marker: ${marker}`);
  }
  assert(text.includes('API fallback: https://bneineviimacademy.org/api/bna/agent-review/results'), `${prompt.key} missing API fallback`);
  assert(text.includes('You must submit the structured result yourself'), `${prompt.key} missing self-save instruction`);
  const readback = {
    prompt_key: prompt.key,
    requirement_id: prompt.requirement_id,
    url,
    status: response.status,
    marker_count: prompt.markers.length,
  };
  report.prompt_readbacks.push(readback);
  return readback;
}

function assertScopeMap(data) {
  assert(data?.target_account?.workspace_key === 'rabbi_sheller_provider', 'scope map workspace mismatch');
  assert(data?.target_account?.project_key === 'one_time_mishnah_class', 'scope map project mismatch');
  assert(data?.source?.contract_count === 163, `scope map source contract_count ${data?.source?.contract_count}`);
  assert(Array.isArray(data?.contracts), 'scope map contracts missing');
  assert(data.contracts.length === 163, `scope map contract length ${data.contracts.length}`);
  assert(data.contracts[0]?.id === 'RABBI-HELPER-SCOPE-001', 'scope map first contract mismatch');
  assert(data.contracts.at(-1)?.id === 'RABBI-HELPER-SCOPE-163', 'scope map last contract mismatch');
  const ids = new Set(data.contracts.map((contract) => contract.id));
  assert(ids.size === 163, `scope map duplicate contract IDs: ${163 - ids.size}`);
  const expectedSurfaceCounts = { operations: 97, parent: 19, provider: 30, rabbi: 2, student: 15 };
  for (const [surface, count] of Object.entries(expectedSurfaceCounts)) {
    assert(data?.counts?.by_surface?.[surface] === count, `surface ${surface} count ${data?.counts?.by_surface?.[surface]}, expected ${count}`);
  }
  assert(data?.counts?.by_implementation_status?.tool_wrapper_available_local === 163, 'not all contracts are wrapper-backed');
  assert(data.global_scope_invariants?.some((item) => item.includes('client-supplied scope is advisory only')), 'scope invariant missing client-scope rule');
  assert(data.global_scope_invariants?.some((item) => item.includes('External sends')), 'scope invariant missing external-write rule');
}

function assertAccountTemplate(data) {
  const example = data?.subaccount_examples?.find((item) => item.account_key === 'benny_studio_tasks_bot');
  assert(data?.template_key === 'service_provider_project_bot_scope_v1', 'account template key mismatch');
  assert(example, 'Benny tasks/studio example missing');
  assert(example.allowed_surface_groups?.includes('tasks'), 'Benny template missing tasks allowance');
  assert(example.allowed_surface_groups?.includes('studio'), 'Benny template missing studio allowance');
  for (const forbidden of ['payments', 'contacts_crm', 'communications_send', 'integrations', 'settings', 'agent_fleet', 'super_admin_diagnostics']) {
    assert(example.forbidden_surface_groups?.includes(forbidden), `Benny template missing forbidden group ${forbidden}`);
  }
}

async function assertPublicArtifact(pathname, validator) {
  const url = `${oneTimeUrl}${pathname}`;
  const { response, data, text } = await fetchJson(url);
  assert(response.status === 200, `${pathname} returned ${response.status}`);
  assert(!secretLikeText(text), `${pathname} contains secret-like text`);
  validator(data, text);
  const readback = { path: pathname, url, status: response.status };
  report.artifact_readbacks.push(readback);
  return readback;
}

async function assertHubPromptState(cookie) {
  const { response, data, text } = await fetchJson(`${appUrl}/api/bna/agent-review/contexts`, {
    headers: { cookie },
  });
  assert(response.status === 200, `/api/bna/agent-review/contexts returned ${response.status}: ${text.slice(0, 400)}`);
  assert(data.success === true, 'Agent Review contexts did not return success');
  assert(data.owner?.scope?.type === 'all', 'Agent Review owner scope is not platform all-access');
  for (const prompt of promptChecks) {
    const livePrompt = (data.prompts || []).find((item) => item.key === prompt.key);
    assert(livePrompt, `hub prompt missing ${prompt.key}`);
    const state = {
      prompt_key: prompt.key,
      status: livePrompt.status || null,
      workflow_state: livePrompt.workflow_state || null,
      latest_result_status: livePrompt.latest_result_status || null,
      last_result_ref: livePrompt.last_result_ref || null,
      last_result_url: livePrompt.last_result_url || null,
      public_url: livePrompt.public_url || null,
      dropoff_url: livePrompt.dropoff_url || null,
      terminal_saved_proof: ['pass', 'fail', 'blocked'].includes(String(livePrompt.latest_result_status || '').toLowerCase()),
    };
    report.hub_prompt_state.push(state);
    if (!state.terminal_saved_proof) {
      report.remaining_blockers.push({
        prompt_key: prompt.key,
        blocker: 'No saved terminal Agent Review result is visible for this prompt yet.',
        next_action: `Open ${livePrompt.public_url || `${oneTimeUrl}/agent-review-prompts/${prompt.key}.md`} in Agent Mode, run only that prompt scope, and save PASS/FAIL/BLOCKED through ${livePrompt.dropoff_url || '/operations/agent-review/dropoff'}.`,
      });
      report.next_agent_mode_prompts.push(livePrompt.public_url || `${oneTimeUrl}/agent-review-prompts/${prompt.key}.md`);
    }
  }
  return { prompt_count: data.prompts?.length || 0, checked: report.hub_prompt_state };
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(latestReportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  const latestJsonPath = path.join(latestReportDir, 'latest-rabbi-agent-review-proof-readiness-live.json');
  const latestMdPath = path.join(latestReportDir, 'latest-rabbi-agent-review-proof-readiness-live.md');
  const jsonText = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(jsonPath, jsonText);
  fs.writeFileSync(latestJsonPath, jsonText);
  const lines = [
    `# Rabbi Agent Review Proof Readiness Live Smoke - ${report.started_at}`,
    '',
    `BNA app: ${report.app_url}`,
    `One Time app: ${report.one_time_url}`,
    `Result: ${report.status}`,
    '',
    '## Prompt Readbacks',
    ...report.prompt_readbacks.map((item) => `- PASS ${item.prompt_key}: ${item.url}`),
    '',
    '## Artifact Readbacks',
    ...report.artifact_readbacks.map((item) => `- PASS ${item.path}: ${item.url}`),
    '',
    '## Hub AGR State',
    ...report.hub_prompt_state.map((item) => `- ${item.terminal_saved_proof ? 'TERMINAL' : 'OPEN'} ${item.prompt_key}: status ${item.latest_result_status || item.status || 'none'}, result ${item.last_result_ref || 'none'}`),
    '',
    '## Remaining Blockers',
    ...(report.remaining_blockers.length
      ? report.remaining_blockers.map((item) => `- ${item.prompt_key}: ${item.blocker} Next: ${item.next_action}`)
      : ['- None for these prompt proof states; terminal AGR proof exists for both checked prompts.']),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
    '## Steps',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
  ];
  const mdText = `${lines.join('\n')}\n`;
  fs.writeFileSync(mdPath, mdText);
  fs.writeFileSync(latestMdPath, mdText);
  return { jsonPath, mdPath, latestJsonPath, latestMdPath };
}

async function main() {
  await step('public Rabbi Agent Review prompts are live', async () => {
    const results = [];
    for (const prompt of promptChecks) results.push(await assertPublicPrompt(prompt));
    return results;
  });

  await step('public Rabbi helper scope artifacts are live and current', async () => {
    await assertPublicArtifact('/agent-review-artifacts/rabbi-one-time-tool-scope-map.json', assertScopeMap);
    await assertPublicArtifact('/agent-review-artifacts/rabbi-one-time-tool-scope-map.md', (_data, text) => {
      assert(text.includes('RABBI-HELPER-SCOPE-163'), 'scope map markdown missing final contract marker');
      assert(text.includes('rabbi_sheller_provider'), 'scope map markdown missing workspace marker');
      assert(text.includes('one_time_mishnah_class'), 'scope map markdown missing project marker');
    });
    await assertPublicArtifact('/agent-review-artifacts/account-bot-scope-template.json', assertAccountTemplate);
    return { artifact_count: report.artifact_readbacks.length };
  });

  let cookiePair = '';
  await step('owner login for Agent Review hub readback', async () => {
    const result = await loginOperations({ baseUrl: appUrl, env, cwd: repoRoot });
    assert(result.cookie?.name && result.cookie?.value, result.reason || 'Operations login did not return a usable cookie.');
    cookiePair = `${result.cookie.name}=${result.cookie.value}`;
    return { cookie_name: result.cookie.name, source: result.source || 'unknown' };
  });

  await step('Agent Review hub exposes current Rabbi proof state', async () => {
    return assertHubPromptState(cookiePair);
  });

  const missingTerminal = report.hub_prompt_state.filter((item) => !item.terminal_saved_proof);
  report.status = missingTerminal.length ? 'proof_blocked_or_pending' : 'proof_terminal_saved';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    report: relative(paths.mdPath),
    latest_report: relative(paths.latestMdPath),
    missing_terminal_prompt_count: missingTerminal.length,
    next_agent_mode_prompts: report.next_agent_mode_prompts,
  }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Keep the original error visible if report writing also fails.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
