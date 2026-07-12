# One Time bot portal knowledge and landing polish

- Raw input: `raw-input/RAW-20260713-001-onetime-bot-portal-landing-polish.md`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Status: `deployed_verified`

## Requirements

### REQ-20260713-001 - Bot must not claim portal access is available yet

Status: `deployed_verified`

Implemented:

- `config/service-provider-bots/one-time.json` now marks One Time bot offer terms as `not_published_for_bot`.
- The bot knowledge now has an explicit access policy: portal, member area, library, parent-login, and student-login access are not currently being opened or promised.
- `src/lib/bna/provider-lead-bot.js` now treats trial/pricing/access facts as unpublished unless the profile explicitly publishes them.
- Program, portal, trial, and price replies route to safe wording and do not state the old `30-day` / `$67` bot claims.

Verification:

- `node --test tests\service-provider-lead-bot.test.js` passed as part of the focused suite.
- `npm run pqc:validate -- tasks-pending/2026-07-13-onetime-bot-portal-landing-polish.product-quality.json` passed.
- `npm run secrets:audit` passed with `0` tracked secret-risk files.

Remaining:

- Deployed and live-read back at SHA `301b408b36fa982d4562d06f30de56758cd0e168`.
- Full channel-independent communication-agent model, shared WhatsApp/email knowledge bundle, and Agents UI remain governed by the larger addendum.

### REQ-20260713-002 - One Time public header/button/mobile CTA polish

Status: `deployed_verified`

Implemented:

- `public/one-time/index.html` public header now uses the member-section-style One Time lockup, compact black/yellow topbar treatment, and desktop public section navigation.
- Yellow CTA/button shadows no longer use the heavy black slab shadow.
- Landing section and final CTA spacing are slightly tighter.
- Mobile hero CTA is moved up and verified not to overlap the bottom browser/launcher zone.
- `ops/action-registry.json` registers `ACTION-ONETIME-PUBLIC-SECTION-NAV`.

Verification:

- Focused static tests passed `33/33`.
- `node scripts\smoke-onetime-landing-whatsapp-local.mjs` passed and captured 1440, 1024, 768, 430, and 390 screenshots.
- Smoke report includes hero CTA and WhatsApp launcher bounding boxes proving no overlap.
- `npm run watchdog:actions` passed with `finding_count=0`.
- `npm run watchdog:protocol-drift` passed with `Findings: 0`.
- `npm run bna:run:validate` passed and confirms the broader addendum still has work remaining.
- `git diff --check` passed with line-ending warnings only.

Remaining:

- Deployed and live-verified at SHA `301b408b36fa982d4562d06f30de56758cd0e168`.
- Full shared CRM/communication-agent launch continues under the active execution run.

Deployment proof:

- Commit/push: `301b408b36fa982d4562d06f30de56758cd0e168`.
- BNA Railway deployment `640fc22a-5172-4729-ab92-7882426a13e0` reached `SUCCESS`.
- One Time Railway deployment `2c2c7631-a004-4019-bf3f-328cd61cd905` reached `SUCCESS`.
- BNA and One Time `/api/deploy-info` both returned the deployed SHA.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 301b408b36fa982d4562d06f30de56758cd0e168` passed.
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` passed; report: `ops/live-smokes/2026-07-12T22-17-11-356Z-rabbi-onetime-landing-smoke.md`.
