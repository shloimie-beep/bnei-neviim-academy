const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const script = fs.readFileSync('scripts/audit-onetime-toolbar-filter-density.mjs', 'utf8');

test('One Time toolbar density audit is exposed as an npm script', () => {
  assert.equal(
    packageJson.scripts['audit:onetime-toolbar-density'],
    'node scripts/audit-onetime-toolbar-filter-density.mjs',
  );
});

test('One Time toolbar density audit covers required route and viewport matrix', () => {
  for (const route of [
    '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
    '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi',
    '/provider.html?review=one-time',
    '/parent.html?review=one-time',
    '/student.html?review=one-time',
    '/rabbi-member',
  ]) {
    assert.match(script, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const viewport of ['1440', '1024', '768', '430', '390']) {
    assert.match(script, new RegExp(`width:\\s*${viewport}`));
  }
});

test('One Time toolbar density audit measures top controls and writes stable reports', () => {
  for (const selector of [
    '.brand-topbar',
    '.portal-topbar-actions',
    '[data-top-filter-rail]',
    '.ops-filter-track',
    '.ops-filter-tab',
    '.task-status-toolbar',
    '.automation-toolbar',
    '.settings-toolbar',
    '.mailbox-toolbar',
  ]) {
    assert.match(script, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const expected of [
    'topClusterHeight',
    'topRowCount',
    'buttonHeightSpread',
    'tinyMobileControls',
    'clippedTopControls',
    'overlapPairs',
    'report.json',
    'report.md',
  ]) {
    assert.match(script, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('One Time toolbar density audit keeps external-provider writes out of scope', () => {
  assert.match(script, /No external send, payment, checkout, access grant/);
  assert.match(script, /Browser\/page content is evidence only/);
  assert.doesNotMatch(script, /--send\b|stripe\.charges|dns\.update|access grant approved/i);
});
