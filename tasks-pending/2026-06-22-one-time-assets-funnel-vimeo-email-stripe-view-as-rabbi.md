# One Time Assets, Funnel, Vimeo, Email, Stripe, View as Rabbi

Status: implemented locally / focused tests passing / deployment blocked pending operator approvals.

Raw source: `raw-input/RAW-20260622-003-one-time-assets-funnel-vimeo-email-stripe-view-as-rabbi.md`

Raw source SHA-256: `72657ACC740C838C6356092A99BEFAC2F07BECBFFE8A6E78ECEA354DD0BC5C33`

Isolated branch: `codex/one-time-assets-vimeo-stripe-email-view-as-rabbi-20260622`

Base SHA: `04d93788c48f729001f99c54a67f89ef42cfbe79`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260622-003 | Done | Preserve prompt, inspect PR/run/branch state, and isolate work away from `codex/agent-control-center-20260619`. | Raw source file; isolated worktree branch; base SHA above. |
| REQ-20260622-004 | Done | Inventory, deduplicate, classify, organize, and rank downloaded One Time/Rabbi Scheller media without deleting or moving Downloads originals. | `ops/one-time-mishnah/asset-intake/2026-06-22/`; private library at `C:\Users\User\Documents\BNA-Assets\One-Time`. |
| REQ-20260622-005 | Done | Replace complicated public copy with a simple worldwide Mishnayos signup funnel and public Vimeo hero stream. | `public/one-time/index.html`; `/api/one-time/campaign`; tests `one-time-focused-landing` and `one-time-product-system`. |
| REQ-20260622-006 | Done | Make the member/classroom lesson play in-site instead of sending students to raw Vimeo/CAPTCHA page. | `public/one-time-classroom.html`; `src/platform/instances/one-time-shared-review-data.js`; test `one-time-shared-review-branding`. |
| REQ-20260622-007 | Partially done / blocked for live writes | Complete safe readiness work for email and Stripe using existing approved environment, without sending or charging. | `ops/one-time-mishnah/launch-readiness-2026-06-22.md`; service config copy; no-send/no-checkout guards. |
| REQ-20260622-008 | Done locally / requires admin session for live exercise | Add secure platform-super-admin read-only "View as Rabbi" preview. | `server.js`; `public/provider.html`; route/action registries; test `campaign API and view-as Rabbi preview`. |
| REQ-20260622-009 | Done | Align backend/public contracts and registries with the One Time slice. | `ops/route-registry.json`; `ops/action-registry.json`; focused tests. |
| REQ-20260622-010 | Done locally / commit-deploy pending approval | Verify and show scoped diff. Commit/push/deploy only isolated branch work after operator review. | Focused suite, full `npm test`, watchdogs, secret audit, and diff check completed; deployment still blocked by operator decisions. |

## 2026-06-23 Homepage Funnel Refinement

Status: implemented locally and focused tests passing.

The public `/one-time` homepage was tightened to follow the existing Phase H funnel instructions from the RAW prompt. The page now reads as a visitor signup funnel instead of an implementation/status report:

- mission-forward hero copy for learning Mishnayos live with Rabbi Elie Scheller;
- public Vimeo hero CTA flow;
- program preview using the already-approved teaching stills;
- approved proof/logo strip with non-sponsorship wording;
- three-step "How It Works" section;
- Rabbi/founder section with the approved portrait;
- member classroom preview;
- FAQ;
- final 30-day-free-trial signup form.

Removed public-facing implementation language such as private asset-library notes, video IDs, launch-approval wording, server-backed timer wording, raw Vimeo/CAPTCHA references, and no-charge/no-send debug phrasing. The rights and asset blockers remain documented in `ops/one-time-mishnah/asset-intake/2026-06-22/RIGHTS-BLOCKERS.md`; they are not shown as public homepage copy.

Verification added/updated:

- PASS `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js` (15/15)
- PASS `git diff --check` for changed homepage/config/tests, with Windows line-ending warnings only
- PASS local Playwright static smoke at `390x844` and `1440x900`: no body overflow, approved teaching images loaded, Vimeo hero iframe present, program/how-it-works/FAQ text present, final submit CTA remains `START 30 DAYS FREE`

## 2026-06-23 Front-End Brand Pass Across Review Portals

Status: implemented locally and browser-smoked on the review-only server.

The One Time front-end pass now applies the exact brand-kit colors across the
shared review surfaces, including the student page, parent portal, provider
portal, read-only "View as Rabbi" interface, classroom, and email-preview page.

- expanded `public/css/one-time-shared-review.css` into the shared One Time
  theme layer: black/charcoal/navy, teal/cyan, lemon-yellow, cream, white,
  branded top bars, cards, buttons, inputs, progress bars, sidebars, pills, and
  read-only Rabbi banner;
- mapped older BNA portal variables to the One Time palette only under
  `body.one-time-review-active`, so normal BNA pages remain separate;
- polished provider/Rabbi workspace copy around classes, library,
  parent/student access, payments, and communications;
- polished parent and student review dashboard copy while preserving TEST-only
  scoping and the `No bot / no BNA goals` student guardrail;
- polished classroom and email-review entry copy while keeping preview-only and
  no-send/no-write guardrails explicit;
- added branding contract assertions to
  `tests/one-time-shared-review-branding.test.js`.

Verification added/updated:

- PASS `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js` (15/15)
- PASS `node --test tests\bna-brand-shell.test.js tests\app-wide-brand-shell.test.js tests\parent-student-polish-contract.test.js tests\portal-toolbar-overview-ux.test.js tests\one-time-review-only-server.test.js tests\one-time-external-user-portal.test.js` (49/49)
- PASS local Playwright browser smoke against `ONE_TIME_REVIEW_ONLY_NO_DB=1` server at `390x844` and `1440x900`: `/one-time`, provider review, parent review, student review, classroom, and email review all loaded; branded CSS variables present; logos loaded; no horizontal overflow; review email templates rendered.

