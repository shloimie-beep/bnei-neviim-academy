const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  WHATSAPP_PARENT_UPDATE_PROMPT_VERSION,
  approvedExampleFlow,
  validateWhatsAppParentUpdateDraft,
} = require('../../src/platform/prompts/whatsapp-parent-update');

test('WhatsApp prompt v3 contract is installed with approval-gated examples', () => {
  const prompt = fs.readFileSync('content-memory/platform-prompts/whatsapp.md', 'utf8');
  const examples = fs.readFileSync('content-memory/whatsapp/examples.md', 'utf8');

  assert.match(prompt, new RegExp(WHATSAPP_PARENT_UPDATE_PROMPT_VERSION));
  assert.match(prompt, /Good Shabbos\./);
  assert.match(prompt, /Never guess the parsha/);
  assert.match(prompt, /Do not approve, publish, send, schedule/);
  assert.match(prompt, /What a beautiful week/);
  assert.match(examples, /operator-approved examples only/);

  const flow = approvedExampleFlow();
  assert.equal(flow.approval_required, true);
  assert.equal(flow.examples_path, 'content-memory/whatsapp/examples.md');
});

test('WhatsApp draft validator enforces final line, banned phrases, parsha facts, and privacy gate', () => {
  const good = [
    '*Parsha Korach*',
    '',
    '- The video focused on taking responsibility for group choices.',
    '- The boys connected it to how a class creates its own learning environment.',
    '',
    '*This week:*',
    '- Mishnayos review and chavrusa practice.',
    '',
    'Good Shabbos.',
  ].join('\n');
  assert.equal(validateWhatsAppParentUpdateDraft(good, { parsha: 'Korach' }).ok, true);

  const noParshaFact = good.replace('Parsha Korach', 'Parsha Balak');
  assert.equal(validateWhatsAppParentUpdateDraft(noParshaFact).ok, false);

  const fluffy = 'What a beautiful week. The practical message is simple.\n\nGood Shabbos.';
  assert.equal(validateWhatsAppParentUpdateDraft(fluffy).ok, false);

  const privateDraft = 'Avi had an accountability behavior note.\n\nGood Shabbos.';
  assert.equal(validateWhatsAppParentUpdateDraft(privateDraft).ok, false);
});
