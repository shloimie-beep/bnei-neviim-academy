# Secure Operator Bootstrap

Status: implementation, production deploy, and workflow-specific live Operator
Setup safe-package smoke are complete. Secret-bearing exports remain
approval-gated and were not exercised during the live smoke.

## Operator Request

Create a secure app section where Shloimie can generate a short-lived download
for setting up a laptop with the BNA environment/system context. The workflow
must be secure, expire, and avoid exposing secrets in chat, tracked files, logs,
or screenshots.

## Implemented Locally

- Added Operations Team/Admin > Operator Setup for Super Admin users.
- Added a read-only readiness endpoint that reports env keys, source,
  configured/missing status, lengths, and fingerprints only.
- Added safe bootstrap package generation with no secret values.
- Added encrypted secret export generation gated by:
  - Super Admin session
  - exact approval phrase `APPROVE_OPERATOR_ENV_SECRET_EXPORT`
  - minimum passphrase length
  - AES-256-GCM encrypted payload
  - one-time, short-lived secure download row
- Added importer script:
  `scripts/import-operator-bootstrap.mjs`
  It decrypts locally, prompts for the passphrase, writes `.env.local`, and
  does not print values.
- Added baseline app hardening:
  - `x-powered-by` disabled
  - private Operations/API no-store/noindex headers
  - nosniff/referrer/frame/permissions headers
  - HTTPS-aware HSTS and Secure cookies
  - cryptographically random Operations session IDs
  - Operations login rate limiting

## Files Changed

- `server.js`
- `public/operations.html`
- `.env.example`
- `scripts/import-operator-bootstrap.mjs`
- `scripts/smoke-operator-setup-live.mjs`
- `tests/operator-setup-security.test.js`
- `package.json`
- `MEMORY.md`
- `TASKS.md`
- `memory/2026-06-15.md`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/import-operator-bootstrap.mjs`
- PASS Operations inline script parse
- PASS `node --test tests/operator-setup-security.test.js`
- PASS focused auth/external access regression tests:
  - `tests/operations-pwa-login.test.js`
  - `tests/external-access-persistence-workflow.test.js`
  - `tests/one-time-external-user-portal.test.js`
- PASS full `npm test` 611/611
- PASS local headless Operations smoke on
  `http://127.0.0.1:8092/operations?view=admin&section=operator_setup`
  with visible readiness counts, no console warnings, no `NaN`, and protected
  status endpoint headers.
- Smoke screenshot:
  `ops/local-smokes/operator-setup-local.png`
- PASS full `npm test` 621/621 after targeted live smoke script addition and
  WS11 startup migration patch.
- PASS Railway deployment `7c8c7010-497c-41c7-a127-6370cca049eb` reached
  `SUCCESS`.
- PASS targeted live Operator Setup smoke:
  `ops/live-smokes/2026-06-16T11-00-45-574Z-operator-setup-live-smoke.md`.
  It logged in as Super Admin, checked hardened session cookie flags and
  authenticated identity, read Operator Setup status, created a safe no-secret
  package, downloaded it once, verified sensitive env template values were
  blank, and verified the second redemption returned 404.
- PASS main live app smoke:
  `ops/live-smokes/2026-06-16T11-01-05-357Z-live-app-smoke.md`.

## Remaining Work

- None for the safe no-secret package workflow.
- Only create an encrypted secret-bearing package if Shloimie explicitly
  approves the export in-app and provides a passphrase outside logs/chat.

## Guardrails

- Never paste env values into chat, tracked files, screenshots, task titles, or
  logs.
- Keyholder remains the preferred source for new/rotated API keys.
- Copying real keys from keyholder into `.secrets`, Railway, or an encrypted
  export requires explicit operator approval.
- Safe packages are the default. Secret exports are exceptional and encrypted.
