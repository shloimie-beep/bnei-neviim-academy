# Live Classes + Tiered Member Access

Recorded: 2026-06-15T10:48:36+03:00

## Scope Completed

Implemented the v1 live Zoom class infrastructure for BNA without adding Google
Classroom/Calendar/Drive automation or Zoom API automation.

Key pieces:
- Added pure access rules in `src/lib/bna/live-access.js`.
- Added idempotent database infrastructure for members, live class series,
  live class sessions, attendance, and communication logs.
- Added protected Operations APIs for member access tiers, access-code
  generation, live sessions, tonight's session, check-in, Zoom-link sending,
  and communication-log readback.
- Added code-gated member portal APIs and `public/member.html`.
- Added Operations `Live Classes` UI for creating/editing sessions, changing
  manual Zoom URLs, managing member tiers, sending dry-run/real Zoom links,
  tracking attendance, and publishing Vimeo recordings.
- Added student profile live-member controls for linked access.
- Added Telegram operator support for live access summaries, tonight's Zoom
  link, explicit Zoom-link changes, and safe send-link commands.

## Guardrails Preserved

- Manual Zoom URLs only.
- No Zoom API integration.
- No Google Classroom, Calendar, or Drive automation.
- Library-only members never receive `zoom_meeting_url` from member APIs.
- Old Zoom URLs are not returned after a link change.
- Generic logs and Telegram snapshots redact Zoom URLs.
- Recordings are member-visible only after `recording_status = 'published'`
  with a Vimeo/recording URL.
- Backfilled members default to `library_only`; payment status is not used to
  infer live access.

## Verification

Passed:
- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- Operations inline script parse with `node:vm`
- `node --test tests/live-access.test.js tests/live-class-infrastructure.test.js`
  11/11
- `npm test` 488/488
- Local endpoint smoke on `127.0.0.1:8091`:
  - migrations/startup completed
  - created one `library_only` member and one `live_plus_library` member
  - created scheduled manual-Zoom live session
  - admin API returned full current Zoom URL
  - library-only portal hid Zoom and showed upgrade/access messaging
  - live-tier portal returned Zoom
  - changed Zoom URL and confirmed old URL was gone from member readback
  - dry-run send logged one dry run
  - ineligible dry-run send logged one skipped attempt
  - communication logs did not store raw Zoom URLs
  - published Vimeo recording was visible to both tiers
  - hidden recording disappeared
- Railway deployment `18c2a0cb-07fc-4ac5-b13d-840307160ff1`
- Railway doctor SUCCESS
- Live app smoke:
  `ops/live-smokes/2026-06-15T07-46-05-810Z-live-app-smoke.md`
- Focused live readback:
  - `/member` served the BNA Member Portal
  - `/api/bna/live-sessions` returned live-session records
  - `/api/bna/members` returned member records
  - `/api/member-portal/live-sessions` without a code returned 400

## Remaining Decisions

- A real Gmail send was not performed because no approved test recipient was
  provided. Dry-run, skipped, and setup-required handling are implemented.
- Production smoke records created for verification were disabled/archived
  because no delete endpoint exists for these new tables.
- Future recurring scheduling, Zoom API creation, Calendar events, Drive/Vimeo
  uploads, and billing/access automation remain separate approval-gated slices.
