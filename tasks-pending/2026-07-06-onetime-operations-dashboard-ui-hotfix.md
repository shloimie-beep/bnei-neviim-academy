# One Time Operations Dashboard UI Hotfix

Raw source: `RAW-20260706-950`  
Requirement: `REQ-20260706-950`  
Workspace: `rabbi_sheller_provider`  
Project: `one_time_mishnah_class`  
Status: Done; merged, deployed, and live verified

## Requirement

The live route
`/operations?view=dashboard&section=overview&workspace=rabbi_sheller_provider`
must open into a Rabbi / One Time scoped dashboard experience. It must not show
the generic Daily Command Center, Codex Queue, Student accountability, Tablet
Access, or the full Super Admin / School / Family workspace directory.

## Implementation Targets

- `public/operations.html`
- `tests/one-time-operations-ui-smoke.test.js`
- `tests/one-time-rabbi-ui-final-local-smoke.test.js`

## Acceptance Criteria

- Dashboard route normalizes to the One Time provider overview.
- One Time sidebar shows a scoped current-workspace summary instead of the full
  workspace directory.
- One Time nav includes Studio and uses full labels:
  Communications, Automations, Integrations, and Workspace Setup.
- One Time topbar chips are scoped to Members, Classes, Studio, and Setup.
- Browser smoke confirms the exact dashboard URL does not render generic
  platform/student/internal dashboard text.

## Evidence

- PASS `node --test tests/operations-shell-navigation-contract.test.js tests/service-provider-studio-operations-ui.test.js`
- PASS `NODE_PATH=C:\Users\User\BNA v2.0\node_modules node --test tests/one-time-operations-ui-smoke.test.js`
- PASS `NODE_PATH=C:\Users\User\BNA v2.0\node_modules node --test tests/one-time-rabbi-ui-final-local-smoke.test.js`
- PASS `npm run watchdog:actions` with `finding_count=0`.
- PASS `git diff --check` with line-ending warnings only.
- BLOCKED pre-existing/non-hotfix lane: `npm run watchdog:protocol-drift`
  reports 77 findings against
  `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/`, not against
  this dashboard hotfix. Report:
  `ops/watchdog-audits/2026-07-06-product-quality-drift.md`.
- PR #118 merged to `master` at
  `f0b7cc0a80f35a79cbcd843844fe90960152938b`.
- Railway production auto-deploy
  `96961b6f-1ae6-467d-89ae-2a9a5c088753` reached `SUCCESS` on service
  `skillful-motivation`.
- PASS `npm run railway:doctor` against BNA project/service
  `skillful-motivation`.
- PASS `npm run app:smoke`.
- PASS `npm run app:smoke:rabbi-onetime-landing`.
- PASS exact authenticated browser smoke for
  `/operations?view=dashboard&section=overview&workspace=rabbi_sheller_provider`.
  Report:
  `ops/live-smokes/2026-07-06T14-10-22-946Z-one-time-operations-dashboard-ui-live-smoke.md`.