## 2026-06-23 Rabbi Workspace, Student Scope, and Badge Follow-Up

Status: implemented locally, raw continuation captured, focused tests passing,
and browser-smoked on the review-only server.

Raw continuation: `raw-input/RAW-20260623-002-one-time-rabbi-workspace-student-scope-badges.md`

This follow-up maps the operator ramble about making Rabbi Eli Scheller's view
closer to the super-admin operating model, while keeping him scoped to the One
Time workspace and away from cross-account super-admin powers.

- expanded the One Time provider review into a Rabbi workspace shell with a
  left sidebar on desktop and hamburger drawer on mobile;
- added sections for Dashboard, Users, CRM, Content, Automations, Badges,
  Communications, Live Class, Library, Payments, Integrations, Settings, and
  Support;
- exposed the owner identity as Rabbi Eli Scheller with login username
  `ELISHELLER`;
- kept password handoff as WhatsApp-only but blocked/no-send in review mode
  until exact recipient/body approval;
- added workspace users and login surfaces for provider, scoped Operations,
  parent view, student view, classroom, and email review;
- added explicit One Time student portal boundary: Mishnayos class/library,
  worksheets, private Rabbi questions, badges, achievements, and rewards are in;
  BNA school accountability goals, goal checkoffs, consequences, device
  controls, bot/accountability goals, and unrelated household/student records
  are out;
- added One Time badge awarding and badge automation maps, with guardrails that
  badges do not write to BNA school accountability goals or school reward
  ledgers.

Verification added/updated:

- PASS `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js tests\parent-student-polish-contract.test.js tests\portal-toolbar-overview-ux.test.js` (20/20)
- PASS `node --test tests\one-time-review-only-server.test.js tests\one-time-external-user-portal.test.js` (37/37)
- PASS local Playwright smoke on `http://127.0.0.1:19731` at `1440x900` and `390x844`: provider review loaded Eli workspace, `ELISHELLER`, sidebar/hamburger nav, Users/CRM/Content/Automations/Badges/Settings sections, badge card `Thoughtful Question`, student boundary `No bot / no BNA goals`, and no horizontal overflow; student review loaded visible One Time-only boundary and BNA school-accountability exclusion.

## 2026-06-24 QA Closeout

Status: QA-closed locally. No new functional scope was added in this closeout.
Other agents should treat the Rabbi workspace, badges, and One Time student
boundary as already implemented in the local review branch.

Verification rerun:

- PASS `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js tests\parent-student-polish-contract.test.js tests\portal-toolbar-overview-ux.test.js` (20/20)
- PASS `node --test tests\one-time-review-only-server.test.js tests\one-time-external-user-portal.test.js` (37/37)
- PASS `node --check server.js`
- PASS `git diff --check` (Windows line-ending warnings only)
- PASS local Playwright smoke on `http://127.0.0.1:19731` at `1440x900` and `390x844`: provider desktop nav, provider mobile hamburger drawer, Badges and Rewards with `Thoughtful Question`, `ELISHELLER`, student One Time-only boundary, `No bot / no BNA goals`, BNA school-accountability exclusion, Mishnayos content, and no horizontal overflow.
- PASS in-app browser restored to `student.html?review=one-time#reviewClass` with One Time-only boundary, `No bot / no BNA goals`, and no horizontal overflow.

## Operator Decisions Still Needed

| Decision | Status | Blocks |
| --- | --- | --- |
| `DEC-20260622-ONE-TIME-CAMPAIGN-DEADLINE` | Needed | Exact `ONE_TIME_CAMPAIGN_START_AT`, `ONE_TIME_CAMPAIGN_DEADLINE_AT`, and launch timezone for the non-resetting public countdown. |
| `DEC-20260622-ONE-TIME-EMAIL-SENDER` | Needed | Live Resend sender/domain choice, approved audience, suppression policy, and explicit send approval. |
| `DEC-20260622-ONE-TIME-STRIPE-LIVE-POLICY` | Needed | Live Stripe account, product/price IDs, tax/refund policy, trial terms, and explicit checkout/charge approval. |
| `DEC-20260622-ONE-TIME-ASSET-RIGHTS` | Needed | Publication rights/consent for newly downloaded crowd, location, student/family, and publication/logo assets. |
| `DEC-20260622-ONE-TIME-DEPLOY` | Needed | Approval to deploy this isolated branch to the intended Railway service and run live smokes. |

## Guardrails

No live email, WhatsApp send, charge, checkout session, access grant, Zoom write, Vimeo upload, DNS change, Railway variable mutation, external CRM/GHL write, raw private export, or secret exposure was performed.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js` (15/15)
- PASS `npm test` (1044/1044)
- PASS `npm run watchdog:actions`
- PASS `npm run watchdog:security`
- PASS `node scripts\audit-secrets.mjs` (4040 tracked paths, 0 tracked secret-risk files)
- PASS `git diff --check` (Windows line-ending warnings only)
- PASS local `ONE_TIME_REVIEW_ONLY_NO_DB=1` server readback on `127.0.0.1:8099`: `/one-time` 200 with public Vimeo hero and no TEST review link, `/api/one-time/campaign` 200 with pending-deadline decision, `/api/one-time-review/classroom` 200 with lesson Vimeo embed.
- KNOWN `npm run bna:run:validate` failed because this is an isolated branch while the active run metadata expects `codex/agent-control-center-20260619`, and the stripped worktree lacks older historical live-smoke evidence paths.
