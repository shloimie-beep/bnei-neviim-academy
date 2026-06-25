const fs = require('node:fs');
const path = require('node:path');

const ISSUE_24_NAVIGATION_ID = 'REQ-20260625-029';
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const PORTAL_NAVIGATION_INVENTORY = [
  {
    surface: 'public',
    route: '/',
    side_nav: [],
    top_nav: ['Explore', 'Admissions', 'Parents', 'Service Providers', 'Portal Login'],
    horizontal_tabs: [],
    filter_chips: [],
    breadcrumbs: ['public page context only'],
    contextual_actions: ['Ask the helper', 'Apply', 'Portal Login'],
    mobile_menu: ['Explore', 'Admissions', 'Parents', 'Service Providers', 'Portal Login'],
  },
  {
    surface: 'operations',
    route: '/operations',
    side_nav: 'parsed_from_public_operations_html',
    top_nav: ['workspace status', 'Ask / Search', 'primary contextual action'],
    horizontal_tabs: 'parsed_from_public_operations_html',
    filter_chips: ['urgency', 'date', 'workspace', 'owner', 'type'],
    breadcrumbs: ['workspace / module / section'],
    contextual_actions: ['primary action by module', 'helper', 'settings/logout'],
    mobile_menu: 'same module list plus child-section drilldown',
  },
  {
    surface: 'provider',
    route: '/provider',
    side_nav: ['Dashboard', 'Program', 'Members', 'Content', 'Schedule', 'Communications', 'Tasks', 'Settings'],
    top_nav: ['provider workspace identity', 'assistant/help'],
    horizontal_tabs: ['children of Program, Schedule, Content, Communications, Settings'],
    filter_chips: ['status filters and scoped subcategories only'],
    breadcrumbs: ['provider workspace / module / section'],
    contextual_actions: ['support request', 'classroom draft', 'setup preview'],
    mobile_menu: ['same major modules as side nav'],
  },
  {
    surface: 'parent',
    route: '/parent',
    side_nav: ['Today', 'Goals', 'Calendar', 'Questions', 'Documents', 'Help'],
    top_nav: ['family/account switch', 'assistant/help'],
    horizontal_tabs: ['child views and status filters only'],
    filter_chips: ['student/date/status filters'],
    breadcrumbs: ['parent portal / current child / section'],
    contextual_actions: ['ask helper', 'report problem', 'request support'],
    mobile_menu: ['same major modules as side nav'],
  },
  {
    surface: 'student',
    route: '/student',
    side_nav: ['Today', 'Goals', 'Assignments', 'Calendar', 'Questions', 'Documents', 'Help'],
    top_nav: ['student identity', 'assistant/help'],
    horizontal_tabs: ['student-safe child sections only'],
    filter_chips: ['date/status filters'],
    breadcrumbs: ['student portal / section'],
    contextual_actions: ['ask helper', 'submit question', 'open assignment'],
    mobile_menu: ['same major modules as side nav'],
  },
  {
    surface: 'one_time_member',
    route: '/rabbi-member',
    side_nav: ['Library', 'Classroom', 'Questions', 'Support', 'Account'],
    top_nav: ['One Time member identity', 'assistant/help'],
    horizontal_tabs: ['library/classroom subcategories only'],
    filter_chips: ['topic/status filters'],
    breadcrumbs: ['One Time / member / section'],
    contextual_actions: ['ask Rabbi', 'support ticket'],
    mobile_menu: ['same major modules as side nav'],
  },
  {
    surface: 'one_time_classroom',
    route: '/one-time-classroom',
    side_nav: ['Classroom', 'Library', 'Questions', 'Support'],
    top_nav: ['classroom identity', 'assistant/help'],
    horizontal_tabs: ['class/session/material subcategories only'],
    filter_chips: ['seder/unit/status filters'],
    breadcrumbs: ['One Time / classroom / section'],
    contextual_actions: ['ask question', 'open material'],
    mobile_menu: ['same major modules as side nav'],
  },
];

