# 2026-07-22 — Platform Agent Actions Telegram preview

- Raw source: `raw-input/RAW-20260722-001-platform-agent-actions-telegram-preview.md`
- Branch: `codex/platform-agent-actions-telegram-preview`
- Base: `master` at `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`
- Workspace/project: `platform_control` / `platform_agent_actions_telegram_preview`
- Status: `durable_preview_and_private_telegram_verified`
- External mutation guard: one operator-owned private Telegram canary and preview-only credential wiring; no customer send, GHL mutation, or production-data mutation. A transient unauthorized production source deployment occurred and was restored; canonical incident verdict: `PRODUCTION_CHANGED: YES_TRANSIENT_RESTORED`.

## Current-source audit

- PR #139 current head: `9e7efb3179c63bbb52571a9fc811773a24bccb7a`.
- PR #140 current head: `d03e15f3f51c35a91d699dc29e316b3f87d31bcf`.
- One Time queue source: `shloimie-beep/onetimev2`, ref `codex/highlevel-api-finalize-agent-queue`, SHA `1000e8f46210a85f720f83fce2678b24a44fa94d`, artifact `integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json`.
- Both PR descendants share the unchanged requested master base. Their implementation and architecture commits were applied in order; the only overlaps were append-only ledger/changelog records, resolved by preserving both lanes without duplication.

## Requirements

| ID               | Requirement                                                                                             | Status                                   | Acceptance / evidence                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-20260722-001 | Build from live master and current PR #139/#140 descendants without a stale mechanical merge            | Done locally                             | Live SHAs pinned above; branch history records four adapted descendant commits                                                                                                                                                                         |
| REQ-20260722-002 | Preserve separate Super Admin, BNA School, and One Time connector surfaces                              | Done hosted                              | Route/action registry assertions and authenticated live browser smoke cover all three surfaces                                                                                                                                                         |
| REQ-20260722-003 | Run Agent Action lifecycle with JSON claim/in-progress/partial/completed/readback/idempotency/supersede | Done hosted                              | `live-preview-smoke.json` records every requested transition and verified result readback                                                                                                                                                              |
| REQ-20260722-004 | Import the current One Time Agent Mode queue safely                                                     | Done hosted                              | Hosted preview imports 14 jobs from the pinned source SHA/blob with no secrets or external GHL write                                                                                                                                                   |
| REQ-20260722-005 | Provide optional sanitized result-only GitHub fallback for `onetimev2`                                  | Done hosted                              | Deterministic result-only branch/path/PR payload; Hub preferred; hosted smoke confirms Hub availability never blocks GHL completion                                                                                                                    |
| REQ-20260722-006 | Implement provider-neutral `one_time_rabbi_torah_console` foundation                                    | Done hosted                              | Live connector reports private-canary-ready/provider-contract-only, canonical GHL source of truth, one operator-only canary, and customer messages sent 0                                                                                              |
| REQ-20260722-007 | Run the minimal requested verification set only                                                         | Done                                     | Focused tests 38/38, queue import, local and hosted browser/API smoke, secrets audit, protocol drift 0, and diff check                                                                                                                                 |
| REQ-20260722-008 | Publish a draft PR and a non-production preview URL                                                     | Done                                     | Draft PR #141 and isolated Railway preview are live at the recorded URLs                                                                                                                                                                               |
| REQ-20260722-009 | Preserve safety invariants                                                                              | Done with historical incident correction | `CUSTOMER_MESSAGES_SENT=0`; no GHL mutation; protected credentials are preview-only; the sole Telegram send was operator-owned and private. Historical production drift was contained and restored under `PRODUCTION_CHANGED: YES_TRANSIENT_RESTORED`. |

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

## OT-LAUNCH-01 durable follow-up — 2026-07-23

- Status: `durable_preview_and_private_telegram_verified`
- Authoritative One Time source: PR #107, `codex/highlevel-final-results-20260722` at `1fb2d39285b5cf644f2a5bc04d27e1b7385db173`.
- Authoritative result: `GHL-FINAL-ORGANIZATION-20260722.result.json`, Git blob `91719bc831bbe8a9b6032d6f27a946abe77b69f4`, SHA-256 `b5e116a99854c634b19bdee4653becb424d635368890ba5a92bca859841537cf`.
- Preview database state: one private Railway PostgreSQL service is linked to the isolated `bna-agent-actions-preview` web service through a service reference. No public database proxy or SSH key exists. Memory remains local/test-only.

| ID               | Follow-up requirement                                         | Status                                                        | Evidence / blocker                                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-20260722-010 | Durable preview PostgreSQL with fail-closed deployed behavior | Done hosted                                                   | Private Railway PostgreSQL is connected; `/api/health` reports connected and the Agent Action API reports `storage=postgres`. No public proxy was opened.                                                 |
| REQ-20260722-011 | Save/readback across restart/redeploy                         | Done hosted                                                   | The 31-job sanitized projection retained identical SHA-256 and status counts across an exact service restart.                                                                                             |
| REQ-20260722-012 | Reconcile current One Time queue without duplicates           | Historical PR #107 projection verified; current repin pending | 31 unique jobs: 9 verified, 2 superseded, 20 blocked. The queue remains explicitly pinned to historical PR #107 and must not substitute for accepted PR #108 jobs.                                        |
| REQ-20260722-013 | Prove semantic supersession of PR #139/#140                   | Done                                                          | `semantic-supersession.json` records every source/adapted commit and exact included/missing paths                                                                                                         |
| REQ-20260722-014 | Real dedicated Telegram + One Time GHL provider adapter       | Telegram foundation done hosted; GHL provider off             | Signed single-consumer webhook, durable lease/dedupe, replay window, synthetic-only adapter boundary, protected voice gate, and no customer send.                                                         |
| REQ-20260722-015 | Private Telegram + synthetic GHL draft canary                 | Telegram canary done; GHL sub-capability provider off         | One operator-owned private `/questions` canary passed; immediate and post-restart replay were rejected. GHL draft/save/readback was not attempted because the operator-owned synthetic contact is absent. |
| REQ-20260722-016 | Operator-visible sanitized Preview                            | Done hosted                                                   | Storage/provider/question/canary state and exact blocker are visible without tokens, IDs, contacts, or bodies.                                                                                            |

### Remaining scoped input

Provide or authorize one operator-owned synthetic HighLevel contact only if the
synthetic draft/save/readback canary is still desired. Customer sends remain
fixed at zero. Repinning the historical PR #107 queue to accepted PR #108 jobs
is a separate reviewed importer change.

### Durability implementation continuation

- Forward-only migration: `railway-migration-2026-07-22-agent-action-durability.sql`.
- Canonical repository: `src/lib/bna/agent-action-postgres-repository.js`; the existing server APIs delegate to it in PostgreSQL mode and retain memory only for local/test mode.
- Focused verification passes 49 tests with 0 failures and 1 local skip. The skipped real-PostgreSQL harness has no private preview route from this machine; hosted restart/readback and durable replay proof passed without opening a proxy.
- Railway proof: environment `bna-agent-actions-preview`, web deployment `07ee9027-178f-49d7-ae6e-311eb8567ddf`, PostgreSQL deployment `6da1966f-1351-44cb-9347-f498e695e9c4`, exact source `b8bcfb01e735568a8bf13832ff74abe01cbb2cc1`, database connected, storage `postgres`.
- Customer/GHL messages in this continuation: `0`. One operator-owned private Telegram status response was emitted. Production mutations in this follow-up: `0`.
- Sanitized proof: `ops/codex-runs/2026-07-22-platform-agent-actions-telegram-preview/durability-telegram-live-proof.json`.
