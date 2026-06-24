# Issue #20 Parent Run - 2026-06-24

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-009 |
| Source | GitHub issue #20 |
| Source URL | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/20` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-24-issue-20-parent-run.md` |
| Execution run | `ops/execution-runs/2026-06-24-issue-20-parent-run/` |
| Working branch | `codex/issue-20-parent-run-20260624` |
| Base branch | `codex/issue-18-class-intake-readonly-20260624` |

## Sequencing

Issue #18 is terminal before this parent run starts.

| Field | Value |
|---|---|
| Issue #18 verdict | `NOT SAFE TO APPLY - reasons listed` |
| Issue #18 PR | `https://github.com/shloimie-beep/bnei-neviim-academy/pull/21` |
| Issue #18 terminal comment | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18#issuecomment-4792923047` |
| Parent run rule | This Issue #20 run owns `ops/execution-runs/latest.json`; child lanes must not rewrite it. |

## Parsed Requirements

| ID | Requirement | Source | Owner | Batch | Dependencies | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|
| REQ-20260624-040 | Register Issue #20 parent run, recheck baseline truth, and create coordination manifest. | Issue #20 objective, baseline, execution ordering | Codex | 0 | none | no | Done |
| REQ-20260624-041 | Audit/fix global visual quality, design invariants, and permanent visual watchdogs. | Requirement group A | Codex | A | REQ-20260624-040 | yes | Blocked: local verified, deploy/live proof pending |
| REQ-20260624-042 | Build secure persistent authenticated browser profile harness and ChatGPT Agent distinction docs. | Requirement group B | Codex | B | REQ-20260624-040 | no | Done |
| REQ-20260624-043 | Build helper/bot canonical resolver, intent matrix, and agent-mode role QA. | Requirement group C | Codex | C | REQ-20260624-040 | yes | Blocked: local verified, deploy/live proof pending |
| REQ-20260624-044 | Build/verify durable agent result drop-off and GitHub issue/comment bridge. | Requirement group D | Codex | D | REQ-20260624-040 | yes | Not started |
| REQ-20260624-045 | Harden agent fleet, permission tiers, startup, parent coordination, and background proof. | Requirement group E | Codex | E | REQ-20260624-040 | no | Not started |
| REQ-20260624-046 | Reconcile queue hygiene and owner-facing lanes without erasing history. | Requirement group F | Codex | F | REQ-20260624-040 | yes | Not started |
| REQ-20260624-047 | Create owner setup/walkthrough page and repo artifact. | Requirement group G | Codex | G | REQ-20260624-040 | yes | Not started |
| REQ-20260624-048 | Integrate, test, PR/merge/deploy/live-verify, clean up, and produce final 27-section response. | Release/final response | Codex | Z | REQ-20260624-041 through REQ-20260624-047 | yes | Not started |

## Parsed Tasks

No new visible human Tasks are created at registration. This is Codex/agent work under the active parent run. True external-account, credential, DNS, send, charge, publish, or production-mutation blockers must become Decisions when encountered.

## Decisions

