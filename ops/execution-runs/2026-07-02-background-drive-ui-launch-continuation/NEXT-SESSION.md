# Next Session

Top human task:

1. `REQ-20260702-107` - Add GoDaddy DNS for `join.onetimeonetime.com`:
   - CNAME `join` -> `awaz36ln.up.railway.app`
   - TXT `_railway-verify.join` ->
     `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6`

After DNS:

1. Run `npm run one-time:setup:check -- --write-report`.
2. `REQ-20260702-108` - Provide/verify Zoom, Vimeo/Drive, Stripe sandbox,
   and Whapi/WAPI aliases.
3. `REQ-20260702-102` - Repair agent-fleet readiness drift, then rerun
   `npm run agent:fleet:readiness` and `npm run agent:fleet:once`.
4. `REQ-20260702-103` - Repair or rerun structured parsing for newest Drive
   recording `content_job:101` without committing raw transcript text.
5. `REQ-20260702-110` - Once setup is ready, run:
   `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`.
6. For UI corrections, either repair the Drive parser output for the newest
   recording or proceed from the existing Rabbi/One Time visual audit findings.
