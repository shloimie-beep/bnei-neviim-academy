# One Time Operator External Setup Checklist - 2026-07-02

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

Purpose: clear the remaining external blockers for the One Time launch run
without exposing secrets or authorizing forbidden live actions.

Do not paste secrets into chat, tracked files, screenshots, task titles, or
logs. Use the BNA keyholder or provider dashboards for secret values. Repo
evidence may record only aliases, fingerprints, configured booleans, and
redacted readback.

## Current Launch Status

Safe local work is already verified for:

- 30-day no-card free signup/access;
- scoped member/contact access contracts;
- member/admin workspace and basic parent/student portal contracts;
- click-tracked attendance v1;
- draft-only email/campaign controls;
- Whapi/WAPI and Buffer setup panels with no-send/no-provider-write guardrails;
- read-only existing paying-users migration packet;
- local deployment/readiness checks.

`npm run bna:run:next` reports no unblocked executable batch. The next runnable
Codex batch starts after one of the external setup items below is complete.

## Priority 1 - Separate One Time Railway Target

Clears: `REQ-20260701-701`, unlocks deploy/live smoke requirements.

Provide or configure:

- Railway project label for One Time;
- Railway service label for One Time;
- Railway environment label for One Time;
- confirmation that this is separate from the BNA production service;
- confirmation that Codex may run the no-write guard again after setup.

Required One Time service env values:

- `PUBLIC_SITE_MODE=one_time`
- `DEFAULT_WORKSPACE_KEY=rabbi_sheller_provider`
- `DEFAULT_PROJECT_KEY=one_time_mishnah_class`
- `ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com`

Do not authorize or configure:

- apex/root `onetimeonetime.com` cutover;
- live payment;
- real campaign send;
- real WhatsApp send;
- hard delete or production data merge.

Codex verification after setup:

- `npm run one-time:railway-target:guard`
- `npm run one-time:railway-provision:check -- --write-report`
- `npm run railway:doctor`

## Priority 2 - Separate One Time Database

Clears: `REQ-20260701-701`, unlocks real database bootstrap/readback.

Provide or configure:

- keyholder/Railway alias for `ONE_TIME_DATABASE_URL` or
  `DATABASE_URL_ONE_TIME`;
- confirmation that this DB is separate from the main BNA database;
- confirmation that Codex may run bootstrap/readback scripts in the approved
  target after no-write checks pass.

Do not paste the database URL.

Codex verification after setup:

- `npm run one-time:db:bootstrap`
- `npm run bna:run:validate`
- focused One Time signup/access readback smoke after deploy.

## Priority 3 - Join Domain Only

Clears: `REQ-20260701-702`, unlocks `REQ-20260701-703`, `704`, and `717`.

Provide or configure:

- `join.onetimeonetime.com` custom-domain attachment to the separate One Time
  Railway service;
- DNS record required by Railway for that subdomain only;
- confirmation that apex/root `onetimeonetime.com` remains untouched.

Codex verification after setup:

- live smoke for `https://join.onetimeonetime.com/`;
- live smoke for member login/member access;
- compatibility smoke for `/one-time` and `/rabbi`;
- separation smoke proving BNA root remains separate.

## Priority 4 - Zoom Session Details

Clears: `REQ-20260701-708`, supports `REQ-20260701-706` and `707`.

Provide through private/keyholder setup:

- class/session date and time;
- private Zoom link or meeting details;
- whether the link is reusable or should be rotated;
- display label for members;
- fallback message if a session is not scheduled yet.

Do not put the raw Zoom link in tracked repo files. Public pages must never show
the raw Zoom link. Member access must be gated and click-tracked.

## Priority 5 - Vimeo / Drive / OBS Media Setup

Clears: `REQ-20260701-713`.

Provide or confirm:

- `VIMEO_ACCESS_TOKEN` keyholder alias/path;
- Vimeo account owner;
- Vimeo plan/scope supports the intended uploads/playback;
- private test folder/project decision;
- approved safe test-upload file or explicit no-upload decision;
- Drive intake/drop folder path or alias;
- whether OBS saves into a synced Drive folder.

Codex verification after setup:

- token/status readback by fingerprint only;
- safe test upload only if explicitly approved;
- upload failure creates internal task and alert path for
  `sdratler@gmail.com`.

## Priority 6 - Rabbi Stripe Sandbox

Clears: `REQ-20260701-714`.

Provide or confirm:

- Rabbi Stripe test secret key alias/path;
- publishable key alias/path if needed;
- webhook secret alias/path if webhook smoke is in scope;
- `$67/month` One Time membership product/price IDs or permission to create
  sandbox-only equivalents;
- confirmation that sandbox/test-mode only is authorized.

Do not use real card details. Do not run live payments. Do not invent refund or
legal policy copy.

Codex verification after setup:

- sandbox checkout/subscription/access smoke;
- webhook/readback smoke if configured;
- access grant/extension proof using reversible TEST-prefixed records only.

## Priority 7 - Whapi/WAPI Provider Details

Supports real WhatsApp test-send later; no real send is authorized now.

Provide or confirm:

- Rabbi/One Time Whapi/WAPI provider account;
- phone number;
- token alias/path;
- instance ID/alias;
- webhook URL/status;
- safe test recipient, if a later packet should test send.

Do not send real WhatsApp messages to contacts without an exact later packet
and explicit safe-test/send approval.

## Priority 8 - Campaign Seed / Real Campaign

Clears: `REQ-20260701-709` and `REQ-20260701-710` only after live link exists.

Provide after `join.onetimeonetime.com` is live:

- final campaign copy;
- exact recipient segment/list source;
- suppression/unsubscribe proof;
- final join/member links;
- seed recipient: `sdratler@gmail.com`;
- explicit seed packet approval;
- separate explicit real-send command later, if seed passes.

No real campaign send is authorized by this checklist.

## Next Codex Run After Setup

Post-setup execution packet:

- `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`
- manifest:
  `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/manifest.json`

Run:

1. `npm run bna:run:next`
2. `npm run one-time:setup:check`
3. `npm run one-time:railway-target:guard`
4. `npm run one-time:railway-provision:check -- --write-report`
5. `npm run one-time:db:bootstrap`
6. deploy/live smoke for `join.onetimeonetime.com`

If a setup item is still missing, Codex should update this checklist with the
exact missing field and continue any independent no-write verification.
