# Railway Auth Follow-Up

Date: 2026-06-22
Requirement: `REQ-20260619-313`

## What Was Checked

The operator reported that a PowerShell command produced output pointing to a
`C:\Users\User\AppData\...` location. I checked whether that AppData location
contained Railway account authentication usable for the separate One Time
provisioning run.

## Findings

- `railway whoami`, `railway list --json`, and `railway status --json` still
  return unauthorized and request `railway login`.
- `C:\Users\User\AppData\Roaming\npm\railway*` contains the Railway CLI
  executable/install path, not an authenticated account config.
- No Railway account config was found at:
  - `C:\Users\User\AppData\Roaming\railway\config.json`
  - `C:\Users\User\AppData\Local\railway\config.json`
- `C:\Users\User\.railway\config.json` exists, is valid JSON, and contains only
  the top-level `projects` key. It has no token-like/auth-like key names.
- `C:\Users\User\.railway\config.json.bak-20260601-railway-audit` exists but is
  not valid JSON, so it was not restored or used.
- The repo-local `railway.json` is valid and contains only build config; it does
  not pin a project or service.

No secret values were printed, copied, restored, or committed.

## Current Blocker

Railway account-level authentication is still unavailable in this shell. The
separate One Time project, Postgres service, web service, deployment, domain
attachment, DNS records, migrations, seed, isolation scan, and live smokes
cannot be performed until Railway auth is fixed.

## Built During This Follow-Up

A guarded apply-capable provisioner was added:

```powershell
npm run one-time:railway-provision:apply -- --apply --confirm PROVISION_ONE_TIME_INSTANCE
```

The command is dry-run by default, refuses the forbidden shared BNA project,
sets secrets only through stdin when values are available in the approved
environment, and writes a redacted report.

Latest redacted report:

`ops/one-time-mishnah/onetime-railway-provisioning-report.json`

## Exact Next External Action

Run one of these outside Codex, then rerun the guarded check:

```powershell
railway login
npm run one-time:railway-provision:check -- --json
```

or provide a scoped token/session that can create/configure only the intended
`one-time-production` Railway project.
