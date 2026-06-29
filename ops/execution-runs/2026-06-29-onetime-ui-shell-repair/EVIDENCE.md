# Evidence

## Registered Evidence

- `raw-input/RAW-20260629-005-onetime-ui-shell-repair.md`
- `raw-input/RAW-20260629-005-onetime-ui-shell-repair-source.txt`
- `tasks-pending/2026-06-29-onetime-ui-shell-repair.md`
- `ops/execution-runs/2026-06-29-onetime-ui-shell-repair/requirements.json`
- `ops/execution-runs/latest.json`

## Browser Evidence

- Before report: `ops/playwright-smokes/2026-06-29-onetime-ui-shell-repair-before/report.md`
- Before data: `ops/playwright-smokes/2026-06-29-onetime-ui-shell-repair-before/report.json`
- After report: `ops/playwright-smokes/2026-06-29-onetime-ui-shell-repair-after/report.md`
- After data: `ops/playwright-smokes/2026-06-29-onetime-ui-shell-repair-after/report.json`

After screenshots include dashboard, communications, members, program, tasks, automations, integrations, reporting, and mobile dashboard/communications under `ops/playwright-smokes/2026-06-29-onetime-ui-shell-repair-after/`.

## Guardrail Evidence

- `ops/watchdog-audits/2026-06-29T14-23-watchdog-action-audit.md`
- `ops/watchdog-audits/2026-06-29T14-23-watchdog-security-routes.md`
- `ops/watchdog-audits/2026-06-29T14-23-watchdog-link-audit.md`
- `ops/action-registry/one-time-action-coverage.json`
- `ops/action-registry/universal-action-parity.json`

## Release Handoff Evidence

- Commit: `a6087dc019c3f146cab28eceafc8b7e629c59aec`
- Branch pushed: `codex/rabbi-onetime-comms-scope-release-20260629`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`
- Release gate dry run: `npm run bna:release-gate -- --json` passed with clean pushed branch and no dry-run blockers.
- Railway doctor: blocked by target guard because the target resolved to `one-time-production` without an explicit service name/id.
