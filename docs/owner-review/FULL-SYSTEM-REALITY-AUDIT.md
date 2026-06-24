# Full System Reality Audit - PR #14

Generated: 2026-06-24

Raw source: `raw-input/RAW-20260624-002-full-system-reality-audit-and-unblocked-implementation-pass.md`

Register: `tasks-pending/2026-06-24-full-system-reality-audit-and-unblocked-implementation-pass.md`

## Executive Verdict

Status: `LOCAL VERIFIED` for the public visual repair, authenticated
role-flow/navigation proof, and credential-free website-assistant runtime audit
on top of the PR #14 owner-review candidate. Commit/push of the latest
assistant-runtime batch is the next step.

PR #14 is not merged, not deployed, and not live-verified. Public production
still shows the header-to-hero gap and lacks semantic active-state attributes
on homepage filter chips. The local PR #14 worktree now fixes those two public
homepage issues and records computed screenshot evidence.

## Current Git Truth

| Item | Current evidence |
| --- | --- |
| Worktree | `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review` |
| Branch | `codex/integration-navigation-owner-review-20260624` |
| Local HEAD at audit start | `7da18227804498d8868201f8f94a266da048ba50` |
| Remote PR #14 head at audit start | `7da18227804498d8868201f8f94a266da048ba50` |
| Remote `master` | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| PR #14 | Open draft, merge state `CLEAN`, no status checks attached |
| PR #12 head | `428ee78682a201b233b2f3da71bf0205b48812ad`, ancestor of PR #14 HEAD |
| PR #13 head | `6560b8f02580e5f182a95df84ad8d5383403d887`, ancestor of PR #14 HEAD |
| Production deployed SHA | Not established without production/Railway readback approval |
| Dirty worktree inventory | `docs/owner-review/DIRTY-WORKTREE-INVENTORY.csv` |

## Why Previous Work Was Not Visible

- PR #14 is still a draft branch and has not been merged to `master`.
- The release candidate has not been deployed.
- Production public CSS/HTML therefore still reflects the old homepage hero
  margin and active-filter semantics.
- GitHub Actions is not attached because the attempted workflow push was
  rejected by GitHub: the current OAuth app lacks `workflow` scope.

## Production Versus PR #14 Versus Local

| Feature | Production public | PR #14 before this batch | Local after this batch |
| --- | --- | --- | --- |
| Service Provider Directory nav | Public read required; previous public report said absent/stale | Present in PR #14 | Present |
| One Time nav | Public read required; previous public report said absent/stale | Present in PR #14 | Present |
| Header-to-hero gap | Fails: 58px mobile, 70px tablet/desktop | Failed before fix | Passes: 0px at 390x844, 768x1024, 1440x900 |
| Active homepage filters | Contrast passes, semantics fail | Contrast passed, semantics failed | Contrast passes and `aria-pressed=true` is present |
| Public placeholder text | No homepage placeholder hits in computed audit | No homepage placeholder hits | No homepage placeholder hits |
| Deployment/live verification | Public stale | Not deployed | Not deployed |

Evidence: `docs/owner-review/PUBLIC-VISUAL-AUDIT.md` and
`ops/playwright-smokes/2026-06-24-owner-review-public-visual/report.json`.

## Website Assistant Runtime Audit

- Added `npm run owner-review:assistant-runtime`.
- Static checks prove the browser widget uses the shared server-side assistant
  endpoints for chat/history/context and contains no hosted-provider key or
  direct model-call logic.
- A local `ONE_TIME_REVIEW_ONLY_NO_DB=1` Express smoke verifies the anonymous
  public assistant context endpoint returns a scoped anonymous actor.
- The same smoke verifies database-backed assistant history returns the
  explicit no-DB blocker, so the packet does not pretend persisted
  conversations were tested without a database.
- Optional persisted chat/message smoke is gated behind
  `BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL`, and only local/test Postgres URLs
  are accepted. The script intentionally ignores production `DATABASE_URL` and
  `.secrets`.

