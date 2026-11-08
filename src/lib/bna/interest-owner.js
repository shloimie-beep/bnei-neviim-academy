'use strict';
const { problem } = require('./interest-launch');
const { draftEmail } = require('./interest-email');
const { createBnaArchive, TABLES, MIGRATION } = require('./interest-archive');
const { escape } = require('./interest-pages');
function assertBnaOwner(req) {
  const key = req.opsIdentity?.scope?.type === 'project' ? req.opsIdentity.scope.projectKey : '';
  if (req.oneTimeViewAsRabbi || key && key !== 'bna' || req.query?.workspace && req.query.workspace !== 'bna' || req.query?.project_key && req.query.project_key !== 'bna') throw problem('BNA_SCOPE_DENIED', 403);
}
function registerBnaInterestOwnerRoutes({ app, pool, requireAdmin, enabled = () => true }) {
  const archive = createBnaArchive({ pool });
  const action = fn => async (req, res) => { res.set('Cache-Control', 'no-store'); if (!enabled()) return res.status(404).end(); try { assertBnaOwner(req); await fn(req, res); } catch (error) { res.status(error.statusCode || 503).json({ error: error.statusCode ? error.code : 'BNA_INQUIRY_UNAVAILABLE' }); } };
  app.get('/api/bna/interest-email/preview', requireAdmin, action(async (req, res) => {
    const drafts = ['en', 'he'].map(locale => draftEmail(locale));
    const release = (await pool.query('SELECT version,active,from_email,reply_to,approved_at FROM bna_interest_email_releases ORDER BY approved_at DESC LIMIT 1')).rows[0] || null;
    res.json({ drafts, release, sender: 'Bnei Neviim Academy <office@bneineviimacademy.org>', replyTo: 'office@bneineviimacademy.org' });
  }));
  app.get('/api/bna/interest-inquiries/:leadId', requireAdmin, action(async (req, res) => {
    if (!/^\d+$/.test(req.params.leadId)) throw problem('INVALID_LEAD');
    const lead = (await pool.query("SELECT l.* FROM bna_parent_leads l JOIN bna_projects p ON p.id=l.project_id WHERE l.id=$1 AND p.project_key='bna'", [req.params.leadId])).rows[0];
    if (!lead) throw problem('LEAD_NOT_FOUND', 404);
    const inquiries = (await pool.query("SELECT i.id,i.fields,i.attribution,i.created_at,o.payload->>'delivery_state' AS email_state FROM bna_interest_inquiries i JOIN assistant_delivery_outbox o ON o.id=i.outbox_id WHERE i.parent_lead_id=$1 ORDER BY i.created_at DESC", [lead.id])).rows;
    res.json({ lead, inquiries });
  }));
  app.get('/api/bna/interest-archive', requireAdmin, action(async (req, res) => {
    const table = req.query.table || 'bna_parent_leads'; if (!TABLES.includes(table)) throw problem('ARCHIVE_TABLE_INVALID');
    const offset = Number(req.query.offset || 0); if (!Number.isSafeInteger(offset) || offset < 0) throw problem('INVALID_PAGE');
    const runs = (await pool.query('SELECT migration_id,cutoff,inventory,state,applied_at FROM bna_interest_archive_runs ORDER BY created_at DESC')).rows;
    const items = (await pool.query(`SELECT migration_id,entity_table,entity_id,snapshot,archived_at,restored_at FROM bna_interest_archive_items WHERE entity_table=$1 AND archived_at IS NOT NULL AND restored_at IS NULL ORDER BY entity_id LIMIT 50 OFFSET $2`, [table, offset])).rows;
    const fields = ['id', 'parent_name', 'student_name', 'name', 'full_name', 'title', 'parent_email', 'primary_email', 'email', 'subject', 'notes', 'created_at', 'status', 'lead_id', 'signup_id', 'student_id', 'contact_id'];
    const projected = items.map(item => ({ ...item, snapshot: Object.fromEntries(fields.filter(field => item.snapshot[field] !== undefined).map(field => [field, item.snapshot[field]])) }));
    res.json({ runs, items: projected, table, offset, nextOffset: items.length === 50 ? offset + 50 : null });
  }));
  app.post('/api/bna/interest-archive/restore', requireAdmin, action(async (req, res) => {
    if (req.headers.origin !== 'https://bneineviimacademy.org' || req.headers['sec-fetch-site'] !== 'same-origin') throw problem('ORIGIN_DENIED', 403);
    res.json(await archive.restore({ table: req.body?.table, id: req.body?.id, migrationId: MIGRATION }));
  }));
}
module.exports = { assertBnaOwner, registerBnaInterestOwnerRoutes };
