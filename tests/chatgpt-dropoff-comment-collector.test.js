const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

async function loadCollector() {
  return import(pathToFileURL(path.join(process.cwd(), 'scripts', 'chatgpt-dropoff-comment-collector.mjs')).href);
}

function sampleComment(packetId = 'helper-bot-workspace-agent-01-audit-map') {
  return {
    repo: 'shloimie-beep/bnei-neviim-academy',
    issue_number: 123,
    comment_id: '999',
    author: 'chatgpt-codex-connector[bot]',
    url: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues/123#issuecomment-999',
    body: `<!-- BNA_CHATGPT_DROPOFF_PACKET v2 -->

## BNA ChatGPT Dropoff Packet

Packet ID: ${packetId}
Status: ready_for_codex_audit
Target folder: ops/chatgpt-ramble-dropoff/incoming/${packetId}/

### File: packet.json
\`\`\`json
{
  "packet_id": "${packetId}",
  "schema_version": "bna.chatgpt_dropoff.v1",
  "source": "chatgpt",
  "status": "ready_for_codex_audit",
  "scope_summary": "Current-state helper bot audit",
  "secrets_included": false,
  "external_writes_performed": false
}
\`\`\`

### File: RAW.md
\`\`\`markdown
# Raw

Audit the helper bot.
\`\`\`

### File: CODEX_PROMPT.md
\`\`\`markdown
# Codex Prompt

Inspect and apply only valid helper-bot audit changes.
\`\`\`

### File: MANIFEST.json
\`\`\`json
{
  "packet_id": "${packetId}",
  "schema_version": "bna.chatgpt_dropoff_manifest.v1",
  "proposed_repo_changes": []
}
\`\`\`

### File: status.json
\`\`\`json
{
  "packet_id": "${packetId}",
  "status": "ready_for_codex_audit",
  "implementation_status": "not_started",
  "secrets_included": false,
  "external_writes_performed": false
}
\`\`\`
`,
  };
}

test('ChatGPT GitHub comment collector parses and materializes full packet comments', async () => {
  const collector = await loadCollector();
  const comment = sampleComment();
  const parsed = collector.parseDropoffComment(comment);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-comment-dropoff-'));
  const packetDir = collector.materializeDropoffComment(parsed, { targetIncomingDir: root });

  assert.equal(parsed.is_dropoff, true);
  assert.equal(parsed.packet_id, 'helper-bot-workspace-agent-01-audit-map');
  assert.deepEqual(parsed.findings, []);
  assert.equal(fs.existsSync(path.join(packetDir, 'packet.json')), true);
  assert.equal(fs.existsSync(path.join(packetDir, 'RAW.md')), true);
  assert.equal(fs.existsSync(path.join(packetDir, 'COMMENT_SOURCE.json')), true);
});

test('ChatGPT GitHub comment collector blocks marker comments without full file blocks', async () => {
  const collector = await loadCollector();
  const parsed = collector.parseDropoffComment({
    ...sampleComment(),
    body: `<!-- BNA_CHATGPT_DROPOFF_PACKET v2 -->
Packet ID: helper-bot-workspace-agent-02-query-filter-results
Status: ready_for_codex_audit

Local packet zip: Download the prepared dropoff packet
`,
  });

  assert.equal(parsed.is_dropoff, true);
  assert.ok(parsed.findings.some((finding) => finding.code === 'missing_file_block'));
});

test('ChatGPT GitHub comment collector dry-runs trusted comments and blocks untrusted authors', async () => {
  const collector = await loadCollector();
  const trusted = await collector.collectOnce({
    comments: [sampleComment('helper-bot-workspace-agent-02-query-filter-results')],
    config: {
      repo: 'shloimie-beep/bnei-neviim-academy',
      trustedAuthors: new Set(['chatgpt-codex-connector[bot]']),
      collectLimit: 1,
    },
    args: { apply: false, limit: 1, force: false, allowUntrusted: false },
    writeReports: false,
  });
  assert.equal(trusted.dropoff_comment_count, 1);
  assert.equal(trusted.results[0].status, 'ready_dry_run');

  const untrusted = await collector.collectOnce({
    comments: [{ ...sampleComment('helper-bot-workspace-agent-03-action-confirmation-tools'), author: 'random-user' }],
    config: {
      repo: 'shloimie-beep/bnei-neviim-academy',
      trustedAuthors: new Set(['chatgpt-codex-connector[bot]']),
      collectLimit: 1,
    },
    args: { apply: false, limit: 1, force: false, allowUntrusted: false },
    writeReports: false,
  });
  assert.equal(untrusted.results[0].status, 'blocked_untrusted_author');
});
