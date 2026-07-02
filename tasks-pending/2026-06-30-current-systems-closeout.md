# Ramble Intake - 2026-06-30 - Current Systems Closeout

## Raw intake

Raw wording is preserved at
`raw-input/RAW-20260630-005-current-systems-closeout-source.txt`.

Shloimie asked Codex to finish the current in-flight operational systems before
resuming broad UI correction work. This was treated as goal-led execution
permission covering One Time email/contact setup, BNA content/class parsing and
Torah filtering, Telegram runtime/parser state, dirty worktree/PR/deploy truth,
and evidence.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260630-005 |
| Source | Codex chat attachment |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-30-current-systems-closeout.md` |
| Closeout report | `ops/system-audits/2026-06-30-current-systems-closeout.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Finish the current BNA / One Time in-flight operational systems closeout with evidence, verification, deployment/live-smoke proof where possible, and precise blockers where external owner action is required. |
| Goal tool used | yes |
| GPT output contract | `tasks-pending/_template-goal-mode-correction-output.md` |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Closeout verdict | Partial, safe remaining blockers listed |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Evidence | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260630-201 | Register closeout packet and evidence locations | RAW-20260630-005 | bna + one_time_mishnah_class | Codex | run_control | P0 | A | none | Raw source, register, ledger, and closeout report exist before broad implementation | `raw-input/RAW-20260630-005-current-systems-closeout.md`; this file; `ops/system-audits/2026-06-30-current-systems-closeout.md`; ledger | no | Done |
| REQ-20260630-202 | Establish Git, branch, worktree, PR, deploy, and Railway truth | RAW-20260630-005 | repo-wide | Codex | preflight | P0 | A | REQ-20260630-201 | Branch, HEAD, origin/master, dirty inventory, open PRs, current deployment evidence, and required preflight command results are recorded | Closeout report; PR #52/#53/#54/#55 readbacks; run status | no | Done |
| REQ-20260630-203 | Audit One Time email/contact setup and Resend blockers | RAW-20260630-005 | rabbi_sheller_provider / one_time_mishnah_class | Codex + Resend/DNS owner | email_contacts | P0 | B | REQ-20260630-202 | PR #52/current run state, UI/API paths, Resend tests, smokes, domain/DNS/sender Decision, and no-send guardrails are recorded | Active run; email/contact smoke results; closeout report | yes | Blocked |
| REQ-20260630-204 | Diagnose and repair Content Library taxonomy and Torah filtering | RAW-20260630-005 | bna/class-drive-intake | Codex + release owner | content_taxonomy | P0 | C | REQ-20260630-202 | Torah filter root cause is proven; taxonomy/read model/tests are repaired; cards avoid raw transcript/script/JSON; audit artifacts are created | PR #55; `ops/class-drive-intake/2026-06-30-content-topic-routing-closeout/*`; `ops/watchdog-audits/2026-06-30T11-56-content-routing.md` | yes | Blocked |
| REQ-20260630-205 | Audit class upload/Drive intake parsing, questions, grades, and progress routing | RAW-20260630-005 | bna/class-drive-intake | Codex + operator for writes | class_parser | P0 | C | REQ-20260630-202 | Raw-first intake, parser lanes, question/score/progress state, ambiguity handling, UI visibility, and production-write blockers are recorded | content/class audits; Issue #18; closeout report | app-visible only if code changes | Blocked |
| REQ-20260630-206 | Audit Telegram runtime/parser behavior without real messages | RAW-20260630-005 | bna/telegram | Codex | telegram_runtime | P1 | D | REQ-20260630-202 | Bridge syntax/tests, runtime health readback, parser defaults, workspace scoping, and non-spam behavior are recorded; no broad real messages sent | `node --check scripts/telegram-kimi-bridge.mjs`; Telegram focused tests; closeout report | no | Done |
| REQ-20260630-207 | Reconcile dirty worktree, PRs, and deployment path | RAW-20260630-005 | repo-wide | Codex | release_reconciliation | P0 | E | REQ-20260630-202 | Dirty files are classified; open PRs are inventoried; no unrelated changes are discarded; release/deploy blocker is precise | Closeout report; PR #55 clean release branch | no | Done |
| REQ-20260630-208 | Verify, record evidence, and leave terminal statuses/blockers | RAW-20260630-005 | repo-wide | Codex + relevant owners | verification | P0 | F | REQ-20260630-203..207 | Requested commands run or blockers are explicit; ledger/changelog updated; closeout report has final verdict | Closeout report; ledger; changelog | yes for changed app-visible work | Blocked |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260630-005 | current-systems-closeout-before-ui-correction | Execute current systems closeout before broad UI correction | Codex | repo-wide | RAW-20260630-005 | REQ-20260630-201..208 | Reconcile PR #52/source-of-truth, configure Resend, deploy/live-smoke PR #55 after safe stacking, repair helper smoke, and build any class-write apply packet only with approval | Agent Work | blocked_partial |

