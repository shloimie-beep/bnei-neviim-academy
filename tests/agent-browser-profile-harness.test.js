const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve('.');
const script = path.join(repoRoot, 'scripts', 'agent-browser-profile.mjs');

function run(args, env = {}) {
  return execFileSync(process.execPath, [script, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      BNA_AGENT_BROWSER_SKIP_ACL: '1',
      ...env,
    },
  });
}

test('agent browser profile root must be outside the repository', () => {
  assert.throws(
    () => run(['root', '--json', `--root=${repoRoot}`]),
    /must live outside the repo/,
  );
});

test('agent browser harness initializes metadata without storing profiles in repo', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-agent-browser-test-'));
  const output = run(['init', 'one_time_review', '--json', `--root=${root}`]);
  const profiles = JSON.parse(output);
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].profile, 'one_time_review');
  assert.equal(profiles[0].exists, true);
  assert.ok(!profiles[0].profile_dir.startsWith(repoRoot));

  const metaPath = path.join(root, 'one_time_review', 'bna-agent-browser-profile.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  assert.equal(meta.repo_storage_allowed, false);
  assert.equal(meta.chatgpt_agent_cookies_shared, false);
  assert.equal(meta.connector_tokens_shared, false);
  assert.match(meta.bootstrap, /No external login required|Manual/i);

  const health = JSON.parse(run(['health', 'one_time_review', '--json', `--root=${root}`]));
  assert.equal(health.ok, true);
  assert.equal(health.root_outside_repo, true);
  assert.equal(health.profiles[0].metadata_exists, true);
});

test('reauth-required and clear lifecycle commands are explicit', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-agent-browser-test-'));
  run(['init', 'operations_owner', '--json', `--root=${root}`]);

  const reauth = JSON.parse(run(['reauth-required', 'operations_owner', '--json', `--root=${root}`]));
  assert.equal(reauth.reauth_required, true);

  const refused = JSON.parse(run(['clear', 'operations_owner', '--json', `--root=${root}`]));
  assert.equal(refused.cleared, false);
  assert.match(refused.reason, /--confirm/);
  assert.equal(fs.existsSync(path.join(root, 'operations_owner')), true);

  const cleared = JSON.parse(run(['clear', 'operations_owner', '--confirm', '--json', `--root=${root}`]));
  assert.equal(cleared.cleared, true);
  assert.equal(fs.existsSync(path.join(root, 'operations_owner')), false);
});
