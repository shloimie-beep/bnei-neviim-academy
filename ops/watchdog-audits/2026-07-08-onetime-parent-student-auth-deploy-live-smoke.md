# OneTime Parent/Student Auth Deploy Live Smoke - 2026-07-08T16:42:03+03:00

Scope:

- Implementation commit: `b7ba8418c36d4efc4ab999b42cf1db1c66686627`
- Status/evidence commit before deploy: `b3fb7075b09d3e4736956c600809eb8b4ff67031`
- OneTime Railway project: `one-time-production`
- OneTime Railway service: `one-time-web`
- Deployment ID: `d434dd9b-d619-41c2-abc8-c8918219dc68`
- Canonical domain: `https://join.onetimeonetime.com`

## Deployment

The current code bundle was deployed to the explicit OneTime Railway target
with account-authenticated Railway CLI access, not the BNA project token.

Deployment reached `SUCCESS`.

## Live Route Smoke

Safe readbacks against `https://join.onetimeonetime.com` passed:

- `/one-time-parent?reset=TESTTOKEN`
  - HTTP `200`
  - title `OneTimeOneTime Parent Setup`
  - OneTime forgot-password request route present
  - no BNA/Academy copy
  - no fallback/recovery-code copy
  - no public return links
- `/member-library`
  - HTTP `200`
  - no BNA/Academy copy
  - no fallback/recovery-code copy
  - no public return links
  - authenticated member-session marker present
  - "no separate classroom/library password" copy present
  - parent forgot-password link present
- `/one-time-classroom`
  - HTTP `200`
  - no BNA/Academy copy
  - no fallback/recovery-code copy
  - no public return links
  - authenticated member-session marker present
  - "no separate classroom password" copy present
  - parent forgot-password link present
- `/rabbi-member`
  - HTTP `200`
  - no old `onetime-hero-vertical` portrait marker
  - no public return links
- `/api/one-time/instance-config`
  - HTTP `200`

`npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
also passed.

## Parent Invite Dry Run

No-send live dry run passed against
`POST /api/bna/one-time/parent-trial-invite`:

- `success=true`
- `dry_run=true`
- `no_send=true`
- `external_write_performed=false`
- `local_write_performed=false`
- `invite_mode=production`
- `test_labeled=false`
- `launch_ready=true`
- parent setup path: `/one-time-parent`
- member library path: `/member-library`
- classroom path: `/one-time-classroom`
- live class URL included: yes
- scoped workspace/project:
  `rabbi_sheller_provider` / `one_time_mishnah_class`
- confirmation required for live send:
  `SEND_ONE_TIME_PARENT_TRIAL_INVITE`

## Send Status

The live email resend was not performed in this step.

Reason: the existing OneTime parent trial record for the redacted operator test
recipient still contained old test/walkthrough labels, including a non-live
student display label. The cleaned live route now correctly requires a real
`student_name` before any non-dry-run send. The exact live OneTime student
display name still needs operator confirmation before a new live email is sent.

## Guardrails

- No live email was sent.
- No payment or checkout was created.
- No Zoom, Drive, Vimeo, DNS, or database schema mutation was performed.
- No setup token was committed.
- No member access code was committed.
- No full recipient address was committed.
- No full Zoom URL was committed.

