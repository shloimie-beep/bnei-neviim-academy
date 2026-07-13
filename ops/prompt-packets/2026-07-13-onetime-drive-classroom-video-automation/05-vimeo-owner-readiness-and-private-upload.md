# Packet 05 - Vimeo Owner Readiness And Private Upload

Parent raw ID: `RAW-20260713-004`

Packet ID: `PKT-20260713-004-05`

Requirement: `REQ-20260713-918`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

Status: Needs operator decision

## Scope

This packet covers Vimeo owner/account readiness, private synthetic upload
gating, duplicate/retry/playback evidence requirements, and rollback/test-only
guardrails.

Out of scope until explicitly approved: real class upload, synthetic upload,
Vimeo privacy/folder mutation, metadata edit, public publishing, member
publication, Drive/database writes, sends, payment/access changes, DNS,
credential mutation, and raw token printing.

## Evidence

| Check | Result |
|---|---|
| Supplied owner values as direct Bearer token candidates | Both newly supplied values returned 401 on direct `/me` bearer readback, so they are not installed as `VIMEO_ACCESS_TOKEN`. |
| Supplied owner values as app credentials | First supplied value as `client_id` plus second supplied value as `client_secret` returned 200 for Vimeo client-credentials public auth; reverse ordering failed; returned token was not stored. |
| Existing local `VIMEO_ACCESS_TOKEN` readback | Read-only `/me` works from keyholder and reads account name `Shloimie Dratler`; account URI is redacted in evidence and the account field read back as `free`. |
| `node scripts/vimeo-private-smoke.mjs --json` | Returned `preview_only`; `BNA_VIMEO_PRIVATE_SMOKE` was not enabled; token source was keyholder; `external_write_performed=false`; no upload ran. |
| Read-only owner-confirmed capability check | Returned `test_target_missing`: owner account read works, but no Vimeo private test project/folder is configured. |

## Decision Needed

`REQ-20260713-918` cannot be marked Done until the operator chooses or creates a
private Vimeo test project/folder, confirms the owner user access token has the
needed upload/private/edit/video_files capability, and explicitly approves a
synthetic private upload smoke.

Recommended next action:

1. In Vimeo owner account, choose or create a private test folder/project for
   One Time synthetic upload proof.
2. Provide its project/folder name or URI through the approved secret/runtime
   config path as `VIMEO_TEST_PROJECT_URI` or `VIMEO_TEST_PROJECT_NAME`.
3. Keep the supplied owner values stored/used as `VIMEO_CLIENT_ID` and
   `VIMEO_CLIENT_SECRET`, not as `VIMEO_ACCESS_TOKEN`.
4. Confirm or generate the owner user access token for `VIMEO_ACCESS_TOKEN`
   with API upload plus private, edit, and video_files behavior.
5. Explicitly approve the non-sensitive synthetic upload smoke before setting
   `BNA_VIMEO_PRIVATE_SMOKE=1`.

## Guardrails

- No token value was printed or stored in tracked files.
- No Vimeo upload, folder attach, privacy change, metadata edit, delete, or
  public publish was performed.
- No Drive write, database write, member publication, payment/access mutation,
  provider mutation, or external send was performed.

## Handoff

Next packet after this decision is resolved: `PKT-20260713-004-06` for class
package, classroom/latest-video, and member-library persistence/readback.
