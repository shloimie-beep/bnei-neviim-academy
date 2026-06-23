# One Time Content Library Build

Created: 2026-06-14
Owner: Codex
Status: deployed and verified for the internal review-surface slice

## Operator Intent

The operator approved continuing with the setup email, shorter provider flow,
and the One Time content library. Provider setup email and shorter provider
flow shipped first. The One Time content library review surface is now deployed
and verified; live Operations task #610 is marked done for the internal review
workspace slice.

## Current Foundation

- `create_one_time_video_library_item` already creates scoped One Time
  `bna_content_jobs` and internal `bna_content_outputs` review states.
- One Time preview/onboarding is first-party and no-send.
- Operations Content Library already supports content jobs, outputs, topic/source
  filters, research links, and selected generation.
- One Time records must remain scoped to `one_time_mishnah_class`.

## Required Build

Build a usable One Time content library surface from the existing scoped helper:

- Searchable/reviewable library cards for One Time video items.
- Hosted media URL support before local photos/videos can be attached or
  published.
- Transcript review and transcript display workflow.
- Worksheet/source-sheet generation or review lane.
- Approval queue for member-library visibility.
- Member-library publishing guardrails.
- Reporting/status around drafts, approved items, and blocked items.

## Guardrails

- Do not send email, WhatsApp, SMS, or social posts from this build.
- Do not create checkout links, grant member access, or publish public/member
  visibility without explicit approval.
- Do not write to external CRM or Drive/video hosts until the relevant connector
  and approval path is confirmed.
- Keep BNA school content separate from One Time content.

## Verification Expected

Completed verification:

- PASS `node --check server.js`.
- PASS Operations inline script parse.
- PASS focused One Time/content tests 7/7.
- PASS full `npm test` 382/382.
- PASS local browser/API smoke:
  `ops/playwright-smokes/2026-06-14-one-time-content-library-local/report.md`.
- PASS Railway deployment `4a77ab03-a394-4663-b4b7-55957655c6b0`.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T19-20-41-625Z-live-app-smoke.md`.
- PASS live focused no-send/readback smoke:
  `ops/playwright-smokes/2026-06-14-one-time-content-library-live/report.md`.
- PASS live Operations task #610 marked done with `agent_status: completed`.
- PASS approval decision preview controls deployed and live-smoked:
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`.
- PASS One Time member-library publish-package preview deployed and
  live-smoked:
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-live/report.md`.
- PASS One Time app/admin/member-library access readiness deployed and
  live-smoked:
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-live/report.md`.
- PASS private One Time question moderation queue deployed and live-smoked:
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-live/report.json`.
- PASS One Time thumbnail preview UI deployed and live-smoked:
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md`.
- PASS Rabbi-facing Class Media intake deployed and live dry-run smoked:
  `ops/live-smokes/2026-06-15T05-34-00-000Z-one-time-class-media-intake-live-smoke.md`.

## Completed Build

- Added Operations Content > One Time Library as a dedicated subtab.
- Added shared content search across title, transcript, source URLs, output
  bodies, output metadata, and parsed metadata for library/One Time/selected/
  repurpose sections.
- Added report metrics and output lanes for library card, transcript,
  thumbnail, worksheet/source-sheet, social plan, and newsletter plan.
- Added per-item hosted-media readiness, blocker summaries, approval queue, and
  transcript/worksheet detail sections.
- Added guarded hosted media URL capture through `PATCH
  /api/bna/content-jobs/:id`.
- Server validation rejects non-HTTP(S) `media_url` values before any row
  update.
- Added `preview_one_time_member_library_publish_package` plus card-level
  `Package Preview` wiring. The preview assembles package fields and blockers
  for one scoped One Time content job, but performs no publishing, send, member
  visibility change, checkout/access grant, Drive/video-host write,
  Buffer/social/email/WhatsApp send, external CRM write, or local content
  record update.
- Added private question moderation persistence and readback:
  `bna_one_time_question_reviews`,
  `GET /api/bna/one-time/question-moderation`, and Operations Content > One
  Time Library `Private Question Moderation Queue`. The queue is private,
  no-send, no-forum, no-member-visible, and no-external-write.
- Added `Thumbnail Preview` panels on One Time library cards. The panel reads
  HTTP(S) thumbnail URLs from `thumbnail_brief` metadata, parsed metadata, or
  job thumbnail/image URL fields, renders an image plus `Open Thumbnail`, and
  shows `Thumbnail reference missing` when no URL is saved.
