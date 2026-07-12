# Evidence

- `ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.md` - direct Codex proof replacing two operator Agent Mode prompt runs.
- `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` - Rabbi Telegram no-send readiness.
- `ops/live-smokes/2026-07-12T20-03-41-435Z-rabbi-telegram-live-smoke.md` - approved live Rabbi Telegram send evidence; ignored by default and must be force-added if preserved in Git.
- `ops/production-readiness/latest-production-readiness-snapshot.md` - latest readiness snapshot.
- `ops/production-readiness/latest-production-unblocker.md` - current external setup blocker packet.
- BNA live deploy-info readback - `https://bneineviimacademy.org/api/deploy-info` returned `commit_sha=966ded41b517433533f24370949426cfd1200213`.
- One Time live deploy-info readback - `https://join.onetimeonetime.com/api/deploy-info` returned `commit_sha=966ded41b517433533f24370949426cfd1200213`.
- One Time signup no-write browser proof - Playwright clicked `Family` and `School` on `https://join.onetimeonetime.com/one-time/signup`, intercepted `/api/one-time/interest`, and verified `metadata.signup_as`, `audience_type`, `family_school_classification`, and `source_landing_page` without production writes.
- One Time signup API dry-run proof - direct live `POST /api/one-time/interest?dry_run=true` normalized both `Family` and `School` to the expected `signup_as` values without creating records.
- `ops/live-smokes/2026-07-12T20-48-11-384Z-crm-identity-isolation-live-smoke.md` - live database transaction-rollback proof for `REQ-20260712-305`; same synthetic email and phone coexist across BNA and One Time workspaces, workspace-filtered lookups return one row each, same-workspace duplicate is blocked, and rollback leaves zero synthetic contacts/identities.
- `tasks-pending/2026-07-12-shared-crm-workbench-slice.product-quality.json` - bounded Product Quality Compiler packet for the shared CRM workbench slice.
- `src/lib/bna/crm/contact-service.js` - canonical CRM contact service wrapper for contacts list/timeline DTO envelopes used by Operations routes.
- `public/js/crm/` and `public/css/crm-core.css` - shared browser CRM modules and core styling loaded by the Operations shell.
- `tests/crm-contact-service.test.js` and `tests/shared-crm-workbench-contract.test.js` - local contract proof for the canonical contact service and shared browser CRM module wiring.
- `ops/watchdog-audits/2026-07-12-product-quality-drift.md` - protocol drift watchdog report with zero findings for the shared CRM slice.
