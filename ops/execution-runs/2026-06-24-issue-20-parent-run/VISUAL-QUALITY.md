# Visual Quality Batch A

Requirement: `REQ-20260624-041`

Status: local implementation verified; blocked for terminal Done until
deploy/live proof is available through `REQ-20260624-048`.

## Scope

Permanent visual watchdog coverage now includes:

- public home and signup;
- Operations static shell;
- provider review workspace;
- parent support/review surface;
- student support/review surface;
- One Time public landing page;
- One Time classroom;
- One Time email/support review.

Each browser route is checked at:

- `390x844`
- `768x1024`
- `1440x900`

## Defects Found And Fixed

- Public desktop nav clipped the BNA brand name and the long provider CTA at
  `1440x900`. Fixed by shortening the provider CTA to `Advertise for free` and
  giving the public brand lockup enough stable width.
- One Time review topbar links and review-mode `.btn` links rendered below the
  watchdog tap-target floor. Fixed shared One Time review CSS so topbar links
  and buttons have stable `inline-flex` sizing and minimum heights.
- One Time landing consent checkbox rendered as a `24px` control. Fixed it to a
  `32px` checkbox within a larger label target.
- The prior visual watchdog could not distinguish gradient/translucent controls
  from true low-contrast solid controls. Fixed the watchdog to composite solid
  translucent backgrounds, skip gradient/image-backed controls, ignore
  checkbox/radio controls when their label target is large enough, and record a
  screenshot-backed browser matrix.

## Implementation Files

- `scripts/watchdog-visual-baseline.mjs`
- `package.json`
- `public/css/bna-site-nav.css`
- `public/css/one-time-shared-review.css`
- `public/js/bna-site-nav.js`
- `public/index.html`
- `public/one-time/index.html`

## Evidence

- Permanent local browser watchdog:
  `ops/watchdog-audits/2026-06-24T20-01-watchdog-visual-baseline.md`
- Final browser matrix:
  `ops/visual-quality/2026-06-24T20-00-watchdog-visual-baseline/visual-baseline-browser-matrix.md`
- Final browser matrix JSON:
  `ops/visual-quality/2026-06-24T20-00-watchdog-visual-baseline/visual-baseline-browser-matrix.json`
- Final screenshots:
  `ops/visual-quality/2026-06-24T20-00-watchdog-visual-baseline/screenshots/`
- Refreshed public owner-review visual audit:
  `docs/owner-review/PUBLIC-VISUAL-AUDIT.md`
- Static visual watchdog:
  `ops/watchdog-audits/2026-06-24T20-03-watchdog-visual-baseline.md`
- Static UI smoke watchdog:
  `ops/watchdog-audits/2026-06-24T20-03-watchdog-ui-smoke.md`

## Verification

- `node --check scripts/watchdog-visual-baseline.mjs`
- `node --check public/js/bna-site-nav.js`
- `npm run watchdog:visual:local` passed with 0 findings across 9 routes and 3
  viewports.
- `npm run owner-review:visual` passed for release-local and production public.
- `node --test tests\bna-brand-shell.test.js tests\app-wide-brand-shell.test.js tests\one-time-shared-review-branding.test.js tests\one-time-focused-landing.test.js tests\one-time-product-system.test.js`
  passed 22/22.
- `npm run watchdog:ui` passed with 0 findings.
- `npm run watchdog:visual` passed with 0 findings.

## Remaining Blocker

This requirement changes app-visible public and review surfaces. It cannot be
marked `done` under BNA rules until deploy/live smoke proof exists. The final
release closeout is still blocked by the local Railway CLI targeting mismatch
recorded under `REQ-20260624-048`.
