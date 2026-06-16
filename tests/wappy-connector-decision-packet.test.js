const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packet = fs.readFileSync('ops/communications/wappy-connector-decision-packet.md', 'utf8');
const tasks = fs.readFileSync('TASKS.md', 'utf8');
const audit = fs.readFileSync('ops/communications/wapi-crm-audit-and-plan.md', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Wappy connector packet compares the ambiguous product candidates before selection', () => {
  assert.match(packet, /Do not select Wappy yet\./);
  assert.match(packet, /`wappy\.chat`/);
  assert.match(packet, /`wappy\.ai`/);
  assert.match(packet, /Whapi\/WAPI/);
  assert.match(packet, /Meta WhatsApp Business Platform/);
  assert.match(packet, /https:\/\/wappy\.chat\/en\/pricing/);
  assert.match(packet, /https:\/\/www\.wappy\.ai\/privacy-policy/);
  assert.match(packet, /https:\/\/whapi\.cloud\//);
  assert.match(packet, /https:\/\/whatsappbusiness\.com\/developers\/developer-hub\//);
});

test('Wappy connector packet blocks runtime keys and hidden WhatsApp sends', () => {
  assert.match(packet, /Do not add new `WAPPY_\*` environment variables/);
  assert.match(packet, /no automatic WhatsApp sends/);
  assert.match(packet, /no broadcasts/);
  assert.match(packet, /no external CRM writes/);
  assert.match(packet, /no vendor switch based on name similarity alone/);
  assert.doesNotMatch(envExample, /^WAPPY_/m);
  assert.doesNotMatch(server, /process\.env\.WAPPY|WAPPY_API|wappy\.chat\/api|wappy\.ai\/api/i);
});

test('Wappy decision is reflected in the active task and WAPI audit trail', () => {
  assert.match(tasks, /\[x\] Confirm whether the intended Wappy product is `wappy\.chat` or `wappy\.ai`/);
  assert.match(tasks, /ops\/communications\/wappy-connector-decision-packet\.md/);
  assert.match(audit, /Wappy Connector Decision/);
  assert.match(audit, /wappy-connector-decision-packet\.md/);
});
