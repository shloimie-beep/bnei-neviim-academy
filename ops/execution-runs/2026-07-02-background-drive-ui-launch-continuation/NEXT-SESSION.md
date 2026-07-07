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
5. Agent fleet readiness drift was cleared on 2026-07-07: the supervisor is
   running as PID 13544, `npm run agent:fleet:readiness` returned Overall OK,
   and `npm run agent:fleet:once` correctly refused to start a duplicate
   supervisor while that lock is active.

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

Recently resolved:

1. `REQ-20260702-102` - agent-fleet readiness/status is verified. Keep the
   existing supervisor running; do not start a duplicate once-run while the
   lock is active.

Still blocked:

1. `REQ-20260702-103` - repair or rerun structured parsing for newest Drive
   recording `content_job:101` without committing raw transcript text.
   Updated evidence:
   - `ops/drive-transcript-visibility/2026-07-02/JOB-101-TRACE.md`
   - `ops/drive-transcript-visibility/2026-07-02/BACKLOG-20260625-20260702.md`
   - `ops/drive-transcript-visibility/2026-07-02/DRIVE-TRANSCRIPT-LIBRARY-PLAN.md`
   - `ops/drive-transcript-visibility/2026-07-02/VERIFICATION.md`
   Next safe action: restore app/API reachability for the dry-run reprocess
   command, run parser repair for `content_job:101`, and apply private Drive
   transcript-doc sync only after exact approval.
2. Campaign send remains blocked on final copy, exact segment/list,
   suppression/unsubscribe proof, seed pass, and exact real-send packet.
