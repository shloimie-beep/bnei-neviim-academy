#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const liveSmokeDir = path.join(repoRoot, 'ops', 'live-smokes');
const proofDir = path.join(repoRoot, 'ops', 'agent-review-proof-readiness');
const proofJsonPath = path.join(proofDir, 'latest-rabbi-agent-review-proof-readiness-live.json');
const proofMdPath = path.join(proofDir, 'latest-rabbi-agent-review-proof-readiness-live.md');
const directJsonPath = path.join(liveSmokeDir, `${stamp}-rabbi-agent-review-direct-proof.json`);
const directMdPath = path.join(liveSmokeDir, `${stamp}-rabbi-agent-review-direct-proof.md`);

const oneTimeUrl = String(process.env.ONE_TIME_PUBLIC_BASE_URL || process.env.ONE_TIME_APP_URL || process.env.ONETIME_BASE_URL || 'https://join.onetimeonetime.com').replace(/\/+$/, '');
const appUrl = String(process.env.BNA_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');

const report = {
  checked_at: new Date().toISOString(),
  status: 'unknown',
  verification_mode: 'codex_direct_verification_substituting_for_operator_agent_mode',
  operator_instruction:
    'On 2026-07-12 the operator instructed Codex to run whatever verifications can be run directly instead of requiring the operator to run the Agent Mode prompts.',
  app_url: appUrl,
  one_time_url: oneTimeUrl,
  commands: [],
  checks: [],
  prompt_readbacks: [],
  artifact_readbacks: [],
  hub_prompt_state: [],
  direct_evidence: [],
  remaining_blockers: [],
  next_agent_mode_prompts: [],
  guardrails: [
    'This report is Codex direct proof, not a ChatGPT Agent Mode browser transcript.',
    'No Agent Review database result row is fabricated by this script.',
    'No Telegram token, chat ID, cookie, password, API key, raw private message body, or class link is printed.',
    'The Telegram delivery evidence is read from the most recent approved live-smoke report.',
  ],
  secret_values_printed: false,
};

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function secretLikeText(value) {
  return /OPS_PASSWORD\s*[:=]|API_KEY\s*[:=]|COOKIE\s*[:=]|Bearer\s+[A-Za-z0-9._-]{20,}|sk-[A-Za-z0-9._-]{20,}|TELEGRAM_BOT_TOKEN[A-Z0-9_]*\s*[:=]|TELEGRAM_CHAT_ID[A-Z0-9_]*\s*[:=]\s*-?\d{4,}/i.test(String(value || ''));
}

function latestMatchingFile(dir, pattern) {
  if (!fs.existsSync(dir)) return null;
  const matches = fs.readdirSync(dir)
    .filter((file) => pattern.test(file))
    .map((file) => {
      const fullPath = path.join(dir, file);
      return { file, fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return matches[0] || null;
}

function recordCheck(name, ok, details = {}) {
  report.checks.push({ name, ok, details });
}

function runCommand(name, command, args) {
  const started = Date.now();
  try {
    const output = execFileSync(command, args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
      maxBuffer: 1024 * 1024 * 20,
    });
    report.commands.push({
      name,
      command: [command, ...args].join(' '),
      ok: true,
      duration_ms: Date.now() - started,
      output_tail: output.trim().split(/\r?\n/).slice(-8),
    });
    return output;
  } catch (error) {
    report.commands.push({
      name,
      command: [command, ...args].join(' '),
      ok: false,
      duration_ms: Date.now() - started,
      stderr_tail: String(error.stderr || error.message || error).split(/\r?\n/).slice(-12),
    });
    throw error;
  }
}

function validateLatestTelegramLiveSmoke() {
  const latest = latestMatchingFile(liveSmokeDir, /rabbi-telegram-live-smoke\.json$/);
  assert(latest, 'No Rabbi Telegram live-smoke JSON report found.');
  const smoke = JSON.parse(fs.readFileSync(latest.fullPath, 'utf8'));
  assert(smoke.approved_by_operator === true, 'Latest Rabbi Telegram smoke was not operator-approved.');
  assert(smoke.sent === true, 'Latest Rabbi Telegram smoke did not send.');
  assert(smoke.telegram_send_performed === true, 'Latest Rabbi Telegram smoke did not record Telegram send.');
  assert(smoke.status === 200, `Latest Rabbi Telegram smoke status was ${smoke.status}.`);
  assert(smoke.role_alias === 'one_time_rabbi_operator', 'Latest Rabbi Telegram smoke used the wrong role alias.');
  assert(smoke.workspace_key === 'rabbi_sheller_provider', 'Latest Rabbi Telegram smoke workspace mismatch.');
  assert(smoke.project_key === 'one_time_mishnah_class', 'Latest Rabbi Telegram smoke project mismatch.');
  assert(smoke.secret_values_printed === false, 'Latest Rabbi Telegram smoke report printed secret values.');
  recordCheck('latest approved Rabbi Telegram live smoke sent to Rabbi role alias', true, {
    report: relative(latest.fullPath),
    status: smoke.status,
    role_alias: smoke.role_alias,
    workspace_key: smoke.workspace_key,
    project_key: smoke.project_key,
  });
  report.direct_evidence.push(relative(latest.fullPath));
}

function validateRabbiReadinessReport() {
  const readiness = readJson('ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.json');
  assert(readiness.external_write_performed === false, 'Readiness report should be no-send.');
  assert(readiness.rabbi_telegram?.ready === true, 'Rabbi Telegram readiness is not ready.');
  assert(readiness.rabbi_telegram?.status === 'ready', `Rabbi Telegram readiness status is ${readiness.rabbi_telegram?.status}.`);
  assert(readiness.rabbi_telegram?.config?.chat_id_configured === true, 'Rabbi Telegram chat ID is not configured.');
  assert(readiness.rabbi_telegram?.config?.ops_username_configured === true, 'One Time ops username is not configured.');
  assert(readiness.rabbi_telegram?.config?.ops_password_configured === true, 'One Time ops password is not configured.');
  recordCheck('Rabbi Telegram no-send readiness is ready', true, {
    path: 'ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.json',
    status: readiness.rabbi_telegram.status,
    workspace_key: readiness.rabbi_telegram.expected_workspace_key,
    project_key: readiness.rabbi_telegram.expected_project_key,
  });
  report.direct_evidence.push('ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.json');
}

function validateScopeMap() {
  const scopeMapPath = 'ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json';
  const scopeMapText = fs.readFileSync(path.join(repoRoot, scopeMapPath), 'utf8');
  assert(!secretLikeText(scopeMapText), `${scopeMapPath} contains secret-like text.`);
  const scopeMap = JSON.parse(scopeMapText);
  assert(scopeMap.target_account?.workspace_key === 'rabbi_sheller_provider', 'Scope map workspace mismatch.');
  assert(scopeMap.target_account?.project_key === 'one_time_mishnah_class', 'Scope map project mismatch.');
  assert(scopeMap.source?.contract_count === 163, `Scope map source contract_count is ${scopeMap.source?.contract_count}.`);
  assert(Array.isArray(scopeMap.contracts) && scopeMap.contracts.length === 163, `Scope map contract count is ${scopeMap.contracts?.length}.`);
  const ids = scopeMap.contracts.map((contract) => contract.id);
  assert(new Set(ids).size === 163, 'Scope map has duplicate contract IDs.');
  assert(ids[0] === 'RABBI-HELPER-SCOPE-001', 'Scope map first contract ID mismatch.');
  assert(ids.at(-1) === 'RABBI-HELPER-SCOPE-163', 'Scope map final contract ID mismatch.');
  const expectedSurfaceCounts = { operations: 97, parent: 19, provider: 30, rabbi: 2, student: 15 };
  for (const [surface, expected] of Object.entries(expectedSurfaceCounts)) {
    assert(scopeMap.counts?.by_surface?.[surface] === expected, `Scope map ${surface} count is ${scopeMap.counts?.by_surface?.[surface]}.`);
  }
  assert(scopeMap.counts?.by_implementation_status?.tool_wrapper_available_local === 163, 'Not every scope-map contract is wrapper-backed locally.');
  for (const contract of scopeMap.contracts) {
    assert(contract.rabbi_contract?.scope_lock?.workspace_key === 'rabbi_sheller_provider', `${contract.id} workspace lock mismatch.`);
    assert(contract.rabbi_contract?.scope_lock?.project_key === 'one_time_mishnah_class', `${contract.id} project lock mismatch.`);
    assert(contract.rabbi_contract?.scope_lock?.client_scope_trusted === false, `${contract.id} trusts client scope.`);
    assert(contract.rabbi_contract?.scope_lock?.cross_workspace_allowed === false, `${contract.id} allows cross-workspace access.`);
    assert(contract.rabbi_contract?.agent_mode_probe?.safe_prompt?.includes('rabbi_sheller_provider / one_time_mishnah_class'), `${contract.id} safe prompt missing scope.`);
    assert(contract.rabbi_contract?.implementation_gap?.implementation_status === 'tool_wrapper_available_local', `${contract.id} wrapper status mismatch.`);
    assert(contract.rabbi_contract?.result_rules?.audit_log_required === true, `${contract.id} missing audit-log rule.`);
    assert(contract.rabbi_contract?.result_rules?.redaction_required === true, `${contract.id} missing redaction rule.`);
  }
  recordCheck('Rabbi helper scope map has 163 locked wrapper-backed contracts', true, {
    path: scopeMapPath,
    contract_count: scopeMap.contracts.length,
    surface_counts: expectedSurfaceCounts,
  });
  report.direct_evidence.push(scopeMapPath);
}

function validateProofReadinessReadback() {
  const proof = JSON.parse(fs.readFileSync(proofJsonPath, 'utf8'));
  assert(Array.isArray(proof.prompt_readbacks) && proof.prompt_readbacks.length >= 2, 'Proof readiness prompt readbacks missing.');
  assert(Array.isArray(proof.artifact_readbacks) && proof.artifact_readbacks.length >= 3, 'Proof readiness artifact readbacks missing.');
  assert(Array.isArray(proof.hub_prompt_state) && proof.hub_prompt_state.length >= 2, 'Proof readiness hub prompt state missing.');
  for (const item of proof.prompt_readbacks) {
    assert(item.status === 200, `${item.prompt_key} public prompt status ${item.status}.`);
    report.prompt_readbacks.push(item);
  }
  for (const item of proof.artifact_readbacks) {
    assert(item.status === 200, `${item.path} artifact status ${item.status}.`);
    report.artifact_readbacks.push(item);
  }
  recordCheck('live Agent Review public prompts, artifacts, and hub readbacks are reachable', true, {
    proof_path: relative(proofJsonPath),
    prompt_readback_count: proof.prompt_readbacks.length,
    artifact_readback_count: proof.artifact_readbacks.length,
    hub_prompt_state_count: proof.hub_prompt_state.length,
  });
  report.direct_evidence.push(relative(proofJsonPath));
  return proof;
}

function buildPromptState({ promptKey, requirementId, sourceState, evidence }) {
  return {
    prompt_key: promptKey,
    status: 'direct_codex_verified',
    workflow_state: 'direct_codex_verification',
    latest_result_status: 'pass',
    last_result_ref: `CODIRECT-${stamp}-${promptKey}`,
    last_result_url: '',
    public_url: sourceState?.public_url || `${oneTimeUrl}/agent-review-prompts/${promptKey}.md`,
    dropoff_url: sourceState?.dropoff_url || '',
    terminal_saved_proof: true,
    agent_mode_saved_result: false,
    direct_codex_verification: true,
    direct_verification_note:
      'Terminal proof substituted by Codex direct verification at operator request; no Agent Review database result was fabricated.',
    requirement_id: requirementId,
    evidence,
  };
}

function writeDirectProof(sourceProof) {
  fs.mkdirSync(liveSmokeDir, { recursive: true });
  fs.mkdirSync(proofDir, { recursive: true });
  const stateByPrompt = new Map((sourceProof.hub_prompt_state || []).map((item) => [item.prompt_key, item]));
  report.hub_prompt_state = [
    buildPromptState({
      promptKey: 'rabbi-telegram-helper-ticket-smoke',
      requirementId: 'REQ-20260708-084',
      sourceState: stateByPrompt.get('rabbi-telegram-helper-ticket-smoke'),
      evidence: [
        'ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.json',
        ...report.direct_evidence.filter((item) => /rabbi-telegram-live-smoke/.test(item)),
        'tests/rabbi-telegram-notifications.test.js',
        'tests/agent-review-hub.test.js',
      ],
    }),
    buildPromptState({
      promptKey: 'rabbi-helper-tool-scope-map',
      requirementId: 'REQ-20260708-093',
      sourceState: stateByPrompt.get('rabbi-helper-tool-scope-map'),
      evidence: [
        'ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json',
        'ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md',
        'ops/helper-tool-scope/account-bot-scope-template.json',
        'tests/bna-helper-tools.test.js',
        'tests/agent-review-hub.test.js',
      ],
    }),
  ];
  report.status = 'direct_codex_verified';

  const jsonText = `${JSON.stringify(report, null, 2)}\n`;
  assert(!secretLikeText(jsonText), 'Direct proof report contains secret-like text.');
  fs.writeFileSync(directJsonPath, jsonText);
  fs.writeFileSync(proofJsonPath, jsonText);

  const lines = [
    `# Rabbi Agent Review Direct Proof - ${report.checked_at}`,
    '',
    `Status: ${report.status}`,
    `Mode: ${report.verification_mode}`,
    '',
    '## Why This Exists',
    `- ${report.operator_instruction}`,
    '- This is not a ChatGPT Agent Mode browser transcript and does not fabricate an Agent Review DB result.',
    '',
    '## Terminal Prompt States',
    ...report.hub_prompt_state.map((item) => `- PASS ${item.prompt_key}: direct Codex verification (${item.public_url})`),
    '',
    '## Commands',
    ...report.commands.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)`),
    '',
    '## Checks',
    ...report.checks.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name}`),
    '',
    '## Evidence',
    ...[...new Set(report.direct_evidence)].map((item) => `- ${item}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ];
  const mdText = `${lines.join('\n')}\n`;
  assert(!secretLikeText(mdText), 'Direct proof markdown contains secret-like text.');
  fs.writeFileSync(directMdPath, mdText);
  fs.writeFileSync(proofMdPath, mdText);
}

async function main() {
  runCommand('refresh Rabbi Agent Review read-only proof readiness', process.execPath, ['scripts/smoke-rabbi-agent-review-proof-readiness-live.mjs']);
  runCommand('refresh Rabbi Telegram no-send readiness', process.execPath, ['scripts/check-rabbi-telegram-ticket-readiness.mjs']);
  runCommand('focused direct proof tests', process.execPath, [
    '--test',
    'tests/agent-review-hub.test.js',
    'tests/bna-helper-tools.test.js',
    'tests/rabbi-telegram-notifications.test.js',
    'tests/production-readiness-gate.test.js',
    'tests/production-unblocker.test.js',
  ]);

  validateLatestTelegramLiveSmoke();
  validateRabbiReadinessReport();
  validateScopeMap();
  const sourceProof = validateProofReadinessReadback();
  writeDirectProof(sourceProof);

  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    verification_mode: report.verification_mode,
    latest_report: relative(proofMdPath),
    direct_report: relative(directMdPath),
    terminal_prompt_count: report.hub_prompt_state.filter((item) => item.terminal_saved_proof).length,
    remaining_blocker_count: report.remaining_blockers.length,
    secret_values_printed: report.secret_values_printed,
  }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    fs.mkdirSync(liveSmokeDir, { recursive: true });
    fs.mkdirSync(proofDir, { recursive: true });
    const jsonText = `${JSON.stringify(report, null, 2)}\n`;
    fs.writeFileSync(directJsonPath, jsonText);
    fs.writeFileSync(proofJsonPath, jsonText);
  } catch {
    // Preserve the primary error if writing the failure report also fails.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
