# UI-01 Public/Operations Shell Handoff

Cycle: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`
Workstream: `UI-01`
Status: local_verified_live_rollout_pending

## Scope

- Reconcile repo source, local screenshots, and any live/deployed screenshot
  mismatch before patching UI assumptions.
- Standardize public BNA shell/header/footer/hamburger across homepage,
  blog/FAQ/article shells, signup pages, and the new audience routes.
- Add or verify public routes `/school`, `/parents`, and
  `/service-providers`, with safe aliases only if already simple.
- Improve Operations compact top shell, helper entry consistency, desktop
  spacing, readable task/decision metadata, mobile wrapping, and modal/detail
  usability.
- Preserve all external-write gates: no email sends, billing/payment writes,
  Google writes, Buffer publishes, Zoom/Vimeo writes, member publishing, or
  account grants.

## Initial Source Notes

- The worktree was already heavily dirty before UI-01 started, including
  existing edits to public pages, Operations, tests, docs, memory, and server
  files. UI-01 changes must be scoped and must not revert unrelated work.
- `public/service-providers.html` already exists in the working tree and must be
  inspected before deciding whether to replace, adapt, or simply align it.
- The prompt mentions sidebar/workspace directory, calendar, helper, and
  service-provider/leads Operations views that may already exist in the current
  dirty tree or only in screenshots. Record any mismatch here with screenshot
  proof instead of inventing unsupported modules.

## Required Proof Targets

- `node --check server.js`
- Inline public HTML script parse for changed pages.
- Focused JS/tests for changed shell/Operations behavior.
- `npm test` when practical.
- Browser screenshots saved under `screenshots/ui-01/`.
- 375px no-horizontal-overflow smoke for public and Operations routes.

## Running Notes

- Started tracking at `2026-06-16T15:34:36+03:00`.
- MASTER-07 closeout requeued UI-01 for a focused screenshot-driven pass rather
  than closing it without desktop/mobile proof. Proof folder:
  `ops/proofs/2026-06-16-ramble-router-parallel-closeout/UI-01/`.

## Implementation Notes

- Reconciled the prompt against the current dirty repo: Operations is already
  the newer Express/static `public/operations.html` shell with sidebar,
  workspace directory, Calendar, Service Providers, helper drawer, and
  first-party Operations modules. The older prompt audit was stale for these
  areas; no alternate live source was found locally.
- Preserved separate public, parent, and Operations PWA identities:
  `/manifest.json`, `/parent-manifest.json`, and
  `/operations-manifest.json` were inspected and left with distinct
  `start_url` values.
- Standardized public pages on `public/js/bna-site-nav.js` and
  `public/css/bna-site-nav.css`, with `BNAPages` delegating to the shared nav
  and footer when the shared mounts are present.
- Added public audience routes/pages for `/school`, `/parents`, and
  `/service-providers`; `/families` and `/parent-app` route to the parent page.
  Parent app screenshots are intentionally placeholder/copy-only until safe
  product screenshots are supplied.
- Operations now uses useful topbar chips for `Need decision`, `Agent working`,
  `Student accountability`, and `Alerts`; the redundant context strip and dead
  `Search current workspace` input were removed.
- Operations helper entry points were consolidated for the private dashboard:
  topbar/mobile header use the scoped helper drawer, and the public
  `bna-bot-widget.js` launcher is no longer mounted in Operations.
- Platform Operations navigation now exposes the real Calendar module instead
  of redirecting super-admin `/operations?view=calendar` back to Dashboard.

## Proof Completed

- `node --check server.js`: passed.
- `node --check public/js/bna-site-nav.js`: passed.
- `node --check public/js/bna-pages.js`: passed.
- Inline executable public HTML script parse, excluding JSON-LD scripts:
  passed for homepage, Operations, signup, Hebrew signup, blog, FAQ, blog post,
  school, parents, service providers, provider join/profile, signup thank you,
  and registration document.
- Focused shell/Operations regression bundle: 34/34 passed.
- Full `npm test`: 646/646 passed.
- Local browser smoke: passed against `http://localhost:8109` using a local
  authenticated Operations session.
- 375px no-horizontal-overflow smoke: passed for `/`,
  `/operations?view=tasks`, `/operations?view=students`,
  `/operations?view=content`, `/operations?view=accounting`, `/signup.html`,
  `/signup-he.html`, `/parents`, and `/service-providers`.

## Screenshot Artifacts

- `screenshots/ui-01/README.md`
- `screenshots/ui-01/ui-01-browser-proof.json`
- `screenshots/ui-01/operations-overview-desktop.png`
- `screenshots/ui-01/operations-service-providers-or-mismatch-desktop.png`
- `screenshots/ui-01/operations-calendar-or-mismatch-desktop.png`
- `screenshots/ui-01/operations-tasks-decisions-mobile.png`
- `screenshots/ui-01/operations-sidebar-or-workspace-directory-mobile.png`
- `screenshots/ui-01/public-home-desktop.png`
- `screenshots/ui-01/public-school-desktop.png`
- `screenshots/ui-01/public-parents-desktop.png`
- `screenshots/ui-01/public-service-providers-desktop.png`
- `screenshots/ui-01/public-home-mobile.png`
- `screenshots/ui-01/public-parents-mobile.png`
- `screenshots/ui-01/public-service-providers-mobile.png`
- `screenshots/ui-01/signup-mobile.png`

## Remaining Follow-up / Blocker

- The accumulated bundle was later deployed to Railway production as
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; Railway doctor, live app smoke,
  Operations login/session coverage, and public route privacy smoke passed.
- Run a narrow live mobile Operations/browser screenshot pass only if
  UI-specific visual proof is needed beyond the local screenshots already
  captured here.
- No external sends, billing/payment writes, Google writes, Buffer/social
  publishes, Zoom/Vimeo writes, member publishing, provider account grants, or
  parent/student account grants were performed.
