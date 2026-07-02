# Vimeo Integration

Date checked: 2026-06-19

Scope: One Time Mishnah Class video library, upload planning, embed planning, and readiness checks. This file contains no secrets.

## Official Documentation

- API quickstart: https://developer.vimeo.com/api/guides/start
- Authentication: https://developer.vimeo.com/api/authentication
- Upload videos: https://developer.vimeo.com/api/upload/videos

## Current Local Implementation

- Adapter: `src/lib/integrations/vimeo.js`
- One Time local media pipeline:
  `src/platform/integrations/media-local-pipeline.js`
- Existing safe operations:
  - normalize/redact token input
  - read-only `/me` auth check
  - read-only folder/listing helpers
  - no-write upload intent preview
  - no-write recording/transcript/summary/Vimeo pipeline preview for `REQ-20260619-308`
  - no-write publication readiness preview
  - no-write retention/deletion preview
  - manual Vimeo URL attachment preview
- One Time media pipeline maps a pasted Vimeo URL into a scoped video asset and
  member-library draft, keeps publication disabled, and records the live upload
  and publish gates.
- External writes remain blocked unless an explicit future approval gate is passed.

## Configuration Names

Non-secret identifiers may be referenced in Decisions:

- `VIMEO_ACCOUNT_ID`
- `VIMEO_PLAN`

Secrets must be stored only in keyholder/server environment:

- `VIMEO_CLIENT_ID`
- `VIMEO_CLIENT_SECRET`
- `VIMEO_ACCESS_TOKEN`
- `VIMEO_WEBHOOK_SECRET`

## Required Decision

- `DEC-20260618-202`: Decide Vimeo seat, user, token, and manual-library strategy.

Needed before writes:

- team-seat decision
- app/token owner
- upload scope and plan/quota verification
- approved embed domains/privacy defaults
- manual upload fallback policy

## Local Acceptance

- Readiness checks may run with mocks or server-side test credentials.
- Recording webhook handling, file selection, transcript/summary readiness,
  review/correction/approval states, manual Vimeo ID review, API upload
  readiness, publication, unpublishing, deletion, entitlement, and watch
  progress are modeled as no-write previews.
- Upload, privacy, folder, publication, unpublishing, deletion, entitlement,
  watch-progress, notification, member-library publish, and webhook writes are
  not enabled by this follow-up batch.
- `node --test tests/one-time-media-local-pipeline.test.js` verifies Vimeo URL
  parsing, idempotent video-reference/library-draft creation, and no upload or
  member-library publication.
