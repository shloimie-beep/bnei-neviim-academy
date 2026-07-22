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

## Production incident correction and restoration

- The earlier `Production changed: NO` statement is superseded. Railway
  production had been source-mapped to this feature branch and deployed the
  feature series through `ffe56d8ea27c995affa267759b788ace3967dced`.
- Containment/restoration: **PASS**. Production now tracks canonical `master`;
  deployment `7ea83deb-34c2-4065-bb09-3267fd37ebbd` is active/successful at
  `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`; the feature deployment is
  removed.
- Runtime/health: **PASS**. `GET /api/health` returned HTTP 200,
  `status=ok`, `database=connected`, and exact `X-Bna-Deploy-Sha` readback for
  canonical master. `/version` and `/ready` are not routes (404) but returned
  the same canonical SHA header; `/api/health` is the repository's canonical
  health/readiness route.
- Database/migration integrity: **PASS**. A read-only production query found
  zero of the nine preview-only Agent Action/Rabbi tables; no rows or migration
  ledger entries were created and no audit write was performed.
- Provider/customer integrity: **PASS**. The dedicated bot token exists, but
  private-chat allowlist, webhook secret, One Time GHL PIT/location, synthetic
  contact, consumer enablement, and send enablement are absent/off. Provider
  calls observed: 0; Agent Action/Telegram/GHL customer effects: 0; customer
  messages sent: 0.
- Branch/environment isolation: **PASS**. Production tracks only `master`; the
  existing `bna-agent-actions-preview` service/environment tracks only
  `codex/platform-agent-actions-telegram-preview`.
- Full sanitized incident ledger:
  `production-deployment-incident.json`.
- Final incident verdict: **PRODUCTION_CHANGED: YES_TRANSIENT_RESTORED**.

## Final fail-closed browser correction

- The authenticated deployed smoke confirmed workspace separation, the One
  Time connector, sanitized fallback, provider readiness, synthetic question,
  canary state, and the exact no-database blocker.
- The smoke also found and corrected an Agent Actions UI state that remained on
  `Loading` after the expected database 503. The route now renders an explicit
  `Agent Action storage unavailable` blocker and keeps the result-only GitHub
  fallback visible.
