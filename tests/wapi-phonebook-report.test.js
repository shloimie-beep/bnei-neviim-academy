const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
  applyWapiPhonebookCorrectionToGroup,
  buildWapiPhonebookCrmWritePreview,
  buildWapiPhonebookReport,
  classifyWapiPhonebookGroup,
  normalizeWapiPhonebookCorrectionType,
  wapiPhonebookCorrectionPlanForType,
} = require('../src/lib/bna/wapi-phonebook-report');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');
const reportScript = fs.readFileSync('scripts/wapi-phonebook-report.mjs', 'utf8');
const wapiPhonebookLib = fs.readFileSync('src/lib/bna/wapi-phonebook-report.js', 'utf8');

function fakeDb({ corrections = [] } = {}) {
  const tables = new Set([
    'bna_wapi_contacts',
    'bna_wapi_chats',
    'bna_contact_communications',
    'bna_parent_leads',
    'signups',
    'bna_students',
    'bna_service_provider_profiles',
    'bna_service_providers',
    'bna_contacts',
    'bna_wapi_phonebook_corrections',
  ]);
  return {
    async query(sql, params = []) {
      if (/information_schema\.tables/.test(sql)) {
        return { rows: [{ exists: tables.has(params[0]) }] };
      }
      if (/FROM bna_wapi_contacts/.test(sql)) {
        return {
          rows: [
            {
              id: 1,
              provider_contact_id: '972501111111@s.whatsapp.net',
              display_name: 'Nati Fries',
              push_name: '',
              phone: '+972501111111',
              last_synced_at: '2026-06-14T10:00:00Z',
            },
            {
              id: 2,
              provider_contact_id: '972502222222@s.whatsapp.net',
              display_name: '',
              push_name: '',
              phone: '+972502222222',
              last_synced_at: '2026-06-14T11:00:00Z',
            },
          ],
        };
      }
      if (/FROM bna_wapi_chats/.test(sql)) {
        return {
          rows: [
            {
              id: 1,
              provider_chat_id: '120363000000000000@g.us',
              chat_type: 'group',
              display_name: 'BNA updates group',
              phone: '',
              is_group: true,
              last_message_at: '2026-06-14T12:00:00Z',
              last_message_preview: 'group reminder',
            },
          ],
        };
      }
      if (/FROM bna_contact_communications/.test(sql)) {
        return {
          rows: [
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
          ],
        };
      }
      if (/FROM bna_parent_leads/.test(sql)) {
        return {
          rows: [
            {
              id: 50,
              parent_name: 'Interested Parent',
              student_name: 'Student',
              parent_phone: '+972502222222',
              other_phones: [],
              lead_type: 'school_interest',
              status: 'interested',
              source: 'telegram',
            },
          ],
        };
      }
      if (/FROM bna_wapi_phonebook_corrections/.test(sql)) {
        return { rows: corrections };
      }
      return { rows: [] };
    },
  };
}

test('WAPI phonebook grouping keeps Nati Freeze or Fries friend/non-lead by default', () => {
  const result = classifyWapiPhonebookGroup({
    display_name: 'Nati Freeze',
    aliases: ['Nati Fries'],
    last_preview: 'See you later',
    source_counts: {},
    linked_records: [],
    review_flags: [],
    recommended_actions: [],
  });
  assert.equal(result.recommended_type, 'friend_non_lead');
  assert.match(result.reason, /defaults to friend\/general/);
  assert.ok(result.review_flags.includes('nati_friend_default'));

  const schoolResult = classifyWapiPhonebookGroup({
    display_name: 'Nati Fries',
    aliases: [],
    last_preview: 'Asked about BNA tuition and school registration',
    source_counts: {},
    linked_records: [],
    review_flags: [],
    recommended_actions: [],
  });
  assert.notEqual(schoolResult.recommended_type, 'friend_non_lead');
});

test('WAPI phonebook report is dry-run and groups local rows by phone/chat', async () => {
  const report = await buildWapiPhonebookReport({ db: fakeDb(), limit: 20 });
  assert.equal(report.success, true);
  assert.equal(report.dry_run, true);
  assert.equal(report.no_send, true);
  assert.equal(report.external_write_performed, false);
  assert.equal(report.source_table_availability.bna_wapi_contacts, true);
  assert.ok(report.summary.phonebook_groups >= 3);
  assert.ok(report.guardrails.some((line) => /No WhatsApp messages are sent/.test(line)));

  const nati = report.phonebook.find((group) => /Nati/i.test(group.display_name));
  assert.equal(nati.recommended_type, 'friend_non_lead');
  assert.ok(nati.review_flags.includes('nati_friend_default'));

  const lead = report.phonebook.find((group) => group.linked_records.some((record) => record.type === 'lead'));
  assert.equal(lead.recommended_type, 'school_interest');

  const groupChat = report.phonebook.find((group) => group.recommended_type === 'group_member');
  assert.ok(groupChat);
});

