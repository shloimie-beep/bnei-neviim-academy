# Requirements

Machine-readable requirements live in `requirements.json`.

Open deployment/live verification requirements:

- `REQ-20260712-013`: deployed/live/operator proof for canonical
  `/one-time/signup`.
- `REQ-20260712-014`: deployed/live proof for city autocomplete, server-side
  timezone validation, and DST-safe Israel-time reminder conversion.
- `REQ-20260712-020`: deployed replay/no-side-effect proof for no portal,
  account, payment, or access paths.
- `REQ-20260712-021`: live scoped readback for exact-three local-class preview
  and activation gate.

Open implementation/provider-evidence requirements:

- `REQ-20260712-015`: atomic CRM/contact/consent/timeline/outbox storage with
  safe dedupe.
- `REQ-20260712-016`: immediate transactional confirmation email with
  server-side class-link alias and durable retry.
- `REQ-20260712-017`: dedicated One Time class-reminder dispatcher and durable
  outbox.
- `REQ-20260712-018`: WhatsApp reminder consent/readiness/suppression gates.
- `REQ-20260712-019`: exactly one scoped Rabbi Telegram alert per genuine
  signup.
- `REQ-20260712-023`: complete signup/reminder test matrix and evidence.
- `REQ-20260712-005`: complete first-party CRM DTO/actions/mailbox journey with
  real API persistence and cross-workspace denial.
- `REQ-20260712-006`: complete signup and Family/School continuation lead
  linkage.
- `REQ-20260712-007`: complete public landing hierarchy, Robot launcher, and
  One Time config.
- `REQ-20260712-008`: implement canonical ramble-to-done ingestion service.
- `REQ-20260712-009`: add mandatory ramble/release-gate regression tests.
- `REQ-20260712-010`: produce screenshot evidence and requirement matrix.

Release-gated:

- `REQ-20260712-022`: deployed personal operator test and local-class
  activation after operator confirmation.
- `REQ-20260712-011`: deploy/live smoke exact SHA only after explicit operator
  or reviewer authorization.
