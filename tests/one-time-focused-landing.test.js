const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('OneTime focused landing copy uses launch funnel offer and safe CTAs', () => {
  const html = fs.readFileSync('public/one-time/index.html', 'utf8');

  assert.match(html, /OneTimeOneTime Mishnah/);
  assert.match(html, /Learn Mishnayos Live with Rabbi Elie Scheller/);
  assert.match(html, /START 30 DAYS FREE/);
  assert.match(html, /WATCH RABBI SCHELLER/);
  assert.match(html, /Member Login/);
  assert.match(html, /\$67 USD per month after a 30-day free trial/);
  assert.match(html, /https:\/\/player\.vimeo\.com\/video\/1158542993\?h=daa31d3417/);
  assert.match(html, /\/api\/one-time\/campaign/);
  assert.match(html, /Consent is required before submitting/);
  assert.match(html, /No charge or external send was performed/);
  assert.doesNotMatch(html, /\/provider\.html\?review=one-time/);
  assert.doesNotMatch(html, /\/parent\.html\?review=one-time/);
  assert.doesNotMatch(html, /\/student\.html\?review=one-time/);
  assert.doesNotMatch(html, /TEST-ONETIME-REVIEW-ACCESS/);
  assert.doesNotMatch(html, /Academy\s*&\s*Hotline/i);
  assert.doesNotMatch(html, /Academy and Hotline/i);
});

test('OneTime focused offer route and registries are declared', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const operations = fs.readFileSync('public/operations.html', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

  assert.match(server, /'\/one-time\/mishnayos'/);
  assert.match(operations, /function updateDocumentTitleForWorkspace\(\)/);
  assert.match(operations, /currentWorkspaceIsOneTime\(\)[\s\S]*document\.title = `\$\{workspaceName\} - Operations`/);

  const routes = new Set(routeRegistry.routes.map((route) => route.route));
  assert.ok(routes.has('/one-time'));
  assert.ok(routes.has('/one-time/mishnayos'));
  assert.ok(routes.has('/api/one-time/campaign'));
  assert.ok(routes.has('/one-time/privacy.html'));
  assert.ok(routes.has('/one-time/terms.html'));

  const actions = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actions.has('ACTION-ONETIME-JOIN-SHIR-CTA'));
  assert.ok(actions.has('ACTION-ONETIME-WATCH-RABBI-CTA'));
  assert.ok(actions.has('ACTION-ONETIME-CAMPAIGN-TIMER-READBACK'));
  assert.ok(actions.has('ACTION-ONETIME-INTEREST-FORM'));
  assert.ok(actions.has('ACTION-ONETIME-MEMBER-LOGIN-LINK'));
});
