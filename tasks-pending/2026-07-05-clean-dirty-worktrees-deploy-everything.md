# Ramble Intake - 2026-07-05 - Clean Dirty Worktrees And Deploy Everything

## Raw intake

> Look, there's a lot of, you know, stuff that's not getting deployed because of the dirty work trees. Can you please clean everything up and just deploy everything? And don't stop till you're done. There's tons of stuff that needs to just get pushed live.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-007 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-05-clean-dirty-worktrees-deploy-everything.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Clean up the BNA v2.0 dirty worktrees, commit and push deployable scoped work, run required verification, and deploy/live-smoke everything that can safely go live while recording blockers for anything unsafe or externally blocked. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Terminal requirement IDs reached | REQ-20260705-201, REQ-20260705-202, REQ-20260705-203, REQ-20260705-204, REQ-20260705-205, REQ-20260705-206 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-201 | Audit dirty git/worktree state and active release blockers. | RAW-20260705-007 | bna_platform / release_closeout | Codex | release_audit | P0 | B0 | none | Current branch, active run, merged/deleted branches, open PRs, and dirty file groups are inspected and summarized. | tasks-pending/2026-07-05-clean-dirty-worktrees-deploy-everything.md | no | Done |
| REQ-20260705-202 | Classify dirty changes into safe deployable batches, evidence-only batches, and blocked/risky batches. | RAW-20260705-007 | bna_platform / release_closeout | Codex | release_reconciliation | P0 | B1 | REQ-20260705-201 | No secrets/private raw data/unrelated unfinished work are staged; deployable files are grouped by surface and requirement. | tasks-pending/2026-07-05-clean-dirty-worktrees-deploy-everything.md | no | Done |
| REQ-20260705-203 | Run focused and release-gate verification for deployable batches. | RAW-20260705-007 | bna_platform / release_closeout | Codex | verification | P0 | B2 | REQ-20260705-202 | Relevant tests, watchdogs, secrets checks, and smokes pass, or exact blockers are recorded. | See Final audit. | no | Done |
| REQ-20260705-204 | Commit and push safe scoped release work to GitHub. | RAW-20260705-007 | bna_platform / release_closeout | Codex | publish | P0 | B3 | REQ-20260705-203 | Safe changes are committed and pushed from a branch with a valid remote; merged/gone branch state is not used as a deploy target. | PR #94 / PR #95 | no | Done |
| REQ-20260705-205 | Deploy app-visible/server-visible safe releases and run live smokes. | RAW-20260705-007 | bna_platform / release_closeout | Codex | deployment | P0 | B4 | REQ-20260705-204 | Deployment reaches success and canonical live smokes/readbacks pass, or deploy/live blocker is explicit. | Railway deployments `16f668d8-8cec-4319-8b3e-5aa0319dfc7e` and `e99f7921-5691-4b83-b5a9-1c7dfd787f71` | yes | Done |
| REQ-20260705-206 | Record blocked/non-deployable work with exact owner and next action. | RAW-20260705-007 | bna_platform / release_closeout | Codex | blockers | P0 | B5 | REQ-20260705-201 | Credentials/account/DNS/payment/access/private-data/external-provider blockers are concise and reusable. | tasks-pending/2026-07-05-clean-dirty-worktrees-deploy-everything.md | no | Done |

## Parsed tasks

