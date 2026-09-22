# Ramble Intake - 2026-06-24 - Public UI Visual Polish And Marketing Navigation

## Raw intake

Operator requested `/goal gooo` with a Codex goal packet titled `CODEX GOAL - Public UI Visual Polish and Connected Marketing Navigation`.

Full raw source is preserved in `raw-input/RAW-20260624-004-public-ui-visual-polish-marketing-navigation-source.txt`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-004 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-24-public-ui-visual-polish-marketing-navigation.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | gooo |
| Goal tool used | existing active goal continued |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work public UI lane requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no deployment allowed by packet; read-only production screenshots and local browser smoke required |
| Next requirement IDs to work | REQ-20260624-101 through REQ-20260624-107 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-101 | Compare integration-base public UI with live production and record exact visual deltas. | RAW-20260624-004 | BNA public website | Codex | evidence | high | 1 | clean worktree from integration base | Delta report includes route, viewport, selector, integration behavior, production behavior, expected behavior, severity, fix, and test. | scripts/smoke-public-ui-closeout.mjs; ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/lanes/public-ui/VISUAL-DELTA.md | local browser smoke plus read-only production capture; no deploy | Done |
| REQ-20260624-102 | Repair header-to-hero spacing on the public homepage at required viewports. | RAW-20260624-004 | BNA public website | Codex | frontend | high | 2 | REQ-20260624-101 | `abs(header.bottom - hero.top) <= 1` at 390x844, 768x1024, and 1440x900; sticky header does not cover hero content. | public/css/bna-site-nav.css; public/css/bna-pages.css; public/index.html; scripts/smoke-public-ui-closeout.mjs | local browser smoke; no deploy | Done |
| REQ-20260624-103 | Make public active tabs, filter chips, and active nav states readable, semantic, and keyboard-visible. | RAW-20260624-004 | BNA public website | Codex | accessibility | high | 2 | REQ-20260624-101 | Active text contrast >= 4.5:1; active state has non-color marker and aria-current/aria-selected/aria-pressed as appropriate; focus is visible. | public/blog.html; public/css/bna-pages.css; public/css/bna-site-nav.css; public/js/bna-site-nav.js; scripts/smoke-public-ui-closeout.mjs | local browser smoke; no deploy | Done |
| REQ-20260624-104 | Connect public header/footer navigation into a complete marketing route map without duplicate labels or dead aliases. | RAW-20260624-004 | BNA public website | Codex | navigation | high | 3 | REQ-20260624-101 | Header/footer expose School, Families, Provider Directory, One Time, Blog, FAQ, registration, and portal logins; mobile menu opens; canonical aliases return expected statuses. | public/js/bna-site-nav.js; public/css/bna-site-nav.css; public/one-time/index.html; scripts/smoke-public-ui-closeout.mjs | local browser smoke; no deploy | Done |
| REQ-20260624-105 | Remove obvious public placeholders, stale year text, weak focus styling, and visual polish defects in lane-owned public pages. | RAW-20260624-004 | BNA public website | Codex | content/frontend | medium | 3 | REQ-20260624-101 | Public smoke finds no visible placeholder markers/generic load errors; footer year is current/dynamic; spacing and buttons remain coherent across required viewports. | public/parents.html; public/service-providers.html; public/index.html; public/signup.html; public/signup-he.html; public/js/bna-pages.js; public/css/bna-site-nav.css | local browser smoke; no deploy | Done |
| REQ-20260624-106 | Verify public accessibility basics across required routes and viewports. | RAW-20260624-004 | BNA public website | Codex | accessibility/evidence | high | 4 | REQ-20260624-102, REQ-20260624-103, REQ-20260624-104, REQ-20260624-105 | Browser smoke checks heading order, landmarks, skip link, focus visibility, touch targets, active semantics, and no horizontal overflow. | scripts/smoke-public-ui-closeout.mjs; ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/lanes/public-ui/PUBLIC-UI-SMOKE.md | local browser smoke; no deploy | Done |
| REQ-20260624-107 | Write lane closeout evidence, commit, and push the public UI branch. | RAW-20260624-004 | BNA public website | Codex | closeout | high | 5 | REQ-20260624-101 through REQ-20260624-106 | HANDOFF.md, RESULT.json, TESTS.md, FILES.txt, BLOCKERS.md, SCREENSHOTS.md, and SHARED-PATCH.diff exist; changed files pass relevant checks; branch is pushed. | ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/lanes/public-ui/* | push required; no deploy | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-101 | public-ui-closeout-lane | Complete public UI visual polish and connected marketing navigation lane. | Codex | BNA public website | RAW-20260624-004 | REQ-20260624-101..107 | Run lane smoke, repair failures, write evidence, commit, push. | Agent Activity | Running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| none | none | none | none | none | none | none | none | none |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| none | none | none | no | Archived |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| none | none | no | Lane packet is implementation-specific, not a durable new operating rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-101 | `/`, `/service-providers`, `/one-time`, `/blog`, `/faq`, `/signup.html`, required aliases | Capture local and production screenshots; write computed delta report. | PASS: `VISUAL-DELTA.md` and 60 screenshots generated. | Pending | Pending | No deploy; read-only production screenshots only |
| REQ-20260624-102 | public home header/hero | Verify and preserve zero-gap header/hero layout. | PASS: `/` header/hero gap 0px at all required viewports. | Pending | Pending | No deploy |
| REQ-20260624-103 | public filters/nav active states | Add semantic states and computed contrast/focus assertions. | PASS: active contrast/semantics assertions pass in lane smoke. | Pending | Pending | No deploy |
| REQ-20260624-104 | shared public nav/footer, One Time footer | Connect route map and alias checks. | PASS: route map, duplicate label, mobile menu, and aliases pass. | Pending | Pending | No deploy |
| REQ-20260624-105 | public placeholders/stale copy | Replace visible placeholders/stale year text and assert no placeholder markers. | PASS: public smoke finds no placeholder/generic errors on lane-owned public routes. | Pending | Pending | No deploy |
| REQ-20260624-106 | public a11y basics | Run browser evidence across required route set/viewports. | PASS: `PUBLIC-UI-SMOKE.md`; portal entry pages inspected as evidence-only. | Pending | Pending | No deploy |
| REQ-20260624-107 | lane evidence/branch | Write handoff bundle, commit, push. | Handoff files written; checks pass; branch push handled in final closeout. | Commit created | Push handled in final closeout | No deploy |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-101 | Done | `VISUAL-DELTA.md`; `PUBLIC-UI-SMOKE.md`; 18 read-only production screenshots. | `scripts/smoke-public-ui-closeout.mjs`; lane evidence files. | `node scripts/smoke-public-ui-closeout.mjs` PASS. | Production still needs deploy after release approval. |
| REQ-20260624-102 | Done | `PUBLIC-UI-SMOKE.md` shows `/` gap 0px at 390x844, 768x1024, 1440x900. | `public/css/bna-site-nav.css`; `public/index.html`; smoke script. | Lane smoke PASS. | None. |
| REQ-20260624-103 | Done | Lane smoke active contrast/semantics pass; blog filters include `aria-pressed`. | `public/blog.html`; `public/css/bna-pages.css`; `public/css/bna-site-nav.css`; `public/js/bna-site-nav.js`. | Lane smoke PASS; focused Node tests PASS. | None. |
| REQ-20260624-104 | Done | Footer route map, One Time route map, duplicate labels, aliases, and mobile menu pass. | `public/js/bna-site-nav.js`; `public/css/bna-site-nav.css`; `public/one-time/index.html`. | Lane smoke PASS; `npm run watchdog:links` ok true. | Non-lane link audit findings in `public/provider.html` remain. |
| REQ-20260624-105 | Done | Parent preview replaces visible placeholder; stale footer years fixed/dynamic; no placeholder hits in lane smoke. | `public/parents.html`; `public/service-providers.html`; `public/index.html`; `public/signup.html`; `public/signup-he.html`; `public/js/bna-pages.js`. | Lane smoke PASS; focused Node tests PASS. | None. |
| REQ-20260624-106 | Done | `PUBLIC-UI-SMOKE.md` checks headings, landmarks, skip link, focus, touch targets, overflow, and active states. | `scripts/smoke-public-ui-closeout.mjs`; shared public pages. | Lane smoke PASS; `watchdog:actions` PASS; `watchdog:security` PASS. | Portal entry pages were inspected but not edited by lane rule. |
| REQ-20260624-107 | Done | `HANDOFF.md`, `RESULT.json`, `TESTS.md`, `FILES.txt`, `BLOCKERS.md`, `SCREENSHOTS.md`, `SHARED-PATCH.diff`, commit, and push closeout. | Lane evidence directory; raw/register files. | `git diff --check` PASS; `secrets:audit` PASS; branch push handled in final closeout. | None. |
