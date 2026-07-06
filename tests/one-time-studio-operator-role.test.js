'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const roleModel = fs.readFileSync('src/lib/bna/one-time-role-model.js', 'utf8');
const actionRegistry = fs.readFileSync('ops/action-registry.json', 'utf8');
const routeRegistry = fs.readFileSync('ops/route-registry.json', 'utf8');

test('One Time AI Studio operator login is environment-backed and limited to Studio plus Tasks', () => {
  assert.match(server, /ONE_TIME_STUDIO_OPERATOR_USERNAME/);
  assert.match(server, /ONE_TIME_AI_STUDIO_USERNAME/);
  assert.match(server, /ONE_TIME_STUDIO_OPERATOR_PASSWORD/);
  assert.match(server, /role: 'one_time_ai_studio_operator'/);
  assert.match(server, /const studioOperatorAllowedViews = oneTimeAllowedViewsForRole\('one_time_ai_studio_operator'\)/);
  assert.match(server, /access_matrix: oneTimeRoleAccessMatrix\('one_time_ai_studio_operator'\)/);
  assert.match(server, /displayName: 'AI Studio Operator'/);
  assert.doesNotMatch(server, /ONE_TIME_STUDIO_OPERATOR_PASSWORD\s*=\s*['"][^'"]+['"]/);
});

test('One Time AI Video Worker login is environment-backed and limited to Studio plus Tasks', () => {
  assert.match(server, /ONE_TIME_AI_VIDEO_WORKER_USERNAME/);
  assert.match(server, /ONE_TIME_VIDEO_WORKER_USERNAME/);
  assert.match(server, /ONE_TIME_STUDIO_VIDEO_WORKER_USERNAME/);
  assert.match(server, /ONE_TIME_AI_VIDEO_WORKER_PASSWORD/);
  assert.match(server, /role: 'one_time_ai_video_worker'/);
  assert.match(server, /const aiVideoWorkerAllowedViews = oneTimeAllowedViewsForRole\('one_time_ai_video_worker'\)/);
  assert.match(server, /access_matrix: oneTimeRoleAccessMatrix\('one_time_ai_video_worker'\)/);
  assert.match(server, /displayName: 'AI Video Worker'/);
  assert.doesNotMatch(server, /ONE_TIME_AI_VIDEO_WORKER_PASSWORD\s*=\s*['"][^'"]+['"]/);
});

