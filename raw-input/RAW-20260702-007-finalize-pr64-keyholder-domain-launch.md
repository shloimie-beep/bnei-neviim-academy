# RAW-20260702-007 - Finalize PR #64, Keyholder Alias Discovery, Join Domain Smoke, Continue One Time Launch

Source channel: `codex_chat`
Captured at: 2026-07-02
Parse status: `registered`
Requirement register: `tasks-pending/2026-07-02-finalize-pr64-keyholder-domain-launch.md`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Privacy classification: internal launch/setup packet; no secret values or private transcript bodies

## Operator Intent

Shloimie confirmed that the GoDaddy DNS records for `join.onetimeonetime.com`
were added and that expected provider keys should be in the BNA keyholder.
Codex should keep working, verify PR #64, perform deep keyholder alias discovery
by alias/fingerprint only, update setup/readback scripts when they miss real
aliases, finish safe Railway/DB/domain/provider setup work, then deploy/live
smoke when the exact gates are satisfied.

## Preserved Decisions

- PR #64 is the clean working PR, not PR #62.
- `join.onetimeonetime.com` is the temporary launch domain.
- Do not mutate apex/root `onetimeonetime.com` or `www`.
- Use BNA keyholder aliases/fingerprints only; never print or commit values.
- Safe Railway setup/readback/provider env propagation for the separate One
  Time service is authorized.
- No bulk campaign send, live Stripe payment, WhatsApp broadcast, hard delete,
  paid-user cancellation, GHL/LeadConnector runtime, secret exposure, or raw
  private transcript/contact/student/parent evidence.

## Source Statements

- RAW-20260702-007-S001: Finish/merge PR #64 if validation still passes.
- RAW-20260702-007-S002: Verify GoDaddy DNS for `join.onetimeonetime.com` and
  run domain/setup smoke.
- RAW-20260702-007-S003: Perform deep keyholder alias discovery for Vimeo,
  Stripe, Whapi/WAPI, Zoom, Resend, and Drive without exposing values.
- RAW-20260702-007-S004: Update setup checker/scripts if they miss real aliases
  or current Railway CLI behavior.
- RAW-20260702-007-S005: Use the new separate One Time Railway/DB setup and run
  every safe unblocked setup/readback/smoke step.
- RAW-20260702-007-S006: Deploy/live smoke only when safe gates are satisfied;
  otherwise record exact blockers.
- RAW-20260702-007-S007: Keep the worktree clean by preserving real work in a
  commit/PR and leaving only true operator/provider actions.
