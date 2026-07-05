# One Time Canonical Target Routing Audit

Generated: 2026-07-05
Raw/source: `RAW-20260705-009`
Register: `tasks-pending/2026-07-05-onetime-canonical-target-routing.md`

## Executive Summary

The earlier closeout verified the BNA-hosted One Time preview at
`https://bneineviimacademy.org/one-time/#watch`, not the canonical One Time
production target.

Canonical public proof must come from:

- `https://join.onetimeonetime.com/`
- `https://join.onetimeonetime.com/one-time/`

Pre-deploy live readback on 2026-07-05 confirmed the split:

| Target | Route | Observed title | New funnel present | Stale page present | Status |
| --- | --- | --- | --- | --- | --- |
| BNA production | `/one-time/` | `Your Child Can Love Learning Mishnayos | OneTimeOneTime` | yes | no | preview updated |
| One Time canonical | `/` | `Learn Mishnayos Live with Rabbi Eli Scheller` | no | yes | stale |
| One Time canonical | `/one-time/` | `Learn Mishnayos Live with Rabbi Eli Scheller` | no | yes | stale |

## Target Map

| Surface | Canonical URL | Purpose | Closeout rule |
| --- | --- | --- | --- |
| BNA public site | `https://bneineviimacademy.org/` | BNA Academy public homepage | Do not use as One Time production proof. |
| BNA-hosted One Time preview | `https://bneineviimacademy.org/one-time/` | Shared-platform preview/fallback route | Useful for local/BNA preview proof only. |
| One Time public production | `https://join.onetimeonetime.com/` | Canonical One Time join root | Must serve the focused One Time funnel in single-tenant mode. |
| One Time public production funnel | `https://join.onetimeonetime.com/one-time/` | Canonical One Time launch funnel route | Must serve `Your Child Can Love Learning Mishnayos`. |
| One Time Operations | `https://join.onetimeonetime.com/operations?...workspace=rabbi_sheller_provider...` | Provider-scoped Operations surface | Needs auth and redacted visual QA evidence. |

Railway readback:

- Project: `one-time-production`
- Service: `one-time-web`
- Environment: `production`
- Domain: `join.onetimeonetime.com`
- Existing latest deployment before this fix: deployment created 2026-07-02, still serving stale page content.

## Source Split Diagnosis

Repo source already contains the new focused funnel in
`public/one-time/index.html`:

- `<title>Your Child Can Love Learning Mishnayos | OneTimeOneTime</title>`
- H1 `Your Child Can Love Learning Mishnayos`
- CTA `Start 30 Days Free`
- brand text `OneTimeOneTime Mishnah`

Server source already mapped `/one-time` to that file, but One Time
single-tenant root `/` was previously left to static `public/index.html`.
That allowed a canonical One Time root to diverge from the intended funnel.

The live join domain also proved stale deployment state: its API
`/api/one-time/instance-config` reported `app_instance=onetime`,
`workspace_key=rabbi_sheller_provider`, and
`project_key=one_time_mishnah_class`, while the public pages still served the
old Rabbi landing copy. That means the target/service is real, but the deployed
web bundle/content is stale relative to current repo source.

## Implemented Guardrails

Code changes in this branch:

- `server.js`: One Time single-tenant runtime now serves
  `public/one-time/index.html` at `/` and `/index.html`; BNA runtime still
  serves the normal BNA homepage.
- `scripts/smoke-onetime-separate-instance-live.mjs`: canonical One Time smoke
  now fails if `/` or `/one-time/` lacks `Your Child Can Love Learning
  Mishnayos`, lacks the One Time funnel CTA, or still shows
  `Learn Mishnayos Live with Rabbi Eli Scheller`.
- `scripts/release-captain.mjs`: added `--target one-time-public` target gate
  with live page, instance-config, and Railway project/service/domain readbacks.
- `package.json`: added `release:captain:one-time-public` and
  `one-time:target:guard`.
- `docs/architecture/onetime-single-tenant-split.md`: documented the
  shared-platform vs provider-specific target boundary.
- `ops/route-registry.json`: documented the One Time single-tenant root route
  variant.

Required guard commands:

```powershell
npm run release:captain:one-time-public
npm run one-time:target:guard
npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com
```

## Pre-Deploy Evidence

Commands run before deploy:

| Command | Result |
| --- | --- |
| `node --test tests\release-captain.test.js` | PASS |
| `node --test tests\one-time-focused-landing.test.js tests\one-time-separate-instance-package.test.js` | PASS |
| `npm run one-time:target:guard` | EXPECTED FAIL: join domain served stale Rabbi page |
| `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` | EXPECTED FAIL: `/` missing canonical launch funnel headline |
| `npm run bna:run:validate` | PASS |
| `npm run watchdog:protocol-drift` | PASS |
| `npm test` | Initial run found two local failures caused by this branch/test artifacts; both were repaired and rerun focused green |
| `node --test tests\rabbi-checkout-access.test.js tests\watchdog-action-registry.test.js` | PASS after repair |
| `node --test tests\one-time-focused-landing.test.js tests\one-time-separate-instance-package.test.js tests\release-captain.test.js` | PASS after repair |
| `git diff --check` | PASS |

Local One Time runtime readback:

| Local route | Result |
| --- | --- |
| `http://127.0.0.1:4319/` with `APP_INSTANCE=onetime` | Served `Your Child Can Love Learning Mishnayos | OneTimeOneTime` |
| `http://127.0.0.1:4319/one-time/` with `APP_INSTANCE=onetime` | Served `Your Child Can Love Learning Mishnayos | OneTimeOneTime` |
| `http://127.0.0.1:4319/api/one-time/instance-config` | Reported `app_instance=onetime` |

## Sidebar / Navigation Audit

Current repo-visible One Time Operations navigation evidence remains based on
the prior BNA-hosted live closeout and current source. The canonical join target
still needs a fresh post-deploy visual audit.

Required post-deploy audit route family:

- overview
- members / participants
- classes / content library
- live class / schedule
- community / classroom questions
- communications
- automations
- payments / trial / access
- tasks / decisions
- reporting
- connectors / integrations
- setup / workspace settings

## Stale PR Cleanup Recommendation

Do not broad-merge these stale draft/dirty PRs:

| PR | Branch | Current recommendation |
| --- | --- | --- |
| #63 `[codex] Clean One Time launch setup integration` | `codex/one-time-clean-integration-20260702` | Keep draft; cherry-pick only audited setup artifacts if still needed. It predates the canonical-target guard and is merge-state dirty. |
| #62 `[codex] Reconcile One Time launch cleanup` | `codex/one-time-launch-cleanup-20260702-no-workflow` | Keep draft/archive after confirming no unique requirement remains. It is a broad cleanup bundle and merge-state dirty. |
| #51 `[codex] Repair One Time Operations UI shell` | `codex/rabbi-onetime-comms-scope-release-20260629` | Do not merge. Its useful work was superseded by later merged One Time Operations sidebar/release PRs (#97/#98). |

## Post-Deploy Proof

Status: pending in this report revision.

Required before terminal Done:

- commit and push scoped branch;
- open PR;
- deploy to Railway target `one-time-production / one-time-web`;
- live-smoke `https://join.onetimeonetime.com/` and `/one-time/`;
- run target guard until it passes;
- capture visual QA screenshots/findings for the One Time Operations route
  family or record an auth blocker;
- update this report with deployment/live-smoke evidence.
