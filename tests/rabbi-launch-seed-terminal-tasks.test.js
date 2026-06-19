const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');

test('Rabbi launch seeding preserves completed/history tasks', () => {
  assert.match(server, /function taskIsTerminalHistory\(task = \{\}\)/);
  assert.match(server, /task\.completed_at/);
  assert.match(server, /task\.verified_at/);
  assert.match(server, /safeTaskKind\(task\.task_kind, null\) === 'history'/);
  assert.match(server, /const existingTerminal = taskIsTerminalHistory\(existing\)/);
  assert.match(server, /const nextStage = existingTerminal[\s\S]*'done'/);
  assert.match(server, /const nextTaskKind = existingTerminal \? 'history' : specTaskKind/);
  assert.match(server, /agent_status = CASE WHEN \$21::boolean THEN 'completed' ELSE agent_status END/);
  assert.match(server, /if \(!taskIsTerminalHistory\(task\) && \(spec\.agent_executable \|\| isAgentAssignee\(task\.assigned_to\)\)\)/);
  assert.doesNotMatch(server, /if \(spec\.agent_executable \|\| isAgentAssignee\(task\.assigned_to\)\) \{\s*await ensureAgentJobForTask\(task, \{ agent_executable: true, source: 'rabbi_launch_seed' \}/);
});

test('generic agent job paths do not reopen terminal proof tasks', () => {
  assert.match(server, /function taskNeedsAgentJob\(task = \{\}, input = \{\}\) \{\s*if \(taskIsTerminalHistory\(task\)\) return false;/);
  assert.match(server, /async function ensureAgentJobForTask\(task, input = \{\}, db = pool\) \{\s*if \(!task\?\.id\) return null;\s*if \(taskIsTerminalHistory\(task\)\) return null;/);
  assert.match(server, /WHEN task_base\.completed_at IS NOT NULL\s+OR task_base\.verified_at IS NOT NULL[\s\S]*THEN 'completed'/);
  assert.match(server, /WHEN task_base\.completed_at IS NOT NULL OR task_base\.verified_at IS NOT NULL OR task_base\.stage IN \('done', 'archive'\) OR COALESCE\(task_base\.task_kind, ''\) = 'history' THEN 'done'/);
  assert.match(server, /if \(taskIsTerminalHistory\(task\)\) \{\s*task = \(await pool\.query\(/);
  assert.match(server, /task_kind = 'history'/);
});

test('assistant portal readiness seeding preserves terminal tasks', () => {
  assert.match(server, /async function ensureAssistantPortalReadinessTasks\(bna, db = pool\) \{[\s\S]*const existingTerminal = taskIsTerminalHistory\(existing\)/);
  assert.match(server, /async function ensureAssistantPortalReadinessTasks\(bna, db = pool\) \{[\s\S]*const nextStage = existingTerminal[\s\S]*'done'/);
  assert.match(server, /async function ensureAssistantPortalReadinessTasks\(bna, db = pool\) \{[\s\S]*task_kind = CASE WHEN \$14::boolean THEN 'history' ELSE task_kind END/);
  assert.match(server, /async function ensureAssistantPortalReadinessTasks\(bna, db = pool\) \{[\s\S]*agent_status = CASE WHEN \$14::boolean THEN 'completed' ELSE agent_status END/);
  assert.match(server, /async function ensureAssistantPortalReadinessTasks\(bna, db = pool\) \{[\s\S]*completed_at = CASE WHEN \$14::boolean THEN COALESCE\(completed_at, NOW\(\)\) ELSE completed_at END/);
  assert.match(server, /if \(!taskIsTerminalHistory\(updated\) && \(spec\.agent_executable \|\| isAgentAssignee\(updated\.assigned_to\)\)\) \{/);
});
