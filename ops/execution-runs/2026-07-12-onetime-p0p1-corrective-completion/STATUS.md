# Status

Run remains active with release/live proof recorded and a short blocker list.

## Current Truth

- PR #129 is merged:
  https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR head at merge:
  `598f66238f68293575d5f9e6195bb6b032ebb156`
- Merge commit:
  `8e22e5d79844e994e94c4f3ed92ac51422649b8c`
- Deployed/live-smoked master SHA:
  `fc147ded1ee0e12325111382fa8e460134a8ce3d`
- Railway deployment id:
  `64ab8814-c984-4618-b808-5e762914f3eb`
- Production URL:
  https://join.onetimeonetime.com

## Verified

- `REQ-20260712-001`: July 12 raw prompt, Robot correction context, register,
  run files, and latest pointer were created.
- `REQ-20260712-003`: canonical browser tests load the real
  `/operations` bootstrap/generated CSS and JS assets instead of raw
  `public/operations.html`.
- `REQ-20260712-004`: normal One Time provider credentials establish a scoped
  Operations session and land on canonical `/operations`; provider aliases
  resolve away from the old independent provider dashboard.
- `REQ-20260712-012`: the urgent signup/reminder addendum was captured in the
  active run.
- `REQ-20260712-013`: canonical `/one-time/signup` is implemented and
  deployed/live-smoked; public Sign Up Now actions use the direct route.
- `REQ-20260712-014`: city/timezone signup schedule behavior is implemented,
  deployed, and covered by the focused One Time proof.
- `REQ-20260712-011`: release authorization, merge, deployment, and exact-SHA
  live smoke are complete; the machine status remains `needs_verification`
  until its final-matrix dependency is closed.

## Implemented But Still Open

- `REQ-20260712-005`: first-party One Time CRM DTO/API/UI, responsive local
  browser/API smoke, cross-workspace denial, and targeted mailbox flow are
  implemented locally. Terminal proof is blocked by the missing real local/test
  Postgres URL.
- `REQ-20260712-006`: direct signup and Family/School continuation linkage are
  implemented locally and deployed, but terminal persistence proof still needs
  the real local/test database journey.
- `REQ-20260712-007`: landing hierarchy, Robot asset optimization/launcher,
  config sync, and live smoke are complete. The broader requested screenshot
  matrix still has open non-landing surfaces.
- `REQ-20260712-008` / `REQ-20260712-009`: canonical ramble-to-done service,
  packet-status contract, adapter coverage, and regression tests pass locally
  and are deployed. Production write-smoke for intake/dropoff was not performed
  because it would create live raw/parse records without a separately scoped
  production test packet.
- `REQ-20260712-010`: signup/landing screenshot proof and matrix evidence
  exist; the full requested screenshot/matrix set remains open for provider
  login, Operations, CRM, mailbox, and Robot live views.
- `REQ-20260712-020` / `REQ-20260712-021`: release proof is complete, but
  terminal closeout depends on the blocked persistence/operator-test evidence.
- `REQ-20260712-022`: guarded reminder simulation and readiness checks pass
  locally, but the operator has not personally submitted the deployed test
  signup and hosted WAPI/Telegram/scheduler readiness is not fully green.

## Blockers

- `REQ-20260712-002`: GitHub token lacks `workflow` scope, so
  `.github/workflows/onetime-corrective.yml` still cannot be pushed.
- `REQ-20260712-005` / `REQ-20260712-006`: missing
  `BNA_ONETIME_CRM_TEST_DATABASE_URL` for the required real local/test
  Postgres persistence journey.
- `REQ-20260712-008` / `REQ-20260712-009`: production intake/dropoff
  write-smoke requires a separately scoped production test packet because it
  creates live raw/parse records.
- `REQ-20260712-022`: operator personal deployed signup and hosted reminder
  provider readiness are still open. No external sends were performed.

No production email/WhatsApp/Telegram/campaign send, charge/refund, access
grant, historical import, DNS/account mutation, credential mutation, or
external-provider write was performed.
