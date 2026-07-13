# One Time Performance Regression Gates

Generated: 2026-07-13T19:42:00.629Z
Requirement: REQ-20260713-911
Status: PASSED

Local and production One Time performance instrumentation, budget, Server-Timing, trace-header, route RUM, and scoped CRM readback gate.

## Local Checks

| Check | Status | Detail |
| --- | --- | --- |
| `server_timing_headers` | PASS | Server emits trace/deploy/response-size timing headers. |
| `db_pool_timing_wrapped` | PASS | Pool query/connect and client query paths record db/pool timing. |
| `rum_endpoint_registered` | PASS | Privacy-safe browser RUM endpoint and table are registered. |
| `rum_route_path_sanitized_server` | PASS | Server sanitizes route paths before storing RUM. |
| `rum_client_entrypoints` | PASS | One Time landing, provider shell, Operations source, and generated bootstrap load the RUM client. |
| `rum_client_privacy_contract` | PASS | RUM client redacts route details and avoids cookies/localStorage/DOM text capture. |
| `rum_client_route_transition` | PASS | RUM client records SPA route transitions as a separate metric. |
| `budget_rum_bytes` | PASS | 6753 <= 7000 bytes |
| `budget_provider_html_bytes` | PASS | 183536 <= 190000 bytes |
| `budget_operations_shell_bytes` | PASS | 1189198 <= 1200000 bytes |
| `budget_operations_bootstrap_bytes` | PASS | 2578 <= 5000 bytes |
| `budget_crm_route_module_bytes` | PASS | 10214 <= 12000 bytes |
| `budget_mailbox_route_module_bytes` | PASS | 17658 <= 20000 bytes |
| `budget_communications_route_module_bytes` | PASS | 2915 <= 5000 bytes |

## Budgets

| Budget | Actual | Max |
| --- | ---: | ---: |
| `rum_bytes` | 6753 | 7000 |
| `provider_html_bytes` | 183536 | 190000 |
| `operations_shell_bytes` | 1189198 | 1200000 |
| `operations_bootstrap_bytes` | 2578 | 5000 |
| `crm_route_module_bytes` | 10214 | 12000 |
| `mailbox_route_module_bytes` | 17658 | 20000 |
| `communications_route_module_bytes` | 2915 | 5000 |

## Live Checks

Base URL: https://join.onetimeonetime.com
Expected SHA: 20307e2638988b6fe5d10b8a649d87ed8a8522cb
Observed SHA: 20307e2638988b6fe5d10b8a649d87ed8a8522cb

| Check | Status | Detail |
| --- | --- | --- |
| `live_deploy_info_headers` | PASS | 553ms |
| `live_health_db_pool_timing` | PASS | 496ms |
| `live_one_time_shell_rum_loaded` | PASS | 562ms |
| `live_rum_dry_run_contract` | PASS | 238ms |
| `live_scoped_operations_crm_headers` | PASS | 3190ms |

## Guardrails

- Local checks do not read contact data, raw message bodies, owner destinations, cookies, tokens, sends, payments, provider mutations, Railway mutations, or production data.
- Live checks are read-only except for an explicit RUM dry run, which returns `external_write_performed=false` and does not store an event.
- Operations readback records counts and workspace guard flags only.
