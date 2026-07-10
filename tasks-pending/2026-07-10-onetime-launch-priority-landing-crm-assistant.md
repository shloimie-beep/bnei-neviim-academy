# One Time Launch Priority - Landing, Robot Scheller, CRM, Follow-Up

## Raw Intake

Source raw record: `raw-input/RAW-20260710-002-onetime-launch-priority-landing-crm-assistant.md`

Related dropoff packet:
`ops/chatgpt-ramble-dropoff/incoming/onetime-launch-priority-ui-crm-automation-20260710-001/`

Active Codex goal:

> Execute the 2026-07-10 One Time launch-priority handoff through raw intake,
> requirement registration, first safe implementation waves, verification, and
> terminal statuses or precise blockers for landing, Robot Scheller, CRM/contact
> timeline, mailbox reconciliation, transactional follow-up, and Rabbi backend
> launch-readiness.

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Goal tool used | yes |
| Workspace/project | `rabbi_sheller_provider` / `one_time_mishnah_class` |
| Priority | P0 launch-critical |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260710-013 | Preserve and atomize the launch-priority handoff. | SRC-20260710-002-001 | agent_ops | Codex | intake | P0 | B0 | none | Raw intake exists, source statements are mapped, private full WhatsApp number is not committed. | `raw-input/RAW-20260710-002-onetime-launch-priority-landing-crm-assistant.md`; this register | no | Done |
| REQ-20260710-014 | Create a focused Product Quality Compiler packet for the first launch-visible wave. | SRC-20260710-002-002..007 | one_time_mishnah_class | Codex | product_quality | P0 | B0 | REQ-20260710-013 | PQC packet validates and names routes/files/states/screenshots/out-of-scope. | `ops/prompt-packets/2026-07-10-onetime-launch-priority/01-landing-robot-scheller.product-quality.json` | no | Done |
| REQ-20260710-015 | Reconcile landing copy and asset slots. | SRC-20260710-002-002..004 | one_time_mishnah_class | Codex | public_landing | P0 | B1 | REQ-20260710-014 | Copy matrix and asset manifest exist; approved repo assets are used where clear; remaining image slots are documented and replaceable. | `ops/design-references/2026-07-10-onetime-landing-copy-and-assets/*` | yes | Local verified - deploy/live pending |
| REQ-20260710-016 | Replace public landing TODO/placeholders/internal language with polished visitor-facing copy and media. | SRC-20260710-002-002..004 | one_time_mishnah_class | Codex | public_landing | P0 | B1 | REQ-20260710-014, REQ-20260710-015 | No visible/source TODO for hero media; no public review-only/protocol/test/no-write copy; hero and program cards use approved media; mobile 390/430 and desktop 1440 are screenshot-verified. | `public/one-time/index.html`; `config/service-provider-sites/one-time.json`; `config/brands/one-time.json` | yes | Local verified - deploy/live pending |
| REQ-20260710-017 | Implement Robot Scheller identity and scoped helper copy. | SRC-20260710-002-005..007 | one_time_mishnah_class | Codex | assistant | P0 | B1 | REQ-20260710-014 | One Time public helper title is `Robot Scheller`, subtitle is `Rabbi Scheller's digital assistant`, options are concise, avatar/face treatment exists, and non-public One Time helper surfaces retain recognizable Robot Scheller identity with scoped permissions. | `public/js/bna-bot-widget.js`; `ops/action-registry.json` | yes | Local verified - deploy/live pending |
| REQ-20260710-018 | Wire the public WhatsApp affordance through runtime configuration without committing the full number. | SRC-20260710-002-007, SRC-20260710-002-012 | one_time_mishnah_class | Codex | communications_readiness | P0 | B1 | REQ-20260710-017 | A public same-origin WhatsApp redirect/readiness path exists, uses `ONE_TIME_PUBLIC_WHATSAPP_NUMBER`/aliases at runtime, reveals no full number in Git, and degrades to a precise blocker when missing. | `server.js`; `public/one-time/index.html`; `public/js/bna-bot-widget.js`; `ops/action-registry.json` | yes | Local verified - deploy/live pending |
| REQ-20260710-019 | Prove form-to-visible-CRM end-to-end. | SRC-20260710-002-008..010 | one_time_mishnah_class | Codex / ChatGPT code-prep | CRM | P0 | B2 | REQ-20260710-016 | Synthetic `TEST-` lead submit creates/upserts one scoped record, CRM search finds it, detail opens, timeline shows interaction, and cleanup/readback is recorded. | `server.js`; `public/operations.html`; focused CRM smoke/tests | yes | Open |
| REQ-20260710-020 | Build/finish searchable CRM list/detail/timeline workbench. | SRC-20260710-002-009..010 | one_time_mishnah_class | Codex / ChatGPT code-prep | CRM | P0 | B3 | REQ-20260710-019 | Contact rows support search/filter/sort and open a useful detail pane/route with overview, timeline, class/trial/access, notes, and next actions. | `public/operations.html`; `server.js`; tests | yes | Open |
| REQ-20260710-021 | Reconcile the roughly 2,600-record historical email/contact truth. | SRC-20260710-002-011 | one_time_mishnah_class | Codex / ChatGPT code-prep | mailbox_import | P0 | B4 | none | Redacted report identifies source artifact/type/counts/import status/visibility; no raw message bodies or exports are committed. | `ops/system-audits/2026-07-10-onetime-historical-inbox-reconciliation/*`; mailbox/import code as needed | no, unless code changes | Open |
| REQ-20260710-022 | Implement or precisely block immediate free-class transactional email/WhatsApp follow-up. | SRC-20260710-002-012 | one_time_mishnah_class | Codex / ChatGPT code-prep | transactional_followup | P0 | B5 | REQ-20260710-018, REQ-20260710-019 | Email/WhatsApp attempts are idempotent, readiness-gated, logged to contact timeline, and real sends remain blocked unless exact readiness/approval gates are satisfied. | `server.js`; WAPI/Resend modules; tests | yes | Open |
| REQ-20260710-023 | Remove normal-view Rabbi backend support/test/scoping/protocol noise. | SRC-20260710-002-013..015 | one_time_mishnah_class | Codex / ChatGPT code-prep | provider_backend_ui | P1 | B6 | REQ-20260710-014 | Normal Rabbi/provider views hide irrelevant diagnostics or move them to support/admin drawers; buttons work, are hidden, or show concise blocked states; layout/card/toolbars pass manual screenshots. | `public/provider.html`; `public/operations.html`; One Time CSS/tests | yes | Open |
| REQ-20260710-024 | Generate non-overlapping ChatGPT code-package lanes for unresolved launch work. | SRC-20260710-002-016 | agent_ops / one_time_mishnah_class | Codex | packet_compiler | P0 | B0-B6 | REQ-20260710-013 | Only real unresolved lanes get outgoing prompts; each prompt requires repo-visible code package with diffs/tests and no external writes. | `ops/chatgpt-ramble-dropoff/outgoing/2026-07-10-onetime-launch-priority-*` | no | Open |
| REQ-20260710-025 | Ingest/apply/test/push/deploy/live-smoke launch-priority implementation slices. | all | one_time_mishnah_class | Codex | closeout | P0 | B7 | implementation slices | App-visible work is committed, pushed, deployed to verified One Time target, live-smoked, screenshot-reviewed, and source statements are terminal or blocked. | implementation/evidence files | yes | Open |

