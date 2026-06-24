# Assistant Runtime Audit
Generated: 2026-06-24T14:38:24.744Z
Release candidate SHA: 06fd00703a1be4558f1a37e211e6b500fb525532
Guardrail: this audit used a local no-DB Express server and static source inspection by default. It did not use external credentials, read production state, mutate a production database, deploy, send email or Telegram messages, publish, upload, charge, alter DNS, or request secret values.
## Summary
- Static shared-assistant contract: PASS
- No-DB public assistant context endpoint: PASS
- No-DB assistant history blocker observed: PASS
- Optional local DB E2E: not run - local/test DB not provided
- Runtime surface checks: 105/126 pass, 21 blocked, 0 fail
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
## Surface Matrix
| Surface | Check | Status | Evidence |
| --- | --- | --- | --- |
| Public website helper | widget_entry_renders | PASS | public/index.html |
| Public website helper | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| Public website helper | identity_resolved | PASS | anon-owner-review |
| Public website helper | workspace_resolved | PASS | bna |
| Public website helper | role_resolved | PASS | parent |
| Public website helper | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| Public website helper | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| Public website helper | model_provider_readiness | PASS | openai:missing, kimi:missing |
| Public website helper | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| Public website helper | action_plan_constrained_to_registry | PASS | create_ticket |
| Public website helper | permission_check | PASS | allowed |
| Public website helper | preview | PASS | preview_required=true |
| Public website helper | approval_gate | PASS | approval_required=false |
| Public website helper | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| Public website helper | audit_event | PASS | canonical action runner audit-log contract is available |
| Public website helper | response_render | PASS | widget/helper render functions |
| Public website helper | error_retry | PASS | visible error state contracts |
| Public website helper | usage_record | PASS | usage_1347984bb13078e830f8713a2a67bfeb; no prompt body; persistence table bna |
| Operations helper | widget_entry_renders | PASS | public/operations.html |
| Operations helper | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| Operations helper | identity_resolved | PASS | ops-owner-review |
| Operations helper | workspace_resolved | PASS | bna |
| Operations helper | role_resolved | PASS | super_admin |
| Operations helper | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| Operations helper | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| Operations helper | model_provider_readiness | PASS | openai:missing, kimi:missing |
| Operations helper | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| Operations helper | action_plan_constrained_to_registry | PASS | route_bug_to_codex |
| Operations helper | permission_check | PASS | allowed |
| Operations helper | preview | PASS | preview_required=true |
| Operations helper | approval_gate | PASS | approval_required=true |
| Operations helper | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| Operations helper | audit_event | PASS | canonical action runner audit-log contract is available |
| Operations helper | response_render | PASS | widget/helper render functions |
| Operations helper | error_retry | PASS | visible error state contracts |
| Operations helper | usage_record | PASS | usage_ce48160e84855f153455758ecb383923; no prompt body; persistence table bna |
| Provider portal assistant | widget_entry_renders | PASS | public/provider.html |
| Provider portal assistant | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| Provider portal assistant | identity_resolved | PASS | provider-owner-review |
| Provider portal assistant | workspace_resolved | PASS | rabbi_sheller_provider |
| Provider portal assistant | role_resolved | PASS | service_provider_admin |
| Provider portal assistant | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| Provider portal assistant | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| Provider portal assistant | model_provider_readiness | PASS | openai:missing, kimi:missing |
| Provider portal assistant | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| Provider portal assistant | action_plan_constrained_to_registry | PASS | No typed action matched confidently. |
| Provider portal assistant | permission_check | PASS | allowed |
| Provider portal assistant | preview | PASS | no typed action selected |
| Provider portal assistant | approval_gate | PASS | no typed action selected |
| Provider portal assistant | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| Provider portal assistant | audit_event | PASS | canonical action runner audit-log contract is available |
| Provider portal assistant | response_render | PASS | widget/helper render functions |
| Provider portal assistant | error_retry | PASS | visible error state contracts |
| Provider portal assistant | usage_record | PASS | usage_5725cf0515faf55a1f45c599b4d5da2e; no prompt body; persistence table rabbi_sheller_provider |
| Parent portal assistant | widget_entry_renders | PASS | public/parent.html |
| Parent portal assistant | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| Parent portal assistant | identity_resolved | PASS | parent-owner-review |
| Parent portal assistant | workspace_resolved | PASS | bna |
| Parent portal assistant | role_resolved | PASS | parent |
| Parent portal assistant | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| Parent portal assistant | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| Parent portal assistant | model_provider_readiness | PASS | openai:missing, kimi:missing |
| Parent portal assistant | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| Parent portal assistant | action_plan_constrained_to_registry | PASS | create_report_problem_ticket |
| Parent portal assistant | permission_check | PASS | allowed |
| Parent portal assistant | preview | PASS | preview_required=true |
| Parent portal assistant | approval_gate | PASS | approval_required=false |
| Parent portal assistant | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| Parent portal assistant | audit_event | PASS | canonical action runner audit-log contract is available |
| Parent portal assistant | response_render | PASS | widget/helper render functions |
| Parent portal assistant | error_retry | PASS | visible error state contracts |
| Parent portal assistant | usage_record | PASS | usage_534b5143a5dbcd6a4809687e812deb07; no prompt body; persistence table bna |
| Student portal assistant | widget_entry_renders | PASS | public/student.html |
| Student portal assistant | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| Student portal assistant | identity_resolved | PASS | student-owner-review |
| Student portal assistant | workspace_resolved | PASS | bna |
| Student portal assistant | role_resolved | PASS | student |
| Student portal assistant | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| Student portal assistant | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| Student portal assistant | model_provider_readiness | PASS | openai:missing, kimi:missing |
| Student portal assistant | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| Student portal assistant | action_plan_constrained_to_registry | PASS | No typed action matched confidently. |
| Student portal assistant | permission_check | PASS | allowed |
| Student portal assistant | preview | PASS | no typed action selected |
| Student portal assistant | approval_gate | PASS | no typed action selected |
| Student portal assistant | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| Student portal assistant | audit_event | PASS | canonical action runner audit-log contract is available |
| Student portal assistant | response_render | PASS | widget/helper render functions |
| Student portal assistant | error_retry | PASS | visible error state contracts |
| Student portal assistant | usage_record | PASS | usage_774e828a54e6450d66859b58e83da046; no prompt body; persistence table bna |
| One Time/member assistant | widget_entry_renders | PASS | public/rabbi-member.html, public/member-library.html, public/one-time-classroom.html |
| One Time/member assistant | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| One Time/member assistant | identity_resolved | PASS | one-time-member-review |
| One Time/member assistant | workspace_resolved | PASS | rabbi_sheller_provider |
| One Time/member assistant | role_resolved | PASS | service_provider_admin |
| One Time/member assistant | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| One Time/member assistant | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| One Time/member assistant | model_provider_readiness | PASS | openai:missing, kimi:missing |
| One Time/member assistant | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| One Time/member assistant | action_plan_constrained_to_registry | PASS | No typed action matched confidently. |
| One Time/member assistant | permission_check | PASS | allowed |
| One Time/member assistant | preview | PASS | no typed action selected |
| One Time/member assistant | approval_gate | PASS | no typed action selected |
| One Time/member assistant | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| One Time/member assistant | audit_event | PASS | canonical action runner audit-log contract is available |
| One Time/member assistant | response_render | PASS | widget/helper render functions |
| One Time/member assistant | error_retry | PASS | visible error state contracts |
| One Time/member assistant | usage_record | PASS | usage_a0aa79d01df3b3ada60855417703be85; no prompt body; persistence table rabbi_sheller_provider |
| Telegram adapter where configured | widget_entry_renders | PASS | scripts/telegram-kimi-bridge.mjs |
| Telegram adapter where configured | endpoint_reachable | PASS | /api/bna/assistant/chat static route |
| Telegram adapter where configured | identity_resolved | PASS | telegram-owner-review |
| Telegram adapter where configured | workspace_resolved | PASS | bna |
| Telegram adapter where configured | role_resolved | PASS | super_admin |
| Telegram adapter where configured | conversation_created_resumed | BLOCKED | blocked_missing_nonproduction_database |
| Telegram adapter where configured | message_persisted | BLOCKED | blocked_missing_nonproduction_database |
| Telegram adapter where configured | model_provider_readiness | PASS | openai:missing, kimi:missing |
| Telegram adapter where configured | model_call | BLOCKED | openai:missing_model_credential. No configured model credential is available for this environment.; kimi:missing_model_credential. No configured model credential is available for this environment. |
| Telegram adapter where configured | action_plan_constrained_to_registry | PASS | queue_telegram_report |
| Telegram adapter where configured | permission_check | PASS | allowed |
| Telegram adapter where configured | preview | PASS | preview_required=true |
| Telegram adapter where configured | approval_gate | PASS | approval_required=true |
| Telegram adapter where configured | safe_execution | PASS | dry-run/no-send proof only; no real messages sent |
| Telegram adapter where configured | audit_event | PASS | canonical action runner audit-log contract is available |
| Telegram adapter where configured | response_render | PASS | widget/helper render functions |
| Telegram adapter where configured | error_retry | PASS | visible error state contracts |
| Telegram adapter where configured | usage_record | PASS | usage_7622018cdb7f7685efc52c391cbf113f; no prompt body; persistence table bna |
## Verdict
Credential-free assistant runtime audit passed for source contracts and no-DB readiness. True chat/message persistence remains blocked unless a local/test database is supplied; live hosted-AI and production runtime proof remain external/approval gated.