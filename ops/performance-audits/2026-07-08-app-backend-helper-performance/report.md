# App Backend And Helper Performance Audit

Generated: 2026-07-08T20:40:15.560Z
Base URL: http://127.0.0.1:8100
External writes performed: false

## API Timings

| Path | Method | Status | Median | P95 | Bytes | Cache-Control |
|---|---|---:|---:|---:|---:|---|
| /api/health | GET | 200 | 234 | 234 | 107 |  |
| /api/one-time/instance-config | GET | 200 | 2 | 2 | 379 |  |
| /operations | GET | 200 | 2 | 2 | 1688 | private, no-cache, max-age=0, must-revalidate |
| /api/member-library | GET | 401 | 2 | 2 | 44 |  |
| /api/one-time-classroom?review=one-time | GET | 200 | 4 | 4 | 3262 |  |
| /api/provider-portal/session | GET | 401 | 1 | 1 | 40 | no-store |
| /api/bna/helper/context?workspace_key=bna&project_key=bna | GET | 200 | 263 | 263 | 49963 | no-store |

## Helper Timings

| Name | Status | Duration | Planner | Helper Status | First Tool | Actions |
|---|---:|---:|---|---|---|---:|
| deterministic navigation | 200 | 1010 | deterministic | planned | open_operations_view | 1 |
| deterministic performance report | 200 | 964 | deterministic | confirmation_required | create_support_ticket | 1 |

## Browser Timings

| Route | Viewport | Navigation | Click | DOM Nodes | Resources | Iframes | Overflow | Console Errors | Failed Requests | Screenshot |
|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|
| /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1440x1000 | 3024 | 28 | 588 | 14 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/operations-desktop.png |
| /provider.html?admin_provider=one-time&section=communications | 1440x960 | 1253 |  | 417 | 5 | 0 | false | 1 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/provider-desktop.png |
| /member-library | 390x844 | 1339 | 5 | 71 | 3 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/member-library-mobile.png |
| /one-time-classroom | 390x844 | 1275 | 16 | 139 | 4 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/classroom-mobile.png |

## First Fix Recommendation

- Target: operations_initial_load
- Reason: Operations initial browser load took 3024ms; inspect large inline Operations shell and first render work.

## Guardrails

- No helper actions were executed.
- No external sends, payments, access grants, WAPI/WhatsApp sends, Drive/Vimeo uploads, or production data mutations were performed.
- Auth credentials and session cookies are not written to this report.
- Operations screenshots are redacted before being saved.
