# Platform Agent Actions Telegram preview test results

Date: 2026-07-22
Branch: `codex/platform-agent-actions-telegram-preview`

## Passed

- JavaScript parse checks: `server.js`, Agent Action Hub, Rabbi Telegram console, and preview smoke script.
- Focused workspace, route, communications boundary, Agent Action lifecycle/fallback, hosted no-database session, import, and Telegram fake-adapter tests: `38/38`.
- Pinned live One Time queue import: `14` jobs; source SHA `1000e8f46210a85f720f83fce2678b24a44fa94d`; artifact blob `8982b719dff696fff291fa868130b5900127f324`; no secrets; no external write.
- Deterministic preview API/browser smoke: claim, in progress, partial save, idempotency replay, completed save, verified readback, supersede, all required routes, and zero actionable console errors.
- In-app browser smoke: workspace separation, One Time connector, result-only fallback, and provider-off Telegram foundation visible.
- Hosted Railway smoke at implementation commit `7cc2cf8eb78e79567c0190dab395ecb9fefcfebf`: authenticated Agent Actions and One Time pages passed; 14 jobs imported; claim/in-progress/partial/idempotent/completed/readback/supersede passed; provider-off/fake and customer messages sent `0` confirmed.
- `npm run secrets:audit`: `9681` tracked paths, `0` findings after staging the live closeout evidence.
- `npm run watchdog:protocol-drift`: `0` findings after hydrating tracked protocol files omitted from sparse checkout and carrying forward the PR #139 packet metadata.
- `git diff --check`: passed on the frozen pre-commit diff.

## Safety result

- Customer messages sent: `0`.
- GHL mutations: `0`.
- Telegram provider messages: `0`.
- GitHub fallback writes: `0` (plan/payload only).
- Production changed: `false`.
- Actual preview provider mode: `provider_off` because protected Telegram/GHL credentials were not loaded.
