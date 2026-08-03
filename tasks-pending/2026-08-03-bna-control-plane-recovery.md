# Ramble Intake — 2026-08-03 — BNA control-plane recovery

## Raw intake

Restore Shloimie's existing private BNA academy Telegram operating loop and make the canonical BNA Operations work queue immediately usable without creating a new platform, bot identity, fleet, queue, or One Time dependency. Full source is preserved in `raw-input/RAW-20260803-001-bna-control-plane-recovery.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260803-001 |
| Source | Codex chat attachment `pasted-text.txt` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-08-03-bna-control-plane-recovery.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| GPT output contract | n/a |
| Execution directive | Register first, then work the recovery in bounded batches until each requirement is terminal. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260803-001 through REQ-20260803-004 |

## Definition of Ready for the Operations UI slice

- Workspace/project: `bna_school` / `bna_control_plane`.
- Roles/view classes: Shloimie super admin; scoped provider/project user; anonymous/wrong-scope denial.
- Route/screen: live Express/static `/operations?view=tasks`; its canonical APIs and shared task detail drawer.
- Current-state inspection: authenticated desktop and mobile screenshots, current section labels/defaults, task/decision DTOs, actor filtering, source/workspace/assignee display, agent-job enrichment, deep-link behavior, action/route registries.
- User goal: see and act on one canonical queue containing Bot, Ticket, Manual, Agent, and Integration work without mixing private BNA and One Time data.
- IA: Decisions, Pending, Tasks, Done; My Tasks is an actor-aware default filter inside the task surface, with an explicit all-control-plane filter and Bots/Agents filter/view backed by `bna_agent_jobs`.
- Required fields: workspace/product, assignee, type, status, due date, source, waiting on, priority, last verified/deployed state.
- Required actions/states: open the shared detail drawer, comment/update through existing APIs, choose/ask-info on decisions, mark eligible work Done, preserve deploy/live proof gates, deny privileged controls to scoped project users.
- Breakpoints: 390px mobile and 1440px desktop; no horizontal overflow; drawer remains readable/actionable; focus and labels remain accessible.
- Forbidden: new queue/status table, raw private bodies, token/chat IDs, private BNA detail in One Time summaries, provider/deploy/claim/credential controls for non-super-admin users, historical One Time rows presented as current truth.
- Evidence gate: before screenshots plus after screenshots, focused route/API/UI tests, syntax/generated-shell checks, action/route registry checks, secret scan, deploy/live smoke.
- Definition of Done: exact pushed commit is deployed to the proven BNA target; authenticated desktop/mobile smoke passes; the canary's one synthetic work item traverses the same drawer and sends at most one completion notification.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260803-001 | Prove repository, branch, worktree, PR, deploy-source, runtime, and fleet truth and publish an ownership lease. | RAW-20260803-001 | BNA/control-plane | Codex | preflight | P0 | 0 | none | Exact current refs, dirt, PR deltas, active fleet, deploy source, owned/excluded paths, stop gates recorded. | `ops/codex-runs/2026-08-03-bna-ctrl-001/*` | no | in_progress |
| REQ-20260803-002 | Prove the exact BNA academy bot identity, masked Shloimie chat binding, polling/webhook mode, runtime key contract, and single consumer. | RAW-20260803-001 | BNA/academy-telegram | Codex | runtime safety | P0 | 0 | REQ-20260803-001 | Redacted getMe/webhook/heartbeat/service evidence; no raw token/chat ID; no duplicate logical consumer. | `scripts/telegram-kimi-bridge.mjs`, startup/readiness scripts, run evidence | yes | pending |
| REQ-20260803-003 | Reconcile only the minimal accepted portions of PR #141 and #142 against current master. | RAW-20260803-001 | BNA/control-plane | Codex | architecture | P0 | 0 | REQ-20260803-001 | No mechanical merge; accepted/rejected parts and reasons recorded; no second fleet/queue/bot accidentally introduced. | PR-delta files and run evidence | no | pending |
| REQ-20260803-004 | Capture current authenticated Operations task/decision UI on desktop and mobile before edits. | RAW-20260803-001 | BNA/operations | Codex | visual audit | P0 | 0 | REQ-20260803-001 | Current section/default/filter/drawer/access behavior and screenshots recorded without private-body leakage. | `/operations`, run evidence | no | pending |
| REQ-20260803-005 | Restore one idempotent academy worker with fresh redacted readiness, bounded retries/messages, durable offsets/idempotency, and correct hosted-chat/Codex routing. | RAW-20260803-001 | BNA/academy-telegram | Codex | worker | P0 | 1 | REQ-20260803-002, REQ-20260803-003 | One lease/consumer; restart safe; no duplicate task/ding; truthful API-backed claims. | bridge/startup/runtime modules and focused tests | yes | pending |
| REQ-20260803-006 | Restore the safe send-only Codex progress notifier and useful deduplicated transition notifications. | RAW-20260803-001 | BNA/control-plane | Codex | notifications | P0 | 1 | REQ-20260803-002 | Default safe/off gates preserved; only approved state transitions ding; quiet/rate/size/retry limits and deep links tested. | `scripts/send-codex-progress-telegram.mjs`, related modules/tests | yes | pending |
| REQ-20260803-007 | Support /status, task/decision/blocker/recent-Codex queries, and natural-language work capture through canonical APIs. | RAW-20260803-001 | BNA/control-plane | Codex | bot tools | P0 | 1 | REQ-20260803-005 | Each query returns scoped current data and one canonical capture; no one-off competing command store. | bridge/control modules, `server.js`, tests | yes | pending |
| REQ-20260803-008 | Make Decisions, Pending, Tasks, and Done usable with actor-aware My Tasks, required filters/fields, source truth, agent-job enrichment, and shared drawer/deep links. | RAW-20260803-001 | BNA/operations | Codex | UI/API | P0 | 2 | REQ-20260803-004, REQ-20260803-007 | Required IA/fields/access states pass focused API/UI/browser tests at 390px and 1440px. | `server.js`, live `public/operations*`, registries, tests | yes | pending |
| REQ-20260803-009 | Preserve scope/security boundaries between BNA, project users, and standalone One Time. | RAW-20260803-001 | platform/shared | Codex | privacy/security | P0 | 2 | REQ-20260803-007, REQ-20260803-008 | Project users see only scoped progress; super-admin controls remain restricted; no One Time DB/cookie/server import; no private BNA summary leakage. | server/control/UI tests | yes | pending |
| REQ-20260803-010 | Reuse or define the versioned signed sanitized summary-event envelope and BNA projection/idempotency path. | RAW-20260803-001 | platform/event-contract | Codex | contract | P1 | 2 | REQ-20260803-003 | Contract covers named event types, signature/replay/classification/minimum fields, and projection-only storage; no One Time producer edit. | `docs/architecture/contracts/*`, BNA contract tests | no | pending |
| REQ-20260803-011 | Produce the exact OT-LIVE-001 producer handoff if no current One Time producer exists. | RAW-20260803-001 | One Time/handoff-only | Codex | handoff | P1 | 2 | REQ-20260803-010 | Names contract, consumer path, tests, flag, and producer obligations without editing One Time. | run handoff | no | pending |
| REQ-20260803-012 | Run the exactly bounded live Telegram canary and prove idempotent task/ding behavior with recoverable cleanup. | RAW-20260803-001 | BNA/control-plane | Codex | canary | P0 | 3 | REQ-20260803-005 through REQ-20260803-009 | 1 online send; 1 status response; 1 synthetic task/audit row; <=1 completion ding; replay creates 0 duplicates; task archived normally. | runtime plus canary evidence | yes | pending |
| REQ-20260803-013 | Commit/push/deploy the exact BNA candidate and complete doctor, live, authenticated desktop/mobile, secret, and diff gates. | RAW-20260803-001 | BNA/release | Codex | release | P0 | 4 | REQ-20260803-012 | Exact pushed SHA deployed to proven service; all focused gates pass; rollback target captured. | release/evidence paths | yes | pending |
| REQ-20260803-014 | Write the compact final BNA-CTRL-001 handoff and update ledger/changelog with actual effects and blockers. | RAW-20260803-001 | BNA/control-plane | Codex | closeout | P0 | 5 | all applicable requirements | Base/final SHA, branch, paths, redacted identities, consumer proof, tests, canary/deploy counts, screenshots, effects, blockers, OT handoff recorded. | run handoff, ledger, changelog, register | no | pending |

## Parsed tasks

No human-facing task is created during preflight. This is Codex/agent lifecycle work and must remain in Agent/Bots activity until a genuine human action is required.

## Decisions

None at intake. Create one reusable Decision only if an external credential/identity/deploy fact is genuinely absent after safe diagnostics.

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260803-001 | Does the current Railway worker still own the academy bot token and verified Shloimie chat binding, or is a distinct PR #142 token namespace configured? | Selects academy bridge vs isolated Operations bot without token collision. | yes for canary/deploy; no for local code/UI work | investigating |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260803-001 | Final proven BNA academy worker/service/transport ownership and control-loop architecture. | only after live proof | Dated reports are historical until runtime readback confirms them. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| BNA-CTRL-001 | Lease/raw/register first; exact runtime/code/UI paths after preflight. | Audit current behavior, reconcile minimal deltas, implement bounded repairs, canary, release, handoff. | Focused unit/API/UI tests, browser screenshots, doctor/smoke, secret/diff gates. | pending | pending | pending |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| BNA-CTRL-001 | In progress | `ops/codex-runs/2026-08-03-bna-ctrl-001/LEASE.md` | lease, raw intake, register | preflight underway | Runtime identity and current UI still need proof. |
