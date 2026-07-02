# Ramble Intake - 2026-06-24 - Public UI Visual Polish and Marketing Navigation

## Raw intake

Goal-mode packet from Codex chat attachment asks Codex to complete the public UI visual polish and connected marketing navigation lane from the clean-slate integration base, then commit and push `codex/closeout-public-ui-20260624`.

Raw source is preserved in `raw-input/RAW-20260624-004-public-ui-visual-polish-marketing-navigation.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-004 |
| Source | codex_chat attachment |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-24-public-ui-visual-polish-marketing-navigation.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Existing active goal continued for `BNA PUBLIC UI - COMPLETE VISUAL POLISH AND MARKETING NAVIGATION` |
| Goal tool used | yes - active goal detected |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no - this lane explicitly says do not deploy; push/evidence are required |
| Next requirement IDs to work | REQ-20260624-101 through REQ-20260624-107 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-101 | Compare integration-base public UI against production and record visual deltas. | RAW-20260624-004 | BNA/public website | Codex | baseline-audit | P0 | public-ui-A | control base/worktree ready | Required routes and three viewports have screenshot or explicit unavailable evidence; delta table records route, viewport, selector, base behavior, production behavior, expected behavior, severity, fix, and test. | lane evidence scripts/reports | No | Registered |
| REQ-20260624-102 | Repair header-to-hero spacing on the public home page. | RAW-20260624-004 | BNA/public website | Codex | visual-fix | P0 | public-ui-B | REQ-20260624-101 | Header bottom and hero top differ by <= 1px at 390x844, 768x1024, and 1440x900; sticky header does not cover hero content; no font/image-load jump or mobile-only gap. | public/index.html, public marketing CSS, visual tests | No | Registered |
| REQ-20260624-103 | Make public active tabs, filters, chips, and nav active states readable and accessible. | RAW-20260624-004 | BNA/public website | Codex | accessibility-visual | P0 | public-ui-B | REQ-20260624-101 | Active/selected text contrast is >= 4.5:1; state is not color-only; correct `aria-current`, `aria-selected`, or `aria-pressed`; focus/hover/active/disabled are distinct; horizontal overflow is intentional and usable. | public pages/CSS/nav JS, computed-style tests | No | Registered |
| REQ-20260624-104 | Connect public marketing navigation across header, footer, mobile menu, and linked public routes. | RAW-20260624-004 | BNA/public website | Codex | navigation | P0 | public-ui-C | REQ-20260624-101 | Header/footer/mobile menu expose School, Families, Provider Directory, One Time, Blog, FAQ, register/apply, and portal login destinations; no dead links or duplicate labels with conflicting destinations; Operations is not promoted as a public consumer destination. | public/js/bna-site-nav.js, public marketing pages, nav tests | No | Registered |
| REQ-20260624-105 | Clean up obvious public visual defects and stale/generic content. | RAW-20260624-004 | BNA/public website | Codex | content-visual | P1 | public-ui-C | REQ-20260624-101 | Public pages have no obvious placeholders, stale footer year, broken/missing images, fuzzy logo use, mismatched button radii, weak focus indicators, clipped menus/dialogs, mobile overflow, empty sections, or generic public-facing error copy. | public marketing pages/CSS | No | Registered |
| REQ-20260624-106 | Verify public accessibility fundamentals. | RAW-20260624-004 | BNA/public website | Codex | accessibility | P0 | public-ui-D | REQ-20260624-102, REQ-20260624-103, REQ-20260624-104, REQ-20260624-105 | Heading order, landmarks, skip link, alt text, keyboard navigation, focus order, touch targets, reduced-motion behavior, labels, focus traps, and hidden actionable elements are checked with evidence. | public pages/CSS/tests/evidence | No | Registered |
| REQ-20260624-107 | Produce automated evidence, handoff files, commit, and push the lane branch. | RAW-20260624-004 | BNA/public website | Codex | closeout | P0 | public-ui-E | REQ-20260624-102 through REQ-20260624-106 | Lane-focused tests, visual smoke, nav smoke, watchdog links/actions/security where relevant, git diff check, secret audit, evidence files, commit, and push are complete or blockers are explicit. | ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/lanes/public-ui/* | No | Registered |

## Parsed tasks

No visible human Tasks were created. This is Codex lane work under the clean-slate closeout contract.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|

## Decisions

No new human/external decision is needed at registration time. The no-deploy and central-file restrictions are lane constraints from the control contract.

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|

## Durable memory candidates

No MEMORY.md promotion in this lane. The packet is execution-specific and the control contract forbids memory edits by lane workers.

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-101 | `/`, `/service-providers`, `/one-time`, public register/apply, Blog, FAQ, portal login entries, static aliases | Inspect current files, run local browser baseline, compare production if reachable/read-only, write delta report. | screenshots and `VISUAL-DELTA.md` | Pending | Pending | Not required; no deploy |
| REQ-20260624-102 | public home header/hero | Measure and fix exact spacing source. | computed bounding-rect assertions at 390, 768, 1440 widths | Pending | Pending | Not required; no deploy |
| REQ-20260624-103 | public tabs/chips/active states | Audit state selectors and ARIA, fix CSS/markup/JS as needed. | computed contrast and state assertions | Pending | Pending | Not required; no deploy |
| REQ-20260624-104 | public nav/header/footer/mobile | Audit link map, active state, canonical portal login links, footer map. | nav smoke and link watchdog | Pending | Pending | Not required; no deploy |
| REQ-20260624-105 | public visual/copy surfaces | Remove stale/generic placeholders and repair responsive polish. | screenshots/no-placeholder checks | Pending | Pending | Not required; no deploy |
| REQ-20260624-106 | public accessibility | Verify headings, landmarks, keyboard/focus/touch/reduced motion/labels. | browser smoke and assertions | Pending | Pending | Not required; no deploy |
| REQ-20260624-107 | lane evidence and Git | Write required handoff files, run required checks, commit, push. | tests, `git diff --check`, secret audit, pushed branch | Pending | Pending | Not required; no deploy |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-101 | Registered | raw-input/RAW-20260624-004-public-ui-visual-polish-marketing-navigation.md | Pending | Pending | Audit pending |
| REQ-20260624-102 | Registered | Pending | Pending | Pending | Implementation pending |
| REQ-20260624-103 | Registered | Pending | Pending | Pending | Implementation pending |
| REQ-20260624-104 | Registered | Pending | Pending | Pending | Implementation pending |
| REQ-20260624-105 | Registered | Pending | Pending | Pending | Implementation pending |
| REQ-20260624-106 | Registered | Pending | Pending | Pending | Verification pending |
| REQ-20260624-107 | Registered | Pending | Pending | Pending | Closeout pending |

## Lane constraints

- Base SHA: `161f8623c50d7ef226066d101bfa58c28aff2346`.
- Branch: `codex/closeout-public-ui-20260624`.
- Worktree: `C:\Users\User\Documents\Codex\2026-06-24\closeout-public-ui`.
- Do not edit `server.js`, private portal app pages, `MEMORY.md`, `TASKS.md`, canonical ledger/changelog, `ops/execution-runs/latest.json`, central execution-run files, or control files.
- If a shared/server edit is needed, record it in lane `SHARED-PATCH.diff` instead of applying it.
- Do not deploy.
