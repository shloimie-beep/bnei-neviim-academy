const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const crm = require('../src/lib/bna/life-skills-sheet-crm');

const headers = ['Lead ID', 'Date received', 'Parent/adult name', 'Child name', 'Child age', 'Phone', 'Email', 'Language', 'City', 'School status', 'Broad concern', 'Lead source', 'Campaign', 'Pipeline stage', 'Last contact', 'Next action', 'Next-action date', 'Travel to Beit Shemesh', 'Preferred alternative area', 'Weekly schedule feasible', 'Price acknowledgement', 'Consultation preference', 'Offer quoted', 'Outcome', 'General sales notes', 'Enrolled case ID'];
function ci(column) { let value = 0; for (const letter of column) value = value * 26 + letter.charCodeAt(0) - 64; return value - 1; }
function range(raw) { const match = String(raw).match(/!([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i); if (!match) throw new Error(`range ${raw}`); return { a: match[1].toUpperCase(), r: Number(match[2]), b: (match[3] || match[1]).toUpperCase(), z: Number(match[4] || match[2]) }; }
class Sheets {
  constructor(headerRow = headers) { this.grid = [headerRow.slice()]; this.appendCalls = 0; this.failAfterAppend = false; this.failOnce = false; this.spreadsheets = { values: { get: this.get.bind(this), batchGet: this.batchGet.bind(this), batchUpdate: this.batchUpdate.bind(this), append: this.append.bind(this) } }; }
  ensure(row) { while (this.grid.length < row) this.grid.push(Array(60).fill('')); return this.grid[row - 1]; }
  get({ range: raw }) { const p = range(raw); const values = []; for (let row = p.r; row <= p.z; row += 1) values.push((this.grid[row - 1] || Array(30).fill('')).slice(ci(p.a), ci(p.b) + 1)); while (values.length && values.at(-1).every((v) => !v)) values.pop(); return Promise.resolve({ data: { values } }); }
  batchGet({ ranges }) { return Promise.all(ranges.map((raw) => this.get({ range: raw }))).then((items) => ({ data: { valueRanges: items.map((item) => item.data) } })); }
  batchUpdate({ requestBody }) { for (const write of requestBody.data || []) { const p = range(write.range); const row = this.ensure(p.r); for (const [index, value] of (write.values?.[0] || []).entries()) row[ci(p.a) + index] = value; } return Promise.resolve({ data: {} }); }
  append({ range: targetRange, requestBody }) { this.appendCalls += 1; if (this.failOnce) { this.failOnce = false; return Promise.reject(new Error('synthetic Sheets outage')); } const row = this.grid.length + 1; this.grid.push((requestBody.values?.[0] || []).slice()); if (this.failAfterAppend) { this.failAfterAppend = false; return Promise.reject(new Error('synthetic response lost after append')); } const end = String(targetRange).match(/:([A-Z]+)'?$/i)?.[1] || 'AD'; return Promise.resolve({ data: { updates: { updatedRange: `'Leads'!A${row}:${end}${row}` } } }); }
}
function config() { return { spreadsheetId: 'synthetic-sheet', sheetName: 'Leads', responseOwner: 'Shlomo', requiredBusinessDigits: '972534932631', defaultCountry: '972', timeZone: 'Asia/Jerusalem' }; }
function inbound(extra = {}) { return { messageId: 'provider-message-1', fromNumber: '+972 52 555 0101', toNumber: '+972 53 493 2631', pushName: 'Synthetic Parent', messageText: 'Neutral inquiry', occurredAt: '2026-09-14T08:05:00.000Z', fromMe: false, hasMedia: false, messageStatus: '', ...extra }; }
class Lock { constructor() { this.tail = new Map(); } async run(key, fn) { const prior = this.tail.get(key) || Promise.resolve(); let release; const current = new Promise((resolve) => { release = resolve; }); this.tail.set(key, prior.then(() => current)); await prior; try { return await fn(); } finally { release(); } } }

test('normalizes WAPI numbers and fails closed until the scoped Google CRM gate is enabled', () => {
  assert.equal(crm.normalizeLifeSkillsPhone('053-493-2631'), '+972534932631');
  assert.equal(crm.normalizeLifeSkillsPhone('972534932631@s.whatsapp.net'), '+972534932631');
  assert.equal(crm.normalizeLifeSkillsPhone('bad'), '');
  assert.equal(crm.buildLifeSkillsSheetCrmReadiness({ env: {}, googleReady: false }).ready, false);
  assert.equal(crm.buildLifeSkillsSheetCrmReadiness({ env: { LIFE_SKILLS_SHEET_CRM_ENABLED: 'true', LIFE_SKILLS_SHEET_CRM_CONFIRM: crm.LIFE_SKILLS_SHEET_CRM_CONFIRM }, googleReady: true }).ready, true);
});

test('auth-bound inbound validation rejects outbound, delivery-status, and wrong-business-number events', async () => {
  const sheets = new Sheets();
  const channelBoundConfig = { ...config(), requiredChannelId: 'life-skills-channel' };
  assert.equal(crm.isLifeSkillsInboundInquiry({ normalized: inbound({ fromMe: true }), config: config() }).eligible, false);
  assert.equal((await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound({ toNumber: '+972500000000' }), config: config() })).action, 'skipped_ineligible');
  assert.equal(crm.isLifeSkillsInboundInquiry({ normalized: inbound({ toNumber: '', channelId: 'life-skills-channel' }), config: channelBoundConfig }).eligible, true);
  assert.equal(crm.isLifeSkillsInboundInquiry({ normalized: inbound({ toNumber: '', channelId: 'another-channel' }), config: channelBoundConfig }).eligible, false);
  assert.equal((await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound({ messageId: 'bna-scope-message' }), scope: { project_key: 'bna', workspace_key: 'bna' }, config: config() })).action, 'created');
  assert.equal((await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), scope: { project_key: 'one_time_mishnah_class' }, config: config() })).action, 'skipped_ineligible');
  assert.equal(sheets.appendCalls, 1);
});