Do not fan out one broad source into dozens of visible Tasks. Collapse related
source statements into canonical executable requirements and only create visible
Tasks for clear human actions.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260705-201 | release-cleanup-deploy-safe-work | Clean dirty release state and deploy safe work. | Codex | bna_platform / release_closeout | RAW-20260705-007 | REQ-20260705-201..206 | Release branch and live-smoke unblocker are merged and deployed; external-provider/account actions remain gated by DEC-20260705-201. | Done / Activity | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260705-201 | External release/provider/account actions remain gated. | Exact approvals/credentials for any Telegram worker restart, Google reauthorization, Drive writes, DNS changes, payment/access actions, live sends, or provider mutations. | Shloimie / account owners | Ship verified repo/app changes first; keep external/account actions blocked unless already approved in a scoped requirement. | Pause all deploys until every external item is available; risky and unnecessary for unrelated app fixes. | Safe app fixes can still go live while true external blockers remain visible. | Provide exact approval and aliases for any blocked external action that must ship. | REQ-20260705-205, REQ-20260705-206 | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260705-201 | Which dirty file groups are already merged/pushed in another worktree or PR? | Avoid duplicate commits and accidental reverts while cleaning shared dirty state. | yes for affected files only | Answered |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260705-201 | Dirty-worktree cleanup should preserve and ship verified real work, not reset or discard user/agent changes. | no | Already covered by AGENTS.md publish and dirty-worktree rules. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260705-201 | Git worktrees, branch/PR state, active run | Inspected status, branches, worktrees, PRs, current master, and active run. Created clean worktree `C:\Users\User\BNA-release-cleanup-20260705` from `origin/master` because the original dirty checkout was stale and its PR branch was already merged/deleted. | `git status`, `git worktree list`, `gh pr status`, `gh pr view 87/89/90`, `npm run bna:run:status`, `npm run bna:run:next` | `cffe4d04` / PR #94 | `origin/codex/dirty-worktree-release-cleanup-20260705` | Not required |
| REQ-20260705-202 | Dirty file groups | Carried forward only scoped deployable/evidence batches: OneTimeOneTime landing/signup funnel, Job 101 Contacts/helper fixes, Telegram/Google agent-fleet readiness fixes, ChatGPT dropoff fleet claim completion fix, and this cleanup register. Did not stage stale checkout deletions or external-provider actions. | Diff/readback, renumbered raw IDs, scoped file selection, tracked secret audit | `cffe4d04` / PR #94 | `origin/codex/dirty-worktree-release-cleanup-20260705` | Not required |
| REQ-20260705-203 | Release candidates | Ran syntax checks, focused tests, PQC validation, One Time canonical local journey smoke, action watchdog, agent-fleet readiness, run status/validation, full `npm test`, secrets audit, and whitespace checks. Fixed stale One Time setup test artifacts found by full-suite verification. | `node --check ...`, `node --test ...`, `npm test` 1511/1511, `npm run pqc:validate -- ops/prompt-packets/2026-07-05-onetime-landing-signup-funnel/01-public-landing-signup-funnel.product-quality.json`, `npm run one-time:smoke:canonical-journey-local`, `npm run watchdog:actions` -> `ops/watchdog-audits/2026-07-05T12-55-watchdog-action-audit.md`, `npm run agent:fleet:readiness -- --json`, `npm run bna:run:status`, `npm run bna:run:validate`, `npm run secrets:audit`, `git diff --check` | `cffe4d04` / PR #94; `980e1c3d` / PR #95 for the live-smoke copy unblocker | pushed and merged | Not required before deploy |
| REQ-20260705-204 | Git branch/PR | Scoped release branch `codex/dirty-worktree-release-cleanup-20260705` committed and pushed; PR #94 merged. Follow-up one-line One Time email-review copy fix committed as `980e1c3d` and merged in PR #95 after live smoke exposed the missing visible marker. | `git diff --cached --check`; `npm run secrets:audit`; `gh pr view 94/95`; PR merge readbacks | `cffe4d04`; `980e1c3d` | PR #94 merge `a47b4e68024b82017874c76ad8c984785a93f361`; PR #95 merge `cbfd5a1fd07af92bfa7edd57a7b023ed301d69dc` | Not required |
| REQ-20260705-205 | Railway/app surfaces | Railway auto-deployed PR #94 merge, then PR #95 email-review smoke-copy unblocker. Production target readback confirmed project `skillful-motivation`, environment `production`, service `skillful-motivation`, custom domain `bneineviimacademy.org`. | Approved release gate passed with optional integrations/readback deferred; Railway status readbacks; broad and focused live smokes | `cffe4d04`; `980e1c3d` | master at `cbfd5a1fd07af92bfa7edd57a7b023ed301d69dc` | Railway deployment `16f668d8-8cec-4319-8b3e-5aa0319dfc7e` for PR #94 and `e99f7921-5691-4b83-b5a9-1c7dfd787f71` for PR #95; live smokes listed in Final audit |
| REQ-20260705-206 | Register/ledger/changelog | Recorded gated external/provider/account work in DEC-20260705-201 and final evidence here, in `TASKS.md`, `ops/agent-changelog.md`, and `ops/agent-task-ledger.jsonl`. | Register final audit; ledger/changelog append; no-send/no-payment/no-DNS guardrails in smoke reports | Closeout records commit | Closeout records branch | Not required; records-only closeout |

## Current findings

- Current branch at intake: `codex/chatgpt-dropoff-publish-defaults-20260704`.
- GitHub PR readback: PR #90 for this branch is already merged; the remote tracking branch is gone.
- Active execution run: `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation`.
- `npm run bna:run:status`: validation passed; 6 done, 4 blocked, work remains.
- `npm run bna:run:next`: validation passed; next unblocked executable batch is none.
- Original dirty checkout branch `codex/chatgpt-dropoff-publish-defaults-20260704`
  corresponds to PR #90, which was already merged and whose remote branch was
  removed.
- `origin/master` already included later live evidence, so deploying or
  committing the original dirty checkout wholesale would have risked reverting
  newer master files. Cleanup work moved to clean branch
  `codex/dirty-worktree-release-cleanup-20260705`.
- Local-only 2026-07-05 raw records were renumbered to avoid the existing
  `RAW-20260705-001` keyholder/live-deploy follow-up already on master.
- Non-blocking existing protocol drift remains in
  `ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/README.md`;
  the new One Time landing PQC packet validates.
- Full-suite verification passed after cleanup fixes: `npm test` 1511/1511.
- Full-suite fixes applied: the One Time Railway provisioner apply-mode test
  now writes its guarded blocked-apply report to a temp path instead of
  overwriting tracked Railway evidence; One Time Operations mobile table
  headers remain visible instead of using `display: none`; the Resend
  walkthrough names its setup-center anchor; action parity artifacts were
  regenerated.
