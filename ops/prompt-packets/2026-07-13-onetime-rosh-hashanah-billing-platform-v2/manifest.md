# One Time Rosh Hashanah Billing Platform V2 Packet Manifest

Parent raw ID: `RAW-20260713-005`

Lane key: `onetime-rosh-hashanah-billing-platform-v2`

Branch: `codex/onetime-rosh-hashanah-billing-platform-v2`

Dedicated worktree: `C:\Users\User\BNA-onetime-billing-v2`

Base SHA: `4a032b6e2ad21c02312edd7156a828e941e551d5`

## Scope

Build and verify a provider-scoped One Time Billing system in safe batches:
policy correction, provider billing domain, Stripe sandbox runtime, Rosh
Hashanah promotional conversion, notices, invoices/payments, entitlements,
automations, provider Billing UI, sandbox E2E proof, and release handoff.

## Out Of Scope

- Live customer charges.
- Live refunds.
- Live notice/customer batch sends.
- Stripe Connect, transfers, provider payouts, revenue-share execution, or
  payout reports.
- BNA Academy billing/account credential reuse.
- Any external provider mutation outside explicit sandbox/test-mode proof or a
  separate exact approval.

## Child Packets

| Packet | File | Status | Output |
|---|---|---|---|
| `00-control-tower-and-policy-correction` | `00-control-tower-and-policy-correction.md` | in_progress | branch/lane/register/policy-correction proof |
| `00-current-code-correction-map` | `00-current-code-correction-map.md` | in_progress | active old-policy artifact map |
| `06-provider-billing-ui-pqc` | `tasks-pending/2026-07-13-onetime-rosh-hashanah-billing-platform-v2.product-quality.json` | generated | UI Product Quality gate |

Do not solve the whole parent ramble in one sub-packet. Complete only the named
packet scope and record the next packet or blocker.
