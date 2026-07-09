# Deployment

Historical branch context:

- Commit `edec1133` was pushed to
  `codex/one-time-ui-recording-clean-integration-20260702`.
- Draft PR #64 was opened:
  https://github.com/shloimie-beep/bnei-neviim-academy/pull/64
- Guarded Railway provisioning succeeded for the separate One Time project,
  web service, and Postgres service.
- Railway custom domain attachment and GoDaddy DNS verification for
  `join.onetimeonetime.com` are complete.

Current production-readiness closeout:

- The relevant launch cleanup and follow-up fixes are pushed to `master`.
- OneTime deploy `0fa8fd0b-052c-4f66-b1c9-f9bed7b65e86` reached `SUCCESS`
  after Docker/build-context hardening.
- BNA deploy `78b8b3a8-4608-4067-a82e-f57985bb3b61` reached `SUCCESS`.
- Live smokes passed for OneTime separate instance, OneTime interest dry-run,
  Rabbi OneTime landing, BNA app smoke, and BNA Operations helper.

Full-launch deploy/live smoke remains blocked only for flows that require:

1. Rabbi Stripe sandbox/test key status and `$67/month` product/price alias.
2. Whapi/WAPI instance ID and sender phone metadata.
3. Final campaign copy, exact segment/list, suppression/unsubscribe proof, and
   explicit seed approval.

Hosted Zoom/class link, Railway target, separate database readback,
join-domain/DNS, and Vimeo/Drive readiness are no longer deployment blockers.
