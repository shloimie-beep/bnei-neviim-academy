# Next Session

Current state:

1. PR #64 branch is the clean launch continuation branch.
2. `join.onetimeonetime.com` DNS is verified:
   - CNAME `join` -> `awaz36ln.up.railway.app`
   - TXT `_railway-verify.join` ->
     `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6`
3. Separate One Time Railway target exists and `one-time-web` has a non-empty
   `DATABASE_URL` service reference.
4. Safe provider env values for Resend, Zoom credentials, and Vimeo client
   credentials were pushed to `one-time-web` with deploy skipped and verified
   by fingerprint.

Top Codex task:

1. Validate, commit, push, mark PR #64 ready/merge if policy allows, deploy
   `one-time-web`, then run live smoke for
   `https://join.onetimeonetime.com/`.

Deployment caveat:

- Local DB bootstrap apply is blocked because Railway Postgres resolves to an
  internal host from this machine. After `one-time-web` is deployed, run the
  bootstrap from inside the Railway service via `railway ssh` if available.

Top provider/operator task:

1. Provide or label the remaining exact aliases:
   - One Time Zoom session/join alias;
   - `VIMEO_ACCESS_TOKEN`;
   - `ONE_TIME_DRIVE_DROP_FOLDER_ALIAS`;
   - Rabbi Stripe sandbox/test key and $67/month product/price aliases;
   - Whapi/WAPI instance and phone aliases.

Still blocked:

1. `REQ-20260702-102` - repair agent-fleet readiness drift.
2. `REQ-20260702-103` - repair or rerun structured parsing for newest Drive
   recording `content_job:101` without committing raw transcript text.
3. Campaign send remains blocked on final copy, exact segment/list,
   suppression/unsubscribe proof, seed pass, and exact real-send packet.
