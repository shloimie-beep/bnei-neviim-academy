# Rabbi / One Time UI Clean Even Loads Nicely

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | `RAW-20260702-008` |
| Source | Codex chat |
| Raw path | `raw-input/RAW-20260702-008-rabbi-onetime-ui-clean-even-loads-nicely.md` |
| Workspace/project | `rabbi_sheller_provider` / `one_time_mishnah_class` |
| Parse status | Local automated cleanup slices verified; broader brand/IA/manual polish and live proof remain open |
| Goal-mode requested | yes - broad "fix everything / just do it" UI correction |
| Active goal objective | Complete Rabbi / One Time Mishnah UI cleanup through validated product-quality batches with evidence or blockers. |

## Router Output

| Field | Value |
|---|---|
| Classification | `PRODUCT_QUALITY`, `SUPER_RAMBLE`, `UI_VISUAL_AUDIT`, `UI_IMPLEMENTATION`, `CRM_PIPELINE`, `COMMUNITY_CLASSROOM`, `SECURITY_PRIVACY` |
| Product Quality Compiler required | yes |
| Super-Ramble split required | yes |
| Current-state visual audit required before implementation | already exists: `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/` |
| Implementation forbidden until Definition of Ready passes | yes |
| First selected implementation slice | Common Operations shell headings and form-control label/audit cleanup |
| Second selected implementation slice | One Time Library support/debug wording and Class Package Manager form layout |
| Third selected implementation slice | Provider workspace filter rail and heading contrast/readability |
| Fourth selected implementation slice | Mobile helper closed-state screenshot/accessibility hygiene |
| Fifth selected implementation slice | Task dialogue lane contrast/readability |
| Sixth selected implementation slice | Tasks route layout density and audit loading wait |
| Seventh selected implementation slice | Provider review portal load-error cleanup |
| Eighth selected implementation slice | Student review mobile/desktop readability cleanup |
| Ninth selected implementation slice | Automations Center contrast/layout cleanup |
| Tenth selected implementation slice | Participants / Members readability cleanup |
| Eleventh selected implementation slice | Program Payment / Access readability cleanup |
| Twelfth selected implementation slice | Communications Provider Messages readability cleanup |
| Thirteenth selected implementation slice | Program Overview readability cleanup |
| Fourteenth selected implementation slice | Workspace Settings readability cleanup |
| Fifteenth selected implementation slice | Member Login brand and helper readability cleanup |
| Sixteenth selected implementation slice | Classroom Review brand and layout cleanup |
| Seventeenth selected implementation slice | Email Review brand and layout cleanup |
| Eighteenth selected implementation slice | Operations IA/nav/filter alignment |
| Nineteenth selected implementation slice | Operations CRM contact-detail polish |
| Twentieth selected implementation slice | Operations Library first-viewport readability |

## Source Coverage

| Source ID | Covered statement | Requirement |
|---|---|---|
| `SRC-20260702-008-001` | "Rabbi One Time Mishnah project" | `REQ-20260702-801` |
| `SRC-20260702-008-002` | "so many UI mistakes that you should be able to fix yourself" | `REQ-20260702-802`, `REQ-20260702-805`, `REQ-20260702-812`, `REQ-20260702-813`, `REQ-20260702-814`, `REQ-20260702-815`, `REQ-20260702-816`, `REQ-20260702-817`, `REQ-20260702-818`, `REQ-20260702-819`, `REQ-20260702-820`, `REQ-20260702-821`, `REQ-20260702-822`, `REQ-20260702-823` |
| `SRC-20260702-008-003` | "fix everything" | `REQ-20260702-801` through `REQ-20260702-805` plus route/shell child requirements through `REQ-20260702-823` |
| `SRC-20260702-008-004` | "even" | `REQ-20260702-802`, `REQ-20260702-803`, `REQ-20260702-812`, `REQ-20260702-813`, `REQ-20260702-814`, `REQ-20260702-815`, `REQ-20260702-816`, `REQ-20260702-817`, `REQ-20260702-818`, `REQ-20260702-819`, `REQ-20260702-820`, `REQ-20260702-821`, `REQ-20260702-822`, `REQ-20260702-823` |
| `SRC-20260702-008-005` | "loads nicely" | `REQ-20260702-802`, `REQ-20260702-803`, `REQ-20260702-812`, `REQ-20260702-813`, `REQ-20260702-814`, `REQ-20260702-815`, `REQ-20260702-816`, `REQ-20260702-817`, `REQ-20260702-818`, `REQ-20260702-819`, `REQ-20260702-820`, `REQ-20260702-821`, `REQ-20260702-822`, `REQ-20260702-823` |
| `SRC-20260702-008-006` | "clean" | `REQ-20260702-802`, `REQ-20260702-805`, `REQ-20260702-812`, `REQ-20260702-813`, `REQ-20260702-814`, `REQ-20260702-815`, `REQ-20260702-816`, `REQ-20260702-817`, `REQ-20260702-818`, `REQ-20260702-819`, `REQ-20260702-820`, `REQ-20260702-821`, `REQ-20260702-822`, `REQ-20260702-823` |
| `SRC-20260702-008-007` | "just do it" | active goal and batch execution until terminal statuses |

## Parsed Requirements

