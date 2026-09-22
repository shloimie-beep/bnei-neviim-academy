const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { buildToolRegistry } = require('../src/lib/bna/helper/tool-registry');
const { helperPermissionForTool } = require('../src/lib/bna/helper/permissions');

const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';

function oneTimeScopedContext() {
  return {
    userRole: 'one_time_admin',
    projectKey: ONE_TIME_PROJECT_KEY,
    workspaceKey: ONE_TIME_WORKSPACE_KEY,
    identity: {
      role: 'one_time_admin',
      scope: {
        type: 'project',
        projectKey: ONE_TIME_PROJECT_KEY,
        workspaceKey: ONE_TIME_WORKSPACE_KEY,
      },
    },
  };
}

test('One Time scoped helper denies cross-project and cross-workspace actions', () => {
  const registry = buildToolRegistry();
  const context = oneTimeScopedContext();

  assert.equal(
    helperPermissionForTool(registry.get('create_task'), context, {
      project_key: ONE_TIME_PROJECT_KEY,
      workspace_key: ONE_TIME_WORKSPACE_KEY,
    }).allowed,
    true
  );

  const projectDenied = helperPermissionForTool(registry.get('create_task'), context, {
    project_key: 'bna',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
  });
  assert.equal(projectDenied.allowed, false);
  assert.match(projectDenied.reason, /project scope mismatch/);

  const workspaceDenied = helperPermissionForTool(registry.get('create_task'), context, {
    project_key: ONE_TIME_PROJECT_KEY,
    workspace_key: 'bna',
  });
  assert.equal(workspaceDenied.allowed, false);
  assert.match(workspaceDenied.reason, /workspace scope mismatch/);
});

test('One Time scoped helper allows safe setup tasks but denies secret-bearing tools', () => {
  const registry = buildToolRegistry();
  const context = oneTimeScopedContext();

  for (const toolName of [
    'create_integration_setup_task',
    'create_dns_setup_task',
    'mark_manual_vimeo_upload_needed',
    'attach_vimeo_url_to_library_item',
  ]) {
    assert.equal(
      helperPermissionForTool(registry.get(toolName), context, {
        project_key: ONE_TIME_PROJECT_KEY,
        workspace_key: ONE_TIME_WORKSPACE_KEY,
      }).allowed,
      true,
      `${toolName} should remain available as a safe first-party setup action`
    );
  }

  for (const toolName of ['save_provider_api_key', 'rotate_provider_api_key', 'prepare_vimeo_upload']) {
    const permission = helperPermissionForTool(registry.get(toolName), context, {
      project_key: ONE_TIME_PROJECT_KEY,
      workspace_key: ONE_TIME_WORKSPACE_KEY,
    });
    assert.equal(permission.allowed, false, `${toolName} should be admin-only for scoped users`);
    assert.match(permission.reason, /permission_denied/);
  }

  assert.equal(
    helperPermissionForTool(registry.get('save_provider_api_key'), {
      userRole: 'admin',
      identity: { role: 'admin', scope: { type: 'all' } },
    }, {}).allowed,
    true
  );
});

test('One Time admin routes use workspace access checks instead of default BNA scope', () => {
  const server = fs.readFileSync('server.js', 'utf8');

  for (const [method, route] of [
    ['post', "/api/bna/project-meetings/one-time-drive-brief/preview"],
    ['get', "/api/bna/one-time/drive-social-ingestion"],
    ['get', "/api/bna/one-time/app-access-readiness"],
    ['get', "/api/bna/one-time/question-moderation"],
  ]) {
    const index = server.indexOf(`app.${method}('${route}'`);
    assert.ok(index >= 0, `${route} should exist as an Express ${method.toUpperCase()} route`);
    const block = server.slice(index, index + 2200);
    assert.match(block, /assertWorkspaceAccess\(req, 'rabbi_sheller_provider'\)/, `${route} should assert One Time workspace access`);
  }
});
