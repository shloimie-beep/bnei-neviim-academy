# One Time Canonical Target Routing Audit

Generated: 2026-07-05
Updated: 2026-07-05T18:26:45+03:00
Raw/source: `RAW-20260705-009`
Register: `tasks-pending/2026-07-05-onetime-canonical-target-routing.md`
Branch: `codex/onetime-canonical-target-routing-20260705`
PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/99`

## Executive Summary

The earlier closeout proved the BNA-hosted One Time preview, not the canonical
One Time production target. Pre-fix, `https://bneineviimacademy.org/one-time/`
served the new `Your Child Can Love Learning Mishnayos` funnel while
`https://join.onetimeonetime.com/` and `/one-time/` still served the stale
`Learn Mishnayos Live with Rabbi Eli Scheller` page.

This branch fixed the single-tenant One Time root route, installed a
target-aware Release Captain guard, deployed the One Time Railway service, and
live-smoked `https://join.onetimeonetime.com` directly. The canonical public
target is now live-verified.

## Target Map

| Target name | Railway project | Project ID | Environment | Service | Public domain | Routes served | Deployed branch/commit | Database/Postgres readback | Target classification | Smoke command | Deploy/readback authorized |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BNA platform production | `skillful-motivation` | not used for this deploy | `production` | not used for this deploy | `bneineviimacademy.org` | `/`, `/operations`, `/one-time/` preview | previous BNA production state | not inspected in this fix | BNA platform production plus BNA-hosted One Time preview | `npm run release:captain` and BNA smokes, not proof for One Time production | readback allowed; no BNA deploy in this task |
| BNA-hosted One Time preview | `skillful-motivation` | not used for this deploy | `production` | not used for this deploy | `bneineviimacademy.org` | `/one-time/`, `/one-time/#watch` | previous BNA production state | not inspected in this fix | BNA-hosted One Time preview | not sufficient for canonical One Time proof | readback allowed; deploy not performed |
| One Time canonical production | `one-time-production` | `ce55ef20-1418-4ad3-aafa-f877fb992dc8` | `production` (`f911acfc-e206-44df-a569-9d69d709b94b`) | `one-time-web` (`d175ad94-5e3c-41c2-8cbc-daa1a299077d`) | `join.onetimeonetime.com` | `/`, `/one-time/`, `/api/one-time/instance-config`, portals/classroom | CLI upload from `codex/onetime-canonical-target-routing-20260705` commit `cbe693a18ab7`; Railway deployment `e95bb2e7-a675-46b2-a58a-e38413646702` | Railway lists `Postgres-j9Pi` and `Postgres`; neither DB service was mutated, deleted, or inspected for raw data | One Time canonical production | `npm run one-time:target:guard`; `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` | CLI deploy/readback authorized by operator request; production data writes not authorized |
| One Time Operations | `one-time-production` | same as above | `production` | `one-time-web` | `join.onetimeonetime.com` | `/operations?...workspace=rabbi_sheller_provider&project=one_time_mishnah_class...` | same deployment | no production data mutation | Provider-scoped Operations surface | visual audit script captured redirects/screenshots; logged-in UI proof blocked by invalid ops credentials | readback and screenshots allowed; logged-in inspection blocked |

## Source Split Diagnosis

The new funnel source is `public/one-time/index.html`:

- `<title>Your Child Can Love Learning Mishnayos | OneTimeOneTime</title>`
- H1 `Your Child Can Love Learning Mishnayos`
- CTA `Start 30 Days Free`
- brand text `OneTimeOneTime Mishnah`

The server route already served `/one-time` from that file, but the One Time
single-tenant root `/` was not explicitly routed before static middleware. In
the One Time Railway runtime, that let the canonical root keep showing stale
public content. The join domain API already reported the correct instance:
`app_instance=onetime`, `workspace_key=rabbi_sheller_provider`, and
`project_key=one_time_mishnah_class`, so this was a web bundle/routing and
deployment proof problem, not a request to create or delete Railway projects or
Postgres services.

Answers:

| Question | Finding |
| --- | --- |
| Are these two separate HTML files? | The new approved funnel is `public/one-time/index.html`; the stale join content came from the deployed One Time web bundle/static root behavior. |
| Are they two server routes pointing to different files? | Yes before this fix: `/one-time` served the focused funnel, while One Time single-tenant `/` could fall through to the generic static root. |
| Is one static and one generated? | Both are static/Express-served public assets. |
| Is one served by BNA Railway and one by One Time Railway? | Yes. BNA preview was on `bneineviimacademy.org`; canonical One Time production is `one-time-production / one-time-web` on `join.onetimeonetime.com`. |
| Is one-time-web deploying an older commit/content bundle? | Pre-fix latest One Time deployment was from 2026-07-02 and served stale content; the new deployment is `e95bb2e7...` from 2026-07-05. |
| Different branch/build/root config? | Railway status shows source repo `null` and CLI deployment metadata, so this service is not currently proving from GitHub auto-deploy branch state. |
| Intentional or stale? | BNA `/one-time` is preview/fallback. `join.onetimeonetime.com` is canonical production and was stale until this fix/deploy. |

## Implemented Fix And Guardrails

Changed runtime and tooling:

- `server.js`: One Time single-tenant runtime now serves
  `public/one-time/index.html` at `/`, `/index.html`, `/one-time`, and
  `/one-time/`; BNA runtime keeps the BNA homepage at root.
- `scripts/smoke-onetime-separate-instance-live.mjs`: direct live smoke now
  fails if join `/` or `/one-time/` lacks the approved headline/CTA/brand or
  still shows stale Rabbi landing copy.
- `scripts/release-captain.mjs`: added `--target one-time-public` with live
  page, instance-config, and Railway project/service/domain readbacks.
- `package.json`: added `release:captain:one-time-public` and
  `one-time:target:guard`.
- `docs/architecture/onetime-single-tenant-split.md`: documents shared platform
  versus One Time-specific routing/branding/data boundaries.
- `ops/route-registry.json` and One Time action coverage: record target and
  action expectations.

Guard commands:

```powershell
npm run release:captain:one-time-public
npm run one-time:target:guard
npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com
```

## Shared Platform / Provider Boundary

Shared platform improvements in this work:

- navigation shell and One Time sidebar route wiring;
- route/action registry expectations;
- Release Captain target gate;
- canonical live smoke for a separate provider instance;
- reusable public route handling for single-tenant provider runtimes.

One Time-specific configuration:

- black/yellow OneTimeOneTime brand;
- OneTimeOneTime Mishnah logo/header and funnel copy;
- Rabbi Eli Scheller / Mishnayos labels;
- class schedule, portal, parent tracking, and accountability copy.

Provider-specific isolated data:

- students, parents, attendance, class links, communication records, payments,
  community/classroom records, and provider setup records remain scoped to
  `rabbi_sheller_provider / one_time_mishnah_class`.

No One Time provider data was hardcoded into shared BNA components by this
fix, and no production data mutation was performed.

## Sidebar / Navigation Audit

One Time uses the shared Operations shell in `public/operations.html`, with
One Time-specific module configuration in `ONE_TIME_PROVIDER_PRIMARY_NAV_ITEMS`
around line 34710. Labels such as `Comms` and `Auto` are source-defined there,
not caused only by viewport width. The category metadata also defines `Comms`
around line 9990.

| Current label | Proposed desktop label | Compact/mobile label | Shared/provider-specific | File/component | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| `Comms` | `Communications` | `Comms` allowed only if width constrained | Shared concept with provider route | `public/operations.html` One Time nav items and category metadata | Desktop sidebar shows full label; compact/mobile may use short label with full tooltip/ARIA. |
| `Auto` | `Automations` | `Auto` allowed only if width constrained | Shared concept | `public/operations.html` One Time nav items | Desktop label matches shared main nav and subnav. |
| `Connectors` | `Integrations` or `Connectors` with setup subtitle | `Conn.` only if width constrained | Shared platform setup; provider-scoped config | `public/operations.html` One Time nav items | Label aligns with actual route and action registry. |
| `Setup` | `Workspace Setup` | `Setup` | Shared shell, provider workspace data | `public/operations.html` One Time nav items | Makes clear this is workspace setup, not product onboarding. |
| `Live Class` / `Schedule` | Keep, but verify visual hierarchy | same | Provider-specific | `public/operations.html` nav and subnav config | No duplicate/confusing route state between live class and schedule. |

