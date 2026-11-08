'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createTestDatabase } = require('./helpers/bna-interest-db.cjs');
const { createBnaArchive, MIGRATION, legacyActiveSql, assertBnaEmailRecipientActive } = require('../src/lib/bna/interest-archive');
const { DECISION } = require('../src/lib/bna/interest-launch');
let fixture, archive, ids;
before(async () => {
  fixture = await createTestDatabase(); archive = createBnaArchive({ pool: fixture.pool });
  await fixture.database.exec(`
    CREATE TABLE bna_workspace_settings(id serial PRIMARY KEY,workspace_key text UNIQUE);
    INSERT INTO bna_workspace_settings VALUES(1,'bna'),(2,'rabbi_sheller_provider');
    CREATE TABLE bna_contacts(id serial PRIMARY KEY,workspace_id integer,full_name text,primary_email text,status text,created_at timestamp);
    INSERT INTO bna_contacts VALUES(1,1,'Legacy BNA contact','old-contact@example.invalid','active','2026-10-01'),(2,2,'Other workspace contact','other-contact@example.invalid','active','2026-10-01');
    CREATE TABLE signups(id serial PRIMARY KEY,project_id integer,parent_name text,parent_email text,status text,credential_hash text,created_at timestamp);
    CREATE TABLE bna_students(id serial PRIMARY KEY,project_id integer,student_name text,status text,credential_hash text,created_at timestamp);
    CREATE TABLE bna_tasks(id serial PRIMARY KEY,project_id integer,title text,is_visible_task boolean,created_at timestamp);
    CREATE TABLE bna_automations(id serial PRIMARY KEY,project_id integer,enabled boolean,created_at timestamp);
    CREATE TABLE bna_contact_communications(id serial PRIMARY KEY,project_id integer,parent_lead_id integer,body_text text,created_at timestamp);
    CREATE TABLE bna_admin_accounts(id serial PRIMARY KEY,project_id integer,password_hash text,role text);
    INSERT INTO signups VALUES(1,1,'Legacy signup','legacy@example.invalid','active','retained-signup-auth','2026-10-01');
    INSERT INTO bna_students VALUES(1,1,'Legacy student','active','retained-student-auth','2026-10-01');
    INSERT INTO bna_tasks VALUES(1,1,'Legacy business task',true,'2026-10-01');
    INSERT INTO bna_automations VALUES(1,1,true,'2026-10-01');
    INSERT INTO bna_admin_accounts VALUES(1,1,'untouched-admin-credential','owner');
    ALTER TABLE bna_tasks ADD COLUMN stage text DEFAULT 'inbox' CHECK(stage IN ('inbox','archive'));
    ALTER TABLE bna_tasks ADD COLUMN archived_at timestamp;
    ALTER TABLE bna_tasks ADD COLUMN source_context text;
    ALTER TABLE bna_tasks ADD COLUMN workspace_id integer;
    INSERT INTO bna_tasks(id,project_id,title,is_visible_task,created_at,source_context,workspace_id) VALUES
      (2,1,'One Time protected task',true,'2026-10-01','{}',NULL),
      (3,1,'Explicit foreign source scope',true,'2026-10-01','{"project_key":"one_time_mishnah_class"}',NULL),
      (4,1,'Different workspace ownership',true,'2026-10-01','{}',2);
  `);
  ids = (await fixture.pool.query(`INSERT INTO bna_parent_leads(project_id,parent_name,parent_email,status,notes,metadata,created_at) VALUES
    (1,'Legacy BNA','old@example.invalid','interested','Historic note','{}','2026-10-01'),
    (2,'Other provider','other@example.invalid','new','','{}','2026-10-01'),
    (1,'Protected Fishing scope','fish@example.invalid','new','','{"workspace_key":"fishing"}','2026-10-01'),
    (1,'New arrival','new@example.invalid','new','','{}','2026-11-06'),
    (1,'Current BNA inquiry','current@example.invalid','new','',$1::jsonb,'2026-10-01') RETURNING id`, [JSON.stringify({ interest_launch: DECISION })])).rows.map(row => row.id);
  await fixture.pool.query("INSERT INTO bna_contact_communications(project_id,parent_lead_id,body_text,created_at) VALUES(1,$1,'Historical linked communication','2026-10-01')", [ids[0]]);
});
after(async () => { await fixture?.close(); });
test('fixed inventory excludes authentication, foreign scopes, current launch inquiries and post-cutoff arrivals', async () => {
  const run = await archive.prepare({ cutoff: '2026-11-05T00:00:00.000Z' });
  assert.equal(run.state, 'prepared'); assert.equal(run.inventory.counts.bna_parent_leads, 1); assert.equal(run.inventory.protected.bna_parent_leads, 2);
  assert.equal(run.inventory.counts.bna_contact_communications, 1);
  assert.equal(run.inventory.counts.bna_contacts, 1);
  assert.equal(run.inventory.counts.bna_admin_accounts, undefined);
  assert.equal(run.inventory.counts.bna_tasks, 1); assert.equal(run.inventory.protected.bna_tasks, 3);
  const snapshot = (await fixture.pool.query("SELECT snapshot FROM bna_interest_archive_items WHERE entity_table='signups'")).rows[0].snapshot;
  assert.equal(snapshot.credential_hash, undefined);
  const same = await archive.prepare({ cutoff: '2026-12-01T00:00:00.000Z' }); assert.equal(same.reused, true); assert.equal(new Date(same.cutoff).toISOString(), '2026-11-05T00:00:00.000Z');
});
test('apply preserves original rows/history, hides only inventoried records and disables legacy automation', async () => {
  await fixture.pool.query('UPDATE bna_parent_leads SET notes=$2 WHERE id=$1', [ids[0], 'Concurrent owner note']);
  const result = await archive.apply(); assert.equal(result.state, 'applied');
  const legacy = (await fixture.pool.query('SELECT * FROM bna_parent_leads WHERE id=$1', [ids[0]])).rows[0]; assert.equal(legacy.status, 'archived'); assert.equal(legacy.notes, 'Concurrent owner note');
  assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS count FROM bna_parent_leads')).rows[0].count, 5);
  assert.equal((await fixture.pool.query('SELECT body_text FROM bna_contact_communications')).rows[0].body_text, 'Historical linked communication');
  for (const id of ids.slice(1)) assert.equal((await fixture.pool.query('SELECT status FROM bna_parent_leads WHERE id=$1', [id])).rows[0].status, 'new');
  assert.equal((await fixture.pool.query('SELECT enabled FROM bna_automations')).rows[0].enabled, false);
  assert.equal((await fixture.pool.query('SELECT stage FROM bna_tasks WHERE id=1')).rows[0].stage, 'archive');
  assert.equal((await fixture.pool.query("SELECT COUNT(*)::int AS count FROM bna_tasks WHERE id>1 AND stage='inbox' AND is_visible_task=true")).rows[0].count, 3);
  assert.equal((await fixture.pool.query('SELECT password_hash FROM bna_admin_accounts')).rows[0].password_hash, 'untouched-admin-credential');
  assert.equal((await fixture.pool.query('SELECT credential_hash,status FROM signups')).rows[0].status, 'active');
  assert.equal((await fixture.pool.query('SELECT credential_hash,status FROM bna_students')).rows[0].credential_hash, 'retained-student-auth');
  assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS count FROM signups s WHERE ' + legacyActiveSql('signups', 's'))).rows[0].count, 0);
  assert.equal((await fixture.pool.query('SELECT COUNT(*)::int AS count FROM bna_contacts c WHERE ' + legacyActiveSql('bna_contacts', 'c'))).rows[0].count, 1);
  await assert.rejects(() => assertBnaEmailRecipientActive(fixture.pool, 'old@example.invalid'), { code: 'ARCHIVED_BNA_RECIPIENT' });
  await assertBnaEmailRecipientActive(fixture.pool, 'new@example.invalid');
});
test('retry is idempotent and later arrivals stay active', async () => {
  await fixture.pool.query("INSERT INTO bna_parent_leads(project_id,parent_name,status,created_at) VALUES(1,'Arrived after inventory','new',NOW())");
  const again = await archive.apply(); assert.equal(again.reused, true);
  assert.equal((await fixture.pool.query("SELECT status FROM bna_parent_leads WHERE parent_name='Arrived after inventory'")).rows[0].status, 'new');
});
test('restore keeps IDs, linked history and concurrent notes; a migration retry does not rearchive it', async () => {
  const result = await archive.restore({ table: 'bna_parent_leads', id: ids[0] }); assert.equal(result.restored, true);
  const row = (await fixture.pool.query('SELECT * FROM bna_parent_leads WHERE id=$1', [ids[0]])).rows[0]; assert.equal(row.status, 'interested'); assert.equal(row.notes, 'Concurrent owner note'); assert.equal(row.archived_at, null);
  await archive.apply(); assert.equal((await fixture.pool.query('SELECT status FROM bna_parent_leads WHERE id=$1', [ids[0]])).rows[0].status, 'interested');
  assert.equal((await archive.restore({ table: 'bna_parent_leads', id: ids[0] })).replayed, true);
  assert.equal((await fixture.pool.query('SELECT parent_lead_id FROM bna_contact_communications')).rows[0].parent_lead_id, ids[0]);
  await assert.rejects(() => archive.restore({ table: 'bna_admin_accounts', id: 1 }), { code: 'ARCHIVE_INPUT_INVALID' });
  assert.equal(MIGRATION, DECISION + '-legacy-archive');
});
