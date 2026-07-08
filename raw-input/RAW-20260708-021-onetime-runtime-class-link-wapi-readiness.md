# RAW-20260708-021 - OneTime runtime class-link WAPI readiness

Source: Codex goal continuation
Captured: 2026-07-08
Channel: codex_chat
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Parse status: registered

## Context

Goal continuation and operator concern about why WAPI/WhatsApp is blocked.
Codex inspected live OneTime Railway variables and WAPI diagnostics.

## Parsed Requirement

- `REQ-20260708-077`: Configure the current OneTime class link in runtime
  environment variables so WAPI/WhatsApp and parent-invite readiness checks no
  longer fail on a missing class link, while keeping live WhatsApp sends
  disabled until Rabbi-scoped WAPI credentials and approval gates are present.

## Guardrails

- Do not commit the raw Zoom URL.
- Do not enable WAPI auto-reply or send approval flags without verified
  Rabbi-scoped WAPI sender credentials.
- Do not perform a WhatsApp/WAPI send during readiness verification.
- Record only key-presence, blocker names, and redacted proof.
