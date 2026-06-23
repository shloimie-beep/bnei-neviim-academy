const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  hasTelegramNoteToCrmIntent,
  parseTelegramNoteToCrm,
  selectBestTelegramNoteCandidate,
  suggestTelegramNoteContactRole,
  telegramNoteRequiresFollowUp,
} = require('../src/lib/bna/telegram-note-to-crm');

const server = fs.readFileSync('server.js', 'utf8');
const telegramBridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const communicationsPlan = fs.readFileSync('ops/communications/wapi-crm-audit-and-plan.md', 'utf8');
const helperAudit = fs.readFileSync('ops/bna-helper/bna-helper-tool-audit.md', 'utf8');

test('Telegram note-to-CRM parser accepts commands and natural WhatsApp notes', () => {
  const command = parseTelegramNoteToCrm('/crm_note contact: Nati Fries | note: not a lead, just a friend/carpool thread');
  assert.equal(command.matched, true);
  assert.equal(command.contact_clue, 'Nati Fries');
  assert.match(command.note_text, /not a lead/);
  assert.equal(command.channel, 'whatsapp');

  const natural = parseTelegramNoteToCrm('that WhatsApp with Mrs Cohen was about tuition follow up next week');
  assert.equal(natural.matched, true);
  assert.equal(natural.contact_clue, 'Mrs Cohen');
  assert.match(natural.note_text, /tuition follow up/);

  assert.equal(hasTelegramNoteToCrmIntent('/send_whatsapp signup:12 | hello'), false);
  assert.equal(hasTelegramNoteToCrmIntent('what is the WhatsApp status?'), false);
});

test('Telegram note-to-CRM matcher selects the latest matching WhatsApp row safely', () => {
  const candidates = [
    {
      id: 10,
      contact_type: 'general',
      channel: 'whatsapp',
      direction: 'inbound',
      summary: 'WhatsApp from Nati Fries: see you later',
      body: 'see you later',
      source: 'wapi',
      source_context: { chat_id: '972501111111@s.whatsapp.net', from_number: '+972501111111' },
      metadata: { push_name: 'Nati Fries' },
      occurred_at: '2026-06-14T12:05:00Z',
    },
    {
      id: 11,
      contact_type: 'signup',
      channel: 'whatsapp',
      direction: 'inbound',
      summary: 'WhatsApp from Interested Parent: registration question',
      body: 'Asked about BNA tuition',
      source: 'wapi',
      signup_parent_name: 'Interested Parent',
      metadata: { push_name: 'Interested Parent' },
      occurred_at: '2026-06-14T12:10:00Z',
    },
  ];

  const selected = selectBestTelegramNoteCandidate(candidates, {
    contact_clue: 'Nati Fries',
  });
  assert.equal(selected.matched, true);
  assert.equal(selected.match.communication_id, 10);
  assert.equal(selected.match.confidence, 'high');
  assert.ok(selected.match.reasons.includes('exact_name_match'));

  assert.equal(suggestTelegramNoteContactRole('not a lead, just a friend'), 'friend_non_lead');
  assert.equal(suggestTelegramNoteContactRole('asked about BNA tuition'), 'school_interest');
  assert.equal(telegramNoteRequiresFollowUp('please call him tomorrow'), true);
});

test('Telegram note-to-CRM endpoint and bridge are wired as no-send CRM capture', () => {
  assert.match(server, /app\.post\('\/api\/bna\/contact-communications\/match-note'/);
  assert.match(server, /routePath === '\/api\/bna\/contact-communications\/match-note' && method === 'POST'/);
  assert.match(server, /parseTelegramNoteToCrm/);
  assert.match(server, /selectBestTelegramNoteCandidate/);
  assert.match(server, /no_send:\s*true/);
  assert.match(server, /external_write_performed:\s*false/);
  assert.match(server, /source:\s*'telegram_note_to_crm'/);
  assert.doesNotMatch(server, /match-note[\s\S]{0,800}SEND_WHATSAPP/);

  assert.match(telegramBridge, /captureTelegramNoteToCrm/);
  assert.match(telegramBridge, /hasTelegramNoteToCrmIntent/);
  assert.match(telegramBridge, /\/api\/bna\/contact-communications\/match-note/);
  assert.match(telegramBridge, /telegramCrmNotesCreated/);
  assert.match(telegramBridge, /telegramCrmNoteIntent/);
  assert.match(telegramBridge, /tasksCreated:\s*0[\s\S]{0,400}\.\.\.telegramNoteCapture/);

  assert.match(communicationsPlan, /Telegram Note-To-CRM Flow/);
  assert.match(helperAudit, /WAPI phonebook grouping report/);
});
