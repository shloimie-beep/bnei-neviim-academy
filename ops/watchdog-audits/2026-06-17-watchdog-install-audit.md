# Watchdog Install Audit - 2026-06-17

Raw ID: `RAW-20260617-005`
Goal ID: `GOAL-20260617-005`

## Result

The universal watchdog layer was installed for goal mode, links, actions,
security routes, raw intake drift, content routing, communications alerts, UI
structure, and visual baselines.

## Added Watchdog Commands

- `npm run watchdog:audit`
- `npm run watchdog:links`
- `npm run watchdog:actions`
- `npm run watchdog:security`
- `npm run watchdog:raw`
- `npm run watchdog:content`
- `npm run watchdog:communications`
- `npm run watchdog:ui`
- `npm run watchdog:visual`
- `npm run watchdog:all`

## Reports From Install Verification

- Goal/general audit:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-audit.md`
- Link audit:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-link-audit.md`
- Action audit:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-action-audit.md`
- Security route audit:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-security-routes.md`
- Raw-intake drift audit:
  `ops/watchdog-audits/2026-06-17T12-09-raw-intake-drift.md`
- Content routing audit:
  `ops/watchdog-audits/2026-06-17T12-09-content-routing.md`
- Communications alert audit:
  `ops/watchdog-audits/2026-06-17T12-09-communications-alerts.md`
- UI smoke:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-ui-smoke.md`
- Visual baseline:
  `ops/watchdog-audits/2026-06-17T12-09-watchdog-visual-baseline.md`

## Findings

The new targeted watchdogs reported zero findings after fixes to the route
registry, raw fallback pointers, and empty-icon-button detection.

The general audit still reports seven older queue/proof hygiene findings:
stale ledger rows, old local-verified prompt groups, checked task rows with
weak proof wording, older local verification wording, external blockers that
need clearer Pending/Decision wording, open task rows without source pointers,
and older unmapped prompt sources. These pre-date this hardening install and
are not new regressions.

## Repair Loop

`src/lib/bna/goal-memory.js` now includes repair-task creation helpers that
can convert watchdog findings into stable `WATCH-*` / task records with goal,
source, severity, evidence, recommended fix, and owner metadata.

## Deployment Proof

- Railway deployment:
  `a2a5bf56-4661-4063-8ead-e1c66010ac9e`.
- Live app smoke:
  `ops/live-smokes/2026-06-17T12-03-49-136Z-live-app-smoke.md`.
- Public privacy smoke:
  `ops/live-smokes/2026-06-17T12-04-00-461Z-public-route-privacy-smoke.md`.
- Operations helper smoke:
  `ops/live-smokes/2026-06-17T12-03-48-493Z-operations-helper-live-smoke.md`.

## Guardrails

The watchdog install and verification did not send messages, publish content,
charge cards, write DNS, grant accounts, copy credentials, or apply live DB
migrations.