- PR #94 merged the safe release batch to `master` at
  `a47b4e68024b82017874c76ad8c984785a93f361`; Railway deployment
  `16f668d8-8cec-4319-8b3e-5aa0319dfc7e` reached `SUCCESS` for that commit.
- The first full One Time shared-review live smoke found a missing visible
  email-review coverage marker. PR #95 added the stable no-send copy and
  merged at `cbfd5a1fd07af92bfa7edd57a7b023ed301d69dc`; Railway deployment
  `e99f7921-5691-4b83-b5a9-1c7dfd787f71` reached `SUCCESS`.
- Railway doctor target guard passed with explicit production project/service
  IDs, but the `railway link` substep reported `Unauthorized` with the
  project token. This is recorded as a CLI token/link limitation, not a
  deployment blocker, because `railway status --json` read back the expected
  project/service/domain and successful deployment commit.
- No checkout session, charge, payment link creation, member creation, access
  grant, live email/WhatsApp/SMS/Telegram send, DNS change, Drive write,
  external CRM write, provider account mutation, or database cleanup mutation
  was performed.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260705-201 | Done | Clean worktree created from `origin/master`; stale merged PR #90 checkout avoided; active run inspected. | raw-input/RAW-20260705-007-clean-dirty-worktrees-deploy-everything.md; tasks-pending/2026-07-05-clean-dirty-worktrees-deploy-everything.md | `git status`, `git worktree list`, `gh pr status`, `gh pr view 87/89/90`, `npm run bna:run:status`, `npm run bna:run:next` | None for audit |
| REQ-20260705-202 | Done | Scoped batches selected and copied into clean worktree; raw IDs renumbered to avoid collision; external actions left gated. | One Time app/config/tests/evidence; Operations/helper tests; Telegram/Google fleet hardening; ChatGPT dropoff collector; raw-input/tasks-pending records | Diff/readback, tracked secret audit | External provider/account mutations remain gated by DEC-20260705-201 |
| REQ-20260705-203 | Done | Local verification passed except existing protocol drift finding unrelated to this batch. Full `npm test` passed after fixing stale test/report churn. | tests, scripts, app files, action registry, PQC packet, smoke evidence | Syntax checks; focused tests; `npm test` 1511/1511; One Time canonical local smoke; PQC validation; action watchdog 0 findings at `ops/watchdog-audits/2026-07-05T12-55-watchdog-action-audit.md`; agent-fleet readiness OK; active-run validation; secrets audit; `git diff --check`; `npm run watchdog:protocol-drift` produced existing drift report | Existing protocol drift in the 2026-07-03 helper-bot packet remains non-blocking and should be worked separately |
| REQ-20260705-204 | Done | Commit `cffe4d04` pushed to `origin/codex/dirty-worktree-release-cleanup-20260705`; PR #94 merged to master at `a47b4e68024b82017874c76ad8c984785a93f361`. Commit `980e1c3d` pushed for the email-review smoke-copy fix; PR #95 merged to master at `cbfd5a1fd07af92bfa7edd57a7b023ed301d69dc`. | Clean release branch files; `public/one-time-email-review.html` follow-up copy fix | `git diff --cached --check`; `npm run secrets:audit`; `gh pr view`; merge readbacks | None for publish |
| REQ-20260705-205 | Done | Railway deployment `16f668d8-8cec-4319-8b3e-5aa0319dfc7e` reached `SUCCESS` for PR #94 merge; Railway deployment `e99f7921-5691-4b83-b5a9-1c7dfd787f71` reached `SUCCESS` for PR #95 merge. Live proof: `ops/live-smokes/2026-07-05T13-10-14-373Z-live-app-smoke.md`; `ops/live-smokes/2026-07-05T13-11-02-710Z-rabbi-onetime-landing-smoke.md`; `ops/live-smokes/2026-07-05T13-08-16-893Z-one-time-shared-review-live-smoke.md`; `ops/live-smokes/2026-07-05T13-09-42-151Z-one-time-crm-contacts-ux-live-smoke.md`; `ops/live-smokes/2026-07-05T13-09-54-965Z-mobile-assistant-keyboard-live-smoke.md`; `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed. | App/server/static files from PR #94 and PR #95 | Approved release gate passed; Railway status readback; `npm run app:smoke`; `npm run app:smoke:rabbi-onetime-landing`; `npm run app:smoke:one-time-shared-review`; `npm run app:smoke:one-time-crm-contacts-ux`; `npm run app:smoke:mobile-assistant-keyboard`; separate One Time domain smoke | Existing optional/external provider readbacks remain gated by DEC-20260705-201, not claimed complete |
| REQ-20260705-206 | Done | DEC-20260705-201 remains open for any future external/provider/account action. This register, `TASKS.md`, `ops/agent-changelog.md`, and `ops/agent-task-ledger.jsonl` record the deploy proof and blockers. | This register; `TASKS.md`; `ops/agent-changelog.md`; `ops/agent-task-ledger.jsonl` | Final audit table complete; no-send/no-payment/no-DNS guardrails recorded | External account actions require exact approval/credentials before execution |
