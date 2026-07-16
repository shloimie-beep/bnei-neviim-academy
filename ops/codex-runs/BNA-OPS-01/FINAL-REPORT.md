# BNA-OPS-01 Final Report

Status: Local implementation verified; live canary blocked.

## Ancestry

- Exact base: `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`
- School route source head: `d23cbc2f321b55ea073b0bb0ee5c887bf7be50a7`
- OT-89B consumer source head: `8861e9b0e9bf77ca9b74112cbb2d04b6fa2bfd88`
- Branch: `codex/bna-ops01-school-support-stabilization`
- Implementation commit: `ae4b48c0c651071c7f1e86098c857c132b6ebf22`

## Implementation Summary

- Integrated the school route source head and OT-89B subscriber support consumer head on the requested branch.
- Preserved the lightweight school/admin route and verified its performance budget.
- Kept the signed OT-89 support ingress/status contract, subscriber-only authorization semantics, HMAC/timestamp/nonce replay protection, schema limits, redacted audit, idempotent ticket creation, operator readback page, and opaque decision tokens.
- Hardened the BNA alert outbox to use bounded PostgreSQL claims with `FOR UPDATE SKIP LOCKED`, lease owner/generation/expiry, retry/backoff, attempt limits, `sent`, `failed`, and `dead_letter` states, and safe redacted error storage.
- Added a fail-closed delivery gate: real Telegram alert draining requires `OT89_REAL_TELEGRAM_DELIVERY_ENABLED=true` and `OT89_BNA_BOT_SOLE_OWNER_VERIFIED=true`.
- Preserved the frozen support-event contract hash by adding a narrow `.gitattributes` LF rule for `ops/codex-runs/OT-89B/SUPPORT-EVENT-CONTRACT.json`.

## Verification

- `node --check server.js` - PASS.
- `node --check src/lib/bna/support/one-time-support-consumer.js` - PASS.
- `node --test tests/ot89b-onetime-support-consumer.test.js` - PASS 14/14.
- `node --test tests/school-admin-speed-surface.test.js tests/watchdog-action-registry.test.js tests/one-time-action-coverage.test.js tests/ot89b-onetime-support-consumer.test.js` - PASS 30/30.
- `npm run school-admin:perf:budget` - PASS: initial requests 4/4, JS gzip 3960/256000, CSS gzip 1687/81920, HTML 3081/24576.
- `git diff --check` - PASS.
- `npm run secrets:audit` - PASS: 9676 tracked paths checked, 0 tracked secret-risk files found.
- `npm run pqc:validate` - PASS.
- `npm run pqc:validate:fixtures` - PASS.
- `npm run pqc:evals` - PASS.
- `npm run watchdog:protocol-drift` - PASS: `ops/watchdog-audits/2026-07-16-product-quality-drift.md`.

## Synthetic Canary

Local synthetic canary coverage is in `tests/ot89b-onetime-support-consumer.test.js`: one signed fictional subscriber support event creates one BNA ticket reference/history chain, queues one alert, rejects replay/collisions/bad signatures/stale timestamps/non-subscribers/malformed input, denies wrong decision identities, and proves alert retry/dead-letter behavior without sending Telegram.

Live canary remains blocked until safe BNA staging and protected BNA bot-token ownership proof exist.

## Blockers

- `BLOCKER-BNA-OPS-01-LIVE-CANARY`: Missing proof of safe BNA staging target and sole ownership of the existing BNA bot token.
- Required next action: provide protected staging/bot ownership proof, then run one synthetic live canary only. Do not contact production customers.

## External Effects

- Production deployment: none.
- Production customer contact: none.
- External sends: none.
- Credential changes: none.
- Production data mutations: none.
