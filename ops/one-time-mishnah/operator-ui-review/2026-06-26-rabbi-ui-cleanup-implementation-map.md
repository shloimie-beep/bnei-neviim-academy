# Rabbi Sheller One Time UI Cleanup Implementation Map

Date: 2026-06-26

Scope: safe local implementation map only. Do not push, merge, deploy, mutate
production data, send email/WhatsApp/SMS, create Stripe checkout, create Zoom
meetings, upload to Vimeo, change DNS/Railway services, or write to any
external CRM/GHL system.

## 1. Current Source Of Truth Summary

Primary repo protocol:

- `BNA-START-HERE.md` requires reading `AGENTS.md`,
  `docs/BNA-RAMBLE-TO-DONE.md`, the active execution run, and the active
  `NEXT-SESSION.md`, then running `npm run bna:run:status` and
  `npm run bna:run:next`.
- `AGENTS.md` says the live Operations UI is the static Express surface at
  `public/operations.html`; archived React Operations code is historical only.
- One Time work is first-party BNA Operations work. Do not add GHL runtime,
  GHL tools, new external CRM writes, or legacy LeadConnector assumptions.
- Every visible UI action must be covered by `ops/action-registry.json` or
  `ops/action-registry/`; every route must be covered by
  `ops/route-registry.json`.
- Provider/Rabbi scope must not see unrelated BNA school, family, parent,
  student, provider, private Operations, raw message, secret, or production-only
  data.

Current One Time review truth:

- Review workspace/project:
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Review entry:
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`.
- Shared review docs:
  `ops/one-time-mishnah/operator-ui-review/START-HERE.md` and
  `ROUTE-MAP.md`.
- Brand config:
  `config/brands/one-time.json` defines OneTimeOneTime Mishnah branding,
  colors, logo, portrait, press logos, teaching stills, and `review_only: true`.
- Service-provider site config:
  `config/service-provider-sites/one-time.json` defines the One Time slug,
  review routes, no-send copy, blocked live actions, and review-only status.
- Current route review packet is shared-app review only. It explicitly blocks
  live email sends, WhatsApp sends, Stripe charges/checkout, Zoom meeting
  creation, automated Vimeo uploads, hosted transcription retries, separate
  Railway provisioning, and DNS hookup.
- Current action coverage:
  `ops/action-registry/one-time-action-coverage.md/json` reports 40 One Time
  controls, 19 registry-hook controls, 7 external/app-visible write controls,
  11 approval-gated controls, and 0 repair rows. Coverage status is
  `verified_local_pending_deploy`.

## 2. Active Run Conflict Warning

Do not disturb the active run `2026-06-26-agent-review-dropoff-repair`.

Observed local state:

- Original checkout `C:\Users\User\BNA v2.0` is dirty and on
  `codex/closeout-vimeo-media-20260624`.
- Original checkout `ops/execution-runs/latest.json` pointed at older run
  `2026-06-21-one-time-master-completion`; required One Time review docs were
  missing there.
- Active repair worktree exists at
  `C:\Users\User\Documents\Codex\2026-06-26\agent-review-dropoff-repair` on
  `codex/agent-mode-task-decision-dropoff-20260626`; it is also dirty.
- A separate preflight worktree was created at
  `C:\Users\User\Documents\Codex\2026-06-26\onetime-rabbi-ui-preflight` on
  `codex/onetime-rabbi-ui-preflight-20260626`.
- In this preflight worktree, `npm run bna:run:status` and
  `npm run bna:run:next` fail validation because the active run expects branch
  `codex/agent-mode-task-decision-dropoff-20260626`, while this safety branch
  is `codex/onetime-rabbi-ui-preflight-20260626`.

This map is allowed because it is documentation-only in the separate preflight
worktree. Follow-up implementation must wait until the active repair run is
closed or must rebase carefully onto its final branch.

## 3. Proposed Branch / Worktree Plan

Current preflight branch/worktree:

- Branch: `codex/onetime-rabbi-ui-preflight-20260626`
- Worktree:
  `C:\Users\User\Documents\Codex\2026-06-26\onetime-rabbi-ui-preflight`
- Base commit: `ab6741bd Extend Agent Mode drop-off to task cards`

Recommended implementation path after this map:

1. Finish or explicitly pause `2026-06-26-agent-review-dropoff-repair`.
2. Create a fresh implementation worktree from the accepted post-run branch or
   latest `master`, not from the dirty original checkout.
3. Use branch name:
   `codex/onetime-rabbi-ui-cleanup-20260626`.
4. Implement in small windows by file ownership below.
5. Run local tests/watchdogs only.
6. Do not push, merge, deploy, or live-smoke unless Shloimie gives a separate
   explicit release instruction.

## 4. File Ownership Map For Parallel Codex Windows

Window A, Operations information architecture:

- Owns `public/operations.html` navigation/profile/section structure only.
- Must coordinate before editing any function also touched by other windows.
- High-risk functions/constants: `PROVIDER_PROGRAM_SUBTABS`,
  `workspaceNavViewIds`, `workspaceNavItems`, `normalizeCurrentRouteForWorkspace`,
  `currentPrimaryAction`, `syncOperationsUrl`, `renderServiceProviders`, and
  `renderPlatformSuite`.

Window B, One Time section content:

- Owns One Time-specific panels in `public/operations.html`, especially
  `renderProviderProgramWorkspace`, `renderOneTimeProduct*`,
  `renderOneTimePaymentAccessPanel`, `renderProviderParticipantsPage`,
  `renderOneTimeCrmContactsPanel`, `renderOneTimeContentLibraryPanel`, and
  related content/classroom/live-class render helpers.
- Must not change shared navigation or route sync without Window A.

Window C, server/API scope and route registry:

- Owns `server.js`, `ops/route-registry.json`, scoped allowlists, and any
  read-only/preview endpoints required by UI buttons.
- Must preserve `assertWorkspaceAccess(req, 'rabbi_sheller_provider')` style
  checks and avoid production-data mutation.

Window D, action registry and button coverage:

- Owns `ops/action-registry.json`,
  `ops/action-registry/actions.json`,
  `scripts/generate-one-time-action-coverage.mjs`,
  `ops/action-registry/one-time-action-coverage.md`, and
  `ops/action-registry/one-time-action-coverage.json`.
- Must classify every visible control using the model below.

Window E, tests and smoke evidence:

- Owns focused tests under `tests/` and local-only smoke scripts.
- Must update tests after implementation, not weaken privacy/action/route gates.

Window F, brand/config polish:

- Owns `config/brands/one-time.json`,
  `config/service-provider-sites/one-time.json`,
  `public/css/one-time-shared-review.css`, and One Time asset references only.
- Must keep `review_only: true` and `external_write_performed: false` unless a
  separate launch task authorizes otherwise.

## 5. Exact UI Sections And Route / Query Structure

Use one scoped base for all Rabbi workspace routes:

`/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=<view>&section=<section>`

The current code derives the project from workspace in several places and only
persists `project=` for Tasks during `syncOperationsUrl`. Cleanup should either
preserve `project=one_time_mishnah_class` for all One Time workspace routes or
explicitly document that `workspace=rabbi_sheller_provider` is canonical and
project is derived.

Proposed default route:

`/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`

Target Rabbi-facing sections:

| User section | Proposed route | Current anchors to reuse |
| --- | --- | --- |
| Overview / Package Status | `view=service_providers&section=overview` | Provider program overview, product readiness, setup blockers, current package state |
| Members / CRM | `view=contacts&section=participants` | Provider participants, One Time CRM contacts, leads, dedupe/import preview |
| Classes & Content | `view=content&section=one_time_library` | Meeting drops, One Time library, class packages, classroom, worksheets/source sheets, question moderation |
| Communications | `view=communications&section=providers` | Email/social drafts, no-send templates, contact communication history, support threads |
| Automations | `view=automations&section=center` | Draft automation center, helper-created automation previews, disabled live triggers |
| Payments & Access | `view=service_providers&section=access` | Product offers, trial/referral config, checkout review, class links, access grants, disabled live grant |
| Tasks & Decisions | `view=tasks&section=one_time&project=one_time_mishnah_class` | One Time tasks, decisions, blockers, activity, comments without implicit Codex requeue |
| Settings / Setup | `view=settings&section=workspace` | Branding, users/access, provider portal, integrations, billing/payment links, approval gates |

Platform Support drawer:

- Do not show Platform Suite, Team/Admin, Accounting, BNA Students, raw
  watchdog internals, deployment controls, agent run controls, credential
  diagnostics, or route/action watchdog machinery in the Rabbi demo nav.
- Put support-only status under a drawer opened from a small support chip for
  Shloimie/platform-support roles only.
- Suggested drawer query: keep current route and add `support=platform`, for
  example
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview&support=platform`.
- Suggested action ID:
  `ACTION-ONETIME-PLATFORM-SUPPORT-DRAWER`.
