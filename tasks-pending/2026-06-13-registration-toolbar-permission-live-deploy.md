# Registration Toolbar and Parent-Permission Notice Live Deploy

Created: 2026-06-13T23:45:00+03:00
Source: chat request on registration toolbar and Hebrew parent-permission wording.

## Intent

Ship the locally verified registration-page toolbar and parent-permission notice changes to production once deployment scope is safe.

## Local Changes

- Added shared public-site nav assets:
  - `public/css/bna-site-nav.css`
  - `public/js/bna-site-nav.js`
- Mounted the shared nav on:
  - `public/signup.html`
  - `public/signup-he.html`
  - `public/signup-thank-you.html`
  - `public/documents/registration-document.html`
- Replaced the final required parent-responsibility checkbox on English/Hebrew signup forms with a visible notice and hidden backend acknowledgment.
- Updated Hebrew copy to say BNA is not taking responsibility to enforce pickup, drop-off, purchases, food, treats, money, swimming, or staying late; the answers are for awareness, values-based coaching, and reporting back to parents.
- Left `public/documents/bnei_neviim_registration_documents_bilingual_codex.md` unchanged because the waiver already states parent responsibility for pickup/drop-off, travel, restrictions, and safety instructions.
- Updated internal signup notes in `server.js` from `pickup responsibility acknowledged` to `parent responsibility notice shown`.
- Updated `tests/signup-permissions-mobile-homepage.test.js`.
- 2026-06-14 follow-up: made Parent 1/Parent 2 section headings, parent-name labels, and parent-name input text explicitly black on English and Hebrew signup forms for readability.

## Verification

- PASS `node --check public/js/bna-site-nav.js`
- PASS `node --check public/js/registration-document-page.js`
- PASS `node --check server.js`
- PASS `node --test tests/signup-permissions-mobile-homepage.test.js`
- PASS `npm test` (303/303)
- PASS local browser smoke on `http://127.0.0.1:8097`:
  - Hebrew signup desktop: shared nav visible, RTL, hidden acknowledgment present, no required responsibility checkbox, responsibility/reporting notice visible.
  - Hebrew signup mobile 390x844: hamburger button visible, menu opens with dropdown links.
  - Hebrew registration document page: shared nav visible, back link points to `/signup-he.html`, document content loads, signature section visible.
  - Hebrew thank-you page: shared nav visible and Hebrew copy renders.
- PASS 2026-06-14 focused signup test after parent-name black readability follow-up:
  `node --test tests/signup-permissions-mobile-homepage.test.js` (6/6)
- PASS 2026-06-14 focused registration/nav regression:
  `node --test tests/signup-permissions-mobile-homepage.test.js tests/app-wide-brand-shell.test.js --test-reporter=spec`
  (9/9)
- PASS 2026-06-14 full suite after the 1280px nav overflow fix:
  `npm test` (353/353)
- PASS Railway doctor on current production deployment
  `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225`
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T15-41-19-444Z-live-app-smoke.md`
- PASS live registration toolbar/permission smoke:
  `ops/playwright-smokes/2026-06-14-registration-toolbar-permission-live/report.md`
  - `/signup` at 1280px: shared nav present, no horizontal overflow, hidden
    parent responsibility acknowledgment, no checkbox ack, parent
    responsibility notice visible, Parent 1/Parent 2 headings/labels/name
    inputs black.
  - `/signup-he` at 390px: RTL, hamburger visible and opens, hidden ack, no
    checkbox ack, notice visible, no horizontal overflow.
  - `/documents/registration-document?document=parent_handbook&lang=en&returnUrl=/signup.html`
    at 1280px: shared nav present, document content and signature section
    load, back link points to `/signup.html`, no horizontal overflow.
  - `/signup-thank-you.html?payment=credit` at 390px: shared nav present,
    credit/payment copy visible, hamburger visible, no horizontal overflow.

## Live Deployment Closeout

- Closed on 2026-06-14 after Railway deployment
  `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` reached SUCCESS and live smokes
  passed.
- Production CSS served the `box-sizing: border-box` fix for
  `.bna-site-nav`.
- A second live smoke found the real 1280px issue: the full public-site nav
  action row was too wide for the registration document page. The final CSS
  fix moves that long row behind the existing hamburger up to 1400px.

## Next Step

No further deployment step is needed for this slice. Keep the broader
goal-mode queue open for the remaining helper, CRM/WAPI, provider login,
automation, and Rabbi/One Time follow-ups.