test('first inbound message creates the minimal lead, Today next action, source attribution, and no message body', async () => {
  const sheets = new Sheets();
  const result = await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), payload: { utm_source: 'meta', utm_campaign: 'synthetic-campaign' }, config: config() });
  const row = sheets.grid[1];
  assert.equal(result.action, 'created'); assert.equal(result.row, 2); assert.equal(row[5], '+972525550101'); assert.equal(row[11], 'meta'); assert.equal(row[12], 'synthetic-campaign');
  assert.equal(row[15], 'Respond to inbound WhatsApp inquiry'); assert.equal(row[16], '2026-09-14'); assert.equal(row[26], 'provider-message-1'); assert.equal(row[29], 'Shlomo');
  assert.equal(row.some((value) => String(value).includes('Neutral inquiry')), false);
  assert.deepEqual(sheets.grid[0].slice(26, 30), Object.values(crm.MACHINE_HEADERS));
});

test('provider replay does not add a lead or duplicate a reminder action', async () => {
  const sheets = new Sheets(); await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), config: config() });
  const result = await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), config: config() });
  assert.equal(result.action, 'updated_existing'); assert.equal(sheets.grid.length, 2); assert.equal(sheets.grid[1][26], 'provider-message-1'); assert.equal(sheets.grid[1][15], 'Respond to inbound WhatsApp inquiry');
});

test('second message retains manually maintained note/status/source/owner/next action and updates only inbound facts', async () => {
  const sheets = new Sheets(); await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), config: config() }); const row = sheets.grid[1];
  row[11] = 'Manual source history'; row[13] = 'Contacted'; row[15] = 'Manual scheduled follow-up'; row[16] = '2026-09-20'; row[24] = 'Manual note stays intact'; row[29] = 'Assigned owner';
  await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound({ messageId: 'provider-message-2', occurredAt: '2026-09-14T10:00:00.000Z' }), payload: { utm_source: 'must-not-overwrite' }, config: config() });
  assert.equal(row[11], 'Manual source history'); assert.equal(row[13], 'Contacted'); assert.equal(row[15], 'Manual scheduled follow-up'); assert.equal(row[16], '2026-09-20'); assert.equal(row[24], 'Manual note stays intact'); assert.equal(row[29], 'Assigned owner'); assert.equal(row[26], 'provider-message-1, provider-message-2');
});

