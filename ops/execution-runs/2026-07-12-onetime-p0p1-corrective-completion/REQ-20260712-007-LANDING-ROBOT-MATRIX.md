# REQ-20260712-007 Landing And Robot Matrix

Generated: `2026-07-12T11:03:00+03:00`
Release update: `2026-07-12T13:43:00+03:00`

Scope: One Time public landing and Robot launcher proof for PR #129. Local
responsive screenshots are recorded here; deployment and exact-SHA live smoke
are recorded below. No external send, payment/access mutation, provider
mutation, historical import, DNS/account mutation, credential mutation, or
production data import was performed.

| Requirement | Code/files | Test | Screenshot/evidence | PR/commit | Deployment/live proof |
| --- | --- | --- | --- | --- | --- |
| Approved landing hierarchy, copy, header, hero, CTA, Rosh Hashanah band, Rabbi/press/outcomes/benefits/how-it-works/audience sections, and no invented placeholder content. | `public/one-time/index.html`; `tests/one-time-focused-landing.test.js` | `node --test tests/one-time-focused-landing.test.js`; `npm run test:onetime:focused` | `screenshots/landing-20260712-local/landing-1440.png`; `landing-768.png`; `landing-430.png`; `landing-390.png` | PR #129, implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c`, merged PR head `598f66238f68293575d5f9e6195bb6b032ebb156` | Live smoke passed at https://join.onetimeonetime.com with deployed SHA `4a6951643eebb341dcc495d5f306417e1621a07a`. |
| Teaching slider must use only verified approved images and hide cleanly when assets are unavailable. | `public/one-time/index.html`; `config/service-provider-sites/one-time.json`; `ops/action-registry.json`; `tests/one-time-focused-landing.test.js` | Focused landing test asserts no placeholder teaching copy and `assets.teaching_gallery=[]`; action registry marks carousel actions `hidden_until_verified_assets`. | Same landing screenshots; no public teaching-placeholder section is rendered. | PR #129, implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c`, merged PR head `598f66238f68293575d5f9e6195bb6b032ebb156` | Live smoke passed at deployed SHA `4a6951643eebb341dcc495d5f306417e1621a07a`. |
| Robot must be the floating WhatsApp assistant, preserve the full silhouette, be recognizable, optimized, and accessible. | `public/js/bna-bot-widget.js`; `public/assets/one-time/robot/robot-scheller-whatsapp.png`; `tests/one-time-focused-landing.test.js` | Focused landing test asserts optimized PNG below 500 KB, contained rendering, 84px desktop/tablet launcher, 76px mobile launcher, and 72/66px avatar sizing. | `robot-launcher-1440.png`; `robot-launcher-768.png`; `robot-launcher-430.png`; `robot-launcher-390.png`; Playwright readback recorded 84x84 at 1440/768 and 76x76 at 430/390 with accessible label `Open Rabbi Scheller's WhatsApp assistant.` | PR #129, implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c`, merged PR head `598f66238f68293575d5f9e6195bb6b032ebb156` | Live smoke passed at deployed SHA `4a6951643eebb341dcc495d5f306417e1621a07a`; broader final matrix still needs live Robot screenshot attachment. |
| Config must match actual live asset paths and navigation. | `config/service-provider-sites/one-time.json`; `public/one-time/index.html`; `tests/one-time-focused-landing.test.js` | Focused landing test verifies `robot_scheller` path and empty unavailable teaching gallery. | Config diff plus local route screenshots. | PR #129, implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c`, merged PR head `598f66238f68293575d5f9e6195bb6b032ebb156` | Live smoke and `/api/deploy-info` readback passed at deployed SHA `4a6951643eebb341dcc495d5f306417e1621a07a`. |

## Local Gate Results

- `node --test tests/one-time-focused-landing.test.js` PASS: 2/2.
- `npm run test:onetime:focused` PASS: 57/57 for the landing slice.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS.
- `npm run secrets:audit` PASS.

## Release Proof

- PR #129 merged at `2026-07-12T10:26:51Z`.
- Merge commit: `8e22e5d79844e994e94c4f3ed92ac51422649b8c`.
- Deployed commit: `4a6951643eebb341dcc495d5f306417e1621a07a`.
- Railway deployment: `0ff5498b-1116-479e-87ca-afe8d2fc6f7b`.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 4a6951643eebb341dcc495d5f306417e1621a07a` PASS.
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` PASS.

## Remaining Blocker

`REQ-20260712-007` remains open as `needs_verification` only because the
broader final screenshot/matrix request still needs non-landing live surfaces.
Release authorization, merge, deployment, and exact deployed SHA live smoke are
recorded.
