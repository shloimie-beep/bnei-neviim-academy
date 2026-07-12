# Status

Current status: `active`

## Completed In This Batch

- Created run and register for the addendum.
- Ran `git fetch origin master`; HEAD and origin/master match at `7c0b8530ed733cce1a5f0fc1f40fa3b8232fec0c`.
- Verified Rabbi Telegram readiness and performed an approved live Telegram smoke before this run registration.
- Implemented `scripts/smoke-rabbi-agent-review-direct-proof.mjs`.
- Ran `npm run app:smoke:rabbi-agent-review-direct-proof`; result `direct_codex_verified`, two terminal prompt states, zero proof blockers.
- Ran `npm run production:readiness:gate -- --json --allow-dirty`; Agent Mode proof blocker is gone.
- Committed and pushed `966ded41b517433533f24370949426cfd1200213` to `origin/master`.
- Deployed `966ded41b517433533f24370949426cfd1200213` to BNA production and verified live `/api/deploy-info`.
- Deployed `966ded41b517433533f24370949426cfd1200213` to One Time production and verified live `/api/deploy-info`.
- Redeployed current `master` tip `7fee7ca15874e1964da8d59671322130fe9ed2e0` to both BNA and One Time and verified both live `/api/deploy-info` endpoints.
- Ran One Time separate-instance live smoke at the deployed SHA.
- Verified the One Time Mishnah signup form bug path directly: Family and School button clicks set the hidden form value and submit the correct no-write intercepted payload; API dry-run normalizes both choices correctly.
- Ran `npm run app:smoke:crm-identity-isolation -- --allow-transactional-live-proof --write-report`; same synthetic email and phone coexist across BNA and One Time workspaces, workspace-filtered lookups isolate each workspace, same-workspace duplicate is blocked, and rollback leaves zero synthetic rows.

## Current Blockers

- Full production readiness still blocks on external One Time setup fields:
  `rabbi_stripe_test_secret_key_alias_or_test_key_status`,
  `67_month_product_price_id_or_alias`,
  `final_campaign_copy`,
  `exact_recipient_segment_or_list`,
  `suppression_unsubscribe_proof`,
  `explicit_seed_packet_approval`.
- Main addendum implementation is not complete; identity isolation is the first active implementation batch.
- `REQ-20260712-305` is complete. Continue `REQ-20260712-306` next.

## Shared CRM Product Slice

- `REQ-20260712-302` is now in progress with a bounded shared-module slice locally verified.
- Added canonical CRM contact service wiring for list/timeline DTO envelopes.
- Added shared browser CRM modules under `public/js/crm/` and core CRM styling under `public/css/crm-core.css`.
- Operations now loads the shared CRM modules before the shell and marks the contacts index, contact workspace, and inspector with shared CRM component attributes.
- Replaced internal/dead-end CRM copy in this slice with customer-facing empty states and concise disabled-channel tooltips.
- Registered the scoped email navigation, WhatsApp no-send link, and disabled Create Task placeholder actions.
- Local verification passed: syntax checks, focused CRM/isolation tests `31/31`, generated-shell check, PQC validation, secret audit, action watchdog, protocol drift watchdog, execution-run validation, and whitespace diff check.
- First deployment of `1bbe74691eac18c83808f27cd9c9dfa949b1aa7a` exposed a live adapter mismatch in the CRM contacts API (`db.query is not a function`), caught by the One Time Operations CRM workbench smoke.
- Hotfix `bf0ec619b5ed10b2c057d5cf4f1553362d6614f4` wraps `operationsCrmContactRows(scope, pool, filters)` correctly and updates the CRM workbench smoke expectations for the customer-facing review copy.
- BNA and One Time are deployed at `bf0ec619b5ed10b2c057d5cf4f1553362d6614f4`; post-deploy Railway doctors passed.
- One Time Operations CRM workbench live smoke passed with 12 scoped cards and selected timeline read-only. The full `REQ-20260712-302` remains in progress because dedicated workspace/actions and deeper parity are still open.
- Follow-up URL-state slice is locally verified and pending deploy: selected CRM contact and CRM filters/search/sort/list-scroll now sync into `crm_contact`, `crm_search`, `crm_type`, `crm_status`, `crm_source`, `crm_tag`, `crm_sort`, and `crm_scroll` URL params.
- Verification for URL-state slice passed: generated-shell check, focused CRM/isolation tests `32/32`, local Playwright CRM workbench smoke across split shell and monolith, action watchdog, protocol drift watchdog, secret audit, execution-run validation, and whitespace diff check.
- URL-state slice is deployed at `f818822bb3969dca5d27f7c5a70d4dbf0baa8744`; BNA and One Time deploy-info match, post-deploy Railway doctors passed, One Time separate-instance smoke passed, and One Time Operations CRM workbench live smoke passed with 12 scoped cards and selected timeline read-only.

## Identity Isolation Batch

- `REQ-20260712-305` local code patch is applied and moved to `needs_verification`.
- `bna_contact_identities` now has `workspace_id`, backfill from `bna_contacts`, a dropped legacy global uniqueness constraint, and workspace-scoped uniqueness/indexes.
- Contact identity upserts now insert/conflict on `(workspace_id, identity_type, normalized_value)`.
- Signup contact dedupe, Resend inbound sender contact lookup, WAPI correction lookup, and Whapi history contact import matching now scope identity joins by workspace.
- The identity patch is deployed to both BNA and One Time. Current live `master` SHA is `7fee7ca15874e1964da8d59671322130fe9ed2e0`.
- Live database proof report: `ops/live-smokes/2026-07-12T20-48-11-384Z-crm-identity-isolation-live-smoke.md`.
