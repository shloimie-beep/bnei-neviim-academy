# REQ-20260618-111 cleanup dry run

- Seed key: `req022_safe_repeatable_seed_v1`
- Prefix: `TEST_REQ022`
- Run ID: `20260618_local`
- Dry run: `true`
- Cleanup mode: `true`
- External writes: `false`
- Secrets printed: `false`
- Cleanup selector: `TEST_REQ022` prefix plus `req022_seed_key` metadata.

## Coverage

- school_workspace
- service_provider_workspace
- family_workspace
- workspace_roles
- students
- assignments
- tasks
- decisions
- calendar
- content_research
- community
- automations
- hebrew_portal_fixture
- helper_action_audit
- cleanup_path

## Apply Guard

- Seed apply requires `APPLY_REQ022_TEST_SEED`.
- Cleanup apply requires `CLEANUP_REQ022_TEST_SEED`.
- Without the phrase, this script only writes/prints SQL and does not connect to Postgres.
