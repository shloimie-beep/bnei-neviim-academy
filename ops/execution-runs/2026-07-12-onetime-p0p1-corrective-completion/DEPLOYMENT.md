# Deployment

Deployment is not authorized by the July 12 prompt.

Release blocker:

- `DEC-20260712-001`: explicit operator/reviewer authorization is required
  before merge, deploy, or production live smoke.
- `REQ-20260712-002`: CI workflow publishing is blocked until a GitHub
  credential with `workflow` scope creates or updates
  `.github/workflows/onetime-corrective.yml`.

No production deploy, email/WhatsApp/Telegram/campaign send, charge, access
grant, historical contact import, DNS/account mutation, credential mutation,
or external-provider write has been performed.

After approval:

1. Deploy the exact approved SHA through the normal release path.
2. Run live smoke/readback on the exact deployed SHA.
3. Update `requirements.json`, this file, PR records, ledger, and changelog
   before marking app-visible requirements Done.
