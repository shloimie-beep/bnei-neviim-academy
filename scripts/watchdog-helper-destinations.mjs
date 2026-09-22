#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import process from 'process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const {
  evaluateHelperIntentMatrix,
} = require('../src/lib/bna/helper/destination-resolver');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

const MATRIX = [
  {
    case_id: 'owner_operations_tasks',
    intent: 'open_operations_view',
    actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
    helperTool: 'open_operations_view',
    actor: { role: 'super_admin', scope: { type: 'all' }, workspace_key: 'bna' },
    target: { view: 'tasks', section: 'decisions', workspace_key: 'bna' },
    expected_ok: true,
    expected_path: '/operations?view=tasks&section=decisions&workspace=bna',
  },
  {
    case_id: 'owner_calendar_week',
    intent: 'open_operations_view',
    actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
    helperTool: 'open_operations_view',
    actor: { role: 'super_admin', scope: { type: 'all' }, workspace_key: 'bna' },
    target: { view: 'tasks', section: 'schedule', calendar_mode: 'week', workspace_key: 'bna' },
    expected_ok: true,
    expected_path: '/operations?view=tasks&section=schedule&workspace=bna&calendar_mode=week',
  },
  {
    case_id: 'parent_portal_self',
    intent: 'parent_progress',
    actor: { role: 'parent', scope: { type: 'parent' }, workspace_key: 'bna' },
    target: { route: '/parent' },
    expected_ok: true,
    expected_path: '/parent',
  },
  {
    case_id: 'student_portal_self',
    intent: 'student_assignment',
    actor: { role: 'student', scope: { type: 'student' }, workspace_key: 'bna' },
    target: { route: '/student' },
    expected_ok: true,
    expected_path: '/student',
  },
  {
    case_id: 'provider_workspace_self',
    intent: 'provider_workspace',
    actor: { role: 'provider_admin', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
    target: { route: '/provider' },
    expected_ok: true,
    expected_path: '/provider',
  },
  {
    case_id: 'public_provider_index',
    intent: 'public_provider_index',
    actor: { role: 'guest', workspace_key: 'bna' },
    target: { route: '/service-providers' },
    expected_ok: true,
    expected_path: '/service-providers',
  },
  {
    case_id: 'parent_cannot_open_operations',
    intent: 'open_operations_view',
    actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
    helperTool: 'open_operations_view',
    actor: { role: 'parent', scope: { type: 'parent' }, workspace_key: 'bna' },
    target: { view: 'tasks', section: 'tasks', workspace_key: 'bna' },
    expected_ok: false,
    expected_path: '/parent',
  },
  {
    case_id: 'provider_cannot_cross_to_bna_operations',
    intent: 'open_operations_view',
    actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
    helperTool: 'open_operations_view',
    actor: { role: 'provider_admin', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
    target: { view: 'tasks', workspace_key: 'bna' },
    expected_ok: false,
    expected_path: '/provider',
  },
  {
    case_id: 'missing_route_rejected',
    intent: 'missing_route',
    actor: { role: 'super_admin', scope: { type: 'all' } },
    target: { route: '/totally-missing-route' },
    expected_ok: false,
    expected_path: '/operations-login.html',
  },
  {
    case_id: 'external_url_rejected',
    intent: 'external_url',
    actor: { role: 'super_admin', scope: { type: 'all' } },
    target: { route: 'https://example.com/private' },
    expected_ok: false,
    expected_path: '/operations-login.html',
  },
];

function markdown(results = []) {
  const rows = results.map((item) => {
    const result = item.result || {};
    const pathValue = result.path || result.fallback?.path || '';
    return `| ${item.case_id} | ${item.passed ? 'PASS' : 'FAIL'} | ${result.ok ? 'allowed' : 'blocked'} | ${pathValue} | ${result.route_key || ''} | ${result.action_key || result.action_id || ''} | ${result.reason || ''} |`;
  });
  return [
    '# Helper Destination Watchdog',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Case | Result | Decision | Path/Fallback | Route key | Action | Reason |',
    '|---|---|---|---|---|---|---|',
    ...rows,
    '',
    `Summary: ${results.filter((item) => item.passed).length}/${results.length} cases passed.`,
    '',
  ].join('\n');
}

const results = evaluateHelperIntentMatrix(MATRIX);
const ok = results.every((item) => item.passed);
const outDir = path.join(repoRoot, 'ops', 'helper-destination-qa', stamp());
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'helper-destination-matrix.json'), `${JSON.stringify({ ok, results }, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'helper-destination-matrix.md'), markdown(results));

console.log(JSON.stringify({
  ok,
  case_count: results.length,
  failed: results.filter((item) => !item.passed).map((item) => item.case_id),
  report_dir: path.relative(repoRoot, outDir).replace(/\\/g, '/'),
}, null, 2));

if (!ok) process.exitCode = 1;
