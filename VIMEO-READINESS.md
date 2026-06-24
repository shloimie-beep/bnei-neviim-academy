# Vimeo Readiness

Goal: `BNA VIMEO - COMPLETE SAFE MEDIA INTEGRATION AND PRIVATE TESTING`

Branch: `codex/closeout-vimeo-media-20260624`

Base inspected: `integration/20260619-platform-finish` at `25609511`.

Start-contract note: `CONTROL.json` and `SHARED-PATCH.diff` were not present
anywhere under this checkout, so no route/UI patch was applied. This lane kept
changes inside Vimeo/media modules, tests, smoke tooling, and evidence files.

## Implemented Contract

- Vimeo client wrapper with timeout, redacted errors, and retry-aware requests:
  `src/lib/integrations/vimeo.js`.
- Token capability readiness check with exact Vimeo states.
- TUS-style upload request construction with private/unlisted privacy mapping.
- Mockable upload flow with progress events, retry handling, duplicate
  protection, metadata update, project/folder attachment, and no public publish.
- Metadata, thumbnail, playback, deleted, and unavailable normalization.
- Workspace/provider ownership and member entitlement checks.
- Class-session and transcript linkage payload with audit event.
- Private synthetic smoke command:
  `node scripts/vimeo-private-smoke.mjs --json`.
- Backward-compatible legacy status aliases are retained for older helper
  surfaces, while new primary Vimeo readiness fields use the exact state list.

## Exact Readiness States

| State | Meaning | Non-ready reason and next action |
| --- | --- | --- |
| `not_configured` | No video-hosting/Vimeo decision is configured. | Configure the Vimeo/video-hosting provider choice. |
| `preview_only` | Safe local preview or smoke opt-in missing. | Set only the explicit private-smoke variables after account/target proof exists. |
| `mock_tested` | Contract tests passed with mocks and no provider writes. | Configure a safe private target before provider smoke. |
| `credential_missing` | `VIMEO_ACCESS_TOKEN` is absent. | Store token server-side/keyholder only. |
| `credential_invalid` | Vimeo rejected the token. | Regenerate token in the intended account/app. |
| `permission_missing` | Token/account lacks upload/edit/private capability or quota. | Add required scopes/plan permissions. |
| `test_target_missing` | Intended account, test project/folder, or synthetic asset is missing. | Confirm account and configure test target plus synthetic file. |
| `private_test_ready` | Token/account/test target are ready for synthetic private smoke. | Run private smoke with private/unlisted defaults. |
| `private_test_uploaded` | Synthetic private test asset uploaded or duplicate-protected. | Verify playback, metadata, and cleanup/test-only marking. |
| `manual_ready` | Manual Vimeo URL attachment is safe for review. | Keep approval, playback, transcript, and entitlement gates. |
| `automated_ready` | Automated upload path has passed required private smoke criteria. | Use only for approved scoped uploads, never public by default. |
| `live` | Live member playback is verified after deploy/live smoke. | Continue monitoring privacy, entitlement, and availability. |

No readiness state uses a bare `Blocked`.

## Vimeo Setup Instructions

Official references:

- Vimeo API start: https://developer.vimeo.com/api/guides/start
- Vimeo authentication: https://developer.vimeo.com/api/authentication
- Vimeo uploads: https://developer.vimeo.com/api/upload/videos
- Vimeo video reference: https://developer.vimeo.com/api/reference/videos

1. Open the Vimeo developer apps area: https://developer.vimeo.com/apps
2. Create or select the BNA/Rabbi-owned app. Do not use a personal production
   account unless ownership/delegation is documented.
3. Generate an access token for the intended test account with these scopes:
   `private`, `upload`, `edit`, and `video_files`.
4. Create a Vimeo project/folder named `BNA Private Tests - Synthetic`, or copy
   the project URI for an equivalent private test folder.
5. Store secrets only in env/keyholder/server secret storage:
   `VIMEO_ACCESS_TOKEN`, `VIMEO_CLIENT_ID`, `VIMEO_CLIENT_SECRET`, optional
   `VIMEO_WEBHOOK_SECRET`.
6. Store non-secret test configuration as env/keyholder/server config:
   `VIMEO_EXPECTED_ACCOUNT_URI`, `VIMEO_EXPECTED_ACCOUNT_NAME`,
   `BNA_VIMEO_TEST_ACCOUNT_CONFIRMED=true`, `VIMEO_TEST_PROJECT_URI` or
   `VIMEO_TEST_PROJECT_NAME`, `BNA_VIMEO_SYNTHETIC_TEST_FILE`,
   `BNA_VIMEO_PRIVATE_SMOKE=1`.
7. The synthetic asset must be a generated non-sensitive test clip. Filename
   must include `synthetic`, `test`, `smoke`, `fixture`, or `sample`. Do not use
   any real class recording, student video, private transcript, or production
   asset.
8. Run validation:
   `node --test tests/vimeo-media-integration-readiness.test.js`.
9. Run private smoke only after the safety values above exist:
   `node scripts/vimeo-private-smoke.mjs --json`.
10. Expected status before upload is `private_test_ready`. Expected status after
    safe synthetic upload is `private_test_uploaded`.

## Automated Upload Acceptance

- Token capability check passes for the intended test account.
- Test project/folder is identified.
- Upload request uses private/unlisted privacy by default.
- Progress events are emitted.
- Retry handles transient `429` or `5xx` errors.
- Duplicate key prevents repeated synthetic uploads.
- Metadata update marks asset as test-only or records cleanup state.
- No real student/class media is uploaded.
- No public publish occurs.
- Redacted asset ID, destination, privacy, upload result, playback result, and
  cleanup/test-only state are recorded.

## Live Member Playback Acceptance

- Vimeo playback/embed URL is available and not deleted/unavailable.
- Video metadata is linked to the correct workspace/provider, class session,
  and transcript reference.
- Member entitlement check allows only matching active workspace/course/library
  entitlement.
- Cross-workspace playback is denied.
- Member-library publish remains approval-gated until deploy/live smoke.
- Public pages never expose private Vimeo URLs, tokens, or raw transcripts.
