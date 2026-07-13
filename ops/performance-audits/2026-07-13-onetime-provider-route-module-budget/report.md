# One Time Provider Route Module Budget

Status: PASS
Generated: 2026-07-13T15:42:09.723Z
Base ref: HEAD (8865df6b794ff4b0c58aceb03e770dc3e433ca01)

Local One Time provider route-module budget audit. No database, sends, payments, external accounts, or production writes.

## Size Comparison

- Base provider.html: 175940 bytes
- Current provider.html: 183536 bytes
- Provider HTML delta: 7596 bytes
- CRM route module: 10214 bytes
- Mailbox route module: 17658 bytes
- Communications route module: 2915 bytes
- Agents route module: 23784 bytes
- One Time RUM collector: 6753 bytes
- Current provider.html + CRM module delta: 17810 bytes

## Route Checks

| Route | Modules | Route scripts | CRM shell | Placeholder | Operations assets | Failed/bad/console |
|---|---|---|---:|---:|---:|---:|
| overview | none | none | false | true | false | 0/0/0 |
| crm | crm | /js/one-time-provider-crm-route.js | true | false | false | 0/0/0 |
| mailbox | mailbox | /js/one-time-provider-mailbox-route.js | false | true | false | 0/0/0 |
| communications | communications | /js/one-time-provider-communications-route.js | false | true | false | 0/0/0 |
| agents | agents | /js/one-time-provider-agents-route.js | false | true | false | 0/0/0 |

## Checks

- PASS provider_html_delta_within_agents_route_budget: 7596 bytes <= 8192 bytes for the new lazy Agents route wiring
- PASS overview_no_crm_module: {"scripts":[],"hasCrmShell":false,"hasCrmPlaceholder":true}
- PASS crm_loads_only_crm_route_module: {"modules":["crm"],"routeModuleScripts":["/js/one-time-provider-crm-route.js"],"hasCrmShell":true}
- PASS mailbox_loads_only_mailbox_route_module: {"modules":["mailbox"],"routeModuleScripts":["/js/one-time-provider-mailbox-route.js"],"hasCrmShell":false}
- PASS communications_loads_only_communications_route_module: {"modules":["communications"],"routeModuleScripts":["/js/one-time-provider-communications-route.js"],"hasCrmShell":false}
- PASS agents_loads_only_agents_route_module: {"modules":["agents"],"routeModuleScripts":["/js/one-time-provider-agents-route.js"],"hasCrmShell":false}
- PASS operations_assets_absent: [{"id":"overview","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm","hasOperationsCss":false,"hasOperationsJs":false},{"id":"mailbox","hasOperationsCss":false,"hasOperationsJs":false},{"id":"communications","hasOperationsCss":false,"hasOperationsJs":false},{"id":"agents","hasOperationsCss":false,"hasOperationsJs":false}]
- PASS no_failed_requests_or_console_errors: [{"id":"overview","failed":0,"bad":0,"console":0},{"id":"crm","failed":0,"bad":0,"console":0},{"id":"mailbox","failed":0,"bad":0,"console":0},{"id":"communications","failed":0,"bad":0,"console":0},{"id":"agents","failed":0,"bad":0,"console":0}]
- PASS route_module_budgets: {"crm_route_module_bytes":10214,"mailbox_route_module_bytes":17658,"communications_route_module_bytes":2915,"agents_route_module_bytes":23784,"rum_collector_bytes":6753,"crm_route_total_delta_bytes":17810}

No sends, provider mutations, CRM writes, payments, access grants, or production data mutations were performed.
