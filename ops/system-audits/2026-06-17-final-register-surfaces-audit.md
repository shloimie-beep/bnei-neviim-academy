# Final Register Surfaces Audit - 2026-06-17

Scope: close the remaining website correction register rows after the
communications batch, including raw/uploaded recording parity, old upload
reprocessing, provider/public surface flow, final display audit,
internal-first calendar/classroom, provider secret/rotation controls, helper
automation controls, explanatory Operations copy, and proof hygiene.

## Status

- Final register status: 69 Done, 1 Blocked, 0 Pending.
- Register total: 70 requirements.
- Done: 69.
- Blocked: 1 (`REQ-20260616-030`, live Rabbi payment-link creation only).
- Pending: 0.
- Final Railway deployment: `b3b7e0f6-1f07-4ec1-8ff4-f65c701ff58d`.
- Railway doctor: `SUCCESS`.

## Implementation Evidence

- `server.js`: recording-intake and content-backed mixed recording parser now
  returns `raw_intake`, stores top-level `raw_intake_stable_id`, and records
  `source_type` / `source_table` in `mixed_recording_parse`.
- `src/lib/bna/helper/tool-registry.js`: added guarded
  `create_automation` and `update_automation` tools for first-party local
  automation metadata only.
- `src/lib/bna/helper/planner.js`: maps natural language create/edit/disable
  automation and billing workflow prompts to the new helper tools.
- `src/lib/bna/helper/permissions.js`: permits the new helper tools in scoped
  project/provider task contexts.
- `public/index.html`: final display fix prevents homepage slide-in media from
  widening the page during animation.
- `scripts/smoke-final-register-surfaces-live.mjs`: final live smoke covers
  provider routes, Operations explanatory/internal-first markers, helper
  automation/secret tools, recording raw-intake provenance, calendar reads, and
  automation reads.
- `tests/final-register-surfaces-closeout.test.js`: static closeout coverage
  for the final remaining register surfaces.

## Upload / Raw Intake Audit

Read-only database audit before reprocessing found:

- older open raw rows: 0
- older pending uploads: 0
- older unparsed transcript jobs: 1
- stale item: content job `27`, source `telegram_media`, status
  `transcribed`, transcript present, parse JSON empty

Live reprocessing:

- Endpoint: `/api/bna/content-jobs/27/parse-mixed-recording`
- Result: success, not skipped, not dry-run
- Raw intake: `RAW-20260617-004`
- Intake parse run: `4`
- Parser: `canonical-intake-parser`
- Counts: 0 tasks, 0 tickets, 2 class notes, 2 review-count items
- Created record groups: tasks, tickets, class_sessions, section_records,
  section_definitions

Read-only database audit after reprocessing found:

- older open raw rows: 0
- older pending uploads: 0
- older unparsed transcript jobs: 0
- content job `27` now stores `raw_intake_stable_id=RAW-20260617-004`,
  parser `canonical-intake-parser`, and intake parse run `4`.

## Verification

- Syntax checks passed:
  - `node --check server.js`
  - `node --check src/lib/bna/helper/tool-registry.js`
  - `node --check src/lib/bna/helper/planner.js`
  - `node --check scripts/smoke-final-register-surfaces-live.mjs`
- Full tests passed: `npm test` -> 702/702.
- Local final Browser proof passed with desktop/mobile screenshots and 0px
  horizontal overflow:
  `ops/playwright-smokes/2026-06-17-final-register-surfaces-local/report.md`.
- Local final targeted smoke passed:
  `ops/live-smokes/2026-06-17T11-17-25-537Z-final-register-surfaces-live-smoke.md`.
- Final live app smoke passed:
  `ops/live-smokes/2026-06-17T11-22-42-701Z-live-app-smoke.md`.
- Final live public privacy smoke passed:
  `ops/live-smokes/2026-06-17T11-23-39-214Z-public-route-privacy-smoke.md`.
- Final live helper smoke passed:
  `ops/live-smokes/2026-06-17T11-23-39-672Z-operations-helper-live-smoke.md`.
- Final live workspace taxonomy smoke passed:
  `ops/live-smokes/2026-06-17T11-23-43-423Z-operations-workspace-taxonomy-live-smoke.md`.
- Final live Operations settings/dashboard smoke passed:
  `ops/live-smokes/2026-06-17T11-23-48-357Z-operations-settings-dashboard-live-smoke.md`.
- Final live provider classroom/settings smoke passed:
  `ops/live-smokes/2026-06-17T11-23-51-822Z-provider-classroom-settings-live-smoke.md`.
- Final live content/research smoke passed:
  `ops/live-smokes/2026-06-17T11-23-58-240Z-content-research-scope-live-smoke.md`.
- Final live communications smoke passed:
  `ops/live-smokes/2026-06-17T11-24-08-113Z-communications-screening-live-smoke.md`.
- Final live public navigation smoke passed:
  `ops/live-smokes/2026-06-17T11-24-12-142Z-public-navigation-positioning-smoke.md`.
- Final live Rabbi/OneTime smoke passed:
  `ops/live-smokes/2026-06-17T11-24-16-718Z-rabbi-onetime-landing-smoke.md`.
- Final live register-surface smoke passed:
  `ops/live-smokes/2026-06-17T11-24-18-485Z-final-register-surfaces-live-smoke.md`.
- Final watchdog audit passed as a read-only audit:
  `ops/watchdog-audits/2026-06-17T11-28-watchdog-audit.md`.
  It reported zero ramble-protocol findings, no UI issues, and no repo /
  source-of-truth drift for this closeout; the seven findings are older
  queue/proof hygiene items outside this final register closeout.

## No-Write / Guardrail Notes

- Final smokes did not create Google Classroom courses, sync Google Calendar,
  publish social content, send emails/WhatsApp messages, charge payments,
  grant external access, or expose raw secrets.
- Helper automation tools create/edit local `bna_automations` metadata only and
  carry explicit permissions/metadata notes requiring separate approval before
  any live handler or external action exists.
- `REQ-20260616-030` remains blocked until the operator chooses Stripe or Green
  Invoice and provides/approves the needed live payment-link credentials or
  links.
