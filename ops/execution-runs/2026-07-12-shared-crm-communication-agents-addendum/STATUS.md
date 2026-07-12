# Status

Current status: `active`

## Completed In This Batch

- Created run and register for the addendum.
- Ran `git fetch origin master`; HEAD and origin/master match at `7c0b8530ed733cce1a5f0fc1f40fa3b8232fec0c`.
- Verified Rabbi Telegram readiness and performed an approved live Telegram smoke before this run registration.
- Implemented `scripts/smoke-rabbi-agent-review-direct-proof.mjs`.
- Ran `npm run app:smoke:rabbi-agent-review-direct-proof`; result `direct_codex_verified`, two terminal prompt states, zero proof blockers.
- Ran `npm run production:readiness:gate -- --json --allow-dirty`; Agent Mode proof blocker is gone.

## Current Blockers

- Full production readiness still blocks on external One Time setup fields:
  `rabbi_stripe_test_secret_key_alias_or_test_key_status`,
  `67_month_product_price_id_or_alias`,
  `final_campaign_copy`,
  `exact_recipient_segment_or_list`,
  `suppression_unsubscribe_proof`,
  `explicit_seed_packet_approval`.
- Main addendum implementation is not complete; identity isolation is the first active implementation batch.

## Identity Isolation Batch

- `REQ-20260712-305` local code patch is applied and moved to `needs_verification`.
- `bna_contact_identities` now has `workspace_id`, backfill from `bna_contacts`, a dropped legacy global uniqueness constraint, and workspace-scoped uniqueness/indexes.
- Contact identity upserts now insert/conflict on `(workspace_id, identity_type, normalized_value)`.
- Signup contact dedupe, Resend inbound sender contact lookup, WAPI correction lookup, and Whapi history contact import matching now scope identity joins by workspace.