First safe batch recommendation: implement only label/full-text behavior and
ARIA/tooltip clarity after a logged-in screenshot pass. Do not redesign the
navigation shell in this target-routing PR.

## Visual QA Evidence

Command:

```powershell
node scripts/audit-rabbi-onetime-current-state.mjs --base https://join.onetimeonetime.com --out ops/ui-audits/2026-07-05-onetime-canonical-target-routing/visual-qa
```

Result:

- screenshots captured: 80;
- routes audited: 16;
- viewports: `1440-desktop`, `1024-desktop-tablet`, `768-tablet`,
  `430-mobile`, `390-mobile`;
- report: `ops/ui-audits/2026-07-05-onetime-canonical-target-routing/visual-qa/report.md`;
- route inventory: `ops/ui-audits/2026-07-05-onetime-canonical-target-routing/visual-qa/route-inventory.md`;
- blocker: Operations login returned 401 with the stored credentials, so
  logged-in Operations layout cannot be marked clean from this run.

| Surface | Route evidence | Screenshot evidence | Defect/status | Severity | Likely file/component | Scope | Acceptance criteria / smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Public funnel | `/one-time` | `visual-qa/screenshots/one-time-public-1440-desktop.png` | Captured canonical join funnel after deploy | P0 passed | `public/one-time/index.html`, `server.js` | One Time-specific public funnel | Guard and smoke pass on join `/` and `/one-time/`. |
| Member login | `/one-time/member-login` | `visual-qa/screenshots/one-time-member-login-1440-desktop.png` | Captured route | P2 review | public member-login route | One Time portal | Add focused visual assertions if changed. |
| Overview/dashboard | `/operations?...section=overview` | `visual-qa/screenshots/operations-overview-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | `public/operations.html` shared shell | Shared/provider | Valid ops credentials, then screenshot logged-in dashboard and verify no giant empty center/right rail breakage. |
| Members | `/operations?...section=participants` | `visual-qa/screenshots/operations-participants-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | `public/operations.html` contacts/participants | Shared/provider | Verify member table/cards fit desktop/mobile. |
| Classes/content | `/operations?...section=one_time_library` | `visual-qa/screenshots/operations-library-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | One Time library renderer | One Time-specific | Verify class cards/actions align and no private data leakage. |
| Communications | `/operations?...view=communications` | `visual-qa/screenshots/operations-communications-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | communications module | Shared/provider | Verify full desktop labels and guarded send states. |
| Automations | `/operations?...view=automations` | `visual-qa/screenshots/operations-automations-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | automation center | Shared | Verify filters/table/detail panel hierarchy. |
| Payments/access | `/operations?...section=access` | `visual-qa/screenshots/operations-access-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | provider access/payment panel | Provider-specific data, shared pattern | Verify no live charge/access action without approval. |
| Tasks | `/operations?...view=tasks&section=one_time` | `visual-qa/screenshots/operations-tasks-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | tasks/decisions board | Shared/provider | Verify no cramped columns and correct lane labels. |
| Setup/connectors | `/operations?...view=settings`; integrations route in inventory | `visual-qa/screenshots/operations-settings-1440-desktop.png` | Redirected to login; logged-in layout not verified | P1 blocker | settings/integrations shell | Shared/provider | Verify setup and connector labels are clear and scoped. |
| Provider/parent/student/classroom/email review | portal/review routes | see `visual-qa/screenshots/*review-1440-desktop.png` | Captured unauthenticated/review states | P2 review | portal/review pages | Mixed | Add focused smoke if a visual repair touches these surfaces. |

The user-reported logged-in UI defects should become a separate focused Product
Quality Compiler packet after valid auth evidence exists. This report does not
claim the logged-in Operations UI is clean.

## Verification

Pre-deploy and local:

| Command | Result |
| --- | --- |
| `node --test tests\release-captain.test.js` | PASS |
| `node --test tests\one-time-focused-landing.test.js tests\one-time-separate-instance-package.test.js` | PASS |
| `npm run one-time:target:guard` | Expected fail before deploy; join showed stale page |
| `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` | Expected fail before deploy; join missing headline |
| local One Time runtime on port 4319 | `/` and `/one-time/` served new funnel |
| `npm run bna:run:validate` | PASS |
| `npm run watchdog:protocol-drift` | PASS |
| focused affected test suite | PASS after assertion repairs |
| `git diff --check` | PASS |

Deployment:

| Step | Evidence |
| --- | --- |
| Railway target | `one-time-production / production / one-time-web / join.onetimeonetime.com` |
| Deployment | `e95bb2e7-a675-46b2-a58a-e38413646702` |
| Deployment status | `SUCCESS` |
| Deploy method | CLI upload from local scoped branch after account auth; stale project token was not used |
| Database safety | Postgres services were listed only; no DB mutation, deletion, bootstrap, or cleanup ran |

Post-deploy live proof:

| Command/readback | Result |
| --- | --- |
| `npm run one-time:target:guard` | PASS; join `/` and `/one-time/` title `Your Child Can Love Learning Mishnayos | OneTimeOneTime`; instance config scoped to `rabbi_sheller_provider / one_time_mishnah_class` |
| `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` | PASS for health, instance-config, `/`, `/one-time`, `/one-time/`, login, parent, student, provider, classroom routes |
| `npm run release:captain:one-time-public` | PASS target gate; writes `ops/release-captain/latest-release-captain.md` |
| Visual QA | 80 screenshots captured; logged-in Operations proof blocked by invalid credentials |

## Stale PR Cleanup Recommendation

Do not merge these stale draft/dirty PRs as broad bundles:

| PR | Branch | Recommendation | Reason |
| --- | --- | --- | --- |
| #63 | `codex/one-time-clean-integration-20260702` | Keep draft or close as superseded after checking for unique setup artifacts | Predates target guard and is merge-state dirty. |
| #62 | `codex/one-time-launch-cleanup-20260702-no-workflow` | Close/archive if no unique requirement remains | Broad cleanup bundle, dirty, and unsafe to merge wholesale. |
| #51 | `codex/rabbi-onetime-comms-scope-release-20260629` | Do not merge; extract only specific audited ideas if still needed | Useful sidebar work has been superseded by later One Time Operations PRs #97/#98 and this target-routing fix. |

## Guardrail Confirmation

No Postgres service deletion, production data mutation, email/WhatsApp/SMS/
Telegram send, charge, payment link, access grant, DNS change, Drive write,
credential change, provider-account mutation, external CRM write, or broad
stale PR merge was performed.

Release state:
- BNA production: Not deployed by this task; BNA `/one-time/` remains a preview/fallback and is not accepted as One Time production proof.
- BNA-hosted One Time preview: New funnel already visible pre-fix at `https://bneineviimacademy.org/one-time/`; documented as preview/fallback.
- One Time production: LIVE VERIFIED on `https://join.onetimeonetime.com/` and `https://join.onetimeonetime.com/one-time/` after Railway deployment `e95bb2e7-a675-46b2-a58a-e38413646702`.
- Local-only work: None for runtime code after commit `cbe693a18ab7` was pushed and deployed; this evidence update remains local until the final evidence commit is pushed.
- PR-open work: PR #99 carries the scoped branch and evidence; stale PRs #51/#62/#63 must not be merged wholesale.
- Merged-not-deployed work: None for the canonical public runtime fix; the deployed runtime code is commit `cbe693a18ab7`.
- Deployed-not-smoked work: None for the canonical public target; logged-in Operations visual cleanup is not implemented and not claimed clean.
- Live-verified work: One Time public root, One Time `/one-time/`, instance-config, and separate-instance smoke on `join.onetimeonetime.com`.
- Blockers: Valid logged-in Operations credentials are needed for a real screenshot-backed cleanup of the One Time Operations dashboard/sidebar/right rail.
- Single safest next action: Push/merge PR #99, then open a focused Product Quality Compiler packet for logged-in One Time Operations UI cleanup using valid auth evidence.