No immediate owner Decision is created at registration. Future Decisions must be one-per-blocker and must not duplicate existing external blockers.

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-040 | Run files, `TASKS.md`, raw intake, coordination manifest | Register parent run, recheck baseline, write coordination rules. | Baseline readback, live health readback, Issue #18 GitHub evidence, run validation, source coverage, stale-evidence check, JSON/JSONL parse, and coordination manifest recorded. | `3e0902f651302ae594e5462f3a88913b40406d8c` | `origin/codex/issue-20-parent-run-20260624` at `3e0902f651302ae594e5462f3a88913b40406d8c` | Not required |
| REQ-20260624-041 | Public/Operations/provider/parent/student/One Time/support UI, watchdogs, tests | Hardened permanent visual watchdog with local browser matrix; fixed public nav clipping, One Time review tap targets, and One Time consent checkbox sizing. | `npm run watchdog:visual:local`; `npm run owner-review:visual`; focused tests 22/22; `npm run watchdog:ui`; `npm run watchdog:visual` | Pending checkpoint commit | Pending push | Required before Done; blocked on final deploy/live proof |
| REQ-20260624-042 | `scripts/agent-browser-profile.mjs`; `tests/agent-browser-profile-harness.test.js`; `docs/agent-browser-harness.md`; `ops/execution-runs/2026-06-24-issue-20-parent-run/AGENT-BROWSER.md`; `package.json` | Built secure local profile manager with six named profiles, non-repo root enforcement, lifecycle commands, Windows ACL hardening, health/list/init/smoke commands, and ChatGPT Agent/connector distinction docs. | `node --check scripts\agent-browser-profile.mjs`; focused harness tests 3/3; list/health readbacks; temp-root One Time smoke; default-root initialization; final health/ACL readback | Pending checkpoint commit | Pending push | Not required |
| REQ-20260624-043 | `src/lib/bna/helper/destination-resolver.js`; `src/lib/bna/helper/tool-registry.js`; `scripts/watchdog-helper-destinations.mjs`; `tests/helper-destination-resolver.test.js`; `ops/action-registry.json`; matrix evidence | Added registry-backed destination resolver, wired helper navigation through it, registered the helper navigation action, added deterministic intent/role matrix tests, and added a reusable helper-destination watchdog. | Resolver syntax checks; focused resolver/helper/action/control-plane tests; action watchdog; helper destination watchdog 10/10 | Pending checkpoint commit | Pending push | Required before Done; blocked on final deploy/live proof |
| REQ-20260624-044 | Result API/action, Operations activity UI, GitHub intake/status bridge | Make agent result drop-off durable and idempotent. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-045 | Agent fleet scripts, startup scripts, coordination manifest, tests | Harden existing fleet and prove background flow. | Pending | Pending | Pending | Not required unless app-visible work is added |
| REQ-20260624-046 | Operations queue APIs/UI, queue audits, tests | Reconcile lanes and hide stale/internal current-work clutter. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-047 | Owner walkthrough page/docs | Produce setup and recovery walkthrough. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-048 | Integration branch/PR/deploy/live-smoke/closeout | Integrate all terminal lanes and produce final response. | Pending | Pending | Pending | Required before Done |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-040 | Done | Raw source captured; parent run initialized; Issue #18 terminal evidence linked; baseline readback and parent coordination manifest recorded; checkpoint pushed. | `raw-input/RAW-20260624-009-github-issue-20-goal.md`; run files; this register; `TASKS.md`; `memory/2026-06-24.md` | Issue #18 PR/comment verified; direct live health HTTP 200; Railway targeting blocker recorded for final release; `npm run bna:run:validate`; `npm run bna:run:source-coverage`; `npm run bna:run:stale-evidence`; JSON/JSONL parse; `git diff --check`; `npm run bna:run:next` selected `REQ-20260624-041` | None for baseline. Final deploy/live closeout remains blocked until Railway targeting is repaired or an approved alternate live-smoke path is recorded under `REQ-20260624-048`. |
| REQ-20260624-041 | Blocked: local verified, deploy/live proof pending | Visual watchdog and screenshot matrix created; public nav, One Time review, and One Time consent sizing fixes implemented and locally verified. | `scripts/watchdog-visual-baseline.mjs`; `package.json`; `public/css/bna-site-nav.css`; `public/css/one-time-shared-review.css`; `public/js/bna-site-nav.js`; `public/index.html`; `public/one-time/index.html`; visual evidence files | `npm run watchdog:visual:local` 0 findings across 9 routes and 3 viewports; `npm run owner-review:visual`; focused tests 22/22; static UI and visual watchdogs | App-visible changes require deploy/live proof. Final closeout is gated by the Railway targeting blocker carried under `REQ-20260624-048`. |
| REQ-20260624-042 | Done | Agent browser harness script, docs, test, and run evidence created; six named local profile directories initialized outside the repo with metadata and ACL checks. | `scripts/agent-browser-profile.mjs`; `tests/agent-browser-profile-harness.test.js`; `docs/agent-browser-harness.md`; `ops/execution-runs/2026-06-24-issue-20-parent-run/AGENT-BROWSER.md`; `package.json` | `node --check scripts\agent-browser-profile.mjs`; `node --test tests\agent-browser-profile-harness.test.js` 3/3; `npm run agent:browser:list -- --json`; `npm run agent:browser:health -- --json`; temporary external-root `one_time_review` smoke; `npm run agent:browser:init -- --json`; final health confirmed metadata, current-user ACL, and inheritance disabled; run validate/source coverage/stale-evidence, JSON/JSONL parse, secret audit, diff check, and next-batch selection passed | None. Continue to `REQ-20260624-044` after Batch C local closeout. |
| REQ-20260624-043 | Blocked: local verified, deploy/live proof pending | Helper destination resolver and watchdog matrix created; `open_operations_view` now returns registry-backed route/action/scope metadata and safe fallbacks. | `src/lib/bna/helper/destination-resolver.js`; `src/lib/bna/helper/tool-registry.js`; `scripts/watchdog-helper-destinations.mjs`; `tests/helper-destination-resolver.test.js`; `ops/action-registry.json`; `ops/helper-destination-qa/20260624T203546Z/`; `ops/execution-runs/2026-06-24-issue-20-parent-run/HELPER-LINK-QA.md` | `node --check` resolver/tool-registry/watchdog script; resolver tests 5/5; helper+resolver tests 15/15; action-registry Telegram/UI/bot tests 33/33; control-plane scope tests 10/10; `npm run watchdog:actions` 0 findings; `npm run watchdog:helper-destinations` 10/10 cases | Server-visible helper behavior requires deploy/live proof. Final closeout is gated by the Railway targeting blocker carried under `REQ-20260624-048`. |
