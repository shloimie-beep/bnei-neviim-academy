const { contextScopeFields } = require('../core/context');
const { cleanString, normalizeKey, stableId } = require('../core/ids');
const { fail, ok } = require('../core/result');
const { assertWorkspaceIsolation, requirePermission } = require('../rbac');

const LINK_TARGET_TYPES = new Set([
  'task',
  'decision',
  'comment',
  'calendar_event',
  'source_intake',
  'agent_run',
]);

function buildDomainRecordLink(context = {}, input = {}) {
  const permission = requirePermission(context, 'domain:link', {
    instance_id: input.instance_id || context.instance?.id,
    workspace_id: input.workspace_id || context.workspace?.id,
  });
  if (!permission.ok) return permission;
  const isolation = assertWorkspaceIsolation(context, {
    instance_id: input.instance_id || context.instance?.id,
    workspace_id: input.workspace_id || context.workspace?.id,
  });
  if (!isolation.ok) return isolation;
  const sourceType = normalizeKey(input.source_type || input.sourceType);
  const sourceId = cleanString(input.source_id || input.sourceId);
  const targetType = normalizeKey(input.target_type || input.targetType);
  const targetId = cleanString(input.target_id || input.targetId);
  if (!sourceType || !sourceId || !targetType || !targetId) {
    return fail('missing_link_endpoint', 'source_type, source_id, target_type, and target_id are required', {}, 400);
  }
  if (!LINK_TARGET_TYPES.has(targetType)) {
    return fail('unsupported_link_target', `Unsupported link target ${targetType}`, { targetType }, 400);
  }
  return ok({
    id: cleanString(input.id || stableId('DOMAINLINK', [context.workspace?.id, sourceType, sourceId, targetType, targetId])),
    ...contextScopeFields(context),
    source_type: sourceType,
    source_id: sourceId,
    target_type: targetType,
    target_id: targetId,
    relationship: normalizeKey(input.relationship || 'related') || 'related',
    provenance: input.provenance || {},
    metadata: input.metadata || {},
  });
}

module.exports = {
  LINK_TARGET_TYPES,
  buildDomainRecordLink,
};
