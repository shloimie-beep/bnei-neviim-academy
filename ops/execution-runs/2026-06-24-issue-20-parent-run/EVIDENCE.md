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
- App-visible Done remains blocked pending deploy/live proof.

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
- Server-visible Done remains blocked pending deploy/live proof.

## Pending Evidence

- Result drop-off/GitHub bridge proof.
- Fleet/startup/parallel lane proof.
- Queue hygiene proof.
- Owner walkthrough proof.
- Final release/deploy/live verification.
