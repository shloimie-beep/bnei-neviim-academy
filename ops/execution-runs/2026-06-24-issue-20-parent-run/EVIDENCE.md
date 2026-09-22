# Evidence

## Source Evidence

- `raw-input/RAW-20260624-009-github-issue-20-goal.md`
- `tasks-pending/2026-06-24-issue-20-parent-run.md`
- `https://github.com/shloimie-beep/bnei-neviim-academy/issues/20`
- Issue #18 terminal comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18#issuecomment-4792923047`
- Issue #18 PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/21`

## Baseline And Coordination Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/BASELINE-READBACK.md`
- `ops/execution-runs/2026-06-24-issue-20-parent-run/COORDINATION.md`
- `ops/execution-runs/2026-06-24-issue-20-parent-run/LANE-MANIFEST.json`
- Pushed checkpoint:
  `3e0902f651302ae594e5462f3a88913b40406d8c` on
  `origin/codex/issue-20-parent-run-20260624`

Readback summary:

- `origin/master`: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`
- Issue #18 PR #21 head: `63db04468b1d7695292e922ff6757d1f42aef033`
- Live health: HTTP 200, database connected.
- Railway doctor: blocked by local CLI targeting mismatch.
- Validation: run validate, source coverage, stale-evidence, JSON/JSONL parse,
  diff check, and next-batch selection passed.

## Release And Live Evidence

- Issue #20 PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/22`
- Merged master SHA: `378cc562a7dd4ffc8f2cc81a7341502df42d0295`
- Railway deployment ID: `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa`
- Deployed SHA: `378cc562a7dd4ffc8f2cc81a7341502df42d0295`
- Live app smoke:
  `ops/live-smokes/2026-06-25T04-22-25-680Z-live-app-smoke.md`
- Public privacy smoke:
  `ops/live-smokes/2026-06-25T04-22-36-357Z-public-route-privacy-smoke.md`
- Issue #20 live verifier:
  `ops/live-smokes/2026-06-25T04-33-00-045Z-issue20-live-verification/issue20-live-verification.md`
- Visual production proof:
  `ops/playwright-smokes/2026-06-24-owner-review-public-visual/report.md`
- Helper destination proof:
  `ops/helper-destination-qa/20260625T042604Z/helper-destination-matrix.md`

Release readback summary:

- Canonical BNA Railway target was verified as `skillful-motivation` /
  `production` / `skillful-motivation`, custom domain
  `bneineviimacademy.org`.
- PR #22 merged through GitHub and triggered the existing Railway `master`
  auto-deploy path.
- Railway deployment `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa` succeeded from
  `378cc562a7dd4ffc8f2cc81a7341502df42d0295`.
- Required live smokes, public privacy, owner visual, helper destinations,
  agent-browser health/smoke, agent-fleet readiness, Operations queue/UI
  readback, and owner walkthrough live verification passed.
- Issue #18 remains `NOT SAFE TO APPLY`; no class backfill was applied.

## Visual Quality Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/VISUAL-QUALITY.md`
- `ops/watchdog-audits/2026-06-24T20-01-watchdog-visual-baseline.md`
- `ops/visual-quality/2026-06-24T20-00-watchdog-visual-baseline/visual-baseline-browser-matrix.md`
- `ops/visual-quality/2026-06-24T20-00-watchdog-visual-baseline/visual-baseline-browser-matrix.json`
- `ops/visual-quality/2026-06-24T20-00-watchdog-visual-baseline/screenshots/`
- `docs/owner-review/PUBLIC-VISUAL-AUDIT.md`
- `ops/watchdog-audits/2026-06-24T20-03-watchdog-visual-baseline.md`
- `ops/watchdog-audits/2026-06-24T20-03-watchdog-ui-smoke.md`

Visual readback summary:

- Local browser matrix covered 9 routes across 390x844, 768x1024, and
  1440x900.
- Final findings: 0.
- Fixed public nav clipping, One Time review tap-target sizing, and One Time
  landing consent checkbox sizing.
- App-visible Done is live-verified by PR #22 deployment and the Issue #20
  live verifier.

## Agent Browser Harness Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/AGENT-BROWSER.md`
- `docs/agent-browser-harness.md`
- `scripts/agent-browser-profile.mjs`
- `tests/agent-browser-profile-harness.test.js`
- `package.json`

Agent browser readback summary:

- Default profile root:
  `C:\Users\User\AppData\Local\BNA\agent-browser-profiles`
- Named profiles initialized: `operations_owner`, `parent_portal`,
  `student_portal`, `provider_portal`, `one_time_review`, and
  `github_status`.
- The profile root is outside the repo and the harness refuses repo-local
  profile roots.
- Final health readback found metadata for all six profiles, current-user ACL
  present, and inheritance disabled.
- Credential-free temporary-root smoke passed for `one_time_review` against
  `https://bneineviimacademy.org/provider.html?review=one-time` with no
  screenshot, no private data capture, and no horizontal overflow.

## Helper Destination Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/HELPER-LINK-QA.md`
- `src/lib/bna/helper/destination-resolver.js`
- `src/lib/bna/helper/tool-registry.js`
- `scripts/watchdog-helper-destinations.mjs`
- `tests/helper-destination-resolver.test.js`
- `ops/action-registry.json`
- `ops/watchdog-audits/2026-06-24T20-27-watchdog-action-audit.md`
- `ops/helper-destination-qa/20260624T203546Z/helper-destination-matrix.md`
- `ops/helper-destination-qa/20260624T203546Z/helper-destination-matrix.json`

Helper destination readback summary:

- `open_operations_view` returns canonical route/action/scope metadata from
  the route and action registries.
