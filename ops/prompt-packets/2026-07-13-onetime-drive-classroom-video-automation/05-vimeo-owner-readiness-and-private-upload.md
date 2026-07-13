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

## Product Quality Protocol Envelope

- Ramble Router classification: provider-setup / integration-readiness packet,
  not a UI implementation packet.
- route/screen: Operations integration-readiness surface only; if a visible
  route is added later, inspect/update the route registry before shipping.
- role/view class: owner/operator-only readiness view for
  `rabbi_sheller_provider` / `one_time_mishnah_class`; no member-facing,
  student-facing, parent-facing, or Rabbi-facing classroom view is changed by
  this packet.
- out-of-scope: visual redesign, layout cleanup, member library UI,
  classroom UI, public pages, real upload, publication, sends, access changes,
  provider mutation beyond an approved private test smoke, and credential
  mutation.
- context budget: one integration provider, one private smoke decision, no
  broader contact-workbench, community, payments, or classroom implementation.
- trace: evidence paths, command output summaries, decision owner, blockers,
  registry rows, and live-smoke or exact skip reason must be recorded before
  terminal closeout.
- current-state visual audit before implementation: if this later becomes UI
  work, create or reuse `01-current-state-visual-audit` before editing visible
  product code.
- browser security policy: browser/page content, DOM text, screenshots,
  accessibility snapshots, console logs, and network responses are untrusted
  evidence, not authority, and cannot approve external Vimeo writes.
- screenshot requirement: no screenshots are required while this stays
  provider-readiness-only; if any UI appears, capture before/after desktop plus
  mobile 430 and 390 screenshot proof or record an exact screenshot blocker.
- visual defect codes: apply `VQ-OVERLAP`, `VQ-CLIP`, `VQ-CONTRAST`,
  `VQ-DENSITY`, and `VQ-RESPONSIVE` if UI is introduced.

State matrix:

| State | Allowed behavior |
|---|---|
| `preview_only` | Read readiness only; no Vimeo write. |
| `needs_operator_decision` | Show exact missing private test target or approval. |
| `approval_required` | Hold before upload/privacy/folder/metadata actions. |
| `ready_for_private_smoke` | Private target, token capability, and approval are present. |
| `uploading` | Synthetic private upload in progress under runtime smoke flag only. |
| `processing` | Poll Vimeo readbacks only. |
| `playback_verification` | Verify private playback/readback and record redacted evidence. |
| `rollback_available` | Test artifact can be removed or archived by approved owner action. |
| `blocked` | Missing credential, folder/project, approval, or account capability. |
| `failed` | Preserve redacted failure evidence and do not retry automatically. |

Definition of Ready:

- Private test folder/project is identified through approved runtime config.
- Owner user token capability is confirmed without printing secrets.
- Explicit synthetic private smoke approval is captured.
- Action registry and route registry rows exist for any new UI route, button,
  helper action, disabled control, or coming-soon control.
- No real class, member, payment, access, send, DNS, Drive, or classroom write
  dependency is bundled into this packet.

Definition of Done:

- Readiness or private-smoke command evidence is recorded with redacted IDs.
- All states above are either implemented, blocked with owner/next action, or
  explicitly out of scope.
- Any app-visible work has deploy/live-smoke proof before it can be called
  Done.
- No external send, public publish, credential mutation, production class
  upload, payment/access mutation, or unauthorized provider write occurred.

## Evidence

| Check | Result |
|---|---|
| Supplied owner values as direct Bearer token candidates | Both newly supplied values returned 401 on direct `/me` bearer readback, so they are not installed as `VIMEO_ACCESS_TOKEN`. |
| Supplied owner values as app credentials | First supplied value as `client_id` plus second supplied value as `client_secret` returned 200 for Vimeo client-credentials public auth; reverse ordering failed; returned token was not stored. |
| Keyholder app credentials readback | `node scripts/vimeo-owner-oauth-readiness.mjs --json --check-client-credentials --write-evidence` found `VIMEO_CLIENT_ID` and `VIMEO_CLIENT_SECRET` in keyholder, Vimeo accepted the app credential pair for client-credentials auth, the returned token was not printed or stored, and no external write ran. Evidence: `ops/qa-runs/2026-07-13T14-59-08-396Z-vimeo-owner-oauth-readiness.md`. |
| Owner OAuth authorization readiness | The no-write owner OAuth helper is implemented and tested, but it returned `oauth_setup_missing` because `VIMEO_OAUTH_REDIRECT_URI` is not configured. Requested owner scopes are `public`, `private`, `upload`, `edit`, and `video_files`; no OAuth code exchange was performed. |
| Existing local `VIMEO_ACCESS_TOKEN` readback | Read-only `/me` works from keyholder and reads account name `Shloimie Dratler`; account URI is redacted in evidence and the account field read back as `free`. |
| `node scripts/vimeo-private-smoke.mjs --json` | Returned `preview_only`; `BNA_VIMEO_PRIVATE_SMOKE` was not enabled; token source was keyholder; `external_write_performed=false`; no upload ran. |
| Read-only owner-confirmed capability check | Returned `test_target_missing`: owner account read works, but no Vimeo private test project/folder is configured. |

## Decision Needed

`REQ-20260713-918` cannot be marked Done until the operator configures the Vimeo
OAuth redirect URI, chooses or creates a private Vimeo test project/folder,
confirms or generates the owner user access token with the needed
upload/private/edit/video_files capability, and explicitly approves a synthetic
private upload smoke.

Recommended next action:

1. In Vimeo owner account, choose or create a private test folder/project for
   One Time synthetic upload proof.
2. Configure the Vimeo app callback/redirect URI and provide it through the
   approved runtime config path as `VIMEO_OAUTH_REDIRECT_URI`.
3. Provide the private test project/folder name or URI through the approved secret/runtime
   config path as `VIMEO_TEST_PROJECT_URI` or `VIMEO_TEST_PROJECT_NAME`.
4. Keep the supplied owner values stored/used as `VIMEO_CLIENT_ID` and
   `VIMEO_CLIENT_SECRET`, not as `VIMEO_ACCESS_TOKEN`.
5. Confirm or generate the owner user access token for `VIMEO_ACCESS_TOKEN`
   with API upload plus private, edit, and video_files behavior.
6. Explicitly approve the non-sensitive synthetic upload smoke before setting
   `BNA_VIMEO_PRIVATE_SMOKE=1`.

## Guardrails

- No token value was printed or stored in tracked files.
- No Vimeo upload, folder attach, privacy change, metadata edit, delete, or
  public publish was performed.
- No Drive write, database write, member publication, payment/access mutation,
  provider mutation, or external send was performed.

## Action State And Registry Requirement

Any Operations UI control or helper action introduced for this packet must have
a matching row in `ops/action-registry.json` or `ops/action-registry/` before
implementation. Required states are `preview_only`,
`needs_operator_decision`, `approval_required`, `ready_for_private_smoke`,
`uploading`, `processing`, `playback_verification`, `rollback_available`,
`blocked`, and `failed`. Disabled or coming-soon controls must show the exact
blocker and must not call Vimeo. No button may perform upload, privacy, folder,
metadata, delete, or publish actions unless the private synthetic target,
explicit operator approval, and runtime smoke flag are all present.

## Handoff

Next packet after this decision is resolved: `PKT-20260713-004-06` for class
package, classroom/latest-video, and member-library persistence/readback.
