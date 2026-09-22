# Railway Target Readback - 2026-07-01

Raw input: `RAW-20260701-004`
Requirement: `REQ-20260701-403`

## Default Environment

Command: `npm run railway:target:doctor`

Status: blocked.

- Railway deployment mode: `cli`
- Railway project: not set
- Railway environment: `production`
- Railway service: not set
- Expected domain: `bneineviimacademy.org`
- Known domains: not available

Blockers:

- Railway target requires explicit project ID or project name.
- Railway target requires explicit service ID or service name; no production fallback is allowed.

## Explicit Target Probe

Command-scoped values:

- `BNA_RAILWAY_PROJECT_NAME=skillful-motivation`
- `BNA_RAILWAY_SERVICE_NAME=skillful-motivation`
- `BNA_RAILWAY_ENVIRONMENT_NAME=production`
- `BNA_RAILWAY_CUSTOM_DOMAIN=bneineviimacademy.org`

Result: target guard passed.

## Deploy Status

No deploy or live smoke was run from this packet. The branch contains audit
artifacts and a local smoke-script enhancement; the default shell still lacks
persistent Railway target values, so no deploy/live-smoke proof is claimed.

Next action: persist the explicit Railway target values in the safe deploy
environment or pass them at deploy time before running `railway:redeploy`.
