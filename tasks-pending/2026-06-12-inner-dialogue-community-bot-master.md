# Inner Dialogue, Learning Communities, Bot, Newsletter, and Signup Master Brief

Created: 2026-06-12
Source prompt: `C:\Users\User\Downloads\mapping-out-inner-dialogue-between-members-community-dialogue-codex-prompt.md`
Owner: Codex
Status: core implementation deployed and live-smoked; product/content follow-ups remain open

## Master Task

Mapping out inner dialogue between members and the community and dialogue

## Discovery Snapshot

- Repo is `C:\Users\User\BNA v2.0` on branch `master`.
- Worktree was already heavily dirty before this import, with many existing BNA changes, archived legacy/Next files, generated QA artifacts, and untracked work. Do not broad-stage or clean this tree casually.
- Runtime is Express/static through `server.js` and `public/`.
- `src/app` is removed from the working tree; the old Next/Supabase app exists under `docs/archive/dormant-next-supabase-app/` and is not the live Operations surface.
- Railway starts through `scripts/railway-start.mjs`; `package.json` main is `server.js`.
- Live public/static surfaces include `/`, `/blog`, `/faq`, `/student`, `/parent`, `/provider`, `/service-providers`, `/providers`, `/providers/join`, `/become-service-provider`, `/operations`, `/operations-login.html`, `/signup.html`, and `/signup-he.html`.
- `public/operations.html` is the live Operations dashboard. Do not edit archived React TaskApp files for live behavior.

## Baseline Verification Run

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `npm test` (277/277)
- PASS `npm run app:smoke`; report: `ops/live-smokes/2026-06-12T13-08-16-229Z-live-app-smoke.md`

## Implemented And Verified On 2026-06-12

- Live runtime/database audit completed before edits. The live app is Express/static through `server.js` and `public/`; archived Next/Supabase code remains historical only. Local `.env.local` pointed at a stale Supabase host, while the Railway database secret was reachable for production checks.
- Mobile public homepage/nav fixed. The hamburger menu now includes parent login, student login, Rabbi/provider login, provider join, signup, language, contact, and primary public links. The mobile hero image and spots badge were tightened so the badge is smaller and no horizontal overflow appears.
- Parent permission fields shipped end-to-end. English and Hebrew signup forms collect leaving premises, walking unaccompanied, swimming, buying food, junk food, spending money, staying late, pickup responsibility acknowledgement, pickup/drop-off notes, and general permission notes. `/api/submit` persists normalized `parent_permissions` plus searchable pickup fields, and signup-to-student sync now writes `bna_parent_permission_profiles`.
- Learning community/dialogue backend shipped. Startup creates `bna_learning_communities`, `bna_learning_community_members`, `bna_community_threads`, and `bna_community_messages`; the default BNA community is `bna-main`; admin APIs manage communities/members; portal APIs list communities and create threads/messages with parent, student, provider, and admin actor resolution.
- Weekly-update/newsletter foundation shipped. Startup creates `bna_weekly_updates`; Operations admin APIs can create/list/update selected weekly updates; the parent portal payload includes current and historical weekly updates; `public/parent.html` renders the selected update as a first-screen hero with media, summary/action copy, and prior-update chips when data exists.
- Sliding bot widget shipped on public, parent, student, and provider surfaces through `public/js/bna-bot-widget.js`. Public mode shows quick links only. Portal mode fetches safe action previews and can post a community note through the community-thread API. It does not expose a raw LLM chat endpoint.
- Guarded email smoke shipped as `scripts/smoke-email.mjs` and `npm run email:smoke`. Dry-run uses the shared action runner and proves the approval gate without sending email.
- Four-document page flow shipped after the core release. All four signup document cards now open `/documents/registration-document` as a branded page with toolbar/logo, language toggle, document version chip, full document body, and bottom signature section. Signing from the popup tab writes the existing `bnaSignupDocumentSignatures` envelope, posts the signature back to the opener form, closes/returns, and preserves typed signup fields.
- New/updated tests cover app-wide select loading, signup permissions, mobile homepage role nav, learning-community contracts, weekly update contracts, sliding bot safety, and email smoke wiring.