## Decisions and blockers

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260630-201 | Configure live One Time Resend sender/domain/webhook setup | `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, Resend `email.received` webhook URL/state, sender/domain/DNS owner, and approved live inbound replay/test target | Shloimie / Resend account owner / DNS owner | Keep implementation no-send and blocked until Railway/Resend values are configured through value-free/keyholder flow, then run invalid-signature and signed inbound readback proof | Use platform Gmail fallback for manual low-volume mail; defer Resend receiving | Without this, Resend inbound/outbound cannot be marked live Done even if local code is implemented | Configure the missing Railway env names and Resend webhook to `https://bneineviimacademy.org/api/resend/inbound`, then approve one live signed inbound replay/test | REQ-20260630-203 and active run Resend blockers | Needs operator decision |
| DEC-20260630-202 | Reconcile production source-of-truth before deploying PR #55 | PR #52 is open/draft/dirty while related communications/Resend behavior was deployed/live-smoked; PR #55 is based on current `origin/master` | Codex / release owner | Merge/rebase/stack PR #52 and PR #55 onto one safe release source, then deploy once and live-smoke content plus communications | Deploy PR #55 directly from `origin/master`; manually patch production | Direct PR #55 deployment could drop unmerged deployed communications behavior | Reconcile PR #52 into `master` or stack PR #55 on the actual production source, then run Railway deploy and live smokes | REQ-20260630-204 and REQ-20260630-208 | Blocked |
| DEC-20260626-101 | Approve any production/raw/class/Drive write beyond already-approved targeted work | Exact rows/commands/rollback/readback for production class-level question, score/progress, task/research-card, raw transcript, Drive writes, worker retry, paid retranscription, or backfill | Shloimie | Keep production writes blocked until a row-level before/after approval packet exists | Approve a specific guarded apply command after dry-run; approve another targeted Drive doc write | Premature writes can leak private transcript bodies or mutate student/class records incorrectly | First build/review an exact apply packet naming command, rows, rollback/readback, privacy status, and consequences | REQ-20260630-205 | Needs operator decision |
| WATCH-20260630-201 | Repair live Operations helper Decisions lane smoke | Live helper lane navigation expected Decisions section and got `undefined` | Codex | Continue Issue #24/helper navigation repair after release source is safe | Ignore until later UI correction | Helper/action navigation remains unreliable in live Operations | Fix/deploy helper lane navigation and rerun `npm run app:smoke:operations-helper` | REQ-20260630-208 | Blocked |
| SCRIPT-20260630-201 | Add or map class upload trace smoke script | Requested `npm run app:smoke:class-upload-trace` is not defined in `package.json` | Codex | Add a dedicated smoke script or map the intended existing class/Drive audit command | Treat current class audits as substitute only | The requested command cannot be part of Definition of Done until it exists | Add the script, run it, and record evidence | REQ-20260630-205 and REQ-20260630-208 | Blocked |

## Open questions

| ID | Question | Resolution |
|---|---|---|
| Q-20260630-201 | The packet names `raw-input/RAW-20260630-003-content-library-filter-visibility-followup.md`, but the primary checkout initially showed a different RAW-20260630-003 file. | Resolved as stale checkout/source drift. After `git fetch`, the content-library source exists on `origin/master` in PR #54. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260630-005 | Current operational systems should be closed out before broad UI correction resumes. | no | This was a current execution priority, not a durable product rule by itself. |

## Implementation map

| ID | Files/routes/components | Result | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260630-202 | Git/PR/Railway/report | Repo/release truth recorded | `bna:run:*`; `secrets:audit`; `git diff --check`; GitHub PR readbacks | none | none | not app-visible |
| REQ-20260630-203 | Email/contact/Resend paths | Audited; no-send smokes passed; Resend live setup blocked | `app:smoke:email-resend-ux`; `app:smoke:one-time-crm-contacts-ux`; active run evidence | prior work only | prior work only | existing deployed evidence; Resend completion blocked |
| REQ-20260630-204 | Content view model/scripts/tests | Repaired in clean PR #55 | content topic/gap/classify audits; tests; watchdog; body-free readback | `22d049a5` | `origin/codex/content-topic-multibucket-20260630` | not deployed; blocked by PR #52/source skew |
| REQ-20260630-205 | Class-drive intake artifacts/parser outputs | Audited read-only; writes blocked | content/class audits; Issue #18 state | none | none | no app-visible deploy |
| REQ-20260630-206 | Telegram bridge/tests/runtime | Audited without sends | syntax check; 12/12 Telegram tests | none | none | no app-visible deploy |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260630-201 | Done | Raw source, register, closeout report | `raw-input/RAW-20260630-005-current-systems-closeout.md`; this file; closeout report | Source hash recorded in raw wrapper | none |
| REQ-20260630-202 | Done | Preflight, PR/deploy/run truth | Closeout report | `npm run bna:run:status`; `npm run bna:run:next`; `npm run bna:run:validate`; `npm run secrets:audit`; `git diff --check`; GitHub PR readbacks | primary worktree still dirty and not a deploy target |
| REQ-20260630-203 | Blocked | Active run and live/local no-send smoke evidence | Closeout report | `app:smoke:email-resend-ux`; `app:smoke:one-time-crm-contacts-ux`; communications watchdog | External Resend/DNS/webhook setup remains blocked |
| REQ-20260630-204 | Blocked | PR #55; content topic closeout artifacts; local body-free readback | Clean PR #55 files | clean branch checks, 11/11 content tests, content audits, content watchdog | Deploy/live-smoke blocked by PR #52/production source skew |
| REQ-20260630-205 | Blocked | Class/content read-only audits and Issue #18 state | Closeout report | `content:drive-intake-audit`; transcript gap/classify audits | Production writes need row-level approval; class-upload trace script missing |
| REQ-20260630-206 | Done | Telegram syntax/tests and no-send guardrail | Closeout report | bridge syntax; Telegram tests 12/12 | live multi-student persistence remains follow-up pending write-safe proof |
| REQ-20260630-207 | Done | Dirty worktree and PR inventory | Closeout report; PR #55 | Git/GitHub readbacks | release sequencing blocker recorded |
| REQ-20260630-208 | Blocked | Final report, ledger, changelog | Closeout report; ledger/changelog | all runnable closeout checks recorded | Resend setup, source reconciliation, PR #55 deploy/live-smoke, helper repair, and class write approval remain |
