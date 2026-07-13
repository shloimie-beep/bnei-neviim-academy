# One Time Performance Regression Gates

Generated: 2026-07-13T08:01:18.958Z
Requirement: REQ-20260713-911
Status: PASSED

Local One Time performance instrumentation and regression-gate audit. No database, live HTTP, sends, payments, external accounts, or production writes.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| `server_timing_headers` | PASS | Server emits trace/deploy/response-size timing headers. |
| `db_pool_timing_wrapped` | PASS | Pool query/connect and client query paths record db/pool timing. |
| `rum_endpoint_registered` | PASS | Privacy-safe browser RUM endpoint and table are registered. |
| `rum_route_path_sanitized_server` | PASS | Server sanitizes route paths before storing RUM. |
| `rum_client_entrypoints` | PASS | One Time landing, provider shell, Operations source, and generated bootstrap load the RUM client. |
| `rum_client_privacy_contract` | PASS | RUM client redacts route details and avoids cookies/localStorage/DOM text capture. |
| `rum_client_route_transition` | PASS | RUM client records SPA route transitions as a separate metric. |
| `budget_rum_bytes` | PASS | 6303 <= 7000 bytes |
| `budget_provider_html_bytes` | PASS | 178961 <= 190000 bytes |
| `budget_operations_shell_bytes` | PASS | 1153652 <= 1200000 bytes |
| `budget_operations_bootstrap_bytes` | PASS | 2529 <= 5000 bytes |
| `budget_crm_route_module_bytes` | PASS | 10041 <= 12000 bytes |
| `budget_mailbox_route_module_bytes` | PASS | 17307 <= 20000 bytes |
| `budget_communications_route_module_bytes` | PASS | 2845 <= 5000 bytes |

## Budgets

| Budget | Actual | Max |
| --- | ---: | ---: |
| `rum_bytes` | 6303 | 7000 |
| `provider_html_bytes` | 178961 | 190000 |
| `operations_shell_bytes` | 1153652 | 1200000 |
| `operations_bootstrap_bytes` | 2529 | 5000 |
| `crm_route_module_bytes` | 10041 | 12000 |
| `mailbox_route_module_bytes` | 17307 | 20000 |
| `communications_route_module_bytes` | 2845 | 5000 |

## Guardrails

- No browser screenshots, contact data, raw message bodies, owner destinations, cookies, tokens, sends, payments, provider mutations, Railway mutations, or production data writes are performed by this audit.
- RUM payload checks are marker and size checks only; live storage proof is handled by deployment smoke/readback.
