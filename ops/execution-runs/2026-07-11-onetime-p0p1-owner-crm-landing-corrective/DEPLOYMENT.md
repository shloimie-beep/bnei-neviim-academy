# Deployment

Deployment is blocked until corrective PR review approval.

No production deploy, email/WhatsApp/Telegram send, campaign send, charge, access grant, historical contact import, DNS change, or external-provider mutation is authorized by this run.

Local deployable proof is ready for review:

- Canonical Operations artifact build/check passed.
- Public landing/onboarding smoke passed.
- Operations owner shell and CRM smokes passed.
- Product-quality drift and action watchdogs passed.

Next deployment action after review approval: use the approved release path, then run live smoke/readback before marking app-visible requirements Done.
