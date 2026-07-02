const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const builder = fs.readFileSync('scripts/build-operator-laptop-installer.ps1', 'utf8');
const sync = fs.readFileSync('scripts/Sync-BNA.ps1', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

test('operator laptop installer is safe by default and creates one-click package assets', () => {
  assert.match(builder, /BNA-Operator-Laptop-Safe-/);
  assert.match(builder, /bna-operator-bootstrap-safe\.json/);
  assert.match(builder, /includes_secret_values = \$false/);
  assert.match(builder, /No API keys\./);
  assert.match(builder, /No database URL\./);
  assert.match(builder, /No `\.secrets` folder\./);
  assert.match(builder, /START-HERE-Install-BNA\.cmd/);
  assert.match(builder, /Install-BNA-Laptop\.ps1/);
  assert.match(builder, /Sync-BNA\.ps1/);
  assert.doesNotMatch(builder, /Copy-Item[\s\S]{0,120}\.secrets/);
  assert.doesNotMatch(builder, /Copy-Item[\s\S]{0,120}\.env\.local/);
  assert.doesNotMatch(builder, /secrets\.bundle\.enc/);
});

test('operator laptop installer clones repo, installs dependencies, and avoids auto-starting risky services', () => {
  assert.match(builder, /git clone `\$RepoUrl `\$InstallDir/);
  assert.match(builder, /git pull --ff-only/);
  assert.match(builder, /npm install/);
  assert.match(builder, /node scripts\/import-operator-bootstrap\.mjs `\$localBootstrap/);
  assert.match(builder, /Run-BNA-Doctor/);
  assert.match(builder, /Run-BNA-Smoke/);
  assert.match(builder, /Telegram and agent fleet are intentionally not auto-started/);
  assert.doesNotMatch(builder, /telegram:kimi:start/);
  assert.doesNotMatch(builder, /agent:fleet:restart/);
});

test('Sync-BNA helper blocks secrets and requires explicit commit or push intent', () => {
  assert.match(sync, /Assert-NoSecretStatus/);
  assert.match(sync, /\\\.env\\\.local/);
  assert.match(sync, /\\\.secrets/);
  assert.match(sync, /BNA-Keyholder/);
  assert.match(sync, /install-packages/);
  assert.match(sync, /npm\.cmd" -Arguments @\("run", "secrets:audit"\)/);
  assert.match(sync, /Commit staged changes with message/);
  assert.match(sync, /Push branch '\$branch' to origin/);
  assert.match(sync, /Desktop sync happens by running git pull on the desktop/);
  assert.doesNotMatch(sync, /git push[\s\S]{0,80}-f/);
  assert.doesNotMatch(sync, /git reset --hard/);
});

test('package scripts expose operator laptop package builder', () => {
  assert.equal(
    packageJson.scripts['operator:laptop:package'],
    'powershell -ExecutionPolicy Bypass -File scripts/build-operator-laptop-installer.ps1'
  );
});
