# 2026-07-22 — Platform Agent Actions Telegram preview

- Raw source: `raw-input/RAW-20260722-001-platform-agent-actions-telegram-preview.md`
- Branch: `codex/platform-agent-actions-telegram-preview`
- Base: `master` at `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`
- Workspace/project: `platform_control` / `platform_agent_actions_telegram_preview`
- Status: `complete_preview`
- External mutation guard: one operator-owned private Telegram canary and preview-only credential wiring; no customer send, GHL mutation, or production-data mutation. A transient unauthorized production source deployment occurred and was restored; canonical incident verdict: `PRODUCTION_CHANGED: YES_TRANSIENT_RESTORED`.

## Current-source audit

- PR #139 current head: `9e7efb3179c63bbb52571a9fc811773a24bccb7a`.
- PR #140 current head: `d03e15f3f51c35a91d699dc29e316b3f87d31bcf`.
- One Time queue source: `shloimie-beep/onetimev2`, ref `codex/highlevel-api-finalize-agent-queue`, SHA `1000e8f46210a85f720f83fce2678b24a44fa94d`, artifact `integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json`.
- Both PR descendants share the unchanged requested master base. Their implementation and architecture commits were applied in order; the only overlaps were append-only ledger/changelog records, resolved by preserving both lanes without duplication.

## Requirements

| ID | Requirement | Status | Acceptance / evidence |
| --- | --- | --- | --- |
| REQ-20260722-001 | Build from live master and current PR #139/#140 descendants without a stale mechanical merge | Done locally | Live SHAs pinned above; branch history records four adapted descendant commits |
| REQ-20260722-002 | Preserve separate Super Admin, BNA School, and One Time connector surfaces | Done hosted | Route/action registry assertions and authenticated live browser smoke cover all three surfaces |
| REQ-20260722-003 | Run Agent Action lifecycle with JSON claim/in-progress/partial/completed/readback/idempotency/supersede | Done hosted | `live-preview-smoke.json` records every requested transition and verified result readback |
| REQ-20260722-004 | Import the current One Time Agent Mode queue safely | Done hosted | Hosted preview imports 14 jobs from the pinned source SHA/blob with no secrets or external GHL write |
| REQ-20260722-005 | Provide optional sanitized result-only GitHub fallback for `onetimev2` | Done hosted | Deterministic result-only branch/path/PR payload; Hub preferred; hosted smoke confirms Hub availability never blocks GHL completion |
| REQ-20260722-006 | Implement provider-neutral `one_time_rabbi_torah_console` foundation | Done hosted | Live connector reports private-canary-ready/provider-contract-only, canonical GHL source of truth, one operator-only canary, and customer messages sent 0 |
| REQ-20260722-007 | Run the minimal requested verification set only | Done | Focused tests 38/38, queue import, local and hosted browser/API smoke, secrets audit, protocol drift 0, and diff check |
| REQ-20260722-008 | Publish a draft PR and a non-production preview URL | Done | Draft PR #141 and isolated Railway preview are live at the recorded URLs |
| REQ-20260722-009 | Preserve safety invariants | Done | `CUSTOMER_MESSAGES_SENT=0`; no GHL mutation or production deployment/change; protected credentials are preview-only; the sole Telegram send was the operator-owned private canary |

## Scope boundaries

- One Time remains independently operable; it must not depend on the BNA preview or Hub.
- GHL Conversations plus the One Time Torah Questions pipeline remain the customer transcript/source of truth.
- The GitHub fallback stores sanitized result JSON only. It does not store credentials, customer messages, contact exports, or a second transcript.
- Telegram is a transport/controller, not an independent Torah-answering authority.
- Bulk campaigns remain draft-only without exact segment, exact recipient count, and explicit confirmation; this lane performs no customer send.

## Verification plan

1. Focused Node tests for workspace taxonomy/routes, Agent Action lifecycle/import/fallback, and Telegram fake adapter.
2. Start a local preview with isolated credentials and no protected provider tokens.
3. Browser-smoke the Hub, detail, drop-off, JSON save/readback, and workspace/connector routes.
4. Run `npm run secrets:audit` and `git diff --check`.
5. Publish branch/draft PR, obtain preview URL, and record the exact remaining blocker if deployment/auth is unavailable.

## Verification evidence

- `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/TEST-RESULTS.md`
- `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/queue-import-proof.json`
- `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/preview-smoke.json`
- `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/agent-action-hub.png`
- `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/in-app-browser-smoke.md`
- `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/live-preview-smoke.json`

