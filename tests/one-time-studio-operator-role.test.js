'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const roleModel = fs.readFileSync('src/lib/bna/one-time-role-model.js', 'utf8');

test('One Time AI Studio operator login is environment-backed and limited to Studio plus Tasks', () => {
  assert.match(server, /ONE_TIME_STUDIO_OPERATOR_USERNAME/);
  assert.match(server, /ONE_TIME_AI_STUDIO_USERNAME/);
  assert.match(server, /ONE_TIME_STUDIO_OPERATOR_PASSWORD/);
  assert.match(server, /role: 'one_time_ai_studio_operator'/);
  assert.match(server, /const studioOperatorAllowedViews = \['studio', 'tasks'\]/);
  assert.match(server, /displayName: 'AI Studio Operator'/);
  assert.doesNotMatch(server, /ONE_TIME_STUDIO_OPERATOR_PASSWORD\s*=\s*['"][^'"]+['"]/);
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

test('One Time role model labels AI Studio Operator without granting admin capabilities', () => {
  assert.match(roleModel, /AI_STUDIO_OPERATOR: 'ai_studio_operator'/);
  assert.match(roleModel, /one_time_ai_studio_operator: ONE_TIME_CANONICAL_ROLES\.AI_STUDIO_OPERATOR/);
  assert.match(roleModel, /one-time-ai-studio-operator-v1/);
  assert.match(roleModel, /\[ONE_TIME_CANONICAL_ROLES\.AI_STUDIO_OPERATOR\]: new Set\(\[\]\)/);
});
