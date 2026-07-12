# One Time Neon Landing Polish - Local Proof Report

Created: 2026-07-12

## Scope

Focused visual and copy polish for the One Time public landing page and related signup footer/widget polish. The latest operator instruction requires commit, production-branch merge, Railway deploy, and live smoke after local verification.

## Changed Surface

- `/one-time/`
- `/one-time/signup`
- Public Robot Scheller launcher/widget on One Time pages

## Asset Map

See `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/ASSET-MAP.md`.

## Screenshots

| View | Path |
|---|---|
| Landing 1440 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-1440.png` |
| Landing 1024 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-1024.png` |
| Landing 768 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-768.png` |
| Landing 430 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-430.png` |
| Landing 390 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-390.png` |
| Drawer 430 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-430-drawer.png` |
| Reduced motion 430 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/landing-430-reduced-motion.png` |
| Signup 1440 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/signup-1440.png` |
| Signup 430 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/signup-430.png` |
| Rabbi carousel 1440 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/section-rabbi-1440.png` |
| Rabbi carousel 430 | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/section-rabbi-430.png` |
| Robot closed/open | `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/robot-*.png` |

## Metrics Summary

Source: `ops/ui-audits/2026-07-12-onetime-neon-landing-polish/local-visual-metrics.json`

| Check | Result |
|---|---|
| Tested widths | 1440, 1024, 768, 430, 390 |
| Horizontal overflow | none |
| Large Sign Up Now CTAs | exactly 3 |
| Ticker count and placement | 1 ticker, directly after header |
| Hero background grid | present |
| Carousel slides | 8 selected Rabbi teaching photos |
| Broken images | 0 |
| Carousel images loaded | yes |
| Feature tile heights | equal at every tested width |
| Robot launcher size | 108px desktop/tablet, 88px mobile |
| Current class information | still present |
| Reduced motion | ticker/press animation disabled; reveals visible immediately |
| Browser console/page errors | 0 |

## Requirement Matrix

| ID | Requirement | Local status | Evidence |
|---|---|---|---|
| REQ-20260712-201 | Preflight and process approved student/Rabbi assets. | Pass | `ASSET-MAP.md`; WebP assets in `public/assets/one-time/rabbi/teaching-locations/`; normalized PNG in `public/assets/one-time/students/smiley-kid.png` |
| REQ-20260712-202 | Neon/chrome visual system, compact header, drawer, top ticker, full-grid hero. | Pass | `landing-*.png`; metrics show no overflow, ticker top order true, hero grid true |
| REQ-20260712-203 | Requested section content and exactly three large CTAs. | Pass | `landing-*.png`; metrics show `ctaLargeCount: 3`; static tests pass |
| REQ-20260712-204 | Real Rabbi teaching carousel. | Pass | `section-rabbi-1440.png`; `section-rabbi-430.png`; metrics show 8 loaded slides |
| REQ-20260712-205 | Full Robot Scheller launcher/header image. | Pass | `robot-closed-*.png`; `robot-open-*.png`; widget static tests pass |
| REQ-20260712-206 | Signup page preserved and footer aligned. | Pass | `signup-1440.png`; `signup-430.png`; focused signup tests pass |
| REQ-20260712-207 | Verify, commit, push, merge, deploy, live-smoke. | Local verification pass; deploy pending at report time | This report, local tests, watchdogs; final live deployment proof to be recorded in task final response |

## Local Test Results

| Command | Result |
|---|---|
| `node --check public/js/bna-bot-widget.js` | Pass |
| `node --test tests/one-time-focused-landing.test.js` | Pass, 2/2 |
| `npm run test:onetime:focused` | Pass, 73/73 |
| `node --test tests/release-captain.test.js` | Pass, 6/6 |
| `npm run pqc:validate` | Pass |
| `npm run watchdog:actions` | Pass |
| `npm run watchdog:protocol-drift` | Pass |
| `node --test tests/watchdog-action-registry.test.js` | Pass, 5/5 after regenerating coverage/parity artifacts |
| `git diff --check` | Pass |

## Deployment Gate

Local verification is complete. The latest operator instruction in `RAW-20260712-006` supersedes the previous visual-approval hold and requires production deployment after commit/push/merge.
