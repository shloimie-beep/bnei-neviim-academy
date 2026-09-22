# RAW-20260708-007 - OneTime parent email and shared-repo scope guardrails

- Source channel: codex_chat
- Created at: 2026-07-08
- Parse status: registered
- Requirement register: `tasks-pending/2026-07-08-onetime-email-brand-scope-guardrails.md`

## Raw Source

Shloimie reported that the OneTime parent invite email he received still had
Academy-related branding/URLs and was not sent as a completely OneTime1Time
experience from the OneTime sender. He asked Codex to resend a clean
professional parent experience email to the redacted operator test Gmail
address with no Academy mention, no backend/admin language, and the actual
Zoom link for tonight's shiur.

He then clarified that the repo needs guardrails because one repository is
serving two different projects and two different systems, and asked Codex to
set something up to prevent cross-project contamination.

## Parsed Items

- `REQ-20260708-032`: OneTime parent invite links must use the OneTime public
  domain and must not be derived from the Academy/request host.
- `REQ-20260708-033`: OneTime parent invite sends must use the scoped OneTime
  sender identity when Resend is configured.
- `REQ-20260708-034`: Parent invite email copy must be clean OneTime copy with
  no Academy branding/backend diagnostics and a validated optional live-shiur
  link.
- `REQ-20260708-035`: Add a repeatable workspace-scope watchdog that fails on
  known OneTime/BNA boundary leaks.
- `DEC-20260708-007`: A live resend remains blocked until the exact current
  Zoom join link and live sender readiness are verified.
