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
| REQ-20260705-501 | Create a target-aware audit report and target map for BNA production, BNA-hosted One Time preview, and One Time canonical production. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | target_audit | P0 | B0 | Report exists at the required path with target map, live routes, Railway/project/readback data where available, smoke commands, and authorization state. | Pending |
| REQ-20260705-502 | Identify the exact source split between the updated BNA-hosted "Your Child Can Love Learning Mishnayos" page and the stale join "Learn Mishnayos Live with Rabbi Eli Scheller" page. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | source_audit | P0 | B1 | Report names files/routes/templates/services and answers whether the split is static/generated, branch/service/root-directory, intentional preview, or stale production. | Pending |
| REQ-20260705-503 | Fix the canonical One Time public production target so `https://join.onetimeonetime.com/one-time/` shows the intended updated funnel. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | implementation | P0 | B2 | Join `/one-time/` live page shows the black/white/yellow funnel with "Your Child Can Love Learning Mishnayos", 30 days free CTA, sections, and mobile/tablet/desktop layout. | Pending |
| REQ-20260705-504 | Decide and document how `bneineviimacademy.org/one-time` relates to canonical One Time production. | RAW-20260705-009 | bna_platform / public_preview | Codex | target_decision | P0 | B2 | BNA route is synced, redirected, or explicitly documented as preview/internal/provider demo. | Pending |
| REQ-20260705-505 | Install a target-aware release guard so One Time public work cannot close from BNA production proof alone. | RAW-20260705-009 | bna_platform / release_closeout | Codex | release_guard | P0 | B3 | `npm run release:captain -- --target one-time-public` or equivalent command knows canonical join domain, expected service/project, expected headline/brand, and separates target states. | Pending |
| REQ-20260705-506 | Record shared-platform versus One Time provider-specific architecture boundaries. | RAW-20260705-009 | bna_platform / provider_architecture | Codex | architecture | P1 | B3 | Report distinguishes reusable shell/cards/tables/forms/QA/release guardrails from One Time branding/copy/data. | Pending |
| REQ-20260705-507 | Audit One Time Operations sidebar/navigation labels and recommend first safe batch. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | nav_audit | P1 | B4 | Report lists current label, proposed label, shared/provider-specific classification, file/component, and acceptance criteria. | Pending |
| REQ-20260705-508 | Create screenshot-backed visual QA findings for One Time Operations views. | RAW-20260705-009 | rabbi_sheller_provider / one_time_mishnah_class | Codex | visual_qa | P1 | B4 | Report includes screenshots for overview, members, classes, live class, schedule, community, communications, automations, payments, tasks, reporting, connectors, and setup with severity and acceptance criteria. | Pending |
| REQ-20260705-509 | Recommend stale PR cleanup for PR #51, #62, and #63 without merging them. | RAW-20260705-009 | bna_platform / github_hygiene | Codex | pr_audit | P1 | B5 | Report recommends keep/close/extract/ignore and notes whether useful work is already merged through later PRs. | Pending |
| REQ-20260705-510 | Verify, commit, push, PR, deploy or document exact blocker, and live-smoke One Time production directly. | RAW-20260705-009 | bna_platform / release_closeout | Codex | publish_deploy | P0 | B6 | Required commands and post-change tests pass; join `/one-time/` is directly live-smoked or a precise deploy/access blocker remains. | Pending |

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
| REQ-20260705-501 | Pending | TBD | TBD | TBD | Target map pending |
| REQ-20260705-502 | Pending | TBD | TBD | TBD | Source split pending |
| REQ-20260705-503 | Pending | TBD | TBD | TBD | Join canonical fix pending |
| REQ-20260705-504 | Pending | TBD | TBD | TBD | BNA preview decision pending |
| REQ-20260705-505 | Pending | TBD | TBD | TBD | Target guard pending |
| REQ-20260705-506 | Pending | TBD | TBD | TBD | Architecture note pending |
| REQ-20260705-507 | Pending | TBD | TBD | TBD | Sidebar audit pending |
| REQ-20260705-508 | Pending | TBD | TBD | TBD | Screenshot-backed visual QA pending |
| REQ-20260705-509 | Pending | TBD | TBD | TBD | Stale PR recommendations pending |
| REQ-20260705-510 | Pending | TBD | TBD | TBD | Join live smoke/deploy pending |
