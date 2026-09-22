# App Backend And Helper Performance Audit

Generated: 2026-07-08T19:37:18.241Z
Base URL: http://127.0.0.1:8098
External writes performed: false

## API Timings

| Path | Method | Status | Median | P95 | Bytes | Cache-Control |
|---|---|---:|---:|---:|---:|---|
| /api/health | GET | 200 | 268 | 819 | 107 |  |
| /api/one-time/instance-config | GET | 200 | 1 | 2 | 379 |  |
| /operations | GET | 200 | 4 | 4 | 1688 | private, no-cache, max-age=0, must-revalidate |
| /api/member-library | GET | 401 | 1 | 2 | 44 |  |
| /api/one-time-classroom?review=one-time | GET | 200 | 3 | 5 | 3262 |  |
| /api/provider-portal/session | GET | 401 | 1 | 1 | 40 | no-store |
| /api/bna/helper/context?workspace_key=bna&project_key=bna | GET | 200 | 255 | 278 | 26615 | no-store |

## Helper Timings

| Name | Status | Duration | Planner | Helper Status | First Tool | Actions |
|---|---:|---:|---|---|---|---:|
| deterministic navigation | 200 | 1557 | deterministic | planned | open_operations_view | 1 |
| deterministic performance report | 200 | 1333 | deterministic | confirmation_required | create_support_ticket | 1 |

## Browser Timings

| Route | Viewport | Navigation | Click | DOM Nodes | Resources | Iframes | Overflow | Console Errors | Failed Requests | Screenshot |
|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|
| /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1440x1000 | 11963 |  | 27 | 9 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/operations-desktop.png |
| /provider.html?admin_provider=one-time&section=communications | 1440x960 | 1275 |  | 417 | 5 | 0 | false | 1 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/provider-desktop.png |
| /member-library | 390x844 | 1799 | 17 | 71 | 3 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/member-library-mobile.png |
| /one-time-classroom | 390x844 | 1279 | 5 | 139 | 4 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/classroom-mobile.png |

## First Fix Recommendation

- Target: operations_initial_load
- Reason: Operations initial browser load took 11963ms; inspect large inline Operations shell and first render work.

## Guardrails

- No helper actions were executed.
- No external sends, payments, access grants, WAPI/WhatsApp sends, Drive/Vimeo uploads, or production data mutations were performed.
- Auth credentials and session cookies are not written to this report.
- Operations screenshots are redacted before being saved.
