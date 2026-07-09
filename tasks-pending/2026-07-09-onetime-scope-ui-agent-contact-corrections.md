# Ramble Intake - 2026-07-09 - OneTime Scope UI Agent Contact Corrections

## Raw intake

See `raw-input/RAW-20260709-001-onetime-scope-ui-agent-contact-corrections.md`.
Private contact details were provided in chat and intentionally redacted from
tracked repo files.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260709-001` |
| Source | `codex_chat` |
| Parse status | `registered` |
| Requirement register | `tasks-pending/2026-07-09-onetime-scope-ui-agent-contact-corrections.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes - continuation of active launch-ready OneTime goal |
| Active goal objective | Make the OneTime Mishnah parent invite flow, Rabbi Scheller provider login/portal, WhatsApp/WAPI CRM messaging, and agent-mode dropoff loop launch-ready with safe sends, verification, and deploy/push closeout. |
| Goal tool used | existing active goal |
| Execution directive | Register first, then work executable requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | `REQ-20260709-005`, `REQ-20260709-007`, `REQ-20260709-004`, `REQ-20260709-008` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260709-001` | Browser QA / Agent Mode blocked runs must submit and seal autonomously with evidence, not ask the operator whether to finish the run. | `RAW-20260709-001` | BNA Operations / Agent Review | Codex | agent_loop | P0 | `agent-loop-autonomy` | none | Browser QA prompt/template explicitly allows progress/evidence/result/seal writes; blocked/fail criteria tell the agent to submit/seal; tests prove blocked route/UI runs include submit/seal instructions and "do not ask operator to submit/seal". | Agent prompt generator, Agent Review prompt files/tests | yes, if server-visible prompt output changes | Done - pushed/deployed/live-smoked |
| `REQ-20260709-002` | OneTime public/helper/portal routes must not show BNA Academy branding, links, bot identity, or default Academy auth reset screens. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | workspace_scope | P0 | `scope-bleed-guard` | route/auth inspection | Live/readback and tests show OneTime routes use OneTime brand/domain/sender/helper identity and no BNA Academy login/reset/bot copy except internal super-admin backend surfaces. | Routing, auth reset, brand config, helper config, scope tests | yes | Done - pushed/deployed/live-smoked |
| `REQ-20260709-003` | Parent/provider password reset should be usable for the operator's real flow and should not expire before normal completion; no classroom fallback/recovery code UX. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | auth | P0 | `auth-reset` | auth/token policy inspection | OneTime reset links have a reasonable TTL or one-time reissue flow; expired reset screen is branded OneTime and offers forgot-password resend; no separate classroom/recovery code is shown by default. | Auth reset scripts/routes/templates/tests | yes | Done for OneTime parent reset - pushed/deployed/live-smoked |
| `REQ-20260709-004` | WAPI/WhatsApp CRM status and failures must be visible as concise Telegram progress dings and tracked blockers. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex/Shloimie | communications | P0 | `wapi-readiness` | WAPI env/credentials and chat targets | Readiness command reports WAPI configured/missing pieces without secrets; Telegram progress ding summarizes WAPI blocker; no live WhatsApp send unless exact copy/recipient/sender are approved and configured. | WAPI readiness scripts, Telegram progress script, tasks/changelog | maybe | Registered |
| `REQ-20260709-005` | Rabbi provider portal must use the same high-level shell layout pattern as the super-admin app, scoped and branded for OneTime. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | product_quality_ui | P0 | `visual-audit-first` | PQC packet and current-state visual audit | Current-state desktop/mobile screenshots exist for Rabbi view-as, actual Rabbi login, CRM, content, and student view; PQC packet passes; fixes remove super-admin chrome/diagnostics from actual Rabbi login and align side nav/top filters/subcategories to the platform shell. | Provider portal shell/components/routes/tests | yes | In progress - provider initial shell scope bleed deployed; full IA/layout audit still open |
| `REQ-20260709-006` | OneTime CRM must connect people, conversations, notes, email/reply actions, and cards into a coherent scoped CRM experience. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | product_quality_crm | P1 | `crm-ia` | `REQ-20260709-005` current-state audit | CRM person rows/cards open to a clean person detail with notes and conversation context; email/reply actions are scoped and safe; no super-admin diagnostics in Rabbi view. | CRM components/API/tests | yes | Registered |
| `REQ-20260709-007` | Student view desktop/mobile layout must be visually audited and repaired for centering, spacing, card alignment, padding, and responsive controls. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | product_quality_ui | P0 | `visual-audit-first` | PQC packet and screenshots | Playwright screenshots prove desktop and mobile student views are centered, evenly spaced, no overflow, no overlapping controls, and professional card alignment. | Student portal/classroom components/tests | yes | In progress - OneTime student login repaired and deployed; full student portal audit still open |
| `REQ-20260709-008` | Three existing Zoom-class attendees must be entered/tagged in the first-party system as already attending the Zoom class, not as local boys; payment/geography unknown. | `RAW-20260709-001` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex/Shloimie | contacts | P1 | `contacts-intake` | safe first-party CRM mutation path and privacy guard | Contacts exist in OneTime CRM/contact system with tag `zoom_class_attendee` or equivalent; not tagged local; payment status unknown; no raw private contact details committed; no sends to them until operator-owned test send succeeds and explicit send approval exists. | Contact import/CRM scripts/API/tests/evidence | no, if data-only via approved first-party DB; yes if app code changes | Registered |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260709-001` | agent_run_submit_seal_blocked | Harden Browser QA prompts and tests so blocked runs submit/seal autonomously with evidence. | Codex | BNA Operations / Agent Review | `RAW-20260709-001` | `REQ-20260709-001` | Monitor future Browser QA verifier runs for autonomous blocked/fail submit+seal behavior. | internal | Done |
| `TASK-20260709-002` | onetime_scope_bleed_audit | Audit OneTime routes/auth/helper for BNA Academy branding or login/reset bleed. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260709-001` | `REQ-20260709-002` | Continue remaining reset-link TTL work under `REQ-20260709-003` and broader UI IA work under `REQ-20260709-005`/`REQ-20260709-007`. | internal | Done |
| `TASK-20260709-003` | onetime_visual_audit_pqc | Generate current-state visual audit and PQC packet for Rabbi/provider/student UI. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260709-001` | `REQ-20260709-005`, `REQ-20260709-007` | Continue with full Rabbi provider CRM/content layout and full student portal/classroom visual audit. | internal | In progress |
| `TASK-20260709-004` | zoom_class_attendee_contact_intake | Add/tag three known Zoom-class attendees through a safe OneTime first-party contact path. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260709-001` | `REQ-20260709-008` | Locate existing contact import/CRM API and determine whether local/production mutation is safe and auditable. | internal | Pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260709-001` | Contact sends to Zoom-class attendees are not approved until the operator-owned test send succeeds. | Whether the operator test flow is verified and exact copy/channel are approved for these attendees. | Shloimie/Codex | Enter/tag contacts only; do not email/WhatsApp them yet. | Ask again before any external send; or prepare draft-only send packet. | Prevents accidental real sends to children/families. | After operator-owned test succeeds, provide exact recipient set/channel/copy approval before send. | `REQ-20260709-008` send portion only | Accepted |
| `DEC-20260709-002` | Rabbi live Telegram delivery still requires the Rabbi chat ID. | `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` | Shloimie | Message the Rabbi bot from intended account/group and provide or allow readback of chat ID. | Keep Rabbi Telegram in readiness-only mode. | No live Rabbi Telegram smoke can run. | Configure `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`. | `REQ-20260709-004` Rabbi live delivery | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| `Q-20260709-001` | What is the canonical first-party production mutation path for OneTime contacts? | Needed to tag the three attendees without committing private data or using the wrong workspace. | Blocks `REQ-20260709-008` implementation only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| `MEM-20260709-001` | Agent Mode Browser QA blocked/fail runs must submit/seal blocked results inside BNA Operations and must not ask the operator whether to perform the autonomous closeout. | yes, likely `memory-topics/ui-quality-goals.md` or agent-loop docs after implementation | Recurring autonomous-loop rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260709-001` | Agent prompt generator, Agent Review prompt outputs/tests | Patched deterministic Browser QA blocked-run closeout instructions and regenerated 18 Agent Mode prompt files. | `PASS npm run agent-review:prompts`; `PASS npm test` 1674/1674; `PASS npm run secrets:audit`; `PASS npm run watchdog:protocol-drift`; `PASS git diff --check` warnings only | `7c42bcc8` | `7c42bcc8` pushed to `origin/codex/rabbi-helper-tool-scope-20260708`; redeployed with `fc65713e` | Railway deployment `ddeb24b9-7ec9-4afb-8bd8-b74da23d92cd` SUCCESS; `PASS npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`; `PASS npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` |
| `REQ-20260709-002` | OneTime brand/auth/helper routes/config/tests | Patched parent/student/login/provider server-side shells, OneTime provider helper scoping, and OneTime student login source/readability/access-code removal. | `PASS npm test` 1674/1674; `PASS` local desktop/mobile Playwright smoke in `ops/ui-audits/2026-07-09-onetime-source-shell-local/smoke-results.json`; live raw readback passed for `/parent/login`, `/student/login`, `/student`, `/provider`, and `/provider.html?review=one-time&section=crm` | `7c42bcc8`, `fc65713e` | both pushed to `origin/codex/rabbi-helper-tool-scope-20260708` | Railway deployment `ddeb24b9-7ec9-4afb-8bd8-b74da23d92cd` SUCCESS; live raw readback found no BNA Academy/default student fallback bleed |
| `REQ-20260709-003` | OneTime parent reset token route, email copy, parent setup page, and tests | Extended OneTime parent password-reset request links to the trial setup TTL, made reset email copy reflect the actual active window, kept the forgot-password resend path on the OneTime parent setup page, and removed classroom-password/recovery-code wording. Provider setup reset remains a separate provider-login flow and was not changed in this parent-flow batch. | `PASS node --test tests/one-time-parent-trial-invite.test.js tests/watchdog-action-registry.test.js`; `PASS node --check server.js`; `PASS npm test` 1674/1674; `PASS npm run secrets:audit`; `PASS npm run watchdog:protocol-drift`; `PASS git diff --check`; live parent setup readback passed `hasOneTimeTitle`, `hasForgotEndpoint`, `hasFreshLinkCopy`, `noAcademyBleed`, and `noRecoveryCode` | `b5db8cca`, `eee37dc6` | both pushed to `origin/codex/rabbi-helper-tool-scope-20260708` | Railway deployment `074b9153-e4a9-4e3b-890a-3383727ad626` SUCCESS; `PASS npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`; `PASS npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`; evidence `ops/live-smokes/2026-07-09T04-16-39-085Z-rabbi-onetime-landing-smoke.md` and `ops/live-smokes/2026-07-09T04-16-39-085Z-onetime-parent-reset-smoke.md` |
| `REQ-20260709-005` | Provider/student UI routes/components | Fixed provider initial shell OneTime source/rendered scope bleed and captured desktop/mobile smoke screenshots; full provider CRM/content shell IA remains a separate open audit. | `PASS` provider review CRM shell desktop/mobile smoke screenshots in `ops/ui-audits/2026-07-09-onetime-source-shell-local/` | `fc65713e` | pushed to `origin/codex/rabbi-helper-tool-scope-20260708` | Railway deployment `ddeb24b9-7ec9-4afb-8bd8-b74da23d92cd` SUCCESS; full IA/layout polish remains open |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260709-001` | Done | Updated `BROWSER_QA_TEMPLATE` and generated Agent Review prompt files require blocked/failed verifier runs to submit result, seal run, and not ask the operator whether to close out. | `src/lib/bna/agent-control.js`, `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/*.md`, tests/docs/memory | `PASS npm run agent-review:prompts`; `PASS npm test` 1674/1674; `PASS secrets:audit`; `PASS watchdog:protocol-drift`; deployed via `ddeb24b9-7ec9-4afb-8bd8-b74da23d92cd`; live OneTime smokes passed | Future Agent Mode runs still need monitoring for behavioral proof, but the prompt/system defect is fixed and deployed |
| `REQ-20260709-002` | Done | Desktop/mobile smoke passed for `/parent/login`, `/student/login`, `/student`, `/provider`, and `/provider.html?review=one-time&section=crm`; no source/rendered BNA Academy/default student fallback bleed; OneTime student/provider helpers present. Evidence: `ops/ui-audits/2026-07-09-onetime-source-shell-local/smoke-results.json`, screenshots, and live smoke report `ops/live-smokes/2026-07-09T04-06-16-052Z-rabbi-onetime-landing-smoke.md`. | `server.js`, `public/js/bna-bot-widget.js`, smoke script, tests, action coverage artifacts | `PASS npm test` 1674/1674; `PASS` local desktop/mobile Playwright smoke; `PASS` live OneTime separate-instance smoke; `PASS` live Rabbi landing smoke; `PASS` live raw readback | Broader Rabbi provider/student UI polish remains under separate open requirements |
| `REQ-20260709-003` | Done for OneTime parent reset | OneTime student login no longer shows access-code fallback; OneTime parent reset request links now use the seven-day trial setup TTL, email copy reports the actual active window, the parent setup page offers a fresh OneTime password link, and live readback confirms no Academy bleed and no recovery/classroom-password wording. Provider setup reset remains separate and unchanged in this batch. | `server.js`, `public/one-time-parent.html`, tests, action coverage artifacts, live smoke proof | `PASS node --test tests/one-time-parent-trial-invite.test.js tests/watchdog-action-registry.test.js`; `PASS npm test` 1674/1674; `PASS secrets:audit`; `PASS watchdog:protocol-drift`; Railway deployment `074b9153-e4a9-4e3b-890a-3383727ad626` SUCCESS; `PASS` OneTime separate-instance smoke; `PASS` Rabbi landing smoke; `PASS` parent setup live readback | Full Rabbi provider CRM/layout polish, full logged-in student portal/classroom audit, WAPI readiness, and contact tagging remain open |
| `REQ-20260709-005` | In progress | Provider review CRM initial shell no longer shows BNA Academy in local or live single-tenant/read-only review smoke, and the helper resolves as `Rabbi Scheller Admin Helper`. | `server.js`, `public/js/bna-bot-widget.js`, screenshots `provider-*.png` | `PASS` desktop/mobile Playwright smoke; `PASS` live raw readback | Full Rabbi provider IA/layout/CRM polish still open |
| `REQ-20260709-007` | In progress | OneTime student login desktop/mobile is readable, scoped, no BNA helper label, no HE toggle, no access-code fallback. | `server.js`, `public/js/bna-bot-widget.js`, screenshots `student-*.png` | `PASS` desktop/mobile Playwright smoke; `PASS` live raw readback | Full logged-in student portal/classroom layout audit still open |
