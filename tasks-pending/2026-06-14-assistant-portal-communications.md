# Assistant / Portal / Communications Handoff - 2026-06-14

## Status

Deployed and live-smoked in Railway deployment
`0cca77e2-d718-47b6-bc28-6824125597f3`.

## What Changed

- Centralized email sender identity with `academySenderIdentity()` and
  `safeSenderDisplayName()`. Active email paths default to
  `Bnei Neviim Academy Office`; bad `Office P`-style values are normalized away.
- Added Resend connector config/status/webhook support while keeping Gmail as
  fallback until Resend account/domain/API key are configured.
- Extended email logging with full body/from/provider fields and mirrored
  important messages into first-party `bna_communications`.
- Added first-party tables and APIs for contacts, identities, communications,
  checkout attempts, user accounts/login tokens, assistant memory, WhatsApp
  imports, uploaded files, review requests, communities/classes/attendance, and
  compatibility ticket views.
- Website signup now upserts first-party contact/access/account state and creates
  checkout-attempt tracking for credit/payment-link flows.
- Signup thank-you pages mark checkout attempts as redirected before opening the
  payment link.
- Abandoned-checkout sweep is available as a dry-run by default and only sends
  reminder emails with explicit `SEND_ABANDONED_CHECKOUT_EMAILS` confirmation.
- WhatsApp import/sync endpoints can dry-run/import message exports into
  first-party contacts/communications and do not auto-send replies.
- Assistant widget now uses visualViewport/dynamic viewport units, scrolls
  messages inside the panel, keeps the composer visible, and applies mobile
  overflow guards.
- Student, parent, and provider portals gained explicit no-horizontal-overflow
  guards.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/assistant-portal-communications-contract.test.js`
- PASS `npm test` 323/323
- PASS `npm run app:smoke` before deploy:
  `ops/live-smokes/2026-06-14T09-23-27-364Z-live-app-smoke.md`
- PASS `npm run railway:doctor` before deploy
- FAIL `npm run openai:diagnose`: selected OpenAI key returns
  `401 invalid_api_key`; Kimi is approved temporary hosted-AI provider.
- PASS `npm run screenshot`: no horizontal scroll at 360, 390, 430, 768, 1440.
- PARTIAL `npm run lighthouse`: wrote `lighthouse-report.html`, then exited on
  Windows Chrome temp-directory cleanup (`EPERM`).
- PASS `npm run openai:smoke`: selected provider is Kimi (`kimi-k2.6`).
- PASS local assistant keyboard smoke:
  `tmp/qa-runs/assistant-portal-keyboard/assistant-keyboard-smoke.json`.
- PASS local Operations mobile smoke:
  `tmp/qa-runs/assistant-portal-keyboard/operations-mobile-smoke.json`.
- PASS safe local API smoke for communications, Resend status, Google readiness,
  abandoned checkout dry-run, and WhatsApp import dry-run.
- PASS Railway deployment `0cca77e2-d718-47b6-bc28-6824125597f3`.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T09-32-40-859Z-live-app-smoke.md`.
- PASS focused live read/dry-run smoke:
  `ops/live-smokes/2026-06-14T09-33-21-093Z-assistant-portal-focused-live-smoke.json`.

## Remaining Blockers

- Pending, owner Shloimie: configure Resend account/API key/sender domain/DNS
  before bulk or production launch email sequences.
- Pending, owner Shloimie: OpenAI API key/account path still returns
  `401 invalid_api_key`; Kimi is approved for now.
- Decision, owner Shloimie: confirm Google OAuth scope set and verification plan
  before public Google Calendar/Classroom/Business Profile use.
- Pending, owner Shloimie/Rabbi Scheller: confirm actual WhatsApp provider,
  export/API access, consent/templates, and review workflow before any
  automated WhatsApp follow-up.
- Decision, owner Shloimie: confirm payment processor/accounting policy before
  public payment-link launch and before enabling abandoned-checkout live sends.

## Next Steps

1. Add full Operations UI panels for WhatsApp Intake and expanded unified
   communications views beyond the current API/contact timeline merge.
2. Finish token-backed `/set-password` / `/login` screens for the new
   `bna_user_accounts` path; current parent reset flow remains active.
3. Wire assistant action registry calls to the new route set for tickets,
   tasks, comments, WhatsApp scan, abandoned-checkout dry run, and file intake.
4. Add signed Resend webhook verification once a webhook secret is configured.
5. Run a live internal-only signup/payment-link test after Shloimie approves the
   test recipient and confirms no real payment request will be sent.
