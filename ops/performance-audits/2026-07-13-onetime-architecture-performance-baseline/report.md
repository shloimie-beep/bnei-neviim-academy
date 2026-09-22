# One Time Architecture Performance Baseline

Generated: 2026-07-13T05:45:55.758Z
Requirement: REQ-20260713-907
Base URL: https://join.onetimeonetime.com
Deploy SHA: e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1
Operations auth: available via railway
External write performed: false
Production data mutation performed: false

## Architecture Decision Baseline

- Current state is a single Express app serving public One Time pages, provider/member/student pages, and authenticated Operations from the same repo/runtime.
- Operations has already been split into `operations-bootstrap.html`, `public/js/operations-shell.js`, and `public/js/operations-deferred-renderers.js`, but One Time still shares the large Operations runtime and route switcher.
- CRM selected-contact data now has server-owned DTO routes for timeline, conversations, and tasks, which reduces browser-side dataset unions but does not yet provide DB/pool timing spans.
- ADR default for the next implementation packet is a dedicated same-repo One Time frontend artifact sharing only domain/API contracts; a fully separate app remains deferred unless later measurement proves repository coupling is the cause.

## Route Map

| Route ID | Surface | Auth | Path |
| --- | --- | --- | --- |
| public-landing | public landing | none | /one-time |
| provider-login-entry | login/provider entry | none | /provider.html?admin_provider=one-time&section=crm |
| operations-overview | operations overview | operations | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview |
| crm-list | CRM list | operations | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts |
| crm-contact-detail | CRM contact detail | operations | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts&crm_contact=[redacted] |
| conversations | Conversations | operations | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi |
| tasks | Tasks | operations | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=tasks&section=one_time&project=one_time_mishnah_class |
| owner-communication-agent-test | owner communication-agent test view | operations | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=tiers |

## Summary

- Profiles sampled: 5
- Measured samples: 160
- Skipped samples: 0
- Samples needing attention: 32

## Root-Cause Classification

- Frontend critical path: Operations/CRM still rides the shared Operations shell and deferred renderer split; worst Operations-family FCP in this run is 1660ms versus 1616ms for public/provider entry routes.
- Server/hosting timing: TTFB and network-idle are measured, but route handler/database/pool timing is not yet separated because live Server-Timing and DB span instrumentation are not present in this baseline.
- API/database signal: No direct slow API budget breach was observed in the collected samples. Database cause remains an instrumentation gap for REQ-20260713-911.
- Third-party signal: request counts include third-party fanout; no external write or form submission was performed. Third-party cause is not primary unless route samples show failed/slow external requests in the JSON report.
- Browser work: Long-task totals did not dominate the measured samples.
- Reliability: No failed request budget breach was observed.

## Cold Route/Profile Results

| Route | Profile | Samples | FCP p50/p95 | LCP p50/p95 | TTFB p50/p95 | Network p95 | Req p95 | Blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| public-landing | desktop-1440 | 2 | 792/940 | 792/940 | 686/707 | 2639 | 19 | large_transfer:2 |
| provider-login-entry | desktop-1440 | 2 | 1048/1172 | 1540/1696 | 666/705 | 2884 | 29 | none |
| operations-overview | desktop-1440 | 2 | 864/1036 | 1344/1396 | 477/480 | 2587 | 28 | none |
| crm-list | desktop-1440 | 2 | 804/1052 | 1404/1428 | 418/441 | 2700 | 50 | none |
| crm-contact-detail | desktop-1440 | 2 | 872/960 | 1416/1516 | 474/534 | 2853 | 53 | none |
| conversations | desktop-1440 | 2 | 880/968 | 1696/1932 | 437/525 | 3400 | 57 | none |
| tasks | desktop-1440 | 2 | 868/972 | 1344/1516 | 472/534 | 2664 | 29 | heavy_dom:2 |
| owner-communication-agent-test | desktop-1440 | 2 | 860/868 | 1356/1372 | 432/443 | 2625 | 55 | none |
| public-landing | tablet-1024 | 2 | 724/760 | 724/760 | 636/638 | 2163 | 19 | large_transfer:2 |
| provider-login-entry | tablet-1024 | 2 | 1132/1160 | 1620/1724 | 677/748 | 2983 | 29 | none |
| operations-overview | tablet-1024 | 2 | 840/940 | 1344/1492 | 420/434 | 2673 | 28 | none |
| crm-list | tablet-1024 | 2 | 828/832 | 1316/1336 | 408/425 | 2672 | 50 | none |
| crm-contact-detail | tablet-1024 | 2 | 836/1000 | 1344/1504 | 429/572 | 2807 | 53 | none |
| conversations | tablet-1024 | 2 | 828/872 | 1568/1612 | 416/439 | 3049 | 57 | none |
| tasks | tablet-1024 | 2 | 944/996 | 1300/1444 | 412/516 | 2636 | 29 | heavy_dom:2 |
| owner-communication-agent-test | tablet-1024 | 2 | 788/912 | 1324/1460 | 412/490 | 2763 | 55 | none |
| public-landing | mobile-430 | 2 | 724/744 | 724/744 | 637/667 | 2713 | 19 | large_transfer:2 |
| provider-login-entry | mobile-430 | 2 | 1176/1184 | 1640/1664 | 747/772 | 2857 | 29 | none |
| operations-overview | mobile-430 | 2 | 828/900 | 1280/1396 | 414/457 | 2599 | 28 | none |
| crm-list | mobile-430 | 2 | 820/1160 | 1320/1468 | 414/506 | 2759 | 50 | none |
| crm-contact-detail | mobile-430 | 2 | 848/1124 | 1308/1816 | 447/631 | 3251 | 53 | none |
| conversations | mobile-430 | 2 | 872/1096 | 1600/1780 | 421/502 | 3117 | 57 | none |
| tasks | mobile-430 | 2 | 924/936 | 1436/1684 | 507/534 | 2913 | 29 | heavy_dom:2 |
| owner-communication-agent-test | mobile-430 | 2 | 1012/1136 | 1328/1452 | 422/511 | 2718 | 55 | none |
| public-landing | mobile-390 | 2 | 748/820 | 748/820 | 657/732 | 2313 | 19 | large_transfer:2 |
| provider-login-entry | mobile-390 | 2 | 1044/1276 | 1516/1784 | 662/850 | 3065 | 29 | none |
| operations-overview | mobile-390 | 2 | 884/936 | 1344/1424 | 461/514 | 2696 | 28 | none |
| crm-list | mobile-390 | 2 | 824/1028 | 1348/2244 | 422/466 | 2691 | 50 | none |
| crm-contact-detail | mobile-390 | 2 | 816/912 | 1400/1404 | 439/503 | 3081 | 53 | none |
| conversations | mobile-390 | 2 | 820/1168 | 1580/1936 | 422/757 | 3359 | 57 | none |
| tasks | mobile-390 | 2 | 1008/1132 | 1476/1644 | 484/742 | 2898 | 29 | heavy_dom:2 |
| owner-communication-agent-test | mobile-390 | 2 | 944/988 | 1388/1544 | 418/574 | 2776 | 55 | none |
| public-landing | mobile-390-throttled | 2 | 928/1588 | 928/1588 | 660/1275 | 3641 | 19 | none |
| provider-login-entry | mobile-390-throttled | 2 | 1588/1616 | 3272/3296 | 745/775 | 4562 | 29 | none |
| operations-overview | mobile-390-throttled | 2 | 1264/1348 | 2972/3092 | 439/510 | 4327 | 28 | none |
| crm-list | mobile-390-throttled | 2 | 1252/1296 | 2996/3000 | 431/467 | 4555 | 50 | none |
| crm-contact-detail | mobile-390-throttled | 2 | 1312/1336 | 3036/3064 | 480/481 | 4580 | 53 | none |
| conversations | mobile-390-throttled | 2 | 1252/1276 | 3796/3828 | 416/428 | 4519 | 57 | none |
| tasks | mobile-390-throttled | 2 | 1300/1660 | 2996/3416 | 482/814 | 4933 | 29 | none |
| owner-communication-agent-test | mobile-390-throttled | 2 | 1232/1256 | 3012/3084 | 408/444 | 4516 | 55 | none |