## Final Verification And Deployment

- PASS `npm test` (290/290)
- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-email.mjs`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `npm run email:smoke -- --base=http://127.0.0.1:18081 --to=office@bneineviimacademy.org`; dry-run only, approval required, no send executed
- PASS mobile widget visual refresh: `ops/screenshots/2026-06-12-mobile-bot-widget-public-aligned.png`; Playwright reported `overflow: 0`, panel `x: 0`, width `390`
- PASS Railway doctor before deploy
- PASS Railway deploy `21b0a63a-38f2-4f67-b207-c71aa9c7b054` reached `SUCCESS`
- PASS `npm run app:smoke`; report: `ops/live-smokes/2026-06-12T14-18-01-082Z-live-app-smoke.md`
- PASS BNA-scoped live endpoint probe: `/api/bna/learning-communities?workspace=bna` returned one default community, `bna-main`; `/js/bna-bot-widget.js` returned 200; anonymous `/api/portal-bot/actions` returned the expected 401 guard
- QA summary: `ops/qa-runs/2026-06-12-inner-dialogue-community-bot-release.md`

## Second Verification And Deployment: Four Document Pages

- PASS `node --check server.js`
- PASS `node --check public/js/signup-documents.js`
- PASS `node --check public/js/registration-document-page.js`
- PASS `node --test tests/signup-permissions-mobile-homepage.test.js` (4/4)
- PASS local Playwright mobile signup flow: typed Parent 1/student fields survived after opening/signing Tuition in a document page; signature stored as `tuition_agreement`; card changed to signed; signup page overflow was `0`
- PASS local Playwright Hebrew document page: `/documents/registration-document?document=student_code_of_conduct&lang=he` had `lang="he"`, `dir="rtl"`, Hebrew title, content length 2570, and overflow `0`
- Screenshots:
  - `ops/screenshots/2026-06-12-mobile-signup-document-page.png`
  - `ops/screenshots/2026-06-12-mobile-signup-document-page-he.png`
- PASS `npm test` (295/295)
- PASS Railway deployment `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d` reached `SUCCESS`
- PASS `npm run app:smoke`; report: `ops/live-smokes/2026-06-12T14-42-47-439Z-live-app-smoke.md`
- PASS production targeted probe: English Tuition document page, Hebrew Student Handbook document page, and `/js/registration-document-page.js` all returned 200 from `https://bneineviimacademy.org`

## Existing Work Already Present

- Four visible signup docs are already live in the current flow: Handbook, Tuition, Waiver, and Student Handbook.
- Agreement signatures persist through `bna_signup_agreement_signatures`.
- Current signup flow now opens all four required documents as branded full document pages while preserving the existing four-signature persistence contract.
- Parent portal login, password reset, magic links, student portal access codes, provider login, provider onboarding, parent/provider messages, and service-provider index have first-pass implementations.
- The full fixture-backed student Hebrew/RTL visible-string and screenshot audit is complete. Production smoke coverage now checks mobile/desktop RTL state, Hebrew labels, no mojibake, agenda-first mobile calendar, Hebrew Sefaria refs, no private sentinel leakage, no horizontal overflow, and no write actions.
- Operations already has internal-first primitives: `bna_project_members`, `bna_internal_threads`, `bna_internal_messages`, `bna_bot_action_logs`, workspace settings, connector settings, internal calendar events, pipeline cards, support tickets, and typed action endpoints.
- The shared Action Registry already exists under `src/lib/actions/`, with bot preview/execute endpoints in `server.js`. The exact MVP action names from this prompt are not all present.
- Parent portal already surfaces a latest weekly update block when payload data exists, but it is not yet the requested polished newsletter hero with selected pool/talking-head media, arrows/history, and admin-selected weekly update data model.

