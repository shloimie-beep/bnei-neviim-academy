# Ship PR 87 One Time UI Live Cleanup - 2026-07-04

## Raw intake

See `raw-input/RAW-20260704-001-ship-pr87-onetime-ui-live-cleanup.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260704-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-04-ship-pr87-onetime-ui-live-cleanup.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Finish, verify, push, and make live the currently referenced BNA/Rabbi/One Time work items, including PR-87, One Time UI mismatch, studio work, and content job 101 repair, with required intake/register/proof records and explicit blockers for anything that cannot be shipped safely. |
| Goal tool used | yes |
| Execution directive | Register first, then validate/ship the already-local verified PR #87/UI/Studio work where safe; leave external/account/data-mutating items blocked with exact next action. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260704-104 and REQ-20260704-107 remain blocked by release gate/deploy/live-smoke proof |

## 2026-07-05 combined release update

| Field | Value |
|---|---|
| PR #89 Studio status | Merged into PR #87 release branch |
| PR #89 merge commit | `0842e5e26bd5887942c12744cd23f08332285c09` |
| PR #87 current head | `4e02b676622185c385cfe1f0c6b2262d7d45ca3d` |
| PR #87 readback | open, ready, mergeable, `mergeStateStatus=CLEAN` |
| Production deploy | not performed |
| Reason deploy did not run | guarded deploy gate blocked before mutation on missing integration/readback readiness |

Combined release verification after merging Studio into PR #87:

- PASS `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-contacts-intake-cleanup.test.js tests/one-time-communications-workspace.test.js tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` with `NODE_PATH=C:\Users\User\BNA v2.0\node_modules` - 23/23.
- PASS `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json`.
- PASS `npm run pqc:validate ops/prompt-packets/2026-07-02-studio-content-engine-live-readiness/05-studio-desktop-layout-cleanup.product-quality.json`.
- PASS `npm run watchdog:actions` - finding_count 0.
- PASS `npm run watchdog:protocol-drift` - findings 0.
- PASS `git diff --check origin/master...HEAD`.
- PASS `npm run bna:release-gate -- --json --expected-branch codex/rabbi-onetime-ui-cleanup-release-20260703` from a clean worktree.
- BLOCKED `BNA_PRODUCTION_DEPLOY_APPROVED=approved npm run bna:release-gate -- --deploy --confirm-deploy DEPLOY_BNA_PRODUCTION_CLOSEOUT --expected-branch codex/rabbi-onetime-ui-cleanup-release-20260703 --json` before production mutation on the deploy blockers below.

Final master-merge readback:

- Merged current `origin/master` into PR #87 to clear GitHub's conflict state.
- Resolved append-only conflicts in `ops/agent-changelog.md` and `ops/agent-task-ledger.jsonl` by preserving both sides.
- PASS ledger JSONL parse after merge resolution - 1503 records.
- PASS combined UI + Studio focused suite 23/23 after the master merge.
- PASS `npm run secrets:audit` after the master merge.
- PASS `git diff --check origin/master...HEAD`.
- PASS PR #87 readback at head `4e02b676622185c385cfe1f0c6b2262d7d45ca3d`: open, ready, mergeable, `mergeStateStatus=CLEAN`.
- PASS clean release gate dry-run at head `4e02b676622185c385cfe1f0c6b2262d7d45ca3d`.
- BLOCKED deploy gate at head `4e02b676622185c385cfe1f0c6b2262d7d45ca3d` before production mutation on the same readiness blockers.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260704-101 | Preserve the July 4 ship/live request and create this continuation register. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | intake | P0 | B0 | none | Raw intake, register, memory note, and ledger entry exist before release work. | raw-input, tasks-pending, memory, ledger | no | Done |
| REQ-20260704-102 | Reconcile PR #87, the current branch, and dirty worktree so only intended UI/Studio/Job101 release files are staged or shipped. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | release_audit | P0 | B1 | REQ-20260704-101 | PR #87 state, branch, commits, diff, and unrelated changes are inspected; no unrelated user work is silently staged or reverted. | git/PR metadata, changed files | no | Done |
| REQ-20260704-103 | Run focused validation for Rabbi/One Time UI cleanup, Studio work, action/route/protocol gates, and content job 101 repair state. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | verification | P0 | B2 | REQ-20260704-102 | Relevant tests/watchdogs/smokes pass, or exact blocker is recorded; no raw transcript body is exposed. | tests, watchdog reports, UI/studio evidence | no | Done |
| REQ-20260704-104 | Push, undraft/merge, deploy, and live-smoke PR #87 if validation and release policy allow. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | deploy_release | P0 | B3 | REQ-20260704-103 | PR #87 is pushed/current, ready or merged as appropriate, deployed to the intended service, and live smokes prove the UI/Studio contracts are live; otherwise exact release blocker is recorded. | GitHub PR, Railway/deploy evidence, live smoke reports | yes | Blocked - PR ready, deploy gate blocked |
| REQ-20260704-105 | Keep content_job:101 repair honest: close only triage/parser work that has proof, and block DB cleanup or score/progress writes that need approval/reachability. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | content_job_repair | P0 | B2 | REQ-20260704-102 | Job 101 triage, parser repair, DB cleanup, and private transcript-doc sync statuses are separated; raw transcript body is not committed. | ops/drive-transcript-visibility, task registers | no | Done for parser/private docs; DB/score cleanup blocked |
| REQ-20260704-106 | Record final evidence, ledger/changelog entries, and remaining operator/provider decisions. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | closeout | P0 | B4 | REQ-20260704-103 | Register, ledger, changelog, and final response name shipped proof or blockers. | tasks-pending, ledger, changelog | no | Done |
| REQ-20260704-107 | Scope the separately verified Studio work into its own clean branch and PR. | RAW-20260704-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | studio_release | P0 | B3b | REQ-20260704-103 | Studio changes are isolated from unrelated dirty work, validated, committed, pushed, and opened as a PR; deploy/live smoke remains blocked until release gate clears. | GitHub PR #89, Studio branch, tests, Studio register | yes | Done for PR; deploy/live-smoke blocked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260704-101 | External One Time provider setup cannot be completed by Codex without remaining exact account aliases/approvals. | Zoom session alias, Vimeo access token/drop folder, Stripe sandbox key and price, Whapi/WAPI instance and phone, campaign copy/list/suppression/seed approval. | Shloimie / provider account owners | Keep UI/Studio release separate from external sends/payments/media setup; ship no-write UI if safe. | Delay entire release until every provider setup item is supplied. | Delaying UI keeps known local fixes out of live; shipping UI still leaves external integrations blocked. | Provide or label remaining aliases/approvals in a provider setup packet. | External setup, live sends/payments/media/campaigns | Open |
| DEC-20260704-102 | content_job:101 DB review cleanup and score/progress/grading writes require reachability and/or exact approval. | Supabase/DB reachability for review-queue cleanup; exact approval packet for score/progress/grading rows. | Codex + Shloimie | Run no-raw-transcript parser/readback work where reachable; keep DB mutation and grading writes blocked until approved. | Apply broad cleanup without fresh readback. | Broad mutation risks closing private/student rows incorrectly. | Retry DB readback; only apply score/progress/grading with `APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY`. | REQ-20260704-105 | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260704-102 | PR #87, current branch, worktree | Inspected PR metadata, branch relation, dirty diff, and release notes. | Done; PR #87 is separate from local Studio/job cleanup changes. | n/a | `9859d51d04db81fee1bd961594f6c256d9c77b84` | n/a |
| REQ-20260704-103 | Rabbi/One Time UI, Studio, Job101 evidence | Re-ran focused tests/watchdogs/smokes needed for release. | Done; combined UI + Studio focused tests 23/23; PQC/actions/protocol checks passed. | n/a | PR #87 head `0842e5e26bd5887942c12744cd23f08332285c09` | n/a |
| REQ-20260704-104 | GitHub/Railway/live routes | Mark PR ready; do not merge/deploy around blocked release gate. | Blocked by deploy gate readiness list. | n/a | PR #87 head already pushed | Blocked; no production deploy or live smoke performed. |
| REQ-20260704-105 | content_job:101 trace/review docs | Keep proven triage/parser/private-doc repair separate from blocked DB/approval actions. | Done/blockers recorded. | n/a | n/a | n/a |
| REQ-20260704-107 | Studio content engine branch/PR | Carve Studio work out of dirty main worktree into a clean stacked PR, then merge it into PR #87. | Done; PR #89 merged into PR #87; PR #87 conflict with master resolved. | `322c848f`, `7d9f8818`, merge `0842e5e2`, final head `4e02b676` | PR #87 head `4e02b676622185c385cfe1f0c6b2262d7d45ca3d` | Blocked; no production deploy or live smoke performed. |

## Release and validation evidence

| Area | Result | Evidence |
|---|---|---|
| PR #87 state | Ready for review, open, mergeable, clean, pushed, now includes Studio and current master | `gh pr view 87 --json number,title,state,isDraft,mergeable,mergeStateStatus,statusCheckRollup,headRefName,url`; PR `https://github.com/shloimie-beep/bnei-neviim-academy/pull/87`; head `4e02b676622185c385cfe1f0c6b2262d7d45ca3d` |
| PR #87 clean release gate | Passed in dry-run mode | `npm run bna:release-gate -- --json --expected-branch codex/rabbi-onetime-ui-cleanup-release-20260703` |
| PR #87 focused UI + Studio tests | Passed 23/23 | `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-contacts-intake-cleanup.test.js tests/one-time-communications-workspace.test.js tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js tests/service-provider-studio-browser-smoke.test.js` |
| PR #87 Product Quality packet | Passed | `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json` |
| PR #87 action/protocol watchdogs | Passed | `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `git diff --check origin/master...HEAD` |
| PR #87 deploy attempt | Blocked; no production deploy performed | `BNA_PRODUCTION_DEPLOY_APPROVED=approved npm run bna:release-gate -- --deploy --confirm-deploy DEPLOY_BNA_PRODUCTION_CLOSEOUT --expected-branch codex/rabbi-onetime-ui-cleanup-release-20260703 --json` |
| Studio work | PR #89 merged into PR #87; deploy/live smoke still blocked | PR `https://github.com/shloimie-beep/bnei-neviim-academy/pull/89`; merge commit `0842e5e26bd5887942c12744cd23f08332285c09`; combined PR #87 head includes Studio; local verification passed 23/23 focused UI + Studio suite, Studio PQC validation, action watchdog, protocol-drift watchdog, and `git diff --check` |
| Job 101 | Parser/private Drive transcript repair done; DB review cleanup and score/progress writes remain guarded | `ops/drive-transcript-visibility/2026-07-02/APPLY-CLOSEOUT.md`; `ops/drive-transcript-visibility/2026-07-02/JOB-101-REVIEW-TRIAGE.md` |

