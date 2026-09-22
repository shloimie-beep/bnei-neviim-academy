# One Time Publish Package Preview Local Smoke

Run: 2026-06-15T01:39:54+03:00

Target: `http://127.0.0.1:8131`

## Result

PASS

## Checks

- Logged in with disposable local smoke credentials through
  `/api/operations/login`.
- Opened
  `/operations?view=content&section=one_time_library&workspace=rabbi_sheller_provider`.
- Verified the One Time Library route rendered.
- Verified the One Time Publishing Approval Packet rendered.
- Verified the no-send/no-publish/no-member-visibility guardrail text rendered.
- Called `/api/bna/actions/run` from the browser session with
  `preview_one_time_member_library_publish_package` and `dry_run: true`.
- Verified the action response returned HTTP 200 with `success: true`.
- Verified `executed: false`.
- Verified `publish_performed: false`.
- Verified `member_visibility_changed: false`.
- Verified `external_write_performed: false`.
- Verified `no_send: true`.
- Verified 6 blockers remained for the intentionally incomplete smoke payload.
- Verified no horizontal overflow at 1440px viewport.
- No console errors or page errors were observed.

## Notes

The local dataset did not expose a real One Time Library item card, so the
browser smoke exercised the rendered route and authenticated action endpoint.
The card-level `Package Preview` button and payload builder are covered by the
focused static Operations test.
