# One Time Operations Content IA And Filter Rail

Raw source: `RAW-20260706-956`  
Requirements: `REQ-20260706-956` through `REQ-20260706-959`  
Packet: `ops/prompt-packets/2026-07-06-onetime-operations-content-ia-filter-rail/00-content-ia-filter-rail.product-quality.json`  
Workspace: `rabbi_sheller_provider`  
Project: `one_time_mishnah_class`  
Status: Done - merged, deployed, and live verified

## Current-State Audit

- The One Time durable IA model already had `Classes & Content`, but it defaulted that module to a stale `schedule` subsection and listed `worksheets` / `assets` source sections that do not match the live Operations content tabs.
- The live One Time sidebar rendered `Classes`, which made the content area easy to miss.
- The live content top rail reused the generic BNA content tabs: `Library`, `One Time Library`, `Meeting Drops`, `Research`, `Selected`, `Repurpose`, `Newsletter`, `Prompts`, and `Bundles`.
- The provider Program top rail had long repetitive labels such as `Mishnayos Membership`, `Membership Tiers`, `Worksheets / Source Sheets`, `Questions / Posts`, and `Payment / Access`.
- Mobile already used a horizontal rail mechanism, but the rail kept a meta row and too many tabs for this One Time content surface.

## Requirements

### `REQ-20260706-956` - Sidebar Content Section

Expected result: One Time provider navigation exposes `Classes & Content` as the main category for class media, library, meeting drops, source prep, and bundles.

Acceptance:

- Sidebar item label is `Classes & Content`.
- It opens `/operations?workspace=rabbi_sheller_provider&view=content&section=one_time_library`.
- The durable IA model default for `classes_content` is `library`, not `schedule`.

### `REQ-20260706-957` - Compact Top Sections

Expected result: One Time content top rail shows only real Rabbi-facing subsections: `Library`, `Meeting Drops`, `Source Prep`, and `Bundles`.

Acceptance:

- The One Time content rail no longer shows `Selected`, `Repurpose`, `Newsletter`, or `Prompts`.
- Generic content tabs remain available outside the One Time workspace where they still make sense.
- `Source Prep` keeps the existing `research` route id to avoid data or URL migration.

### `REQ-20260706-958` - Mobile Sliding Rail

Expected result: On mobile, the top section rail scrolls horizontally and does not add avoidable vertical height.

Acceptance:

- Mobile rail keeps `overflow-x: auto` and `flex-wrap: nowrap`.
- Mobile content route has no document-level horizontal overflow.
- Mobile hides the rail meta row so the subsection controls are compact.

### `REQ-20260706-959` - Provider Program Consistency

Expected result: Provider Program top sections use short section names, and Program has a lightweight `Content` bridge to the real Classes & Content workspace.

Acceptance:

- Provider Program top rail uses `Overview`, `Launch`, `Program`, `Membership`, `Content`, `Schedule`, `Questions`, `Access`, `Settings`.
- `Content` renders a bridge with buttons for `Library`, `Meeting Drops`, `Source Prep`, and `Bundles`.
- No backend data scope, authorization, or external provider behavior changes.

## Evidence

- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-06-onetime-operations-content-ia-filter-rail/00-content-ia-filter-rail.product-quality.json`
  - Report: `ops/product-quality-compiler/validation/latest-product-quality-validation.md`
- PASS `node --test tests/agent-control-center.test.js tests/one-time-rabbi-dashboard-ia.test.js`
- PASS with shared Playwright dependency and durable redacted report:
  `NODE_PATH=C:\Users\User\BNA v2.0\node_modules BNA_ONE_TIME_OPERATIONS_UI_SMOKE_DIR=ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke node --test tests/one-time-operations-ui-smoke.test.js`
  - Report: `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/report.md`
  - JSON: `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/report.json`
  - Screenshots: `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/desktop.png`,
    `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/local-smoke/mobile-agents.png`
- PASS with shared Playwright dependency and durable redacted report:
  `NODE_PATH=C:\Users\User\BNA v2.0\node_modules BNA_ONE_TIME_UI_REVIEW_REPORT_DIR=ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/final-local-smoke node --test tests/one-time-rabbi-ui-final-local-smoke.test.js`
  - Report: `ops/ui-audits/2026-07-06-onetime-operations-content-ia-filter-rail/final-local-smoke/qa-harness-local-report.json`
- PASS `npm run watchdog:actions`
  - Report: `ops/watchdog-audits/2026-07-06T15-04-watchdog-action-audit.md`
- PASS `npm run watchdog:protocol-drift`
  - Report: `ops/watchdog-audits/2026-07-06-product-quality-drift.md`
- PASS `git diff --check` with line-ending warnings only.

## Deploy / Live Closeout

- PASS PR #121 merged to `master` at
  `d572ca55ecb85ff415b0755efc8fb8f19e1b47b8`.
- PASS BNA Railway deployment `be251afc-471c-414b-93b6-757de8db82db`
  reached `SUCCESS` on production service `skillful-motivation`.
- PASS `npm run railway:doctor` with explicit BNA production target.
- PASS `npm run app:smoke`
  - Report: `ops/live-smokes/2026-07-06T15-11-13-507Z-live-app-smoke.md`
- PASS `npm run app:smoke:rabbi-onetime-landing`
  - Report: `ops/live-smokes/2026-07-06T15-10-28-684Z-rabbi-onetime-landing-smoke.md`
- PASS exact authenticated One Time Operations content IA live smoke.
  - Report:
    `ops/live-smokes/2026-07-06T15-16-53-470Z-one-time-operations-content-ia-filter-rail-live-smoke.md`
  - JSON:
    `ops/live-smokes/2026-07-06T15-16-53-470Z-one-time-operations-content-ia-filter-rail-live-smoke.json`

Live smoke confirmed the production content route stays scoped to
`rabbi_sheller_provider`, opens `meetings`, shows only `Library`,
`Meeting Drops`, `Source Prep`, and `Bundles`, hides repetitive generic content
tabs, exposes `Classes & Content` and `Studio` in the Rabbi sidebar, renders the
Program `Content` bridge, and keeps the mobile rail horizontally sliding with no
body-level horizontal overflow.

Guardrails: no backend auth/data/schema change, no WhatsApp/email/payment send,
no access grant, no DNS/provider-account mutation, no production data mutation,
and no screenshots or private page data committed.
