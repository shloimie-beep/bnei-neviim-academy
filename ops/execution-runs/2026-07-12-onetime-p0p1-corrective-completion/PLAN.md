# Plan

PR #129 has been merged and the One Time production service has been deployed
and live-smoked. Continue only on the remaining blockers.

1. Resolve `REQ-20260712-002` by adding the CI workflow with a GitHub
   credential that has `workflow` scope.
2. `REQ-20260712-005` and `REQ-20260712-006` are verified through approved
   production write-smokes with cleanup. Do not recreate their old database
   blockers unless the evidence is superseded.
3. Decide whether to run a scoped production intake/dropoff write-smoke for
   `REQ-20260712-008` / `REQ-20260712-009`; it creates live raw/parse records.
4. Finish `REQ-20260712-010` / `REQ-20260712-023` by capturing the remaining
   live screenshots and requirement-matrix rows for provider login,
   Operations, CRM, mailbox, and Robot launcher.
5. Resolve `REQ-20260712-022` only after exact live-send behavior/copy is
   approved and hosted reminder-provider/scheduler readiness is green.

Do not send messages, charge/refund, import historical data, grant access,
mutate DNS/accounts/credentials, or write to external providers unless a
separately scoped approval covers the exact action.
