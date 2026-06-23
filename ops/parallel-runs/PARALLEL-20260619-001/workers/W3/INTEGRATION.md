# W3 Integration Notes

Prompt 05 owns these shared-file changes. W3 did not edit shared entrypoints.

## Shared Files To Wire

### `server.js`

- Import or require:
  - `src/platform/ingestion/intake-source.js`
  - `src/platform/ingestion/canonical-parser.js`
  - `src/platform/ingestion/prompt-queue.js`
  - `src/platform/agent-control/closed-loop.js`
  - `src/platform/prompts/whatsapp-parent-update.js`
- Before existing intake parse writes, create a provider-neutral intake source record and persist its stable key/fingerprint.
- Use `parsePlatformIntake()` as the structured facade for parent prompt children while preserving current `parseIntakeText()` behavior.
- Add or map parent prompt queue read models for `/queue`, `/prompt <id>`, and `/ramble_status`.
- Use closed-loop helpers when creating verification work packages, browser prompts, evidence records, retry findings, and operator Decisions.
- When content prompt platform is `whatsapp_update`, expose prompt version `whatsapp-parent-update-v3` and run local validator before marking a generated draft as ready for review.

### `scripts/google-drive-setup.mjs`

- Add a Prompt 05-approved Drive setup option for:

```text
BNA V2/
  00 Upload Here - Rambles & Prompts/
    10 Queued/
    20 In Progress/
    30 Needs Decision/
    40 Completed/
    90 Archive/
```

- Use the W3 folder plan as the source of truth.
- Do not mutate Drive unless operator approval exists.

### `scripts/telegram-kimi-bridge.mjs`

- In `parseCanonicalIntakeToApp`, create/update the parent prompt record before child item writes.
- Telegram `/queue`, `/prompt <id>`, and `/ramble_status` should read the queue view models.
- Capture confirmations should include parent prompt ID in addition to raw ID when available.

### `scripts/agent-fleet-supervisor.mjs`

- Wrap claimed Codex work in W3 work packages.
- Record progress/evidence via closed-loop helpers.
- On verification failure, requeue the exact finding until retry limit; then create one operator Decision.

### `package.json`

Optional Prompt 05 scripts:

```json
{
  "ramble:intake-contract": "node scripts/ramble-intake-contract.mjs",
  "prompt:queue-contract": "node scripts/prompt-queue-contract.mjs"
}
```

### `public/operations.html`

- W3 did not edit this shared file.
- An exploratory compatibility run of `tests/agent-control-center.test.js`
  failed because the test helper expects the inline script marker
  `<script>\n        // API Client`. Prompt 05 should either preserve that marker
  during shared UI integration or update the shared test helper if the marker is
  intentionally stale.

## External Gates

- No Drive mutation was performed by W3.
- No Telegram send/report was performed by W3.
- No deploy, Railway, DNS, credential, live OAuth, production DB migration, email, WhatsApp, Vimeo, Zoom, Resend, billing, or Buffer mutation was performed by W3.
