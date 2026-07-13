# 00-control-tower-and-policy-correction

Parent raw ID: `RAW-20260713-005`

Requirement IDs: `REQ-20260713-950`, `REQ-20260713-951`, `REQ-20260713-959`

## Control Tower

| Field | Value |
|---|---|
| Lane key | `onetime-rosh-hashanah-billing-platform-v2` |
| Owner | Codex current thread |
| Worktree | `C:\Users\User\BNA-onetime-billing-v2` |
| Branch | `codex/onetime-rosh-hashanah-billing-platform-v2` |
| Base | `origin/master` at `4a032b6e2ad21c02312edd7156a828e941e551d5` |
| Shared checkout dirty? | yes, unrelated shared One Time Drive/classroom video automation lane |
| Collision policy | Do not edit shared checkout dirty files; work only in this dedicated worktree. |

## Policy Correction

The operator's new decisions supersede prior active 30-day Stripe trial policy
for One Time:

- No 30-day Stripe trial.
- Rosh Hashanah access is application-level promotional access, not a Stripe
  trial.
- One canonical `billing_start_at`, timezone `Asia/Jerusalem`.
- `$67/month, plus applicable taxes where required`.
- Provider Stripe account belongs to Rabbi Eli Scheller and stays provider
  scoped.
- No Stripe Connect, transfers, provider payouts, commissions, or revenue-share
  execution in this Billing V2 branch.
- No automatic refunds or prorated refunds.
- Cancellation defaults to cancel-at-period-end.
- No failed-payment grace period.
- Monthly invoice/receipt email workflow is required, but live sends are gated.
- Publishing a live price does not charge customers or start the campaign.

## External Action Boundary

Allowed now:

- Local code/document edits in the dedicated branch.
- Local tests and Stripe sandbox/test-mode smoke against synthetic identities.
- Secret-safe keyholder reads.
- Secret-safe Railway target readback.

Not allowed in this branch without a separate exact approval:

- Real customer charge.
- Real refund.
- Live customer notice batch send.
- Access grant/revoke for real customers.
- Live price/campaign activation.
- Live Stripe key copying.
- BNA service credential mutation.
- Stripe Connect/payout setup.

## First Commit Exit Criteria

- Raw packet copied to `raw-input/`.
- Register created under `tasks-pending/`.
- Durable policy corrections recorded in topic memory.
- Current-code correction map created.
- Billing UI PQC packet created and explicit-validator clean.
- `TASKS.md`, ledger, and changelog record the registration/status.
- Secrets audit and diff check pass.
