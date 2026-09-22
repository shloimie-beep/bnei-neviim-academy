# RAW-20260708-032 - Operations still slow diagnosis

- Raw ID: `RAW-20260708-032`
- Source: `codex_chat`
- Created at: `2026-07-08T23:00:00+03:00`
- Parse status: `registered`
- Requirement IDs: `REQ-20260708-099`
- Register: `tasks-pending/2026-07-08-app-backend-helper-performance.md`

## Raw Text

> It's still incredibly slow. Can you find out why it's still so slow?

## Parsed Requirement

- `REQ-20260708-099`: Diagnose the remaining perceived slowness after the
  Operations shell/deferred-renderer split by profiling actual One Time
  Operations startup data hydration, network/API waits, client render work,
  and any route/view-specific bottlenecks. Record evidence and the next fix
  target before claiming the performance problem is solved.

## Guardrails

- Diagnosis must not execute helper actions, external sends, payments, access
  grants, WhatsApp/WAPI sends, Drive/Vimeo uploads, Stripe actions, DNS changes,
  or production data mutations.
- Preserve unrelated dirty Rabbi/helper work in this shared worktree.
