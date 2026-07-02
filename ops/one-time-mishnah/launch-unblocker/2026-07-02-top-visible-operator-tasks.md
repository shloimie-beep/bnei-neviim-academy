# One Time Launch Top Visible Operator Tasks

Generated: 2026-07-02
Source: `RAW-20260702-003`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

These are the exact human/external setup tasks that should appear above generic
agent work. Codex can keep running safe checks, but deploy/live smoke and real
provider setup remain blocked until these are cleared.

## TASK-20260702-001 - Create Separate One Time Railway Target

Priority: 1
Owner: Shloimie / Railway owner
Clears: `REQ-20260701-701`, `REQ-20260701-717`
Visible lane: Pending

Exact action:

1. Create or identify the separate Railway project/service/environment for One
   Time.
2. Confirm it is separate from the BNA production service.
3. Configure safe labels/env on that target:
   - `PUBLIC_SITE_MODE=one_time`
   - `DEFAULT_WORKSPACE_KEY=rabbi_sheller_provider`
   - `DEFAULT_PROJECT_KEY=one_time_mishnah_class`
   - `ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com`

Do not paste secrets into chat or repo.

Codex verification after setup:

- `npm run one-time:railway-target:guard`
- `npm run one-time:railway-provision:check -- --write-report`

## TASK-20260702-002 - Provide Separate One Time Database Alias

Priority: 2
Owner: Shloimie / Railway owner
Clears: `REQ-20260701-701`, `REQ-20260701-717`
Visible lane: Pending

Exact action:

1. Create/attach the separate One Time database.
2. Store its URL in Railway/keyholder as `ONE_TIME_DATABASE_URL` or
   `DATABASE_URL_ONE_TIME`.
3. Confirm it is not the BNA main database.

Forbidden: paste the database URL, hard-delete data, or merge BNA and One Time
records.

Codex verification after setup:

- `npm run one-time:db:bootstrap`

## TASK-20260702-003 - Attach `join.onetimeonetime.com` Only

Priority: 3
Owner: Shloimie / domain owner
Clears: `REQ-20260701-702`, `REQ-20260701-703`, `REQ-20260701-704`,
`REQ-20260701-717`
Visible lane: Pending

Exact action:

1. Attach `join.onetimeonetime.com` to the separate One Time Railway service.
2. Add only the Railway-provided DNS record for the `join` subdomain in
   GoDaddy.
3. Confirm apex/root `onetimeonetime.com` is untouched.

Forbidden: do not change apex/root `onetimeonetime.com` or `www`.

Detailed handoff:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-godaddy-join-subdomain-instructions.md`

## TASK-20260702-004 - Provide Zoom Session Alias

Priority: 4
Owner: Shloimie / Rabbi
Clears: `REQ-20260701-708`
Visible lane: Pending

Exact action:

1. Put the private Zoom link/details in the keyholder or approved private
   provider storage.
2. Provide only the alias/path to Codex.
3. Provide class date/time, member-facing display label, and fallback message if
   no live session is scheduled yet.

Forbidden: do not commit or expose the raw Zoom link in public pages, repo
evidence, screenshots, or task titles.

## TASK-20260702-005 - Provide Vimeo And Drive Intake Aliases

Priority: 5
Owner: Shloimie / Vimeo account owner
Clears: `REQ-20260701-713`
Visible lane: Pending

Exact action:

1. Confirm the Vimeo account owner and One Time folder/scope.
2. Store the Vimeo token in the keyholder and provide the alias/path only.
3. Provide the Drive intake/drop folder alias.
4. Confirm whether Codex may run a safe TEST upload later.

Forbidden: do not paste Vimeo tokens or mutate production media from this task.

## TASK-20260702-006 - Provide Rabbi Stripe Sandbox Setup

Priority: 6
Owner: Shloimie / Rabbi
Clears: `REQ-20260701-714`
Visible lane: Pending

Exact action:

1. Provide Rabbi Stripe test secret key alias/path only.
2. Provide publishable/webhook aliases if the current checkout path needs them.
3. Provide or confirm the `$67/month` sandbox product/price ID or alias.
4. Confirm sandbox-only smoke.

Forbidden: no real card details, no live payment, no invented refund/legal
policy.

Codex verification after setup:

- `npm run stripe:sandbox-smoke`

## TASK-20260702-007 - Provide Rabbi Whapi/WAPI Setup

Priority: 7
Owner: Shloimie / Rabbi
Visible lane: Pending

Exact action:

1. Create/identify Rabbi's Whapi/WAPI provider account.
2. Provide the sending phone number.
3. Store token in keyholder and provide alias/path only.
4. Provide instance ID/alias and webhook status.
5. Provide the safe test recipient for a later exact packet.

Current permission allows one safe setup message only if both Rabbi phone and a
configured sending provider are present. They are not currently present in the
setup checker, so no WhatsApp send should run now.

Forbidden: no broadcast, no real contact send, no GHL/LeadConnector runtime.

## TASK-20260702-008 - Prepare Campaign Seed Requirements

Priority: 8
Owner: Shloimie
Clears: `REQ-20260701-709`, `REQ-20260701-710`
Visible lane: Pending

Exact action:

1. Wait until `join.onetimeonetime.com` is live.
2. Provide final campaign copy.
3. Provide exact recipient segment/list source.
4. Provide suppression/unsubscribe proof.
5. Approve seed/test email to `sdratler@gmail.com`.
6. Approve a separate real-send packet only after seed proof passes.

Current One Time sender/reply-to: `info@onetimeonetime.com`.

Forbidden: no real bulk campaign from this task.

## Current Next Task

The next task at the top should be `TASK-20260702-001`: create or identify the
separate One Time Railway target.
