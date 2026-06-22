# One Time Resend/Vimeo/Stripe Safe Smoke - 2026-06-22T18:10:51.056Z

This smoke performs only no-send, no-upload, no-charge checks. It does not call Resend email send, Vimeo upload/write, or Stripe checkout/payment mutation APIs.

## Guardrails

- external_write_performed: false
- resend_send_attempted: false
- vimeo_upload_attempted: false
- stripe_charge_attempted: false
- stripe_checkout_session_created: false

## Resend

- api_key_configured: true
- read_only_domain_check_attempted: true
- domain_check_ok: true
- domain_count: 1
- from_configured: false
- domain_configured: false
- send_allowed: false
- blocker: RESEND_FROM or RESEND_FROM_EMAIL is not configured. Drafts are allowed; production send is blocked.

## Vimeo

- client_id_configured: true
- client_secret_configured: true
- access_token_configured: false
- authenticated_api_status: needs_api_key
- public_embed_player_ok_count: 2/2
- manual_attach_preview_ok: true
- upload_intent_status: manual_upload_required
- blocker: Vimeo access token is not configured; skipping authenticated /me, folder, and recent-video API checks.

## Stripe

- configured: true
- mode: live
- test_mode_api_check: skipped:stripe_live_key_blocked_for_no_charge_sandbox_smoke
- checkout_preview_only: true
- local_beta_external_write_performed: false
- live_charge_enabled: false
- blocker: Configured Stripe key is live mode. This smoke did not call Stripe API because the user requested sandbox/no-charge testing.
