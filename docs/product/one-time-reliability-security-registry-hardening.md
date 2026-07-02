# One Time Reliability, Security, And Registry Hardening

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Local Audit Command

```powershell
npm run onetime:local:audit
```

The audit is local-safe and preview-only. It checks:

- One Time public, private, alias, and API routes are in
  `ops/route-registry.json`
- visible One Time actions are in `ops/action-registry.json`
- detailed community/provider actions are in `ops/action-registry/actions.json`
- required One Time migration files exist and do not use `DROP DATABASE` or
  `TRUNCATE`
- local beta source/docs/tests contain no raw secrets
- local beta source/docs/tests do not reintroduce GHL, GoHighLevel,
  LeadConnector, or LeadConnectorHQ runtime assumptions
- watchdog scripts are available
- One Time local plan/seed/reset/smoke scripts are available
- the local beta smoke preview passes without writes inside a fast local loop

## Repaired Registry Coverage

This hardening pass registers:

- `/one-time/us`
- `/one-time/uk`
- `/one-time/israel`
- `/one-time/interest`
- `/one-time/member-login`
- `/api/one-time/interest`

The public interest API is first-party intake only. It must not create checkout
sessions, grant access, send messages, mutate providers, charge payments, or
expose production credentials.

## Guardrails

No deploy, Railway mutation, production database write, DNS change, external
send, live payment, provider mutation, push, PR, or external-account write is
authorized by this audit.
