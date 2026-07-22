# Platform Agent Actions Telegram preview test results

Date: 2026-07-22
Branch: `codex/platform-agent-actions-telegram-preview`

## Passed

- JavaScript parse checks: `server.js`, Agent Action Hub, Rabbi Telegram console, and preview smoke script.
- Focused workspace, route, communications boundary, Agent Action lifecycle/fallback, hosted no-database session, import, and Telegram fake-adapter tests: `38/38`.
- Pinned live One Time queue import: `14` jobs; source SHA `1000e8f46210a85f720f83fce2678b24a44fa94d`; artifact blob `8982b719dff696fff291fa868130b5900127f324`; no secrets; no external write.
- Deterministic preview API/browser smoke: claim, in progress, partial save, idempotency replay, completed save, verified readback, supersede, all required routes, and zero actionable console errors.
- In-app browser smoke: workspace separation, One Time connector, result-only fallback, and provider-neutral Telegram foundation visible.
- Hosted Railway smoke at implementation commit `7bfa0c1e797862eba91e4350bfccf40cd802635e`: authenticated Agent Actions and One Time pages passed; 14 jobs imported; claim/in-progress/partial/idempotent/completed/readback/supersede passed.
- Credential follow-up: the dedicated BNA Rabbi bot token and the One Time production Rabbi chat/GHL PIT/location were located without printing values, copied only to the isolated preview, and read back as exact matches.
- Provider validation: Telegram `getMe` and private-chat readback passed; GHL location readback passed; live Hub reports `private_canary_ready` / `provider_contract_only` with no blockers.
- One silent operator-owned private Telegram canary returned a message ID. No GHL message or customer message was sent.
- `npm run secrets:audit`: `9681` tracked paths, `0` findings after staging the live closeout evidence.
- `npm run watchdog:protocol-drift`: `0` findings after hydrating tracked protocol files omitted from sparse checkout and carrying forward the PR #139 packet metadata.
- `git diff --check`: passed on the frozen pre-commit diff.

## Safety result

- Customer messages sent: `0`.
- GHL mutations: `0`.
- Telegram provider messages: `1` operator-owned private canary.
- GitHub fallback writes: `0` (plan/payload only).
- Production changed: `false`.
- Actual preview provider mode: `private_canary_ready`; protected credentials remain Railway-managed and are not present in repository evidence.

## OT-LAUNCH-01 durable follow-up

- Focused workspace/Agent Action/One Time/Telegram/GHL provider tests: **46/46 PASS**.
- Deployed DB-failure policy tests: **PASS** (Railway/deployed runtime cannot select memory; sanitized `503 agent_action_database_unavailable`).
- PR #107 queue reconciliation test: **PASS** (31 unique jobs; 9 verified, 2 superseded, 20 blocked; protected location ID absent).
- Telegram provider contract: **PASS** (dedicated bot only, signed webhook, private allowlist, consumer lease, replay window, update dedupe, redacted audit).
- GHL provider contract: **PASS** (synthetic-only note draft, save/readback, idempotency, no second transcript, no customer send).
- Voice gate: **PASS** (protected transcription configuration required; raw audio not stored).
- Semantic supersession: **PASS** (PR #139/#140 exact commit/path evidence, no missing paths).
- Secrets audit: **PASS**, 9,689 tracked paths, 0 findings.
- Protocol drift: **PASS**, 0 findings.
- `git diff --check`: **PASS**.
- Durable preview restart/readback: **BLOCKED** — isolated preview has no `DATABASE_URL` or linked Postgres service; deployed code remains fail-closed.
- Private synthetic Telegram/GHL canary: **BLOCKED** by the same durable-store gate; no canary mutation attempted.
- Customer messages sent: **0**. Production changed: **NO**.
