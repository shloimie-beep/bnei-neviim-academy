# One Time External Setup Readiness Check

Generated: 2026-07-09T14:50:31.696Z

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Mode: full_setup
External write performed: false
Secret values printed: false
Ready items: 5/8
All external setup ready: false

## Items

### SETUP-ONETIME-RAILWAY-001 - Separate One Time Railway target

Ready: true
Clears: REQ-20260701-701
Missing: none
Warnings: Ready from guarded Railway provisioning report: ops\one-time-mishnah\onetime-railway-provisioning-report.json.

### SETUP-ONETIME-DB-001 - Separate One Time database

Ready: true
Clears: REQ-20260701-701
Missing: none
Warnings: Ready from current Railway DATABASE_URL service reference readback or ops\one-time-mishnah\onetime-railway-provisioning-report.json.

### SETUP-ONETIME-JOIN-DOMAIN-001 - Join subdomain only

Ready: true
Clears: REQ-20260701-702, REQ-20260701-703, REQ-20260701-704, REQ-20260701-717
Missing: none
Warnings: Railway custom domain and GoDaddy DNS are verified from ops\domain-readbacks\2026-07-02-join-onetimeonetime-domain-task.json.

### SETUP-ONETIME-ZOOM-001 - Zoom session details

Ready: true
Clears: REQ-20260701-708
Missing: none
Warnings: Zoom/class link is present by redacted OneTime Railway readback; raw link is not written to evidence. Zoom account/client credentials are present by safe keyholder alias.

### SETUP-ONETIME-VIMEO-001 - Vimeo / Drive / OBS media setup

Ready: true
Clears: REQ-20260701-713
Missing: none
Warnings: Vimeo client credentials, access token, and One Time Drive/drop folder are present by safe keyholder/Railway readback; private Vimeo smoke still needs a valid upload token plus test account/project confirmation.

### SETUP-ONETIME-STRIPE-001 - Rabbi Stripe sandbox

Ready: false
Clears: REQ-20260701-714
Missing: rabbi_stripe_test_secret_key_alias_or_test_key_status, 67_month_product_price_id_or_alias
Warnings: Live Stripe key appears configured; sandbox-only smoke must not use it.

### SETUP-ONETIME-WHAPI-001 - Whapi/WAPI provider details

Ready: false
Clears: not mapped
Missing: whapi_wapi_instance_id, whapi_wapi_phone_number
Warnings: none

### SETUP-ONETIME-CAMPAIGN-001 - Campaign seed / real campaign

Ready: false
Clears: REQ-20260701-709, REQ-20260701-710
Missing: final_campaign_copy, exact_recipient_segment_or_list, suppression_unsubscribe_proof, explicit_seed_packet_approval
Warnings: none

## Next Packet

Do not run deploy/live smoke yet. Clear the missing fields above first.
