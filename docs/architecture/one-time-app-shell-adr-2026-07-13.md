# ADR: One Time Dedicated Same-Repo App Shell

Date: 2026-07-13

Status: Accepted for `REQ-20260713-908`

Requirement: `REQ-20260713-907`

Evidence:

- `ops/performance-audits/2026-07-13-onetime-architecture-performance-baseline/report.md`
- `ops/performance-audits/2026-07-13-onetime-architecture-performance-baseline/report.json`
- Live deploy SHA measured: `e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1`

## Decision

Build the next One Time implementation packet as a dedicated same-repo One Time frontend artifact and app shell, while continuing to share platform backend contracts, authentication, workspace isolation, CRM contact identity, delivery outbox, communication-agent infrastructure, ticketing, and release tooling.

This means One Time gets an owned entry/shell for the provider-facing product path, route chunks, layout, mobile IA, and performance budgets. It does not mean a second CRM, second contact model, second inbox, second agent runtime, second delivery queue, or independent browser-side data union.

## Context

Current live state is one Express app serving public One Time pages, provider/member/student surfaces, and authenticated Operations routes from the same repo/runtime. The Operations UI has already been split into `operations-bootstrap.html`, `public/js/operations-shell.js`, and `public/js/operations-deferred-renderers.js`, but One Time still travels through the generic Operations route switcher and shared route surface for several critical owner workflows.

Existing architecture notes already support a scoped One Time runtime:

- `docs/architecture/onetime-single-tenant-split.md`
- `docs/architecture/platform-core-backend-contracts.md`

The 2026-07-13 live baseline sampled 160 route/profile/cache/sample combinations across:

- public landing;
- provider/login entry;
- Operations overview;
- CRM list;
- CRM contact detail;
- conversations;
- tasks;
- owner communication-agent test/readiness view.

The runner performed no submissions, no sends, no provider mutations, no production writes, and no screenshots containing private data.

## Baseline Findings

Summary:

- Samples measured: 160
- Skipped samples: 0
- Samples needing attention: 32
- Failed request budget breaches: 0
- Console error budget breaches: 0
- Direct slow API budget breaches: 0

Attention categories:

- `large_transfer`: 16 samples, concentrated on the public landing route with roughly 2151 KB transfer on cold non-throttled profiles.
- `heavy_dom`: 16 samples, concentrated on the tasks route with roughly 6066 DOM nodes on cold non-throttled profiles.

Representative live timings from the report:

- Public landing mobile-390 cold FCP/LCP p95: 820 ms; transfer p95: 2151 KB.
- Provider/login entry mobile-390-throttled cold FCP p95: 1616 ms; LCP p95: 3296 ms.
- CRM contact detail mobile-390-throttled cold FCP p95: 1336 ms; LCP p95: 3064 ms; request p95: 53.
- Conversations mobile-390-throttled cold FCP p95: 1276 ms; LCP p95: 3828 ms; request p95: 57.
- Tasks desktop/tablet/mobile non-throttled cold samples hit the heavy DOM budget with roughly 6066 DOM nodes; throttled mobile cold FCP/LCP p95 stayed at 1660/3416 ms.
- API p95 on sampled authenticated routes stayed below current draft budgets; worst shown in the report is the tasks throttled API p95 at 1776 ms, below the 2200 ms throttled budget.

## Why This Path

The baseline does not point to a clear hosting, DB, or API latency failure as the current primary problem. It points to route weight, shared shell coupling, DOM weight, and missing production instrumentation.

A same-repo dedicated One Time shell is the smallest move that gives One Time an owned product experience and performance path while preserving the shared data/security contracts that protect workspace isolation.

The next implementation should:

- keep server-owned CRM/contact/message/task DTOs as the API source of truth;
- introduce a One Time provider shell/entry that avoids loading unrelated Operations route modules on the One Time path;
- keep One Time themes from changing dimensions, route behavior, or data contracts;
- preserve BNA/One Time workspace isolation at the backend;
- route public landing optimization separately from the provider shell;
- use the performance baseline as the initial budget floor, not as a reason to invent a separate app.

## Rejected Alternatives

1. Continue using the shared Operations monolith as the critical path.

   Rejected because the One Time owner experience needs product-specific IA, mobile flow, and route budgets. The current shared shell can continue as an admin fallback, but it should not be the only path for One Time CRM/agent/ticket workflows.

2. Create a fully separate application immediately.

   Rejected for this packet because the evidence does not yet prove runtime/repository coupling is the bottleneck. A full split would raise migration, auth, secret, database, deployment, and cross-workspace safety risk before the lighter same-repo shell has been tried and measured.

3. Build a separate CRM/contact/inbox/agent runtime for One Time.

   Rejected because the standing platform contract requires one canonical CRM/contact aggregate, one inbound pipeline, one delivery outbox, and workspace-scoped records. Duplicating those systems would increase cross-workspace contamination risk.

## Route And Budget Targets

Initial route budget classes for `REQ-20260713-908` and `REQ-20260713-911`:

| Class | FCP p95 | LCP p95 | Action ready p95 | API p95 | Request count |
| --- | ---: | ---: | ---: | ---: | ---: |
| Public landing | 2500 ms | 3500 ms | 4500 ms | 1000 ms | 65 |
| Provider shell | 3000 ms | 4500 ms | 6500 ms | 1500 ms | 95 |
| CRM workspace | 3000 ms | 5200 ms | 6500 ms | 1500 ms | 95 |
| Mobile throttled | 4000 ms | 6500 ms | 9000 ms | 2200 ms | 115 |

Near-term route targets:

- `/one-time`
- `/provider.html?admin_provider=one-time&section=crm`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=tasks&section=one_time&project=one_time_mishnah_class`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=tiers`

## Required Follow-Up

`REQ-20260713-908` should implement the dedicated One Time shell incrementally, preserving current routes or redirects until live smoke proves the replacement route works.

`REQ-20260713-911` must add instrumentation before any claim that lag is fixed:

- live `Server-Timing` or equivalent trace IDs for sampled routes;
- API handler duration;
- database duration;
- pool wait duration;
- route-transition/RUM web-vitals persistence;
- bundle/chunk size budget enforcement;
- regression gate around the 88-sample compact matrix or a smaller PR-safe subset.

Public landing transfer optimization should be its own bounded slice if it competes with provider shell work, because the public landing issue is mostly image/media transfer, while provider tasks/contact issues are route shell and DOM weight.

## Guardrails

- No external send, ticket approval, payment, DNS, Drive, Vimeo, Zoom, Railway, credential, or production mutation is authorized by this ADR.
- No private message body, raw contact data, owner email, owner phone, cookie value, token, or class-link secret belongs in performance reports.
- BNA parity remains a backend/security/workspace-isolation invariant in this phase; BNA frontend parity is deferred until One Time acceptance is stable.
