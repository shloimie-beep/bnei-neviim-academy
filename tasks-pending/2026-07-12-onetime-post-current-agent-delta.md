# One Time Post-Current-Agent Delta

Raw source: `raw-input/RAW-20260712-013-onetime-post-current-agent-delta.txt`
Execution run: `ops/execution-runs/2026-07-12-onetime-post-current-agent-delta/`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260712-013 |
| Source | codex_chat attachment `pasted-text.txt` |
| Content hash | sha256:AE08273F04E3988D30592D5CA962D8B3177AD787ED82D6527D0607E842935704 |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-12-onetime-post-current-agent-delta.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Execute the One Time post-current-agent delta through terminal statuses where safe, including ramble-to-done hardening, Railway delivery cron migration, and CRM Contacts/Inbox continuation. |
| Goal tool used | yes |
| Existing requirements continued | `REQ-20260711-003` through `REQ-20260711-009`; `REQ-20260712-008`, `REQ-20260712-009`, `REQ-20260712-017`, `REQ-20260712-022`, and `REQ-20260712-101` through `REQ-20260712-112` |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible or server-visible work | yes |
| New child requirement IDs | `REQ-20260712-801` through `REQ-20260712-807` |

## Baseline

| Check | Result |
|---|---|
| Starting branch for this delta | `codex/onetime-post-agent-delta-20260712-v2` |
| Actual current `HEAD` / `origin/master` after active-agent commit | `6ffbb0a552ff6576fb167b7a6e3a7c152c369da7` |
| Earlier fetched SHA before active-agent commit landed | `b61db37a4e232023f745b568e3456536048a114a` |
| Active-agent changes preserved | Commit `6ffbb0a55` (`Record launch control tower delta`) includes refreshed dropoff control tower and the raw packet. |
| Worktree at scoped branch start | Clean, then this run/register work began |
| Live One Time deployed SHA readback | `48c52797b2b8354de31f29aa87c1b95307967900` from `https://join.onetimeonetime.com/api/deploy-info` |
| Live One Time deployment target | `one-time-production / production / one-time-web` |
| Collision note | Do not resume `C:\Users\User\BNA-onetime-p0p1-corrective-20260711`; its `NEXT-SESSION.md` marks it unsafe due unrelated dirty `server.js` / delivery-outbox state. |

## Authorization correction

The packet explicitly supersedes the stale deployment approval blocker in
`DEC-20260711-003` and the later release-only blocker in `REQ-20260712-112` to
the extent they only awaited normal scoped commit, push, deployment, and live
smoke. This does not authorize production contact imports, unapproved sends,
class-reminder enqueueing, payment charges, access grants, historical CRM
imports, DNS/account/credential mutations, or secret exposure.

## Delta matrix

| Area | Current state | Delta status | Requirement |
|---|---|---|---|
| Collision-safe reconciliation | Fetch/status/log/head/live deploy-info completed. Current `origin/master` is ahead of live One Time deploy SHA. | In progress until recorded in run files and changelog. | REQ-20260712-801 |
| Automatic ramble-to-done | Existing `src/platform/ingestion/operator-ramble-service.js`, ingestion tests, ChatGPT dropoff, and worker propagation exist from prior work. New packet asks for richer structured AI spec compiler, no generic fallback, materialization guarantees, long Telegram reconstruction, and status receipts. | Partially implemented; needs gap audit and targeted hardening. | REQ-20260712-802 |
| Railway delivery cron runner | Dispatcher route and delivery library exist. No short-lived Railway cron runner/config/test command exists at this baseline. | Missing. | REQ-20260712-803 |
| Railway cron service/cutover | Current delivery route exists on One Time web. Separate `one-time-delivery-cron` service is not verified. Codex automation disablement requires safe readback of any existing automation. | Blocked until runner is implemented, tested, deployed/service-created, and scheduler overlap can be verified. | REQ-20260712-804 |
| CRM Contacts/Inbox blueprint | Existing CRM DTO/UI work is merged locally in current `origin/master`, and previous proof exists, but the canonical product spec file `ops/product-specs/one-time/crm/contacts-inbox.v1.json` is absent. | Missing blueprint / needs current-state delta audit. | REQ-20260712-805 |
| Vertical CRM implementation packets | Previous CRM implementation covers a subset; packet asks for OT-CRM-01 through OT-CRM-05 ownership and canonical-route mutation proof. | Partially implemented; needs packetized gap matrix before more UI code. | REQ-20260712-806 |
| Deploy/live closeout | Live SHA is `48c52797b`, while current `origin/master` is `6ffbb0a55`; app-visible/server-visible deltas must be deployed and live-smoked after verification. | Open. | REQ-20260712-807 |

