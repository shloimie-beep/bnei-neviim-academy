# One Time Resend/Vimeo/Stripe Safe Smoke - 2026-07-06T14:22:03.884Z

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
- from_configured: true
- domain_configured: true
- send_allowed: true
- blocker: Send path is configured, but this smoke intentionally does not call Resend /emails without an approved target recipient.

## Vimeo

- client_id_configured: true
- client_secret_configured: true
- access_token_configured: true
- authenticated_api_status: credential_invalid
- public_embed_player_ok_count: 2/2
- manual_attach_preview_ok: true
- upload_intent_status: manual_ready
- blocker: none

## Stripe

- configured: true
- mode: live
- test_mode_api_check: skipped:stripe_live_key_blocked_for_no_charge_sandbox_smoke
- checkout_preview_only: true
- local_beta_external_write_performed: false
- live_charge_enabled: false
- blocker: Configured Stripe key is live mode. This smoke did not call Stripe API because the user requested sandbox/no-charge testing.

