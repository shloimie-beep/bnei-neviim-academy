const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('server emits privacy-safe performance timing and RUM contracts', () => {
  const server = read('server.js');
  assert.match(server, /AsyncLocalStorage/);
  assert.match(server, /Server-Timing/);
  assert.match(server, /X-BNA-Trace-Id/);
  assert.match(server, /X-BNA-Deploy-SHA/);
  assert.match(server, /X-BNA-Response-Bytes/);
  assert.match(server, /instrumentPoolForPerformance\(pool\)/);
  assert.match(server, /recordDbPerformance\('db'/);
  assert.match(server, /recordDbPerformance\('pool'/);
  assert.match(server, /app\.post\('\/api\/performance\/rum'/);
  assert.match(server, /bna_performance_events/);
  assert.match(server, /PERFORMANCE_RUM_ACCEPTED/);
  assert.match(server, /sanitizePerformanceRoutePath[\s\S]*\[redacted-contact\]/);
  assert.match(server, /sanitizePerformanceRoutePath[\s\S]*\[redacted-email\]/);
  assert.match(server, /sanitizePerformanceRoutePath[\s\S]*\[redacted-number\]/);
});

test('One Time RUM client records route load and route transition without private DOM capture', () => {
  const rum = read('public/js/one-time-performance-rum.js');
  assert.match(rum, /PerformanceObserver/);
  assert.match(rum, /navigator\.sendBeacon/);
  assert.match(rum, /route_load/);
  assert.match(rum, /route_transition/);
  assert.match(rum, /pushState/);
  assert.match(rum, /replaceState/);
  assert.match(rum, /popstate/);
  assert.match(rum, /safeRoutePath/);
  assert.match(rum, /\[redacted-contact\]/);
  assert.match(rum, /\[redacted-email\]/);
  assert.match(rum, /\[redacted-number\]/);
  assert.match(rum, /no_pii_contract/);
  assert.doesNotMatch(rum, /document\.cookie|localStorage|innerText|textContent/);
});

test('One Time performance client is loaded by public, provider, and Operations shells', () => {
  for (const file of [
    'public/one-time/index.html',
    'public/provider.html',
    'public/operations.html',
    'public/operations-bootstrap.html',
  ]) {
    assert.match(read(file), /\/js\/one-time-performance-rum\.js/, file);
  }
});
