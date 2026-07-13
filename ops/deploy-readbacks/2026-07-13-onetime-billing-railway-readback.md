# One Time Billing Railway Readback

Generated: 2026-07-13T13:21:55.040Z

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Mode: billing_only
External write performed: false
Provider mutation performed: false
Live payment performed: false
Secret values printed: false

## Railway Target

- ready: true
- service: one-time-web
- environment: production
- source: railway_token_or_env
- key_count: 79
- one_time_public_domain_matches: true
- default_workspace_matches: true
- default_project_matches: true

## Stripe Billing

- ready: true
- secret_key_present: true
- secret_key_mode: test
- test_secret_key_present: true
- live_key_present: false
- webhook_secret_present: true
- price_reference_present: true
- publishable_key_present: false
- mode_present: true
- mode_live_requested: false
- sandbox_config_ready: true

## Missing Fields

- none

## Guardrails

- No live charge, refund, notice send, invoice/receipt send, access mutation, provider mutation, credential mutation, or production data mutation is performed by this readback.
- No Stripe or Railway secret values are written to this report.