## Remaining Follow-Up Gaps From The Master Prompt

- Parent/student/provider login foundations exist. Spouse access and broader rabbi/community login policy still need product decisions before adding more account roles.
- Parent and student reset/onboarding email foundations exist, and guarded email smoke exists, but a new full onboarding campaign was not sent or expanded.
- Student Hebrew/RTL is now closed for the current student portal surface with a fixture-backed live screenshot/string audit. Future authenticated real-student checks still need approved test credentials or an approved synthetic/staging account.
- Weekly-update hero/admin data model and the Operations approval workspace are live, but approved weekly copy and pool/talking-head media still need operator selection. No placeholder was promoted as the official update.
- Mobile screenshots were captured for homepage, signup permissions, parent newsletter hero, and bot drawer. Full matrix coverage for login, student, all document states, and authenticated parent/provider flows remains as a separate QA task.

## Tracked Child Tasks

1. Audit live runtime and overlapping agent work for BNA community/dialogue build
2. Normalize BNA brand kit across public, operations, parent, student, and form pages
3. Fix mobile public navigation, hamburger menu, and hero CTA placement
4. Rebuild signup flow into four signed document pages
5. Add parent permission fields for leaving, swimming, food, money, and pickup responsibility
6. Implement parent, spouse, student, rabbi, and service-provider login model
7. Add onboarding and reset emails for parent and student access
8. Complete Hebrew and RTL audit for student-facing pages (completed 2026-06-15)
9. Build learning community roles and membership model
10. Build internal dialogue/forum between community members
11. Build sliding in-app AI bot widget
12. Connect bot widget to safe backend tool/action registry
13. Add newsletter hero to parent dashboard
14. Retrieve or select approved weekly newsletter copy and pool/talking-head media (approval workspace deployed 2026-06-15; operator content/media selection remains open)
15. Add email smoke tests and send controlled test email to office/operator account
16. Add mobile screenshot smoke tests for homepage, forms, documents, login, parent, student, and bot
17. Deploy, smoke live routes, update changelog, ledger, memory, and task statuses

Completed in this release or follow-up: 1, 3, 4, 5, 9, 10, 11, 12, 13, 15,
16, the student Hebrew/RTL audit item 8, the deployed role/access policy
matrix slice of item 6, the deployed approval-workspace and recipient-preview
slices of item 14, the per-family parent password setup/reset slice of item 7,
and the deploy/smoke/tracking part of 17.

Still open or partial: 2, 6, the remaining parent/student onboarding campaign
policy and broader reset-email expansion under 7, plus the operator-selected
copy/media and any test-send/live-send policy under 14.

## 2026-06-15T05:25:50+03:00 - Mobile Public/Login/Document Matrix

Completed the mobile screenshot matrix item for homepage, forms, documents,
login, parent, student, and bot surfaces.

- Added reusable smoke runner:
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/run-smoke.mjs`.
- The first production run caught a stale student-access-code clearing gap on
  public registration document pages.
- Patched `public/documents/registration-document.html` to clear
  `bnaStudentAccessCode` before rendering.
- The final live run covered `/`, public helper open state, `/signup.html`,
  `/signup-he.html`, the four required registration document pages,
  `/parent/login`, `/parent/login?onboard=accountability`, `/student/login`,
  and `/provider/login` at 390px mobile width.

Verification:

- PASS focused assistant/signup tests 15/15
- PASS full `npm test` 415/415
- PASS Railway deployment `e7c5c182-70ff-49cd-b786-ca76de01efc2`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T02-24-39-914Z-live-app-smoke.md`
- PASS live mobile matrix:
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/report.md`

Guardrail: no form submission, provider signup, parent/student login,
assistant send, email, WhatsApp, billing, Google API call, connector write, or
external CRM write was executed.

## 2026-06-15T05:41:35+03:00 - Student Hebrew/RTL Audit Deployed

Completed the full fixture-backed student portal Hebrew/RTL audit requested by
the master prompt.

- Localized the student question `Answer:` prefix and Rabbi WhatsApp meeting
  CTA through the existing student label map instead of hardcoded English.
- Added contract coverage in `tests/parent-student-polish-contract.test.js`.
- Added reusable live Playwright runner:
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/run-smoke.mjs`.
- The smoke fulfills `/api/student-portal` reads with synthetic fixture data,
  blocks all student-portal write requests, and saves mobile/desktop Hebrew
  screenshots for overview, calendar, goals, assignments, questions, documents,
  bot, and help/account sections.

