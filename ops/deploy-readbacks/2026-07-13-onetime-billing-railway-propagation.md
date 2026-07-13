# One Time Billing Railway Propagation

Generated: 2026-07-13T13:13:01.918Z

Dry run: false
External write performed: true
Credential mutation performed: true
Deployment triggered: false
Live payment performed: false
Secret values printed: false
Target service: one-time-web
Target environment: production

## Variables

### RABBI_STRIPE_SECRET_KEY
- configured locally: true
- source: keyholder
- length: 107
- set ok: true
- value sent via stdin: true
- value printed: false
- reason: none

### RABBI_STRIPE_MODE
- configured locally: true
- source: constant:test
- length: 4
- set ok: true
- value sent via stdin: false
- value printed: false
- reason: none

### RABBI_STRIPE_WEBHOOK_SECRET
- configured locally: true
- source: keyholder
- length: 38
- set ok: true
- value sent via stdin: true
- value printed: false
- reason: none

### ONE_TIME_STRIPE_PRICE_ID
- configured locally: true
- source: keyholder
- length: 30
- set ok: true
- value sent via stdin: true
- value printed: false
- reason: none

### STRIPE_LIVE_BILLING_ENABLED
- configured locally: true
- source: constant:false
- length: 5
- set ok: true
- value sent via stdin: false
- value printed: false
- reason: none

### STRIPE_LIVE_APPROVED
- configured locally: true
- source: constant:false
- length: 5
- set ok: true
- value sent via stdin: false
- value printed: false
- reason: none

## Readback After

- all billing setup ready: true
- ready_count: 2/2
- stripe_sandbox_config_ready: true
- stripe_webhook_secret_present: true
- stripe_test_secret_key_present: true
- stripe_price_present: true

## Guardrails

- The script refuses to propagate a non-test Stripe secret key.
- Values are supplied by stdin for secret-bearing variables and are not written to the report.
- `--skip-deploys` is used for every Railway variable mutation.