- Added Rabbi provider portal Class Media intake for manual hosted URLs only.
  Submitted items create/update scoped One Time `bna_content_jobs`, standard
  internal output lanes, class-session readback via
  `upsertClassSessionFromContentJob`, and local in-app review notifications.
- Operations One Time Library cards now show `Submitted from Rabbi portal`,
  provider/service/session context, hosted URL readiness, and review blockers
  for Rabbi portal submissions.

## Remaining Decisions

- Actual member-library publishing is now implemented in the first-party app
  for One Time class packages only. It still requires explicit destination
  `member_library`, visibility, audience tier, and exact
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` approval before any member item
  becomes visible.
- The One Time Publishing Approval Packet now has a local `Preview Decision
  Draft` button that calls `create_decision` with `dry_run: true`; it previews
  the approval decision without creating a decision task or publishing/sending/
  checkout/member visibility/Drive/video-host/Buffer/social/external CRM write.
- The One Time publish-package preview can show whether one item is ready for a
  later smoke, but it is still preview-only. Actual publishing remains blocked
  until destination, visibility/audience, hosted media provider, notification
  channels, smoke item, rollback, connector, and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` are explicit.
- Operations Settings > Drive / Social Intake now has a read-only
  `One Time App Readiness` card and
  `GET /api/bna/one-time/app-access-readiness` for app/admin/member-library
  blockers. It performs no admin reset, member access grant, publish,
  Drive/video-host write, send, checkout/billing write, or external CRM write.
- Question moderation can now be reviewed privately in Operations, but any
  public/member answer or forum experience remains future work behind explicit
  destination, visibility, parent/provider safety, send/publish, and rollback
  approval.
- Thumbnail preview is display-only review UI. It does not generate
  thumbnails, upload media, publish, send, grant access, write Drive/video
  hosts, trigger Buffer, or write external systems.
- Rabbi Class Media intake is still internal review only. Manual hosted URLs
  are accepted; binary upload, Drive/Vimeo/member-library publishing, checkout,
  access grants, email/WhatsApp, and public/member visibility remain blocked.
- Drive/video-host writes remain blocked until connector scope/approval is
  confirmed.
- Social/newsletter lanes remain internal plans only; Buffer/email/WhatsApp
  sends must stay separate and approval-gated.

## Update 2026-06-15T10:11:48+03:00 - Member Library Publishing Slice Deployed

- Added additive One Time class package publishing schema:
  `one_time_class_assets`, `one_time_member_library_items`,
  `one_time_member_access`, and `one_time_library_publish_events`, plus package
  columns on `bna_class_sessions`.
- Added admin APIs under `/api/bna/one-time/classes...` for class-package
  create/edit, linked asset capture, package preview, member preview, approval,
  publish, rollback, and smoke verification.
- Added public `GET /api/member-library?code=...` and `/member-library`, which
  show only active-code, tier-visible, `published` member-library items and do
  not expose approval flags, rollback metadata, private transcript notes, or
  unrelated BNA student/accounting data.
- Added Operations Content > One Time Library `Class Package Manager` for
  Vimeo/manual hosted URLs, linked worksheets/source sheets, explicit publish
  targeting, rollback, and smoke.
- Guardrails preserved: no real Vimeo upload/API, no Drive/video-host write, no
  checkout/access grant outside the One Time access-code table, no email,
  WhatsApp, Buffer/social, external CRM, or student goal-checkoff portal merge.
- Verification passed: `node --check server.js`; `node --check`
  `scripts/telegram-kimi-bridge.mjs`; `node --check`
  `scripts/agent-fleet-supervisor.mjs`; Operations/member page inline script
  parse; `node --test tests/one-time-member-library.test.js` 7/7; overlapping
  One Time regression tests 46/46; full `npm test` 470/470.
- Local smoke harness did not start because its env validation rejected the
  local `DATABASE_URL` value as not useful.
- Deployed Railway deployment
  `16920b4a-751a-4ee3-8534-9193a2739a7c`, Railway doctor SUCCESS, live app
  smoke passed at
  `ops/live-smokes/2026-06-15T07-09-28-789Z-live-app-smoke.md`, focused
  member-library smoke passed at
  `ops/live-smokes/2026-06-15T07-10-48-018Z-one-time-member-library-live-smoke.md`,
  and Browser verified `/member-library` renders the access-code surface.
