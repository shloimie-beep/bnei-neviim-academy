# Next Session

Continue in:
`C:\Users\User\BNA-onetime-p0p1-corrective-20260711`

Branch:
`codex/onetime-p0p1-corrective-20260711`

PR:
https://github.com/shloimie-beep/bnei-neviim-academy/pull/129

Next unblocked requirements:

- `REQ-20260712-014`: verify and complete server-side city/timezone conversion
  and DST-safe schedule metadata.
- `REQ-20260712-015`: verify and complete atomic product lead, scoped One Time
  CRM contact/lead, consent, dedupe, timeline, and outbox linkage.

Concrete next actions:

1. Run `npm run bna:run:validate` and `npm run bna:run:next`.
2. Inspect `src/lib/bna/one-time-signup-workflow.js`,
   `/api/one-time/interest`, CRM/outbox helpers, Resend/Telegram/WAPI helpers,
   and existing focused One Time tests.
3. Complete any missing server-side city/timezone validation and schedule
   conversion evidence for `REQ-20260712-014`.
4. Continue into `REQ-20260712-015`: atomic CRM/consent/dedupe/outbox storage
   and persistence proof.

Do not deploy. Do not send messages. Do not charge, import historical data,
grant access, mutate DNS/accounts/credentials, or write external providers.
