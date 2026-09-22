# Actual WS01-WS11 Prompt List Map - 2026-06-16

## Source

Operator clarified that the authoritative prompt list is the attachment at:

`C:\Users\User\.codex\attachments\7e3bb822-96a8-43ff-b206-aa750f56a73a\pasted-text.txt`

The 2026-06-16 full closeout execution prompt additionally points to:

`C:\Users\User\.codex\attachments\a1e0641b-6e96-450e-b6ea-fb46b5ef62c1\pasted-text.txt`

Use the newer attachment for the combined WS01-WS11 closeout and
parent-managed student login requirement. Use the older attachment as the
original WS01-WS11 prompt-list map.

This file maps that 11-workstream prompt pack to the existing Downloads prompt
audit, plus the local patch made during the resumed pass.

## Workstream Map

| WS | Title from attachment | Current status | Evidence / action |
| --- | --- | --- | --- |
| 01 | Operations UI / Mobile / Buttons / Dark Gray Cleanup | Local complete; deploy pending | Covered by `public/css/bna-app-shell.css`, `tests/operations-ws01-layout-readability.test.js`, and the WS01 row in `2026-06-15-downloads-prompt-status.md`. Prior full verification passed 615/615. |
| 02 | Decision Lifecycle / Add Comment Reprocess / Pros and Cons | Local complete; live DB/deploy closeout blocked | Covered by decision lifecycle rows in the status/evidence ledgers and prior WS02 ledger records. |
| 03 | Pending Access / Duplicate Cards / Done and Received Flow / Done Links | Local complete; live DB/deploy closeout blocked | Covered by pending/access rows in the status/evidence ledgers and prior WS03 ledger records. |
| 04 | Agent Queue / Task Log / Stale Work Audit | Deployed and verified | Covered by queue audit/reconciler rows and WS04 deployed ledger record. |
| 05 | BNA Helper Real Tools / Natural Language Actions | Local complete; safe deploy blocked | Covered by `src/lib/bna/helper/*`, `/api/bna/helper/*`, Operations Helper drawer, and `tests/bna-helper-tools.test.js`. This resumed pass added public Helper consistency coverage outside Operations. |
| 06 | Buffer / Resend / Keyholder / Communications | Local complete; credentials/DNS/deploy blocked | Covered by communications readiness rows and WS06 ledger records. |
| 07 | Automation Center Compact Layout | Local complete; live DB/deploy closeout blocked | Covered by automation center rows in the status/evidence ledgers and WS07 ledger records. |
| 08 | Workspace Directory / Categories / SDDraftler / Family App | Local complete; DB/safe deploy closeout blocked | Covered by workspace-directory rows and Kimi/two-login records. This resumed pass also checked public/provider navigation consistency because the operator highlighted toolbar/sidebar consistency. |
| 09 | Person/Student Identity Dedupe / Menachem Hebrew-English | Local complete; live Menachem inspection blocked | Covered by person/student identity rows and WS09 records. |
| 10 | One Time Product / Pricing / Payments / Access / Website Assets | Decision/product state reconciled; human decisions remain | Covered by `tasks-pending/2026-06-15-one-time-product-payments-decisions.md` and payment/checkout guardrail tests. |
| 11 | Gamification / Parent Progress / Community / Course Library | Local complete; safe deploy/live privacy smoke blocked | Covered by WS11 rows and parent/student/community privacy tests. |

## Local Gap Patched In This Resumed Pass

The actual attachment emphasized app-wide UI consistency, forms/toolbars, mobile
readability, and BNA Helper consistency. A fresh scan found this local-only gap:

- Public signup pages loaded the BNA Helper widget but not the shared public
  helper knowledge bundle.
- Signup thank-you and registration document pages had the shared site nav but
  no public Helper widget.
- Blog, FAQ, article, and One Time preview public pages did not consistently
  load the public Helper knowledge bundle plus widget.
- Public provider index/join/profile pages used an older provider mini-toolbar
  and palette instead of the shared BNA main-site nav, and had no universal
  public Helper.
- The shared widget classified every path beginning with `/provider` as the
  private provider workspace, which would mis-scope public `/providers` and
  `/provider-signup` if the widget mounted there.

Patch:

- Tightened provider workspace detection in `public/js/bna-bot-widget.js` to
  the actual private provider routes only.
- Added `/js/bna-helper-knowledge.js` before `/js/bna-bot-widget.js` on public
  signup, signup thank-you, registration document, blog, FAQ, article, One Time
  preview, and public provider pages.
- Replaced the public provider page mini-toolbar with the shared
  `/css/bna-site-nav.css` + `/js/bna-site-nav.js` mount.
- Updated provider profile leftover dark mark/font styling to the BNA palette.
- Added focused contract coverage in `tests/universal-assistant-contract.test.js`
  and `tests/provider-index-mvp.test.js`.

Verification:

- PASS `node --check public/js/bna-bot-widget.js`
- PASS focused assistant/provider/signup/app-select suite:
  `node --test tests/universal-assistant-contract.test.js tests/provider-index-mvp.test.js tests/service-provider-directory.test.js tests/signup-permissions-mobile-homepage.test.js tests/assistant-portal-communications-contract.test.js tests/app-select-dropdown.test.js`
  (47/47)
- PASS full `npm test` (617/617)
- PASS in-app Browser smoke through a local static server on
  `http://127.0.0.1:43891`: provider directory, provider join, provider
  profile, signup thank-you, registration document, blog, and One Time preview
  rendered with the expected nav/helper surfaces, no console errors, no mobile
  horizontal overflow, and public-provider routes showed public Helper copy
  instead of private provider-workspace copy. The local server was stopped.

## Remaining Status

No unclassified workstream remains in the actual WS01-WS11 attachment. Remaining
open work is not a hidden local UI/spec gap; it is the same tracked closeout
set: safe deploy windows, reachable live DB readback, server-side credentials
and DNS, live privacy/smoke checks, and human product/legal/billing/asset
decisions.
