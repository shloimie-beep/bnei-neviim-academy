'use strict';
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createTestDatabase } = require('./helpers/bna-interest-db.cjs');
const { createInterestStore } = require('../src/lib/bna/interest-store');
const { normalizeSubmission, NOTICE } = require('../src/lib/bna/interest-launch');
const { VERSION, CHANNEL, SENDER, draftOwnerAlert, dispatchOwnerAlert, createOwnerAlertWorker, activateOwnerAlerts } = require('../src/lib/bna/interest-owner-alert');
const TO = 'synthetic-owner@example.invalid';
let fixture, store;
before(async () => { fixture = await createTestDatabase(); store = createInterestStore({ pool: fixture.pool, minChallengeAge: 0, ownerAlertRecipient: TO }); });
after(async () => { await fixture?.close(); });
beforeEach(async () => { await fixture.pool.query('DELETE FROM bna_interest_email_releases'); await fixture.pool.query("UPDATE assistant_delivery_outbox SET status='cancelled'"); });
const body = overrides => ({ operationId: randomUUID(), recoveryToken: randomUUID(), fields: { program: 'both', name: 'Synthetic parent', email: `${randomUUID()}@example.invalid`, phone: '', contactChannel: 'email', language: 'he', siteLanguage: 'he', area: 'Outside South Florida', preferredArea: 'Other area', childAges: [9, 12], learningArrangement: '', torahExperience: '', question: '', articleUpdates: false, podUpdates: false, academyUpdates: false, permission: { confirmed: true, version: NOTICE.version, language: 'he' }, ...overrides } });
async function save(value, using = store) { const challenge = await using.issueChallenge(); return using.save(normalizeSubmission(value), challenge.challenge); }
async function alertFor(reference) { return (await fixture.pool.query('SELECT * FROM assistant_delivery_outbox WHERE delivery_key=$1', ['bna-interest-owner:' + reference])).rows[0]; }
const transport = send => ({ verifySender: async () => ({ email: SENDER, verifiedAt: new Date().toISOString() }), send });
async function activate(using = transport(async () => ({ id: 'synthetic-accepted', provider: 'gmail' })), to = TO) { return activateOwnerAlerts({ pool: fixture.pool, transport: using, to, approvalSource: 'synthetic-only explicit template approval' }); }

