import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('CRM parent-lead notes use valid bna_contact_communications contact_type', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  assert.match(
    server,
    /SELECT\s+l\.project_id,\s+'lead',\s+l\.id,\s+'internal_note',\s+'internal_note',\s+\$2,\s+\$3,\s+\$4,\s+NOW\(\),\s+\$5,\s+'dashboard'/s
  );
  assert.doesNotMatch(
    server,
    /SELECT\s+l\.project_id,\s+COALESCE\(l\.lead_type,\s*'lead'\),\s+l\.id,\s+'internal_note'/s
  );
  assert.doesNotMatch(
    server,
    /SELECT\s+l\.project_id,\s+'lead',\s+l\.id,\s+'internal_note',\s+'internal',/s
  );
});