## Parsed requirements

| ID | Requirement | Parent | Owner | Category | Priority | Batch | Dependencies | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260712-801 | Register intake, reconcile current state, and supersede stale approval-only release blockers without overwriting other agents. | RAW-20260712-013 | Codex | run_control | P0 | delta-00 | none | no | In progress |
| REQ-20260712-802 | Harden automatic ramble-to-done so nontrivial rambles capture immutable source statements, require validated structured specs, materialize tasks/jobs, preserve long Telegram sessions without truncation, and expose honest status receipts. | REQ-20260712-008 / REQ-20260712-009 | Codex | protocol_hardening | P0 | delta-A | REQ-20260712-801 | yes, if server-visible | Pending |
| REQ-20260712-803 | Add the short-lived One Time delivery outbox Railway cron runner, package command, separate Railway config, env example entry, and focused tests. | REQ-20260712-017 / REQ-20260712-022 | Codex | delivery_cron | P0 | delta-B1-B3 | REQ-20260712-801 | yes | Pending |
| REQ-20260712-804 | Deploy/create the separate `one-time-delivery-cron` Railway service, prove two redacted executions, verify no class-reminders job ran, then disable/delete the old Codex dispatcher automation without leaving overlapping schedulers. | REQ-20260712-017 / REQ-20260712-022 | Codex / Railway | delivery_cutover | P0 | delta-B4 | REQ-20260712-803 | yes | Pending |
| REQ-20260712-805 | Create/update `ops/product-specs/one-time/crm/contacts-inbox.v1.json` as the canonical Contacts/Inbox blueprint and validate it against current merged CRM state. | REQ-20260711-005 / REQ-20260712-107 | Codex | crm_blueprint | P0 | delta-C0 | REQ-20260712-801 | no | Pending |
| REQ-20260712-806 | Split CRM Contacts/Inbox work into OT-CRM-01 through OT-CRM-05 current-state packets and implement only missing/partial rows in dependency order. | REQ-20260711-005 / REQ-20260712-107 | Codex | crm_implementation | P0 | delta-C1-C9 | REQ-20260712-805 | yes | Pending |
| REQ-20260712-807 | Run focused tests, protocol drift/watchdog checks, scoped commit/push, Railway deploy/live smokes, screenshot/readback evidence, ledger/changelog updates, and terminal status closeout. | RAW-20260712-013 | Codex | deploy_verify_closeout | P0 | delta-closeout | REQ-20260712-802, REQ-20260712-803, REQ-20260712-804, REQ-20260712-806 | yes | Pending |

## Decisions and blockers

| ID | Decision | Owner | Recommended option | Blocks | Status |
|---|---|---|---|---|---|
| DEC-20260712-801 | Normal scoped commit/push/deploy/live-smoke authorization is now granted by `RAW-20260712-013`; stale approval-only blockers are superseded. | Codex | Continue scoped work and release gates, while preserving no-send/no-import/no-payment/no-DNS/no-secret constraints. | none | Decided |
| DEC-20260712-802 | Separate Railway cron service creation and Codex automation deletion require concrete Railway/automation readback so both schedulers do not overlap. | Codex / Railway | Implement/test runner first, then perform a readback-guided cutover and leave exact blocker if Railway CLI or automation tooling is unavailable. | REQ-20260712-804 | Pending |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260712-803 | `scripts/run-one-time-delivery-outbox-cron.mjs`, `railway.one-time-delivery-cron.json`, `package.json`, `.env.example`, `tests/one-time-delivery-outbox-cron.test.js` | Implement the smallest safe cron runner slice first. | `node --test tests/one-time-delivery-outbox-cron.test.js`; focused dispatcher tests. | Pending | Pending | Pending |
| REQ-20260712-805 | `ops/product-specs/one-time/crm/contacts-inbox.v1.json` plus current-state evidence | Create canonical blueprint and gap matrix before UI edits. | JSON parse plus PQC/run validation where applicable. | Pending | Pending | Pending |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260712-801 | In progress | This register, raw source copy, execution run, git/live SHA readbacks. | Intake/run files. | Pending `npm run bna:run:validate`. | Continue implementation. |