test('One Time AI Studio operator route guard denies broad Operations surfaces', () => {
  const guardStart = server.indexOf('function isOneTimeStudioOperatorPathAllowed');
  assert.ok(guardStart > -1, 'studio operator route guard should exist');
  const guardBlock = server.slice(guardStart, server.indexOf('function isScopedOpsPathAllowed', guardStart));

  [
    "/api/bna/studio/dashboard",
    "/api/bna/studio/openart/status",
    "/api/bna/studio/repair/plan",
    "/api/bna/tasks",
    "/api/bna/projects",
    "/api/bna/assistant/scope-plan",
  ].forEach((route) => assert.match(guardBlock, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    "/api/bna/crm/contacts",
    "/api/bna/payments",
    "/api/bna/rabbi/members",
    "/api/bna/contact-communications",
    "/api/bna/helper/execute",
    "/api/bna/workspace-users",
    "/api/bna/connector-settings",
  ].forEach((route) => assert.doesNotMatch(guardBlock, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  assert.match(server, /identity\?\.role === 'one_time_ai_studio_operator'/);
  assert.match(server, /return isOneTimeStudioOperatorPathAllowed\(routePath, method\)/);
});

test('One Time AI Video Worker route guard allows Studio workflow but denies broad Operations surfaces', () => {
  const guardStart = server.indexOf('function isOneTimeAiVideoWorkerPathAllowed');
  assert.ok(guardStart > -1, 'AI video worker route guard should exist');
  const guardBlock = server.slice(guardStart, server.indexOf('function isScopedOpsPathAllowed', guardStart));

  [
    "/api/bna/studio/dashboard",
    "/api/bna/studio/openart/status",
    "/api/bna/studio/projects",
    "/api/bna/studio/repair/plan",
    "/api/bna/tasks",
    "/api/bna/projects",
    "/api/bna/workspace-directory",
  ].forEach((route) => assert.match(guardBlock, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  assert.match(guardBlock, /ai-video-worker\\\/handoff/);
  assert.match(guardBlock, /source\|outline\|storyboard\|prompt-compile\|render/);
  assert.match(guardBlock, /sidekick\\\/patch-preview\|openart\\\/export/);

  [
    "/api/bna/assistant/scope-plan",
    "/api/bna/agent-fleet/status",
    "/api/bna/ops/queue-health",
    "/api/bna/task-artifact",
    "/api/bna/crm/contacts",
    "/api/bna/payments",
    "/api/bna/rabbi/members",
    "/api/bna/contact-communications",
    "/api/bna/helper/execute",
    "/api/bna/workspace-users",
    "/api/bna/connector-settings",
  ].forEach((route) => assert.doesNotMatch(guardBlock, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  assert.doesNotMatch(guardBlock, /\(\?:source\|outline\|storyboard\|prompt-compile\|render\|handoff\)/);
  assert.match(server, /identity\?\.role === 'one_time_ai_video_worker'/);
  assert.match(server, /return isOneTimeAiVideoWorkerPathAllowed\(routePath, method\)/);
});

test('One Time role model labels AI Studio Operator without granting admin capabilities', () => {
  assert.match(roleModel, /AI_STUDIO_OPERATOR: 'ai_studio_operator'/);
  assert.match(roleModel, /one_time_ai_studio_operator: ONE_TIME_CANONICAL_ROLES\.AI_STUDIO_OPERATOR/);
  assert.match(roleModel, /one-time-ai-studio-operator-v1/);
  assert.match(roleModel, /\[ONE_TIME_CANONICAL_ROLES\.AI_STUDIO_OPERATOR\]: new Set\(\[\]\)/);
});

test('One Time role model labels AI Video Worker with local Studio workflow access only', () => {
  assert.match(roleModel, /AI_VIDEO_WORKER: 'ai_video_worker'/);
  assert.match(roleModel, /one_time_ai_video_worker: ONE_TIME_CANONICAL_ROLES\.AI_VIDEO_WORKER/);
  assert.match(roleModel, /one-time-ai-video-worker-v1/);
  assert.match(roleModel, /allowed_views: Object\.freeze\(\['studio', 'tasks'\]\)/);
  assert.match(roleModel, /create_ai_video_worker_handoff/);
  assert.match(roleModel, /external_sends_publishes_uploads/);
  assert.match(roleModel, /raw_shell_codex_deploy/);
  assert.match(roleModel, /\[ONE_TIME_CANONICAL_ROLES\.AI_VIDEO_WORKER\]: new Set\(\[\]\)/);
});

test('One Time AI Video Worker is reflected in route and action registries without Content handoff access', () => {
  assert.match(routeRegistry, /"route": "\/operations\?view=tasks"[\s\S]*"required_role": "super_admin_or_scoped_one_time_task_role"/);
  assert.match(routeRegistry, /"route": "\/api\/bna\/tasks"[\s\S]*"required_role": "super_admin_or_scoped_one_time_task_role"/);
  assert.match(routeRegistry, /"route": "\/api\/bna\/studio\/projects\/:id\/ai-video-worker\/handoff"[\s\S]*one_time_ai_video_worker/);
  assert.match(routeRegistry, /"route": "\/api\/bna\/studio\/projects\/:id\/handoff"[\s\S]*"required_role": "super_admin_or_provider_workspace_admin"/);
  assert.doesNotMatch(routeRegistry, /"route": "\/api\/bna\/studio\/projects\/:id\/handoff"[\s\S]{0,220}one_time_ai_video_worker/);

  assert.match(actionRegistry, /"action_id": "ACTION-STUDIO-AI-VIDEO-WORKER-HANDOFF"[\s\S]*one_time_ai_video_worker/);
  assert.match(actionRegistry, /"action_id": "ACTION-ONETIME-TASK-MANAGER-LIST"[\s\S]*super_admin_or_scoped_one_time_task_role/);
  assert.match(actionRegistry, /"action_id": "ACTION-ONETIME-TASK-MANAGER-COMMENT"[\s\S]*super_admin_or_scoped_one_time_task_role/);
  assert.doesNotMatch(actionRegistry, /"action_id": "ACTION-STUDIO-HANDOFF-CONTENT"[\s\S]{0,260}one_time_ai_video_worker/);
});
