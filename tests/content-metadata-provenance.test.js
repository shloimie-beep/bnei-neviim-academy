const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('content jobs API returns scoped workspace, provenance, transcript, parse, and output metadata', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/content-jobs', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /const \{ status, project \} = req\.query;/);
  assert.match(server, /await ensureDefaultProjects\(\);/);
  assert.match(server, /const scopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(server, /const requestedProjectKey = project && project !== 'all' \? normalizeProjectKey\(project\) : '';/);
  assert.match(server, /COALESCE\(p\.project_key, w\.workspace_key, ''\) = \$\$\{params\.length\}/);
  assert.match(server, /p\.project_key,[\s\S]*?p\.name AS project_name,[\s\S]*?p\.short_name AS project_short_name/);
  assert.match(server, /w\.workspace_key,[\s\S]*?w\.workspace_type,[\s\S]*?w\.name AS workspace_name/);
  assert.match(server, /END AS transcript_status/);
  assert.match(server, /END AS parse_status/);
  assert.match(server, /COUNT\(o\.id\)::int AS output_count/);
  assert.match(server, /needs_approval_output_count/);
  assert.match(server, /approved_output_count/);
  assert.match(server, /published_output_count/);
  assert.match(server, /MAX\(o\.updated_at\) AS latest_output_at/);
  assert.match(server, /json_agg\(to_jsonb\(o\) ORDER BY o\.created_at ASC\)/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = j\.workspace_id/);
  assert.match(server, /LEFT JOIN LATERAL \([\s\S]*?FROM bna_projects p[\s\S]*?WHERE p\.workspace_id = j\.workspace_id/);
  assert.match(server, /GROUP BY j\.id, p\.project_key, p\.name, p\.short_name, w\.workspace_key, w\.workspace_type, w\.name/);
});

test('Operations content library requests and renders visible content provenance metadata', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /if \(filters\.project\) params\.set\('project', filters\.project\);/);
  assert.match(operations, /api\.getContentJobs\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /function contentWorkspaceLabel\(job = \{\}\) \{/);
  assert.match(operations, /function contentSourceLabel\(job = \{\}\) \{/);
  assert.match(operations, /function contentTranscriptStatusLabel\(job = \{\}\) \{/);
  assert.match(operations, /function contentOutputSummary\(job = \{\}\) \{/);
  assert.match(operations, /function contentApprovalStateLabel\(job = \{\}\) \{/);
  assert.match(operations, /function contentParseStatusLabel\(job = \{\}, parsed = \{\}\) \{/);
  assert.match(operations, /function contentProvenanceItems\(job = \{\}, parsed = \{\}\) \{/);
  assert.match(operations, /function renderContentProvenance\(job = \{\}, parsed = \{\}\) \{/);
  assert.match(operations, /Workspace: \$\{escapeHtml\(workspaceLabel\)\}/);
  assert.match(operations, /Source: \$\{escapeHtml\(sourceLabel\)\}/);
  assert.match(operations, /Transcript: \$\{escapeHtml\(transcriptLabel\)\}/);
  assert.match(operations, /Outputs: \$\{escapeHtml\(outputSummary\)\}/);
  assert.match(operations, /Approval: \$\{escapeHtml\(approvalLabel\)\}/);
  assert.match(operations, /aria-label="Content provenance"/);
  assert.match(operations, /renderContentProvenance\(job, parsed\)/);
  assert.match(operations, /const rawMetadataKey = job\?\.project_key \|\| job\?\.workspace_key \|\| '';/);
});
