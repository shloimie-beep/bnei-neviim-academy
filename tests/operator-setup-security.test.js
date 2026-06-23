const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const serverJs = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const importer = fs.readFileSync('scripts/import-operator-bootstrap.mjs', 'utf8');

test('secure operator setup backend is super-admin only, expiring, one-time, and encrypted for secrets', () => {
  assert.match(serverJs, /const createSecureDownloadsSQL = `/);
  assert.match(serverJs, /CREATE TABLE IF NOT EXISTS bna_secure_downloads/);
  assert.match(serverJs, /token_hash TEXT NOT NULL UNIQUE/);
  assert.match(serverJs, /used_at TIMESTAMP/);
  assert.match(serverJs, /DELETE FROM bna_secure_downloads WHERE expires_at <= NOW\(\) OR used_at IS NOT NULL/);
  assert.match(serverJs, /app\.get\('\/api\/bna\/operator-setup\/status', requireAdmin/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/operator-setup\/bootstrap-package', requireAdmin/);
  assert.match(serverJs, /app\.get\('\/api\/bna\/operator-setup\/download\/:token', requireAdmin/);
  assert.match(serverJs, /Only the platform admin can create operator setup packages/);
  assert.match(serverJs, /APPROVE_OPERATOR_ENV_SECRET_EXPORT/);
  assert.match(serverJs, /crypto\.createCipheriv\('aes-256-gcm'/);
  assert.match(serverJs, /crypto\.scryptSync/);
  assert.match(serverJs, /UPDATE bna_secure_downloads SET used_at = NOW\(\)/);
  assert.match(serverJs, /Content-Disposition/);
  assert.match(serverJs, /includes_secret_values: includeSecrets/);
  assert.match(serverJs, /env_template: snapshot\.env/);
});

test('app hardening covers private headers, stronger session ids, secure cookies, and login rate limiting', () => {
  assert.match(serverJs, /app\.disable\('x-powered-by'\)/);
  assert.match(serverJs, /X-Content-Type-Options', 'nosniff'/);
  assert.match(serverJs, /Referrer-Policy', 'same-origin'/);
  assert.match(serverJs, /X-Frame-Options', 'DENY'/);
  assert.match(serverJs, /X-Robots-Tag', 'noindex, nofollow, noarchive'/);
  assert.match(serverJs, /function responseUsesSecureCookie/);
  assert.match(serverJs, /proto === 'https'/);
  assert.match(serverJs, /const sessionId = generateSecureToken\(32\);/);
  assert.match(serverJs, /const opsLoginRateLimits = new Map\(\)/);
  assert.match(serverJs, /Too many login attempts/);
});

test('Operations UI exposes a secure Operator Setup section without showing secrets', () => {
  assert.match(operationsHtml, /operator_setup/);
  assert.match(operationsHtml, /Operator Setup/);
  assert.match(operationsHtml, /function renderOperatorSetupPanel/);
  assert.match(operationsHtml, /api\.getOperatorSetupStatus/);
  assert.match(operationsHtml, /api\.createOperatorSetupPackage/);
  assert.match(operationsHtml, /APPROVE_OPERATOR_ENV_SECRET_EXPORT/);
  assert.match(operationsHtml, /Create Safe Download/);
  assert.match(operationsHtml, /Create Encrypted Download/);
  assert.match(operationsHtml, /download="\$\{escapeHtml\(result\.filename \|\| 'bna-operator-bootstrap\.json'\)\}"/);
  assert.doesNotMatch(operationsHtml, /\.env\.local[\s\S]{0,80}textarea/);
});

test('operator bootstrap importer writes env files without printing secret values', () => {
  assert.match(importer, /decryptPackage/);
  assert.match(importer, /createDecipheriv\('aes-256-gcm'/);
  assert.match(importer, /BNA_BOOTSTRAP_PASSPHRASE/);
  assert.match(importer, /No secret values were printed/);
  assert.match(importer, /Do not commit this file/);
  assert.doesNotMatch(importer, /console\.log\(.*env\[/);
});

test('environment example documents operator setup and secure-cookie controls', () => {
  assert.match(envExample, /^BNA_COOKIE_SECURE=false$/m);
  assert.match(envExample, /^OPS_LOGIN_RATE_LIMIT_WINDOW_MS=600000$/m);
  assert.match(envExample, /^OPS_LOGIN_RATE_LIMIT_MAX=10$/m);
  assert.match(envExample, /^OPERATOR_BOOTSTRAP_TTL_MS=600000$/m);
  assert.match(envExample, /^OPERATOR_BOOTSTRAP_MAX_TTL_MS=900000$/m);
  assert.match(envExample, /^OPERATOR_BOOTSTRAP_PASSPHRASE_MIN=20$/m);
});