## Decisions And Blockers

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260710-002 | One Time public WhatsApp runtime number activation | Full public business WhatsApp number must be placed in runtime/keyholder config, not Git. The source says the number ends in `8614`. | Shloimie / runtime keyholder | Set `ONE_TIME_PUBLIC_WHATSAPP_NUMBER` on the One Time service and run readiness smoke. | Keep WhatsApp CTA routed to the public form until runtime is configured. | Without runtime config, UI can show the affordance but cannot open the exact WhatsApp business chat from deployed code. | Add runtime env value, then run `/api/one-time/public-whatsapp` readback and redirect smoke. | REQ-20260710-018, REQ-20260710-022 | Needs operator/runtime action |
| DEC-20260710-003 | GitHub issue #128 direct readback | Local `gh issue view 128 --comments` failed because the token lacks `read:project`. | Shloimie / GitHub auth owner | Refresh local gh auth with the needed scope when direct issue readback is required. | Use the materialized trusted dropoff packet for this turn. | Direct current issue-comment reconciliation may be incomplete until auth is fixed. | Run `gh auth refresh -s read:project` or provide a scoped issue export. | source reconciliation depth | Blocked external |

## Current Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260710-016 | `/one-time`, `public/one-time/index.html` | Replace placeholder hero/program media, remove public internal language, keep first viewport CTA and responsive layout. | PASS `node --test tests/one-time-focused-landing.test.js`; PASS local Playwright visual audit at `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/report.md`; PASS no-secret grep. | pending | pending | pending |
| REQ-20260710-017 | `public/js/bna-bot-widget.js` | Rename One Time helper identity to Robot Scheller, use Rabbi portrait avatar, keep role-scoped action sets. | PASS `node --test tests/one-time-brand-helper-isolation.test.js`; PASS helper-open screenshot `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/mobile-390-helper-open.png`. | pending | pending | pending |
| REQ-20260710-018 | `server.js`, `/api/one-time/public-whatsapp`, `/api/one-time/public-whatsapp/redirect` | Runtime-only WhatsApp compose/readiness path; no number in Git. | PASS readiness JSON `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/api-public-whatsapp-readiness.json`; PASS `node --check server.js`; PASS `npm run watchdog:actions`. | pending | pending | pending |

## Verification Evidence - 2026-07-10 Local Wave 1

- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-10-onetime-launch-priority/01-landing-robot-scheller.product-quality.json`.
- PASS `node --test tests/one-time-brand-helper-isolation.test.js tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-shared-review-branding.test.js`.
- PASS `npm run watchdog:actions` with report `ops/watchdog-audits/2026-07-10T08-02-watchdog-action-audit.md` and 0 findings.
- PASS `npm run watchdog:protocol-drift` with report `ops/watchdog-audits/2026-07-10-product-quality-drift.md` and 0 findings.
- PASS local Playwright visual audit at `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/report.md` with desktop/mobile/helper screenshots and no external writes.
- PASS no-secret grep for the full WhatsApp number variants across the edited/evidence paths.

## Closeout Rules

- App-visible done requires pushed commit, verified One Time deploy target, live smoke, screenshots, and manual source-level review.
- Real email/WhatsApp sends, bulk campaigns, payments, access grants, DNS, credentials, and provider mutations remain approval-gated.
- Artifact completion does not close the underlying product requirement.