- `ACTION-HELPER-OPEN-OPERATIONS-VIEW` is registered as a helper action.
- The watchdog matrix passed 10/10 cases covering owner, parent, student,
  provider, public, wrong-role, wrong-workspace, missing-route, and external
  URL handling.
- Server-visible helper behavior is live-verified by PR #22 deployment and
  post-deploy helper destination watchdog evidence.

## Agent Result Bridge Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/AGENT-RESULT-BRIDGE.md`
- `src/lib/bna/agent-result-packet.js`
- `src/lib/actions/actions/operations.js`
- `src/lib/actions/registry.js`
- `server.js`
- `public/operations.html`
- `scripts/intake-github.mjs`
- `tests/action-registry-telegram-ui-bot.test.js`
- `tests/system-truth-scripts.test.js`
- `ops/action-registry.json`
- `ops/watchdog-audits/2026-06-24T21-01-watchdog-action-audit.md`

Agent result bridge readback summary:

- Result packets are normalized with stable idempotency keys and redacted
  evidence/GitHub metadata.
- The typed action/API route records scoped job events, task activity, internal
  task comments, and proof links without external writes or owner-text
  overwrite.
- Operations activity rows render saved evidence and GitHub links.
- GitHub status comments are same-thread, marker-based, redacted, and blocked
  by explicit post approval gates; no GitHub status comment was posted.
- Server-visible/API/UI agent result bridge behavior is live-verified by
  PR #22 deployment, live smokes, Operations readback, and focused tests.

## Agent Fleet Hardening Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/AGENT-FLEET-HARDENING.md`
- `src/lib/bna/agent-fleet-hardening.js`
- `scripts/agent-fleet-supervisor.mjs`
- `scripts/start-agent-fleet.ps1`
- `scripts/start-watchdog.ps1`
- `scripts/agent-fleet-readiness.mjs`
- `tests/agent-fleet-hardening.test.js`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.json`

Agent fleet hardening readback summary:

- The existing supervisor is reused and hardened; no second agent fleet was
  created.
- Permission tiers 0-3 are explicit. Tier 3 actions are blocked by default
  pending explicit Decision/approval.
- Windows launchers expose start, stop, restart, status, and open-log controls
  with bounded hidden startup retries and current-login metadata.
- Parent coordination audit passed with 0 findings.
- Synthetic no-write proof covered GitHub intake preview, claim/worktree
  preview, `record_agent_result` dry-run, Operations activity link preview,
  GitHub same-thread status preview, and parent closeout without external
  writes.

## Queue Hygiene Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/QUEUE-HYGIENE.md`
- `server.js`
- `public/operations.html`
- `scripts/task-decision-census.mjs`
- `tests/operations-task-queue-visibility.test.js`
- `tests/task-decision-census.test.js`
- `ops/watchdog-audits/2026-06-24T21-46-watchdog-action-audit.md`

Queue hygiene readback summary:

- Machine-owned rows, `agent_job` rows, and queued/running/failed/blocked agent
  lifecycle states are routed to `codex_queue` instead of human/external
  waiting.
- Owner default views are Active Now, Needs Your Decision, Waiting Externally,
  Recently Completed, and Full History / Search.
- Operational review lanes still expose My Tasks, One Time Tasks, Codex /
  Agent Work, Due Soon, Calendar, and Archived.
- Focused queue/UI/reconciler tests passed 23/23 and `watchdog:actions` passed
  with 0 findings.
- App-visible/API/UI queue behavior is live-verified by PR #22 deployment,
  live smokes, authenticated Operations/API readback, and queue tests.

## Final Release Blocker Evidence

- `ops/execution-runs/2026-06-24-issue-20-parent-run/FINAL-RELEASE-BLOCKER.md`
- `ops/execution-runs/2026-06-24-issue-20-parent-run/DEPLOYMENT.md`
- `ops/execution-runs/2026-06-24-issue-20-parent-run/BASELINE-READBACK.md`
- `ops/execution-runs/2026-06-24-issue-20-parent-run/requirements.json`
- `tasks-pending/2026-06-24-issue-20-parent-run.md`

Final release readback summary:

- `npm run bna:run:next` reports no unblocked executable batch after the
  requirements were moved to Done.
- The Railway targeting blocker is resolved by canonical target discovery and
  fail-closed deployment script hardening.
- PR #22 merge commit `378cc562a7dd4ffc8f2cc81a7341502df42d0295` is deployed
  and live-smoked.
- No class backfill, production data mutation, external send, charge, DNS
  change, credential/account change, Drive write, Buffer publish, browser
  private capture, public publishing, or secret exposure was performed.

## Owner Walkthrough Evidence

- `public/issue-20-owner-walkthrough.html`
- `public/integration-setup.html`
- `public/css/integration-setup.css`
- `ops/execution-runs/2026-06-24-issue-20-parent-run/OWNER-WALKTHROUGH.md`
- `ops/route-registry.json`
- `tests/issue-20-owner-walkthrough.test.js`
- `ops/watchdog-audits/2026-06-24T21-54-watchdog-action-audit.md`

Owner walkthrough readback summary:

- The page covers live/master/branch truth, active goal and lanes, agent fleet,
  browser profiles versus ChatGPT Agent, role links and bot QA, GitHub bridge,
  Decisions/queue/next ramble, and stop/restart/release gates.
- Every setup card includes exact page, step, expected result, validation
  command, and recovery action.
- The page states that Issue #20 implementation PR #22 was live-verified on
  Railway deployment `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa`; final closeout
  deployment IDs are posted back to GitHub Issue #20 after auto-deploy.
- Focused page/setup/link/route tests passed 8/8 and `watchdog:actions` passed
  with 0 findings.
- App-visible owner walkthrough Done is live-verified by the Issue #20 live
  verifier.

## Pending Evidence

- None for Issue #20.
