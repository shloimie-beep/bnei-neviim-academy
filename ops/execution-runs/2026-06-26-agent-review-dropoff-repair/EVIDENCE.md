# Evidence

## Registration

- `raw-input/RAW-20260626-001-agent-review-dropoff-repair.md`
- `tasks-pending/2026-06-26-agent-review-dropoff-repair.md`
- `ops/execution-runs/2026-06-26-agent-review-dropoff-repair/requirements.json`
- `ops/execution-runs/2026-06-26-agent-review-dropoff-repair/BASELINE.md`
- `ops/execution-runs/latest.json`
- Issue #24 prior closeout: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24#issuecomment-4802269945

## Baseline

- Current master/base SHA: `0500ce74cad7a1299a6d0fd487b1deef24ab9fb8`
- Railway deployment: `ef3df8ef-1381-4762-8c34-1f7d49167027`, status `SUCCESS`
- Live health: `status=ok`, `database=connected`

## Local Implementation

- Agent Review source changes: `server.js`, `src/lib/bna/agent-review-hub.js`, `public/agent-review.html`, `public/agent-review-session.html`, `public/agent-review-dropoff.html`, `public/operations-login.html`.
- Prompt pack: `public/agent-review-prompts/index.json` and the 11 mobile-copyable prompt Markdown files.
- Registries: `ops/action-registry.json`, `ops/route-registry.json`, `ops/action-registry/one-time-action-coverage.*`, `ops/action-registry/universal-action-parity.*`.
- Tests: `tests/agent-review-hub.test.js`, `tests/public-helper-agent-review-guardrails.test.js`, `tests/app-select-dropdown.test.js`, `tests/operations-pwa-login.test.js`, `tests/rabbi-scheller-auth-navigation-contract.test.js`.
- Local gate logs: `ops/execution-runs/2026-06-26-agent-review-dropoff-repair/evidence/*.log`.
- Watchdog reports: `ops/watchdog-audits/2026-06-26T06-38-watchdog-action-audit.md`, `ops/watchdog-audits/2026-06-26T06-38-watchdog-link-audit.md`, `ops/watchdog-audits/2026-06-26T06-38-watchdog-security-routes.md`.
