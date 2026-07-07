# BNA Post-Push Deploy Readback

Generated: 2026-07-07T23:29:00+03:00

Scope: BNA production read-only deploy/status proof after pushed closeout
commit `2fcce56f58b776860aadc178fab7ea4d332bc9ec`.

## Result

- BNA Railway project: `skillful-motivation`
- BNA Railway service: `skillful-motivation`
- Deployment: `d070322e-4c9b-485e-bd9a-249493f776bc`
- Commit: `2fcce56f58b776860aadc178fab7ea4d332bc9ec`
- Status: `SUCCESS`
- App: `https://bneineviimacademy.org`

## Verification

| Check | Result | Evidence |
|---|---|---|
| Direct Railway status readback | Pass | Deployment `d070322e-4c9b-485e-bd9a-249493f776bc` reached `SUCCESS` for commit `2fcce56f58b776860aadc178fab7ea4d332bc9ec`. |
| `npm run app:smoke` | Pass | `ops/live-smokes/2026-07-07T19-58-52-265Z-live-app-smoke.md` passed public health, Operations session/auth/API, Torah progress, task create/comment/delete, signup dry-run, Buffer diagnostics, and Drive website image lane. |
| `npm run app:smoke:rabbi-onetime-landing` | Pass | `ops/live-smokes/2026-07-07T19-58-51-486Z-rabbi-onetime-landing-smoke.md` passed OneTime branding, blocked payment-link copy, and public `$67` / `$149` pricing checks. |

## Guardrail Notes

- `npm run railway:doctor` did not pass end-to-end because the project-scoped
  token can read Railway status but cannot run `railway link`; Railway returned
  `Unauthorized` during the link step.
- This is not an app deployment failure. Direct Railway status readback proved
  the BNA deployment reached `SUCCESS`, and live app smokes passed.
- The same current Railway auth context still cannot see the separate One Time
  service: `railway variable list --service one-time-web --environment
  production --json` returned `Service 'one-time-web' not found`.
- No external send, provider mutation, DNS mutation, payment, credential
  mutation, Drive/Vimeo upload, or database mutation was performed.

## Remaining One Time Blocker

Separate One Time deploy/bootstrap/live smoke still needs a Railway auth/target
context that can see `one-time-production` / `one-time-web` / `production`.
