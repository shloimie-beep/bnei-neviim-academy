# Calendar Launch Preview Local Smoke

Base: http://127.0.0.1:8107

- PASS operations login via guarded API session cookie.
- PASS `/operations?view=settings&section=google_workspace&workspace=platform` rendered the Google Workspace / Google Calendar settings card.
- PASS `8-week plan` rendered with a real input object, not `[object Object]`.
- PASS click called `calendar_batch_launch_plan_preview` through `/api/bna/actions/run` with `dry_run: true`.
- PASS top-level request workspace, input workspace, and preview workspace all resolved to `rabbi_sheller_provider`.
- PASS preview required approval, did not execute live writes, and returned only the expected `start_date` blocker for the UI no-date preview.
- PASS no internal calendar write, Google Calendar write, external write, or send flag was present.
- PASS no browser console/page errors and no horizontal overflow before or after click.

Response highlights:
- action_id: `calendar_batch_launch_plan_preview`
- request_workspace: `rabbi_sheller_provider`
- preview_workspace: `rabbi_sheller_provider`
- dry_run: `true`
- executed: `false`
- approval_required: `true`
- blocker: `Choose a start_date before turning this preview into internal or Google Calendar events.`

Screenshot:
- `google-calendar-8-week-plan-preview.png`
