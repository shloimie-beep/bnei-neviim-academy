# One Time Provider Route Module Live Smoke

Status: PASS
Generated: 2026-07-13T06:38:20.407Z
Base URL: https://join.onetimeonetime.com
Expected SHA: a9447271e29ed0f30401b05f760f4d314f91c9a9
Deployed SHA: a9447271e29ed0f30401b05f760f4d314f91c9a9
Target app: one-time

Live One Time provider route-module smoke. Read-only/review routes only; no form submission, email, WhatsApp, CRM write, payment, access grant, provider mutation, or production data write.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| `deploy_info_ok` | PASS | {"status":200,"deploy_status":"ok","target_app":"one-time","commit_sha":"a9447271e29ed0f30401b05f760f4d314f91c9a9"} |
| `deploy_info_exact_sha` | PASS | {"expected_sha":"a9447271e29ed0f30401b05f760f4d314f91c9a9","actual_sha":"a9447271e29ed0f30401b05f760f4d314f91c9a9"} |
| `deploy_info_one_time_target` | PASS | {"target_app":"one-time"} |
| `overview_no_route_module` | PASS | {"modules":[],"routeModuleScripts":[],"hasCrmShell":false,"hasCrmPlaceholder":true} |
| `crm_loads_only_crm_route_module` | PASS | {"modules":["crm"],"routeModuleScripts":["/js/one-time-provider-crm-route.js"],"hasCrmShell":true,"crmLoaded":true,"mailboxLoaded":false,"communicationsLoaded":false} |
| `mailbox_loads_only_mailbox_route_module` | PASS | {"modules":["mailbox"],"routeModuleScripts":["/js/one-time-provider-mailbox-route.js"],"hasCrmShell":false,"crmLoaded":false,"mailboxLoaded":true} |
| `crm_mobile_no_horizontal_overflow` | PASS | {"hasCrmShell":true,"horizontalOverflow":false,"viewport":{"width":390,"height":844}} |
| `operations_assets_absent` | PASS | [{"id":"overview","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm","hasOperationsCss":false,"hasOperationsJs":false},{"id":"mailbox","hasOperationsCss":false,"hasOperationsJs":false},{"id":"crm-mobile-390","hasOperationsCss":false,"hasOperationsJs":false}] |
| `no_failed_requests_or_console_errors` | PASS | [{"id":"overview","failed":0,"bad":0,"console":0},{"id":"crm","failed":0,"bad":0,"console":0},{"id":"mailbox","failed":0,"bad":0,"console":0},{"id":"crm-mobile-390","failed":0,"bad":0,"console":0}] |

## Routes

| Route | Modules | Route scripts | CRM shell | Overflow | Failed/Bad/Console |
| --- | --- | --- | --- | --- | --- |
| `/provider.html?review=one-time` | `(none)` | `(none)` | no | no | 0/0/0 |
| `/provider.html?review=one-time&section=crm` | `crm` | `/js/one-time-provider-crm-route.js` | yes | no | 0/0/0 |
| `/provider.html?review=one-time&section=mailbox` | `mailbox` | `/js/one-time-provider-mailbox-route.js` | no | no | 0/0/0 |
| `/provider.html?review=one-time&section=crm` | `crm` | `/js/one-time-provider-crm-route.js` | yes | no | 0/0/0 |

No external send or production mutation was attempted.
