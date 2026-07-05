# Ramble Intake - 2026-07-05 - One Time Canonical Target Routing

## Raw intake

Shloimie reported that the new OneTimeOneTime public funnel was verified on
`bneineviimacademy.org/one-time/#watch`, but the canonical production target
for the One Time public funnel is `https://join.onetimeonetime.com/one-time/`
and likely the `join.onetimeonetime.com` root. The join domain still appears to
show the older "Learn Mishnayos Live with Rabbi Eli Scheller" page. This
register supersedes any claim that One Time public landing work is done from
BNA-hosted proof alone.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-009 |
| Source | codex_chat_attachment |
| Parse status | registered |
| Raw record | `raw-input/RAW-20260705-009-onetime-canonical-target-routing.md` |
| Required report | `ops/ui-audits/2026-07-05-onetime-canonical-target-routing/REPORT.md` |

## Hard guardrails

- Do not delete either Postgres service.
- Do not mutate production data.
- Do not perform email/WhatsApp/SMS/Telegram sends.
- Do not create charges, payment links, access grants, DNS changes, Drive
  writes, credential changes, provider-account mutations, or external CRM
  writes.
- Do not broad-merge stale draft PRs #51, #62, or #63.
- Do not mark terminal Done unless One Time production means
  `join.onetimeonetime.com`, not only `bneineviimacademy.org`.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-501 | Create a target-aware audit report and target map for BNA production, BNA-hosted One Time preview, and One Time canonical production. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | target_audit | P0 | B0 | Report exists at the required path with target map, live routes, Railway/project/readback data where available, smoke commands, and authorization state. | Done |
| REQ-20260705-502 | Identify the exact source split between the updated BNA-hosted "Your Child Can Love Learning Mishnayos" page and the stale join "Learn Mishnayos Live with Rabbi Eli Scheller" page. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | source_audit | P0 | B1 | Report names files/routes/templates/services and answers whether the split is static/generated, branch/service/root-directory, intentional preview, or stale production. | Done |
| REQ-20260705-503 | Fix the canonical One Time public production target so `https://join.onetimeonetime.com/one-time/` shows the intended updated funnel. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | implementation | P0 | B2 | Join `/one-time/` live page shows the black/white/yellow funnel with "Your Child Can Love Learning Mishnayos", 30 days free CTA, sections, and mobile/tablet/desktop layout. | Done |
| REQ-20260705-504 | Decide and document how `bneineviimacademy.org/one-time` relates to canonical One Time production. | RAW-20260705-009 | bna_platform / public_preview | Codex | target_decision | P0 | B2 | BNA route is synced, redirected, or explicitly documented as preview/internal/provider demo. | Done |
| REQ-20260705-505 | Install a target-aware release guard so One Time public work cannot close from BNA production proof alone. | RAW-20260705-009 | bna_platform / release_closeout | Codex | release_guard | P0 | B3 | `npm run release:captain -- --target one-time-public` or equivalent command knows canonical join domain, expected service/project, expected headline/brand, and separates target states. | Done |
| REQ-20260705-506 | Record shared-platform versus One Time provider-specific architecture boundaries. | RAW-20260705-009 | bna_platform / provider_architecture | Codex | architecture | P1 | B3 | Report distinguishes reusable shell/cards/tables/forms/QA/release guardrails from One Time branding/copy/data. | Done |
| REQ-20260705-507 | Audit One Time Operations sidebar/navigation labels and recommend first safe batch. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | nav_audit | P1 | B4 | Report lists current label, proposed label, shared/provider-specific classification, file/component, and acceptance criteria. | Done |
| REQ-20260705-508 | Create screenshot-backed visual QA findings for One Time Operations views. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | visual_qa | P1 | B4 | Report includes screenshots for overview, members, classes, live class, schedule, community, communications, automations, payments, tasks, reporting, connectors, and setup with severity and acceptance criteria. | Blocked for logged-in UI proof |
| REQ-20260705-509 | Recommend stale PR cleanup for PR #51, #62, and #63 without merging them. | RAW-20260705-009 | bna_platform / github_hygiene | Codex | pr_audit | P1 | B5 | Report recommends keep/close/extract/ignore and notes whether useful work is already merged through later PRs. | Done |
| REQ-20260705-510 | Verify, commit, push, PR, deploy or document exact blocker, and live-smoke One Time production directly. | RAW-20260705-009 | bna_platform / release_closeout | Codex | publish_deploy | P0 | B6 | Required commands and post-change tests pass; join `/one-time/` is directly live-smoked or a precise deploy/access blocker remains. | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|
| DEC-20260705-501 | Canonical One Time public proof must come from `join.onetimeonetime.com`, not BNA `/one-time`. | None; explicit operator correction. | Codex | Treat BNA `/one-time` as preview unless synced/redirected by implementation. | Install target-aware guard and report status separately. | None | Accepted |
| DEC-20260705-502 | External/provider writes remain gated. | Exact approval/credentials for DNS, Railway target mutation, database writes, sends, payments, access, or provider account changes. | Shloimie / account owners | Do repo/static-code fixes and no-write live reads; block external mutations. | Provide explicit approval phrase and credentials later if needed. | Only external/provider mutations | Open |

