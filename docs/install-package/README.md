# BNA Local Install And Demo Package

This folder describes the lightweight package for Shloimie's local
developer/operator setup and Rabbi meeting readiness.

The package is documentation plus bootstrap/doctor/smoke scripts. It is not a
native desktop app.

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
