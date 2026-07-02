# Rabbi Scheller Account UI Audit - 2026-06-28

## Source

Raw intake: `RAW-20260628-001`
Source path: `raw-input/RAW-20260628-001-rabbi-scheller-account-ui-audit.md`
Prior related register: `tasks-pending/2026-06-23-rabbi-scheller-workspace-parity-audit.md`

## Requirement Register

| ID | Requirement | Workspace/project | Owner | Status | Acceptance criteria | Evidence | Verification | Blocker / next action |
|---|---|---|---|---|---|---|---|---|
| REQ-20260628-001 | Audit Rabbi Scheller's front-end account experience for design, spacing, responsive layout, and button/navigation behavior, then report next setup steps. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | done | Inspect existing Rabbi parity work, run fresh browser verification for Provider Portal and Operations Rabbi workspace at mobile/tablet/desktop sizes, inspect screenshots, identify UX/setup blockers, and report what is ready vs blocked. | Provider smoke: `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/report.md`; Operations smoke: `ops/playwright-smokes/2026-06-23-rabbi-scheller-operations-navigation-local/report.md`; API Usage smoke: `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/report.md`; login chooser smoke: `ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/report.md`; action watchdog: `ops/watchdog-audits/2026-06-28T06-20-watchdog-action-audit.md` | PASS provider navigation smoke; PASS Operations navigation smoke; PASS API Usage smoke; PASS portal chooser smoke; PASS focused contracts 35/35; PASS `npm run watchdog:actions` with 0 findings; PASS JSONL/action-registry parse. | Local audit done. Real production owner login/live account proof remains blocked by missing split Rabbi owner credentials and by the existing deploy/live-smoke decision `DEC-20260623-006`. |

## Agent Task

| ID | Canonical key | Task | Owner | Visible lane | Status |
|---|---|---|---|---|---|
| TASK-20260628-001 | rabbi-scheller-account-ui-audit | Audit Rabbi Scheller account UI and setup readiness. | Codex | Agent Activity | completed |

## Audit Findings

Functional checks passed locally:

- Provider Portal: all supported sections direct-linked and clicked at 390x844, 768x1024, and 1440x900; one active nav, one visible section, no super-admin nav, no failed requests, no console/page errors, and no horizontal overflow.
- Operations Rabbi workspace: dashboard, tasks, contacts, program/schedule, communications, API Usage, settings, toolbar navigation, browser Back, and required viewports passed. Observed requests stayed scoped to `rabbi_sheller_provider` / `one_time_mishnah_class` with no `workspace=bna` or `project_key=bna` requests.
- API Usage preview: honest empty state, no fabricated request/token/cost values, and no horizontal overflow.
- Portal login chooser: provider, student, and parent password login pages render server-resolved same-origin destinations; passwords remain masked; no external destination links.
- Action coverage: focused contracts passed 35/35 and action watchdog reported 0 findings.

Visual/design findings:

- Desktop Operations is usable and reasonably structured for an internal/provider-admin surface.
- Provider Portal is functional but still reads as an admin/workspace console, not a polished Rabbi handoff page. The 18 equal-weight section buttons are honest and responsive, but too much for a first-time Rabbi unless the default view is narrowed to the few things he actually needs.
- Mobile layout is technically responsive, but the BNA Helper floating button/drawer can cover notice text and large parts of the page. This should be fixed before handing the account to Rabbi Scheller.
- The Provider Portal includes honest incomplete states such as Settings writes disabled and API usage not instrumented. Those are safe, but they should either be hidden or framed as internal beta items before a real owner handoff.

## Setup Readiness Verdict

The local front-end/navigation foundation is good enough to keep building on.
It is not ready as a live Rabbi-owner handoff until:

- split owner credentials are configured for Rabbi Scheller;
- Shloimie's workspace role is decided;
- the mobile helper overlay behavior is tightened;
- a clean deploy/live-smoke path is authorized and run;
- live account data, schedule/member/library/settings setup is seeded and verified.

## Existing Decisions / Open Questions Reused

| ID | Status | Why it matters |
|---|---|---|
| DEC-20260623-006 | Needs My Decision | Push/deploy/live-smoke for local Rabbi workspace repairs remains blocked until explicitly authorized. |
| Q-20260623-027 | Open | Rabbi Scheller's exact production owner login identity is still needed for real credential/live account testing. |
| Q-20260623-028 | Open | Shloimie's exact role in Rabbi Scheller's workspace still needs final assignment. |

## Guardrails

- No production database mutation.
- No external sends, billing, access grants, deploy, DNS, account-owner action, or secret exposure.
- Do not mark app-visible setup complete without live credential and deploy/live-smoke proof.
