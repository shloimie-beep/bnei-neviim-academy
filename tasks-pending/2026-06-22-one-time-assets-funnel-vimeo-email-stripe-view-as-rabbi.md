# One Time Assets, Funnel, Vimeo, Email, Stripe, View as Rabbi

Status: implemented locally / focused tests passing / deployment blocked pending operator approvals.

Raw source: `raw-input/RAW-20260622-003-one-time-assets-funnel-vimeo-email-stripe-view-as-rabbi.md`

Raw source SHA-256: `72657ACC740C838C6356092A99BEFAC2F07BECBFFE8A6E78ECEA354DD0BC5C33`

Isolated branch: `codex/one-time-assets-vimeo-stripe-email-view-as-rabbi-20260622`

Base SHA: `04d93788c48f729001f99c54a67f89ef42cfbe79`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260622-003 | Done | Preserve prompt, inspect PR/run/branch state, and isolate work away from `codex/agent-control-center-20260619`. | Raw source file; isolated worktree branch; base SHA above. |
| REQ-20260622-004 | Done | Inventory, deduplicate, classify, organize, and rank downloaded One Time/Rabbi Scheller media without deleting or moving Downloads originals. | `ops/one-time-mishnah/asset-intake/2026-06-22/`; private library at `C:\Users\User\Documents\BNA-Assets\One-Time`. |
| REQ-20260622-005 | Done | Replace complicated public copy with a simple worldwide Mishnayos signup funnel and public Vimeo hero stream. | `public/one-time/index.html`; `/api/one-time/campaign`; tests `one-time-focused-landing` and `one-time-product-system`. |
| REQ-20260622-006 | Done | Make the member/classroom lesson play in-site instead of sending students to raw Vimeo/CAPTCHA page. | `public/one-time-classroom.html`; `src/platform/instances/one-time-shared-review-data.js`; test `one-time-shared-review-branding`. |
| REQ-20260622-007 | Partially done / blocked for live writes | Complete safe readiness work for email and Stripe using existing approved environment, without sending or charging. | `ops/one-time-mishnah/launch-readiness-2026-06-22.md`; service config copy; no-send/no-checkout guards. |
| REQ-20260622-008 | Done locally / requires admin session for live exercise | Add secure platform-super-admin read-only "View as Rabbi" preview. | `server.js`; `public/provider.html`; route/action registries; test `campaign API and view-as Rabbi preview`. |
| REQ-20260622-009 | Done | Align backend/public contracts and registries with the One Time slice. | `ops/route-registry.json`; `ops/action-registry.json`; focused tests. |
| REQ-20260622-010 | Done locally / commit-deploy pending approval | Verify and show scoped diff. Commit/push/deploy only isolated branch work after operator review. | Focused suite, full `npm test`, watchdogs, secret audit, and diff check completed; deployment still blocked by operator decisions. |

## Operator Decisions Still Needed

| Decision | Status | Blocks |
| --- | --- | --- |
| `DEC-20260622-ONE-TIME-CAMPAIGN-DEADLINE` | Needed | Exact `ONE_TIME_CAMPAIGN_START_AT`, `ONE_TIME_CAMPAIGN_DEADLINE_AT`, and launch timezone for the non-resetting public countdown. |
| `DEC-20260622-ONE-TIME-EMAIL-SENDER` | Needed | Live Resend sender/domain choice, approved audience, suppression policy, and explicit send approval. |
| `DEC-20260622-ONE-TIME-STRIPE-LIVE-POLICY` | Needed | Live Stripe account, product/price IDs, tax/refund policy, trial terms, and explicit checkout/charge approval. |
| `DEC-20260622-ONE-TIME-ASSET-RIGHTS` | Needed | Publication rights/consent for newly downloaded crowd, location, student/family, and publication/logo assets. |
| `DEC-20260622-ONE-TIME-DEPLOY` | Needed | Approval to deploy this isolated branch to the intended Railway service and run live smokes. |

## Guardrails

No live email, WhatsApp send, charge, checkout session, access grant, Zoom write, Vimeo upload, DNS change, Railway variable mutation, external CRM/GHL write, raw private export, or secret exposure was performed.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js` (15/15)
- PASS `npm test` (1044/1044)
- PASS `npm run watchdog:actions`
- PASS `npm run watchdog:security`
- PASS `node scripts\audit-secrets.mjs` (4040 tracked paths, 0 tracked secret-risk files)
- PASS `git diff --check` (Windows line-ending warnings only)
- PASS local `ONE_TIME_REVIEW_ONLY_NO_DB=1` server readback on `127.0.0.1:8099`: `/one-time` 200 with public Vimeo hero and no TEST review link, `/api/one-time/campaign` 200 with pending-deadline decision, `/api/one-time-review/classroom` 200 with lesson Vimeo embed.
- KNOWN `npm run bna:run:validate` failed because this is an isolated branch while the active run metadata expects `codex/agent-control-center-20260619`, and the stripped worktree lacks older historical live-smoke evidence paths.
