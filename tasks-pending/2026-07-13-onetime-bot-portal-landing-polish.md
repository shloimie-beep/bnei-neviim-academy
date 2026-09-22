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
- `config/service-provider-bots/one-time.json` version `2026-07-13-v2` now carries the explicit operator correction: "We are not giving portal access yet."
- The bot knowledge now has an explicit access policy: portal, member area, library, parent-login, and student-login access are not currently being opened or promised.
- `src/lib/bna/provider-lead-bot.js` now treats trial/pricing/access facts as unpublished unless the profile explicitly publishes them.
- Program, portal, trial, and price replies route to safe wording and do not state the old `30-day` / `$67` bot claims.

Verification:

- `node --test tests\service-provider-lead-bot.test.js` passed as part of the focused suite.
- `node --test tests/service-provider-lead-bot.test.js tests/one-time-focused-landing.test.js tests/one-time-direct-signup-page.test.js` passed `14/14` after the v2 operator-correction wording and signup-header polish.
- `npm run pqc:validate -- tasks-pending/2026-07-13-onetime-bot-portal-landing-polish.product-quality.json` passed.
- `npm run secrets:audit` passed with `0` tracked secret-risk files.

Remaining:

- Deployed and live-read back at SHA `3712308731910a6e77fb9a18ce18b57ae35f22dd`.
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
- Focused v2 tests passed `14/14`, including landing/header polish, signup Family/School classification, and bot no-portal wording.
- `node scripts\smoke-onetime-landing-whatsapp-local.mjs` passed and captured 1440, 1024, 768, 430, and 390 screenshots.
- Smoke report includes hero CTA and WhatsApp launcher bounding boxes proving no overlap.
- `npm run watchdog:actions` passed with `finding_count=0`.
- `npm run watchdog:protocol-drift` passed with `Findings: 0`.
- `npm run bna:run:validate` passed and confirms the broader addendum still has work remaining.
- `git diff --check` passed with line-ending warnings only.

Remaining:

- Deployed and live-verified at SHA `3712308731910a6e77fb9a18ce18b57ae35f22dd`.
- Full shared CRM/communication-agent launch continues under the active execution run.

Deployment proof:

- Commit/push: `3712308731910a6e77fb9a18ce18b57ae35f22dd`.
- BNA Railway deployment `77191e2f-0aaf-4fde-ae2c-cf69ce299af8` reached `SUCCESS`.
- One Time Railway deployment `38d75556-5a94-42d3-b8b3-65a5a3290fe7` reached `SUCCESS`.
- BNA and One Time `/api/deploy-info` both returned the deployed SHA.
- Live marker checks confirmed the deployed One Time landing has `--yellow: #ede518`, no header box shadow, lifted mobile hero CTA, and no old black CTA inset shadow.
- Live marker checks confirmed the deployed signup header uses `/images/one-time/brand/onetimelogo.webp` and `One Time Mishnayos<small>Sign up</small>`.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 3712308731910a6e77fb9a18ce18b57ae35f22dd` passed.
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` passed; report: `ops/live-smokes/2026-07-13T00-26-05-640Z-rabbi-onetime-landing-smoke.md`.
