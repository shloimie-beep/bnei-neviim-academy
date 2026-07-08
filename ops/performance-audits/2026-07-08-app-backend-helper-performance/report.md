# App Backend And Helper Performance Audit

Generated: 2026-07-08T17:58:52.166Z
Base URL: https://join.onetimeonetime.com
External writes performed: false

## API Timings

| Path | Method | Status | Median | P95 | Bytes | Cache-Control |
|---|---|---:|---:|---:|---:|---|
| /api/health | GET | 200 | 240 | 427 | 70 |  |
| /api/one-time/instance-config | GET | 200 | 229 | 232 | 950 |  |
| /operations | GET | 200 | 1328 | 1928 | 2356672 | private, no-cache, max-age=0, must-revalidate |
| /api/member-library | GET | 401 | 242 | 252 | 44 |  |
| /api/one-time-classroom?review=one-time | GET | 200 | 244 | 245 | 3262 |  |
| /api/provider-portal/session | GET | 401 | 243 | 251 | 40 | no-store |
| /api/bna/helper/context?workspace_key=bna&project_key=bna | GET | 200 | 261 | 273 | 26682 | no-store |

## Helper Timings

| Name | Status | Duration | Planner | Helper Status | First Tool | Actions |
|---|---:|---:|---|---|---|---:|
| deterministic navigation | 200 | 256 | deterministic | planned | open_operations_view | 1 |
| deterministic performance report | 200 | 260 | deterministic | confirmation_required | create_support_ticket | 1 |
| complex planning fallback | 200 | 262 | deterministic | confirmation_required | create_support_ticket | 1 |

## Browser Timings

| Route | Viewport | Navigation | Click | DOM Nodes | Resources | Iframes | Overflow | Console Errors | Failed Requests | Screenshot |
|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|
| /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1440x1000 | 2549 | 41 | 1518 | 28 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/operations-desktop.png |
| /provider.html?admin_provider=one-time&section=communications | 1440x960 | 2053 |  | 418 | 5 | 0 | false | 1 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/provider-desktop.png |
| /member-library | 390x844 | 1956 | 14 | 71 | 3 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/member-library-mobile.png |
| /one-time-classroom | 390x844 | 2095 | 12 | 139 | 4 | 0 | false | 0 | 0 | ops/performance-audits/2026-07-08-app-backend-helper-performance/classroom-mobile.png |

## First Fix Recommendation

- Target: api_latency
- Reason: /operations median 1328ms is the slowest measured API path.

## Guardrails

- No helper actions were executed.
- No external sends, payments, access grants, WAPI/WhatsApp sends, Drive/Vimeo uploads, or production data mutations were performed.
- Auth credentials and session cookies are not written to this report.
- Operations screenshots are redacted before being saved.
