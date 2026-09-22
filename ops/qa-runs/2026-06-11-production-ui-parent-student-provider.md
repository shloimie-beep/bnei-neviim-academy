# Production UI Parent/Student/Provider QA Fix Pass

Date: 2026-06-11

## Summary

Re-verified the parent portal, student workspace, provider participant portal,
and parent/student calendar after the focused P0 polish pass. This pass did not
redo the whole admin dashboard; Operations was touched only where it wires shell
routing and action registry behavior.

Drive screenshot folder could not be opened from this environment because it
requires Google login/API access. Local structured audit artifacts and local
screenshots were used instead.

## Files Changed In This Pass

- `public/parent.html`
- `public/student.html`
- `public/operations.html`
- `server.js`
- `scripts/telegram-kimi-bridge.mjs`
- `src/lib/actions/types.js`
- `src/lib/actions/permissions.js`
- `src/lib/actions/registry.js`
- `src/lib/actions/actions/operations.js`
- `src/lib/actions/audit-log.js`
- `src/lib/actions/runner.js`
- `src/lib/actions/page-action-map.js`
- `src/lib/bna/telegram-action-router.js`
- `ops/action-registry/actions.json`
- `ops/action-registry/page-action-map.json`
- `ops/action-registry/ui-button-map.md`
- `tests/action-registry-telegram-ui-bot.test.js`
- `TASKS.md`
- QA reports and screenshot artifacts under `ops/qa-runs/`

## Screenshots Generated

Screenshot folder:

`ops/qa-runs/2026-06-11-master-execution-screenshots/`

Generated 165 PNG screenshots plus:

- `manifest.json`
- `issues.csv`

Viewports:

- 360x800
- 390x844
- 430x932
- 768x1024
- 1440x1000

Screens covered:

- Parent: home, children, calendar, learning, messages/help, providers,
  account, help assistant open, mobile nav open, calendar month/week/detail,
  English, Hebrew.
- Student: overview, calendar, goals, assignments, questions, documents,
  bot/help/account, helper open, mobile nav open, calendar month/week/detail,
  English, Hebrew.
- Provider participant: home, schedule, worksheets, questions/posts,
  messages/help, payment/access, account, mobile nav open.

Automated screenshot result:

- `issues.csv` contains only the header.
- No horizontal overflow found across the screenshot matrix.

## Language QA

Parent portal:

- English screenshots use English navigation, labels, helper text, calendar
  controls, empty states, and buttons.
- Hebrew screenshots set RTL direction and use Hebrew UI chrome.
- Hebrew names/source/content are allowed to remain Hebrew in English UI.

Student workspace:

- English screenshots use English navigation, labels, helper text, calendar
  controls, empty states, and buttons.
- Hebrew screenshots set RTL direction and use Hebrew UI chrome.
- Torah source names/text and student-entered content are allowed to remain
  Hebrew.

Provider participant:

- Provider portal uses participant/member language, not BNA student/accountability
  language.

Remaining language issue:

- Screenshot text extraction shows mojibake for symbol characters in the report
  manifest text samples, but the screenshots themselves render normal UI icons.
  This is an artifact of text serialization, not a visible UI issue.

## Parent Portal QA

Passed:

- Parent nav is simple and scoped: Home, My Children, Calendar,
  Assignments / Questions / Documents, Messages / Help, Provider Index, Account.
- Parent context and selected child context are visible.
- Child overview is parent-visible only.
- Parent calendar loads without Google connected.
- Parent calendar mobile view is list/agenda first and readable.
- Assignments/questions/documents are grouped in one section.
- Messages/help and account/password help are visible.
- Parent help assistant entry is visible.
- Parent portal excludes admin-only analysis and private notes in tests.
- No horizontal scroll on 360, 390, 430, 768, or 1440 screenshots.

Remaining P1 polish:

- Desktop parent floating help/WhatsApp docks can still visually cover low
  priority card space near the lower-right area. They do not block navigation or
  primary buttons in the generated screenshots.

## Student Workspace QA

Passed:

- Student nav is scoped: Home, Calendar, Goals, Assignments, Questions,
  Documents, Ask Helper, Account.
