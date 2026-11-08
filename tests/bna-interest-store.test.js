'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createTestDatabase } = require('./helpers/bna-interest-db.cjs');
const { normalizeSubmission, NOTICE } = require('../src/lib/bna/interest-launch');
const { draftEmail, dispatchAcknowledgement, VERSION } = require('../src/lib/bna/interest-email');
let fixture;
before(async () => { fixture = await createTestDatabase(); });
after(async () => { await fixture?.close(); });
const submission = overrides => ({ operationId: randomUUID(), recoveryToken: randomUUID(), fields: { program: 'both', name: 'Synthetic Parent', email: `${randomUUID()}@example.invalid`, phone: '', contactChannel: 'email', language: 'en', siteLanguage: 'en', area: 'Outside South Florida', preferredArea: 'Other area', childAges: [10, 12], learningArrangement: '', torahExperience: '', question: '', articleUpdates: false, podUpdates: false, academyUpdates: false, permission: { confirmed: true, version: NOTICE.version, language: 'en' }, ...overrides } });
async function save(body) { const offer = await fixture.store.issueChallenge(); return fixture.store.save(normalizeSubmission(body), offer.challenge); }
test('real SQL saves the selected program, other-area demand, exact consent and one durable draft without creating tasks', async () => {
  for (const program of ['pod', 'academy', 'both']) {
    const body = submission({ program }), result = await save(body);
    assert.equal(result.saved, true); assert.equal(result.email.state, 'draft');
    const row = (await fixture.pool.query('SELECT i.*,l.project_id AS lead_project,o.payload,o.status FROM bna_interest_inquiries i JOIN bna_parent_leads l ON l.id=i.parent_lead_id JOIN assistant_delivery_outbox o ON o.id=i.outbox_id WHERE i.id=$1', [result.reference])).rows[0];
    assert.equal(row.fields.program, program); assert.equal(row.fields.area, 'Outside South Florida'); assert.equal(row.fields.preferredArea, 'Other area');
    assert.equal(row.fields.permission.text, NOTICE.en); assert.equal(row.project_id, row.lead_project); assert.equal(row.status, 'cancelled');
    assert.equal(row.payload.message.text, draftEmail('en').text); assert.equal(row.payload.activation_required, true);
  }
  assert.equal((await fixture.pool.query("SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_name='bna_tasks'")).rows[0].count, 0);
});
test('lost-response retry and a fresh duplicate operation return one inquiry, lead and acknowledgement', async () => {
  const body = submission(), first = await save(body), replay = await save(body);
  const duplicate = await save({ ...body, operationId: randomUUID(), recoveryToken: randomUUID() });
  assert.equal(replay.reference, first.reference); assert.equal(duplicate.reference, first.reference); assert.equal(replay.replayed, true); assert.equal(duplicate.replayed, true);
  const count = (await fixture.pool.query('SELECT COUNT(*)::int AS count FROM bna_parent_leads WHERE parent_email=$1', [body.fields.email])).rows[0].count;
  assert.equal(count, 1);
  assert.equal((await fixture.pool.query("SELECT COUNT(*)::int AS count FROM assistant_delivery_outbox WHERE delivery_key=$1", [`bna-interest:${first.reference}`])).rows[0].count, 1);
});
test('changed payload under the same operation conflicts and leaves the original saved inquiry intact', async () => {
  const body = submission(), original = await save(body);
  await assert.rejects(() => save({ ...body, fields: { ...body.fields, area: 'Changed area' } }), { code: 'OPERATION_CONFLICT' });
  assert.equal((await fixture.pool.query('SELECT fields FROM bna_interest_inquiries WHERE id=$1', [original.reference])).rows[0].fields.area, body.fields.area);
});
test('recovery requires the independent capability, returns no contact data and survives another store instance', async () => {
  const body = submission(), saved = await save(body);
  const { createInterestStore } = require('../src/lib/bna/interest-store');
  const reopened = createInterestStore({ pool: fixture.pool });
  const recovered = await reopened.recover(body.operationId, body.recoveryToken);
  assert.equal(recovered.reference, saved.reference); assert.equal(recovered.email.state, 'draft'); assert.ok(!JSON.stringify(recovered).includes(body.fields.email));
  await assert.rejects(() => reopened.recover(body.operationId, randomUUID()), { code: 'SAVE_NOT_CONFIRMED' });
});
test('required email and conditional phone are independently enforced; no area whitelist exists', () => {
  assert.throws(() => normalizeSubmission(submission({ email: '', phone: '+13055550123', contactChannel: 'phone' })));
  assert.throws(() => normalizeSubmission(submission({ contactChannel: 'whatsapp', phone: '' })), { code: 'PHONE_REQUIRED' });
  assert.equal(normalizeSubmission(submission({ area: 'Anywhere', preferredArea: 'A different region', phone: '' })).fields.area, 'Anywhere');
  assert.equal(normalizeSubmission(submission({ contactChannel: 'whatsapp', phone: '+13055550123' })).fields.phone, '+13055550123');
});
test('an archived BNA contact or foreign-project contact never gets reactivated or overwritten by new interest', async () => {
  const body = submission();
  const legacy = (await fixture.pool.query("INSERT INTO bna_parent_leads(project_id,parent_name,parent_email,status,archived_at,metadata) VALUES(1,'Legacy', $1,'archived',NOW(),'{\"historical\":true}'),(2,'Other provider',$1,'new',NULL,'{}') RETURNING id", [body.fields.email])).rows;
  await save(body);
  const rows = (await fixture.pool.query('SELECT * FROM bna_parent_leads WHERE parent_email=$1 ORDER BY id', [body.fields.email])).rows;
  assert.equal(rows.length, 3); assert.equal(rows[0].status, 'archived'); assert.equal(rows[0].metadata.historical, true); assert.equal(rows[1].parent_name, 'Other provider'); assert.equal(rows[2].project_id, 1); assert.ok(!legacy.some(row => row.id === rows[2].id));
});
test('email failure leaves the saved lead; unknown outcomes are not dispatched twice', async () => {
  const body = submission(), saved = await save(body);
  const row = (await fixture.pool.query('SELECT outbox_id FROM bna_interest_inquiries WHERE id=$1', [saved.reference])).rows[0];
  await fixture.pool.query("UPDATE assistant_delivery_outbox SET status='queued' WHERE id=$1", [row.outbox_id]);
  let calls = 0; const send = async () => { calls++; throw Error('Lost provider response'); };
  const approval = { approved: true, version: VERSION, sender: 'verified@example.invalid', replyTo: 'reply@example.invalid', templateHashes: [draftEmail('en').templateHash] };
  assert.equal((await dispatchAcknowledgement({ db: fixture.pool, outboxId: row.outbox_id, send, approval })).state, 'unknown');
  assert.equal((await fixture.store.recover(body.operationId, body.recoveryToken)).saved, true);
  await dispatchAcknowledgement({ db: fixture.pool, outboxId: row.outbox_id, send, approval }); assert.equal(calls, 1);
  assert.equal((await fixture.store.recover(body.operationId, body.recoveryToken)).email.state, 'unknown');
});
test('draft preview and missing activation never invoke transport; first-name fallback is exact in both languages', async () => {
  let calls = 0; const result = await dispatchAcknowledgement({ db: fixture.pool, outboxId: 1, send: async () => { calls++; } });
  assert.equal(result.state, 'draft'); assert.equal(calls, 0);
  assert.ok(draftEmail('en').text.startsWith('Hi,\n\n')); assert.ok(draftEmail('he').text.startsWith('שלום,\n\n'));
  assert.ok(draftEmail('en', 'A full name').text.startsWith('Hi,\n\n'));
});
test('activation applies to newly saved inquiries only and the scoped worker accepts each email once', async () => {
  const { activateBnaAcknowledgements, createBnaAcknowledgementWorker, BNA_EMAIL, gmailMessage } = require('../src/lib/bna/interest-mail-runtime');
  const beforeActivation = await save(submission()); let calls = 0;
  const transport = { verifySender: async () => ({ email: BNA_EMAIL, verifiedAt: new Date().toISOString() }), send: async message => {
    calls++; assert.equal(message.from, BNA_EMAIL); assert.equal(message.replyTo, BNA_EMAIL);
    const raw = Buffer.from(gmailMessage(message), 'base64url').toString('utf8');
    assert.match(raw, /Message-ID: <bna-interest-[a-f0-9]+@bneineviimacademy.org>/);
    assert.equal(Buffer.from(raw.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString('utf8'), draftEmail('he').text);
    return { id: 'synthetic-provider-acceptance', provider: 'gmail' };
  } };
  await activateBnaAcknowledgements({ pool: fixture.pool, transport, approvalSource: 'synthetic-test-approval-only' });
  const body = submission({ language: 'he' }), next = await save(body); assert.equal(next.email.state, 'queued');
  const worker = createBnaAcknowledgementWorker({ pool: fixture.pool, transport }); await worker.tick(); await worker.tick();
  assert.equal(calls, 1); assert.equal((await fixture.store.recover(body.operationId, body.recoveryToken)).email.state, 'provider_accepted');
  assert.equal((await fixture.pool.query("SELECT o.payload->>'delivery_state' AS state FROM bna_interest_inquiries i JOIN assistant_delivery_outbox o ON o.id=i.outbox_id WHERE i.id=$1", [beforeActivation.reference])).rows[0].state, 'draft');
  await fixture.pool.query('UPDATE bna_interest_email_releases SET active=false');
});
