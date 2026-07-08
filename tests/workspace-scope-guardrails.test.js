const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const watchdog = fs.readFileSync('scripts/watchdog-workspace-scope-guardrails.mjs', 'utf8');
const memory = fs.readFileSync('memory-topics/workspace-scope-isolation.md', 'utf8');

test('workspace scope guardrail is wired into watchdog closeout', () => {
  assert.equal(
    packageJson.scripts['watchdog:workspace-scope'],
    'node scripts/watchdog-workspace-scope-guardrails.mjs'
  );
  assert.match(packageJson.scripts['watchdog:all'], /watchdog:workspace-scope/);
});

test('workspace scope guardrail covers OneTime parent email leak class', () => {
  assert.match(watchdog, /configuredOneTimePublicBaseUrl/);
  assert.match(watchdog, /oneTimeParentPortalPasswordResetUrl/);
  assert.match(watchdog, /requestBaseUrl\(req\)/);
  assert.match(watchdog, /Bnei Neviim Academy\|bneineviimacademy/);
  assert.ok(watchdog.includes("workspace:\\s*'one_time_mishnah_class'"));
  assert.ok(watchdog.includes('identity\\?\\.oneTime'));
});

test('workspace scope memory keeps support diagnostics and provider data isolated', () => {
  assert.match(memory, /Rabbi\/provider scope cannot read unrelated BNA/);
  assert.match(memory, /Support\/admin diagnostics belong behind a support drawer or role gate/);
  assert.match(memory, /Scope contamination findings for One Time UI cleanup must check contacts/);
});
