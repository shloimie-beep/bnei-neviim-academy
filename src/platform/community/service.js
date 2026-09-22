const { contextScopeFields } = require('../core/context');
const { cleanString, normalizeKey, stableId } = require('../core/ids');
const { fail, ok } = require('../core/result');
const { assertWorkspaceIsolation, requirePermission } = require('../rbac');

function communityScope(context = {}, input = {}) {
  return {
    ...contextScopeFields(context),
    instance_id: cleanString(input.instance_id || input.instanceId || context.instance?.id),
    workspace_id: cleanString(input.workspace_id || input.workspaceId || context.workspace?.id),
    workspace_key: cleanString(input.workspace_key || input.workspaceKey || context.workspace?.key),
  };
}

function createCommunity(context = {}, input = {}) {
  const scope = communityScope(context, input);
  const permission = requirePermission(context, 'community:create', scope);
  if (!permission.ok) return permission;
  const title = cleanString(input.title || input.name);
  if (!title) return fail('missing_community_title', 'Community title is required', {}, 400);
  const key = normalizeKey(input.key || input.community_key || title);
  return ok({
    id: cleanString(input.id || stableId('COMMUNITY', [scope.workspace_id, key])),
    ...scope,
    community_key: key,
    title,
    description: cleanString(input.description),
    visibility: normalizeKey(input.visibility || 'workspace') || 'workspace',
    status: normalizeKey(input.status || 'active') || 'active',
    moderation_state: normalizeKey(input.moderation_state || 'moderated') || 'moderated',
    provenance: input.provenance || {},
    metadata: input.metadata || {},
  });
}

function createCommunityGroup(context = {}, community = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, community);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'community:create', community);
  if (!permission.ok) return permission;
  const label = cleanString(input.label || input.title || input.name);
  if (!label) return fail('missing_group_label', 'Community group label is required', {}, 400);
  const key = normalizeKey(input.key || input.group_key || label);
  return ok({
    id: cleanString(input.id || stableId('COMMUNITYGROUP', [community.id, key])),
    community_id: community.id,
    ...communityScope(context, community),
    group_key: key,
    label,
    channel_type: normalizeKey(input.channel_type || 'discussion') || 'discussion',
    visibility: normalizeKey(input.visibility || community.visibility || 'workspace') || 'workspace',
    status: normalizeKey(input.status || 'active') || 'active',
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 100,
    metadata: input.metadata || {},
  });
}

function createCommunityPost(context = {}, group = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, group);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'community:comment', group);
  if (!permission.ok) return permission;
  const body = cleanString(input.body || input.message || input.content);
  if (!body) return fail('missing_post_body', 'Post body is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('COMMUNITYPOST', [group.id, body, input.author_person_id || context.actor?.id])),
    community_id: group.community_id,
    group_id: group.id,
    ...communityScope(context, group),
    title: cleanString(input.title),
    body,
    author_person_id: cleanString(input.author_person_id || context.actor?.person_id || context.actor?.id),
    visibility: normalizeKey(input.visibility || group.visibility || 'workspace') || 'workspace',
    moderation_status: normalizeKey(input.moderation_status || 'needs_review') || 'needs_review',
    status: normalizeKey(input.status || 'active') || 'active',
    provenance: input.provenance || {},
    metadata: input.metadata || {},
  });
}

function pinCommunityResource(context = {}, community = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, community);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'community:create', community);
  if (!permission.ok) return permission;
  const title = cleanString(input.title);
  const url = cleanString(input.url || input.href);
  if (!title || !url) return fail('missing_resource', 'Pinned resource title and url are required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('COMMUNITYRESOURCE', [community.id, title, url])),
    community_id: community.id,
    ...communityScope(context, community),
    title,
    url,
    resource_type: normalizeKey(input.resource_type || 'link') || 'link',
    visibility: normalizeKey(input.visibility || community.visibility || 'workspace') || 'workspace',
    status: normalizeKey(input.status || 'active') || 'active',
    pinned: input.pinned !== false,
    metadata: input.metadata || {},
  });
}

function visibleCommunityRecords(context = {}, records = []) {
  return (Array.isArray(records) ? records : []).filter((record) => assertWorkspaceIsolation(context, record).ok);
}

module.exports = {
  createCommunity,
  createCommunityGroup,
  createCommunityPost,
  pinCommunityResource,
  visibleCommunityRecords,
};
