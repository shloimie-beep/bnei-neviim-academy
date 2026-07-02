const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');

function functionSlice(source, name) {
  const start = source.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const next = source.indexOf('\n        function ', start + 1);
  return next === -1 ? source.slice(start) : source.slice(start, next);
}

test('Super Admin can open the One Time Mishnah class as the Rabbi workspace view', () => {
  const topbar = functionSlice(operations, 'renderOpsTopbar');
  assert.match(operations, /function canOpenOneTimeRabbiView\(\)/);
  assert.match(operations, /Boolean\(opsMe\) && opsMe\?\.scope\?\.type !== 'project' && allowedViews\(\)\.has\('service_providers'\)/);
  assert.match(operations, /function renderOneTimeRabbiViewAction\(\)/);
  assert.match(operations, /View One Time as Rabbi/);
  assert.match(operations, /Back to Super Admin/);
  assert.match(operations, /function openOneTimeRabbiView\(section = 'schedule'\)/);
  assert.match(operations, /currentWorkspaceId = 'rabbi_sheller_provider'/);
  assert.match(operations, /currentView = 'service_providers'/);
  assert.match(operations, /serviceProviderSection = PROVIDER_PROGRAM_SUBTABS\.some\(tab => tab\.id === section\) \? section : 'schedule'/);
  assert.match(operations, /taskProjectFilter = 'one_time_mishnah_class'/);
  assert.match(operations, /syncOperationsUrl\(\);[\s\S]*render\(\);[\s\S]*loadData\(\{ background: true \}\);/);
  assert.match(operations, /data-action-id="ACTION-ONETIME-WORKSPACE-VIEW"[\s\S]*data-workspace-option/);
  assert.doesNotMatch(topbar, /renderOneTimeRabbiViewAction/);
});

test('Platform Suite is hidden from normal navigation while the old route remains available', () => {
  assert.match(operations, /const HIDDEN_NAV_VIEW_IDS = new Set\(\['platform_suite'\]\)/);
  assert.match(operations, /\.filter\(item => allowedViews\(\)\.has\(item\.id\) && !HIDDEN_NAV_VIEW_IDS\.has\(item\.id\)\)/);
  assert.match(operations, /case 'platform_suite': content = renderPlatformSuite\(\); break;/);
  assert.match(operations, /if \(currentView === 'platform_suite'\) mountPlatformSuite\(\);/);
});
