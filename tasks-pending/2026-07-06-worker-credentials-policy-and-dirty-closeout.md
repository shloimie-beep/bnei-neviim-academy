# Worker Credentials, Provisional AI Video Policy, Dirty Closeout - 2026-07-06

## Raw intake

See `raw-input/RAW-20260706-909-worker-credentials-policy-dirty-closeout.md`.

Credential-specific update: see
`raw-input/RAW-20260706-910-worker-credential-specifics-redacted.md`. The
password is intentionally redacted from tracked files.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-909 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-worker-credentials-policy-and-dirty-closeout.md |

## Goal-led execution

| Field | Value |
|---|---|
| Goal-mode requested | inferred from "clean up everything and push all the other jobs" |
| Active goal objective | Configure worker login/policy safely, audit dirty workspace, and push safe completed jobs |
| Goal tool used | yes |
| Terminal statuses required | Done / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible or credential work | yes |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260706-940 | Configure a temporary `one_time_ai_video_worker` login without committing secrets. | RAW-20260706-909, RAW-20260706-910, RAW-20260706-908 | rabbi_sheller_provider / one_time_mishnah_class | Codex | credentials_access | P0 | B1 | PR #112 deployed | Railway production has worker username/password variables or an explicit credential blocker; credential values are stored only in an untracked/local secret handoff; redacted proof is recorded; live login is smoke-tested if configured. | Railway env, .secrets only, register/ledger/changelog | yes | Done |
| REQ-20260706-941 | Add provisional no-live AI video policy/model/budget defaults for Studio worker handoff. | RAW-20260706-909, RAW-20260706-907 | rabbi_sheller_provider / one_time_mishnah_class | Codex | policy_config | P0 | B1 | PR #112 deployed | A repo-visible policy documents provisional model choice, monthly budget cap, per-run cap, privacy/retention defaults, approval gates, no-live vendor rules, and exact upgrade blockers. Defaults must not create fake API keys or approve generation/upload/credit spend. | docs/config/registers/tests as needed | yes if app-visible | Done |
| REQ-20260706-942 | Audit dirty workspace and classify each unpushed change by scope, owner, safety, and verification status. | RAW-20260706-909 | bna_platform / multiple | Codex | release_audit | P0 | B2 | none | Each dirty file/group is classified as safe to commit/push, leave untouched, blocked, or needs operator decision; unrelated work is not reverted or bundled blindly. | audit note/register | no | Done |
| REQ-20260706-943 | Push every completed scoped dirty job that can be safely verified. | RAW-20260706-909 | bna_platform / multiple | Codex | release_closeout | P0 | B3 | REQ-20260706-942 | Safe scoped jobs are committed, pushed, and deployed/live-smoked if app-visible; incomplete or unsafe jobs have exact blockers and next actions. | varies by classified job | yes when app-visible | Done with blockers |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirements | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260706-940 | onetime-worker-credentials-policy-dirty-closeout | Configure temporary worker login/policy and close out pushable dirty jobs. | Codex | mixed | RAW-20260706-909 | REQ-20260706-940, REQ-20260706-941, REQ-20260706-942, REQ-20260706-943 | Start with worker credential/policy, then dirty-worktree audit. | Agent lifecycle | Pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-940 | Temporary worker login values. | Permanent email/identity and post-handoff password rotation path. | Shloimie / Codex | Use the operator-provided Ben Levy username/password as a temporary scoped worker login, configure Railway, and store the password only in `.secrets/`. | Wait for a real email; use a generated temp login; use a shared admin login. | Waiting blocks worker login; shared admin login breaks scope isolation; the temporary simple password must be rotated after handoff. | Configure redacted temporary worker login and smoke-test it after redeploy. | REQ-20260706-940 | Approved by RAW-20260706-910 |
| DEC-20260706-941 | Provisional AI-video model/policy/budget. | Real vendor contract, model, cost, privacy terms, and OpenArt credentials. | Shloimie / Codex | Use a no-live placeholder policy with zero/low budget caps and explicit approval gates. | Leave policy blank; pretend vendor is fully configured. | Blank policy blocks workflow language; pretending vendor is ready risks spend/uploads/privacy. | Create provisional policy that keeps generation/upload disabled until real credentials/policy are approved. | REQ-20260706-941 | Approved for provisional defaults |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260706-940 | What permanent email/identity and password-rotation path should replace the temporary Ben Levy username/password after handoff? | Needed for durable account handoff and audit ownership. | Blocks permanent credential handoff only | Open |
| Q-20260706-941 | Which AI-video vendor/model should be used after OpenArt or another provider is ready? | Needed for real generation/upload/credit spend. | Blocks live vendor generation only | Open |

## Current credential state

| Field | Value |
|---|---|
| Worker username | `BenLevy` |
| Worker password | Redacted from tracked files |
| Local secret file | `C:\Users\User\BNA v2.0\.secrets\one-time-ai-video-worker-login-20260706.txt` |
| Railway env status | Configured and redeployed; live smoke passed |

## Dirty worktree audit

See `ops/release-evidence/2026-07-06-worker-policy-dirty-closeout.md`.

Safe pushed jobs:

- PR #113: One Time worker credential policy defaults, merged at `311d9661`.
- PR #114: scoped Operations `/api/bna/auth/me` readback fix, merged at
  `eba81417`, deployed on Railway deployment
  `4f2b2b6e-c1ef-48e1-8d89-953274e7ec59`.
- PR #115: Job 101 dry-run parser reuse, merged at `53bca5d9`, deployed on
  Railway deployment `798cb1e5-f460-4776-969d-1184cfe1bd07`.

Not pushed:

- One Time CRM mailbox MVP is incomplete and remains blocked on tests,
  registries, visual/browser evidence, and deploy/live proof.
- The dirty Job 101 cleanup JSON overwrites apply evidence with a later dry-run
  report and was not pushed.
- Stale dirty execution-run status files were not pushed wholesale.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-940 | Done | Live worker login smoke: `BenLevy`, role `one_time_ai_video_worker`, scope `rabbi_sheller_provider` / `one_time_mishnah_class`, allowed views `studio`, `tasks`; CRM and agent-fleet denied 403. | Railway env only; local `.secrets`; proof register | PASS live login/auth/me/Studio/Tasks/OpenArt-status readbacks after deployment `4f2b2b6e-c1ef-48e1-8d89-953274e7ec59` | Temporary password must be rotated after handoff |
| REQ-20260706-941 | Done | `docs/ONE-TIME-AI-VIDEO-PROVISIONAL-POLICY.md`; prompt-pack/review-handoff policy fields; PR #113 | `.env.example`, `src/lib/bna/service-provider-studio-sidekick.js`, tests, docs | PASS policy tests; PASS watchdogs; deployed via master | Real OpenArt/vendor credentials, model, budget, privacy, and upload policy still blocked |
| REQ-20260706-942 | Done | `ops/release-evidence/2026-07-06-worker-policy-dirty-closeout.md` | audit/proof files | Dirty clusters classified; no unrelated dirty files reverted or pushed wholesale | Main workspace still contains incomplete mailbox work and stale dirty evidence |
| REQ-20260706-943 | Done with blockers | PR #113, PR #114, PR #115; Railway deployments `4f2b2b6e...` and `798cb1e5...` | pushed code/docs/proof | PASS live worker smoke; PASS `npm run app:smoke`; PASS `npm run app:smoke:rabbi-onetime-landing`; Job 101 exact dry-run command attempted | Job 101 live data smoke blocked: production says content job #101 not found; mailbox MVP not pushable |
