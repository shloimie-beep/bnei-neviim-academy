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
| Isolated worktree | `C:\Users\User\BNA-onetime-post-agent-delta-20260712` |
| Starting branch for this delta | `codex/onetime-post-agent-delta-20260712-v3` |
| Actual current `HEAD` / `origin/master` | `593b85c7ffe975dc5eff6f38b684f375385952dc` |
| Active-agent changes preserved | Commits `6ffbb0a55` and `593b85c7f` are the base of this isolated branch. |
| Earlier fetched SHA before active-agent commits landed | `b61db37a4e232023f745b568e3456536048a114a` |
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
| Collision-safe reconciliation | Fetch/status/log/head/live deploy-info completed. Current `origin/master` is ahead of live One Time deploy SHA. | Done for this intake/register slice; later active-agent commits are handled by branch rebase before publish. | REQ-20260712-801 |
| Automatic ramble-to-done | Existing `src/platform/ingestion/operator-ramble-service.js`, ingestion tests, ChatGPT dropoff, and worker propagation exist from prior work. New packet asks for richer structured AI spec compiler, no generic fallback, materialization guarantees, long Telegram reconstruction, and status receipts. | Done. Local hardening was verified, deployed to One Time Railway deployment `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8`, and SHA-pinned live smoke confirmed `join.onetimeonetime.com` serves commit `f0376e4539c31d80f917c90241bbffd91ee9c57c`. | REQ-20260712-802 |
| Railway delivery cron runner | Dispatcher route and delivery library exist. The short-lived runner/config/test command now exists in this branch. | Done locally; Railway service creation/cutover remains REQ-20260712-804. | REQ-20260712-803 |
| Railway cron service/cutover | Current delivery route exists on One Time web. Separate `one-time-delivery-cron` service is now deployed. Codex automation overlap was checked. | Done. Railway service `one-time-delivery-cron` (`742f60ed-dc2f-4321-85d0-019003d4e9b9`) deployed as `df89ade6-86bc-4d2e-8384-54957fb7fada`; manifest shows `*/5 * * * *`; logs show two redacted zero-due executions; old Codex dispatcher automation is paused. | REQ-20260712-804 |
| CRM Contacts/Inbox blueprint | Existing CRM DTO/API/workbench/inbox work is merged locally; the new canonical product spec now exists at `ops/product-specs/one-time/crm/contacts-inbox.v1.json` with a focused surface map under `ops/surface-maps/`. | Done. Current-state delta matrix identifies already-satisfied work and leaves only partial/open OT-CRM rows for implementation. | REQ-20260712-805 |
| Vertical CRM implementation packets | Previous CRM implementation covers DTO/list/workbench/inbox context; packet asks for OT-CRM-01 through OT-CRM-05 ownership and canonical-route mutation proof. | Local verified; deploy/live proof pending. Safe CRM endpoints, split-shell client methods, route/action registry rows, canonical `/operations` proof, and isolated Railway `crm-test` Postgres mutation/reload proof passed with no send/import/payment/access/DNS/secret mutation. | REQ-20260712-806 |
| Deploy/live closeout | Live SHA is `48c52797b`, while current `origin/master` is `593b85c7f`; app-visible/server-visible deltas must be deployed and live-smoked after verification. | In progress after REQ-20260712-806 proof passed. | REQ-20260712-807 |

## Parsed requirements

| ID | Requirement | Parent | Owner | Category | Priority | Batch | Dependencies | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260712-801 | Register intake, reconcile current state, and supersede stale approval-only release blockers without overwriting other agents. | RAW-20260712-013 | Codex | run_control | P0 | delta-00 | none | no | Done |
| REQ-20260712-802 | Harden automatic ramble-to-done so nontrivial rambles capture immutable source statements, require validated structured specs, materialize tasks/jobs, preserve long Telegram sessions without truncation, and expose honest status receipts. | REQ-20260712-008 / REQ-20260712-009 | Codex | protocol_hardening | P0 | delta-A | REQ-20260712-801 | yes | Done |
| REQ-20260712-803 | Add the short-lived One Time delivery outbox Railway cron runner, package command, separate Railway config, env example entry, and focused tests. | REQ-20260712-017 / REQ-20260712-022 | Codex | delivery_cron | P0 | delta-B1-B3 | REQ-20260712-801 | no; Railway service cutover is REQ-20260712-804 | Done |
| REQ-20260712-804 | Deploy/create the separate `one-time-delivery-cron` Railway service, prove two redacted executions, verify no class-reminders job ran, then disable/delete the old Codex dispatcher automation without leaving overlapping schedulers. | REQ-20260712-017 / REQ-20260712-022 | Codex / Railway | delivery_cutover | P0 | delta-B4 | REQ-20260712-803 | yes | Done |
| REQ-20260712-805 | Create/update `ops/product-specs/one-time/crm/contacts-inbox.v1.json` as the canonical Contacts/Inbox blueprint and validate it against current merged CRM state. | REQ-20260711-005 / REQ-20260712-107 | Codex | crm_blueprint | P0 | delta-C0 | REQ-20260712-801 | no | Done |
| REQ-20260712-806 | Split CRM Contacts/Inbox work into OT-CRM-01 through OT-CRM-05 current-state packets and implement only missing/partial rows in dependency order. | REQ-20260711-005 / REQ-20260712-107 | Codex | crm_implementation | P0 | delta-C1-C9 | REQ-20260712-805 | yes | In progress |
| REQ-20260712-807 | Run focused tests, protocol drift/watchdog checks, scoped commit/push, Railway deploy/live smokes, screenshot/readback evidence, ledger/changelog updates, and terminal status closeout. | RAW-20260712-013 | Codex | deploy_verify_closeout | P0 | delta-closeout | REQ-20260712-802, REQ-20260712-803, REQ-20260712-804, REQ-20260712-806 | yes | In progress |

