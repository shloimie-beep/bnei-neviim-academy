import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const operationsPath = path.join(repoRoot, 'public', 'operations.html');
const reportDir = path.join(repoRoot, 'ops', 'watchdog-audits');
const operations = fs.readFileSync(operationsPath, 'utf8');

function functionSlice(name) {
  const start = operations.indexOf(`function ${name}`);
  if (start === -1) return '';
  const next = operations.indexOf('\n        function ', start + 1);
  return next === -1 ? operations.slice(start) : operations.slice(start, next);
}

function constSlice(name) {
  const match = operations.match(new RegExp(`const ${name} = \\[[\\s\\S]*?\\];`));
  return match ? match[0] : '';
}

const checks = [];

function addCheck(id, pass, evidence, expected) {
  checks.push({
    id,
    status: pass ? 'pass' : 'fail',
    evidence,
    expected,
  });
}

const appShell = functionSlice('renderAppShell');
const sidebar = functionSlice('renderSidebar');
const topbar = functionSlice('renderOpsTopbar');
const mobileHeader = functionSlice('renderMobileHeader');
const helperDock = functionSlice('renderBnaHelperDock');
const communicationTabs = constSlice('COMMUNICATIONS_SUBTABS');

addCheck(
  'shell_uses_contextual_subnav_and_filters',
  /renderOperationsSubnav\(\)/.test(appShell)
    && /renderOperationsFilterRow\(\)/.test(appShell)
    && !/renderModuleToolbar\(\)/.test(appShell),
  'renderAppShell renders renderOperationsSubnav() and renderOperationsFilterRow() without renderModuleToolbar().',
  'Left sidebar should stay primary modules; selected-module subnav and filters should live under the topbar.'
);

addCheck(
  'sidebar_is_primary_modules_only',
  /renderSidebarModuleList\(navItems\)/.test(sidebar) && !/renderSidebarSubnav\(\)/.test(sidebar),
  'renderSidebar calls renderSidebarModuleList(navItems) and does not call renderSidebarSubnav().',
  'Sidebar should not drill into module subcategories.'
);

const forbiddenTopbarPatterns = [
  /Ask \/ Search/,
  /data-bna-helper-open/,
  /renderOneTimeRabbiViewAction/,
  /operationsTopbarStatusChips/,
  /toLocaleDateString/,
  /All Operations \/ Super Admin/,
];

addCheck(
  'topbar_has_no_global_clutter',
  forbiddenTopbarPatterns.every(pattern => !pattern.test(topbar)),
  'renderOpsTopbar omits helper, date, role/workspace switch shortcut, and global status rail controls.',
  'Topbar should show identity/current section plus current-page primary action only.'
);

addCheck(
  'mobile_header_has_no_global_clutter',
  forbiddenTopbarPatterns.every(pattern => !pattern.test(mobileHeader)),
  'renderMobileHeader omits helper, date, role/workspace switch shortcut, and global status rail controls.',
  'Mobile header should stay compact and leave actions to subnav/filter/helper surfaces.'
);

addCheck(
  'helper_is_floating_launcher',
  /class="bna-helper-launcher"/.test(helperDock)
    && /data-action-id="ACTION-OPERATIONS-HELPER-OPEN"/.test(helperDock)
    && (operations.match(/data-bna-helper-open="true"/g) || []).length === 1,
  'renderBnaHelperDock owns the only data-bna-helper-open launcher.',
  'Helper should be bottom-right floating, not duplicated in topbar or mobile header.'
);

addCheck(
  'communications_tabs_are_message_lanes',
  ['overview', 'email', 'whatsapp', 'internal', 'bots', 'announcements', 'templates', 'support_threads']
    .every(id => communicationTabs.includes(`id: '${id}'`))
    && !['parents', 'students', 'providers', 'settings'].some(id => communicationTabs.includes(`id: '${id}'`)),
  'COMMUNICATIONS_SUBTABS contains message/channel lanes and excludes recipient/settings lanes.',
  'Communications subnav should be Email, WhatsApp, Internal, Bots, Announcements, Templates, and Support.'
);

addCheck(
  'tasks_use_compact_primary_lanes',
  /const TASK_PRIMARY_SUBTABS = \[/.test(operations)
    && /tasks: \{ tabs: TASK_PRIMARY_SUBTABS/.test(functionSlice('currentSubnavConfig'))
    && /function renderTaskCompactFilterRow/.test(operations)
    && /function taskIsCommunicationOnlyLog/.test(operations),
  'Task IA has primary subtab lanes, compact filters, and communication-only log suppression.',
  'Tasks should foreground Decisions, Pending, Agent Work, Tasks, and Done/Activity without communication log noise.'
);

addCheck(
  'communications_cards_are_sanitized_and_deduped',
  /function sanitizeCommunicationPreview/.test(operations)
    && /function uniqueCommunicationsForDisplay/.test(operations)
    && /function communicationAttachmentChips/.test(operations),
  'Communications renderer sanitizes previews, dedupes display rows, and shows attachment chips.',
  'Communications cards should not expose raw long URLs, scripts, or duplicate imported log rows.'
);

addCheck(
  'danger_zone_is_collapsed_under_advanced',
  /\.filter\(id => id !== 'danger'\)/.test(functionSlice('settingsCategoryChildren'))
    && /<summary>Danger Zone<\/summary>/.test(functionSlice('renderSettingsCategoryOverviewAddendum')),
  'Danger Zone is removed from normal settings child tabs and rendered as a collapsed Advanced details section.',
  'Danger Zone must not appear as a normal everyday settings tab.'
);

fs.mkdirSync(reportDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const jsonPath = path.join(reportDir, `${stamp}-navigation-ia-watchdog.json`);
const mdPath = path.join(reportDir, `${stamp}-navigation-ia-watchdog.md`);
const failures = checks.filter(check => check.status === 'fail');
const report = {
  generated_at: new Date().toISOString(),
  watchdog: 'navigation-ia',
  target: 'public/operations.html',
  status: failures.length ? 'fail' : 'pass',
  checks,
};

fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  mdPath,
  [
    '# Navigation IA Watchdog',
    '',
    `Generated: ${report.generated_at}`,
    `Status: ${report.status}`,
    '',
    '| Check | Status | Evidence |',
    '| --- | --- | --- |',
    ...checks.map(check => `| ${check.id} | ${check.status} | ${check.evidence.replace(/\|/g, '/')} |`),
    '',
    failures.length
      ? `Failures: ${failures.map(check => check.id).join(', ')}`
      : 'All navigation IA checks passed.',
    '',
  ].join('\n')
);

console.log(`Navigation IA watchdog ${report.status}: ${path.relative(repoRoot, mdPath)}`);
if (failures.length) {
  process.exitCode = 1;
}
