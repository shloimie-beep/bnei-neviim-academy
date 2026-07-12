# REQ-20260712-007 Landing And Robot Matrix

Generated: 2026-07-12T11:03:00+03:00

Scope: local/no-send proof for the One Time public landing and Robot launcher
on PR #129. This matrix does not claim deployment, merge, live smoke, external
send, payment/access mutation, provider mutation, or production data mutation.

| Requirement ID | Original source statement | Code/files | Test | Screenshot/evidence | PR/commit | Deployment/live proof |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-20260712-007 | Header, hero, CTA, Rosh Hashanah band, Rabbi/press/outcomes/benefits/how-it-works/audience copy must match the approved One Time hierarchy and remove invented placeholder content. | `public/one-time/index.html`; `tests/one-time-focused-landing.test.js` | `node --test tests/one-time-focused-landing.test.js`; `npm run test:onetime:focused` | `screenshots/landing-20260712-local/landing-1440.png`; `landing-768.png`; `landing-430.png`; `landing-390.png` | PR #129, local implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c` | Not run. Release authorization and exact deployed SHA live smoke are required. |
| REQ-20260712-007 | Teaching-across-the-world slider may use only verified approved images and must hide cleanly when assets are unavailable. | `public/one-time/index.html`; `config/service-provider-sites/one-time.json`; `ops/action-registry.json`; `tests/one-time-focused-landing.test.js` | Focused landing test asserts no placeholder teaching copy and `assets.teaching_gallery=[]`; action registry marks carousel actions `hidden_until_verified_assets`. | Same landing screenshots; no public teaching-placeholder section is rendered. | PR #129, local implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c` | Not run. Release authorization and exact deployed SHA live smoke are required. |
| REQ-20260712-007 | Robot must be the floating WhatsApp assistant, preserve the full silhouette with contained image rendering, be recognizable, optimized, and accessible. | `public/js/bna-bot-widget.js`; `public/assets/one-time/robot/robot-scheller-whatsapp.png`; `tests/one-time-focused-landing.test.js` | Focused landing test asserts optimized PNG below 500 KB, contained background, 84px desktop/tablet launcher, 76px mobile launcher, and 72/66px avatar sizing. | `robot-launcher-1440.png`; `robot-launcher-768.png`; `robot-launcher-430.png`; `robot-launcher-390.png`; Playwright readback recorded 84x84 at 1440/768 and 76x76 at 430/390 with accessible label `Open Rabbi Scheller’s WhatsApp assistant.` | PR #129, local implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c` | Not run. Release authorization and exact deployed SHA live smoke are required. |
| REQ-20260712-007 | Config must match actual live asset paths and navigation. | `config/service-provider-sites/one-time.json`; `public/one-time/index.html`; `tests/one-time-focused-landing.test.js` | Focused landing test verifies `robot_scheller` path and empty unavailable teaching gallery. | Config diff plus local route screenshots. | PR #129, local implementation commit `11c956f141dce0f46883e7549f56f31045c0b07c` | Not run. Release authorization and exact deployed SHA live smoke are required. |

## Local Gate Results

- `node --test tests/one-time-focused-landing.test.js` PASS: 2/2.
- `npm run test:onetime:focused` PASS: 57/57.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS.
- `npm run secrets:audit` PASS.
- `npm run bna:run:validate` PASS before the implementation commit; after the
  commit, `npm run bna:run:next` reported only the run metadata `git_refs`
  current-head field was stale relative to the new PR head.

## Explicit Blocker

REQ-20260712-007 remains `needs_operator_decision`: merge/deploy authorization
is required before deployed screenshots/readback and exact deployed SHA live
smoke can be recorded.