## Deploy blockers

The PR #87 production deploy gate blocked with no production mutation because:

- `OPENAI_API_KEY` is not configured for OpenAI transcription/parser readiness.
- `VIMEO_ACCESS_TOKEN` is not configured for Vimeo/member library readiness.
- `RABBI_STRIPE_SECRET_KEY` and `RABBI_STRIPE_MODE` are not configured.
- `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER` is not configured, and Rabbi worker deployment state is not verified.
- Database external readback readiness is blocked.
- Railway external readback readiness is blocked.
- Drive external readback readiness is blocked.

Resend was removed from the deploy blocker list on 2026-07-05 after the
release readiness helper was corrected to match the runtime contract: production
send requires `RESEND_API_KEY`, `RESEND_DOMAIN`, `RESEND_WEBHOOK_SECRET`, and at
least one sender identity from `RESEND_FROM` or `RESEND_FROM_EMAIL`.

No production deploy, live verification write, external send, payment, DNS,
Drive upload/share, credential change, provider account write, or DB review
mutation was performed.

## 2026-07-05 Resend gate correction readback

- Updated `scripts/lib/integration-readiness.mjs` so `RESEND_FROM_EMAIL`
  satisfies the Resend sender requirement when the formatted `RESEND_FROM`
  alias is absent.
