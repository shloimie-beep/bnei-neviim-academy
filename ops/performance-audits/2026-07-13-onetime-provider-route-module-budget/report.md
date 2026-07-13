# One Time Provider Route Module Budget

Status: PASS
Generated: 2026-07-13T08:01:27.757Z
Base ref: HEAD (801cf99e5eca5064eecd649b2491d695e953141e)

Local One Time provider route-module budget audit. No database, sends, payments, external accounts, or production writes.

## Size Comparison

- Base provider.html: 175874 bytes
- Current provider.html: 178961 bytes
- Provider HTML delta: 3087 bytes
- CRM route module: 10041 bytes
- Mailbox route module: 17307 bytes
- Communications route module: 2845 bytes
- One Time RUM collector: 6303 bytes
- Current provider.html + CRM module delta: 13128 bytes

## Route Checks

| Route | Modules | Route scripts | CRM shell | Placeholder | Operations assets | Failed/bad/console |
|---|---|---|---:|---:|---:|---:|
| overview | none | none | false | true | false | 0/0/0 |
| crm | crm | /js/one-time-provider-crm-route.js | true | false | false | 0/0/0 |
| mailbox | mailbox | /js/one-time-provider-mailbox-route.js | false | true | false | 0/0/0 |
| communications | communications | /js/one-time-provider-communications-route.js | false | true | false | 0/0/0 |

## Checks

- PASS provider_html_delta_within_instrumentation_budget: 3087 bytes <= 4096 bytes
- PASS overview_no_crm_module: {"scripts":[],"hasCrmShell":false,"hasCrmPlaceholder":true}
- PASS crm_loads_only_crm_route_module: {"modules":["crm"],"routeModuleScripts":["/js/one-time-provider-crm-route.js"],"hasCrmShell":true}
- PASS mailbox_loads_only_mailbox_route_module: {"modules":["mailbox"],"routeModuleScripts":["/js/one-time-provider-mailbox-route.js"],"hasCrmShell":false}
- PASS communications_loads_only_communications_route_module: {"modules":["communications"],"routeModuleScripts":["/js/one-time-provider-communications-route.js"],"hasCrmShell":false}
- PASS operations_assets_absent: [{"id":"overview","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm","hasOperationsCss":false,"hasOperationsJs":false},{"id":"mailbox","hasOperationsCss":false,"hasOperationsJs":false},{"id":"communications","hasOperationsCss":false,"hasOperationsJs":false}]
- PASS no_failed_requests_or_console_errors: [{"id":"overview","failed":0,"bad":0,"console":0},{"id":"crm","failed":0,"bad":0,"console":0},{"id":"mailbox","failed":0,"bad":0,"console":0},{"id":"communications","failed":0,"bad":0,"console":0}]
- PASS route_module_budgets: {"crm_route_module_bytes":10041,"mailbox_route_module_bytes":17307,"communications_route_module_bytes":2845,"rum_collector_bytes":6303,"crm_route_total_delta_bytes":13128}

No sends, provider mutations, CRM writes, payments, access grants, or production data mutations were performed.
