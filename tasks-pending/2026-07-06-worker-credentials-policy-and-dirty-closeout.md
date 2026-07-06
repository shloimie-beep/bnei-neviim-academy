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
| REQ-20260706-940 | Configure a temporary `one_time_ai_video_worker` login without committing secrets. | RAW-20260706-909, RAW-20260706-910, RAW-20260706-908 | rabbi_sheller_provider / one_time_mishnah_class | Codex | credentials_access | P0 | B1 | PR #112 deployed | Railway production has worker username/password variables or an explicit credential blocker; credential values are stored only in an untracked/local secret handoff; redacted proof is recorded; live login is smoke-tested if configured. | Railway env, .secrets only, register/ledger/changelog | yes | In progress |
| REQ-20260706-941 | Add provisional no-live AI video policy/model/budget defaults for Studio worker handoff. | RAW-20260706-909, RAW-20260706-907 | rabbi_sheller_provider / one_time_mishnah_class | Codex | policy_config | P0 | B1 | PR #112 deployed | A repo-visible policy documents provisional model choice, monthly budget cap, per-run cap, privacy/retention defaults, approval gates, no-live vendor rules, and exact upgrade blockers. Defaults must not create fake API keys or approve generation/upload/credit spend. | docs/config/registers/tests as needed | yes if app-visible | In progress |
| REQ-20260706-942 | Audit dirty workspace and classify each unpushed change by scope, owner, safety, and verification status. | RAW-20260706-909 | bna_platform / multiple | Codex | release_audit | P0 | B2 | none | Each dirty file/group is classified as safe to commit/push, leave untouched, blocked, or needs operator decision; unrelated work is not reverted or bundled blindly. | audit note/register | no | Pending |
| REQ-20260706-943 | Push every completed scoped dirty job that can be safely verified. | RAW-20260706-909 | bna_platform / multiple | Codex | release_closeout | P0 | B3 | REQ-20260706-942 | Safe scoped jobs are committed, pushed, and deployed/live-smoked if app-visible; incomplete or unsafe jobs have exact blockers and next actions. | varies by classified job | yes when app-visible | Pending |

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
| Railway env status | Set with `--skip-deploys`; redeploy/live smoke still required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-940 | Pending | n/a | n/a | n/a | n/a |
| REQ-20260706-941 | Pending | n/a | n/a | n/a | n/a |
| REQ-20260706-942 | Pending | n/a | n/a | n/a | n/a |
| REQ-20260706-943 | Pending | n/a | n/a | n/a | n/a |
