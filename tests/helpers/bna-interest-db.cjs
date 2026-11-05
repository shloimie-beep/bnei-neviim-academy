'use strict';
const { PGlite } = require('@electric-sql/pglite');
const { createInterestStore } = require('../../src/lib/bna/interest-store');
async function createTestDatabase() {
  const database = new PGlite();
  await database.exec(`
    CREATE TABLE bna_projects(id serial PRIMARY KEY,project_key text UNIQUE);
    INSERT INTO bna_projects(project_key) VALUES('bna'),('one_time_mishnah_class');
    CREATE TABLE bna_parent_leads(id serial PRIMARY KEY,project_id integer REFERENCES bna_projects(id),parent_name text NOT NULL,parent_email text,parent_phone text,student_age integer,lead_type text,status text DEFAULT 'new',source text,source_detail text,metadata jsonb DEFAULT '{}',last_inbound_at timestamp,updated_at timestamp DEFAULT NOW(),created_at timestamp DEFAULT NOW(),archived_at timestamp,notes text,next_follow_up_date date);
    CREATE TABLE assistant_delivery_outbox(id serial PRIMARY KEY,delivery_key text UNIQUE,channel_key text,recipient_identity_key text,payload jsonb,idempotency_key text,status text,attempts integer DEFAULT 0,updated_at timestamp DEFAULT NOW(),created_at timestamp DEFAULT NOW(),sent_at timestamp,last_error text);
  `);
  const query = async (sql, values) => !values && sql.includes(';') ? (await database.exec(sql)).at(-1) : database.query(sql, values);
  const pool = { query, connect: async () => ({ query, release() {} }) };
  const store = createInterestStore({ pool, minChallengeAge: 0 }); await store.ensureSchema();
  return { database, pool, store, close: () => database.close() };
}
module.exports = { createTestDatabase };
