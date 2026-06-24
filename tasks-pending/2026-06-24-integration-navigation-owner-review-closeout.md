# Integration Navigation Owner Review Closeout - 2026-06-24

Raw source: `raw-input/RAW-20260624-001-integration-navigation-owner-review-closeout.md`

Branch: `codex/integration-navigation-owner-review-20260624`

Draft PR: #14

Guardrails:

- No external credentials.
- No production state readback.
- No production database mutation or backfill.
- No deploy or live production smoke.
- No email/Telegram send, publish, upload, charge, DNS, OAuth, or secret request.

## Requirement Register

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| REQ-20260624-001 | Integrate PR #12, PR #13, and owner-review work into one release-candidate branch/PR. | Done | PR #14 branch contains `428ee78682a201b233b2f3da71bf0205b48812ad` and `6560b8f02580e5f182a95df84ad8d5383403d887` as ancestors. |
| REQ-20260624-002 | Inventory public HTML, server UI/API routes, aliases, redirects, links, form actions, manifests, service worker routes, and assistant/API deep links. | Done | `docs/owner-review/ROUTE-INVENTORY.csv`, `docs/owner-review/ROUTE-INVENTORY.json`, `docs/owner-review/CANONICAL-SITEMAP.md`, `docs/owner-review/NAVIGATION-GRAPH.md`. |
| REQ-20260624-003 | Produce canonical route matrix and zero unexplained customer-facing orphan pages. | Done | `npm run owner-review:routes` reports 689 routes, 34 HTML pages, 0 orphan-review rows; `docs/owner-review/ORPHAN-AND-DUPLICATE-PAGES.md`. |
| REQ-20260624-004 | Repair broken navigation, public IA, missing return paths, duplicate canonical destinations, and route registry gaps. | Done | Public nav now exposes `/providers` and `/one-time`; `/providers` and `/he/providers` are registered in `ops/route-registry.json`; `npm run watchdog:links` reports severity `ok`, findings 0. |
| REQ-20260624-005 | Canonicalize One Time journey across public/member/library/classroom routes. | Done | One Time canonical journey tests and local smoke pass; role-flow QA covers `/rabbi-member`, `/member-library`, and `/one-time-classroom`. |
| REQ-20260624-006 | Make shared website assistant visible and correctly scoped on intended public, parent, student, provider, One Time member, and Operations surfaces. | Done | `docs/owner-review/ROLE-FLOW-QA.md`; shared assistant surfaces passed for `public`, `parent_portal`, `student_portal`, `provider_workspace`, `one_time_member`, and Operations helper. |
| REQ-20260624-007 | Add permanent release tests/gates for route discovery, link/watchdog health, assistant/portal coverage, and role-flow evidence. | Done, CI workflow blocked | `npm run owner-review:routes`, `npm run owner-review:role-flows`, `npm run watchdog:links`, `npm run watchdog:actions`, `npm run watchdog:security`, and `tests/owner-review-role-flow-contract.test.js`. GitHub rejected the attempted workflow commit because the OAuth app lacks `workflow` scope. |
| REQ-20260624-008 | Run credential-free role browser QA on desktop and mobile with synthetic fixtures and mock integrations. | Done | `npm run owner-review:role-flows` passed; screenshots and JSON/Markdown evidence under `ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/`; summary in `docs/owner-review/ROLE-FLOW-QA.md`. |
| REQ-20260624-009 | Reconcile June 11 UX click-map backlog against the integrated branch. | Partial | `docs/owner-review/UX-BACKLOG-RECONCILIATION.md` classifies priority areas covered by the role-flow pass. Full 2,205-route bulk rerun remains deferred because the full-ui audit defaults to live URLs/private auth and is not credential-free as configured. |
| REQ-20260624-010 | Produce owner-review packet with applied matrix, sitemap, flows, orphan report, screenshots, gaps, and review script. | Done | `docs/owner-review/APPLIED-NOT-APPLIED-MATRIX.md`, `CANONICAL-SITEMAP.md`, `PAGE-FLOW-DIAGRAMS.md`, `ORPHAN-AND-DUPLICATE-PAGES.md`, `ROLE-FLOW-QA.md`, `UX-BACKLOG-RECONCILIATION.md`, `KNOWN-GAPS.md`, `OWNER-REVIEW-SCRIPT.md`. |

## Verification

- `npm run owner-review:role-flows`: PASS.
- `npm run owner-review:routes`: PASS, 689 routes, 34 HTML pages, 0 orphan-review rows.
- `npm run watchdog:links`: PASS, severity `ok`, findings 0.
- `npm run watchdog:actions`: PASS, severity `ok`, findings 0.
- `npm run watchdog:security`: PASS, severity `ok`, findings 0.
- Focused owner-review/portal/assistant tests: PASS, 70/70.
- `npm test`: PASS, 1213/1213.
- `npm run secrets:audit`: PASS, 4219 tracked paths, 0 tracked secret-risk files.
- GitHub Actions workflow: attempted, but blocked by GitHub because the current
  OAuth app lacks `workflow` scope.

## Remaining External / Deferred Work

- Merge PR #14 before deploy/live production verification.
- Read-only production state, Railway deployment trace, Drive auth, guarded backfills, production DB apply/readback, live deploy, and live integration credentials remain unapproved by design.
- Full legacy click-map rerun needs either safe local auth mode added to `scripts/full-ui-audit.mjs` or explicit safe demo credentials/access links; the priority findings are reconciled in the owner-review packet.
- Independent GitHub Actions CI requires a token/app with `workflow` scope; the
  attempted workflow commit was rejected before it could be pushed.
