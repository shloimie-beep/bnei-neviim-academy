# One Time Provider Shell Routing Live Smoke

Generated: 2026-07-13T06:06:50.2939950Z

Requirement: REQ-20260713-908

Commit SHA: c0b8ab8139c6166d89527a949ce4dd70bf67df3a

BNA Railway deployment: 33571043-54ce-4631-99c1-b54209edebc7

One Time Railway deployment: b39ce70a-89e0-44a3-80c5-77e8c2b43754

Target: https://join.onetimeonetime.com

## Result

- Status: PASS
- BNA `/api/deploy-info` returned the exact commit SHA.
- One Time `/api/deploy-info` returned the exact commit SHA and `target_app=one-time`.
- `/provider.html?admin_provider=one-time&section=crm` returned 200.
- Dedicated provider shell includes One Time CSS.
- Dedicated provider shell does not include `/css/operations-shell.css`.
- Dedicated provider shell does not include `/js/operations-shell.js`.
- `/provider.html?admin_provider=one-time&section=crm&ops_fallback=1` returned a 302 redirect to `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`.

## Guardrails

- External write performed: false
- Production data mutation performed: false
- Email send performed: false
- WhatsApp send performed: false
- Payment/access/DNS/provider mutation performed: false
