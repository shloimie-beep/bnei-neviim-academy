const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

async function auditModule() {
  return import(pathToFileURL(path.join(root, 'scripts', 'one-time-local-hardening-audit.mjs')).href);
}

test('One Time local hardening audit passes all local checks', async () => {
  const { buildOneTimeLocalHardeningAudit } = await auditModule();
  const audit = buildOneTimeLocalHardeningAudit();

  assert.equal(audit.requirement_id, 'REQ-20260619-419');
  assert.equal(audit.preview_only, true);
  assert.equal(audit.external_write_performed, false);
  assert.equal(audit.production_mutation_performed, false);
  assert.equal(audit.success, true);
  assert.equal(audit.checks.every((check) => check.ok), true);
});

test('route registry covers One Time aliases and interest API', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'ops/route-registry.json'), 'utf8'));
  const routes = new Map(registry.routes.map((row) => [row.route, row]));
  for (const route of [
    '/one-time/us',
    '/one-time/uk',
    '/one-time/israel',
    '/one-time/interest',
    '/one-time/member-login',
    '/api/one-time/interest',
  ]) {
    assert.ok(routes.has(route), `${route} should be registered`);
  }
  const interest = routes.get('/api/one-time/interest');
  assert.equal(interest.access, 'public_intake');
  assert.equal(interest.public_allowed, true);
  assert.match(interest.security_expectation, /no checkout/i);
  assert.match(interest.security_expectation, /at most one current-signup Resend confirmation email/i);
  assert.match(interest.security_expectation, /grants local 30-day access/i);
});

test('One Time member-login alias serves the member entry surface', () => {
  const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');

  assert.doesNotMatch(
    server,
    /app\.get\(\[[^\]]*'\/one-time\/member-login'[^\]]*\][\s\S]*?public', 'one-time', 'index\.html'/,
    '/one-time/member-login should not serve the public offer page'
  );
  assert.match(
    server,
    /app\.get\(\[[^\]]*'\/one-time\/member-login'[^\]]*\][\s\S]*?public', 'rabbi-member\.html'/,
    '/one-time/member-login should serve the member entry page'
  );
});

test('package and docs expose the local hardening audit command', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const doc = fs.readFileSync(path.join(root, 'docs/product/one-time-reliability-security-registry-hardening.md'), 'utf8');

  assert.match(packageJson.scripts['onetime:local:audit'], /one-time-local-hardening-audit\.mjs/);
  assert.match(doc, /npm run onetime:local:audit/);
  assert.match(doc, /ops\/route-registry\.json/);
  assert.match(doc, /ops\/action-registry\.json/);
  assert.match(doc, /do not use `DROP DATABASE` or\s+`TRUNCATE`/i);
  assert.match(doc, /No deploy, Railway mutation, production database write/i);
});
