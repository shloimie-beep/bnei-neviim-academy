# BNA Local Install And Demo Package

This folder describes the lightweight package for Shloimie's local
developer/operator setup and Rabbi meeting readiness.

The package is documentation plus bootstrap/doctor/smoke scripts. It is not a
native desktop app.

For the current one-click Windows operator laptop package, run:

```powershell
npm run operator:laptop:package
```

That creates a safe no-secret ZIP under `install-packages/`. It clones or
updates the GitHub repo on the laptop, installs npm dependencies, creates
launch/doctor/smoke/sync helpers, and imports a blank bootstrap env template if
`.env.local` does not exist.

## Included

- `.env.example`
- `scripts/local-setup.mjs`
- `scripts/doctor.mjs`
- `scripts/smoke-local.mjs`
- `docs/local-setup.md`
- `docs/demo-rabbi-meeting.md`
- `docs/rabbi-use-path.md`

## Setup

```powershell
npm install
npm run setup:local
notepad .env.local
npm run doctor
npm run smoke:local -- --skip-tests
npm run dev
```

## Demo Decision

Rabbi does not need a local package now. The Rabbi path is hosted portal/PWA
plus scoped task/bot/ticket intake after credentials and chat ID are provided
and smoke-tested.

## Security

Do not include `.env.local`, `.env`, `.secrets`, `.runtime`, Railway tokens,
API keys, DB URLs, cookies, screenshots with secrets, or generated smoke logs
in an install package or commit.

Secret-bearing setup must use the encrypted, one-time Operator Setup export
with a separate passphrase. Do not send the passphrase in the same email or
message as the package.
