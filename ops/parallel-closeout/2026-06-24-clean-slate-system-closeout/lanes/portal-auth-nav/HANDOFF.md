# Lane Handoff - portal-auth-nav

| Field | Value |
|---|---|
| Branch | `codex/closeout-portal-auth-nav-20260624` |
| Base SHA | `161f8623c50d7ef226066d101bfa58c28aff2346` |
| Control source | `codex/clean-slate-integration-20260624` `CONTROL.json` |
| Status | Done locally; safe to merge |
| Deployment | Not performed |
| External writes | None |

## Objective

Close unified login, safe portal navigation, and Rabbi Scheller workspace
navigation from the clean app base while preserving these ownership semantics:

- Rabbi Eli Scheller is the provider owner/admin for
  `rabbi_sheller_provider`.
- Shloimie is setup/support workspace admin for
  `rabbi_sheller_provider`, not silently made provider owner.
- Shloimie's BNA super-admin identity stays separate from any provider
  workspace membership.
- Provider context never exposes BNA super-admin modules merely because the
  same person also has a platform role.

## Result

The app base already carried the unified portal-login and Rabbi workspace work
from the reconciled PR #15 path. This lane verified it end to end with
contract tests, route-map generation, three-viewport local browser smokes,
watchdogs, secret audit, and diff check.

The only app-facing repair made in this lane was adding
`/one-time-email-review.html` to `ops/route-registry.json` so the provider
review topbar link is auditable and the link watchdog has 0 findings.

Generated artifacts were refreshed:

- One Time action coverage: ok, 40 controls.
- Universal action parity: ok, 26 visible controls and 141 registry rows.
- Rabbi Scheller route map: 740 Express routes.
- Portal chooser, provider navigation, provider API Usage, and Operations
  Rabbi workspace local smoke reports.

## Exact Internal Links

- Provider directory:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=directory`
- Rabbi dashboard:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=dashboard`
- Students / members:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=students`
- Classes / schedule:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=schedule`
- Questions:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=questions`
- Integrations:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=integrations&section=readiness`
- API usage:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=api_usage&section=provider`
- Settings:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=provider_portal`
- Support:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=internal_dialogue&section=support`
- Provider portal:
  `/provider`
- Provider API Usage preview:
  `/provider?api_usage_preview=1&section=api_usage`
- Start view-as Rabbi API:
  `/api/bna/one-time/view-as-rabbi/start`
- Exit view-as Rabbi:
  provider banner posts to `/api/bna/one-time/view-as-rabbi/end`, then returns
  to
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`.

## Evidence

See `TESTS.md` for full command output summary.

Key evidence:

- Contract suite: 33/33 pass.
- Expanded portal/Rabbi/action suite: 77/77 pass.
- Route/review regression suite: 12/12 pass.
- Local browser smokes:
  - `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/report.md`
  - `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/report.md`
  - `ops/playwright-smokes/2026-06-23-rabbi-scheller-operations-navigation-local/report.md`
  - `ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/report.md`
- Watchdogs:
  - `ops/watchdog-audits/2026-06-24T12-50-watchdog-link-audit.md`
  - `ops/watchdog-audits/2026-06-24T12-50-watchdog-action-audit.md`
  - `ops/watchdog-audits/2026-06-24T12-51-watchdog-security-routes.md`

## Notes For Final Integrator

- This lane does not edit `AGENTS.md`, `MEMORY.md`, `TASKS.md`,
  `ops/execution-runs/latest.json`, `ops/agent-task-ledger.jsonl`, or
  `ops/agent-changelog.md`.
- The execution-run CLI fails on this lane branch because the branch is based
  on the app base SHA before the final control-run pointer commit. Run those
  commands from the control branch or integrated release branch.
- No live authenticated graph walk was performed. Use approved demo identities
  after final integration and release approval.
