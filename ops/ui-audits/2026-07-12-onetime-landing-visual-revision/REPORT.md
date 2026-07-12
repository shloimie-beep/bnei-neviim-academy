# One Time Landing Visual Revision - Local Approval Report

Generated: 2026-07-12
Raw ID: `RAW-20260712-004`
Register: `tasks-pending/2026-07-12-onetime-landing-visual-revision.md`
Branch/worktree: `codex/onetime-landing-visual-20260712` at `C:\Users\User\BNA-onetime-landing-visual-20260712`

## Status

Local implementation and verification are complete. Merge and deploy are still
blocked by `DEC-20260712-101` until Shloimie approves the desktop/mobile
screenshots.

## Requirement Matrix

| ID | Status | Evidence |
|---|---|---|
| REQ-20260712-101 | Done | Clean worktree from `origin/master`; stale commit lane not used. |
| REQ-20260712-102 | Implemented, needs visual approval | `after-landing-1440.png`, `after-landing-1024.png`, `after-landing-768.png`, `after-landing-430.png`, `after-landing-390.png`; focused tests passed. |
| REQ-20260712-103 | Implemented, needs visual approval | Rabbi section, teaching carousel, and press marquee visible in landing screenshots; action registry covers carousel controls. |
| REQ-20260712-104 | Implemented, needs visual approval | `after-metrics.json` shows `61` days to Rosh Hashanah at all required viewports and reduced-motion animation is `none`. |
| REQ-20260712-105 | Implemented, needs visual approval | `robot-closed-*.png`, `robot-open-*.png`; panel avatar is `64px` on mobile and `84px` desktop/tablet; current class info was exercised. |
| REQ-20260712-106 | Implemented, needs visual approval | `after-signup-*.png`, `after-signup-success-430.png`; intercepted signup payload stores `city_label: "Buenos Aires"`, `timezone: "America/New_York"`, and `browser_timezone: "America/New_York"`. |
| REQ-20260712-107 | Needs operator decision | Verification passed; no merge/deploy/live-smoke performed pending screenshot approval. |

## Screenshot Evidence

Landing:

- `after-landing-1440.png`
- `after-landing-1024.png`
- `after-landing-768.png`
- `after-landing-430.png`
- `after-landing-390.png`

Signup:

- `after-signup-1440.png`
- `after-signup-1024.png`
- `after-signup-768.png`
- `after-signup-430.png`
- `after-signup-390.png`
- `after-signup-success-430.png`

Robot Scheller:

- `robot-closed-1440.png`
- `robot-closed-768.png`
- `robot-closed-430.png`
- `robot-closed-390.png`
- `robot-open-1440.png`
- `robot-open-768.png`
- `robot-open-430.png`
- `robot-open-390.png`

Reduced motion:

- `reduced-motion-landing-390.png`

Metrics:

- `after-metrics.json`

## Metrics Summary

- Landing overflow: none at 1440, 1024, 768, 430, 390.
- Signup overflow: none at 1440, 1024, 768, 430, 390.
- Countdown: `61` days until Rosh Hashanah on 2026-07-12 using Jerusalem calendar date 2026-09-11.
- Section order after hero: `receive`, `gain`, `how-it-works`, `who`, `rabbi`, `rosh-special`.
- Signup links: every captured signup link targets `/one-time/signup`.
- Reduced motion: ticker animation is `none`.
- Robot panel avatar: `64px` at 390/430, `84px` at 768/1440, `object-fit: contain`.
- Signup proof: arbitrary city `Buenos Aires` submitted with detected IANA timezone and no phone for email reminders.

## Verification

Passed:

- `node --check src/lib/bna/one-time-signup-workflow.js`
- `node --check public/js/bna-bot-widget.js`
- `node --test tests/one-time-focused-landing.test.js tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js tests/one-time-delivery-outbox.test.js tests/one-time-product-system.test.js tests/one-time-shared-review-branding.test.js tests/rabbi-checkout-access.test.js tests/release-captain.test.js` (`45/45`)
- `npm run pqc:validate`
- `npm run watchdog:actions`
- `npm run watchdog:protocol-drift`
- `npm run test:onetime:focused` (`72/72`)

## Guardrails

No merge, deploy, live smoke, external send, WAPI/Telegram dispatch, payment,
access grant, DNS/account mutation, credential mutation, or production-data
mutation was performed.