| ID | Requirement | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260702-801` | Register the broad UI correction, compile it through the Product Quality Compiler, and split implementation into focused packets. | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | protocol/intake | P1 | 0 | none | Raw intake, memory note, register, and PQC packet exist; vague phrases are expanded; no product code edits occur before validation. | raw/register/PQC files | no | Done |
| `REQ-20260702-802` | Fix the repeated Operations shell audit defects for Rabbi-scoped routes: route-level `h1`, accessible common controls, and hidden-control audit false positives. | same | Codex | UI/accessibility | P1 | 1 | `REQ-20260702-801` | A validated implementation packet exists; common shell renders one stable page `h1`; shared controls have accessible names; audit script counts visible controls only; focused tests pass. | `public/operations.html`, `scripts/audit-rabbi-onetime-current-state.mjs` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-803` | Re-run selected Rabbi / One Time UI audit screenshots after the first implementation slice and record before/after evidence. | same | Codex | verification | P1 | 1 | `REQ-20260702-802` | After screenshots/report exist for affected routes/viewports or exact local-auth/server blocker is recorded. | `ops/ui-audits/2026-07-02-rabbi-onetime-shell-labels/` | yes | Done local after-audit; live smoke blocked |
| `REQ-20260702-804` | Confirm the mock UI review data packet is already satisfied or record exact remaining blockers. | same | Codex | test-data | P2 | 1 | none | Seed/cleanup scripts and package scripts exist; dry-run can write readback without external writes. | `scripts/seed-one-time-ui-review-data.mjs`, `scripts/cleanup-one-time-ui-review-data.mjs`, `package.json` | no | Already satisfied and verified dry-run |
| `REQ-20260702-805` | Keep larger cleanup areas split: brand/design alignment, IA/nav/filter cleanup, CRM pipeline/contact detail, community/classes/questions, content library, portals, mobile polish, and verifier/deploy closeout. | same | Codex | packet-DAG | P1 | 2+ | `REQ-20260702-803` plus route-specific DoR | Each child packet consumes audit evidence, names routes/files/state matrix/action states, passes PQC validation, and is implemented separately. | `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/`, `ops/ui-audits/2026-07-02-rabbi-onetime-task-route-density/`, `ops/action-registry.json` | yes for app-visible child packets | Blocked - selected UI child packets locally verified; release deploy/live-smoke required |
| `REQ-20260702-810` | Fix the One Time provider review portal so it loads without showing the raw `driveDropoffLinks is not defined` JavaScript error. | same | Codex | UI/load-error | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; provider review renderer safely defines `driveDropoffLinks`; local browser smoke has no console/page error; full local audit screenshots show the review workspace instead of the raw error banner. | `public/provider.html`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/08-provider-review-load-error.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-provider-review-load-error/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-811` | Fix the One Time student review portal first-screen readability so the title and long review metric values do not render dark-on-dark or clipped. | same | Codex | UI/mobile-readability | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; review-only metric cards wrap/scale long values; top student title is readable on dark background; metric probe and full audit screenshots pass on mobile and desktop. | `public/student.html`, `public/css/one-time-shared-review.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/09-student-review-mobile-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-student-review-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-812` | Fix the One Time Operations Automations Center readability/layout so the heading, filter toolbar, and empty/list state do not render over a low-contrast portrait panel or overlap each other. | same | Codex | UI/automation-center-layout | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; route marker and scoped CSS remove the portrait dashboard treatment; desktop/mobile screenshots show readable heading, toolbar count/copy, filters, and empty state with no horizontal overflow. | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/10-automation-center-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-automation-center-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-813` | Fix the One Time Participants/Members route so the contacts tab rail is contained, participant roster text is readable, and the command-bot empty state is proportionate. | same | Codex | UI/participants-readability | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; route marker and scoped CSS wrap the contacts tabs, use readable dark roster panels, convert the mobile participant table into a labeled row-card, and make the command-bot empty state compact. | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/11-participants-members-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-participants-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-814` | Fix the One Time Program Payment / Access route so the Program tabs are contained, the payment/access roster is readable, and the command-bot empty state is proportionate. | same | Codex | UI/payment-access-readability | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; program route marker and scoped CSS wrap service-provider tabs, use readable dark access panels, convert the mobile access table into a labeled row-card, and keep payment/access behavior unchanged. | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/12-program-payment-access-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-payment-access-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-815` | Fix the One Time Communications Provider Messages route so the communications tabs are contained and the provider-message empty state is readable/proportionate. | same | Codex | UI/communications-readability | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; communications route marker and scoped CSS wrap communications tabs, use a readable dark provider-message panel, and keep communications/send behavior unchanged. | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/13-communications-provider-messages-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-communications-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-816` | Fix the One Time Program Overview route so the metrics, Mishnayos Membership details, and Command Bot panel render as one cohesive dark/readable route surface. | same | Codex | UI/program-overview-readability | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; existing program route marker and scoped CSS make overview metrics, membership detail cards, admin-only note, command-bot empty state, and bot log rows readable/proportionate without changing navigation, bot, payment, access, provider, or route behavior. | `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/14-program-overview-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-program-overview-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-817` | Fix the One Time Workspace Settings route so the settings toolbar, category controls, and setting rows render as a contained dark/readable route surface on desktop and mobile. | same | Codex | UI/settings-readability | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; settings route marker and scoped CSS make the settings route single-column, wrap the settings filter rail, darken the toolbar/panel/rows, keep active chips readable, and preserve settings navigation/save/test/reset behavior. | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/15-settings-workspace-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-settings-workspace-readability/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-818` | Fix the One Time member-login/member-home shell so it uses the One Time black/yellow brand, not BNA Academy branding, and the closed helper panel stays hidden/inert while the launcher remains readable. | same | Codex | UI/member-login-brand-helper | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; member shell uses One Time logo/hero/colors, no BNA Academy text or image references appear in the shell, the helper title reads One Time Helper, the closed helper panel is hidden/inert/aria-hidden, and desktop/mobile screenshots show no horizontal overflow. | `public/rabbi-member.html`, `public/js/bna-bot-widget.js`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/16-member-login-brand-helper-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-member-login-brand-helper/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-819` | Fix the One Time Classroom Review route so it uses the One Time black/yellow brand, has contained video/details/thread panels, and does not render generic pale review styling or video/text collision. | same | Codex | UI/classroom-review-brand-layout | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; classroom review page uses dark One Time panels, yellow primary actions/chips, no video/details overlap, no horizontal overflow, eager video iframe loading, explicit review-only brand config assets, and unchanged classroom access/reply/API/helper behavior. | `public/one-time-classroom.html`, `config/brands/one-time.json`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/17-classroom-review-brand-layout.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-classroom-review-brand-layout/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-820` | Fix the One Time Email Review route so it uses a compact black/yellow review-only layout with readable template cards and a clear no-send setup state. | same | Codex | UI/email-review-brand-layout | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; email review page has a compact branded header, visible blocked-send notice, dark/readable template cards, preview-only/no-send chips, no horizontal overflow, no console errors, and unchanged email template endpoint/no-send behavior. | `public/one-time-email-review.html`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/18-email-review-brand-layout.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-email-review-brand-layout/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-821` | Align the live One Time Operations sidebar and module labels to the Rabbi-facing IA, demoting raw support/platform modules while preserving direct diagnostic access. | same | Codex | UI/IA-nav-filter | P1 | 2+ | `REQ-20260702-805` plus packet DoR | Validated packet exists; Operations sidebar uses Rabbi-facing primary modules, Payments opens Program Payment / Access, Platform Support is demoted to the footer, support routes remain deep-linkable, and desktop/mobile screenshots show no overflow or raw platform-module wall. | `public/operations.html`, `tests/one-time-operations-ui-smoke.test.js`, `tests/one-time-rabbi-ui-final-local-smoke.test.js`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/19-operations-ia-nav-filter-alignment.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-ia-nav-filter-alignment/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-822` | Polish the One Time CRM Contacts route so empty and populated contact-review states are readable, mobile-safe, and clearly no-send/no-external-write. | same | Codex | UI/CRM-contact-detail | P1 | 2+ | `REQ-20260702-805`, `REQ-20260702-813`, `REQ-20260702-821` plus packet DoR | Validated packet exists; CRM Contacts has dedicated audit screenshots, structured empty/setup state, mobile-safe contact review cards, and unchanged first-party/no-send/no-external-write behavior. | `public/operations.html`, `scripts/audit-rabbi-onetime-current-state.mjs`, `tests/operations-contacts-intake-cleanup.test.js`, `tests/one-time-communications-workspace.test.js`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/20-operations-crm-contact-detail-polish.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-crm-contact-detail-polish/` | yes | Locally verified; deploy/live-smoke blocked |
| `REQ-20260702-823` | Fix the One Time Operations Library first viewport so the route heading, description, filters, and first useful content load cleanly and readably on desktop and mobile. | same | Codex | UI/content-library-first-viewport | P1 | 2+ | `REQ-20260702-805`, `REQ-20260702-821` plus packet DoR | Validated packet exists; One Time Library heading/description are readable, filters are contained, first useful content appears without a giant blank/low-contrast region, and content/publishing/external-write behavior is unchanged. | `public/operations.html`, `public/css/one-time-operations.css`, `scripts/audit-rabbi-onetime-current-state.mjs`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-library-first-viewport-readability/` | yes | Locally verified; deploy/live-smoke blocked |

