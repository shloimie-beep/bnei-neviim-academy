# One Time Local Beta Startup, Seed, Reset

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Commands

Dry-run commands:

```powershell
npm run onetime:local:plan
npm run onetime:local:seed
npm run onetime:local:smoke
npm run onetime:local:reset
```

Writable local-runtime commands:

```powershell
npm run onetime:local -- seed --write --json
npm run onetime:local -- smoke --write --json
npm run onetime:local -- reset --write --json
```

Writable mode is limited to `.runtime/one-time-local-beta`. It writes local
JSON manifests only and can be repeated safely. Reset removes only those local
runtime manifests and writes a local `latest.json` reset marker.

## Server Startup Environment

For local browser work, use synthetic local auth and avoid hidden production
credentials:

```powershell
$env:BNA_SKIP_ENV_LOCAL='1'
$env:OPS_USERNAME='codex-local'
$env:OPS_PASSWORD='codex-local-pass'
$env:PORT='8080'
node server.js
```

This startup path is for local proof only. It does not authorize deployment,
Railway mutation, production database mutation, DNS changes, email sends,
payments, Zoom/Vimeo writes, Telegram/WhatsApp sends, Buffer/social posts,
pushes, PRs, or external-account writes.

## Seed Contents

The local seed manifest includes:

- One Time instance, role, product, and portal contracts
- announcements-first community preview
- attendance/progress/reward local seed data
- student, parent, provider, and public progress views
- no-send delivery plans

## Smoke Checks

The local smoke manifest verifies:

- required package scripts exist
- One Time instance config loads
- announcements-first community preview loads
- progress snapshot has local seed students
- student and parent views are scoped
- public view is aggregate-only
- no external writes or production mutations are performed

Code contract: `scripts/one-time-local-beta.mjs`.
