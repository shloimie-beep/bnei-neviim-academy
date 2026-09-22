# One Time Operations Content IA And Filter Rail Audit

Raw source: `RAW-20260706-956`  
Requirements: `REQ-20260706-956` through `REQ-20260706-959`  
Route focus: `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=one_time_library`

## Current-State Findings

| Finding | Severity | Evidence | Correction |
|---|---:|---|---|
| Sidebar content label was too narrow (`Classes`), making the content workspace easy to miss. | P2 | `public/operations.html` One Time nav item. | Rename to `Classes & Content` with marker `CC`. |
| Durable IA defaulted Classes & Content to `schedule` and referenced stale `worksheets` / `assets` content source sections. | P2 | `src/platform/instances/one-time-rabbi-dashboard-ia.js`. | Default to `library`; sections become Library, Meeting Drops, Source Prep, Bundles. |
| One Time content top rail mixed true sections with generic production workflow tabs. | P2 | `CONTENT_SUBTABS` rendered for One Time content route. | Add One Time-specific visible tabs and fallback stale tabs to Library. |
| Provider Program top rail labels were long and partly duplicative. | P3 | `PROVIDER_PROGRAM_SUBTABS`. | Shorten provider Program labels and add a Content bridge to the actual Classes & Content workspace. |
| Mobile rail already had horizontal scrolling but kept extra rail meta height. | P3 | Mobile CSS for `.ops-filter-rail`. | Hide rail meta on mobile and keep no-overflow assertions. |

## Implemented Correction

- One Time sidebar now shows `Classes & Content`.
- One Time content rail now shows exactly `Library`, `Meeting Drops`, `Source Prep`, `Bundles`.
- Stale One Time content sections such as `selected`, `repurpose`, `newsletter`, and `prompts` normalize back to `one_time_library`.
- Provider Program top rail now uses compact labels and includes a `Content` bridge panel.
- Mobile rail keeps horizontal scrolling and suppresses the meta row.

## Verification

- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-06-onetime-operations-content-ia-filter-rail/00-content-ia-filter-rail.product-quality.json`
- PASS `node --test tests/agent-control-center.test.js tests/one-time-rabbi-dashboard-ia.test.js`
- PASS `NODE_PATH=C:\Users\User\BNA v2.0\node_modules BNA_ONE_TIME_OPERATIONS_UI_SMOKE_DIR=ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke node --test tests/one-time-operations-ui-smoke.test.js`
- PASS `NODE_PATH=C:\Users\User\BNA v2.0\node_modules BNA_ONE_TIME_UI_REVIEW_REPORT_DIR=ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/final-local-smoke node --test tests/one-time-rabbi-ui-final-local-smoke.test.js`
- PASS `npm run watchdog:actions` with `finding_count=0`.
- PASS `npm run watchdog:protocol-drift` with `Findings: 0`.
- PASS `git diff --check` with line-ending warnings only.

Evidence:

- `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/report.md`
- `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/report.json`
- `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/desktop.png`
- `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/mobile-agents.png`
- `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/final-local-smoke/qa-harness-local-report.json`

The local smoke JSON redacts Drive file ids and URLs before writing durable evidence.