## Required baseline command evidence

| Command | Status | Output summary |
|---|---|---|
| `git fetch --all --prune` | Passed | No output. |
| `git status -sb` | Passed | Started on `codex/release-captain-onetime-ui-closeout-20260705`; then switched to fresh branch `codex/onetime-canonical-target-routing-20260705` from `origin/master`. |
| `git branch --show-current` | Passed | `codex/release-captain-onetime-ui-closeout-20260705` before correction branch creation. |
| `git log -1 --oneline` | Passed | `738f08ad Record One Time sidebar live closeout` before correction branch creation. |
| `gh pr status` | Passed | PR #98 merged; stale draft PRs #51, #62, #63 remain open. |
| `npm run release:captain` | Passed | Reported ready for PR/merge/deploy for the BNA branch, exposing the missing target-awareness gap. |
| `npm run bna:run:validate` | Passed | Active run valid; blocked 4, done 6, work remains yes. |
| `npm run bna:run:next` | Passed | No next unblocked executable batch in active run. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260705-501 | Done | Target map in `ops/ui-audits/2026-07-05-onetime-canonical-target-routing/REPORT.md`. | Report and release captain artifacts. | `npm run release:captain:one-time-public` PASS target gate. | None. |
| REQ-20260705-502 | Done | Report identifies `public/one-time/index.html`, `server.js`, BNA preview, and One Time Railway split. | `server.js`, report. | Local One Time runtime and live readback confirmed the split/fix. | None. |
| REQ-20260705-503 | Done | `https://join.onetimeonetime.com/` and `/one-time/` now show `Your Child Can Love Learning Mishnayos | OneTimeOneTime`. | `server.js`, `public/one-time/index.html` reused. | `npm run one-time:target:guard` PASS; live smoke PASS. | None for public funnel. |
| REQ-20260705-504 | Done | Report classifies BNA `/one-time/` as preview/fallback, not production proof. | Report, route registry, architecture note. | Target guard separates BNA from join. | None. |
| REQ-20260705-505 | Done | Added `release:captain:one-time-public` and `one-time:target:guard`. | `scripts/release-captain.mjs`, `package.json`, tests. | Release Captain unit test PASS; target guard PASS after deploy. | None. |
| REQ-20260705-506 | Done | Shared/platform vs One Time-specific boundary recorded. | `docs/architecture/onetime-single-tenant-split.md`, report. | `npm run watchdog:protocol-drift` PASS. | None. |
| REQ-20260705-507 | Done | Sidebar label audit lists `Comms`, `Auto`, `Connectors`, `Setup`, source lines, and first safe batch. | Report; source inspected in `public/operations.html`. | Source inspection; no redesign implemented. | Future label polish packet recommended. |
| REQ-20260705-508 | Blocked for logged-in UI proof | 80 screenshots captured under `ops/ui-audits/2026-07-05-onetime-canonical-target-routing/visual-qa`, but Operations login returned 401. | Visual QA report/screenshots. | Audit script completed; no automated findings, but logged-in layouts were not accessible. | Need valid Operations credentials/session before marking dashboard/sidebar/right rail clean. |
| REQ-20260705-509 | Done | Report recommends not merging stale draft PRs #51/#62/#63 wholesale. | Report. | `gh pr status` and Release Captain open PR list reviewed. | None. |
| REQ-20260705-510 | Done | Branch commit `cbe693a18ab7` pushed, PR #99 opened, Railway deployment `e95bb2e7-a675-46b2-a58a-e38413646702` succeeded, join live smoke passed. | Code, report, release captain, smoke output. | `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` PASS; target guard PASS. | Final evidence commit/push and PR merge closeout still to perform after this register update. |
