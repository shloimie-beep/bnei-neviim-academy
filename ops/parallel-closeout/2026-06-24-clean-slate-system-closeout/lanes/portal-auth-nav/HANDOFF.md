# Lane Handoff - portal-auth-nav

| Field | Value |
|---|---|
| Branch | `codex/closeout-portal-auth-nav-20260624` |
| Base | `codex/clean-slate-integration-20260624` after control PR publication |
| Owner | Codex lane worker |
| Scope | Operations login, portal chooser, provider/parent/student navigation, scoped auth, tenant isolation, Rabbi owner/admin semantics. |
| Forbidden central files | See `../../CONTROL.md`; do not edit central run, task, memory, ledger, changelog, or control files. |

## Objective

Close auth/navigation from the reconciled base while preserving the owner answers: Rabbi Eli Scheller is provider owner/admin, Shloimie is setup/support workspace admin, and Shloimie remains separate BNA super-admin.

## Approved Effects

Local implementation, contract tests, local fixture/browser smokes, and read-only configured inspection are approved. No production auth mutation, account grant, password send, deployment, or credential change is approved for this lane.

## Required Closeout

Update this lane's result, tests, files, and blockers files. If an authenticated live claim needs credentials, mark it blocked rather than inventing proof.
