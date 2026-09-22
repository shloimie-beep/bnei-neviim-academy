# Media Pipeline Matrix

Goal: `BNA VIMEO - COMPLETE SAFE MEDIA INTEGRATION AND PRIVATE TESTING`

| Capability | Implementation | Verification |
| --- | --- | --- |
| Exact readiness states | `VIMEO_READINESS_STATES`, `vimeoReadinessState`, `checkVimeoTokenCapabilities` in `src/lib/integrations/vimeo.js`; `getVideoHostingReadiness` now exposes exact primary state plus legacy alias. | `tests/vimeo-media-integration-readiness.test.js` |
| Token validation | Read-only `/me` capability check with redacted account metadata. | Configuration, invalid token, permission, missing target, ready-state tests |
| Permission error | Vimeo API errors map to `credential_invalid`, `permission_missing`, or `test_target_missing`. | Permission and invalid-token tests |
| Missing target | Account confirmation and project/folder resolution are required before private smoke. | Missing-target test |
| Mock upload | TUS upload creation and patch upload are mockable and private by default. | Mock upload test |
| Progress | Upload emits 0% and 100% progress events for the resumable patch. | Progress assertions |
| Retry | Retry wrapper handles transient `429`/`5xx` failures. | Mock upload retries first `429` |
| Duplicate | Duplicate key checks local or remote candidate videos before upload. | Duplicate-protection test |
| Metadata | Title, description, class, transcript, workspace, provider owner, test-only flags normalize safely. | Upload request and metadata tests |
| Privacy | Public upload requests are forced to private unless explicitly allowed; no public publish by default. | Privacy assertions and safe-write policy |
| Thumbnail | Vimeo pictures normalize into thumbnail state. | Thumbnail normalization test |
| Playback URL/embed | Vimeo ID/link normalize to playback and embed URLs. | Playback normalization test |
| Deleted video | Deleted assets become denied playback state. | Deleted video test |
| Unavailable playback | Transcoding/error states become unavailable playback state. | Unavailable playback test |
| Member entitlement | Matching active workspace/course/library entitlement is required. | Member entitlement test |
| Cross-workspace denial | Member context workspace must match video workspace. | Cross-workspace denial test |
| Workspace/provider ownership | Metadata and linkage include workspace/project/provider owner fields and audit context. | Upload request/linkage tests |
| Class-session linkage | Vimeo ID/URL links to `class_session_id` with scoped video asset payload. | Class linkage test |
| Transcript linkage | `transcript_id` is carried into video reference and audit evidence. | Transcript linkage test |
| Audit event | `buildVimeoAuditEvent` records redacted asset ID and no public publish. | Linkage test |
| Manual URL attachment | `attachVimeoUrl` returns `manual_ready` and keeps approval-gated library state. | Existing media pipeline tests |
| Automated upload | `uploadVimeoAsset` implements safe upload mechanics but requires synthetic/private preconditions. | Mock upload plus private-smoke gate |
| Private synthetic smoke | `scripts/vimeo-private-smoke.mjs` runs only when all safety env/config values exist. | Smoke command returned safe `preview_only` skip in this environment |
| Secret audit | Token and account secrets are redacted from results. | `assertNoVimeoSecrets` tests and smoke output |
| Route/UI wiring | Not edited in this lane. `SHARED-PATCH.diff` was missing. | Start-contract note in `VIMEO-READINESS.md` |

## Verification Commands

- `node --test tests/vimeo-media-integration-readiness.test.js`
- `node --test tests/provider-integrations-secret-storage.test.js`
- `node --test tests/one-time-media-local-pipeline.test.js`
- `node --test tests/one-time-recording-vimeo-pipeline.test.js`
- `node scripts/vimeo-private-smoke.mjs --json`
- `git diff --check`

## Full Suite Note

`node --test` was run on 2026-06-24. Result: 1137 passing, 2 failing.

The failures are outside this lane:

- `tests/watchdog-action-registry.test.js` - One Time action coverage report
  hash mismatch.
- `tests/watchdog-action-registry.test.js` - Universal action parity report
  hash mismatch.

Those failures require regenerating/updating action-registry artifacts, which
are outside this Vimeo/media lane and conflict with the instruction not to edit
central route/UI/registry wiring in this branch.