test('WAPI phonebook correction overlay keeps corrections local and visible', async () => {
  assert.equal(normalizeWapiPhonebookCorrectionType('friend'), 'friend_non_lead');
  assert.equal(normalizeWapiPhonebookCorrectionType('school interest'), 'school_interest');
  assert.equal(normalizeWapiPhonebookCorrectionType('bad-value'), '');

  const corrected = applyWapiPhonebookCorrectionToGroup({
    key: 'phone:972501111111',
    display_name: 'Nati Fries',
    recommended_type: 'friend_non_lead',
    review_flags: ['nati_friend_default'],
    recommended_actions: [],
  }, {
    id: 5,
    correction_type: 'friend_non_lead',
    notes: 'Reviewed locally',
    applied_by: 'Codex test',
    applied_at: '2026-06-14T12:30:00Z',
  });
  assert.equal(corrected.manual_correction_applied, true);
  assert.equal(corrected.applied_type, 'friend_non_lead');
  assert.equal(corrected.applied_correction.notes, 'Reviewed locally');

  const report = await buildWapiPhonebookReport({
    db: fakeDb({
      corrections: [{
        id: 5,
        phonebook_key: 'phone:972501111111',
        correction_type: 'friend_non_lead',
        notes: 'Reviewed locally',
        applied_by: 'Codex test',
        applied_at: '2026-06-14T12:30:00Z',
      }],
    }),
    limit: 20,
  });
  const nati = report.phonebook.find((group) => /Nati/i.test(group.display_name));
  assert.equal(nati.manual_correction_applied, true);
  assert.equal(nati.applied_type, 'friend_non_lead');
  assert.equal(report.summary.manual_corrections_applied, 1);
  assert.equal(report.manual_correction_candidates.some((group) => group.key === nati.key), false);
});

test('WAPI phonebook CRM apply preview only plans first-party local writes', () => {
  const plan = wapiPhonebookCorrectionPlanForType('school interest');
  assert.equal(plan.correction_type, 'school_interest');
  assert.ok(plan.tags.includes('school-interest'));
  assert.equal(plan.contact_status, 'lead');
  assert.equal(plan.lead_type, 'school_interest');

  const preview = buildWapiPhonebookCrmWritePreview({
    key: 'phone:972502222222',
    phone_digits: '+972502222222',
    display_name: 'Interested Parent',
    recommended_type: 'school_interest',
    linked_records: [
      { type: 'lead', id: 50, name: 'Interested Parent' },
      { type: 'student', id: 7, name: 'Private Student' },
      { type: 'service_provider', id: 9, name: 'Provider' },
    ],
  }, { correction_type: 'school_interest' });
  assert.equal(preview.no_send, true);
  assert.equal(preview.external_write_performed, false);
  assert.ok(preview.writes.some((write) => write.target === 'bna_contacts' && write.action === 'upsert_contact_by_phone'));
  assert.ok(preview.writes.some((write) => write.target === 'bna_parent_leads' && String(write.lead_id) === '50'));
  assert.ok(preview.skipped_writes.some((write) => write.target === 'bna_students'));
  assert.ok(preview.skipped_writes.some((write) => write.target === 'bna_service_providers'));

  const unmatched = buildWapiPhonebookCrmWritePreview({
    key: 'phone:972503333333',
    phone_digits: '+972503333333',
    display_name: 'WhatsApp School Prospect',
    recommended_type: 'school_interest',
    linked_records: [],
    last_preview: 'Asked about registration for a son',
  }, { correction_type: 'school_interest' });
  assert.ok(unmatched.writes.some((write) =>
    write.target === 'bna_parent_leads'
    && write.action === 'create_lead_candidate'
    && write.status === 'lead_candidate'
    && write.source === 'whatsapp'
  ));

  const matchedParent = buildWapiPhonebookCrmWritePreview({
    key: 'phone:972504444444',
    phone_digits: '+972504444444',
    display_name: 'Existing BNA Parent',
    recommended_type: 'school_interest',
    linked_records: [{ type: 'signup', id: 12, name: 'Existing BNA Parent' }],
  }, { correction_type: 'school_interest' });
  assert.equal(matchedParent.writes.some((write) => write.target === 'bna_parent_leads' && write.action === 'create_lead_candidate'), false);
  assert.ok(matchedParent.skipped_writes.some((write) =>
    write.target === 'bna_parent_leads'
    && /duplicate lead candidate/.test(write.reason)
  ));
});

