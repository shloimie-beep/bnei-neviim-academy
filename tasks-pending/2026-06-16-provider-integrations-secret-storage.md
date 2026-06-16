# Provider Integrations And Secret Storage

Cycle ID: `2026-06-16-one-time-integrations-access-agent-audit`

## Goal

Build provider-owned integration setup for BNA, Rabbi Scheller / One Time, and
future service-provider workspaces without mixing accounts or exposing secrets.

## Product Rules

- Each workspace/provider should own its own external accounts by default.
- Supported integration types: `resend`, `buffer`, `wapi`, `vimeo`, `zoom`,
  `stripe`, `godaddy_dns`, `google_drive`, and `other`.
- BNA credentials must not silently power Rabbi/One Time or future provider
  workflows unless a managed-service exception is explicitly approved.
- Integration status and helper responses may show configured/not configured,
  account labels, last checked time, blockers, and safe fingerprints only.
- Raw secrets must not be returned by APIs, logged, committed, displayed in
  screenshots, included in prompts, or copied into task/comment text.

## Data Model To Implement Or Reconcile

- `bna_provider_integrations`: workspace/provider integration rows, status,
  connected account label, last check, metadata without secrets.
- `bna_provider_secret_refs`: secret references, labels, safe fingerprints,
  status, rotation/revocation metadata. Prefer server-side keyholder references;
  use DB encryption only with a server-held master key.
- `bna_provider_integration_audit_log`: redacted setup/check/action audit rows.
- `bna_dns_setup_tasks`: exact DNS checklist rows that can say "copy exact value
  from dashboard on Thursday" until the real dashboard values are known.

## Integration Cards

- Zoom: blocked until Thursday; needs Zoom Server-to-Server OAuth owner setup.
- GoDaddy/DNS: blocked until Thursday; delegate/DNS access needs owner repair.
- Resend: provider-owned account/key/domain flow; readiness and DNS checklist.
- Buffer: provider-owned API key/channel readiness; no publish without approval.
- WAPI/WhatsApp: provider-owned readiness first; no send without approval.
- Vimeo: default video-host candidate with API readiness plus manual URL fallback.
- Stripe: secret readiness only; no live products/prices/checkout until payment
  ownership and pricing are approved.

## Helper Tool Requirements

The BNA Helper must route integration requests through server-side, scoped,
audited tools. Required or pending tools include:

- `show_integration_status`
- `create_integration_setup_task`
- `save_provider_api_key`
- `rotate_provider_api_key`
- `test_resend_connection`
- `test_buffer_connection`
- `test_vimeo_connection`
- `test_wapi_connection`
- `mark_integration_blocked_until_thursday`
- `create_dns_setup_task`
- video workflow tools for manual/API Vimeo preparation and approval-gated
  library publishing.

## Verification Needed

- Secret redaction tests.
- API tests proving raw secrets are never returned.
- Duplicate-key detection by safe fingerprint/HMAC only.
- Approval-gate tests for sends/posts/uploads/charges/DNS writes.
- Vimeo manual fallback tests.
- Zoom/GoDaddy Thursday blocker UI tests.
- Helper permission/audit tests for integration tools.
