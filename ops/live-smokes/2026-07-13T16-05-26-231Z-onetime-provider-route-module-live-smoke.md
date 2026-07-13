# One Time Provider Route Module Live Smoke

Status: PASS
Generated: 2026-07-13T16:05:26.231Z
Base URL: https://join.onetimeonetime.com
Expected SHA: dab8c6d8ce23e0a2cda4d619d302ed32c6bac415
Deployed SHA: dab8c6d8ce23e0a2cda4d619d302ed32c6bac415
Target app: one-time

Live One Time provider route-module smoke. Read-only/review routes only; no form submission, email, WhatsApp, CRM write, payment, access grant, provider mutation, or production data write.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| `deploy_info_ok` | PASS | {"status":200,"deploy_status":"ok","target_app":"one-time","commit_sha":"dab8c6d8ce23e0a2cda4d619d302ed32c6bac415"} |
| `deploy_info_exact_sha` | PASS | {"expected_sha":"dab8c6d8ce23e0a2cda4d619d302ed32c6bac415","actual_sha":"dab8c6d8ce23e0a2cda4d619d302ed32c6bac415"} |
| `deploy_info_one_time_target` | PASS | {"target_app":"one-time"} |
| `overview_no_route_module` | PASS | {"modules":[],"routeModuleScripts":[],"hasCrmShell":false,"hasCrmPlaceholder":true} |
| `crm_loads_only_crm_route_module` | PASS | {"modules":["crm"],"routeModuleScripts":["/js/one-time-provider-crm-route.js"],"hasCrmShell":true,"crmLoaded":true,"mailboxLoaded":false,"communicationsLoaded":false} |
| `mailbox_loads_only_mailbox_route_module` | PASS | {"modules":["mailbox"],"routeModuleScripts":["/js/one-time-provider-mailbox-route.js"],"hasCrmShell":false,"crmLoaded":false,"mailboxLoaded":true} |
| `communications_loads_only_communications_route_module` | PASS | {"modules":["communications"],"routeModuleScripts":["/js/one-time-provider-communications-route.js"],"hasCrmShell":false,"crmLoaded":false,"mailboxLoaded":false,"communicationsLoaded":true} |
| `agents_loads_only_agents_route_module` | PASS | {"modules":["agents"],"routeModuleScripts":["/js/one-time-provider-agents-route.js"],"hasCrmShell":false,"hasAgentsShell":true,"crmLoaded":false,"mailboxLoaded":false,"communicationsLoaded":false,"agentsLoaded":true} |
| `crm_mobile_no_horizontal_overflow` | PASS | {"hasCrmShell":true,"horizontalOverflow":false,"viewport":{"width":390,"height":844}} |
| `operations_assets_absent` | PASS | [{"id":"overview","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm","hasOperationsCss":false,"hasOperationsJs":false},{"id":"mailbox","hasOperationsCss":false,"hasOperationsJs":false},{"id":"communications","hasOperationsCss":false,"hasOperationsJs":false},{"id":"agents","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm-mobile-390","hasOperationsCss":false,"hasOperationsJs":false}] |
| `no_failed_requests_or_console_errors` | PASS | [{"id":"overview","failed":0,"bad":0,"console":0},{"id":"crm","failed":0,"bad":0,"console":0},{"id":"mailbox","failed":0,"bad":0,"console":0},{"id":"communications","failed":0,"bad":0,"console":0},{"id":"agents","failed":0,"bad":0,"console":0},{"id":"crm-mobile-390","failed":0,"bad":0,"console":0}] |

## Routes

| Route | Modules | Route scripts | CRM shell | Overflow | Failed/Bad/Console |
| --- | --- | --- | --- | --- | --- |
| `/provider.html?review=one-time` | `(none)` | `(none)` | no | no | 0/0/0 |
| `/provider.html?review=one-time&section=crm` | `crm` | `/js/one-time-provider-crm-route.js` | yes | no | 0/0/0 |
| `/provider.html?review=one-time&section=mailbox` | `mailbox` | `/js/one-time-provider-mailbox-route.js` | no | no | 0/0/0 |
| `/provider.html?review=one-time&section=communications` | `communications` | `/js/one-time-provider-communications-route.js` | no | no | 0/0/0 |
| `/provider.html?review=one-time&section=agents` | `agents` | `/js/one-time-provider-agents-route.js` | no | no | 0/0/0 |
| `/provider.html?review=one-time&section=crm` | `crm` | `/js/one-time-provider-crm-route.js` | yes | no | 0/0/0 |

No external send or production mutation was attempted.
