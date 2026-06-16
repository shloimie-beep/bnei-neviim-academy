# Safe Integrations Closeout

Cycle ID: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`

Status: `blocked_needs_human_decision_after_local_verification`

## What Changed

- Added a redacted integration readiness layer for keyholder/secrets, Google
  Drive, Telegram, Gmail/payment reminders, Resend, Stripe, Green Invoice,
  Buffer, Zoom, Vimeo/video hosting, archived GHL Social, and external-action
  gates.
- Added protected Operations/API status endpoint
  `GET /api/bna/integrations/status` and provider status/preview endpoints for
  Stripe, Zoom, video hosting/Vimeo, Buffer, and existing Resend/Buffer lanes.
- Added the exact INT-05 integration namespace aliases for:
  `GET /api/bna/integrations/telegram/status`,
  `POST /api/bna/integrations/buffer/drafts`,
  `POST /api/bna/integrations/buffer/schedules`,
  `GET /api/bna/integrations/resend/status`,
  `POST /api/bna/integrations/resend/email-preview`, and
  `POST /api/bna/integrations/resend/send`.
- Added `src/lib/integrations/external-actions.js` with explicit confirmation
  phrases, external-action audit helpers, and redacted error handling.
- Added compatibility module paths:
  `src/lib/integrations/secrets.js`,
  `src/lib/integrations/buffer.js`,
  `src/lib/integrations/resend.js`, and
  `src/lib/integrations/vimeo.js`.
- Added provider-safe readiness modules:
  `src/lib/integrations/stripe.js`,
  `src/lib/integrations/zoom.js`, and
  `src/lib/integrations/video-hosting.js`.
- Hardened `src/lib/integrations/secret-loader.js` against path traversal and
  added shared redaction helpers for nested data and errors.
- Extended Resend config to keep Shloimie/BNA and Rabbi sender/domain profiles
  separate without exposing keys.
- Hardened Resend send so verified-domain readiness is not enough by itself:
  provider sends require the exact `SEND_RESEND_EMAIL` approval phrase and write
  redacted external-action audit summaries.
- Added the additive `bna_external_action_audit` table and indexes to startup
  SQL. It stores summaries and statuses only, not raw secrets.
- Changed payment reminder scheduler behavior to default disabled. Live cron
  payment reminders require `PAYMENT_REMINDER_SCHEDULER=live`,
  `PAYMENT_REMINDER_SCHEDULER_CONFIRM=ENABLE_SCHEDULED_PAYMENT_REMINDERS`, and
  matching request confirmation.
- Added Operations > Integrations > Readiness UI in the active
  `public/operations.html` surface. It is preview/readiness only and does not
  send, bill, publish, upload, schedule, grant access, or write to external
  providers.
- Added docs:
  `docs/integrations/zoom-setup.md`,
  `docs/integrations/video-hosting-decision.md`, and
  `docs/integrations/telegram-bridge.md`.
- Added repeatable proof script
  `scripts/smoke-int05-integrations-ui.mjs` and package script
  `npm run smoke:int05-integrations`.

## Integration Status

| Integration | Local status | Safe actions | Blocked until |
| --- | --- | --- | --- |
| Keyholder / Secrets | Readiness and tracked-secret audit added | Metadata/readiness only | Never paste or commit secrets |
| Google Drive | Visible in consolidated status | Readiness only | OAuth/account decision before writes |
| Telegram | Visible in consolidated status | Bridge status/readiness only | Bot identity/chat allowlist decisions |
| Gmail / Payment reminders | Scheduler default disabled | Dry-run/manual preview | Explicit live scheduler confirm |
| Resend | Existing safe lanes extended | Domain/status/draft/guarded send checks | Credentials, complete DNS, verified domain, sender ownership |
| Stripe | Readiness and checkout preview added | Test-mode preview | Account owner, test/live decision, products/prices, explicit billing approval |
| Green Invoice | Visible status card | Webhook readiness visibility | Signature verification and provider decisions |
| Buffer | Existing safe lanes plus status alias | Readiness/channels/drafts/schedule preview | Credentials, org/channel IDs, explicit schedule/publish approval |
| Zoom | Server-to-Server OAuth readiness/checklist | Meeting preview only | Account owner/admin, env setup, explicit meeting-create approval |
| Vimeo / Video hosting | Provider-neutral decision/readiness | Draft/upload preview only | Host choice, account owner, upload capability, explicit upload approval |
| GHL Social / Legacy CRM | Archived by policy | Readiness note only | No new active GHL runtime should be added |
| External-action gates | Central confirmation/audit helpers | Approval checks and audit summaries | Exact confirmation before external writes |

## Proof

- `node --check server.js`
- `node --check src/lib/integrations/secret-loader.js`
- `node --check src/lib/integrations/external-actions.js`
- `node --check src/lib/integrations/stripe.js`
- `node --check src/lib/integrations/zoom.js`
- `node --check src/lib/integrations/video-hosting.js`
- `node --check src/lib/integrations/resend-client.js`
- `node --check src/lib/integrations/buffer-client.js`
- `node --check src/lib/integrations/secrets.js`
- `node --check src/lib/integrations/buffer.js`
- `node --check src/lib/integrations/resend.js`
- `node --check src/lib/integrations/vimeo.js`
- `node --check scripts/audit-secrets.mjs`
- `node --check scripts/smoke-int05-integrations-ui.mjs`
- `node --check scripts/telegram-kimi-bridge.mjs`
- `node --check scripts/google-drive-setup.mjs`
- `node --check scripts/buffer-ops.mjs`
- `scripts/ghl-ops.mjs` is absent and intentionally was not created because
  current `AGENTS.md` forbids adding active GHL runtime paths.
- Operations inline scripts parsed: 3/3.
- Focused integration/redaction tests passed: 26/26.
- `npm test` passed: 649/649.
- `npm run secrets:audit` passed: 1916 tracked paths checked, 0 tracked
  secret-risk files found.
- `npm run smoke:int05-integrations` passed with 12 readiness cards, no mobile
  horizontal overflow, and screenshots:
  `screenshots/int-05-integrations-desktop.png`,
  `screenshots/int-05-integrations-mobile.png`, and
  `screenshots/int-05-action-gate-preview.png`.

## External Blockers

- Live deploy, Railway doctor, and live Operations smoke were not run from this
  INT-05 pass because the shared worktree contains many unrelated local
  workstreams. Deploying now would ship more than INT-05 unless a safe release
  window or isolated release path is approved.
- Buffer credentials, organization ID, channel IDs, and publish/schedule
  approval phrase.
- Resend credentials, account owner, sender/domain ownership, complete DNS
  values copied from provider UI, and verified-domain readback.
- Stripe local secret storage is now set up: the loose Downloads key was
  normalized into `C:\Users\User\BNA-Keyholder\stripe-secret-key.txt`, the
  Downloads source was removed, and fingerprint-only diagnostics passed. The
  key was not copied to `.secrets` or Railway. Remaining Stripe blockers are
  account owner, target env choice (`STRIPE_SECRET_KEY` vs
  `RABBI_STRIPE_SECRET_KEY`), products/prices/payment links, webhook secret
  setup, refund/legal policy, test-buyer rollback, and explicit live billing
  approval.
- Zoom account owner/admin, Server-to-Server OAuth setup, host user/scopes, and
  explicit meeting-create approval.
- Video-hosting provider decision, account owner, Vimeo or alternate host API
  capability, and explicit upload approval.
- Telegram bot identity, allowed chat IDs, and any production restart/bridge
  decision.
- Green Invoice webhook signature verification and exact provider ownership
  decisions.

## Intentionally Not Changed

- No active GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ runtime was
  added.
- No external email, Gmail, WhatsApp, Buffer post, social schedule, billing,
  checkout creation, Zoom meeting, Vimeo upload, Google write, account grant,
  DNS write, or provider configuration write was performed.
- No raw secret, token, API key, access code, or credential value was printed,
  committed, screenshot, or recorded in task/changelog/ledger text.

## Safe Next Step

- Approve a safe deploy window or isolated release path, then deploy this
  bundle, run Railway doctor, and run a live authenticated Operations readiness
  smoke.
- Feed credentials only through the BNA keyholder/Railway secret workflow, then
  rerun readiness checks. Do not paste secrets into chat or tracked files.

## 2026-06-16 Stripe Keyholder Import

- Imported the loose Stripe secret from `C:\Users\User\Downloads\wwmonetime.txt`
  into the local keyholder file
  `C:\Users\User\BNA-Keyholder\stripe-secret-key.txt`.
- Removed the loose Downloads source file after import.
- Added Stripe to keyholder diagnostics metadata in
  `scripts/keyholder-diagnostics.mjs`, `scripts/open-bna-keyholder.ps1`,
  `docs/local-keyholder.md`, and `tests/keyholder-diagnostics.test.js`.
- Verified keyholder diagnostics and the Stripe loader without printing the
  secret value. The loader reports `configured_live_mode` from `keyholder`.
- Verification:
  - `node --check scripts/keyholder-diagnostics.mjs`
  - `node --test tests/keyholder-diagnostics.test.js` passed 2/2.
  - `npm run keyholder:diagnose` wrote
    `ops/qa-runs/2026-06-16T14-01-25-275Z-keyholder-diagnostics.md`.
  - Stripe loader sanitized check confirmed configured/live/keyholder and that
    the Downloads source no longer exists.
  - `npm run secrets:audit` passed: 1916 tracked paths checked, 0 tracked
    secret-risk files found.

## Current Blocker Audit

- As of 2026-06-16T16:58:19+03:00, the same blocker has repeated across the
  original INT-05 turn and two goal continuations: app/server/dashboard-visible
  INT-05 work cannot be marked complete until deploy plus live Railway/readiness
  smoke pass, but the current shared worktree contains unrelated local
  workstreams and the available Railway redeploy script bundles the whole
  workspace.
- Needed from Shloimie: approve either a clean/isolated INT-05 release path or
  an intentional accumulated-bundle deploy window.
