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
});