- Drawer content should be read-only: action coverage, route coverage, last
  local smoke, setup blockers, and active-run warning.

## 6. Button Classification Model

Every visible button/control in the Rabbi workspace must map to exactly one of
these classes in the UI and action registry.

| Class | Meaning | UI treatment | Examples |
| --- | --- | --- | --- |
| Ready | Safe first-party read or local first-party write works now in scoped workspace | Normal primary/secondary button, success/error readback | Add Task, Create Decision, Add Member no-send, Assign Role within scope, Add Class, Add Session, Post Rabbi Thread |
| Preview only | Computes or opens a read-only preview and performs no external write | Button label starts with or clearly implies Preview/Dry-run; result shows `production writes: no` when relevant | Preview Drive Brief, Preview Package, Member Preview, Dry-run send, email template preview |
| Needs Rabbi decision | Requires Rabbi Sheller to decide content, pricing, owner, schedule, copy, or account ownership before enabling | Disabled/gated button with decision card link and next action | Final tier/pricing, Rabbi WhatsApp owner number, Vimeo/Zoom/Resend owner path, class schedule policy |
| Needs Shloimie setup | Requires Shloimie/local operator setup, registry entry, env/keyholder workflow, or no-send contract | Setup button opens helper/task panel; no external action | Add Appointment setup, Retry setup, Settings Test Connection setup, Settings Reset setup |
| Blocked external setup | Requires external account/DNS/OAuth/billing/video host action | Disabled with owner, blocker, recommended option, alternatives, consequence, exact next action | Live email send, Stripe checkout/charge, Zoom meeting creation, automated Vimeo upload, DNS/Railway provisioning |
| Internal support only | Useful for Codex/Shloimie/platform support, not Rabbi demo workflow | Hidden by default; available only in Platform Support drawer for support roles | Watchdog/action coverage, route registry diagnostics, agent evidence, deployment/live-smoke records |

Registry mapping:

- `Ready`: `status: active` or coverage `status: working`.
- `Preview only`: `status: preview_only`, `dry_run_supported: true`, no external write.
- `Needs Rabbi decision`: `status: disabled_with_reason` or `approval_gated`
  with `blocker_owner: Rabbi Sheller`.
- `Needs Shloimie setup`: `status: setup_path` and helper/task handler.
- `Blocked external setup`: `status: disabled_with_reason` or
  `approval_gated`, with explicit external owner/action.
- `Internal support only`: `status: support_only` or scoped equivalent, hidden
  from normal provider nav.

## 7. Files Likely Touched In Follow-Up Implementation

High conflict:

- `public/operations.html`
- `server.js`
- `ops/action-registry.json`
- `ops/route-registry.json`

Likely UI/support files:

- `public/css/one-time-shared-review.css`
- `public/provider.html`
- `public/parent.html`
- `public/student.html`
- `public/one-time-classroom.html`
- `public/one-time-email-review.html`
- `public/one-time/index.html`

One Time config/domain files:

- `config/brands/one-time.json`
- `config/service-provider-sites/one-time.json`
- `src/platform/instances/one-time.js`
- `src/platform/service-provider-sites/index.js`
- `src/lib/bna/one-time-role-model.js`
- `src/platform/rbac.js`

Action/coverage files:

- `ops/action-registry/actions.json`
- `scripts/generate-one-time-action-coverage.mjs`
- `ops/action-registry/one-time-action-coverage.md`
- `ops/action-registry/one-time-action-coverage.json`

Test files likely touched:

- `tests/one-time-action-coverage.test.js`
- `tests/watchdog-action-registry.test.js`
- `tests/watchdog-route-security.test.js`
- `tests/one-time-operations-ui-smoke.test.js`
- `tests/rabbi-scheller-auth-navigation-contract.test.js`
- `tests/rabbi-scheller-tenant-isolation-contract.test.js`
- `tests/workspace-user-role-management.test.js`
- `tests/workspace-task-no-stale-agent.test.js`
- `tests/one-time-shared-review-branding.test.js`
- `tests/one-time-review-only-server.test.js`
- `tests/one-time-member-library.test.js`
- `tests/one-time-classroom-calendar-community-bot.test.js`
- `tests/one-time-communications-workspace.test.js`
- `tests/live-class-infrastructure.test.js`
- `tests/operations-pwa-login.test.js`
- `tests/integrations/w4-onetime-readiness.test.js`
- `tests/google-workspace-settings-contract.test.js`
- `tests/provider-api-usage-readiness.test.js`

Branch-skew note:

- `tests/operations-one-time-view-as.test.js` existed in the dirty original
  checkout but not on this clean preflight branch. Treat that as branch skew
  and reconcile before implementation.

## 8. Tests / Watchdogs Required

Minimum local focused test set:

```powershell
node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js tests/watchdog-route-security.test.js tests/one-time-operations-ui-smoke.test.js tests/rabbi-scheller-auth-navigation-contract.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/workspace-user-role-management.test.js tests/workspace-task-no-stale-agent.test.js tests/one-time-shared-review-branding.test.js tests/one-time-review-only-server.test.js
```

Functional One Time test expansion:

```powershell
node --test tests/one-time-member-library.test.js tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-communications-workspace.test.js tests/live-class-infrastructure.test.js tests/operations-pwa-login.test.js tests/integrations/w4-onetime-readiness.test.js tests/google-workspace-settings-contract.test.js tests/provider-api-usage-readiness.test.js
```

Watchdogs/gates:

```powershell
npm run watchdog:actions
npm run watchdog:security
npm run watchdog:links
npm run secrets:audit
```

Optional local browser proof, no live writes:

```powershell
npm run one-time:smoke:canonical-journey-local
node --test tests/one-time-operations-ui-smoke.test.js
```

Do not run live smoke, Railway doctor, deploy scripts, Stripe sandbox/live,
Zoom/Vimeo/Resend external actions, or provisioning scripts in this cleanup
unless a separate prompt explicitly authorizes that release or external setup
work.

## 9. Explicit Follow-Up Instruction

All follow-up Codex windows must start with:

Do not push. Do not merge. Do not deploy. Do not create a GitHub PR. Do not
mutate production data. Do not send email, WhatsApp, SMS, or social posts. Do
not create Stripe checkout, Zoom meetings, Vimeo uploads, DNS changes, Railway
services, or external CRM/GHL writes. Work locally only, use a separate
worktree, and record any blocker instead of trying a live action.

## 10. Known Risks And Conflict Points

- `public/operations.html` is the main conflict point. It owns navigation,
  routing, data loading, One Time panels, button handlers, task views, support
  drawers, and settings in one large file. Parallel edits must divide by line
  ownership and re-run the focused smoke.
- Active run `2026-06-26-agent-review-dropoff-repair` already touches
  `public/operations.html`, `server.js`, `ops/action-registry.json`,
  `ops/route-registry.json`, and related tests. Do not start implementation
  until that run is closed or the implementation branch is rebased.
- Provider/Rabbi spelling is inconsistent across prompt/docs/code
  (`Sheller`, `Scheller`, `Rabbi Elie`, `Rabbi Eli`). UI copy should use the
  approved display name from config/data, currently `Rabbi Eli Scheller` or
  `Rabbi Elie Scheller` depending on source. A decision may be needed.
- Existing service-provider nav includes `watchdog`, `agents`, `studio`,
  `api_usage`, and `integrations`. For Rabbi demo cleanup, decide which stay
  visible and which move into Platform Support.
- `syncOperationsUrl` currently drops `project=` except Tasks. If exact
  route/query proof requires project on every Rabbi route, this must be changed
  and tested carefully.
- Payment/access UI has real-looking concepts but must stay gated. Never show
  checkout, charge, refund, or access-grant actions as ready without separate
  approval and tests.
- Communications UI must keep draft/no-send distinction clear. Resend sender
  and domain readiness remain blocked until approved.
- Zoom and Vimeo controls must not imply live creation/upload. Manual URL
  attach and read-only preview are acceptable; upload and meeting creation are
  blocked external setup.
- One Time review fixtures are TEST-only. Do not bleed BNA school students,
  family records, private goals, bot context, parent data, or provider-private
  data into Rabbi/provider scope.
- The dirty original checkout and dirty active repair worktree contain
  uncommitted/untracked files. Future windows must avoid treating those as
  clean source of truth without branch reconciliation.

## Recommended Next Codex Windows

1. UI IA window: refactor the Rabbi workspace nav into the eight target
   sections and Platform Support drawer, touching only `public/operations.html`
   nav/routing helpers.
2. Button coverage window: update visible button copy/states and regenerate
   One Time action coverage so every control has one of the six classes.
3. Content panels window: reorganize existing One Time panels under Members,
   Classes & Content, Communications, Payments & Access, and Settings without
   changing external behavior.
4. Server/registry window: add only local/read-only route or action registry
   entries needed by the new UI, preserving private route and workspace guards.
5. Test window: update focused tests, run local Playwright smoke, action route
   watchdogs, link/security watchdogs, and secrets audit.
