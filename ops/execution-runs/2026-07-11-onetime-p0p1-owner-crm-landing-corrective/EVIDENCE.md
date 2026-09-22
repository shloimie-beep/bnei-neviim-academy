# Evidence

Source and protocol artifacts:

- Raw intake: `raw-input/RAW-20260711-001-onetime-p0p1-owner-crm-landing-corrective.md`
- Register: `tasks-pending/2026-07-11-onetime-p0p1-owner-crm-landing-corrective.md`
- PQC packet: `tasks-pending/2026-07-11-onetime-p0p1-owner-crm-landing-corrective.product-quality.json`
- Control tower: `ops/prompt-packets/2026-07-11-onetime-p0p1-corrective/00-control-tower.md`
- Current-state audit: `ops/prompt-packets/2026-07-11-onetime-p0p1-corrective/01-current-state-visual-audit.md`
- Surface map: `ops/surface-maps/2026-07-11-onetime-p0p1-corrective-surface-map.md`

Local proof:

- Corrective branch: `codex/onetime-p0p1-corrective-20260711`
- Implementation commit: `e49bd3b00291818bb44e4a483fdd69b35f599c28`
- Current PR head / evidence commit: `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- Draft PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- Operations artifact gate: `npm run operations:build`, `npm run operations:check-generated`, `npm run operations:check-canonical`
- Focused tests: `42` passing One Time/CRM/owner-shell tests
- Public smoke report: `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/public-onboarding-smoke.md`
- Operations owner smoke report: `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/operations-ui-smoke/report.md`
- CRM workbench smoke report: `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`
- Provider CRM layout smoke report: `ops/ui-audits/2026-07-09-onetime-provider-crm-layout-local/report.md`
- Action watchdog: `ops/watchdog-audits/2026-07-11T21-18-watchdog-action-audit.md`
- Product-quality drift watchdog: `ops/watchdog-audits/2026-07-11-product-quality-drift.md`
- PQC validation: `ops/product-quality-compiler/validation/latest-product-quality-validation.md`

Screenshot evidence:

- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-landing-1440.png`
- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-landing-390.png`
- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-robot-launcher-390.png`
- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-onboarding-family-390.png`
- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/one-time-onboarding-school-success-1440.png`
- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/operations-ui-smoke/desktop.png`
- `ops/ui-audits/2026-07-11-onetime-p0p1-corrective/operations-ui-smoke/mobile-content.png`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/desktop-1440-crm-workbench.png`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/mobile-390-crm-workbench.png`

Pending:

- Review approval, production deploy, and live smoke.
