# Current-State Visual Audit

Raw ID: `RAW-20260710-007`
Route: `/one-time`
Audit folder: `ops/ui-audits/2026-07-10-onetime-public-landing-production-rebuild/`
Captured URL: `http://127.0.0.1:3210/one-time`

## Evidence Captured

Screenshots were captured at 1440, 1280, 1024, 768, 430, 390, 375, 360, and 320 px widths.

Summary from `before-metrics.json`:

- No horizontal overflow detected in the before state.
- One `h1` detected at all tested widths.
- Existing quick form was present at all tested widths.
- Existing quick form collected a student field, which conflicts with `RAW-20260710-007`.
- FAQ content was present, which conflicts with the requested page order.
- CTA surface still included old labels: `WhatsApp Robot Scheller`, `See How It Works`, `Save My Spot`, `Join the free class`, and FAQ navigation.
- Console/page errors were not detected in the baseline captures.

## Defects To Correct

- `DEF-20260710-ONETIME-001`: Old CTA language remains visible; all public signup CTA text must be `Sign Up Now`.
- `DEF-20260710-ONETIME-002`: Inline yellow interest strip/form is still visible; the new page requires an accessible modal capture.
- `DEF-20260710-ONETIME-003`: Student name is collected in quick capture; quick capture must only ask for parent/contact name, email, and optional phone.
- `DEF-20260710-ONETIME-004`: FAQ section remains on the page; requested order does not include FAQ.
- `DEF-20260710-ONETIME-005`: Robot Scheller public launcher is placed near the top of the page instead of functioning as a bottom-corner utility.
- `DEF-20260710-ONETIME-006`: Existing page still reads like a styled prototype instead of the requested high-polish black/white/yellow/ice-blue public landing page.

## Implementation Direction

Proceed with a scoped static-page rebuild of `public/one-time/index.html`, targeted Robot Scheller launcher CSS/ARIA adjustments in `public/js/bna-bot-widget.js`, copied verified local logo/press assets only, and action registry updates for the changed public controls.
