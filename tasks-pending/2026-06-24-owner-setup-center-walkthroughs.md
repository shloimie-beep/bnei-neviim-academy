# Ramble Intake - 2026-06-24 - Owner Setup Center And Integration Walkthroughs

## Raw Intake

Raw storage:
`raw-input/RAW-20260624-006-owner-setup-center-walkthroughs.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-006 |
| Source | Codex chat attachment |
| Parse status | implemented |
| Active goal | BNA OWNER SETUP CENTER - EXACT LINKS, STEPS, STATUS, AND VALIDATION |
| Branch | `codex/closeout-operator-walkthrough-20260624` |
| Base requested | `CONTROL.json` integration base |
| Base used | `origin/codex/integration-navigation-owner-review-20260624` at `f9625e8c15e0a63a272582e839bf42b100cd6714` |
| Base blocker | `CONTROL.json` was not present in the repo or tracked files |
| Lane guardrail | Do not edit `server.js`, existing portal HTML, central run files, ledger, changelog, or memory |

## Parsed Requirements

| ID | Requirement | Owner | Category | Priority | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|
| REQ-20260624-028 | Create a catalog-driven owner setup center that is safe with no credentials and never exposes secret values. | Codex | setup_center | P0 | none | `src/lib/integrations/setup-catalog.js`, `public/integration-setup.html`, `public/js/integration-setup.js`, and `public/css/integration-setup.css` exist; page has safe logged-out behavior, filters, copyable variable names, direct links, validation commands, print support, and no misleading green state. | Done |
| REQ-20260624-029 | Cover every requested and currently surfaced integration with precise status, reason, next action, owner, links, identifiers, secret variable names, store location, test, expected result, effects, live criteria, timestamp, and evidence. | Codex | integration_catalog | P0 | REQ-20260624-028 | Catalog covers OpenAI, Kimi, Google Drive, Google workspace add-ons, Railway/database, Stripe, Vimeo, Zoom, Resend, transcription, Telegram academy/Rabbi worker, GitHub Actions, Buffer, WhatsApp/WAPI, and Green Invoice. | Done |
| REQ-20260624-030 | Write exact owner walkthrough documentation in plain English with numbered steps. | Codex | walkthrough_docs | P0 | REQ-20260624-029 | `docs/operator-walkthroughs/INDEX.md`, one walkthrough per integration, owner first-login, Rabbi Scheller workspace, class-intake recovery, release/rollback, walkthrough index, inventory, link check, and shared patch exist. | Done |
| REQ-20260624-031 | Provide Google Drive, Stripe, Vimeo, GitHub Actions, and bot/model walkthrough details called out in the packet. | Codex | deep_walkthroughs | P0 | REQ-20260624-030 | The requested target selection, auth paths, scope, diagnostics, sandbox/live, no-real-charge, token/scope, upload/playback, workflow-scope, provider/model, no-fake-response, usage/quota, and future provider-bot details are documented. | Done |
| REQ-20260624-032 | Provide Operations/server wiring as `SHARED-PATCH.diff` without editing shared files in this lane. | Codex | shared_patch | P0 | REQ-20260624-028 | Diff includes a protected readiness endpoint and Operations navigation/link wiring while leaving `server.js` and `public/operations.html` unchanged in this branch. | Done |
| REQ-20260624-033 | Add deterministic tests for schema, status reasons/actions, links, secrets, logged-out behavior, responsive UI, keyboard accessibility, and doc links. | Codex | tests | P0 | REQ-20260624-028, REQ-20260624-030 | Focused `node --test` files pass and cover the requested setup-center expectations. | Done |
| REQ-20260624-034 | Run verification, record evidence, commit, and push the branch. | Codex | verification_push | P0 | REQ-20260624-033 | Focused tests, `git diff --cached --check`, secret audit, git status, commit, and push evidence are recorded in lane evidence. | Done |

## Decisions And Blockers

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact next action | Blocks | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260624-008 | Missing `CONTROL.json` integration base | The packet requested `CONTROL.json`, but the file is absent. | Codex | Use `origin/codex/integration-navigation-owner-review-20260624` because it is the clean integration-owner-review base and the branch exists remotely. | Pause for a new control file. | Pausing would delay isolated docs/UI work that does not mutate shared app files. | Record the missing file and proceed from the integration base. | none | Resolved |
| DEC-20260624-009 | GitHub workflow-scope permission | Prior PR work records that the current GitHub auth cannot push workflow files. | Shloimie / repo admin | Grant a token/app with `workflow` scope or let a repo admin add the workflow later. | Use local gates until workflow scope is granted. | Release can use local gates temporarily, but independent GitHub checks remain unavailable. | Follow the GitHub Actions walkthrough before adding or changing workflow files. | REQ-20260624-034 push/CI evidence only if workflow edits are needed | Open |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit |
|---|---|---|---|---|---|
| REQ-20260624-028 | Setup catalog and static setup center | Static shell with endpoint fetch fallback added. | `node --test tests/integration-setup-catalog.test.js tests/integration-setup-ui.test.js tests/operator-walkthrough-links.test.js` passed at 2026-06-24T16:09:45+03:00. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |
| REQ-20260624-029 | Catalog cards | Integration definitions and safe status vocabulary added. | Catalog test passed; 16 integration IDs verified. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |
| REQ-20260624-030 | Walkthrough docs | Docs and handoff artifacts created under `docs/operator-walkthroughs`. | Link/index sync test passed. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |
| REQ-20260624-031 | Deep walkthroughs | Google Drive, Stripe, Vimeo, GitHub Actions, bot/model details documented. | Walkthrough files inspected by link/index test; no broken local links. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |
| REQ-20260624-032 | `SHARED-PATCH.diff` | Patch provided only; shared files untouched. | `git status --short` showed no edits to `server.js` or `public/operations.html` before commit. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |
| REQ-20260624-033 | Tests | Focused Node tests added. | Focused suite passed, `git diff --cached --check` passed, `npm run secrets:audit` passed. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |
| REQ-20260624-034 | Evidence and push | Checks, commit, and push completed. | `git push -u origin codex/closeout-operator-walkthrough-20260624` succeeded at 2026-06-24T16:12:35+03:00. | `305998fd` | `origin/codex/closeout-operator-walkthrough-20260624` |

## Final Audit

| Check | Result | Evidence |
|---|---|---|
| Setup catalog and page files inspected | Done | `src/lib/integrations/setup-catalog.js`, `public/integration-setup.html`, `public/js/integration-setup.js`, `public/css/integration-setup.css` |
| Walkthrough docs inspected | Done | `docs/operator-walkthroughs/**` |
| Shared wiring isolated | Done | `docs/operator-walkthroughs/SHARED-PATCH.diff`; no shared file edits |
| Focused tests | Passed | `node --test tests/integration-setup-catalog.test.js tests/integration-setup-ui.test.js tests/operator-walkthrough-links.test.js` |
| Whitespace | Passed | `git diff --cached --check` |
| Secret audit | Passed | `npm run secrets:audit`; 4316 tracked paths checked, 0 tracked secret-risk files found |
| Commit and push | Done | `git push -u origin codex/closeout-operator-walkthrough-20260624` succeeded; first implementation commit `305998fd` is on origin |
