# 2026-07-22 — Platform Agent Actions Telegram preview

- Raw source: `raw-input/RAW-20260722-001-platform-agent-actions-telegram-preview.md`
- Branch: `codex/platform-agent-actions-telegram-preview`
- Base: `master` at `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`
- Workspace/project: `platform_control` / `platform_agent_actions_telegram_preview`
- Status: `complete_preview`
- External mutation guard: no customer send, GHL mutation, credential mutation, production-data mutation, or production deployment

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
| REQ-20260722-006 | Implement provider-neutral `one_time_rabbi_torah_console` foundation | Done hosted | Live connector reports provider-off/fake, canonical GHL source of truth, and customer messages sent 0 |
| REQ-20260722-007 | Run the minimal requested verification set only | Done | Focused tests 38/38, queue import, local and hosted browser/API smoke, secrets audit, protocol drift 0, and diff check |
| REQ-20260722-008 | Publish a draft PR and a non-production preview URL | Done | Draft PR #141 and isolated Railway preview are live at the recorded URLs |
| REQ-20260722-009 | Preserve safety invariants | Done | `CUSTOMER_MESSAGES_SENT=0`; no production deployment/change; hosted preview is provider-off because protected Telegram/GHL credentials are absent |

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
- Verified implementation deployment: `9f44c549-65c2-4a27-a923-4db8896b6654` at commit `7cc2cf8eb78e79567c0190dab395ecb9fefcfebf`
- Exact remaining blocker: protected Rabbi Telegram bot/chat and One Time GHL credentials are absent, so provider mode remains off and no private canary ran.
