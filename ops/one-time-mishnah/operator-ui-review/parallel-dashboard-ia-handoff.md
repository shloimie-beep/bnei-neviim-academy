# Parallel Dashboard IA Handoff

## Branch / Worktree

- Branch: `codex/parallel-onetime-dashboard-ia-20260626`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-26\parallel-onetime-dashboard-ia`
- Base commit: `ab6741bd5ca3d7d9457e292f8a58165d58a65f67`
- Lane: local-only parallel One Time Rabbi Dashboard IA Config

## Files Changed

- `src/platform/instances/one-time-rabbi-dashboard-ia.js`
- `tests/one-time-rabbi-dashboard-ia.test.js`
- `ops/one-time-mishnah/operator-ui-review/parallel-dashboard-ia-handoff.md`

No changes were made to `public/operations.html`, `server.js`,
`ops/action-registry.json`, or `ops/route-registry.json`.

## Exact Exported Contract

New pure config module:

`src/platform/instances/one-time-rabbi-dashboard-ia.js`

Exports:

- `ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY`
- `ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY`
- `ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES`
- `ONE_TIME_RABBI_DASHBOARD_SECTION_SUBSECTION_MAP`
- `ONE_TIME_RABBI_DASHBOARD_REVIEW_LINKS`
- `ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES`
- `ONE_TIME_RABBI_DASHBOARD_TOP_RAIL_MODEL`
- `ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES`
- `ONE_TIME_RABBI_DASHBOARD_STATUS_CHIP_MODEL`
- `ONE_TIME_RABBI_DASHBOARD_ACCEPTANCE_ROUTES`
- `ONE_TIME_RABBI_DASHBOARD_IA`

Workspace/project constants:

- workspace: `rabbi_sheller_provider`
- project: `one_time_mishnah_class`

Approved main modules:

1. `Overview / Package Status`
2. `Members / CRM`
3. `Classes & Content`
4. `Communications`
5. `Automations`
6. `Payments & Access`
7. `Tasks & Decisions`
8. `Settings / Setup`

Internal modules:

- Demoted behind `Platform Support`: `agents`, `api_usage`, `watchdog`,
  `pipelines`, `internal_dialogue`
- Hidden from Rabbi dashboard: `raw_implementation_handoffs`,
  `tasks_pending_requirement_registers`

Status chips:

- `Review mode`
- `No-send`
- `No-charge`
- `No external write`

Acceptance/review routes:

- `/one-time`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`
- `/provider.html?review=one-time`
- `/parent.html?review=one-time`
- `/student.html?review=one-time`
- `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
- `/one-time-email-review.html`

## Tests Run

```powershell
node --test tests/one-time-rabbi-dashboard-ia.test.js
```

Result: PASS, 6/6 tests.

```powershell
node --test tests/one-time-shared-review-branding.test.js
```

Result: PASS, 5/5 tests.

## Integration Instructions For Final Codex Window

Use `ONE_TIME_RABBI_DASHBOARD_IA` as the source contract when wiring
`public/operations.html`.

- Use `main_modules` for the Rabbi-facing dashboard module list.
- Use `section_subsection_map` and `top_rail_model` for the top rail per
  selected module.
- Use each module `operations_view`, plus each subsection `source_view` and
  `source_section`, to map the clean IA onto existing Operations views without
  broad UI rewrites.
- Keep `internal_modules.demoted` behind a `Platform Support` affordance.
- Do not render `internal_modules.hidden` in the Rabbi dashboard.
- Render `status_chip_model` visibly in review mode.
- Use `mobile_label_rules.module_short_labels` and
  `mobile_label_rules.status_chip_short_labels` below the mobile breakpoint.
- Use `review_links` and `acceptance_routes` exactly; they are tested against
  `ops/one-time-mishnah/operator-ui-review/ROUTE-MAP.md`.
- Preserve the route scope rule: only the Operations workspace route is private
  Operations; public/customer and parent/student/provider/classroom/email
  review routes must not expose private Operations data.

## Local-Only Confirmation

- No push was run.
- No merge was run.
- No deploy was run.
- No production mutation or external write was performed.
- No send, charge, Zoom/Vimeo action, DNS change, Railway action, or CRM write
  was performed.
