# Baseline

Preflight:

- Branch: `codex/closeout-vimeo-media-20260624`
- HEAD: `6f57d91037d559faa171c71565e6403e62126407`
- Worktree: dirty before this run with many unrelated prior/user changes.
- Previous active run:
  `ops/execution-runs/2026-06-29-rabbi-onetime-comms-crm-email-import`
  validated with 23 done / 5 blocked and no unblocked executable batch.
- `npm run pqc:all` did not complete because
  `npm run watchdog:protocol-drift` found protocol drift in the previous
  Resend handoff file.

Source files inspected so far:

- `BNA-START-HERE.md`
- `AGENTS.md`
- `docs/BNA-RAMBLE-TO-DONE.md`
- `docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md`
- `docs/RAMBLE-ROUTER.md`
- `docs/PACKET-DAG.md`
- `memory-topics/brand-kits.md`
- `memory-topics/provider-pipelines.md`
- `memory-topics/email-resend.md`
- `config/brands/one-time.json`
- `ops/provider-config-readbacks/2026-07-01-resend-smoke-readback.md`
- `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/00-control-tower.md`
- `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/01-current-state-visual-audit.md`
- `tests/rabbi-checkout-access.test.js`
- `tests/one-time-external-user-portal.test.js`
- `tests/one-time-community-moderation-workflow.test.js`
- route/API excerpts in `server.js`, `public/rabbi.html`,
  `public/one-time/index.html`, `public/rabbi-member.html`,
  `public/js/rabbi-launch.js`, and `public/js/rabbi-member.js`

Missing exact paths from the packet:

- `config/service-provider-sites/one-time.json`
- `ops/one-time-mishnah/operator-ui-review/ROUTE-MAP.md`
- `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`
- `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/recommended-child-packets.md`

Current route baseline from inspected route declarations:

- `/one-time`, `/one-time/mishnayos`, `/one-time/us`, `/one-time/uk`,
  `/one-time/israel`, and `/one-time/interest` serve
  `public/one-time/index.html`.
- `/rabbi`, `/rabbi-preview`, and `/one-time-mishnayos` serve
  `public/rabbi.html`.
- `/rabbi-member`, `/rabbi/member`, and `/one-time/member-login` serve
  `public/rabbi-member.html`.
- `/api/one-time/interest` exists as public interest capture.
- `/api/rabbi/member/*` routes exist for magic login/session/library/live
  sessions.