test('saved inquiry and independent owner draft exist before transport; inactive draft never sends', async () => {
  const input = body(), saved = await save(input), row = await alertFor(saved.reference); let calls = 0;
  assert.equal(saved.saved, true); assert.equal(saved.email.state, 'draft'); assert.equal(row.status, 'cancelled'); assert.equal(row.payload.delivery_state, 'draft');
  assert.equal(row.payload.message.subject, 'New BNA interest form received'); assert.ok(row.payload.message.text.includes(saved.reference));
  assert.ok(!row.payload.message.text.includes(input.fields.email)); assert.ok(!row.payload.message.text.includes(input.fields.name));
  await createOwnerAlertWorker({ pool: fixture.pool, to: TO, transport: transport(async () => { calls++; }) }).tick(); assert.equal(calls, 0);
});
test('activation affects only new inquiries and concurrent/restarted workers deliver one alert', async () => {
  const old = await save(body()); let calls = 0;
  const mail = transport(async message => { calls++; assert.equal(message.to, TO); assert.equal(message.from, SENDER); assert.equal(message.replyTo, SENDER); await new Promise(r => setTimeout(r, 5)); return { id: 'synthetic-provider-id', provider: 'gmail' }; });
  await activate(mail); const saved = await save(body());
  await Promise.all([createOwnerAlertWorker({ pool: fixture.pool, transport: mail, to: TO }).tick(), createOwnerAlertWorker({ pool: fixture.pool, transport: mail, to: TO }).tick()]);
  await createOwnerAlertWorker({ pool: fixture.pool, transport: mail, to: TO }).tick();
  assert.equal(calls, 1); assert.equal((await alertFor(saved.reference)).payload.delivery_state, 'provider_accepted'); assert.equal((await alertFor(old.reference)).payload.delivery_state, 'draft');
});
test('lost response, operation replay and content duplicate create one inquiry and owner intent', async () => {
  await activate(); const input = body(), first = await save(input), replay = await save(input), duplicate = await save({ ...input, operationId: randomUUID(), recoveryToken: randomUUID() });
  assert.equal(replay.reference, first.reference); assert.equal(duplicate.reference, first.reference);
  assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS n FROM assistant_delivery_outbox WHERE delivery_key=$1', ['bna-interest-owner:' + first.reference])).rows[0].n, 1);
  assert.equal((await store.recover(input.operationId, input.recoveryToken)).saved, true);
});
for (const definite of [true, false]) test(`owner transport ${definite ? 'rejection' : 'uncertainty'} preserves inquiry and never auto-resends`, async () => {
  let calls = 0; const mail = transport(async () => { calls++; const e = Error('Synthetic provider failure'); e.definitelyNotSent = definite; throw e; });
  await activate(mail); const input = body(), saved = await save(input);
  await createOwnerAlertWorker({ pool: fixture.pool, transport: mail, to: TO }).tick(); await createOwnerAlertWorker({ pool: fixture.pool, transport: mail, to: TO }).tick();
  assert.equal(calls, 1); assert.equal((await alertFor(saved.reference)).payload.delivery_state, definite ? 'failed' : 'unknown');
  assert.equal((await store.recover(input.operationId, input.recoveryToken)).saved, true); assert.equal((await store.recover(input.operationId, input.recoveryToken)).email.state, 'draft');
});
test('crashed sending claim becomes unknown without transport or inquiry loss', async () => {
  await activate(); const input = body(), saved = await save(input), row = await alertFor(saved.reference); let calls = 0;
  await fixture.pool.query(`UPDATE assistant_delivery_outbox SET status='sending',updated_at=NOW()-INTERVAL '10 minutes',payload=payload || '{"delivery_state":"sending"}'::jsonb WHERE id=$1`, [row.id]);
  await createOwnerAlertWorker({ pool: fixture.pool, transport: transport(async () => { calls++; }), to: TO }).tick();
  assert.equal(calls, 0); assert.equal((await alertFor(saved.reference)).payload.delivery_state, 'unknown'); assert.equal((await store.recover(input.operationId, input.recoveryToken)).saved, true);
});
test('unapproved message bytes, recipient change and foreign/archived inquiry cannot dispatch', async () => {
  const approval = await activate(); let calls = 0; const mail = transport(async () => { calls++; return { id: 'must-not-send' }; });
  for (const mutation of ['copy', 'foreign', 'archived']) {
    const saved = await save(body()), row = await alertFor(saved.reference);
    if (mutation === 'copy') await fixture.pool.query(`UPDATE assistant_delivery_outbox SET payload=jsonb_set(payload,'{message,text}','"Changed unapproved copy"'::jsonb) WHERE id=$1`, [row.id]);
    if (mutation === 'foreign') await fixture.pool.query('UPDATE bna_interest_inquiries SET project_id=2 WHERE id=$1', [saved.reference]);
    if (mutation === 'archived') await fixture.pool.query("UPDATE bna_parent_leads SET archived_at=NOW(),status='archived' WHERE id=$1", [row.payload.lead_id]);
    await dispatchOwnerAlert({ db: fixture.pool, outboxId: row.id, transport: mail, to: TO, approvedTemplateHashes: [approval.templateHash] });
  }
  const other = createInterestStore({ pool: fixture.pool, minChallengeAge: 0, ownerAlertRecipient: 'another-owner@example.invalid' });
  const saved = await save(body(), other); assert.equal((await alertFor(saved.reference)).payload.delivery_state, 'draft'); assert.equal(calls, 0);
});
test('approval requires verified BNA sender and an explicit receipt; dynamic area stays plain text', async () => {
  await assert.rejects(() => activateOwnerAlerts({ pool: fixture.pool, transport: transport(), to: TO, approvalSource: '' }), { code: 'OWNER_ALERT_APPROVAL_REQUIRED' });
  await assert.rejects(() => activateOwnerAlerts({ pool: fixture.pool, transport: { verifySender: async () => ({ email: 'wrong@example.invalid' }) }, to: TO, approvalSource: 'synthetic' }), { code: 'BNA_SENDER_NOT_VERIFIED' });
  const reference = randomUUID(), message = draftOwnerAlert({ reference, program: 'pod', area: 'Other area\n{{reference}}', to: TO });
  assert.ok(message.text.includes('Area: Other area {{reference}}')); assert.ok(message.text.includes('Reference: ' + reference));
  assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS n FROM bna_interest_email_releases WHERE version=$1 AND active=true', [VERSION])).rows[0].n, 0);
});
