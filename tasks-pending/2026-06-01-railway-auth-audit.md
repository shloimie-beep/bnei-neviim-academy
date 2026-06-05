# Railway Auth And Deploy Audit

Date: 2026-06-01

## Summary

Railway has been problematic because this repo was mixing two different Railway auth modes:

- interactive account login, tested with `railway whoami`
- project-token/CI auth, supplied through `RAILWAY_TOKEN`

The saved token is able to read the Railway project and service status when used as `RAILWAY_TOKEN`, but `railway whoami` still fails because project-scoped tokens are not account-login sessions. The old deploy script treated that expected `whoami` failure as "not logged in", which created the loop of repeatedly asking for new tokens.

## Evidence

- Railway CLI version: `4.33.0`.
- Without `RAILWAY_TOKEN`, `railway whoami` returns unauthorized.
- With `.secrets/railway-token.txt` loaded as `RAILWAY_TOKEN`, `railway status --json` can read project `skillful-motivation`.
- With the same token, `railway service status --service skillful-motivation --environment production` succeeds.
- `railway status` reports `Service: None` unless the service is explicitly supplied.
- There is no `.railway` directory in this repo, so project-token mode must pass service/environment explicitly.

## Root Causes

1. `scripts/railway-redeploy.ps1` used `railway whoami` as the auth gate.
   - This is wrong for project-token mode.
   - A project token can deploy/read the scoped project without being a full account login.

2. The script did not load `.secrets/railway-token.txt`.
   - The token existed, but the CLI process did not automatically receive it as `RAILWAY_TOKEN`.

3. The repo was not linked to a service.
   - Railway could identify the project/environment from the token, but not the app service.
   - Deploy commands must target `skillful-motivation` explicitly to avoid `Service: None`.

4. Old helper scripts reinforced the confusion.
   - `scripts/check-railway-token.sh` assumed account config in `~/.railway/config.json`.
   - `scripts/push-env-to-railway.mjs` did not load the saved token or target a service/environment.

5. A timed-out `railway up` can leave a half-created deployment as the current deployment.
   - On 2026-06-01, deployment `70a2843e-39d1-4976-b850-8bc8769922f2` was created during an upload timeout and stayed stuck in `INITIALIZING`.
   - Its Railway metadata did not include the normal `railway.json` manifest.
   - Retrying `npm run railway:redeploy` created healthy deployment `4c46a762-cf77-464b-ab3c-04a4786c48d0`.

## Fixes Applied

- Updated `scripts/railway-redeploy.ps1`:
  - loads `.secrets/railway-token.txt` into `RAILWAY_TOKEN`
  - skips `railway whoami` when using a project token
  - targets service `skillful-motivation`
  - targets environment `production`
  - deploys with `railway up --service skillful-motivation --environment production`

- Rebuilt `scripts/check-railway-token.sh`:
  - does not print token fragments
  - validates project-token mode
  - validates the exact service/environment target

- Rebuilt `scripts/push-env-to-railway.mjs`:
  - loads the saved project token
  - targets the app service/environment
  - skips `DATABASE_URL` and Railway-managed variables
  - uses non-shell argument passing for safer variable updates

- Added `scripts/railway-doctor.ps1` and `npm run railway:doctor`:
  - loads the saved project token
  - repairs invalid global Railway config JSON by backing it up first
  - validates the exact app service/environment target
  - filters Railway's repeated config-warning noise from normal output
  - avoids PowerShell treating Railway stderr warnings as fatal errors

- Updated `scripts/railway-redeploy.ps1`:
  - filters the repeated `Unable to parse config file, regenerating` noise
  - still fails on real non-zero Railway exit codes
  - avoids `railway whoami` in project-token mode

## Verification

- `npm run railway:doctor` passes.
- `npm run railway:redeploy` uploaded deployment `74f8c441-9531-4e04-ad40-650e35f86950`.
- Railway service status for `skillful-motivation / production` is `SUCCESS`.
- Later Railway deployment `4c46a762-cf77-464b-ab3c-04a4786c48d0` also succeeded after an upload-timeout retry.
- Live smoke passed:
  - `https://bneineviimacademy.org/api/health`
  - homepage
  - operations login
  - mobile Operations Tasks, Content, and Students
  - payment reminder preview/dry-run/live-send guard
  - mobile Operations Accounting

## Current Safe Deploy Command

Run:

```powershell
npm run railway:doctor
npm run railway:redeploy
```

This should no longer require `railway login` as long as `.secrets/railway-token.txt` contains a valid project token for the BNA Railway project.

If `railway up` times out after upload starts, immediately run:

```powershell
npm run railway:doctor
npm run railway:redeploy
```

Then poll status until the latest deployment is `SUCCESS` and `stopped=false`.

## Remaining Recommendation

Later, link the repo service explicitly with an account login:

```powershell
railway login
railway link --project skillful-motivation --environment production --service skillful-motivation
```

That is convenient, but not required for project-token deploys now that the scripts pass service/environment explicitly.
