const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const smokeScript = fs.readFileSync('scripts/smoke-owner-review-role-flows-local.mjs', 'utf8');
const visualScript = fs.readFileSync('scripts/smoke-owner-review-public-visual.mjs', 'utf8');
const publicIndex = fs.readFileSync('public/index.html', 'utf8');
const roleFlowDoc = fs.readFileSync('docs/owner-review/ROLE-FLOW-QA.md', 'utf8');
const roleFlowReport = JSON.parse(fs.readFileSync('ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/report.json', 'utf8'));
const visualReport = JSON.parse(fs.readFileSync('ops/playwright-smokes/2026-06-24-owner-review-public-visual/report.json', 'utf8'));
const requiredOwnerReviewDocs = [
  'docs/owner-review/APPLIED-NOT-APPLIED-MATRIX.md',
  'docs/owner-review/CANONICAL-SITEMAP.md',
  'docs/owner-review/PAGE-FLOW-DIAGRAMS.md',
  'docs/owner-review/ORPHAN-AND-DUPLICATE-PAGES.md',
  'docs/owner-review/ROLE-FLOW-QA.md',
  'docs/owner-review/UX-BACKLOG-RECONCILIATION.md',
  'docs/owner-review/KNOWN-GAPS.md',
  'docs/owner-review/OWNER-REVIEW-SCRIPT.md',
  'docs/owner-review/ROUTE-INVENTORY.csv',
  'docs/owner-review/NAVIGATION-GRAPH.md',
  'docs/owner-review/PUBLIC-VISUAL-AUDIT.md',
];

test('owner-review role-flow smoke is registered as a credential-free release gate', () => {
  assert.equal(
    packageJson.scripts['owner-review:role-flows'],
    'node scripts/smoke-owner-review-role-flows-local.mjs',
  );
  for (const roleId of [
    'public-visitor',
    'parent-one-child',
    'parent-multiple-children',
    'student',
    'provider-admin',
    'provider-participant',
    'one-time-member',
    'super-admin',
  ]) {
    assert.match(smokeScript, new RegExp(`id: '${roleId}'`));
  }
  assert.match(smokeScript, /external_credentials: false/);
  assert.match(smokeScript, /production_state_readback: false/);
  assert.match(smokeScript, /production_database_mutation: false/);
  assert.match(smokeScript, /external_send_publish_upload_charge_dns: false/);
});

test('public homepage exposes One Time and provider-directory primary navigation', () => {
  assert.match(publicIndex, /href="\/providers" class="nav-link" data-i18n="navProviderDirectory"/);
  assert.match(publicIndex, /href="\/one-time" class="nav-link" data-i18n="navOneTime"/);
  assert.match(publicIndex, /navProviderDirectory: "Service Provider Directory"/);
  assert.match(publicIndex, /navOneTime: "One Time"/);
});

test('homepage learning moment dots keep a mobile-size hit target', () => {
  assert.match(publicIndex, /\.media-dot\s*{[^}]*width: 32px;[^}]*height: 32px;/s);
  assert.match(publicIndex, /\.media-dot::after\s*{[^}]*width: 10px;[^}]*height: 10px;/s);
});

test('public homepage hero and active filters have computed visual gates', () => {
  assert.equal(
    packageJson.scripts['owner-review:visual'],
    'node scripts/smoke-owner-review-public-visual.mjs',
  );
  assert.match(visualScript, /Math\.abs\(gapPx\) <= 1/);
  assert.match(visualScript, /contrastRatio/);
  assert.match(visualScript, /ariaPressed === 'true'/);
  assert.match(publicIndex, /\.hero\s*{[^}]*margin-top: 0;/s);
  assert.match(publicIndex, /@media \(max-width: 767px\)[\s\S]*?\.hero\s*{[^}]*margin-top: 0;/);
  assert.match(publicIndex, /class="home-filter-chip\$\{category === activeHomeBlogCategory \? ' is-active' : ''\}"[\s\S]*?aria-pressed="\$\{category === activeHomeBlogCategory \? 'true' : 'false'\}"/);
  assert.match(publicIndex, /class="home-filter-chip\$\{topic === activeHomeFaqTopic \? ' is-active' : ''\}"[\s\S]*?aria-pressed="\$\{topic === activeHomeFaqTopic \? 'true' : 'false'\}"/);
  assert.equal(visualReport.summary.pr14_local_ok, true);
  for (const row of visualReport.rows.filter((item) => item.target === 'pr14-local')) {
    assert.equal(row.headerHeroGapOk, true, `${row.viewport} header/hero gap should pass`);
    assert.equal(row.activeTabContrastOk, true, `${row.viewport} active tab contrast should pass`);
    assert.equal(row.activeTabSemanticsOk, true, `${row.viewport} active tab semantics should pass`);
  }
});

test('latest owner-review role-flow evidence is green for all primary journeys', () => {
  assert.equal(roleFlowReport.summary.ok, true);
  assert.equal(roleFlowReport.role_runs.length, 16);
  assert.equal(roleFlowReport.access_runs.length, 2);
  assert.equal(roleFlowReport.failure_runs.length, 2);
  assert.match(roleFlowDoc, /Result: PASS/);
  for (const surface of ['public', 'parent_portal', 'student_portal', 'provider_workspace', 'one_time_member', 'operations']) {
    assert.match(roleFlowDoc, new RegExp(`\\| ${surface} \\|`));
  }
});

test('owner-review packet includes all requested top-level artifacts', () => {
  for (const docPath of requiredOwnerReviewDocs) {
    assert.equal(fs.existsSync(docPath), true, `${docPath} should exist`);
    assert.ok(fs.statSync(docPath).size > 100, `${docPath} should not be empty`);
  }
  assert.equal(fs.existsSync('tasks-pending/2026-06-24-integration-navigation-owner-review-closeout.md'), true);
  assert.equal(fs.existsSync('raw-input/RAW-20260624-001-integration-navigation-owner-review-closeout.md'), true);
  assert.equal(fs.existsSync('tasks-pending/2026-06-24-full-system-reality-audit-and-unblocked-implementation-pass.md'), true);
  assert.equal(fs.existsSync('raw-input/RAW-20260624-002-full-system-reality-audit-and-unblocked-implementation-pass.md'), true);
});
