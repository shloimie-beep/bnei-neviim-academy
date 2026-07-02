# One Time External Setup Readiness Check

Generated: 2026-07-02T12:19:47.519Z

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Mode: full_setup
External write performed: false
Secret values printed: false
Ready items: 0/8
All external setup ready: false

## Items

### SETUP-ONETIME-RAILWAY-001 - Separate One Time Railway target

Ready: false
Clears: REQ-20260701-701
Missing: railway_project_service_environment_label, PUBLIC_SITE_MODE, DEFAULT_WORKSPACE_KEY, DEFAULT_PROJECT_KEY, ONE_TIME_PUBLIC_DOMAIN
Warnings: Missing explicit One Time Railway target. PUBLIC_SITE_MODE missing or mismatch; expected one_time. DEFAULT_WORKSPACE_KEY missing or mismatch; expected rabbi_sheller_provider. DEFAULT_PROJECT_KEY missing or mismatch; expected one_time_mishnah_class. ONE_TIME_PUBLIC_DOMAIN missing or mismatch; expected join.onetimeonetime.com.

### SETUP-ONETIME-DB-001 - Separate One Time database

Ready: false
Clears: REQ-20260701-701
Missing: ONE_TIME_DATABASE_URL_or_DATABASE_URL_ONE_TIME_keyholder_alias
Warnings: none

### SETUP-ONETIME-JOIN-DOMAIN-001 - Join subdomain only

Ready: false
Clears: REQ-20260701-702, REQ-20260701-703, REQ-20260701-704, REQ-20260701-717
Missing: ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com, ONE_TIME_JOIN_DOMAIN_ATTACHED, ONE_TIME_JOIN_DNS_CONFIGURED, ONE_TIME_APEX_ROOT_UNTOUCHED
Warnings: none

### SETUP-ONETIME-ZOOM-001 - Zoom session details

Ready: false
Clears: REQ-20260701-708
Missing: ONE_TIME_ZOOM_SESSION_ALIAS_or_private_keyholder_path
Warnings: none

### SETUP-ONETIME-VIMEO-001 - Vimeo / Drive / OBS media setup

Ready: false
Clears: REQ-20260701-713
Missing: VIMEO_ACCESS_TOKEN_alias_or_keyholder_path, ONE_TIME_DRIVE_DROP_FOLDER_ALIAS
Warnings: none

### SETUP-ONETIME-STRIPE-001 - Rabbi Stripe sandbox

Ready: false
Clears: REQ-20260701-714
Missing: rabbi_stripe_test_secret_key_alias_or_test_key_status, 67_month_product_price_id_or_alias
Warnings: none

### SETUP-ONETIME-WHAPI-001 - Whapi/WAPI provider details

Ready: false
Clears: not mapped
Missing: whapi_wapi_token_alias, whapi_wapi_instance_id, whapi_wapi_phone_number
Warnings: none

### SETUP-ONETIME-CAMPAIGN-001 - Campaign seed / real campaign

Ready: false
Clears: REQ-20260701-709, REQ-20260701-710
Missing: join_domain_live_first, final_campaign_copy, exact_recipient_segment_or_list, suppression_unsubscribe_proof, explicit_seed_packet_approval
Warnings: none

## Next Packet

Do not run deploy/live smoke yet. Clear the missing fields above first.
