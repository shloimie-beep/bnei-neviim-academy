# Status

Run remains active with release/live proof recorded and a short blocker list.
The scoped One Time class-reminder live dispatch requested on July 12 is now
verified.

## Current Truth

- PR #129 is merged:
  https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR head at merge:
  `598f66238f68293575d5f9e6195bb6b032ebb156`
- Merge commit:
  `8e22e5d79844e994e94c4f3ed92ac51422649b8c`
- Current production runtime source SHA for the reminder dispatch proof:
  `e4b57d0b63497f005098e48ce35951e9da58a798`
- Current Railway deployment id:
  `94ee2e4b-f01a-4c62-8d65-5731851345de`
- Runtime branch:
  `codex/onetime-signup-location-hotfix-20260712`
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
- `REQ-20260712-006`: direct signup to Family/School continuation exact
  linkage is verified with operator-approved production personal-contact
  proof and cleanup; no external sends were performed.
- `REQ-20260712-011`: release authorization, merge, deployment, and exact-SHA
  live smoke are complete; the machine status remains `needs_verification`
  until its final-matrix dependency is closed.
- `REQ-20260712-022`: production class-reminder dispatch proof is complete for
  the scoped July 12 send: 3 email reminders and 2 One Time WAPI WhatsApp
  reminders were sent at `2026-07-12T15:31:03Z` with 0 failures, and immediate
  replay sent 0 duplicates. Evidence:
  `ops/live-smokes/2026-07-12T15-31-36Z-one-time-class-reminder-live-dispatch.md`.

## Implemented But Still Open

- `REQ-20260712-005`: first-party One Time CRM DTO/API/UI is verified with the
  approved production fake-contact journey: signup capture, search/select,
  edit, note, follow-up task, reload persistence, cross-workspace isolation,
  targeted mailbox, return-to-contact state, task cleanup, and lead archive.
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
  locally, One Time WAPI provider setup is configured, the operator personal
  deployed signup/continuation proof is complete, and the scoped live
  email/WAPI reminder dispatch is verified. Telegram auto-reply/Telegram sends
  and unattended recurring scheduler observation remain separate gates.
- `REQ-20260712-017`: the protected One Time delivery outbox dispatcher is
  implemented and deployed. The July 12 live dispatcher proof processed the
  exact due queue and sent 5/5 scoped class reminders with 0 failures.
- `REQ-20260712-018`: One Time WAPI credentials and provider binding are
  configured in Railway and live on deployment
  `94ee2e4b-f01a-4c62-8d65-5731851345de`; readiness confirms
  `provider_setup.ready=true`, and the scoped WAPI reminder send proof passed.

## Blockers

- `REQ-20260712-002`: GitHub token lacks `workflow` scope, so
  `.github/workflows/onetime-corrective.yml` still cannot be pushed.
- `REQ-20260712-008` / `REQ-20260712-009`: production intake/dropoff
  write-smoke requires a separately scoped production test packet because it
  creates live raw/parse records.
- `REQ-20260712-022`: Telegram auto-reply/Telegram sends and unattended
  recurring scheduler observation remain separate gates. The scoped 3-email /
  2-WhatsApp class-reminder dispatch is complete.
- Credential hygiene: rotate the One Time `OPS_PASSWORD` because it appeared in
  local tool output during the Railway variable inspection. Do not write the
  old value to repo records.

Production external writes performed in this update: 3 Resend class-reminder
emails and 2 One Time WAPI class-reminder WhatsApps, scoped to the verified
class-reminder queue. No Telegram/campaign send, charge/refund, access grant,
historical import, DNS/account mutation, credential mutation, or legacy CRM
write was performed.
