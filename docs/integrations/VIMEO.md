# Vimeo Integration

Date checked: 2026-06-19

Scope: One Time Mishnah Class video library, upload planning, embed planning, and readiness checks. This file contains no secrets.

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
  - manual Vimeo URL attachment preview
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
- Upload, privacy, folder, and webhook writes are not enabled by this follow-up batch.
