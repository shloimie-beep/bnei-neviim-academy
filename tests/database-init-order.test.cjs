const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('compatibility columns are added before indexes in every database initialization path', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const indexCalls = [...server.matchAll(/await pool\.query\(createBnaIndexesSQL\);/g)].map((match) => match.index);
  const compatibilityCalls = [...server.matchAll(/await pool\.query\(createWorkspaceLinkedColumnsSQL\);/g)].map((match) => match.index);
  assert.equal(indexCalls.length, 2);
  assert.equal(compatibilityCalls.length, 2);
  for (const [index, indexCall] of indexCalls.entries()) {
    assert.ok(compatibilityCalls[index] < indexCall, `database initialization path ${index + 1} must add compatibility columns before indexes`);
  }

  const railwayStart = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'railway-start.mjs'), 'utf8');
  const preflight = fs.readFileSync(
    path.join(__dirname, '..', 'scripts', 'ensure-content-job-compatibility.mjs'),
    'utf8'
  );
  assert.match(railwayStart, /spawnSync\('node', \['scripts\/ensure-content-job-compatibility\.mjs'\]/);
  assert.ok(
    railwayStart.indexOf("spawnSync('node', ['scripts/ensure-content-job-compatibility.mjs']") <
      railwayStart.indexOf('const child = spawn(selected.command'),
    'Railway web compatibility preflight must finish before the server starts'
  );
  assert.match(
    preflight,
    /ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS processing_state TEXT DEFAULT 'queued'/
  );
  assert.match(preflight, /ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMP/);
  assert.match(preflight, /ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP/);
});
