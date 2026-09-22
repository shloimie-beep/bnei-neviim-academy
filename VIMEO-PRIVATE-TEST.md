# Vimeo Private Test

Command run:

`node scripts/vimeo-private-smoke.mjs --json`

Result on this checkout: `preview_only`.

The smoke did not upload because `BNA_VIMEO_PRIVATE_SMOKE=1` is not configured
in this environment. This is the safe expected behavior when the token, intended
test account confirmation, test project/folder, and synthetic asset are not all
present.

## Safety Preconditions

- `VIMEO_ACCESS_TOKEN` must be present server-side/keyholder only.
- `BNA_VIMEO_TEST_ACCOUNT_CONFIRMED=true` must be set.
- `VIMEO_EXPECTED_ACCOUNT_URI` or `VIMEO_EXPECTED_ACCOUNT_NAME` must identify
  the intended test account.
- `VIMEO_TEST_PROJECT_URI` or `VIMEO_TEST_PROJECT_NAME` must identify the safe
  private test project/folder.
- `BNA_VIMEO_SYNTHETIC_TEST_FILE` must point to a generated non-sensitive test
  clip.
- `BNA_VIMEO_PRIVATE_SMOKE=1` must be set intentionally.

## Recorded Outcome

- Redacted asset ID: none, because no upload ran.
- Destination: none, because no upload ran.
- Privacy: private/unlisted defaults enforced by code; no provider write ran.
- Upload result: skipped safely with `preview_only`.
- Playback result: skipped because no asset was uploaded.
- Cleanup/test-only state: not applicable; no asset was created.
- Token or full account secrets printed: no.
- Real class recordings uploaded: no.
- Existing production assets modified/deleted: no.
- Public publish occurred: no.

When fully configured, the smoke command records a redacted Vimeo asset ID,
destination project/folder, privacy, progress, upload result, playback metadata,
and cleanup/test-only marking.