## Product Quality Compiler Packet

First implementation packet:

- Markdown:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/02-operations-shell-heading-labels.md`
- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/02-operations-shell-heading-labels.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/02-operations-shell-heading-labels.product-quality.json`

Second implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/03-one-time-library-support-language.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/03-one-time-library-support-language.product-quality.json`

Third implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/04-provider-workspace-contrast-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/04-provider-workspace-contrast-readability.product-quality.json`

Fourth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/05-mobile-helper-closed-state.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/05-mobile-helper-closed-state.product-quality.json`

Fifth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/06-task-dialogue-lane-contrast.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/06-task-dialogue-lane-contrast.product-quality.json`

Sixth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/07-task-route-layout-density.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/07-task-route-layout-density.product-quality.json`

Seventh implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/08-provider-review-load-error.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/08-provider-review-load-error.product-quality.json`

Eighth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/09-student-review-mobile-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/09-student-review-mobile-readability.product-quality.json`

Ninth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/10-automation-center-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/10-automation-center-readability.product-quality.json`

Tenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/11-participants-members-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/11-participants-members-readability.product-quality.json`

Eleventh implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/12-program-payment-access-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/12-program-payment-access-readability.product-quality.json`

Twelfth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/13-communications-provider-messages-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/13-communications-provider-messages-readability.product-quality.json`

Thirteenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/14-program-overview-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/14-program-overview-readability.product-quality.json`

Fourteenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/15-settings-workspace-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/15-settings-workspace-readability.product-quality.json`

Fifteenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/16-member-login-brand-helper-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/16-member-login-brand-helper-readability.product-quality.json`

Sixteenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/17-classroom-review-brand-layout.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/17-classroom-review-brand-layout.product-quality.json`

Seventeenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/18-email-review-brand-layout.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/18-email-review-brand-layout.product-quality.json`

Eighteenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/19-operations-ia-nav-filter-alignment.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/19-operations-ia-nav-filter-alignment.product-quality.json`

Nineteenth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/20-operations-crm-contact-detail-polish.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/20-operations-crm-contact-detail-polish.product-quality.json`

Twentieth implementation packet:

- Machine-readable packet:
  `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json`
- Validation command:
  `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json`

## Decisions / Blockers

