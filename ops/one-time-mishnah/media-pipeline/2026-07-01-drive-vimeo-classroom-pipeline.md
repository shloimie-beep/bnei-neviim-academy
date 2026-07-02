# One Time Drive / Vimeo / Classroom Pipeline Readback - 2026-07-01

Requirement: `REQ-20260701-611`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Scope And Safety

- Inspected only the BNA keyholder folder for Vimeo-named credential files.
- Read only the exact keyholder files `vimeo-client-id.txt` and
  `vimeo-client-secret.txt`.
- Did not search Downloads, glob all text files, or inspect unrelated personal
  files.
- Did not print, commit, screenshot, or paste any secret value.
- Did not run a Vimeo upload, change Vimeo folders, publish media, or touch
  production class media.

## Redacted Credential Readback

| Keyholder file | Present | Trimmed length | SHA-256 fingerprint prefix |
|---|---:|---:|---|
| `vimeo-client-id.txt` | yes | 40 | `a1ce14a700bb` |
| `vimeo-client-secret.txt` | yes | 128 | `8bbbec6b699d` |

No `VIMEO_ACCESS_TOKEN` file was found in the Vimeo-named keyholder filename
scan. Client ID and client secret alone are not enough to run the current
server-side Vimeo auth/readiness helpers.

## Current Runnable Path

1. Record the class using OBS or Zoom recording.
2. Place the source video in the approved Drive/dropoff location.
3. Review the source video, transcript, title, description, and class metadata.
4. Upload to Vimeo manually after review using private or unlisted privacy
   settings and approved embed/domain settings.
5. Paste the Vimeo URL into the scoped One Time Operations/member-library
   workflow.
6. Keep the member-library entry as a draft until the provider review and
   access-control gates pass.
7. Publish only to the gated One Time member/classroom surface.

## Future Automated Path

Automated Vimeo API auth, folder checks, upload, privacy updates, and publish
smokes remain blocked until all of the following are available:

- exact keyholder alias or local path for `VIMEO_ACCESS_TOKEN`;
- confirmed Vimeo app/token owner;
- Vimeo seat, plan, quota, and upload-scope decision;
- approved privacy defaults and embed-domain policy;
- private Vimeo test folder or equivalent test destination;
- synthetic non-production video file for upload smoke;
- explicit future approval to run an upload smoke.

The existing integration notes track this as `DEC-20260618-202`.

## Verification

- PASS redacted keyholder metadata readback for the two exact Vimeo files.
- PASS `node --test tests/one-time-media-local-pipeline.test.js`.
- BLOCKED API auth/upload readiness: `VIMEO_ACCESS_TOKEN` was not found in the
  keyholder Vimeo filename scan.

## Guardrails

- No campaign email was sent.
- No WhatsApp message was sent.
- No Stripe or subscription action ran.
- No DNS record was changed.
- No GHL or LeadConnector runtime was added.
- No production media was uploaded, published, deleted, or modified.
