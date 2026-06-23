# Parent, Student, Provider, Calendar Polish QA

Date: 2026-06-11
Scope: focused P0 parent/student-facing portal and calendar fix pass. No deploy.

## Summary

- Cleaned parent and student portal localization state: `data-language`, `dir`, and `lang-en` / `lang-he` body classes now move together.
- Rebuilt parent navigation around user-facing sections only: Home, My Children, Calendar, Assignments / Questions / Documents, Messages / Help, optional Provider Index, Account.
- Reworked parent and student calendar rendering around a reliable internal list/agenda fallback with Month, Week, List / Agenda, Today, Previous, Next, connector status cards, event cards, and detail drawers.
- Made mobile calendar default/read as agenda-first instead of relying on a cramped month grid.
- Added compact parent and student helper entry points with visible safe-scope text and mobile floating behavior that does not cover nav or primary controls.
- Separated provider participant portal as a simple Rabbi Sheller participant page with provider schedule/content/access language and no BNA goals/check-ins/accountability nav.
- Fixed provider participant section visibility so mobile does not stack every panel at once.
- Added/updated portal contract tests for localization, calendar drawer/status behavior, provider separation, and the revised parent nav.

## Files Changed In This Pass

- `public/parent.html`
- `public/student.html`
- `public/provider-participant.html`
- `tests/parent-student-polish-contract.test.js`
- `tests/parent-student-portal-contract.test.js`
- `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/`
- `ops/qa-runs/2026-06-11-parent-student-calendar-polish-git-status.txt`
- `ops/qa-runs/2026-06-11-parent-student-calendar-polish.md`

Generated/updated by required commands:

- `screenshots/*.png`
- `lighthouse-report.html`

## Routes Tested

- `GET /parent` -> 200
- `GET /student` -> 200
- `GET /provider-participant` -> 200
- `GET /provider/member` -> 200

## Screenshots

Folder:

- `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/`

Artifacts:

- `before/` baseline public/login captures
- `after/manifest.json` latest full matrix: 153 screenshots
- `after/issues.csv` latest full matrix overflow findings: 0
- `after/post-helper-width-spotcheck.json` final parent/student mobile helper check: 0 overflow
- `after/post-language-fix-spotcheck.json` final Hebrew RTL check: 0 overflow

Latest full matrix counts:

- Parent: 53
- Student: 57
- Provider participant: 43

Viewports covered:

- 360x800
- 390x844
- 430x932
- 768x1024
- 1440x1000

## Language QA

- Parent English and student English use English UI labels. Hebrew names and Torah/source/content titles remain in their original language.
- Parent Hebrew and student Hebrew set `dir="rtl"` and render Hebrew UI labels for nav, controls, calendar buttons, empty/helper/status text, and visible assignment statuses.
- Parent language toggle now uses neutral `EN` / `HE` codes instead of showing an English word inside Hebrew UI.
- Student raw assignment status leakage was fixed: `assigned`, sync status, and generated/not-generated states render through localized labels.
- Proper names/source badges such as `Bnei Neviim Academy`, `Google Calendar`, and `Classroom` remain as brand/product/source names.

## Parent Portal QA

- Parent nav is simple and user-facing; Settings is no longer a visible parent tab.
- Child switcher, child overview, calendar, learning, messages/help, provider index, and account sections render with stable spacing.
- Parent calendar loads from internal events before Google/Classroom connectors.
- Google Calendar/Classroom disconnected state is visible and does not break the page.
- Parent help assistant entry point is visible and scoped to parent-visible data.
- No admin notes, internal task notes, prompt internals, other-family data, or provider-private data are exposed by the portal UI contracts.

## Student Portal QA

- Student nav is Home, Calendar, Goals, Assignments, Questions, Documents, Ask Helper, Account.
- Today/next meeting/goals/assignments/questions/documents/helper/account sections remain separated.
- Ask BNA Helper entry point is visible and scoped to student-visible profile, calendar, goals, assignments, questions, documents, and permitted notes.
- No admin controls, private parent communications, other students, provider-private data, or raw prompt/configuration are exposed by the student UI contracts.