- Today/overview view shows next work and active learning items.
- Student calendar loads without Google connected.
- Student mobile calendar defaults to readable list/agenda presentation.
- Goals, assignments, questions, documents, helper, and account/help are
  reachable.
- Student helper entry is visible and student-facing.
- No admin controls or other-student data were visible in portal screenshots or
  contract tests.
- No horizontal scroll on 360, 390, 430, 768, or 1440 screenshots.

Remaining P1 polish:

- On one mobile student calendar detail screenshot, the helper dock sits near
  connector status text. It does not block nav or action buttons, but it can be
  tightened further in a later polish pass.

## Provider Participant QA

Passed:

- Provider participant nav is separate: Home, Program / Class, Schedule,
  Worksheets / Source Sheets, Questions / Posts, Messages / Help,
  Payment / Access, Account.
- Provider page uses participant/member language.
- Provider page does not show BNA goals, check-ins, school accountability,
  student calendar, admin notes, or private BNA school data.
- Schedule is simple and readable rather than the full BNA calendar.
- Worksheets/source sheets, questions/posts, messages/help, and payment/access
  states are present.
- Mobile nav is usable.

Remaining issue:

- No P0/P1 provider-separation issue found.

## Calendar QA

Passed:

- Parent calendar loads.
- Student calendar loads.
- Mobile calendar is readable at 360, 390, and 430 widths.
- Mobile defaults to list/agenda, not a tiny month grid.
- Desktop month/week/list controls are present.
- Today, Previous, Next controls are present.
- Event detail drawer/sheet opens and has close/back path.
- Event cards show title, date/time, type, source badge, visibility badge, and
  related object context where available.
- Google Calendar and Google Classroom disconnected states render as connector
  status cards and do not break the page.
- Internal calendar events render first.
- Provider users see a simple schedule, not the BNA full calendar.

Remaining calendar issue:

- No P0 issue remains. Lighthouse still shows homepage performance work
  unrelated to the parent/student calendar itself.

## Buttons And Actions QA

Passed:

- User-facing primary actions are visible and consistently styled.
- Unsupported connector actions remain dry-run/approval/config gated.
- No raw browser buttons were found in the screenshot QA scope.
- Drawers/modals include close/back paths.
- Action registry now gives UI and bot flows typed backend actions.

Remaining P1/P2:

- Broad secondary admin/settings buttons still need complete action-map coverage
  outside this focused parent/student/provider pass.

## Tests And Commands

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS focused action/portal tests 46/46
- PASS `npm test` 268/268
- PASS `npm run screenshot`: no horizontal scroll at 360/390/430/768/1440
- PASS `npm run app:smoke`
  `ops/live-smokes/2026-06-11T12-42-55-641Z-live-app-smoke.md`
- PASS `npm run openai:smoke`
  `ops/openai-smokes/2026-06-11T12-43-12-855Z-openai-sidekick-smoke.md`
- PASS `npm run railway:doctor`
- PARTIAL `npm run lighthouse`: `lighthouse-report.html` written, then command
  exited 1 due Windows Chrome temp cleanup `EPERM`. Extracted scores:
  performance 63, accessibility 84, best-practices 100, SEO 100,
  agentic-browsing 50.

## Deployment Blocker

No deploy was performed.

Reason:

- The workspace contains many unrelated dirty changes from earlier work. Shipping
  the full dirty tree would risk uploading unrelated archive moves, docs,
  content-memory files, scripts, screenshots, and historical app deletions.

Changed files from this pass are listed above.

Unrelated dirty files are recorded separately in:

`ops/qa-runs/2026-06-11-master-execution-git-status.txt`

Recommended branch/commit strategy:

- Commit or stash unrelated pre-existing work first.
- Commit this pass as a focused parent/student/provider UI plus action registry
  changeset.
- Deploy only from a clean branch after reviewing the git-status snapshot.

## Readiness

- Parent portal: ready for real parent review with one P1 floating-dock polish
  note.
- Student portal: ready for real student review with one P1 helper-dock polish
  note.
- Provider participant portal: ready for real provider participant review.
- Calendar: ready for parent/student review; mobile list/detail behavior is
  readable and Google disconnected state is safe.
