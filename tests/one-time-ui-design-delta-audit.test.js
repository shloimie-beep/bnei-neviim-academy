const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('One Time UI design delta audit is no-write and covers required surfaces', async () => {
  const {
    REQUIRED_SURFACES,
    buildOneTimeUiDesignDeltaAudit,
    renderMarkdown,
  } = await import('../scripts/one-time-ui-design-delta-audit.mjs');

  const audit = buildOneTimeUiDesignDeltaAudit({ write: false });
  assert.equal(audit.requirement_id, 'REQ-20260619-304');
  assert.equal(audit.external_write_performed, false);
  assert.equal(audit.production_mutation_performed, false);
  assert.equal(audit.authenticated_crawl_performed, false);
  assert.equal(audit.broad_crawl_performed, false);
  assert.equal(audit.next_requirement, 'REQ-20260619-305');
  assert.equal(audit.required_surfaces.length, REQUIRED_SURFACES.length);
  assert.ok(audit.required_surfaces.some((surface) => surface.id === 'agents' && surface.status === 'pass'));
  assert.ok(audit.required_surfaces.some((surface) => surface.id === 'classroom' && surface.status === 'pass'));
  assert.ok(audit.checks.some((check) => check.id === 'top_toolbar_contract' && check.status === 'pass'));
  assert.ok(audit.checks.some((check) => check.id === 'module_toolbar_mobile_scroll' && check.status === 'pass'));
  assert.ok(audit.checks.some((check) => check.id === 'single_top_filter_rail_render' && check.status === 'pass'));
  assert.ok(audit.checks.some((check) => check.id === 'topbar_status_single_scroll_row' && check.status === 'pass'));
  assert.ok(audit.checks.some((check) => check.id === 'ops_audit_storage_state'));
  assert.equal(audit.status, 'pass');

  const md = renderMarkdown(audit);
  assert.match(md, /Credential-free current-state delta audit/i);
  assert.match(md, /External write performed: no/);
  assert.match(md, /Full authenticated crawl performed: no/);
});

test('One Time UI design delta audit writes markdown and json evidence', async () => {
  const { buildOneTimeUiDesignDeltaAudit } = await import('../scripts/one-time-ui-design-delta-audit.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'one-time-ui-audit-'));
  const audit = buildOneTimeUiDesignDeltaAudit({ outputDir: dir, write: true });

  const jsonPath = path.join(dir, 'audit.json');
  const mdPath = path.join(dir, 'audit.md');
  assert.equal(fs.existsSync(jsonPath), true);
  assert.equal(fs.existsSync(mdPath), true);
  assert.equal(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).requirement_id, audit.requirement_id);
  assert.match(fs.readFileSync(mdPath, 'utf8'), /One Time UI Design Delta Audit/);
});