## Worst Samples

| Route | Profile | Cache | TTFB | FCP | LCP | Network | Reqs | Blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tasks | mobile-390-throttled | cold | 814 | 1660 | 3416 | 4933 | 29 | none |
| crm-contact-detail | mobile-390-throttled | cold | 480 | 1336 | 3064 | 4580 | 53 | none |
| crm-contact-detail | mobile-390-throttled | warm | 497 | 1324 | 3076 | 4565 | 53 | none |
| provider-login-entry | mobile-390-throttled | cold | 775 | 1616 | 3296 | 4562 | 29 | none |
| crm-contact-detail | mobile-390-throttled | cold | 481 | 1312 | 3036 | 4560 | 53 | none |
| tasks | mobile-390-throttled | cold | 482 | 1300 | 2996 | 4558 | 27 | none |
| crm-list | mobile-390-throttled | cold | 467 | 1296 | 3000 | 4555 | 50 | none |
| crm-contact-detail | mobile-390-throttled | warm | 439 | 1272 | 2972 | 4541 | 53 | none |
| conversations | mobile-390-throttled | cold | 416 | 1252 | 3828 | 4519 | 57 | none |
| conversations | mobile-390-throttled | cold | 428 | 1276 | 3796 | 4516 | 57 | none |
| owner-communication-agent-test | mobile-390-throttled | cold | 444 | 1256 | 3084 | 4516 | 55 | none |
| owner-communication-agent-test | mobile-390-throttled | cold | 408 | 1232 | 3012 | 4512 | 55 | none |
| crm-list | mobile-390-throttled | cold | 431 | 1252 | 2996 | 4507 | 50 | none |
| provider-login-entry | mobile-390-throttled | cold | 745 | 1588 | 3272 | 4506 | 29 | none |
| operations-overview | mobile-390-throttled | cold | 510 | 1348 | 3092 | 4327 | 28 | none |

## Instrumentation Gaps To Carry Into REQ-20260713-911

- No live Server-Timing header or trace ID is emitted for each route yet.
- API handler duration, database duration, and pool wait are not separated in production evidence yet.
- Frontend route-transition/RUM web-vitals collection is not persisted yet.
- Bundle/chunk budgets are documented from existing split-shell evidence but are not enforced by this live runner yet.
- Exact p95 live release gates should be wired into REQ-20260713-911 before lag is called fixed.

## Guardrails

- No forms were submitted and no buttons were clicked.
- No email, WhatsApp, Telegram, payment, access grant, DNS, Drive, Vimeo, Zoom, provider credential, Railway mutation, or external CRM write was performed.
- Operations cookies were used only in memory; credentials and cookie values are not written to reports.
- Saved route paths redact crm_contact, tokens, access codes, email, and phone-like values.
- No raw contact data, message bodies, private destinations, or screenshots are stored by this runner.
