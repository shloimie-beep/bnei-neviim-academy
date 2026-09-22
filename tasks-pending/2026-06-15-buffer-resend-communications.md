# Buffer and Resend Communications Integrations

## Status

Local implementation is complete and verified. Live activation is blocked until
credentials, complete DNS records, deployment, and live readiness checks are
available.

## What Changed

- Added `src/lib/integrations/secret-loader.js` for env, keyholder, and
  `.secrets` lookup without printing secret contents.
- Added `src/lib/integrations/buffer-client.js` for Buffer GraphQL readiness,
  organization/channel listing, provider drafts, and confirmation-gated
  scheduling.
- Added `src/lib/integrations/resend-client.js` for Resend readiness, domain
  list/status, domain verify, and verified-domain/fallback-gated email send.
- Added first-party tables:
  - `bna_social_posts`
  - `bna_email_drafts`
  - `bna_dns_setup_tasks`
- Added protected Operations API endpoints:
  - `GET /api/bna/integrations/buffer/health`
  - `GET /api/bna/integrations/buffer/channels`
  - `GET /api/bna/integrations/resend/health`
  - `GET /api/bna/integrations/resend/domains`
  - `GET /api/bna/integrations/resend/domains/:domain/status`
  - `POST /api/bna/integrations/resend/domains/:domain/verify`
  - `GET/POST /api/bna/communications/social/drafts`
  - `POST /api/bna/communications/social/schedule/preview`
  - `POST /api/bna/communications/social/schedule/confirm`
  - `GET/POST /api/bna/communications/email/drafts`
  - `POST /api/bna/communications/email/send`
  - `GET/POST /api/bna/communications/dns-tasks`
  - `PATCH /api/bna/communications/dns-tasks/:id`
- Added Operations > Integrations > Communications for readiness, drafts,
  Buffer schedule confirmation, Resend domain verification, email send gating,
  and DNS task tracking.
- Updated Telegram `/accounts` to use readiness-aware Buffer endpoints.
- Updated `scripts/buffer-ops.mjs` so Buffer provider writes remain draft-only.

## Guardrails

- Never paste, print, log, commit, or screenshot real Buffer or Resend keys.
- Use only server-side env, `C:\Users\User\BNA-Keyholder`, another approved
  keyholder root, or `.secrets` for local development secrets.
- Buffer social content defaults to local draft and provider draft behavior.
  Scheduling requires an explicit Operations preview token plus confirmation.
- Resend production send is blocked unless the configured sending domain is
  verified or `RESEND_SEND_FALLBACK_APPROVED=true` is explicitly configured
  server-side.
- DNS task records reject truncated screenshot values such as values ending in
  ellipses. Copy complete Resend DNS values from the Resend dashboard only.
- Account ownership is metadata, not a secret. Keep `RESEND_ACCOUNT_OWNER`,
  `RESEND_PROVIDER_ACCOUNT`, `RESEND_DOMAIN`, and sender fields distinct.
- No GHL/GoHighLevel/LeadConnector runtime path was added.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/buffer-ops.mjs`
- PASS `node --check src/lib/integrations/secret-loader.js`
- PASS `node --check src/lib/integrations/buffer-client.js`
- PASS `node --check src/lib/integrations/resend-client.js`
- PASS `node --test tests/integrations-secret-loader.test.js tests/buffer-client.test.js tests/resend-client.test.js tests/communications-integrations-contract.test.js`
- PASS `npm test` 578/578

## Remaining Blockers

- Buffer key must be installed server-side through the BNA keyholder or Railway
  env path.
- Buffer organization ID and intended Facebook, LinkedIn, YouTube, or default
  channel IDs must be confirmed.
- Resend key must be installed server-side through the BNA keyholder or Railway
  env path.
- Resend account owner/provider account/domain/sender metadata must be
  confirmed for the intended sending identity.
- Full Resend DNS record values must be copied from the Resend dashboard. Do
  not use partial screenshot values.
- Deploy the changed bundle, run Railway doctor, then run live Buffer and
  Resend readiness smokes before marking this complete.

## Needed From Shloimie

- Confirm which Buffer organization and channels BNA should use for
  Facebook, LinkedIn, and YouTube.
- Provide or approve the server-side keyholder/Railway setup for Buffer and
  Resend keys without pasting secrets into chat or tracked files.
- Confirm Resend ownership metadata: account owner, provider account, sending
  domain, and sender identity.
- Copy the full Resend DNS records directly from the Resend dashboard so Codex
  can track setup tasks and verify readiness.
- Approve deployment/live verification once the above values are available.
