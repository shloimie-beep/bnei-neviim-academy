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

Naming note: this cycle keeps the current provider-scoped `bna_provider_*`
model as canonical instead of creating a second parallel
`bna_workspace_integrations` / `bna_secret_refs` model. If future DB ciphertext
storage is required, add it deliberately with a server-held encryption key and
AES-256-GCM or a platform secret store; do not migrate raw keys into visible
task text, logs, helper output, screenshots, prompt registers, or tracked
files.

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

- Secret redaction tests: complete.
- API tests proving raw secrets are never returned: complete for helper/status
  surfaces added in this cycle.
- Duplicate-key detection by safe fingerprint/HMAC only: complete for helper
  secret-ref handling.
- Approval-gate tests for sends/posts/uploads/charges/DNS writes: complete for
  this cycle's preview-first surfaces.
- Vimeo manual fallback tests: complete.
- Zoom/GoDaddy Thursday blocker UI/status checks: complete locally and
  deployed in readiness status.
- Helper permission/audit tests for integration tools: complete.

## 2026-06-16 Closeout

- Implemented in `server.js`,
  `src/lib/bna/helper/tool-registry.js`,
  `src/lib/bna/helper/planner.js`,
  `src/lib/bna/helper/permissions.js`,
  `src/lib/bna/helper/redaction.js`,
  `src/lib/integrations/video-hosting.js`, and
  `src/lib/integrations/vimeo.js`.
- Added migration
  `railway-migration-2026-06-16-provider-integrations-secret-storage.sql` and
  audit command `npm run integrations:audit`.
- Stabilization commit: `35e0571`.
- Railway production deployment:
  `47da54d6-fda7-495a-84ab-90b51ebdefe1` reached `SUCCESS`.
- Verification passed: changed-file syntax checks, focused provider/helper/
  INT-05 tests 20/20, full `npm test` 654/654, `npm run secrets:audit` with
  2397 tracked paths and 0 tracked secret-risk files, `npm run
  integrations:audit`, local `npm run smoke:int05-integrations` with 15 cards,
  Railway doctor, live app/public/privacy/auth/setup/onboarding/signup/WS11
  smokes, and direct authenticated live
  `/api/bna/integrations/status` readback with 15 cards.
- Remaining work is not code plumbing. It is provider/account-owner access and
  explicit approval: Zoom OAuth owner setup, GoDaddy/DNS delegate access,
  Resend DNS/domain setup, Vimeo token/upload readiness, Buffer channels/API
  key, WAPI/WhatsApp ownership, and Stripe pricing/payment ownership.