test('WAPI phonebook report is exposed as guarded Operations tooling', () => {
  assert.match(server, /buildWapiPhonebookReport/);
  assert.match(server, /buildWapiPhonebookCrmWritePreview/);
  assert.match(server, /app\.get\('\/api\/bna\/wapi\/phonebook-report'/);
  assert.match(server, /app\.post\('\/api\/bna\/wapi\/phonebook-corrections'/);
  assert.match(server, /APPLY_WAPI_CORRECTION/);
  assert.match(server, /scope: projectKey \? 'workspace' : 'account'/);
  assert.match(server, /workspace_key: workspaceKey \|\| 'all'/);
  assert.match(server, /raw_payload_hidden: true/);
  assert.match(server, /applyWapiPhonebookCrmWrites/);
  assert.match(server, /lead_candidate_created_from_wapi_phonebook/);
  assert.match(wapiPhonebookLib, /create_lead_candidate/);
  assert.match(wapiPhonebookLib, /Student records are not changed by WAPI phonebook corrections/);
  assert.doesNotMatch(server, /phonebook-report[\s\S]{0,500}SEND_WHATSAPP/);
  assert.doesNotMatch(server, /phonebook-corrections[\s\S]{0,900}SEND_WHATSAPP/);

  assert.match(operations, /getWapiPhonebookReport\(100, \{ workspace: currentWorkspaceKey\(\) \}\)/);
  assert.match(operations, /applyWapiPhonebookCorrection/);
  assert.match(operations, /dry_run: true/);
  assert.match(operations, /apply_contact_tags: true/);
  assert.match(operations, /Local contact\/tag writes/);
  assert.match(operations, /Phonebook grouping/);
  assert.match(operations, /Phonebook Grouping Report/);
  assert.match(operations, /Phonebook Workspace/);
  assert.match(operations, /wapi-conversation-workspace/);
  assert.match(operations, /selectWapiPhonebookGroup/);
  assert.match(operations, /wapiGroupTimelineItems/);
  assert.match(operations, /addWapiPhonebookNote/);
  assert.match(operations, /wapi_phonebook_workspace/);
  assert.match(operations, /needsWapiPhonebookData/);
  assert.match(operations, /Corrections Applied/);
  assert.match(operations, /never sends WhatsApp messages/);
  assert.match(operations, /No WhatsApp message was sent/);
  assert.match(operations, /No WhatsApp message, broadcast, or external CRM write/);

  assert.match(packageJson, /"wapi:phonebook-report": "node scripts\/wapi-phonebook-report\.mjs"/);
  assert.match(reportScript, /Dry-run only/);
  assert.doesNotMatch(reportScript, /SEND_WHATSAPP|fetch\(/);
});

test('Operations contact cards render matched local WAPI communication history without sending', () => {
  assert.match(operations, /function phoneTokenVariantsClient/);
  assert.match(operations, /function communicationEmailTokens/);
  assert.match(operations, /function communicationMatchesSignup/);
  assert.match(operations, /function communicationMatchesLead/);
  assert.match(operations, /function renderCommunicationHistoryGuardrail/);
  assert.match(operations, /Read-only local history matched by BNA record ID, normalized phone, email, or WAPI source context/);
  assert.match(operations, /data-contact-communication-history="signup"/);
  assert.match(operations, /data-contact-communication-history="lead"/);
  assert.match(operations, /No Whapi sync, WhatsApp send, broadcast, CRM tag update, or external CRM write/);
  assert.match(operations, /const communications = signupCommunications\(signup\)/);
  assert.match(operations, /const communications = leadCommunications\(lead\)/);
  assert.match(operations, /return phoneTokensFromValues\(\[/);
  assert.doesNotMatch(operations, /function renderSignupCommunicationList[\s\S]{0,900}SEND_WHATSAPP/);
  assert.doesNotMatch(operations, /function renderLeadCommunicationList[\s\S]{0,900}SEND_WHATSAPP/);
  assert.doesNotMatch(operations, /function renderCommunicationHistoryGuardrail[\s\S]{0,500}api\.createContactCommunication/);
});
