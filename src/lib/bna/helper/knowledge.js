const { redactValue } = require('./redaction');
const { resolveHelperScope } = require('./scope');

const VISIBILITY_VALUES = new Set(['internal', 'admin', 'provider', 'parent', 'student', 'public']);

function compactText(value = '', maxLength = 1000) {
  return String(value || '').replace(/\r/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function safeObject(value = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeVisibility(value = '', scopeType = 'admin') {
  const normalized = compactText(value || '', 80).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (VISIBILITY_VALUES.has(normalized)) return normalized;
  if (scopeType === 'student') return 'student';
  if (scopeType === 'parent' || scopeType === 'family') return 'parent';
  if (scopeType === 'provider' || scopeType === 'rabbi') return 'provider';
  return 'internal';
}

function knowledgeItemView(row = {}) {
  return {
    id: row.id,
    workspace_id: row.workspace_id || null,
    scope_type: row.scope_type || null,
    scope_id: row.scope_id || null,
    title: row.title || '',
    body: row.body || '',
    source_type: row.source_type || null,
    source_ref: row.source_ref || null,
    visibility: row.visibility || 'internal',
    metadata: typeof row.metadata === 'string' ? safeParse(row.metadata, {}) : row.metadata || {},
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function listHelperKnowledge(db, context = {}, options = {}) {
  const scope = resolveHelperScope(context);
  const limit = Math.max(1, Math.min(Number(options.limit || 50), 100));
  const params = [scope.scopeType, scope.scopeId, limit];
  const result = await db.query(
    `SELECT *
     FROM bna_helper_knowledge_items
     WHERE scope_type = $1 AND scope_id = $2
     ORDER BY updated_at DESC, id DESC
     LIMIT $3`,
    params
  );
  return {
    scope,
    knowledge: result.rows.map(knowledgeItemView),
  };
}

async function createHelperKnowledgeItem(db, context = {}, payload = {}) {
  const scope = resolveHelperScope(context);
  const title = compactText(payload.title, 240);
  if (!title) {
    const error = new Error('title is required');
    error.code = 'schema_validation_failed';
    error.statusCode = 400;
    throw error;
  }
  const result = await db.query(
    `INSERT INTO bna_helper_knowledge_items (
       workspace_id, scope_type, scope_id, title, body, source_type, source_ref,
       visibility, metadata
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     RETURNING *`,
    [
      payload.workspace_id || payload.workspaceId || null,
      scope.scopeType,
      scope.scopeId,
      title,
      compactText(payload.body, 20000),
      compactText(payload.source_type || payload.sourceType || 'manual', 80),
      compactText(payload.source_ref || payload.sourceRef || '', 500) || null,
      normalizeVisibility(payload.visibility, scope.scopeType),
      JSON.stringify(redactValue({
        source: 'bna_helper',
        created_by: context.userName || 'BNA Helper',
        ...safeObject(payload.metadata),
      })),
    ]
  );
  return {
    scope,
    knowledgeItem: knowledgeItemView(result.rows[0]),
  };
}

module.exports = {
  createHelperKnowledgeItem,
  knowledgeItemView,
  listHelperKnowledge,
  normalizeVisibility,
};
