const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const migration = fs.readFileSync('railway-migration-2026-06-23-service-provider-studio.sql', 'utf8');

function studioServerBlock() {
  const start = server.indexOf("app.get('/api/bna/studio/dashboard'");
  const end = server.indexOf('// BNA dashboard: content repurposing pipeline', start);
  assert.ok(start > -1, 'Studio API block should start at dashboard route');
  assert.ok(end > start, 'Studio API block should end before Content pipeline block');
  return server.slice(start, end);
}

test('Service Provider Studio schema is idempotent and covers the complete workflow', () => {
  [
    'bna_studio_projects',
    'bna_studio_sources',
    'bna_studio_scenes',
    'bna_studio_scene_versions',
    'bna_studio_prompt_layers',
    'bna_studio_revision_patches',
    'bna_studio_jobs',
    'bna_studio_assets',
    'bna_studio_exports',
    'bna_studio_usage_events',
    'bna_studio_price_catalog',
    'bna_studio_workspace_settings',
  ].forEach((table) => {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  });
  assert.match(migration, /ON CONFLICT \(provider, model\) DO UPDATE SET/);
  assert.match(migration, /UNIQUE \(project_id, workspace_key\)/);
  assert.match(migration, /'jewish_guardrails'/);
  assert.match(migration, /allow_paid_generation BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.doesNotMatch(migration, /DROP TABLE/i);
});

test('Service Provider Studio API routes are registered and workspace scoped', () => {
  const block = studioServerBlock();
  [
    "app.get('/api/bna/studio/dashboard'",
    "app.get('/api/bna/studio/projects'",
    "app.post('/api/bna/studio/projects'",
    "app.get('/api/bna/studio/projects/:id'",
    "app.patch('/api/bna/studio/projects/:id'",
    "app.post('/api/bna/studio/projects/:id/source'",
    "app.post('/api/bna/studio/projects/:id/outline'",
    "app.post('/api/bna/studio/projects/:id/storyboard'",
    "app.post('/api/bna/studio/projects/:id/prompt-compile'",
    "app.get('/api/bna/studio/openart/status'",
    "app.post('/api/bna/studio/projects/:id/sidekick/patch-preview'",
    "app.post('/api/bna/studio/projects/:id/openart/export'",
    "app.post('/api/bna/studio/repair/plan'",
    "app.post('/api/bna/studio/projects/:id/corrections/preview'",
    "app.post('/api/bna/studio/projects/:id/corrections/apply'",
    "app.patch('/api/bna/studio/scenes/:id'",
    "app.post('/api/bna/studio/scenes/:id/regenerate'",
    "app.post('/api/bna/studio/projects/:id/render'",
    "app.post('/api/bna/studio/jobs/:id/retry'",
    "app.post('/api/bna/studio/jobs/:id/cancel'",
    "app.get('/api/bna/studio/usage'",
    "app.post('/api/bna/studio/projects/:id/handoff'",
  ].forEach((route) => assert.match(block, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.match(server, /if \(routePath === '\/api\/bna\/studio\/dashboard' && method === 'GET'\) return true/);
  assert.match(server, /if \(routePath === '\/api\/bna\/studio\/openart\/status' && method === 'GET'\) return true/);
  assert.match(server, /if \(routePath === '\/api\/bna\/studio\/repair\/plan' && method === 'POST'\) return true/);
  assert.ok(server.includes("if (/^\\/api\\/bna\\/studio\\/projects\\/\\d+\\/(?:source|outline|storyboard|prompt-compile|render|handoff)$/.test(routePath) && method === 'POST') return true;"));
  assert.ok(server.includes("if (/^\\/api\\/bna\\/studio\\/projects\\/\\d+\\/(?:sidekick\\/patch-preview|openart\\/export)$/.test(routePath) && method === 'POST') return true;"));
  assert.ok(server.includes("if (/^\\/api\\/bna\\/studio\\/jobs\\/\\d+\\/(?:retry|cancel)$/.test(routePath) && method === 'POST') return true;"));
  assert.match(server, /bna_studio_projects/);
  assert.match(server, /assertWorkspaceAccess\(req, row\.workspace_key, 'read Studio project'\)/);
  assert.match(server, /appendStudioScope\(req, conditions, params, 'sp'/);
  assert.match(server, /appendStudioScope\(req, budgetConditions, budgetParams, 'b'/);
});

test('Service Provider Studio API reuses Content handoff and avoids external writes', () => {
  const block = studioServerBlock();
  assert.match(block, /INSERT INTO bna_content_jobs/);
  assert.match(block, /INSERT INTO bna_content_outputs/);
  assert.match(block, /external_write_performed: false/);
  assert.match(block, /openArtMcpAdapter\.openArtMcpStatus\(\)/);
  assert.match(block, /studioSidekick\.draftStudioSidekickPatch/);
  assert.match(block, /studioSidekick\.buildOpenArtPromptExport/);
  assert.match(block, /no_publish BOOLEAN NOT NULL DEFAULT TRUE|no_publish/);
  assert.doesNotMatch(block, /GoHighLevel|LeadConnector|GHL|Buffer|fetch\(/i);
});