## Decisions and blockers

| ID | Decision | Owner | Recommended option | Blocks | Status |
|---|---|---|---|---|---|
| DEC-20260712-801 | Normal scoped commit/push/deploy/live-smoke authorization is now granted by `RAW-20260712-013`; stale approval-only blockers are superseded. | Codex | Continue scoped work and release gates, while preserving no-send/no-import/no-payment/no-DNS/no-secret constraints. | none | Decided |
| DEC-20260712-802 | Separate Railway cron service creation and Codex automation deletion require concrete Railway/automation readback so both schedulers do not overlap. | Codex / Railway | Implement/test runner first, then perform a readback-guided cutover and leave exact blocker if Railway CLI or automation tooling is unavailable. | REQ-20260712-804 | Done |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260712-802 | `src/platform/ingestion/operator-ramble-service.js`, ingestion regression tests, watchdog evidence | Implemented structured-compilation gating, long raw/Telegram part reconstruction, source reconstruction receipts, honest status receipts, and implementation-ready job filtering. | PASS local service/check suites; PASS `npm run watchdog:protocol-drift` 0 findings; PASS `npm run one-time:target:guard`; PASS SHA-pinned One Time live smoke. | `f0376e4539c31d80f917c90241bbffd91ee9c57c` | `origin/codex/onetime-post-agent-delta-20260712-v3` | Railway `one-time-production / production / one-time-web` deployment `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8` reached SUCCESS; `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha f0376e4539c31d80f917c90241bbffd91ee9c57c` passed. |
| REQ-20260712-803 | `scripts/run-one-time-delivery-outbox-cron.mjs`, `railway.one-time-delivery-cron.json`, `package.json`, `.env.example`, `tests/one-time-delivery-outbox-cron.test.js` | Implemented the smallest safe cron runner slice first. | PASS `node --check scripts/run-one-time-delivery-outbox-cron.mjs`; PASS `node --test tests/one-time-delivery-outbox-cron.test.js`; PASS `node --test tests/one-time-delivery-outbox.test.js`; PASS JSON parse for `package.json` and `railway.one-time-delivery-cron.json`. | Pending | Pending | Not required for this artifact; REQ-20260712-804 tracks Railway service/cutover. |
| REQ-20260712-804 | `railway.one-time-delivery-cron.json`, `scripts/run-one-time-delivery-outbox-cron.mjs`, Railway service `one-time-delivery-cron`, Codex automation `one-time-delivery-outbox-dispatcher` | Created and deployed a separate Railway cron service, copied only the delivery endpoint URL and cron secret, verified zero-due redacted executions, and paused the old overlapping Codex dispatcher automation. | PASS dry-run preview due_count 0; PASS Railway deployment `df89ade6-86bc-4d2e-8384-54957fb7fada` status SUCCESS; PASS manifest schedule/startCommand readback; PASS two redacted logs; PASS no class-reminders HTTP logs; PASS automation status PAUSED. | `f0376e4539c31d80f917c90241bbffd91ee9c57c` | `origin/codex/onetime-post-agent-delta-20260712-v3` | Railway cron service `one-time-delivery-cron` id `742f60ed-dc2f-4321-85d0-019003d4e9b9`, deployment `df89ade6-86bc-4d2e-8384-54957fb7fada`; manifest schedule `*/5 * * * *`. |
| REQ-20260712-805 | `ops/product-specs/one-time/crm/contacts-inbox.v1.json`, `ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.*`, current-state inspection evidence | Created canonical blueprint, C0-C9 implementation contract, OT-CRM-01 through OT-CRM-05 ownership, action state matrix, and GAP-OT-CRM-001 through GAP-OT-CRM-009 delta matrix before UI edits. | PASS JSON parse; PASS focused CRM/inbox test subset 20/20; PASS `npm run pqc:validate`; PASS `npm run bna:run:validate`. | Pending | Pending | Not required; blueprint-only batch. |
| REQ-20260712-806 | `server.js`, `public/js/operations-shell.js`, `public/operations.html`, `scripts/smoke-onetime-crm-journey-local-db.mjs`, registry/spec rows, Railway `crm-test` Postgres service `Postgres-ib9s` | Implemented safe local-only CRM mutations/readbacks, fixed fresh-db bootstrap ordering, aligned the CRM mailbox action to `ACTION-CRM-CONTACT-MAILBOX-OPEN`, and proved persistence/reload/inbox return on an isolated Railway test DB. | PASS focused CRM/unit tests 27/27; PASS Railway-backed CRM journey smoke with report `ops/evidence/one-time-crm-journey-local-db/2026-07-13T03-31-54-271Z-report.md`. | Pending | Pending | Pending deploy/live closeout under REQ-20260712-807 before terminal Done. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260712-801 | Done | This register, raw source copy, execution run, git/live SHA readbacks, and isolated worktree record. | Intake/run files. | PASS `npm run bna:run:validate`. | Continue implementation in child requirements. |
| REQ-20260712-803 | Done | Runner/config/tests added with redacted output contract and no class-reminders route usage. | `scripts/run-one-time-delivery-outbox-cron.mjs`, `railway.one-time-delivery-cron.json`, `tests/one-time-delivery-outbox-cron.test.js`, `package.json`, `.env.example`. | PASS `node --check scripts/run-one-time-delivery-outbox-cron.mjs`; PASS `node --test tests/one-time-delivery-outbox-cron.test.js` 6/6; PASS `node --test tests/one-time-delivery-outbox.test.js` 5/5; PASS JSON parse for `package.json` and `railway.one-time-delivery-cron.json`. | Runner is now cut over through REQ-20260712-804. |
| REQ-20260712-802 | Done | Local protocol hardening plus One Time Railway deployment `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8` and SHA-pinned live smoke for commit `f0376e4539c31d80f917c90241bbffd91ee9c57c`. | `src/platform/ingestion/operator-ramble-service.js`, `tests/ingestion/operator-ramble-service.test.js`, `tests/ingestion/ramble-regression-suite.test.js`, `ops/watchdog-audits/2026-07-12-product-quality-drift.md`, run evidence files. | PASS `node --check src/platform/ingestion/operator-ramble-service.js`; PASS ingestion suite 16/16; PASS ChatGPT/API readback 10/10; PASS protocol/watchdog tests 4/4; PASS `npm run watchdog:protocol-drift` 0 findings; PASS `npm run one-time:target:guard`; PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha f0376e4539c31d80f917c90241bbffd91ee9c57c`. | Direct live parse was not run because it would create production intake rows without a narrower no-write/approved synthetic live-intake packet. Rabbi landing smoke on `bneineviimacademy.org` failed only for public WhatsApp readiness and remains a separate provider-readiness gate, not a blocker for this One Time deploy. |
| REQ-20260712-804 | Done | Railway cron service `one-time-delivery-cron` id `742f60ed-dc2f-4321-85d0-019003d4e9b9`, deployment `df89ade6-86bc-4d2e-8384-54957fb7fada`, two redacted zero-due executions, no class-reminders logs, old dispatcher automation paused. | Railway service/config plus local runner artifact and Codex automation state. | PASS dry-run preview before cutover; PASS manifest schedule/startCommand readback; PASS two Railway log executions with `due_count: 0` and `external_send_performed: false`; PASS no class-reminders HTTP logs in verification window; PASS automation TOML status `PAUSED`. | The separate daily class-reminder enqueue-and-dispatch automation remains active because it is a different class-reminder workflow, not the every-5-minute delivery dispatcher being replaced. |
| REQ-20260712-805 | Done | Canonical blueprint and surface map now define current-state CRM Contacts/Inbox ownership, action state matrix, and gap matrix. | `ops/product-specs/one-time/crm/contacts-inbox.v1.json`, `ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.md`, `ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.json`, PQC validation report. | PASS JSON parse for spec/map; PASS focused CRM/inbox tests 20/20; PASS `npm run pqc:validate`; PASS `npm run bna:run:validate`. | Continued through `REQ-20260712-806`. |
| REQ-20260712-806 | In progress | Safe implementation slice plus Railway `crm-test` isolated mutation/reload proof: `Postgres-ib9s` (`ebbb512e-3d27-44e1-a85b-4be3871a6b2f`) in environment `crm-test` (`2a9b61fa-6d88-4405-b6d6-0120ff7f461f`), report `ops/evidence/one-time-crm-journey-local-db/2026-07-13T03-31-54-271Z-report.md`, and screenshot `ops/evidence/one-time-crm-journey-local-db/2026-07-13T03-31-54-271Z-crm-mailbox-roundtrip.png`. | `server.js`, `public/js/operations-shell.js`, `public/operations.html`, `scripts/smoke-onetime-crm-journey-local-db.mjs`, `scripts/smoke-onetime-operations-crm-workbench-local.mjs`, registry/spec rows, focused guard test. | PASS syntax checks; PASS focused CRM/unit tests 27/27; PASS JSON parse for registry/spec packet rows; PASS Railway-backed CRM journey smoke. | Needs deploy/live closeout in `REQ-20260712-807` before terminal Done. |
| REQ-20260712-807 | In progress | Final deploy/live closeout began after `REQ-20260712-806` passed. | Run register, ledger, changelog, deploy evidence. | Pending final watchdog/protocol validation, commit/push, Railway one-time-web deploy, and live smoke. | Not terminal yet. |
