# BNA Control-Plane Operations Bot Test Results

Date: 2026-07-24

Task: `BNA-CONTROL-PLANE-OPERATIONS-BOT-01`

## Passing Focused Proof

- `node --test tests/control-plane-operations-bot.test.js tests/universal-control-plane-scope-policy.test.js`
  - 31 passed
  - 0 failed
- Visible action audit through `buildActionAudit()`
  - `ok: true`
  - 0 findings
- Default runtime readiness:
  - provider `off`
  - delivery not attempted
  - empty mutation allowlist
  - no content, secret, chat-ID, One Time, or database exposure
- JavaScript parse checks:
  - `src/lib/bna/control-plane-operations-bot.js`
  - `scripts/bna-control-plane-operations-bot.mjs`
- Scoped Prettier formatting:
  - implementation module
  - isolated worker
  - focused tests
  - ADR/threat model
  - package script metadata
- `git diff --check`: pass.
- `npm run secrets:audit`:
  - 9,703 tracked paths checked
  - 0 tracked secret-risk paths
- Final staged structured-file parse:
  - action registry JSON: pass
  - task ledger JSONL: pass
  - package JSON: pass

## Safety Assertions Proven

- Dedicated identity never falls back to existing academy/Rabbi tokens or
  allowlists.
- A duplicate existing bot token keeps readiness off.
- `getMe` must match the pinned numeric bot ID.
- Missing ownership, allowlist, status source, or HTTPS link base keeps the
  provider off.
- Unauthorized/group chats are denied without a response.
- All mutation commands and non-versioned callbacks are denied and audited
  without raw text or chat IDs.
- Status schema rejects PII-like fields, arbitrary links, unknown count keys,
  oversized responses, and non-opaque refs.
- Status-source failure becomes only a generic unavailable state.
- One Telegram delivery failure does not stop other allowlisted notification
  attempts.
- Lease ownership, expiry/reclaim, renewal, and owner-only release are covered.
- Update state contains only the offset, status fingerprint, and notification
  check time.
- No bridge-monolith, One Time runtime, shell, or product-database dependency
  exists.

## Existing Lineage Drift Observed, Not Broadened

An attempted universal action-parity regeneration was discarded because the
governed base already contains 14 unrelated root action rows without the
generator's required test metadata. No generated failing artifact was kept.

An adjacent combined baseline run also exposed six unrelated failures in
existing action-routing/workspace expectations and a Telegram runtime source
literal assertion. The task does not change those implementation files. The
focused control-plane and shared scope suites pass.

## Closeout State

- Only the 12 scoped implementation, policy, registry, environment-template,
  evidence, and ledger/changelog files are staged.
- Final focused tests, action watchdog, provider-off readiness, secret audit,
  scoped format check, parse checks, and staged diff check pass.
- The branch is ready to commit, push, and open as a draft PR. No deployment or
  provider configuration is part of this closeout.
