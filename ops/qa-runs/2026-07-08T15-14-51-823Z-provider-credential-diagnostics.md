# Provider Credential Diagnostics - 2026-07-08T15:14:51.818Z

This report never includes secret values or access tokens.

External write performed: false
Secret values printed: false

## zoom
- account_id: configured=true; source=keyholder; length=22; fingerprint=6b99b0f3b092
- client_id: configured=true; source=keyholder; length=22; fingerprint=eca43b944600
- client_secret: configured=true; source=keyholder; length=32; fingerprint=8a1762775556
- readiness_state: credentials_present, auth_verified_read_only, live_write_not_tested
- auth_check_status: token_ready
- auth_check_ok: true
- http_status: 200
- scope_count: 39
- returned_token_fingerprint: 98916581a95e
- returned_token_stored: false

## vimeo
- client_id: configured=true; source=keyholder; length=40; fingerprint=a1ce14a700bb
- client_secret: configured=true; source=keyholder; length=128; fingerprint=8bbbec6b699d
- access_token: configured=true; source=keyholder; length=232; fingerprint=d57f6ab0e5c0
- readiness_state: credentials_present, auth_verified_read_only, live_write_not_tested
- auth_check_status: client_credentials_ready
- auth_check_ok: true
- http_status: 200
- scope_count: 1
- returned_token_fingerprint: 5772a7c254d6
- returned_token_stored: false

## resend
- api_key: configured=true; source=keyholder; length=36; fingerprint=425f2ccf2704
- from: configured=false; source=not configured; length=0; fingerprint=none
- from_email: configured=true; source=keyholder; length=23; fingerprint=a64728a6a2bb
- domain: configured=true; source=keyholder; length=18; fingerprint=b1af740e7c10
- rabbi_api_key: configured=true; source=keyholder; length=36; fingerprint=425f2ccf2704
- rabbi_domain: configured=true; source=keyholder; length=18; fingerprint=b1af740e7c10
- readiness_state: credentials_present, auth_verified_read_only, live_write_not_tested
- auth_check_status: domains_read
- auth_check_ok: true
- http_status: n/a
- scope_count: n/a
- returned_token_fingerprint: none
- returned_token_stored: false
- domain_count: 1
- configured_domain_present: true
- configured_domain_verified: true

## stripe
- secret_key: configured=true; source=keyholder; length=107; fingerprint=dcdee8231aac
- rabbi_secret_key: configured=false; source=not configured; length=0; fingerprint=none
- readiness_state: credentials_present, owner_action_required, live_write_not_tested
- auth_check_status: configured_live_mode
- auth_check_ok: true
- http_status: n/a
- scope_count: n/a
- returned_token_fingerprint: none
- returned_token_stored: false
- blocked_actions: product_write, price_write, checkout_create, live_billing
- blocker_count: 3

## green_invoice
- secret: configured=false; source=not configured; length=0; fingerprint=none
- rabbi_secret: configured=false; source=not configured; length=0; fingerprint=none
- rabbi_api_key: configured=false; source=not configured; length=0; fingerprint=none
- readiness_state: credentials_missing, owner_action_required, live_write_not_tested
- auth_check_status: not_configured
- auth_check_ok: false
- http_status: n/a
- scope_count: n/a
- returned_token_fingerprint: none
- returned_token_stored: false
- missing: GREEN_INVOICE_SECRET or RABBI_GREEN_INVOICE_SECRET, RABBI_GREEN_INVOICE_API_KEY
- blocked_actions: invoice_create, payment_collect, live_payment