Evidence: `docs/owner-review/ASSISTANT-RUNTIME-AUDIT.md` and
`ops/qa-runs/2026-06-24-owner-review-assistant-runtime/report.json`.

## Visual Defects Found

| Route | Viewport | Selector | Observed | Expected | Severity | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 390x844 | `.hero` after `.bna-site-nav` | 58px gap between nav bottom and hero top | Gap <= 1px | P1 | Fixed locally |
| `/` | 768x1024 | `.hero` after `.bna-site-nav` | 70px gap between nav bottom and hero top | Gap <= 1px | P1 | Fixed locally |
| `/` | 1440x900 | `.hero` after `.bna-site-nav` | 70px gap between nav bottom and hero top | Gap <= 1px | P1 | Fixed locally |
| `/` | all audited viewports | `.home-filter-chip.is-active` | Active filter relied on CSS class only | Semantic active state via pressed/tab/current state | P2 | Fixed locally with `aria-pressed` |

## Visual Defects Fixed

- Removed legacy desktop/tablet `.hero { margin-top: 70px; }`.
- Removed legacy mobile `.hero { margin-top: 58px; }`.
- Added `aria-pressed` to homepage blog and FAQ filter chips.
- Split hover, focus, and active filter-chip styles so focus remains visible.
- Added a non-color active marker through `.home-filter-chip.is-active::before`.
- Added `npm run owner-review:visual` with bounding-rectangle and computed
  contrast/semantic assertions.

## Authenticated Navigation Harness Added

- `npm run owner-review:role-flows` now asserts the expected assistant surface
  for every local synthetic role journey.
- Parent, student, provider, provider participant, and One Time member journeys
  fail on forbidden cross-role fixture text, so the smoke catches obvious local
  relationship/scope leakage.
- The super-admin Operations journey now clicks the workspace switcher into the
  One Time Mishnah Class provider workspace (`rabbi_sheller_provider`) on
  desktop and mobile.
- The generated `ROLE-FLOW-QA.md` report records deep-link loading, refresh,
  back navigation, workspace switching, logged-out/wrong-role recovery, failure
  state, assistant surface, console errors, broken images, links, overflow, and
  mobile tap-target findings.

## Test Count Reconciliation

| Count | Current interpretation | Evidence |
| --- | --- | --- |
| 1118/1118 | PR #12 complete-system-reconciliation full `npm test` count, not PR #14 final count | `ops/execution-runs/2026-06-23-complete-system-reconciliation/TEST-RESULTS.md` |
| 1202/1202 | Mentioned in the current task queue narrative, but no matching PR #14 evidence file was found in this worktree during this pass | Needs stale-evidence cleanup if used as authoritative proof |
| 1213/1213 | PR #14 owner-review candidate full `npm test` count before this visual batch | `tasks-pending/2026-06-24-integration-navigation-owner-review-closeout.md` and `ops/agent-task-ledger.jsonl` |
| 1214/1214 | Current full `npm test` count after adding the public visual contract test | This pass: `npm test` at 2026-06-24T09:04+03:00 |

Do not reuse `1213/1213` for the post-visual-fix SHA. The current
credential-free evidence is `1214/1214`.

## Remaining Decisions

- `DEC-20260624-001`: GitHub workflow permission for CI.
- `DEC-20260624-002`: Read-only production/Railway/private runtime readback.
- `DEC-20260624-003`: Safe authenticated demo sessions or fixture policy.
- `DEC-20260624-004`: Class-intake production job range and readback target.
- `DEC-20260624-005`: Stripe sandbox credentials and billing policy.
- `DEC-20260624-006`: Vimeo test token/account/folder/asset.
- `DEC-20260624-007`: Merge/deploy/live verification approval.

## Current Overall State

`PARTIAL`: PR #14 has local visual release-acceptance, role-flow navigation,
and credential-free assistant runtime evidence, but it is not merged, not
deployed, and not live-verified. Persisted assistant chat/message proof still
requires a local/test database or approved production readback.
