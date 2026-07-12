# Deployment

No deployment has been performed for this delta yet.

`REQ-20260712-803` is a local runner/config/test artifact and does not by
itself mutate a live scheduler. The live Railway service creation, redacted
execution proof, scheduler overlap check, and old Codex dispatcher automation
disable/delete step remain open under `REQ-20260712-804`.

Current live One Time readback before implementation:

- URL: `https://join.onetimeonetime.com`
- deploy-info SHA: `48c52797b2b8354de31f29aa87c1b95307967900`
- Railway target: `one-time-production / production / one-time-web`

Current repo head at baseline was newer:

- `origin/master`: `593b85c7ffe975dc5eff6f38b684f375385952dc`

After this run opened, `origin/master` advanced to
`22cc6b88b Enable production response compression`. The runner branch should
be rebased before push so it includes that active-agent commit.

Deployment is authorized for normal scoped work by `RAW-20260712-013`, but the
following remain unauthorized: production contact imports, unapproved sends,
separate class-reminder enqueueing, payments, access grants, historical CRM
imports, DNS/account/credential changes, and secret exposure.
