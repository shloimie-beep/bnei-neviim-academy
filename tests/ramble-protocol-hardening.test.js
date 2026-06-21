const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

test('ramble protocol source-of-truth docs and handoffs exist', () => {
  const agents = read('AGENTS.md');
  const template = read('tasks-pending/_template-ramble-intake.md');
  const goalModeTemplate = read('tasks-pending/_template-goal-mode-correction-output.md');
  const correctionAudit = read('tasks-pending/2026-06-16-website-ramble-correction-audit.md');
  const rawInputReadme = read('raw-input/README.md');
  const migration = read('railway-migration-2026-06-16-raw-intake-queue.sql');

  assert.match(agents, /## Ramble Protocol - Required For All Operator Dumps/);
  assert.match(agents, /## Raw Input Queue/);
  assert.match(agents, /RAW-YYYYMMDD-###/);
  assert.match(agents, /REQ-YYYYMMDD-###/);
  assert.match(agents, /Completion requires evidence/i);
  assert.match(agents, /tasks-pending\/_template-ramble-intake\.md/);
  assert.match(agents, /## Goal-Mode Ramble Execution Trigger/);
  assert.match(agents, /BNA_GOAL_MODE_EXECUTION_PACKET/);
  assert.match(agents, /tasks-pending\/_template-goal-mode-correction-output\.md/);
  assert.match(agents, /create or continue an active goal/i);
  assert.match(agents, /terminal status/i);
  assert.match(agents, /Telegram capture confirmations should name the raw ID/i);
  assert.match(agents, /Legacy Family Accountability docs are not current BNA source of truth/i);

  for (const heading of [
    'Raw intake',
    'Raw queue record',
    'Parsed requirements',
    'Parsed tasks',
    'Decisions',
    'Open questions',
    'Durable memory candidates',
    'Implementation map',
    'Final audit',
  ]) {
    assert.match(template, new RegExp(`## ${heading}`));
  }
  assert.match(template, /RAW-YYYYMMDD-###/);
  assert.match(template, /## Goal-mode execution/);
  assert.match(template, /Goal-mode requested/);
  assert.match(template, /_template-goal-mode-correction-output\.md/);
  assert.match(template, /Allowed statuses/);

  assert.match(goalModeTemplate, /# BNA_GOAL_MODE_EXECUTION_PACKET/);
  assert.match(goalModeTemplate, /Create or continue an active Codex goal/i);
  assert.match(goalModeTemplate, /terminal status/i);
  assert.match(goalModeTemplate, /Deploy\/live-smoke/i);

  assert.match(correctionAudit, /single source of truth for Shloimie's current website correction ramble/);
  assert.match(correctionAudit, /REQ-20260616-001/);
  assert.match(correctionAudit, /Final audit/);

  assert.match(rawInputReadme, /bna_raw_intake/);
  assert.match(rawInputReadme, /Repo files under `raw-input\/` are allowed/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_raw_intake/);
  assert.match(migration, /stable_id TEXT UNIQUE NOT NULL/);
  assert.match(migration, /idx_bna_raw_intake_register_path/);
});

test('prompt and watchdog audits enforce ramble protocol hooks', () => {
  const promptsAudit = read('scripts/prompts-audit.mjs');
  const watchdogAudit = read('scripts/watchdog-audit.mjs');

  assert.match(promptsAudit, /RAMBLE-PROTOCOL/);
  assert.match(promptsAudit, /ramble protocol required files missing/i);
  assert.match(promptsAudit, /Ramble Protocol Hardening/);

  assert.match(watchdogAudit, /rambleTemplate/);
  assert.match(watchdogAudit, /websiteRambleCorrectionAudit/);
  assert.match(watchdogAudit, /Canonical intake parser lacks ramble protocol metadata/);
  assert.match(watchdogAudit, /Telegram capture confirmations lack ramble protocol wording/);
  assert.match(watchdogAudit, /Goal-mode ramble execution protocol is missing from AGENTS\.md/);
  assert.match(watchdogAudit, /Goal-mode correction output template is missing execution rules/);
  assert.match(watchdogAudit, /## Ramble Protocol/);
});

test('Telegram capture confirmation names raw ID, counts, register, and proof closeout', () => {
  const bridge = read('scripts/telegram-kimi-bridge.mjs');

  assert.match(bridge, /function buildRambleCaptureConfirmationLines/);
  assert.match(bridge, /Raw ID: \$\{rawId\}/);
  assert.match(bridge, /Raw saved: \$\{memoryPath\}; visible items are distilled, not raw transcript/);
  assert.match(bridge, /Parsed counts: \$\{countParts\.join/);
  assert.match(bridge, /Requirement register: \$\{registerPath\}/);
  assert.match(bridge, /Goal mode: create\/continue the Codex goal/);
  assert.match(bridge, /BNA_GOAL_MODE_EXECUTION_PACKET/);
  assert.match(bridge, /Future Codex handoff: tasks-pending\/_template-ramble-intake\.md/);
  assert.match(bridge, /Done requires ledger\/changelog plus proof, live smoke, blocker, or superseded status/);
  assert.match(bridge, /lines\.push\(\.\.\.buildRambleCaptureConfirmationLines\(captureSummary\)\)/);
});
