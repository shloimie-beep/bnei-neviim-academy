# Railway Deploy Auth For BNA

This repo uses a Railway project token, not interactive `railway login`, for repeatable deploys.

## Normal Commands

Run this before deploying:

```powershell
npm run railway:doctor
```

Deploy:

```powershell
npm run railway:redeploy
```

## Why We Do Not Require `railway whoami`

Railway has two auth modes:

- Account/browser login: `railway login`, checked by `railway whoami`.
- Project-token mode: `RAILWAY_TOKEN`, used for CI/scripted deploys.

BNA uses project-token mode. In that mode `railway whoami` can fail even though the token is valid for this project. Do not use `railway whoami` as the deploy gate for this repo.

## Token Location

The local project token lives here:

```text
.secrets/railway-token.txt
```

Do not print this token in logs or chat. The scripts load it automatically.

## Fixed Target

The app deploy target is:

```text
Project: skillful-motivation
Environment: production
Service: skillful-motivation
```

The Postgres service exists in the same Railway project but should not receive app deploys.

## If Railway Gets Weird Again

Run:

```powershell
npm run railway:doctor
```

The doctor script checks:

- local project token exists
- no conflicting `RAILWAY_API_TOKEN` is set
- global Railway config JSON is valid
- token can read the Railway project
- service target resolves to `skillful-motivation / production`

If global Railway config is invalid, the doctor backs it up and writes a clean placeholder. Deploy scripts pass service/environment explicitly, so they do not depend on global CLI linking.
