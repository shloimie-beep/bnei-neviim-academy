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
  assert.match(markdown, /#101/);
  assert.match(markdown, /read-only: no deploy, merge, production mutation, external send, payment, DNS, access grant, or secret print/i);
});