| ID | Decision | Missing information | Owner | Recommended option | Blocks requirements | Status |
|---|---|---|---|---|---|---|
| `DEC-20260702-801` | Deployment/live-smoke release path for app-visible UI closeout | Read-only live deploy-state check proves `https://bneineviimacademy.org` does not yet have the Library first-viewport contract; `https://join.onetimeonetime.com` did not accept the current Operations login for this probe; local cleanup changes are still uncommitted in a dirty worktree/branch and need a clean release branch/PR/deploy path before terminal Done. | Shloimie/keyholder/Codex release owner | Create a clean release branch from current `origin/master`, apply only the scoped Rabbi / One Time UI cleanup files and records, validate, push/PR/merge if policy allows, deploy the correct Railway service, then rerun live smoke on `bneineviimacademy.org` and any intended One Time domain. | Terminal Done for app-visible `REQ-20260702-802` and later child UI packets | Open - local verification complete; read-only live deploy-state check shows not deployed |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260702-801` | Done | Raw intake, memory note, register, PQC Markdown/JSON packet | `raw-input/RAW-20260702-008-rabbi-onetime-ui-clean-even-loads-nicely.md`, this register, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/` | `npm run pqc:validate ...02-operations-shell-heading-labels.product-quality.json` passed | None for intake/split |
| `REQ-20260702-802` | Locally verified; deploy/live-smoke blocked | After-audit: 40 Operations captures, `missingH1=0`, `inputs_without_labels=[]`; latest full audit has 0 automated findings | `public/operations.html`, `scripts/audit-rabbi-onetime-current-state.mjs` | Inline script parse passed; `node --check scripts/audit-rabbi-onetime-current-state.mjs`; full local audits passed and produced 75 screenshots each | Production deploy/live-smoke not run |
| `REQ-20260702-803` | Done local after-audit; live smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-shell-labels/report.md` and screenshots | `ops/ui-audits/2026-07-02-rabbi-onetime-shell-labels/` | `node scripts/audit-rabbi-onetime-current-state.mjs --base=http://127.0.0.1:8095 --out=ops/ui-audits/2026-07-02-rabbi-onetime-shell-labels` passed | Production live-smoke target still open |
| `REQ-20260702-804` | Already satisfied and verified dry-run | `ops/one-time-mishnah/mock-data/2026-07-02-ui-review-seed-readback.md` | no product code change | `npm run one-time:seed:ui-review` passed in `dry_run`, `mutation_performed=false`, `external_writes_performed=false` | DB apply remains out of scope |
| `REQ-20260702-805` | Blocked - selected UI child packets locally verified; release deploy/live-smoke required | Packet DAG progressed through selected child packets `REQ-20260702-810` through `REQ-20260702-823`; latest automated audit has no findings and latest contact-sheet review selected no additional concrete UI defect | `public/operations.html`, `public/css/one-time-operations.css`, `public/provider.html`, `public/student.html`, `public/rabbi-member.html`, `public/one-time-classroom.html`, `public/one-time-email-review.html`, `public/css/one-time-shared-review.css`, `public/js/bna-bot-widget.js`, `scripts/audit-rabbi-onetime-current-state.mjs`, `ops/action-registry.json`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/`, `ops/ui-audits/2026-07-02-rabbi-onetime-*/`, `ops/live-smokes/2026-07-03-rabbi-onetime-ui-deploy-state/` | All selected child PQC packets validated; local focused probes/tests/audits passed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed; read-only live deploy-state check proved production has not received latest Library contract | Clean release branch/PR/deploy/live-smoke path still required under `DEC-20260702-801` |
| `REQ-20260702-810` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-provider-review-load-error/report.md`: 75 screenshots, `findings_count=0`, provider-review console/network errors empty; screenshot spot-checks show `Eli Scheller Workspace` instead of the raw `driveDropoffLinks is not defined` banner | `public/provider.html`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/08-provider-review-load-error.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-provider-review-load-error/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; full local after-audit passed; screenshot spot-check of provider desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings; scoped `git diff --check` had only CRLF warnings | Production deploy/live-smoke not run; broader manual brand/IA/mobile/CRM polish still needs child packets |
| `REQ-20260702-811` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-student-review-readability/report.md`: 75 screenshots, `findings_count=0`, student-review console/network errors empty; metric probe shows title color white, no horizontal overflow, and no metric text/card clipping on mobile or desktop | `public/student.html`, `public/css/one-time-shared-review.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/09-student-review-mobile-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-student-review-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; student metric probe passed; full local after-audit passed; screenshot spot-check of student desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader manual brand/IA/CRM/automation polish still needs child packets |
| `REQ-20260702-812` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-automation-center-readability/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show the Automations route without the portrait overlay/overlap and with readable toolbar/empty-state text on desktop and mobile | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/10-automation-center-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-automation-center-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; automation toolbar computed-style probe passed with title white, copy muted readable, no mobile horizontal overflow; full local after-audit passed; screenshot spot-check of Automations desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings; scoped `git diff --check` had only CRLF warnings | Production deploy/live-smoke not run; broader manual brand/IA/CRM polish still needs child packets |
| `REQ-20260702-813` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-participants-readability/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show wrapped contacts tabs, readable roster panels, a labeled mobile participant row-card, and compact command-bot empty state | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/11-participants-members-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-participants-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; participants computed-style probes passed with no horizontal overflow, wrapped tabs, dark panels, readable table text, and compact empty state; full local after-audit passed; screenshot spot-check of Participants desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings; scoped `git diff --check` had only CRLF warnings | Production deploy/live-smoke not run; broader manual brand/IA/CRM detail polish still needs child packets |
| `REQ-20260702-814` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-payment-access-readability/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show wrapped Program tabs, readable Payment / Access roster text, a labeled mobile access row-card, and compact command-bot empty state | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/12-program-payment-access-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-payment-access-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; payment/access computed-style probe passed with no horizontal overflow, wrapped service-provider tabs, dark/readable access table text, labeled mobile row, and compact empty state; full local after-audit passed; screenshot spot-check of Payment / Access desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader manual brand/IA/CRM detail polish still needs child packets |
| `REQ-20260702-815` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-communications-readability/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show wrapped Communications tabs and a readable compact dark Provider Messages empty state on desktop and mobile | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/13-communications-provider-messages-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-communications-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; communications computed-style probe passed with no horizontal overflow, wrapped communications tabs, solid dark empty state, readable white empty text, and compact empty-state height; full local after-audit passed; screenshot spot-check of Communications desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader manual brand/IA/CRM detail polish still needs child packets |
| `REQ-20260702-816` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-program-overview-readability/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show a cohesive dark Program Overview route with readable metrics, Mishnayos Membership details, command-bot empty state, and dark bot log rows on desktop and mobile | `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/14-program-overview-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-program-overview-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; Program Overview computed-style probe passed with no horizontal overflow, grid overview metrics, solid dark metric/detail/log cards, readable empty-state text, and contrast above threshold; full local after-audit passed; screenshot spot-check of Program Overview desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader manual brand/IA/CRM detail polish still needs child packets |
| `REQ-20260702-817` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-settings-workspace-readability/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show a contained dark Workspace Settings route with readable toolbar, setting rows, active category chips, and no mobile overflow | `public/operations.html`, `public/css/one-time-operations.css`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/15-settings-workspace-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-settings-workspace-readability/` | PQC validation passed; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; Settings computed-style probe passed with no horizontal overflow, wrapped settings tabs, solid dark toolbar/panel/rows, active-chip contrast above threshold, and no clipped text; full local after-audit passed; screenshot spot-check of Workspace Settings desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader manual brand/IA/CRM detail polish still needs child packets |
| `REQ-20260702-818` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-member-login-brand-helper/report.md`: 75 screenshots, `findings_count=0`; focused probe shows no BNA Academy text/image references, One Time logo/hero assets, dark body background, `One Time Helper` title, hidden/inert/aria-hidden closed panel, and readable launcher on desktop and mobile | `public/rabbi-member.html`, `public/js/bna-bot-widget.js`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/16-member-login-brand-helper-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-member-login-brand-helper/` | PQC validation passed; `node --check public/js/bna-bot-widget.js` passed; `node --test tests/one-time-canonical-journey.test.js tests/one-time-external-user-portal.test.js` passed 40/40; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; focused member-login brand/helper probe passed with no errors; full local after-audit passed; screenshot spot-check of member-login desktop/mobile completed; `npm run watchdog:actions` passed; `npm run watchdog:protocol-drift` passed | Production deploy/live-smoke not run; broader manual brand/IA/CRM detail polish still needs child packets |
| `REQ-20260702-819` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-classroom-review-brand-layout/report.md`: 75 screenshots, `findings_count=0`; focused probe shows dark One Time classroom body/panels, no horizontal overflow, no video/details overlap, no BNA school-goal leakage, no console errors, eager iframe loading, and contrast above threshold on desktop and mobile | `public/one-time-classroom.html`, `config/brands/one-time.json`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/17-classroom-review-brand-layout.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-classroom-review-brand-layout/` | PQC validation passed; `node --test tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-community-moderation-workflow.test.js tests/one-time-shared-review-branding.test.js tests/one-time-content-command-center.test.js` passed 27/27; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` passed; focused classroom brand/layout probe passed; full local after-audit passed; screenshot spot-check of classroom desktop/mobile completed; `npm run watchdog:actions` passed with finding_count 0; `npm run watchdog:protocol-drift` passed | Production deploy/live-smoke not run; broader manual IA/nav/filter and CRM detail polish still needs child packets |
| `REQ-20260702-820` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-email-review-brand-layout/report.md`: 75 screenshots, `findings_count=0`; focused probe shows 21 template cards, compact header, no horizontal overflow, no console/page errors, all preview-only/no-send labels present, first card visible in first viewport, and strong contrast on desktop and mobile | `public/one-time-email-review.html`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/18-email-review-brand-layout.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-email-review-brand-layout/` | PQC validation passed; email review script parse passed; `node --test tests/one-time-shared-review-branding.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js tests/one-time-review-only-server.test.js` passed 7/7; focused email-review brand/layout probe passed; full local after-audit passed; screenshot spot-check of email-review desktop/mobile completed; `npm run watchdog:actions` passed with finding_count 0; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader manual IA/nav/filter and CRM detail polish still needs child packets |
| `REQ-20260702-821` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-ia-nav-filter-alignment/report.md`: 75 screenshots, `findings_count=0`; screenshot spot-checks show a short Rabbi-facing sidebar with Overview, Members, Classes, Comms, Auto, Payments, Tasks, Setup, a demoted Platform Support footer, and Payments opening Payment / Access | `public/operations.html`, `tests/one-time-operations-ui-smoke.test.js`, `tests/one-time-rabbi-ui-final-local-smoke.test.js`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/19-operations-ia-nav-filter-alignment.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-ia-nav-filter-alignment/`, `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | PQC validation passed; inline Operations script parse passed; `node --test tests/one-time-rabbi-dashboard-ia.test.js tests/one-time-operations-ui-smoke.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js` passed 8/8; full local after-audit passed; screenshot spot-check of Operations overview, Payment / Access, and mobile Platform Support completed; `npm run watchdog:actions` passed with finding_count 0; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; broader CRM/contact-detail polish still needs a child packet |
| `REQ-20260702-822` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-crm-contact-detail-polish/report.md`: 80 screenshots, `findings_count=0`; screenshot spot-checks show dedicated CRM Contacts desktop/mobile captures with structured no-send/source/dedupe/next empty state and mobile-safe layout | `public/operations.html`, `scripts/audit-rabbi-onetime-current-state.mjs`, `tests/operations-contacts-intake-cleanup.test.js`, `tests/one-time-communications-workspace.test.js`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/20-operations-crm-contact-detail-polish.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-crm-contact-detail-polish/` | PQC validation passed; inline Operations script parse passed; `node --check scripts/audit-rabbi-onetime-current-state.mjs` passed; focused CRM static tests passed 9/9; broader One Time/Operations/local smoke suite passed 17/17; full local after-audit passed with 16 routes and 80 screenshots; screenshot spot-check of CRM Contacts desktop/mobile completed; `npm run watchdog:actions` passed with finding_count 0; `npm run watchdog:protocol-drift` passed with 0 findings | Production deploy/live-smoke not run; manual screenshot review and deploy/live-smoke remain |
| `REQ-20260702-823` | Locally verified; deploy/live-smoke blocked | `ops/ui-audits/2026-07-02-rabbi-onetime-library-first-viewport-readability/report.md`: 80 screenshots, `findings_count=0`; focused probe shows heading luminance `1`, copy luminance `0.8106`, filters closed by default, useful library content top at `383px` desktop / `419px` mobile, and no horizontal overflow; `manual-review/latest-contact-sheet-review.md` records no additional concrete defect from the latest contact-sheet scan; read-only live deploy-state check shows production has not received this contract yet | `public/operations.html`, `public/css/one-time-operations.css`, `scripts/audit-rabbi-onetime-current-state.mjs`, `ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json`, `ops/ui-audits/2026-07-02-rabbi-onetime-library-first-viewport-readability/`, `ops/live-smokes/2026-07-03-rabbi-onetime-ui-deploy-state/` | PQC validation passed; inline Operations script parse passed; `node --check scripts/audit-rabbi-onetime-current-state.mjs` passed; focused Operations smoke passed 2/2; focused library first-viewport probe passed; full local after-audit passed with 16 routes and 80 screenshots; screenshot spot-check and contact-sheet review of latest desktop/mobile audit completed; read-only live deploy-state check performed; `npm run watchdog:actions` passed with finding_count 0; `npm run watchdog:protocol-drift` passed with 0 findings | `bneineviimacademy.org` live contract absent: section marker no, filters open yes, useful top `928px`; `join.onetimeonetime.com` Operations login rejected current credentials; clean release branch/PR/deploy/live-smoke still required |

