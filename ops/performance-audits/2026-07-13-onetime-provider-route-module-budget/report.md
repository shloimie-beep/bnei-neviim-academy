# One Time Provider Route Module Budget

Status: PASS
Generated: 2026-07-13T12:40:08.817Z
Base ref: HEAD (86fa1bd66bf2ed8fe74bf9477006a88bec0e5b08)

Local One Time provider route-module budget audit. No database, sends, payments, external accounts, or production writes.

## Size Comparison

- Base provider.html: 175940 bytes
- Current provider.html: 183807 bytes
- Provider HTML delta: 7867 bytes
- CRM route module: 10214 bytes
- Mailbox route module: 17658 bytes
- Communications route module: 2915 bytes
- Billing route module: 13270 bytes
- One Time RUM collector: 6753 bytes
- Current provider.html + CRM module delta: 18081 bytes

## Route Checks

| Route | Modules | Route scripts | CRM shell | Placeholder | Operations assets | Failed/bad/console |
|---|---|---|---:|---:|---:|---:|
| overview | none | none | false | true | false | 0/0/0 |
| crm | crm | /js/one-time-provider-crm-route.js | true | false | false | 0/0/0 |
| mailbox | mailbox | /js/one-time-provider-mailbox-route.js | false | true | false | 0/0/0 |
| communications | communications | /js/one-time-provider-communications-route.js | false | true | false | 0/0/0 |
| billing | billing | /js/one-time-provider-billing-route.js | false | true | false | 0/0/0 |

## Checks

- PASS provider_html_delta_within_route_hook_budget: 7867 bytes <= 8192 bytes
- PASS overview_no_crm_module: {"scripts":[],"hasCrmShell":false,"hasCrmPlaceholder":true}
- PASS crm_loads_only_crm_route_module: {"modules":["crm"],"routeModuleScripts":["/js/one-time-provider-crm-route.js"],"hasCrmShell":true}
- PASS mailbox_loads_only_mailbox_route_module: {"modules":["mailbox"],"routeModuleScripts":["/js/one-time-provider-mailbox-route.js"],"hasCrmShell":false}
- PASS communications_loads_only_communications_route_module: {"modules":["communications"],"routeModuleScripts":["/js/one-time-provider-communications-route.js"],"hasCrmShell":false}
- PASS billing_loads_only_billing_route_module: {"modules":["billing"],"routeModuleScripts":["/js/one-time-provider-billing-route.js"],"hasBillingShell":true,"hasCrmShell":false}
- PASS operations_assets_absent: [{"id":"overview","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm","hasOperationsCss":false,"hasOperationsJs":false},{"id":"mailbox","hasOperationsCss":false,"hasOperationsJs":false},{"id":"communications","hasOperationsCss":false,"hasOperationsJs":false},{"id":"billing","hasOperationsCss":false,"hasOperationsJs":false}]
- PASS no_failed_requests_or_console_errors: [{"id":"overview","failed":0,"bad":0,"console":0},{"id":"crm","failed":0,"bad":0,"console":0},{"id":"mailbox","failed":0,"bad":0,"console":0},{"id":"communications","failed":0,"bad":0,"console":0},{"id":"billing","failed":0,"bad":0,"console":0}]
- PASS route_module_budgets: {"crm_route_module_bytes":10214,"mailbox_route_module_bytes":17658,"communications_route_module_bytes":2915,"billing_route_module_bytes":13270,"rum_collector_bytes":6753,"crm_route_total_delta_bytes":18081}

No sends, provider mutations, CRM writes, payments, access grants, or production data mutations were performed.