## Publication

- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/141`
- Preview URL: `https://bna-agent-actions-preview-bna-agent-actions-preview.up.railway.app`
- Agent Action route: `https://bna-agent-actions-preview-bna-agent-actions-preview.up.railway.app/operations/agent-actions`
- Isolated environment/service: `bna-agent-actions-preview` / `bna-agent-actions-preview`
- Verified provider-ready deployment: `173ea494-a6f5-4f7e-8a5d-869c4aa7a0c8` at commit `7bfa0c1e797862eba91e4350bfccf40cd802635e`
- Exact remaining blocker: none for the requested foundation; customer sends remain intentionally disabled pending an exact confirmed Torah-answer workflow.

## OT-LAUNCH-01 durable follow-up — 2026-07-22

- Status: `blocked_external_preview_database`
- Authoritative One Time source: PR #107, `codex/highlevel-final-results-20260722` at `1fb2d39285b5cf644f2a5bc04d27e1b7385db173`.
- Authoritative result: `GHL-FINAL-ORGANIZATION-20260722.result.json`, Git blob `91719bc831bbe8a9b6032d6f27a946abe77b69f4`, SHA-256 `b5e116a99854c634b19bdee4653becb424d635368890ba5a92bca859841537cf`.
- Preview database inspection: the isolated `bna-agent-actions-preview` environment has neither `DATABASE_URL` nor a linked disposable Postgres service. The deployed Agent Action API now fails closed; memory is local/test-only.

| ID | Follow-up requirement | Status | Evidence / blocker |
| --- | --- | --- | --- |
| REQ-20260722-010 | Durable preview PostgreSQL with fail-closed deployed behavior | Implemented locally; blocked externally | One PostgreSQL repository and forward-only migration now cover jobs, leases, partial/final sanitized results, idempotent readback, supersession, audit, and Telegram leases/dedupe. Read-only Railway inspection still finds no preview `DATABASE_URL` or linked database. |
| REQ-20260722-011 | Save/readback across restart/redeploy | Blocked by REQ-010 | A two-process disposable-PostgreSQL integration proof is implemented but skipped because no explicit `BNA_AGENT_ACTION_TEST_DATABASE_URL` exists; no memory fallback is permitted. |
| REQ-20260722-012 | Reconcile current One Time queue without duplicates | Done locally | 31 unique jobs: 9 verified, 2 superseded, 20 blocked; exact PR #107 source/result hashes pinned |
| REQ-20260722-013 | Prove semantic supersession of PR #139/#140 | Done | `semantic-supersession.json` records every source/adapted commit and exact included/missing paths |
| REQ-20260722-014 | Real dedicated Telegram + One Time GHL provider adapter | Done locally; PostgreSQL execution proof blocked | Signed webhook, private allowlist, generation-counted single-consumer lease, update processing lease/reclaim, handled-once dedupe, replay window, synthetic-only opportunity/note draft, protected voice gate, no send. |
| REQ-20260722-015 | Private Telegram + synthetic GHL draft canary | Blocked by REQ-010 | Provider bridge requires durable preview dedupe/audit/question state before any canary mutation |
| REQ-20260722-016 | Operator-visible sanitized Preview | Done locally | Storage/provider/question/canary state and exact blocker; no tokens, IDs, contacts, or bodies |

### Single operator action

`OPERATOR_DECISION_REQUIRED: authorize one disposable PostgreSQL service in the BNA isolated preview only; no production.`

### Durability implementation continuation

- Forward-only migration: `railway-migration-2026-07-22-agent-action-durability.sql`.
- Canonical repository: `src/lib/bna/agent-action-postgres-repository.js`; the existing server APIs delegate to it in PostgreSQL mode and retain memory only for local/test mode.
- Focused verification currently passes with the real PostgreSQL integration proof explicitly skipped because no disposable URL is available. The proof starts one process to claim/save, stops it, starts a second process to read back, then verifies one expired Agent Action lease reclaim and handled-once Telegram update dedupe.
- Read-only Railway inspection: environment `bna-agent-actions-preview`, one web service instance, deployment `79e7235c-03fc-44ed-a9e9-ba2cfb6c1e57`, head `adf0189ddbb3f279683d58ec44edb5ca0e9f1fbe`, `DATABASE_URL` absent, linked Postgres absent.
- Customer/GHL messages sent in this continuation: `0`. No Railway resource, variable, deployment, provider record, or production service was mutated.
