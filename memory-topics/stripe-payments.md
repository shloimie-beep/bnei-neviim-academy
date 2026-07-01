# Stripe Payments Memory

- Stripe setup is provider setup/readback work, not a blocker for UI audit or IA
  cleanup.
- Current One Time product assumption: `$67/month` membership.
- Sandbox/test-mode smoke must come before live payments.
- Do not use real card details.
- Do not expose or commit secrets.
- Do not invent refund/legal policy copy; mark policy as owner/legal/business
  decision when needed.
- Payment success may map to access grant only in an approved implementation or
  sandbox packet with reversible test records.

