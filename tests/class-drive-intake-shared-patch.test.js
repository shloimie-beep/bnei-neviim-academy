const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const patch = fs.readFileSync(
  path.join(root, 'ops', 'class-drive-intake', '2026-06-24-closeout', 'SHARED-PATCH.diff'),
  'utf8'
);

test('shared patch targets real mixed recording helpers', () => {
  assert.match(server, /async function activeStudentsForMixedRecordingParse/);
  assert.match(server, /async function generateMixedRecordingParse/);
  assert.match(server, /async function persistMixedRecordingParse/);
  assert.match(server, /async function parseMixedRecordingSource/);
  assert.match(patch, /activeStudentsForMixedRecordingParse/);
  assert.doesNotMatch(patch, /getStudentsForMixedRecording/);
});

test('shared patch keeps canonical output separate from progress-only persistence', () => {
  assert.match(patch, /progressOnlyMixedRecordingParsePayload/);
  assert.match(patch, /tasks:\s*\[\]/);
  assert.match(patch, /accountability_events:\s*\[\]/);
  assert.match(patch, /class_notes:\s*\[\]/);
  assert.match(patch, /canonical_mixed_recording_parse/);
  assert.match(patch, /progress_only_created/);
});

test('shared patch avoids content-backed class-session overwrite during progress-only writes', () => {
  assert.match(patch, /contentBacked:\s*false/);
  assert.match(patch, /archiveSourceAfterParse:\s*false/);
  assert.match(patch, /UPDATE bna_content_jobs/);
  assert.match(patch, /parse_json = \$1::jsonb/);
});

test('shared patch includes retry idempotency checks for progress-only writes', () => {
  assert.match(patch, /contentJobHasProgressOnlyWrites/);
  assert.match(patch, /source_content_job_id = \$1/);
  assert.match(patch, /metadata::text ILIKE '%timer_mapping%'/);
  assert.match(patch, /skipped_existing/);
  assert.match(patch, /previousParse\?\.mixed_recording_parse\?\.progress_only\?\.applied_at/);
});
