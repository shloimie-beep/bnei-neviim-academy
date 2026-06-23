const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');

test('observable Codex queue migration promotes tickets, canonical jobs, bridge metadata, and events', () => {
  const sql = read('railway-migration-2026-06-15-observable-codex-queue.sql');

  assert.match(sql, /DROP VIEW bna_tickets/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS bna_tickets/i);
  assert.match(sql, /queued_for_codex/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS bna_agent_job_events/i);
  assert.match(sql, /status TEXT NOT NULL DEFAULT 'queued'/);
  assert.match(sql, /ALTER TABLE bna_agent_jobs ALTER COLUMN status SET DEFAULT 'queued'/);
  assert.match(sql, /CHECK \(status IN \('queued', 'running', 'completed', 'failed', 'blocked_needs_human_decision'\)\)/);
  assert.match(sql, /WHEN 'queued_for_codex' THEN 'queued'/);
  assert.match(sql, /WHEN 'in_progress' THEN 'running'/);
  assert.match(sql, /WHEN 'done' THEN 'completed'/);
  assert.match(sql, /WHEN 'needs_decision' THEN 'blocked_needs_human_decision'/);
  assert.doesNotMatch(sql, /status TEXT NOT NULL DEFAULT 'queued_for_codex'/);
  assert.match(sql, /ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS source_chat_id/i);
  assert.match(sql, /ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS ticket_id/i);
  assert.match(sql, /idx_bna_agent_jobs_source_message/i);
});

test('server exposes idempotent bot capture and observable agent job lifecycle APIs', () => {
  const server = read('server.js');

  assert.match(server, /async function captureIncomingBotMessage/);
  assert.match(server, /source_chat_id/);
  assert.match(server, /source_message_id/);
  assert.match(server, /app\.post\('\/api\/bna\/bot\/capture'/);
  assert.match(server, /app\.get\('\/api\/bna\/codex-queue\/status'/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-jobs\/:id\/claim'/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-jobs\/:id\/complete'/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-jobs\/:id\/block'/);
  assert.match(server, /AGENT_JOB_STATUSES = new Set\(\['queued', 'running', 'completed', 'failed', 'blocked_needs_human_decision'\]\)/);
  assert.match(server, /function ticketStatusFromAgentJobStatus/);
  assert.match(server, /AND status = 'queued'/);
  assert.match(server, /SET status = 'running'/);
  assert.match(server, /applyAgentJobLinkedStatus\(job, 'completed'/);
  assert.match(server, /blocked_needs_human_decision/);
  assert.doesNotMatch(server, /not queued_for_codex/);
  assert.match(server, /staleAgentJobCandidates/);
  assert.match(server, /appendAgentJobEvent/);
});

test('agent fleet prefers observable jobs and reports source-chat status transitions', () => {
  const supervisor = read('scripts/agent-fleet-supervisor.mjs');

  assert.match(supervisor, /loadAgentJobs/);
  assert.match(supervisor, /claimAgentJob/);
  assert.match(supervisor, /completeAgentJob/);
  assert.match(supervisor, /blockAgentJob/);
  assert.match(supervisor, /processAgentJob/);
  assert.match(supervisor, /sendTelegramToChat/);
  assert.match(supervisor, /Codex started job/);
  assert.match(supervisor, /Codex completed task/);
  assert.match(supervisor, /status = 'queued'/);
  assert.match(supervisor, /blocked_needs_human_decision/);
  assert.doesNotMatch(supervisor, /queued_for_codex/);
});

test('Telegram bridge and Operations UI surface ticket and job queue IDs', () => {
  const bridge = read('scripts/telegram-kimi-bridge.mjs');
  const operations = read('public/operations.html');

  assert.match(bridge, /\/api\/bna\/bot\/capture/);
  assert.match(bridge, /Created ticket #/);
  assert.match(bridge, /Queued for Codex: job #/);
  assert.match(bridge, /\/api\/bna\/codex-queue\/status/);
  assert.match(operations, /queue\.jobs/);
  assert.match(operations, /ticket #/);
  assert.match(operations, /job #/);
  assert.match(operations, /stale_candidates/);
});