## Verification Log

- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/02-operations-shell-heading-labels.product-quality.json` - passed.
- Inline parse of `public/operations.html` script blocks - passed.
- `node --check scripts/audit-rabbi-onetime-current-state.mjs` - passed.
- `npm run one-time:seed:ui-review` - passed dry-run with no mutation/external writes.
- Local server `http://127.0.0.1:8095` - health OK; startup logged an existing DB constraint warning but served the app.
- Full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings reduced from 107 to 5.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/03-one-time-library-support-language.product-quality.json` - passed.
- Second full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings reduced to 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-library-layout/screenshots/operations-library-1440-desktop.png` and `operations-library-390-mobile.png` show the Class Package Manager form aligned/readable.
- `npm run watchdog:actions` - passed with finding_count 0 after registry label/hint alignment.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/04-provider-workspace-contrast-readability.product-quality.json` - passed.
- Third full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0, console/network errors empty.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-provider-contrast/screenshots/operations-overview-1440-desktop.png`, `operations-overview-390-mobile.png`, `operations-participants-1440-desktop.png`, and `operations-access-1440-desktop.png` show readable active tabs and provider heading text.
- `npm run watchdog:actions` - passed with finding_count 0 after the contrast/readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/05-mobile-helper-closed-state.product-quality.json` - passed.
- Helper closed-state browser probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-mobile-helper-closed/helper-closed-state-probe.json`.
- Fourth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0, console/network errors empty.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-mobile-helper-closed/screenshots/operations-overview-390-mobile.png` and `operations-library-390-mobile.png` no longer show the closed helper sheet at the bottom of the full-page mobile capture.
- `npm run watchdog:actions` - passed with finding_count 0 after the mobile helper closed-state packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after packet closeout.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/06-task-dialogue-lane-contrast.product-quality.json` - passed.
- Task dialogue lane computed-style probe - passed; first lane title computed to white text, note to muted One Time text, and count chip to One Time yellow.
- Fifth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0, console/network errors empty.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-task-dialogue-contrast/screenshots/operations-tasks-390-mobile.png` and `operations-tasks-1440-desktop.png` show readable dialogue lane headings, notes, and count chips.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/07-task-route-layout-density.product-quality.json` - passed.
- Tasks route layout probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-task-route-density/probe/layout-probe.json` and `operations-tasks-1440-probe.png`; board top moved into the first desktop viewport and the One Time filter drawer is closed by default.
- Audit harness loading wait - added for Operations routes so screenshots wait briefly for `Loading BNA Operations...` to clear before capture; focused Participants 1024 probe rendered successfully after a transient audit timing capture.
- Sixth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0, console/network errors empty.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-task-route-density/screenshots/operations-tasks-1440-desktop.png`, `operations-tasks-1024-desktop-tablet.png`, `operations-tasks-390-mobile.png`, and `operations-participants-1024-desktop-tablet.png` show compact Tasks layout and no loading-shell false capture.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/08-provider-review-load-error.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes.
- Seventh full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0, provider-review console/network errors empty.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-provider-review-load-error/screenshots/provider-review-1440-desktop.png` and `provider-review-390-mobile.png` show the One Time review workspace and no raw `driveDropoffLinks is not defined` banner.
- `npm run watchdog:actions` - passed with finding_count 0 after the provider review load-error packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the provider review load-error packet.
- Scoped `git diff --check` passed with CRLF warnings only.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/09-student-review-mobile-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the student review readability packet.
- Student review metric probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-student-review-readability/probe/student-metric-probe.json`; title color is white and all review metrics stay inside their cards/hero bounds on 390px mobile and 1440px desktop.
- Eighth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0, student-review console/network errors empty.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-student-review-readability/screenshots/student-review-390-mobile.png` and `student-review-1440-desktop.png` show readable title and non-clipped review metrics.
- `npm run watchdog:actions` - passed with finding_count 0 after the student review readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the student review readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/10-automation-center-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the automation-center readability packet.
- Automation toolbar computed-style probe - passed; title color is white, copy is readable muted text, empty-state text is white, and 390px mobile has no horizontal overflow.
- Ninth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-automation-center-readability/screenshots/operations-automations-1440-desktop.png` and `operations-automations-390-mobile.png` show the route without the portrait overlay/overlap and with readable heading, toolbar, filters, and empty state.
- `npm run watchdog:actions` - passed with finding_count 0 after the automation-center readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the automation-center readability packet.
- Scoped `git diff --check` passed with CRLF warnings only after the automation-center readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/11-participants-members-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the participants readability packet.
- Participants route computed-style probes - passed; contacts tabs wrap with no clipped tab labels, mobile has no horizontal overflow, participant panels compute to the One Time dark gradient, table text is white/readable, and the command-bot empty state is compact.
- Tenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-participants-readability/screenshots/operations-participants-1440-desktop.png` and `operations-participants-390-mobile.png` show wrapped tabs, readable roster panel, labeled mobile participant row, and compact command-bot empty state.
- `npm run watchdog:actions` - passed with finding_count 0 after the participants readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the participants readability packet.
- Scoped `git diff --check` passed with CRLF warnings only after the participants readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/12-program-payment-access-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the payment/access readability packet.
- Payment / Access route computed-style probe - passed; service-provider tabs wrap with no clipped labels, mobile has no horizontal overflow, access panels use the One Time dark surface, table text is white/readable, the mobile access table is labeled, and the command-bot empty state is compact.
- Eleventh full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-payment-access-readability/screenshots/operations-access-1440-desktop.png` and `operations-access-390-mobile.png` show wrapped Program tabs, readable Payment / Access roster, labeled mobile access row, and compact command-bot empty state.
- `npm run watchdog:actions` - passed with finding_count 0 after the payment/access readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the payment/access readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/13-communications-provider-messages-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the communications readability packet.
- Communications Provider Messages computed-style probe - passed; communications tabs wrap with no clipped labels, mobile has no horizontal overflow, the Provider Messages route uses a One Time dark surface, empty-state text is white/readable, and the empty state is compact.
- Twelfth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-communications-readability/screenshots/operations-communications-1440-desktop.png` and `operations-communications-390-mobile.png` show wrapped Communications tabs and a compact dark Provider Messages empty state.
- `npm run watchdog:actions` - passed with finding_count 0 after the communications readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the communications readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/14-program-overview-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the Program Overview readability packet.
- Program Overview computed-style probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-program-overview-readability/probe/overview-readability-probe.json`; desktop and mobile had no horizontal overflow, grid overview metrics, solid dark metric/detail/log cards, readable empty-state text, and contrast above threshold.
- Thirteenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-program-overview-readability/screenshots/operations-overview-1440-desktop.png` and `operations-overview-390-mobile.png` show the Program Overview metrics, Mishnayos Membership details, and Command Bot panel as cohesive dark/readable One Time panels.
- `npm run watchdog:actions` - passed with finding_count 0 after the Program Overview readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the Program Overview readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/15-settings-workspace-readability.product-quality.json` - passed.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the Workspace Settings readability packet.
- Workspace Settings computed-style probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-settings-workspace-readability/probe/settings-workspace-readability-probe.json`; desktop and mobile had no horizontal overflow, wrapped settings tabs, solid dark toolbar/panel/rows, active-chip contrast above threshold, and no clipped text.
- Fourteenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-settings-workspace-readability/screenshots/operations-settings-1440-desktop.png` and `operations-settings-390-mobile.png` show the Workspace Settings toolbar, category controls, and setting rows as a contained dark/readable One Time surface.
- `npm run watchdog:actions` - passed with finding_count 0 after the Workspace Settings readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the Workspace Settings readability packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/16-member-login-brand-helper-readability.product-quality.json` - passed.
- `node --check public/js/bna-bot-widget.js` - passed after the member-login helper visibility changes.
- `node --test tests/one-time-canonical-journey.test.js tests/one-time-external-user-portal.test.js` - passed 40/40 after the member-login brand/helper packet.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the member-login brand/helper packet.
- Member-login brand/helper focused probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-member-login-brand-helper/probe/member-login-brand-helper-probe.json`; desktop and mobile had One Time logo/hero assets, no BNA Academy text/image references, dark One Time body background, hidden/inert/aria-hidden closed helper panel, readable `One Time Helper` launcher, and strong contrast.
- Fifteenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-member-login-brand-helper/screenshots/one-time-member-login-1440-desktop.png` and `one-time-member-login-390-mobile.png` show the member-login shell using the black/yellow One Time brand and a compact closed helper launcher.
- `npm run watchdog:actions` - passed with finding_count 0 after the member-login brand/helper packet.
- `npm run watchdog:protocol-drift` - passed after the member-login brand/helper packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/17-classroom-review-brand-layout.product-quality.json` - passed.
- `node --test tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-community-moderation-workflow.test.js tests/one-time-shared-review-branding.test.js tests/one-time-content-command-center.test.js` - passed 27/27 after the classroom review brand/layout packet.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 1/1 with no console/page errors or external writes after the classroom review brand/layout packet.
- Classroom review brand/layout focused probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-classroom-review-brand-layout/probe/classroom-brand-layout-probe.json`; desktop and mobile had no horizontal overflow, no video/details overlap, dark One Time body/panel colors, review/no-write copy, no BNA school-goal leakage, eager iframe loading, and strong contrast.
- Sixteenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-classroom-review-brand-layout/screenshots/one-time-classroom-review-1440-desktop.png` and `one-time-classroom-review-390-mobile.png` show the Classroom Review route using a contained black/yellow One Time classroom layout with stacked video/details and readable Rabbi Threads reply form.
- `npm run watchdog:actions` - passed with finding_count 0 after the classroom review brand/layout packet.
- `npm run watchdog:protocol-drift` - passed after the classroom review brand/layout packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/18-email-review-brand-layout.product-quality.json` - passed.
- Email review script-block parse - passed after the page-specific renderer/status changes.
- `node --test tests/one-time-shared-review-branding.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js tests/one-time-review-only-server.test.js` - passed 7/7 after the Email Review brand/layout packet.
- Email Review brand/layout focused probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-email-review-brand-layout/probe/email-review-brand-layout-probe.json`; desktop and mobile had 21 template cards, no horizontal overflow, compact header/first-card position, preview-only/no-send labels, no console/page errors, and strong contrast.
- Seventeenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-email-review-brand-layout/screenshots/one-time-email-review-1440-desktop.png` and `one-time-email-review-390-mobile.png` show a compact black/yellow One Time email review surface with visible blocked-send notice and dark/readable template cards.
- `npm run watchdog:actions` - passed with finding_count 0 after the Email Review brand/layout packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the Email Review brand/layout packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/19-operations-ia-nav-filter-alignment.product-quality.json` - passed.
- Inline parse of `public/operations.html` script blocks - passed after the section-aware sidebar navigation changes.
- `node --test tests/one-time-rabbi-dashboard-ia.test.js tests/one-time-operations-ui-smoke.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js` - passed 8/8 after the Operations IA/nav/filter alignment packet.
- Eighteenth full local after-audit - passed capture run, 75 screenshots, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-ia-nav-filter-alignment/screenshots/operations-overview-1440-desktop.png`, `operations-access-1440-desktop.png`, `operations-overview-390-mobile.png`, and `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` show the Rabbi-facing primary nav, direct Payments to Payment / Access, and demoted Platform Support route.
- `npm run watchdog:actions` - passed with finding_count 0 after the Operations IA/nav/filter alignment packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the Operations IA/nav/filter alignment packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/20-operations-crm-contact-detail-polish.product-quality.json` - passed.
- Inline parse of `public/operations.html` script blocks and `node --check scripts/audit-rabbi-onetime-current-state.mjs` - passed after the CRM contact-detail polish packet.
- `node --test tests/operations-contacts-intake-cleanup.test.js tests/one-time-communications-workspace.test.js` - passed 9/9 after the CRM contact-detail polish packet.
- Nineteenth full local after-audit - passed capture run, 80 screenshots, 16 routes, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-crm-contact-detail-polish/screenshots/operations-crm-contacts-1440-desktop.png` and `operations-crm-contacts-390-mobile.png` show a structured CRM Contacts empty/setup state with source, no-send, dedupe, and next-step cards.
- `node --test tests/one-time-rabbi-dashboard-ia.test.js tests/one-time-operations-ui-smoke.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js tests/operations-contacts-intake-cleanup.test.js tests/one-time-communications-workspace.test.js` - passed 17/17 after the CRM contact-detail polish packet.
- `npm run watchdog:actions` - passed with finding_count 0 after the CRM contact-detail polish packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the CRM contact-detail polish packet.
- `npm run pqc:validate ops/prompt-packets/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely/21-operations-library-first-viewport-readability.product-quality.json` - passed.
- Inline parse of `public/operations.html` script blocks and `node --check scripts/audit-rabbi-onetime-current-state.mjs` - passed after the Library first-viewport readability packet.
- `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js tests/one-time-operations-ui-smoke.test.js` - passed 2/2 after the Library first-viewport readability packet.
- Library first-viewport focused probe - passed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-library-first-viewport-readability/probe/library-first-viewport-probe.json`; useful library content starts at `383px` desktop and `419px` mobile, filters are closed by default, heading/copy are readable, and no horizontal overflow was detected.
- Twentieth full local after-audit - passed capture run, 80 screenshots, 16 routes, Operations auth available, automated findings remained 0.
- Screenshot spot-check: `ops/ui-audits/2026-07-02-rabbi-onetime-library-first-viewport-readability/screenshots/operations-library-1440-desktop.png` and `operations-library-390-mobile.png` show the One Time Library route with a readable dark heading, collapsed filter bar, and useful library content visible in the first viewport.
- Latest audit contact-sheet review - completed; evidence saved at `ops/ui-audits/2026-07-02-rabbi-onetime-library-first-viewport-readability/manual-review/latest-contact-sheet-review.md`; no additional concrete route-level UI defect was selected.
- Read-only live deploy-state check - completed; evidence saved at `ops/live-smokes/2026-07-03-rabbi-onetime-ui-deploy-state/library-first-viewport-live-deploy-state.md`; `bneineviimacademy.org` returned 200 with Operations auth but did not have the local Library contract (`sectionMarkerPresent=false`, `filterDefaultOpen=true`, useful content top `928px`); `join.onetimeonetime.com` did not accept current Operations login credentials.
- `npm run watchdog:actions` - passed with finding_count 0 after the Library first-viewport readability packet.
- `npm run watchdog:protocol-drift` - passed with 0 findings after the Library first-viewport readability packet.

## Remaining Next Packet

The latest local automated audit after the Library first-viewport readability
packet has no generated findings, and the latest desktop/mobile contact-sheet
scan did not select another concrete route-level defect. A read-only live
deploy-state check proved the current production Operations route has not
received the Library first-viewport contract yet. No additional UI
implementation packet is selected; the remaining work is a clean release
branch/PR/deploy/live-smoke path under `DEC-20260702-801`.
