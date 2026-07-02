# RAW-20260702-005 - One Time Clean Integration From PR #62

Captured: 2026-07-02T15:10:00+03:00
Source: Codex chat goal-mode execution packet
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Privacy: internal goal-mode packet; no secrets or private contact rows included

## Operator Intent

Finish everything safely runnable for the One Time launch without waiting on
Shloimie, but do not force-merge PR #62 because it is broad, draft, and
conflict-dirty.

The useful PR #62 work should be treated as source material and cleanly ported
onto a fresh branch from current `origin/master`. Codex should keep working
through safe setup/readback/smoke steps and create exact visible operator tasks
for remaining external blockers.

## Decisions And Permissions

- Same GitHub repo.
- Separate One Time Railway project/service/database preferred.
- `join.onetimeonetime.com` is the temporary launch domain.
- Do not touch apex/root `onetimeonetime.com`.
- New users get 30 days free from signup.
- Attendance v1 is automatic class-link click tracking.
- Whapi/WAPI is the WhatsApp provider direction unless repo evidence proves
  otherwise.
- Vimeo is video host; Drive is intake/drop folder.
- Stripe product is `$67/month`.
- Existing paying users are audited/migrated, not canceled.
- `info@onetimeonetime.com` is confirmed as One Time sender/reply-to.
- `sdratler@gmail.com` is authorized for seed/test email and internal failure
  alerts after final live links exist.

## Forbidden Without Later Exact Packet

- No real bulk campaign send.
- No live Stripe payment.
- No production paid-user cancellation.
- No apex/root DNS mutation.
- No production hard delete.
- No raw private-data export.
- No secret exposure.
- No GHL/LeadConnector runtime.
- No WhatsApp broadcast to real contacts.
