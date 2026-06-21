# One Time Separate Railway Audit

Date: 2026-06-21
Requirement: REQ-20260619-313

## Result

Separate Railway project provisioning is blocked by account-level Railway
authentication. The available local token is project-scoped to the existing
shared project and must not be used to add One Time services there.

## Commands

- `railway --version`: `railway 4.33.0`
- `railway status` with the local project token: project
  `skillful-motivation`, environment `production`, service `None`
- `railway whoami` with the local project token: unauthorized
- `railway list --json` with the local project token: unauthorized
- `railway whoami` without token: unauthorized, login required
- `railway list --json` without token: unauthorized, login required

## Safety Decision

Do not run `railway add`, `railway init`, `railway up`, domain attachment, or
variable writes against `skillful-motivation`. The operator prompt explicitly
forbids adding the separate One Time instance to the shared BNA project.

## Exact External Action

Provide one of:

- an account-level Railway login/session that can list/create projects; or
- a pre-created separate Railway project plus project token for
  `one-time-production`, with permission to create `one-time-web` and
  `one-time-postgres`.

Then run:

```powershell
npm run one-time:separate-instance-package
```

and apply the plan in:

- `ops/one-time-mishnah/separate-instance-provisioning-plan.md`
- `ops/one-time-mishnah/separate-instance-provisioning-plan.json`
- `ops/one-time-mishnah/separate-instance-seed.sql`
- `ops/one-time-mishnah/separate-instance-isolation-scan.sql`

No secrets were printed or committed during this audit.