test('existing advisory-style per-phone serialization prevents simultaneous first-message duplicates', async () => {
  const sheets = new Sheets(); const lock = new Lock();
  await Promise.all(['concurrent-1', 'concurrent-2'].map((messageId) => lock.run('+972525550101', () => crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound({ messageId }), config: config() }))));
  assert.equal(sheets.grid.length, 2); assert.equal(sheets.grid[1][26], 'concurrent-1, concurrent-2');
});

test('partial-write retry and temporary Sheets outage remain recoverable without a second lead', async () => {
  const partial = new Sheets(); partial.failAfterAppend = true;
  await assert.rejects(() => crm.upsertLifeSkillsSheetLead({ sheets: partial, normalized: inbound(), config: config() }), /response lost/);
  assert.equal((await crm.upsertLifeSkillsSheetLead({ sheets: partial, normalized: inbound(), config: config() })).action, 'updated_existing'); assert.equal(partial.grid.length, 2); assert.equal(partial.appendCalls, 1);
  const outage = new Sheets(); outage.failOnce = true;
  await assert.rejects(() => crm.upsertLifeSkillsSheetLead({ sheets: outage, normalized: inbound(), config: config() }), /outage/);
  assert.equal((await crm.upsertLifeSkillsSheetLead({ sheets: outage, normalized: inbound(), config: config() })).action, 'created');
});

test('receiver integration uses a phone advisory lock and durable recovery without sending an automatic reply', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const start = server.indexOf('async function syncLifeSkillsInboundToSheet');
  const end = server.indexOf('function authorizeLifeSkillsAppBridge', start);
  const integration = server.slice(start, end);
  assert.match(integration, /bna_life_skills_sheet_crm_sync/);
  assert.match(integration, /pg_advisory_xact_lock/);
  assert.match(integration, /life-skills-sheet-crm\/recover/);
  assert.match(server, /lifeSkillsSheetCrm: lifeSkillsSheetCrmResultView/);
  assert.doesNotMatch(integration, /sendWapiTextMessage/);
});

test('uses the current named-header map, leaves AA:AI onboarding fields alone, and preserves notes on a second inbound message', async () => {
  const onboardingHeaders = ['Form sent', 'Form submitted', 'Payment link sent', 'Payment method', 'Payment status', 'Payment allocation', 'Booking status', 'Message receipt', 'Update provenance'];
  const sheets = new Sheets([...headers, ...onboardingHeaders]);
  await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), config: config() });
  const row = sheets.grid[1];
  assert.equal(row.length, 39);
  const aj = ci('AJ');
  assert.deepEqual(sheets.grid[0].slice(26, 35), onboardingHeaders);
  assert.deepEqual(sheets.grid[0].slice(35, 39), Object.values(crm.MACHINE_HEADERS));
  assert.equal(row[aj], 'provider-message-1');
  assert.equal(row[aj + 3], 'Shlomo');
  row[24] = 'Synthetic operator note';
  row[26] = 'FORM_SENT'; row[27] = 'FORM_SUBMITTED'; row[28] = 'PAYMENT_LINK_SENT';
  await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound({ messageId: 'provider-message-2', occurredAt: '2026-09-14T10:00:00.000Z' }), config: config() });
  assert.equal(sheets.grid.length, 2);
  assert.equal(row[24], 'Synthetic operator note');
  assert.deepEqual(row.slice(26, 29), ['FORM_SENT', 'FORM_SUBMITTED', 'PAYMENT_LINK_SENT']);
  assert.equal(row[aj], 'provider-message-1, provider-message-2');
});

test('resolves reordered headers by name and rejects missing or ambiguous header contracts', async () => {
  const reordered = ['Phone', ...headers.filter((header) => header !== 'Phone'), 'Form sent', 'Form submitted', 'Payment link sent', 'Payment method', 'Payment status', 'Payment allocation', 'Booking status', 'Message receipt', 'Update provenance', ...Object.values(crm.MACHINE_HEADERS)];
  const sheets = new Sheets(reordered);
  await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), config: config() });
  const row = sheets.grid[1];
  assert.equal(row[reordered.indexOf('Phone')], '+972525550101');
  assert.equal(row[reordered.indexOf('Inbound provider message IDs')], 'provider-message-1');
  assert.throws(() => crm.resolveSheetHeaderMap([...reordered, 'Phone']), /ambiguous header/);
  assert.throws(() => crm.resolveSheetHeaderMap(reordered.filter((header) => header !== 'Next action')), /required header missing/);
});