function normalizeLabel(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readOperationsHtml(root = REPO_ROOT) {
  return fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
}

function extractConstBlock(text, constName, nextConstName) {
  const startNeedle = `const ${constName} = [`;
  const start = text.indexOf(startNeedle);
  if (start === -1) return '';
  const end = nextConstName ? text.indexOf(`const ${nextConstName}`, start) : text.indexOf('];', start) + 2;
  return text.slice(start, end === -1 ? start + 2000 : end);
}

function extractItems(block = []) {
  const items = [];
  const pattern = /\{\s*id:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'/g;
  let match;
  while ((match = pattern.exec(block))) {
    items.push({ id: match[1], label: match[2], normalized_label: normalizeLabel(match[2]) });
  }
  return items;
}

function operationsNavigationInventory(root = REPO_ROOT) {
  const html = readOperationsHtml(root);
  const main = extractItems(extractConstBlock(html, 'MAIN_NAV_ITEMS', 'AGENT_RUN_TABS'));
  const task = extractItems(extractConstBlock(html, 'TASK_SUBTABS', 'AUTOMATION_SUBTABS'));
  const agents = extractItems(extractConstBlock(html, 'AGENT_RUN_TABS', 'DASHBOARD_SUBTABS'));
  return {
    main_nav: main,
    horizontal_tabs: {
      tasks: task,
      agents,
    },
  };
}

function duplicateSameLevel(items = [], level = '') {
  const seen = new Map();
  const findings = [];
  for (const item of items) {
    const key = item.normalized_label || normalizeLabel(item.label);
    if (!key) continue;
    if (seen.has(key)) {
      findings.push({
        type: 'duplicate_label_same_level',
        level,
        label: item.label,
        first_id: seen.get(key).id,
        duplicate_id: item.id,
      });
    } else {
      seen.set(key, item);
    }
  }
  return findings;
}

function duplicateSideHorizontal(operations) {
  const mainLabels = new Map(operations.main_nav.map((item) => [item.normalized_label, item]));
  const findings = [];
  for (const [module, tabs] of Object.entries(operations.horizontal_tabs || {})) {
    for (const tab of tabs) {
      const major = mainLabels.get(tab.normalized_label);
      if (!major) continue;
      findings.push({
        type: 'major_module_repeated_as_horizontal_tab',
        module,
        label: tab.label,
        main_nav_id: major.id,
        tab_id: tab.id,
      });
    }
  }
  return findings;
}

function auditPortalInventory() {
  const findings = [];
  for (const surface of PORTAL_NAVIGATION_INVENTORY) {
    const side = Array.isArray(surface.side_nav) ? surface.side_nav.map((label, index) => ({ id: `${surface.surface}-side-${index}`, label, normalized_label: normalizeLabel(label) })) : [];
    const mobile = Array.isArray(surface.mobile_menu) ? surface.mobile_menu.map((label, index) => ({ id: `${surface.surface}-mobile-${index}`, label, normalized_label: normalizeLabel(label) })) : [];
    findings.push(...duplicateSameLevel(side, `${surface.surface}:side_nav`));
    findings.push(...duplicateSameLevel(mobile, `${surface.surface}:mobile_menu`));
  }
  return findings;
}

function buildNavigationIaAudit({ root = REPO_ROOT } = {}) {
  const operations = operationsNavigationInventory(root);
  const findings = [
    ...duplicateSameLevel(operations.main_nav, 'operations:main_nav'),
    ...duplicateSameLevel(operations.horizontal_tabs.tasks, 'operations:tasks_horizontal_tabs'),
    ...duplicateSameLevel(operations.horizontal_tabs.agents, 'operations:agents_horizontal_tabs'),
    ...duplicateSideHorizontal(operations),
    ...auditPortalInventory(),
  ];
  return {
    audit_id: ISSUE_24_NAVIGATION_ID,
    generated_at: new Date().toISOString(),
    source_raw_id: 'RAW-20260625-024',
    parent_goal_id: 'PARENT-20260625-024',
    permanent_rule: 'Side navigation owns major modules. Horizontal tabs may contain only children, view modes, status filters, scoped subcategories, or record-specific sections.',
    inventory: PORTAL_NAVIGATION_INVENTORY,
    operations,
    fixes_implemented: [
      'Operations Tasks child lane label changed from Calendar to Schedule so it no longer repeats the side-nav Calendar module.',
      'Operations Tasks child lane label changed from Codex / Agent Work to Codex Queue so it no longer competes with the side-nav Agents module.',
      'Static watchdog added to fail on same-level duplicate labels and major modules repeated as horizontal tabs.',
    ],
    findings,
    ok: findings.length === 0,
  };
}

module.exports = {
  ISSUE_24_NAVIGATION_ID,
  PORTAL_NAVIGATION_INVENTORY,
  buildNavigationIaAudit,
  duplicateSideHorizontal,
  operationsNavigationInventory,
};
