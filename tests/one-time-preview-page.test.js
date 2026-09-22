const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const preview = fs.readFileSync('public/one-time-preview.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

test('One Time onboarding route is static, branded, and not live checkout', () => {
  assert.match(server, /\/preview\/one-time-mishnah/);
  assert.match(server, /one-time-preview\.html/);
  assert.match(preview, /data-one-time-rabbi-dashboard="public-onboarding"/);
  assert.match(preview, /\/css\/bna-app-shell\.css/);
  assert.match(preview, /\/assets\/one-time\/brand\/one-time-logo-white\.webp/);
  assert.match(preview, /One Time Onboarding/);
  assert.match(preview, /Choose the setup that fits/);
  assert.match(preview, /name="audience_type" value="family"/);
  assert.match(preview, /name="audience_type" value="school"/);
  assert.match(preview, /No payment or member access is created from this form/);
  assert.match(preview, /No external message was sent/);
});

test('One Time preview continuation routes are registered as public no-write preview routes', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  assert.equal(routes.get('/one-time-onboarding')?.surface, 'one_time_public_onboarding');
  assert.equal(routes.get('/one-time-onboarding')?.access, 'public');
  assert.match(routes.get('/one-time-onboarding')?.security_expectation || '', /no checkout/i);
  assert.equal(routes.get('/one-time-preview')?.surface, 'one_time_public_onboarding_legacy_alias');
  assert.equal(routes.get('/one-time-preview')?.access, 'public');
  assert.match(routes.get('/one-time-preview')?.security_expectation || '', /no live checkout/i);
  assert.equal(routes.get('/preview/one-time-mishnah')?.canonical_target, '/one-time-onboarding');
  assert.equal(routes.get('/preview/one-time-mishnah')?.public_allowed, true);
});
