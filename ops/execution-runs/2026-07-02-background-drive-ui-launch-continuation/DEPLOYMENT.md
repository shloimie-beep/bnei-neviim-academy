# Deployment

No app deploy or live smoke has run yet for this continuation branch.

What did happen:

- Commit `edec1133` was pushed to
  `codex/one-time-ui-recording-clean-integration-20260702`.
- Draft PR #64 was opened:
  https://github.com/shloimie-beep/bnei-neviim-academy/pull/64
- Guarded Railway provisioning succeeded for the separate One Time project,
  web service, and Postgres service.
- Railway custom domain attachment succeeded for `join.onetimeonetime.com`.
- GoDaddy DNS still needs CNAME/TXT records.

Deploy/live smoke remains blocked until:

1. GoDaddy DNS for `join.onetimeonetime.com` is configured and verified.
2. Required One Time secrets are present in Railway/keyholder without exposing
   values.
3. Provider setup blockers are resolved or explicitly scoped out of launch
   smoke.
4. The post-setup deploy/live-smoke packet is run.
