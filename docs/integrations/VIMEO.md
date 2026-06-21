# Vimeo Integration

Date checked: 2026-06-19

Scope: One Time Mishnah Class video library, upload planning, embed planning, and readiness checks. This file contains no secrets.

Provider decision: Vimeo is the selected video-hosting direction for One Time.
Manual Vimeo URL attachment is the usable first-party path now. Automated
uploads remain disabled until the authenticated Vimeo user/token and upload
capability are explicitly approved.

## Official Documentation

- API quickstart: https://developer.vimeo.com/api/guides/start
- Authentication: https://developer.vimeo.com/api/authentication
- Upload videos: https://developer.vimeo.com/api/upload/videos

## Current Local Implementation

- Adapter: `src/lib/integrations/vimeo.js`
- Existing safe operations:
  - normalize/redact token input
  - read-only `/me` auth check
  - read-only folder/listing helpers
  - no-write upload intent preview
  - no-write recording/transcript/summary/Vimeo pipeline preview for `REQ-20260619-308`
  - no-write publication readiness preview
  - no-write retention/deletion preview
  - manual Vimeo URL validation and metadata assignment
  - approval-gated first-party member-library publish/unpublish through
    Operations Class Package Manager
- External provider writes remain blocked unless an explicit future approval
  gate is passed.

## Configuration Names

Non-secret identifiers may be referenced in Decisions:

- `VIMEO_ACCOUNT_ID`
- `VIMEO_PLAN`

Secrets must be stored only in keyholder/server environment:

- `VIMEO_CLIENT_ID`
- `VIMEO_CLIENT_SECRET`
- `VIMEO_ACCESS_TOKEN`
- `VIMEO_WEBHOOK_SECRET`

## Remaining Required Decision

- `DEC-20260618-202`: Confirm Vimeo seat, authenticated user, token, and
  automated-upload strategy. The provider choice itself is no longer undecided.

Needed before automated provider writes:

- team-seat decision
- app/token owner
- upload scope and plan/quota verification
- approved embed domains/privacy defaults
- callback URL and folder/project assignment
- user-level access token installation

## Local Acceptance

- Readiness checks may run with mocks or server-side test credentials.
- Manual mode is usable now:
  - operator creates/selects a class package;
  - pastes a Vimeo URL;
  - system validates the URL and stores the Vimeo ID;
  - operator assigns Masechta, Perek, Mishnah range, title, date, description,
    thumbnail, transcript state, visibility, and tier;
  - Rabbi/admin reviews;
  - admin approves and publishes to the first-party member library with the
    explicit approval phrase;
  - admin can unpublish/rollback.
- Recording webhook handling, file selection, transcript/summary readiness,
  review/correction/approval states, manual Vimeo ID review, API upload
  readiness, publication, unpublishing, deletion, entitlement, and watch
  progress are modeled as no-write previews.
- Provider upload, provider privacy/folder changes, provider publication,
  provider unpublishing, provider deletion, notification sends, and live
  webhook writes are not enabled by this follow-up batch.