- Added regression tests in `tests/system-truth-scripts.test.js` for both the
  accepted `RESEND_FROM_EMAIL` path and the blocked missing-sender path.
- PASS `node --test tests/system-truth-scripts.test.js tests/bna-production-closeout-gate.test.js`
  with 19/19 tests passing.
- PASS local readiness readback: Resend now reports ready with
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_DOMAIN`, and
  `RESEND_WEBHOOK_SECRET` configured from keyholder; no secret values printed.
- Remaining deploy blockers are OpenAI API key, Vimeo access token, Rabbi
  Stripe key/mode, Rabbi Telegram worker token/deployment verification, and
  database/Railway/Drive external readback readiness.
- No production deploy, live smoke, external send/payment/access/DNS/credential
  mutation, provider account write, or DB review mutation was performed.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260704-101 | Done | raw-input/RAW-20260704-001-ship-pr87-onetime-ui-live-cleanup.md, this register, memory/2026-07-04.md, ledger entry | raw-input, tasks-pending, memory, ledger | File creation | None |
| REQ-20260704-102 | Done | PR #87 metadata and current dirty-worktree scope inspected; PR #87 is separate from local Studio/job cleanup changes. | No product files changed by this July 4 audit; PR #87 worktree stayed clean. | `gh pr view 87`, `gh pr diff 87 --name-only`, `git status`, Studio targeted diff readback | None. |
| REQ-20260704-103 | Done | Focused PR #87 UI validation, PQC validation, action/protocol watchdogs, Studio focused tests, and Job 101 evidence readback. | No product files changed by this July 4 audit; Studio product changes are now in PR #87 via PR #89 merge. | Combined UI + Studio tests 23/23; PQC/actions/protocol checks passed. | None for local validation. |
| REQ-20260704-104 | Blocked | PR #87 marked ready and remains pushed/mergeable/clean; Resend false-positive blocker corrected; deploy gate remains blocked in deploy mode with explicit readiness blockers. | GitHub PR #87 branch includes merged Studio work, current master, and the Resend gate correction. | Deploy gate blocked without production mutation. | Missing OpenAI/Vimeo/Rabbi Stripe/Rabbi Telegram/readback readiness listed above; do not merge/deploy around the guard. |
| REQ-20260704-105 | Done / Blocked | `APPLY-CLOSEOUT.md` proves Job 101 parser output and private Drive transcript doc; `JOB-101-REVIEW-TRIAGE.md` preserves remaining cleanup blockers. | No raw transcript body committed. | Evidence readback only. | DB review cleanup and score/progress/grading writes remain blocked by readback/approval. |
| REQ-20260704-106 | Done | This register, ledger, changelog, and final response. | tasks-pending, ledger, changelog, memory | Closeout records updated. | Goal remains active because deploy/live proof and Studio PR/release remain blocked. |
| REQ-20260704-107 | Done / Blocked | PR #89 opened, pushed, and merged into PR #87; branch records include Studio raw intake, PQC packets, screenshots, watchdog reports, ledger, and changelog. | Studio release branch files only; main dirty worktree not staged. | PR #89 merged; PR #87 open, ready, mergeable, clean; combined local focused suite 23/23, PQC/actions/protocol checks passed. | PR #87 still needs production deploy/live smoke. |
