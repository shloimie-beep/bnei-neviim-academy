# One Time Classroom, Calendar, Community, and Source-Grounded Bot

Created: 2026-06-15T17:35:32+03:00
Owner: Codex
Status: completed, deployed, and live-smoked

## Operator Intent

Build Rabbi Elie / One Time Mishnah Class as the first classroom-style member
space, then reuse the design for BNA's own school community later. The
classroom should organize the Mishnah video library by the six Sedarim, show
live/daily video context, schedule video assignments in BNA's internal calendar,
support Rabbi-led moderated threads, show approved top questions/responses and
leaderboard participation, and keep parent/admin bot safety readback visible.

## Required Guardrails

- BNA internal calendar remains source of truth. Google Classroom/Calendar
  writes stay optional and typed-confirmation gated.
- Students/members do not chat directly with each other. They respond to
  Rabbi/admin class or announcement threads, and responses stay held until
  screening/review approves visibility.
- Leaderboard uses approved participation only: approved questions, approved
  responses, Rabbi-featured items, and assignment participation. Do not expose
  raw private text or create public shame.
- Parent/admin safety readback should show held/inappropriate context where
  appropriate without leaking other students' private text.
- Mishnah student/member bot must answer only from approved transcripts, source
  sheets, assets, assignments, calendar/live-session records, access records,
  Zoom eligibility, and critical-thinking prompts. Unsupported answers route to
  Rabbi/moderation instead of inventing sources.
- Rabbi/admin helper can prepare newsletters, question digests, source-sheet
  prep, schedule previews, and moderation actions, but must not send, publish,
  grant access, write Drive/video hosts, write Google, or touch external systems
  without an explicit approved path.

## Implementation Slices

1. Preserve ramble, task, handoff, ledger, changelog, and memory state.
2. Add reusable curriculum/classroom schema keyed by workspace/project, seed One
   Time's six Sedarim, and link class sessions/assignments/schedule items to
   curriculum/class sessions.
3. Add One Time classroom read APIs for safe member/admin readback: curriculum,
   visible videos, live/today item, calendar items, assignments, approved
   threads, top questions/responses, leaderboard, and source-grounded bot
   context.
4. Add admin APIs for natural-language video assignment preview/create,
   classroom moderation review, feature/unfeature, and leaderboard/audit
   readback.
5. Add Operations and member UI surfaces for classroom readback and scheduling,
   plus parent/student assistant safety/source readback where scoped.
6. Add focused tests, run syntax/tests, then deploy and smoke live when ready.

## Current Foundations To Reuse

- `bna_class_sessions`, `one_time_member_library_items`, `one_time_class_assets`,
  and `/api/member-library` for approved class package/video readback.
- `bna_assignments`, `bna_assignment_students`, `bna_schedule_items`, and the
  existing `planAssignmentSchedule()` parser for natural-language scheduling.
- `bna_learning_communities`, `bna_community_threads`, and
  `bna_community_messages` for classroom threads.
- `bna_one_time_question_reviews` for private question moderation and digest
  readback.
- Universal Assistant routes and action-run/audit tables for scoped bot context.

## Verification Checklist

- PASS `node --check server.js`
- PASS Operations/member/classroom/parent page inline script parse
- PASS `node --test tests/one-time-classroom-calendar-community-bot.test.js`
- PASS focused classroom/member-library/assignment/community/assistant/parent
  suite 55/55
- PASS full `npm test` 605/605
- PASS local in-app Browser smoke for `/one-time-classroom`, `/member-library`,
  Operations One Time Classroom console, and parent assistant safety/WS11 hooks
  on desktop/mobile where applicable
- PASS Railway deployment `5650e674-7717-4a10-b306-f64eb4a72698`
- PASS `npm run railway:doctor` with deployment status `SUCCESS`
- PASS `npm run app:smoke`
  (`ops/live-smokes/2026-06-15T15-07-00-013Z-live-app-smoke.md`)
- PASS focused live classroom smoke: public classroom page, member-library
  classroom strip, parent classroom safety hook, admin classroom readback,
  natural-language assignment preview with `app_only`/no-Google guardrail, and
  member-library smoke rollback
- PASS `npm run app:smoke:public-privacy`
  (`ops/live-smokes/2026-06-15T15-07-51-743Z-public-route-privacy-smoke.md`)

## Completed Implementation Notes

- Added reusable curriculum storage and seeded the six One Time Mishnah Sedarim.
- Linked One Time class sessions, assignments, schedule items, community
  threads/messages, moderation metadata, and participation events to curriculum
  and class sessions.
- Added member-safe One Time classroom APIs and page: visible videos,
  today/live item, internal-calendar assignments, approved Rabbi threads, top
  Q&A, leaderboard, and source-grounded bot.
- Added Operations One Time Classroom Console for natural-language schedule
  preview/create, Rabbi thread creation, moderation review, feature decisions,
  and classroom readback.
- Added parent-scoped classroom safety context and portal rendering for held
  responses tied to the parent's student/email, plus WS11 parent progress hook.
- Kept Google Classroom/Calendar, email, WhatsApp, social, Drive/video-host,
  checkout/access, and external CRM writes out of scope and behind existing
  approval gates.
