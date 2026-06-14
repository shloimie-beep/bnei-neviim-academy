# Inner Dialogue / Community / Bot Release QA - 2026-06-12

Source brief: `C:\Users\User\Downloads\mapping-out-inner-dialogue-between-members-community-dialogue-codex-prompt.md`

## Shipped Scope

- Mobile homepage role-aware navigation and compact hero spots badge.
- English/Hebrew signup parent permission fields with normalized server persistence.
- Four required signup document cards open branded full registration-document pages and return signatures to the opener form.
- Parent permission profile sync from signup/student records.
- Learning-community, membership, community-thread, and community-message schema/API foundation.
- Default BNA learning community `bna-main`.
- Weekly-update schema/API foundation and parent portal newsletter hero rendering.
- Sliding BNA bot widget on public/portal surfaces with safe action-preview integration and community-note posting.
- Guarded `npm run email:smoke` dry-run path.

## Verification

- PASS `npm test` (290/290)
- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-email.mjs`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `npm run email:smoke -- --base=http://127.0.0.1:18081 --to=office@bneineviimacademy.org`
- PASS Railway doctor before deploy
- PASS Railway deployment `21b0a63a-38f2-4f67-b207-c71aa9c7b054` reached `SUCCESS`
- PASS `npm run app:smoke`

Live smoke report:

- `ops/live-smokes/2026-06-12T14-18-01-082Z-live-app-smoke.md`

Visual checks:

- `ops/screenshots/2026-06-12-mobile-home-hero.png`
- `ops/screenshots/2026-06-12-mobile-home-menu.png`
- `ops/screenshots/2026-06-12-mobile-signup-permissions-en.png`
- `ops/screenshots/2026-06-12-mobile-signup-permissions-he.png`
- `ops/screenshots/2026-06-12-mobile-parent-newsletter-hero.png`
- `ops/screenshots/2026-06-12-mobile-bot-widget-parent.png`
- `ops/screenshots/2026-06-12-mobile-bot-widget-public-aligned.png`

Extra production probe after deploy:

- `/api/bna/learning-communities?workspace=bna` returned `bna-main`.
- `/api/bna/weekly-updates?workspace=bna` returned an empty update list, as no approved update has been selected yet.
- `/js/bna-bot-widget.js` returned 200.
- Anonymous `/api/portal-bot/actions?surface=public` returned 401, confirming portal actions are session-gated.

## Document Page Follow-Up

- PASS `node --check server.js`
- PASS `node --check public/js/signup-documents.js`
- PASS `node --check public/js/registration-document-page.js`
- PASS `node --test tests/signup-permissions-mobile-homepage.test.js` (4/4)
- PASS local mobile Playwright signup flow: opening/signing Tuition preserved typed form data, wrote `tuition_agreement` into `bnaSignupDocumentSignatures`, updated the card to signed, and kept signup overflow at `0`.
- PASS local mobile Hebrew document page: `lang="he"`, `dir="rtl"`, Hebrew title, loaded content, and overflow `0`.
- PASS `npm test` (295/295)
- PASS Railway deployment `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d` reached `SUCCESS`
- PASS live app smoke: `ops/live-smokes/2026-06-12T14-42-47-439Z-live-app-smoke.md`
- PASS production probe: English Tuition document page, Hebrew Student Handbook document page, and `/js/registration-document-page.js` returned 200 from `https://bneineviimacademy.org`.

Additional screenshots:

- `ops/screenshots/2026-06-12-mobile-signup-document-page.png`
- `ops/screenshots/2026-06-12-mobile-signup-document-page-he.png`

## Remaining Follow-Ups

- Choose approved weekly update copy and pool/talking-head media for the first parent newsletter hero.
- Run a full Hebrew student portal visible-string and screenshot audit.
- Finish the broader login/email policy for spouse/rabbi/community roles before creating more account types.
- Capture the remaining mobile matrix for login, student, document states, and authenticated parent/provider flows.
