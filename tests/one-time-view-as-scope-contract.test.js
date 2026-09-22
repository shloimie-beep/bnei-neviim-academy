const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('signed View-as Rabbi requests are project-scoped and read-only server-side', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const providerHtml = fs.readFileSync('public/provider.html', 'utf8');

  assert.match(server, /payload\.workspace_key !== ONE_TIME_PROVIDER_WORKSPACE_KEY/);
  assert.match(server, /payload\.project_key !== ONE_TIME_PROJECT_KEY/);
  assert.match(server, /payload\.target_role !== 'workspace_owner'/);

  assert.match(server, /function applyOneTimeViewAsRabbiRequest\(req, res\)/);
  assert.match(server, /const viewAsAuth = applyOneTimeViewAsRabbiRequest\(req, res\);[\s\S]*if \(viewAsAuth\.authenticated\) return next\(\);/);
  assert.match(server, /req\.oneTimeViewAsRabbi = payload;/);
  assert.match(server, /req\.opsIdentity = identity;/);
  assert.match(server, /if \(!\['GET', 'HEAD', 'OPTIONS'\]\.includes\(method\)\) \{/);
  assert.match(server, /View-as Rabbi is read-only\./);

  assert.match(server, /View-as Rabbi can only access the One Time provider workspace\./);
  assert.match(server, /View-as Rabbi can only access One Time Mishnah Class records\./);
  assert.match(server, /function opsScopeProjectKey\(req\) \{\s*if \(req\?\.oneTimeViewAsRabbi\) return ONE_TIME_PROJECT_KEY;/);

  const firstAuthMeIndex = server.indexOf("app.get('/api/bna/auth/me', async (req, res) => {");
  assert.notEqual(firstAuthMeIndex, -1, 'first /api/bna/auth/me route should exist');
  const firstAuthMeRoute = server.slice(firstAuthMeIndex, firstAuthMeIndex + 900);
  assert.match(firstAuthMeRoute, /applyOneTimeViewAsRabbiRequest\(req, res\)/);
  assert.match(firstAuthMeRoute, /buildBnaIdentityPayload\(\{ identity: viewAsAuth\.identity, req, actor: 'admin' \}\)/);

  assert.match(providerHtml, /X-One-Time-View-As-Token/);
  assert.match(providerHtml, /\.\.\.options,\s*headers/);
});
