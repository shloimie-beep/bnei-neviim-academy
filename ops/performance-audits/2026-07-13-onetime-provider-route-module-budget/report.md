# One Time Provider Route Module Budget

Status: PASS
Generated: 2026-07-13T06:28:10.846Z
Base ref: HEAD (24abcd235455ebb3a3f25a88c8dffba0a57474e6)

Local One Time provider route-module budget audit. No database, sends, payments, external accounts, or production writes.

## Size Comparison

- Base provider.html: 186972 bytes
- Current provider.html: 186167 bytes
- Provider HTML delta: -805 bytes
- CRM route module: 10041 bytes
- Current provider.html + CRM module delta: 9236 bytes

## Route Checks

| Route | Modules | Route scripts | CRM shell | Placeholder | Operations assets | Failed/bad/console |
|---|---|---|---:|---:|---:|---:|
| overview | none | none | false | true | false | 0/0/0 |
| crm | crm | /js/one-time-provider-crm-route.js | true | false | false | 0/0/0 |
| mailbox | mailbox | /js/one-time-provider-mailbox-route.js | false | true | false | 0/0/0 |

## Checks

- PASS provider_html_shrunk: -805 bytes
- PASS overview_no_crm_module: {"scripts":[],"hasCrmShell":false,"hasCrmPlaceholder":true}
- PASS crm_loads_only_crm_route_module: {"modules":["crm"],"routeModuleScripts":["/js/one-time-provider-crm-route.js"],"hasCrmShell":true}
- PASS mailbox_loads_only_mailbox_stub: {"modules":["mailbox"],"routeModuleScripts":["/js/one-time-provider-mailbox-route.js"],"hasCrmShell":false}
- PASS operations_assets_absent: [{"id":"overview","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm","hasOperationsCss":false,"hasOperationsJs":false},{"id":"mailbox","hasOperationsCss":false,"hasOperationsJs":false}]
- PASS no_failed_requests_or_console_errors: [{"id":"overview","failed":0,"bad":0,"console":0},{"id":"crm","failed":0,"bad":0,"console":0},{"id":"mailbox","failed":0,"bad":0,"console":0}]
- PASS crm_route_module_budget: {"crm_route_module_bytes":10041,"crm_route_total_delta_bytes":9236}

No sends, provider mutations, CRM writes, payments, access grants, or production data mutations were performed.
