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
- Hebrew/RTL support exists in parent/student portal tests and current static pages, but the master prompt still requires a full visible-string audit and mobile screenshot pass before closing the Hebrew task.
- Operations already has internal-first primitives: `bna_project_members`, `bna_internal_threads`, `bna_internal_messages`, `bna_bot_action_logs`, workspace settings, connector settings, internal calendar events, pipeline cards, support tickets, and typed action endpoints.
- The shared Action Registry already exists under `src/lib/actions/`, with bot preview/execute endpoints in `server.js`. The exact MVP action names from this prompt are not all present.
- Parent portal already surfaces a latest weekly update block when payload data exists, but it is not yet the requested polished newsletter hero with selected pool/talking-head media, arrows/history, and admin-selected weekly update data model.

## Remaining Follow-Up Gaps From The Master Prompt

- Parent/student/provider login foundations exist. Spouse access and broader rabbi/community login policy still need product decisions before adding more account roles.
- Parent and student reset/onboarding email foundations exist, and guarded email smoke exists, but a new full onboarding campaign was not sent or expanded.
- Student Hebrew/RTL has a translation system and current tests, but the master prompt's "every visible student string" audit should get a full screenshot/string pass before closure.
- Weekly-update hero/admin data model is live, but approved weekly copy and pool/talking-head media still need operator selection. No placeholder was promoted as the official update.
- Mobile screenshots were captured for homepage, signup permissions, parent newsletter hero, and bot drawer. Full matrix coverage for login, student, all document states, and authenticated parent/provider flows remains as a separate QA task.

## Tracked Child Tasks

1. Audit live runtime and overlapping agent work for BNA community/dialogue build
2. Normalize BNA brand kit across public, operations, parent, student, and form pages
3. Fix mobile public navigation, hamburger menu, and hero CTA placement
4. Rebuild signup flow into four signed document pages
5. Add parent permission fields for leaving, swimming, food, money, and pickup responsibility
6. Implement parent, spouse, student, rabbi, and service-provider login model
7. Add onboarding and reset emails for parent and student access
8. Complete Hebrew and RTL audit for student-facing pages
9. Build learning community roles and membership model
10. Build internal dialogue/forum between community members
11. Build sliding in-app AI bot widget
12. Connect bot widget to safe backend tool/action registry
13. Add newsletter hero to parent dashboard
14. Retrieve or select approved weekly newsletter copy and pool/talking-head media
15. Add email smoke tests and send controlled test email to office/operator account
16. Add mobile screenshot smoke tests for homepage, forms, documents, login, parent, student, and bot
17. Deploy, smoke live routes, update changelog, ledger, memory, and task statuses

Completed in this release: 1, 3, 4, 5, 9, 10, 11, 12, 13, 15, and the deploy/smoke/tracking part of 17.

Still open or partial: 2, 6, 7, 8, 14, and full matrix coverage for 16.

## Recommended Next Phase

Use the shipped backend/UI foundation and avoid broad rewrites. The next highest-value follow-up is a full Hebrew student portal audit with screenshots, because it is user-visible and has clear acceptance criteria. After that, select approved weekly update copy/media in Operations and finish the role/email policy decisions for spouse/rabbi/community access.

Do not mark remaining app-visible work complete after local checks only. Deploy, run Railway doctor, run live app smoke, and record the evidence before closing each deployable task.
