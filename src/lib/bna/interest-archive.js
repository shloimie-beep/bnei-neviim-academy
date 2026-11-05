'use strict';
const { DECISION, problem } = require('./interest-launch');
const MIGRATION = DECISION + '-legacy-archive';
// Authentication, credentials, memberships, providers and other-program tables
// are deliberately absent. Original rows and relationships remain in place.
const TABLES = Object.freeze([
  'bna_contacts', 'bna_parent_leads', 'signups', 'bna_students', 'bna_tasks', 'bna_automations',
  'bna_communications', 'bna_contact_communications', 'bna_email_log',
  'bna_payment_intake', 'bna_payment_log', 'bna_group_goals', 'bna_content_jobs',
  'bna_content_bundles', 'bna_in_app_notifications', 'bna_learning_communities',
  'bna_support_tickets', 'bna_tickets', 'bna_assistant_threads', 'bna_assistant_onboarding_intakes',
]);
function legacyActiveSql(table, alias) {
  if (!TABLES.includes(table) || !/^[a-z][a-z0-9_]*$/.test(alias)) throw problem('ARCHIVE_TABLE_INVALID');
  return `NOT EXISTS (SELECT 1 FROM bna_interest_archive_items bna_legacy WHERE bna_legacy.entity_table='${table}' AND bna_legacy.entity_id=${alias}.id::text AND bna_legacy.archived_at IS NOT NULL AND bna_legacy.restored_at IS NULL)`;
}
function protectedRow(row, bnaWorkspaceId) {
  const parse = value => { if (value && typeof value === 'object') return value; try { return JSON.parse(value || '{}'); } catch { return {}; } };
  const m = parse(row.metadata), context = parse(row.source_context);
  const scopes = [row.workspace_key, row.project_key, m.workspace_key, m.project_key, m.provider_workspace_key, context.workspace_key, context.project_key, context.provider_workspace_key];
  return m.interest_launch === DECISION ||
    (row.workspace_id != null && bnaWorkspaceId != null && Number(row.workspace_id) !== Number(bnaWorkspaceId)) ||
    scopes.some(scope => scope && !['bna', 'bnei_neviim_academy'].includes(scope)) ||
    row.provider_id || row.service_provider_id || row.provider_profile_id || m.provider_id || m.service_provider_id || context.provider_id ||
    /\b(?:One[ _-]Time|Rabbi (?:Sheller|Scheller)|Fishing Academy|Life Skills)\b/i.test(row.title || '') ||
    (Array.isArray(row.tags) && row.tags.some(tag => /^(?:one[-_]time|rabbi[-_]|fishing[-_]|life[-_]skills)/i.test(String(tag))));
}
function businessSnapshot(value) {
  if (Array.isArray(value)) return value.map(businessSnapshot);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !/(?:password|secret|token|credential|session|api[_-]?key|recovery|login[_-]?code|\botp\b|\bpin\b)/i.test(key)).map(([key, item]) => [key, businessSnapshot(item)]));
}
async function bnaProject(db) {
  const rows = (await db.query("SELECT id FROM bna_projects WHERE project_key='bna' LIMIT 2")).rows;
  if (rows.length !== 1) throw problem('BNA_PROJECT_UNAVAILABLE', 503); return rows[0].id;
}
async function entityScope(db, table, projectId) {
  if (table !== 'bna_contacts') return { column: 'project_id', id: projectId };
  const rows = (await db.query("SELECT id FROM bna_workspace_settings WHERE workspace_key='bna' LIMIT 2")).rows;
  if (rows.length !== 1) throw problem('BNA_WORKSPACE_UNAVAILABLE', 503);
  return { column: 'workspace_id', id: rows[0].id };
}
function createBnaArchive({ pool }) {
  async function prepare({ cutoff = new Date().toISOString(), migrationId = MIGRATION } = {}) {
    if (migrationId !== MIGRATION || !Number.isFinite(Date.parse(cutoff))) throw problem('ARCHIVE_INPUT_INVALID');
    const db = await pool.connect();
    try {
      await db.query('BEGIN'); await db.query("SELECT pg_advisory_xact_lock(hashtext('bna-interest-legacy-archive'))");
      const existing = (await db.query('SELECT migration_id,cutoff,inventory,state FROM bna_interest_archive_runs WHERE migration_id=$1', [migrationId])).rows[0];
      if (existing) { await db.query('COMMIT'); return { ...existing, reused: true }; }
      const projectId = await bnaProject(db), inventory = { projectId, counts: {}, protected: {}, total: 0, excluded: ['authentication', 'administrator accounts', 'memberships', 'providers', 'One Time', 'Fishing', 'post-cutoff arrivals'] };
      const bnaWorkspaceId = (await entityScope(db, 'bna_contacts', projectId)).id;
      await db.query('INSERT INTO bna_interest_archive_runs(migration_id,cutoff,inventory) VALUES($1,$2,$3::jsonb)', [migrationId, cutoff, JSON.stringify(inventory)]);
      for (const table of TABLES) {
        const columns = (await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1", [table])).rows.map(row => row.column_name);
        const scopeColumn = table === 'bna_contacts' ? 'workspace_id' : 'project_id';
        if (!columns.includes(scopeColumn) || !columns.includes('id')) continue;
        // A missing creation time is not guessed into a before-cutoff record.
        if (!columns.includes('created_at')) { inventory.protected[table] = 'creation_time_unavailable'; continue; }
        const scope = await entityScope(db, table, projectId);
        const rows = (await db.query(`SELECT * FROM ${table} WHERE ${scope.column}=$1 AND created_at<$2`, [scope.id, cutoff])).rows;
        let count = 0, protectedCount = 0;
        for (const row of rows) {
          if (protectedRow(row, bnaWorkspaceId)) { protectedCount++; continue; }
          if (++inventory.total > 25000) throw problem('ARCHIVE_INVENTORY_LIMIT', 409);
          // Only business-only columns are changed. Signups/students retain
          // their status and credentials; the read projection hides them.
          const patch = {};
          if (table === 'bna_parent_leads') { patch.status = 'archived'; if (columns.includes('archived_at')) patch.archived_at = cutoff; }
          if (table === 'bna_tasks' && columns.includes('is_visible_task')) patch.is_visible_task = false;
          if (table === 'bna_tasks' && columns.includes('stage')) { patch.stage = 'archive'; if (columns.includes('archived_at')) patch.archived_at = cutoff; }
          if (table === 'bna_automations') { for (const key of ['enabled', 'is_enabled', 'active', 'is_active']) if (columns.includes(key)) patch[key] = false; if (columns.includes('status')) patch.status = 'paused'; }
          await db.query('INSERT INTO bna_interest_archive_items(migration_id,entity_table,entity_id,snapshot,archive_patch) VALUES($1,$2,$3,$4::jsonb,$5::jsonb)', [migrationId, table, String(row.id), JSON.stringify(businessSnapshot(row)), JSON.stringify(patch)]); count++;
        }
        inventory.counts[table] = count; if (protectedCount) inventory.protected[table] = protectedCount;
      }
      await db.query('UPDATE bna_interest_archive_runs SET inventory=$2::jsonb WHERE migration_id=$1', [migrationId, JSON.stringify(inventory)]);
      await db.query('COMMIT'); return { migration_id: migrationId, cutoff, inventory, state: 'prepared', reused: false };
    } catch (error) { await db.query('ROLLBACK').catch(() => {}); throw error; } finally { db.release(); }
  }
  async function apply(migrationId = MIGRATION) {
    if (migrationId !== MIGRATION) throw problem('ARCHIVE_INPUT_INVALID');
    const db = await pool.connect();
    try {
      await db.query('BEGIN'); await db.query("SELECT pg_advisory_xact_lock(hashtext('bna-interest-legacy-archive'))");
      const run = (await db.query('SELECT * FROM bna_interest_archive_runs WHERE migration_id=$1 FOR UPDATE', [migrationId])).rows[0];
      if (!run) throw problem('ARCHIVE_INVENTORY_REQUIRED', 409);
      if (run.state === 'applied') { await db.query('COMMIT'); return { state: 'applied', reused: true, inventory: run.inventory, cutoff: run.cutoff }; }
      if (run.state !== 'prepared') throw problem('ARCHIVE_STATE_INVALID', 409);
      const projectId = await bnaProject(db), items = (await db.query('SELECT * FROM bna_interest_archive_items WHERE migration_id=$1 ORDER BY entity_table,entity_id', [migrationId])).rows;
      const bnaWorkspaceId = (await entityScope(db, 'bna_contacts', projectId)).id;
      let applied = 0;
      for (const item of items) {
        if (!TABLES.includes(item.entity_table)) throw problem('ARCHIVE_TABLE_INVALID');
        const scope = await entityScope(db, item.entity_table, projectId);
        const current = (await db.query(`SELECT * FROM ${item.entity_table} WHERE id::text=$1 AND ${scope.column}=$2 FOR UPDATE`, [item.entity_id, scope.id])).rows[0];
        if (!current || protectedRow(current, bnaWorkspaceId) || new Date(current.created_at).getTime() >= new Date(run.cutoff).getTime()) continue;
        const writtenPatch = {};
        for (const [column, value] of Object.entries(item.archive_patch)) {
          // Patch a value only if it has not changed since inventory. A new
          // concurrent business update is preserved rather than overwritten.
          if (JSON.stringify(current[column]) === JSON.stringify(item.snapshot[column])) {
            const changed = (await db.query(`UPDATE ${item.entity_table} SET ${column}=$1 WHERE id::text=$2 AND ${scope.column}=$3 RETURNING ${column} AS value`, [value, item.entity_id, scope.id])).rows[0];
            writtenPatch[column] = changed.value;
          }
        }
        await db.query('UPDATE bna_interest_archive_items SET archived_at=NOW(),archive_patch=$4::jsonb WHERE migration_id=$1 AND entity_table=$2 AND entity_id=$3', [migrationId, item.entity_table, item.entity_id, JSON.stringify(writtenPatch)]); applied++;
      }
      await db.query("UPDATE bna_interest_archive_runs SET state='applied',applied_at=NOW() WHERE migration_id=$1", [migrationId]);
      await db.query('COMMIT'); return { state: 'applied', applied, inventory: run.inventory, cutoff: run.cutoff, reused: false };
    } catch (error) { await db.query('ROLLBACK').catch(() => {}); throw error; } finally { db.release(); }
  }
  async function restore({ table, id, migrationId = MIGRATION }) {
    if (!TABLES.includes(table) || migrationId !== MIGRATION || !/^[a-z0-9-]{1,80}$/i.test(String(id))) throw problem('ARCHIVE_INPUT_INVALID');
    const db = await pool.connect();
    try {
      await db.query('BEGIN'); await db.query("SELECT pg_advisory_xact_lock(hashtext('bna-interest-legacy-archive'))");
      const item = (await db.query('SELECT * FROM bna_interest_archive_items WHERE migration_id=$1 AND entity_table=$2 AND entity_id=$3 FOR UPDATE', [migrationId, table, String(id)])).rows[0];
      if (!item?.archived_at) throw problem('ARCHIVE_RECORD_NOT_FOUND', 404);
      if (item.restored_at) { await db.query('COMMIT'); return { restored: true, replayed: true }; }
      const projectId = await bnaProject(db), scope = await entityScope(db, table, projectId), current = (await db.query(`SELECT * FROM ${table} WHERE id::text=$1 AND ${scope.column}=$2 FOR UPDATE`, [String(id), scope.id])).rows[0];
      if (!current) throw problem('ARCHIVE_RECORD_NOT_FOUND', 404);
      for (const [column, value] of Object.entries(item.archive_patch)) {
        const equal = column.endsWith('_at') ? new Date(current[column]).getTime() === new Date(value).getTime() : current[column] === value;
        if (equal) await db.query(`UPDATE ${table} SET ${column}=$1 WHERE id::text=$2 AND ${scope.column}=$3`, [item.snapshot[column] ?? null, String(id), scope.id]);
      }
      await db.query('UPDATE bna_interest_archive_items SET restored_at=NOW() WHERE migration_id=$1 AND entity_table=$2 AND entity_id=$3', [migrationId, table, String(id)]);
      await db.query('COMMIT'); return { restored: true, replayed: false };
    } catch (error) { await db.query('ROLLBACK').catch(() => {}); throw error; } finally { db.release(); }
  }
  return { prepare, apply, restore };
}
async function assertBnaEmailRecipientActive(pool, email) {
  const result = await pool.query(`SELECT 1 FROM bna_interest_archive_items WHERE archived_at IS NOT NULL AND restored_at IS NULL AND lower(COALESCE(snapshot->>'parent_email',snapshot->>'primary_email',snapshot->>'email',''))=$1 LIMIT 1`, [String(email || '').trim().toLowerCase()]);
  if (result.rows.length) throw problem('ARCHIVED_BNA_RECIPIENT', 409);
}
module.exports = { MIGRATION, TABLES, legacyActiveSql, createBnaArchive, protectedRow, businessSnapshot, assertBnaEmailRecipientActive };
