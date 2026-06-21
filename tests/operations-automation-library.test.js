const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');

function automationLibrarySettingsBlock() {
  const start = operations.indexOf('function renderAutomationLibrarySettings()');
  assert.ok(start > -1, 'renderAutomationLibrarySettings should exist');
  const end = operations.indexOf('function previewAutomationLibraryItem', start);
  assert.ok(end > start, 'renderAutomationLibrarySettings block should end before preview handler');
  return operations.slice(start, end);
}

test('Operations Settings Automations renders a read-only automation and prompt library', () => {
  assert.match(operations, /function renderAutomationLibrarySettings/);
  assert.match(operations, /Automation Library/);
  assert.match(operations, /Service provider onboarding review/);
  assert.match(operations, /Parent accountability lead follow-up/);
  assert.match(operations, /Ticket processed acknowledgement/);
  assert.match(operations, /Parent weekly update approval/);
  assert.match(operations, /One Time question review alert/);
  assert.match(operations, /One Time 8-week nurture plan/);
  assert.match(operations, /Google live adapter test gate/);
  assert.match(operations, /Rabbi content added review/);
  assert.match(operations, /Prompt Browser/);
  assert.match(operations, /bna_content_prompts/);
  assert.match(operations, /bna_assignment_prompts/);
  assert.match(operations, /BNA Helper source boundary/);
  assert.match(operations, /No-send \/ no-external-write guardrails/);
  assert.match(operations, /Preview Dry Run/);
  assert.match(operations, /Enable requires approval/);
  assert.match(operations, /No external send, publish, billing\/access change, Google write, Drive\/video-host write, or external CRM write was performed/);
});

test('Operations Automations count is based on the library, not support-ticket placeholders', () => {
  assert.match(operations, /automations: automationLibraryItems\(\)\.length/);
  assert.doesNotMatch(operations, /automations: supportTickets\.filter\(ticket => \/automation\|bot\|api\|telegram\/i/);
});

test('Automation library does not expose a live run or enable handler', () => {
  const block = automationLibrarySettingsBlock();
  assert.doesNotMatch(operations, /runAutomationLibraryItem/);
  assert.doesNotMatch(operations, /enableAutomationLibraryItem/);
  assert.doesNotMatch(block, /SEND_WHATSAPP/);
});