Verification:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS smoke runner syntax check
- PASS focused assistant/student-polish tests 12/12
- PASS local fixture-backed browser audit
- PASS full `npm test` 415/415
- PASS Railway deployment `8a2d1967-7573-499d-955f-a21f90a990c0`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T02-41-35-249Z-live-app-smoke.md`
- PASS live Hebrew/RTL audit:
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/report.md`

Guardrail: no real student credential, form submission, checkoff, day note,
parent message, Rabbi message, assistant send, email, WhatsApp, Google API
call, connector write, or external CRM write was executed.

## 2026-06-15T06:02:35+03:00 - Parent Weekly Update Approval Workspace Deployed

Completed the Operations approval-workspace slice of the weekly update follow-up.

- Replaced the prompt-based parent announcement approval path in Operations
  Communications > Announcements with an in-page approval form.
- Candidate updates can be loaded into the form, including title, body, image
  URL, and video URL readback.
- Added a `Preview No-Write` button that calls the existing
  `/api/bna/parent-announcements` route with `dry_run: true`.
- Local approval still requires typing `APPROVE_PARENT_ANNOUNCEMENT` and stores
  only a local selected weekly update. It does not send email, WhatsApp, social
  posts, Buffer drafts, or external CRM writes.
- Added focused contract coverage in
  `tests/community-weekly-updates-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/run-smoke.mjs`.

Verification:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS smoke runner syntax check
- PASS focused weekly/Operations/portal tests 35/35
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-local/report.md`
- PASS full `npm test` 415/415
- PASS Railway deployment `a298a146-8e34-408c-9a1f-f6e26e38dd0c`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-02-35-006Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/report.md`

Guardrail: the focused smoke intercepts parent-announcement API calls, confirms
the preview POST used `dry_run: true`, and records zero non-dry-run write
attempts. No official weekly update copy/media was selected or promoted; that
operator content decision remains open.

## 2026-06-15T06:17:55+03:00 - Parent Password Setup Preview Deployed

Completed the first deployable parent/student onboarding/reset email slice for
item 7.

- Added `POST /api/bna/parent-access/password-reset` for admin-scoped,
  per-family parent password setup/reset email handling.
- Added `Preview Password Setup` and `Email Password Setup` buttons to each
  parent row in Operations Students > Next Year Login.
- Added rollout packet copy clarifying that student links can be prepared in
  bulk, while parent login links, parent password setup/reset emails, and
  WhatsApp login links remain explicit per family. No parent onboarding
  campaign is sent from this page.
- Dry-run preview returns no-write/no-send flags and
  `confirm_required: SEND_PARENT_PASSWORD_SETUP`.
- Confirmed email send remains single-family and requires
  `SEND_PARENT_PASSWORD_SETUP`.
- Added focused coverage in `tests/next-year-login-readiness.test.js` and
  `tests/parent-student-portal-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/run-smoke.mjs`.

Verification:

- PASS `node --check server.js`
- PASS Operations inline script parse
- PASS smoke runner syntax check
- PASS focused next-year/portal tests 26/26
- PASS full `npm test` 415/415
- PASS `git diff --check`
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-local/report.md`
- PASS Railway deployment `990a677c-a6a5-4b2d-97d7-13f1cf83c862`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-17-11-309Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/report.md`

