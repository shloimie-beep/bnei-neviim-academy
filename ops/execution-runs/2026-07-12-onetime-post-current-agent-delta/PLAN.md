# Plan

## Execution Order

1. `delta-00`: finish run registration, baseline, and blocker correction.
2. `delta-B1-B3`: implement the bounded Railway delivery cron runner/config,
   package command, env documentation, and tests.
3. `delta-A`: audit existing ramble-to-done implementation and harden only the
   missing compiler/materialization/status/session behaviors.
4. `delta-C0`: create the canonical CRM Contacts/Inbox blueprint and current
   state gap matrix.
5. `delta-C1-C9`: implement only missing/partial CRM rows in packet order.
6. `delta-B4`: perform Railway cron service/cutover only after runner tests
   pass and scheduler overlap can be ruled out.
7. `delta-closeout`: run validators/watchdogs, commit/push, deploy/live-smoke,
   and update ledger/changelog/statuses.

## Guardrails

- No production contact imports.
- No unapproved email, WhatsApp, Telegram, or class-reminder sends.
- No payments, access grants, historical CRM imports, DNS/account/credential
  changes, or secret exposure.
- No stale dirty worktree resume.
- Do not mark app-visible/server-visible work Done without deploy/live proof.
