# App Backend And Helper Performance Audit

Generated: 2026-07-08T17:42:56.422Z
Base URL: https://join.onetimeonetime.com
External writes performed: false

## API Timings

| Path | Method | Status | Median | P95 | Bytes | Cache-Control |
|---|---|---:|---:|---:|---:|---|
| /api/health | GET | 200 | 247 | 545 | 70 |  |
| /api/one-time/instance-config | GET | 200 | 229 | 231 | 950 |  |
| /operations | GET | 200 | 1156 | 1434 | 2357206 | no-store |
| /api/member-library | GET | 401 | 241 | 269 | 44 |  |
| /api/one-time-classroom?review=one-time | GET | 200 | 242 | 252 | 3262 |  |
| /api/provider-portal/session | GET | 401 | 238 | 251 | 40 | no-store |
| /api/bna/helper/context?workspace_key=bna&project_key=bna | GET | 200 | 252 | 263 | 26682 | no-store |

## Helper Timings

| Name | Status | Duration | Planner | Helper Status | First Tool | Actions |
|---|---:|---:|---|---|---|---:|
| deterministic navigation | 200 | 264 | deterministic | planned | open_operations_view | 1 |
| deterministic performance report | 200 | 261 | deterministic | confirmation_required | create_support_ticket | 1 |
| complex planning fallback | 200 | 380 | deterministic | planned | create_task | 1 |

## Browser Timings

| Route | Viewport | Navigation | Click | DOM Nodes | Resources | Iframes | Overflow | Console Errors | Failed Requests | Screenshot |
|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|
| /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1440x1000 | 2507 | 57 | 1518 | 28 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/operations-desktop.png |
| /provider.html?admin_provider=one-time&section=communications | 1440x960 | 2070 |  | 418 | 5 | 0 | false | 1 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/provider-desktop.png |
| /member-library | 390x844 | 1969 | 15 | 71 | 3 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/member-library-mobile.png |
| /one-time-classroom | 390x844 | 2098 | 14 | 139 | 4 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/classroom-mobile.png |

## First Fix Recommendation

- Target: api_latency
- Reason: /operations median 1156ms is the slowest measured API path.

## Guardrails

- No helper actions were executed.
- No external sends, payments, access grants, WAPI/WhatsApp sends, Drive/Vimeo uploads, or production data mutations were performed.
- Auth credentials and session cookies are not written to this report.
- Operations screenshots are redacted before being saved.