test('actual inbound producer output is accepted by the shared stable-ID consumer contract without renaming', () => {
  const produced = crm.initialLeadRow({ normalized: inbound(), config: config() });
  const producedLeadId = produced[0];
  // Matches the P2 onboarding contract: LS-LEAD and LS-WAPI stable IDs are both valid.
  assert.match(producedLeadId, /^LS-(?:LEAD|WAPI)-[A-Za-z0-9-]+$/);
  assert.match(producedLeadId, /^LS-WAPI-[a-f0-9]{16}$/);
  assert.equal(crm.SHEET_FIELD_MAP_VERSION, 'life-skills-inbound-v2');
});

test('private-app prospect bridge reads named fields and changes only explicitly owned cells', async () => {
  const onboardingHeaders = ['Form sent', 'Form submitted', 'Payment link sent', 'Payment method', 'Payment status', 'Payment allocation', 'Booking status', 'Message receipt', 'Update provenance'];
  const sheets = new Sheets([...headers, ...onboardingHeaders, ...Object.values(crm.MACHINE_HEADERS)]);
  await crm.upsertLifeSkillsSheetLead({ sheets, normalized: inbound(), config: config() });
  const leadId = sheets.grid[1][0];
  sheets.grid[1][24] = 'Existing note';
  const listed = await crm.listLifeSkillsLeads({ sheets, config: config() });
  assert.equal(listed.length, 1);
  assert.equal(listed[0].leadId, leadId);
  assert.equal(listed[0].notes, 'Existing note');
  await crm.updateLifeSkillsLeadFields({ sheets, config: config(), leadId, fields: { stage: 'Contacted', nextAction: 'Call tomorrow', dueDate: '2026-09-23' } });
  assert.equal(sheets.grid[1][13], 'Contacted');
  assert.equal(sheets.grid[1][15], 'Call tomorrow');
  assert.equal(sheets.grid[1][16], '2026-09-23');
  assert.equal(sheets.grid[1][24], 'Existing note');
  await assert.rejects(() => crm.updateLifeSkillsLeadFields({ sheets, config: config(), leadId, fields: { phone: '+972500000000' } }), /not editable/);
});

test('manual prospect creation is deduplicated by normalized phone and never sends', async () => {
  const onboardingHeaders = ['Form sent', 'Form submitted', 'Payment link sent', 'Payment method', 'Payment status', 'Payment allocation', 'Booking status', 'Message receipt', 'Update provenance'];
  const sheets = new Sheets([...headers, ...onboardingHeaders, ...Object.values(crm.MACHINE_HEADERS)]);
  const first = await crm.createLifeSkillsLead({ sheets, config: config(), now: new Date('2026-09-22T08:00:00Z'), input: { phone: '050-123-4567', name: '', language: '', source: 'Referral', notes: 'Administrative note', nextAction: 'Call', dueDate: '2026-09-23' } });
  const second = await crm.createLifeSkillsLead({ sheets, config: config(), now: new Date('2026-09-22T09:00:00Z'), input: { phone: '+972501234567', name: 'Ignored duplicate' } });
  assert.equal(first.action, 'created');
  assert.equal(second.action, 'existing');
  assert.equal(second.leadId, first.leadId);
  assert.match(first.leadId, /^LS-LEAD-[a-f0-9]{16}$/);
  assert.equal(sheets.grid.length, 2);
});

test('practitioner sends are secret-bound, durably recorded and replay-suppressed before Whapi', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const start = server.indexOf('function authorizeLifeSkillsAppBridge');
  const end = server.indexOf("app.get('/api/webhooks/wapi'", start);
  const bridge = server.slice(start, end);
  assert.match(bridge, /x-life-skills-bridge-secret/);
  assert.match(bridge, /timingSafeEqual/);
  assert.match(bridge, /life_skills_delivery_key/);
  assert.match(bridge, /pg_advisory_xact_lock/);
  assert.match(bridge, /replaySuppressed: true/);
  assert.ok(bridge.indexOf('createOutboundWapiCommunicationAttempt') < bridge.indexOf('sendWapiTextMessage'));
  assert.doesNotMatch(bridge, /LIFE_SKILLS_WAPI_AUTO_REPLY_ENABLED/);
});
