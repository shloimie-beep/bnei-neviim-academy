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

## Live Blocker

Do not deploy from the current checkout without an explicit decision: the worktree contains a very large set of unrelated uncommitted changes and deleted/archived files. A Railway deploy from this checkout would likely ship unrelated local work.

## Next Step

Use a clean deploy scope or get explicit approval to deploy the full dirty worktree, then run Railway doctor and live smoke before marking the task done. Include a visual/signup smoke confirming the Parent 1/Parent 2 names are black/readable.
