const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_RABBI_DASHBOARD_ACCEPTANCE_ROUTES,
  ONE_TIME_RABBI_DASHBOARD_IA,
  ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES,
  ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES,
  ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES,
  ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY,
  ONE_TIME_RABBI_DASHBOARD_REVIEW_LINKS,
  ONE_TIME_RABBI_DASHBOARD_SECTION_SUBSECTION_MAP,
  ONE_TIME_RABBI_DASHBOARD_STATUS_CHIP_MODEL,
  ONE_TIME_RABBI_DASHBOARD_TOP_RAIL_MODEL,
  ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY,
} = require('../src/platform/instances/one-time-rabbi-dashboard-ia');

const expectedMainModules = [
  ['overview_package_status', 'Overview / Package Status'],
  ['members_crm', 'Members / CRM'],
  ['classes_content', 'Classes & Content'],
  ['communications', 'Communications'],
  ['automations', 'Automations'],
  ['payments_access', 'Payments & Access'],
  ['tasks_decisions', 'Tasks & Decisions'],
  ['settings_setup', 'Settings / Setup'],
];

const expectedRoutes = [
  '/one-time',
  '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
  '/provider.html?review=one-time',
  '/parent.html?review=one-time',
  '/student.html?review=one-time',
  '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
  '/one-time-email-review.html',
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertClientReadable(label, context) {
  assert.equal(typeof label, 'string', `${context} label should be a string`);
  assert.equal(label.trim(), label, `${context} label should not need trimming`);
  assert.match(label, /[A-Za-z]/, `${context} label should contain readable text`);
  assert.doesNotMatch(label, /_/, `${context} label should not expose implementation keys`);
  assert.doesNotMatch(label, /tasks-pending|requirement register|raw implementation|internal dialogue|watchdog|pipeline|api usage|agents/i, `${context} label should not expose internal support concepts`);
}

test('One Time Rabbi dashboard IA exposes only approved main modules', () => {
  assert.deepEqual(
    ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES.map((module) => [module.id, module.label]),
    expectedMainModules,
  );

  const approvedIds = new Set(expectedMainModules.map(([id]) => id));
  const internalIds = new Set([
    ...ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.demoted.map((module) => module.id),
    ...ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.hidden.map((module) => module.id),
  ]);

  for (const module of ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES) {
    assert.ok(approvedIds.has(module.id), `${module.id} should be an approved main module`);
    assert.equal(internalIds.has(module.id), false, `${module.id} should not be internal support`);
    assertClientReadable(module.label, module.id);
    assertClientReadable(module.short_label, `${module.id} short`);
  }
});

test('internal support modules are hidden or demoted behind Platform Support', () => {
  assert.equal(ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.platform_support_label, 'Platform Support');

  const demotedIds = ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.demoted.map((module) => module.id);
  assert.deepEqual(demotedIds, ['agents', 'api_usage', 'watchdog', 'pipelines', 'internal_dialogue']);
  for (const module of ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.demoted) {
    assert.equal(module.visibility, 'platform_support_demoted');
    assert.equal(module.surface, 'platform_support');
  }

  const hiddenIds = ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.hidden.map((module) => module.id);
  assert.deepEqual(hiddenIds, ['raw_implementation_handoffs', 'tasks_pending_requirement_registers']);
  for (const module of ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES.hidden) {
    assert.equal(module.visibility, 'hidden_from_rabbi_dashboard');
  }
});

test('review links and acceptance routes match the route map', () => {
  const routeMap = fs.readFileSync('ops/one-time-mishnah/operator-ui-review/ROUTE-MAP.md', 'utf8');

  assert.deepEqual(ONE_TIME_RABBI_DASHBOARD_ACCEPTANCE_ROUTES.map((route) => route.route), expectedRoutes);
  assert.deepEqual(Object.values(ONE_TIME_RABBI_DASHBOARD_REVIEW_LINKS).map((link) => link.route), expectedRoutes);

  for (const route of ONE_TIME_RABBI_DASHBOARD_ACCEPTANCE_ROUTES) {
    assert.match(routeMap, new RegExp(escapeRegExp(`https://bneineviimacademy.org${route.route}`)), `${route.route} should be in ROUTE-MAP.md`);
    assert.equal(route.external_write_performed, false);
  }
});

test('section labels, top rails, status chips, and mobile labels are client-readable', () => {
  const moduleIds = ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES.map((module) => module.id);
  assert.deepEqual(Object.keys(ONE_TIME_RABBI_DASHBOARD_SECTION_SUBSECTION_MAP), moduleIds);
  assert.deepEqual(Object.keys(ONE_TIME_RABBI_DASHBOARD_TOP_RAIL_MODEL), moduleIds);

  for (const module of ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES) {
    const sectionMap = ONE_TIME_RABBI_DASHBOARD_SECTION_SUBSECTION_MAP[module.id];
    const topRail = ONE_TIME_RABBI_DASHBOARD_TOP_RAIL_MODEL[module.id];
    assert.equal(topRail.module_id, module.id);
    assert.equal(topRail.default_item, module.default_section);
    assert.ok(topRail.items.some((item) => item.id === module.default_section), `${module.id} should include its default rail item`);
    assertClientReadable(sectionMap.label, `${module.id} section label`);

    for (const section of sectionMap.subsections) {
      assertClientReadable(section.label, `${module.id}.${section.id}`);
      assert.ok(section.source_view, `${section.id} should map to a source view`);
      assert.ok(section.source_section, `${section.id} should map to a source section`);
    }
    for (const item of topRail.items) {
      assertClientReadable(item.label, `${module.id}.${item.id} top rail`);
    }
  }

  assert.deepEqual(
    ONE_TIME_RABBI_DASHBOARD_STATUS_CHIP_MODEL.map((chip) => chip.label),
    ['Review mode', 'No-send', 'No-charge', 'No external write'],
  );
  for (const chip of ONE_TIME_RABBI_DASHBOARD_STATUS_CHIP_MODEL) {
    assertClientReadable(chip.label, `${chip.id} status chip`);
    assertClientReadable(chip.short_label, `${chip.id} short status chip`);
  }

  assert.equal(ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES.breakpoint_px, 430);
  assert.equal(ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES.prefer_short_labels, true);
  for (const label of Object.values(ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES.module_short_labels)) {
    assertClientReadable(label, 'mobile module label');
    assert.ok(label.length <= ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES.max_tab_label_chars);
  }
});

test('workspace and project keys stay scoped to Rabbi Scheller One Time', () => {
  const brand = JSON.parse(fs.readFileSync('config/brands/one-time.json', 'utf8'));
  const site = JSON.parse(fs.readFileSync('config/service-provider-sites/one-time.json', 'utf8'));

  assert.equal(ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY, 'rabbi_sheller_provider');
  assert.equal(ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY, 'one_time_mishnah_class');
  assert.equal(ONE_TIME_RABBI_DASHBOARD_IA.workspace_key, ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY);
  assert.equal(ONE_TIME_RABBI_DASHBOARD_IA.project_key, ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY);
  assert.equal(brand.workspace_key, ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY);
  assert.equal(brand.project_key, ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY);
  assert.equal(site.workspace_key, ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY);
  assert.equal(site.project_key, ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY);
});

test('acceptance routes do not mix public and private scope', () => {
  const serialized = JSON.stringify(ONE_TIME_RABBI_DASHBOARD_IA);
  assert.doesNotMatch(serialized, /workspace=bna|project=bna|dratler_family|family_legacy/i);

  for (const route of ONE_TIME_RABBI_DASHBOARD_ACCEPTANCE_ROUTES) {
    assert.equal(route.workspace_key, ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY);
    assert.equal(route.project_key, ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY);
    assert.equal(route.public_customer_surface && route.exposes_private_operations, false, `${route.route} mixes public and private flags`);

    if (route.public_customer_surface) {
      assert.equal(route.route, '/one-time');
      assert.equal(route.access, 'public_review');
      assert.equal(route.exposes_private_operations, false);
    }

    if (route.exposes_private_operations) {
      assert.equal(route.route, expectedRoutes[1]);
      assert.equal(route.access, 'operations_auth_required');
      assert.match(route.route, /workspace=rabbi_sheller_provider/);
      assert.match(route.route, /project=one_time_mishnah_class/);
    }
  }
});
