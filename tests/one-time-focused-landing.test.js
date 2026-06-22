const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('OneTime focused landing copy uses current shared review offer and safe CTA', () => {
  const html = fs.readFileSync('public/one-time/index.html', 'utf8');

  assert.match(html, /OneTimeOneTime Mishnah/);
  assert.match(html, /Shared review/);
  assert.match(html, /Start Review/);
  assert.match(html, /Email Previews/);
  assert.match(html, /\$67 planned/);
  assert.match(html, /No charge, access grant, or external send is enabled/);
  assert.match(html, /does not create a checkout, send a message, grant access, or write to an external CRM/);
  assert.doesNotMatch(html, /Academy\s*&\s*Hotline/i);
  assert.doesNotMatch(html, /Academy and Hotline/i);
});

test('OneTime focused offer route and registries are declared', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

  assert.match(server, /'\/one-time\/mishnayos'/);

  const routes = new Set(routeRegistry.routes.map((route) => route.route));
  assert.ok(routes.has('/one-time'));
  assert.ok(routes.has('/one-time/mishnayos'));

  const actions = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actions.has('ACTION-ONETIME-JOIN-SHIR-CTA'));
  assert.ok(actions.has('ACTION-ONETIME-INTEREST-FORM'));
  assert.ok(actions.has('ACTION-ONETIME-MEMBER-LOGIN-LINK'));
});
