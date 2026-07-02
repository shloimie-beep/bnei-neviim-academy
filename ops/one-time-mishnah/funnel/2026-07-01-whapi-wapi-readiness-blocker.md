# One Time Whapi/WAPI Readiness Blocker

Generated: 2026-07-01T19:13:57+03:00

Requirement: `REQ-20260701-608`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Status

Provider setup is blocked by missing operator-owned Whapi/WAPI credentials and
approved sending number.

No WhatsApp message, broadcast, Whapi sync, WAPI provider mutation, external
CRM write, GHL/LeadConnector runtime, or raw credential read was performed by
this packet.

## Existing Safe State

- The Operations UI has WAPI/Whapi diagnostics, preview, phonebook grouping,
  and local correction tooling.
- Existing scoped WAPI phonebook report for One Time is dry-run/no-send and
  excludes unscoped WAPI directory rows.
- WhatsApp sends remain prohibited until explicit future approval.

Evidence:

- `ops/one-time-mishnah/funnel/2026-07-01-whatsapp-contact-scope-readback.md`
- `src/lib/bna/wapi-phonebook-report.js`
- `scripts/wapi-phonebook-report.mjs`
- `public/operations.html`
- `ops/action-registry.json`

## Required Before Setup Verification

- Exact keyholder alias or local path for Whapi/WAPI token.
- Approved sending number.
- Confirmation of provider account owner.
- Confirmation whether the first live test is read-only sync, preview, or one
  approved seed message.
- Explicit approval before any WhatsApp send.

## Forbidden Until Approval

- No WhatsApp broadcast.
- No imported contact send.
- No automatic reminder send.
- No phonebook send.
- No external CRM/GHL/LeadConnector write.
- No raw credentials in tracked files, screenshots, reports, or chat.

## Decision

This requirement remains `Blocked` until the credential alias/path and sending
number are supplied.