Guardrail: the focused live smoke intercepted password-reset API calls,
confirmed exactly one preview POST with `dry_run: true`, and recorded zero
live email send attempts. No parent token, email, WhatsApp, onboarding
campaign, portal message, student access change, external CRM write,
Google/Drive action, or Buffer/social action was triggered by the preview.

## 2026-06-15T06:32:09+03:00 - Parent Weekly Recipient Preview Deployed

Completed the no-send recipient-preview slice of weekly update item 14.

- Added `GET /api/bna/parent-announcements/recipients`.
- The preview dedupes active BNA student parent emails, separates signup-only
  candidates for review, separates second-parent/spouse candidates behind
  policy review, excludes external-accountability students, and reports missing
  parent email records.
- Operations Communications > Announcements now has `Preview Recipients
  No-Send` and a readback panel with eligible, missing-email, external
  excluded, and duplicate counts.
- The endpoint returns `dry_run: true`, `no_send: true`,
  `local_write_performed: false`, `external_write_performed: false`,
  `send_enabled: false`, and future gated phrase
  `APPROVE_PARENT_WEEKLY_UPDATE_SEND`.
- Added focused contract coverage in
  `tests/community-weekly-updates-contract.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/run-smoke.mjs`.

Verification:

- PASS `node --check server.js`
- PASS smoke runner syntax check
- PASS Operations inline script parse
- PASS focused weekly-update test 8/8
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-local/report.md`
- PASS full `npm test` 415/415
- PASS `git diff --check`
- PASS Railway deployment `f03ccc1f-a64d-43db-8907-70f6c62d46b7`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-31-36-029Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/report.md`

Guardrail: the focused live smoke used synthetic recipients only, intercepted
one recipient-preview GET, and recorded zero write/send attempts. No real
parent email was written into the smoke report, and no email, WhatsApp, portal
message, communication log, Buffer/social action, Google/Drive action,
external CRM write, parent-announcement write, or test-send/live-send action
was triggered.

## 2026-06-15T06:41:39+03:00 - Admin Role Policy Matrix Deployed

Completed the no-write role/access policy readback slice of item 6.

- Replaced the generic Admin > Roles placeholder with a real read-only Role /
  Access Policy Matrix.
- The matrix covers Super Admin / Operator, BNA School Admin / Rabbi, Parent /
  Primary Contact, Second Parent / Spouse, Student, Service Provider / Rabbi
  Sheller, Community Member, and Codex / Agent Work.
- It names the current workspace scope, access state, guardrail, and approval
  gates for weekly update sends, parent password setup, Google live adapters,
  and One Time member-library publishing.
- Second-parent/spouse and community-member access remain policy-gated; this
  did not create invitations, grants, sends, tokens, or credential workflows.
- Added focused coverage in `tests/operations-pwa-login.test.js`.
- Added reusable Playwright smoke:
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/run-smoke.mjs`.

Verification:

- PASS `node --check server.js`
- PASS smoke runner syntax check
- PASS Operations inline script parse
- PASS focused Operations PWA/login test 7/7
- PASS local Playwright smoke:
  `ops/playwright-smokes/2026-06-15-admin-role-policy-local/report.md`
- PASS full `npm test` 416/416
- PASS `git diff --check`
- PASS Railway deployment `8098d014-5857-44b0-bffa-c94458917802`
- PASS Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T03-41-18-298Z-live-app-smoke.md`
- PASS focused live Playwright smoke:
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/report.md`

Guardrail: focused live smoke recorded zero write requests after login. No
invitation, login token, password reset, email, WhatsApp, access grant, billing
change, Google/Drive action, Buffer/social action, One Time publishing action,
external connector write, or external CRM write was triggered.

## Recommended Next Phase

Use the shipped backend/UI foundation and avoid broad rewrites. The next
highest-value follow-up is choosing the actual approved weekly update
copy/media in Operations and finishing the role/email policy decisions for
spouse/rabbi/community access.

Do not mark remaining app-visible work complete after local checks only. Deploy, run Railway doctor, run live app smoke, and record the evidence before closing each deployable task.
