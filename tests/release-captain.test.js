const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');

async function loadReleaseCaptain() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'release-captain.mjs')).href);
}

function gate(overrides = {}) {
  return {
    ok: true,
    blockers: [],
    git: {
      branch: 'codex/release-captain-onetime-ui-20260705',
      head: 'abc123',
      upstream: 'origin/codex/release-captain-onetime-ui-20260705',
      head_pushed: true,
      dirty: { total: 0 },
    },
    run: { run_id: 'RUN-TEST' },
    ...overrides,
  };
}

test('release captain classifies dirty local work as verify/commit/push work', async () => {
  const mod = await loadReleaseCaptain();
  const report = gate({
    ok: false,
    blockers: ['Working tree has dirty or untracked files; do not deploy from a mixed dirty worktree.'],
    git: { ...gate().git, dirty: { total: 3 } },
  });

  assert.equal(mod.classifyReleaseState(report), 'local_changes_need_verify_commit_push');
  assert.ok(mod.nextActionsForState('local_changes_need_verify_commit_push', report).some((item) => /commit, push/i.test(item)));
});

test('release captain blocks ready state when the named target gate fails', async () => {
  const mod = await loadReleaseCaptain();
  const targetGate = {
    ok: false,
    blockers: ['https://join.onetimeonetime.com/one-time/ is missing required One Time funnel text.'],
  };

  assert.equal(mod.classifyReleaseState(gate(), targetGate), 'blocked_by_target_gate');
  assert.ok(mod.nextActionsForState('blocked_by_target_gate', gate(), targetGate).some((item) => /target gate blocker/i.test(item)));
});

test('release captain catches detached and unpushed release states', async () => {
  const mod = await loadReleaseCaptain();

  assert.equal(
    mod.classifyReleaseState(gate({ ok: false, git: { ...gate().git, branch: '(detached)' } })),
    'detached_checkout_needs_branch',
  );
  assert.equal(
    mod.classifyReleaseState(gate({ ok: false, git: { ...gate().git, head_pushed: false } })),
    'branch_needs_push',
  );
});

test('release captain renders a concise markdown report without implying external writes', async () => {
  const mod = await loadReleaseCaptain();
  const report = {
    ok: true,
    generated_at: '2026-07-05T00:00:00.000Z',
    summary: 'ready for pr merge deploy gate',
    next_actions: ['Open or update the PR.'],
    release_gate_blockers: [],
    active_run: { run_id: 'RUN-TEST' },
    open_prs: [{ number: 101, branch: 'codex/test', title: 'Test PR', draft: true, merge_state: 'OPEN' }],
    git: gate().git,
  };
  const markdown = mod.renderReleaseCaptainMarkdown(report);

  assert.match(markdown, /Release Captain/);
  assert.match(markdown, /Dirty files \| 0/);
  assert.match(markdown, /Target Gate/);
  assert.match(markdown, /#101/);
  assert.match(markdown, /read-only: no deploy, merge, production mutation, external send, payment, DNS, access grant, or secret print/i);
});

test('one-time public target gate verifies join domain routes and instance config', async () => {
  const mod = await loadReleaseCaptain();
  const landingHtml = '<!doctype html><title>Your Child Can Love Learning Mishnayos | One Time</title><body>One Time Mishnayos Sign Up Now</body>';
  const fetchCalls = [];
  const fetchFn = async (url) => {
    fetchCalls.push(url);
    if (url.endsWith('/api/one-time/instance-config')) {
      return {
        status: 200,
        url,
        text: async () => JSON.stringify({
          app_instance: 'onetime',
          workspace_key: 'rabbi_sheller_provider',
          project_key: 'one_time_mishnah_class',
        }),
      };
    }
    return {
      status: 200,
      url,
      text: async () => landingHtml,
    };
  };
  const runner = (command, args) => {
    if (command === 'railway' && args.join(' ') === 'status --json') {
      return {
        ok: true,
        stdout: JSON.stringify({
          name: 'one-time-production',
          services: { edges: [{ node: { name: 'one-time-web' } }] },
          environments: {
            edges: [{
              node: {
                serviceInstances: {
                  edges: [{
                    node: {
                      serviceName: 'one-time-web',
                      domains: { customDomains: [{ domain: 'join.onetimeonetime.com' }] },
                    },
                  }],
                },
              },
            }],
          },
        }),
      };
    }
    return { ok: true, stdout: '' };
  };

  const report = await mod.buildOneTimePublicTargetGate({ targetBaseUrl: 'https://join.onetimeonetime.com' }, { fetchFn, runner });

  assert.equal(report.ok, true, report.blockers.join('\n'));
  assert.equal(report.target, 'one-time-public');
  assert.deepEqual(fetchCalls, [
    'https://join.onetimeonetime.com/',
    'https://join.onetimeonetime.com/one-time/',
    'https://join.onetimeonetime.com/api/one-time/instance-config',
  ]);
});

test('one-time public target gate treats mismatched local Railway link as a warning after live checks pass', async () => {
  const mod = await loadReleaseCaptain();
  const landingHtml = '<!doctype html><title>Your Child Can Love Learning Mishnayos | One Time</title><body>One Time Mishnayos Sign Up Now</body>';
  const fetchFn = async (url) => {
    if (url.endsWith('/api/one-time/instance-config')) {
      return {
        status: 200,
        url,
        text: async () => JSON.stringify({
          app_instance: 'onetime',
          workspace_key: 'rabbi_sheller_provider',
          project_key: 'one_time_mishnah_class',
        }),
      };
    }
    return {
      status: 200,
      url,
      text: async () => landingHtml,
    };
  };
  const runner = (command, args) => {
    if (command === 'railway' && args.join(' ') === 'status --json') {
      return {
        ok: true,
        stdout: JSON.stringify({
          id: 'bna-project-id',
          name: 'skillful-motivation',
          services: { edges: [{ node: { name: 'bna-web' } }] },
        }),
      };
    }
    return { ok: true, stdout: '' };
  };

  const report = await mod.buildOneTimePublicTargetGate({ targetBaseUrl: 'https://join.onetimeonetime.com' }, { fetchFn, runner });

  assert.equal(report.ok, true, report.blockers.join('\n'));
  assert.deepEqual(report.blockers, []);
  assert.equal(report.railway_status.matches_expected, false);
  assert.match(report.warnings.join('\n'), /Railway status is not currently linked to the One Time service/);
  assert.match(report.warnings.join('\n'), /one-time:railway-target:guard/);
});
