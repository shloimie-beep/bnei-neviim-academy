# Assistant Runtime Audit
Generated: 2026-06-24T06:12:11.875Z
Release candidate SHA: 2a93ac9432345e8f3b381dcc1ed1caec2699cee0
Guardrail: this audit used a local no-DB Express server and static source inspection by default. It did not use external credentials, read production state, mutate a production database, deploy, send email or Telegram messages, publish, upload, charge, alter DNS, or request secret values.
## Summary
- Static shared-assistant contract: PASS
- No-DB public assistant context endpoint: PASS
- No-DB assistant history blocker observed: PASS
- Optional local DB E2E: not run - local/test DB not provided
## Static Contract Checks
| Check | Result | Evidence |
| --- | --- | --- |
| widget_uses_canonical_chat_endpoint | PASS | /api/bna/assistant/chat |
| widget_loads_shared_threads | PASS | /api/bna/assistant/threads |
| widget_keeps_surface_scoped_thread_state | PASS | storagePrefix + threadId |
| widget_exposes_single_global_assistant | PASS | window.BNAAssistant |
| widget_has_no_provider_key_logic | PASS | browser widget contains no hosted provider calls or keys |
| server_exposes_chat_route | PASS | app.post('/api/bna/assistant/chat') |
| server_exposes_universal_message_route | PASS | app.post('/api/bna/assistant/message') |
| server_exposes_context_and_history_routes | PASS | context + threads routes |
| no_db_mode_is_explicit_blocker | PASS | explicit no-DB error |
## Local No-DB Runtime
- Context status: 200
- Context actor: anonymous
- Threads status: 500
- Expected blocker: Database-backed assistant history/chat endpoints require a database; no production DB was read or mutated in this audit.
## Optional Local DB E2E
- Result: blocked_missing_nonproduction_database
- Blocker: Set BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL to a local/test Postgres URL to run a true assistant chat/message persistence smoke. The script intentionally ignores production DATABASE_URL and .secrets.
## Verdict
Credential-free assistant runtime audit passed for source contracts and no-DB readiness. True chat/message persistence remains blocked unless a local/test database is supplied; live hosted-AI and production runtime proof remain external/approval gated.