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
