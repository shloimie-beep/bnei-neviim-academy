const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('mixed-recording parser has durable source item keys and unique guards', () => {
  const server = read('server.js');

  assert.match(server, /function mixedRecordingParserItemKey\(jobId, lane, parts = \[\]\)/);
  assert.match(server, /function mixedRecordingParserMetadata\(job = \{\}, lane, parserItemKey, original, extra = \{\}\)/);
  assert.match(server, /idx_bna_tasks_mixed_parser_item_key_unique/);
  assert.match(server, /idx_bna_accountability_mixed_parser_item_key_unique/);
  assert.match(server, /idx_bna_group_entries_mixed_parser_item_key_unique/);
  assert.match(server, /ai_parsed->>'parser_item_key'/);
  assert.match(server, /metadata->>'parser_item_key'/);
});

test('parser-linked task creation updates an existing source item instead of duplicating it', () => {
  const server = read('server.js');

  assert.match(server, /const parserItemKey = aiParsed && typeof aiParsed === 'object'[\s\S]*?aiParsed\.parser_item_key/);
  assert.match(server, /UPDATE bna_tasks[\s\S]*?WHERE ai_parsed->>'parser_item_key' = \$19[\s\S]*?RETURNING \*/);
  assert.match(server, /source_context: \{[\s\S]*?content_job_id: job\.id[\s\S]*?parser_item_key: parserItemKey[\s\S]*?source_workspace_id: job\.workspace_id \|\| null/);
  assert.match(server, /ai_parsed: mixedRecordingParserMetadata\(job, 'task', parserItemKey, task\)/);
});

test('mixed-recording parser scopes student matching and task fallback routing to the job workspace', () => {
  const server = read('server.js');

  assert.match(server, /job\.workspace_id = job\.workspace_id \|\| defaultSchoolWorkspace\.id;/);
  assert.match(server, /const jobProjectKey = await projectKeyForWorkspaceId\(job\.workspace_id, DEFAULT_PROJECT_KEY, pool\);/);
  assert.match(server, /FROM bna_students[\s\S]*?AND workspace_id = \$1[\s\S]*?\[job\.workspace_id\]/);
  assert.match(server, /inferProjectKeyFromText\(taskText, jobProjectKey\)/);
  assert.doesNotMatch(server, /Use force if you intentionally want to reparse and create new records/);
});

test('mixed-recording non-task lanes upsert by parser item key', () => {
  const server = read('server.js');

  assert.match(server, /async function upsertMixedRecordingAccountabilityEvent\(client, input = \{\}\)/);
  assert.match(server, /UPDATE bna_accountability_events[\s\S]*?WHERE metadata->>'parser_item_key' = \$20/);
  assert.match(server, /async function upsertMixedRecordingGroupGoalEntry\(client, input = \{\}\)/);
  assert.match(server, /UPDATE bna_group_goal_entries[\s\S]*?WHERE metadata->>'parser_item_key' = \$15/);
  assert.match(server, /mixedRecordingParserMetadata\(job, 'accountability_event', parserItemKey, event\)/);
  assert.match(server, /mixedRecordingParserMetadata\(job, 'group_goal_entry', parserItemKey, entry/);
  assert.match(server, /parserItemKey: mixedRecordingParserItemKey\(job\.id, 'torah_timer_event'/);
});
