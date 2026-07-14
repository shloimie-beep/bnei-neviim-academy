const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('root AGENTS guidance stays within instruction budget and keeps critical gate triggers', () => {
  const agents = fs.readFileSync('AGENTS.md', 'utf8');
  const byteCount = Buffer.byteLength(agents, 'utf8');

  assert.ok(byteCount <= 24 * 1024, `AGENTS.md is ${byteCount} UTF-8 bytes`);
  assert.match(agents, /Intent Preservation Gate/);
  assert.match(agents, /VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS\/EVIDENCE/);
  assert.match(agents, /docs\/INTENT-PRESERVATION-GATE\.md/);
  assert.match(agents, /npm run intent:validate/);
  assert.match(agents, /docs\/BNA-AGENT-OPERATING-GUIDE-FULL\.md/);
  assert.match(agents, /docs\/AGENTS-MIGRATION-MAP\.md/);

  const fullGuide = fs.readFileSync('docs/BNA-AGENT-OPERATING-GUIDE-FULL.md', 'utf8');
  assert.match(fullGuide, /## Ramble Protocol - Required For All Operator Dumps/);
  assert.match(fullGuide, /## ChatGPT Ramble Drop-off Protocol/);
  assert.match(fullGuide, /## Definition of Done/);
});