## Provider Participant QA

- Provider page uses Rabbi Sheller participant framing, not BNA student framing.
- Provider nav is Home, Program / Class, Schedule, Worksheets / Source Sheets, Questions / Posts, Messages / Help, Payment / Access, Account.
- Provider page does not show BNA goals, check-ins, accountability, student calendar, private school data, or admin notes.
- Schedule is simple and readable; unsupported actions are disabled with explanatory text/title.

## Calendar QA

- Parent calendar loads and is readable on desktop and mobile.
- Student calendar loads and is readable on desktop and mobile.
- Mobile calendar uses list/agenda as the primary readable view.
- Month and week controls are available without leaving mobile users stuck in a tiny grid.
- Event cards show title, date/time, type, source, visibility, related item/description where available.
- Detail drawer/sheet opens for events and has a close path.
- Connector status cards explain that the internal calendar works without Google.
- Provider participant page uses a simple schedule, not the full BNA calendar.

## Mobile QA

- Latest full matrix recorded no horizontal overflow.
- Parent/student mobile helper buttons are compact floating entries and do not block nav or primary controls.
- Provider mobile nav opens as a section menu and selected panels no longer all stack on the page.
- 360, 390, and 430px screenshots were generated for parent, student, provider, calendar, helper, and mobile-nav states.

## Tests And Commands

- `node --test tests/parent-student-polish-contract.test.js tests/parent-student-portal-contract.test.js tests/service-provider-directory.test.js` -> PASS, 33/33
- Inline script parse check for `public/parent.html`, `public/student.html`, `public/provider-participant.html` -> PASS
- `npm test` -> PASS, 255/255
- `npm run screenshot` -> PASS, no horizontal scroll at 360, 390, 430, 768, 1440
- `npm run app:smoke` -> PASS
  - Report: `ops/live-smokes/2026-06-11T11-04-41-252Z-live-app-smoke.md`
- `npm run openai:smoke` -> PASS
  - Report: `ops/openai-smokes/2026-06-11T11-05-36-560Z-openai-sidekick-smoke.md`
- `npm run railway:doctor` -> PASS
- `npm run lighthouse` -> HTML report written, then command exited 1 on Windows temp cleanup:
  - Report: `lighthouse-report.html`
  - Failure: `EPERM` deleting `C:\Users\User\AppData\Local\Temp\lighthouse.54871892`
- In-app Browser bridge check -> unavailable:
  - `ECONNREFUSED ::1:9222`
  - Local Playwright screenshots were used for browser verification instead.

## Remaining Blockers / Caveats

- No deploy was performed, per instruction.
- Deployment is blocked by the very dirty workspace. Full exact status snapshot is saved at:
  - `ops/qa-runs/2026-06-11-parent-student-calendar-polish-git-status.txt`
- This pass verified local routes and sample authenticated portal states. A real-account credential smoke should still be done on a clean deploy candidate before sending links broadly.
- Hebrew UI still intentionally contains brand/product/source names and user/content titles that are not translated, such as Bnei Neviim Academy, Google Calendar, Classroom, and assignment titles.
- The mobile helper entry is a floating button; it can cover a small non-control corner of content while visible, but it no longer blocks navigation or primary buttons.

## Deployment Blocker Handling

Changed files from this pass are listed above.

Unrelated dirty files are not included in a deploy candidate by default. The exact full dirty workspace snapshot is in `ops/qa-runs/2026-06-11-parent-student-calendar-polish-git-status.txt`; it includes broad pre-existing docs, archive moves, deleted legacy Next files, content-memory files, ops files, package/config changes, screenshots, and other untracked files outside this focused pass.

Recommended clean branch strategy:

1. Start from a clean branch or commit the unrelated migration/archive work separately.
2. Bring over only the files listed in "Files Changed In This Pass" plus required generated QA artifacts.
3. Run `npm test`, `npm run screenshot`, local portal screenshot QA, and Railway doctor again.
4. Deploy only after the branch contains no unrelated dirty changes.

