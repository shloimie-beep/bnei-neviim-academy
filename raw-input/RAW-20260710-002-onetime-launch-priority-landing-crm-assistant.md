# RAW-20260710-002 - One Time Launch Priority Landing, CRM, Assistant

## Metadata

| Field | Value |
|---|---|
| Source channel | codex_chat |
| Intake type | goal_mode_correction_packet |
| Source artifact | `C:\Users\User\Downloads\BNA_ONETIME_CODEX_HANDOFF_2026-07-10.zip` |
| Source artifact SHA-256 | `C7773DEEF9D0D5984B2AF2C54710ADD1ABF3D0B114862EAAB82FBC182C5F1FD7` |
| Related dropoff packet | `ops/chatgpt-ramble-dropoff/incoming/onetime-launch-priority-ui-crm-automation-20260710-001/` |
| Workspace | `rabbi_sheller_provider` |
| Project | `one_time_mishnah_class` |
| Goal mode requested | yes |
| Privacy classification | redacted_public_repo_source |
| Created at | 2026-07-10T10:44:00+03:00 |

## Privacy Redaction

The source packet included the exact public business WhatsApp line. Tracked repo
text intentionally records only that the number ends in `8614`. The full value
belongs in runtime/keyholder configuration such as `ONE_TIME_PUBLIC_WHATSAPP_NUMBER`,
not in Git.

The zip contains three files:

- `00-README.md`
- `01-LAUNCH-PRIORITY-IMPLEMENTATION-PROMPT.md`
- `02-FULL-RAMBLE-TO-TERMINAL-AUDIT-PROMPT.md`

The launch-priority prompt is the governing first wave. The full ramble-to-
terminal audit is related context and should not delay already-known P0 fixes.

## Operator Intent Preserved

Shloimie supplied a Codex handoff packet saying this is not another audit-only
request. The correction says too many One Time UI complaints have been captured
as audits, PQC packets, prompt files, or verified markers instead of becoming a
finished product.

The immediate business goal is:

- beautiful One Time landing page;
- capture an interested family;
- create/update an organized One Time CRM contact;
- log source and interaction;
- immediately provide current free-class Zoom details by approved transactional
  email, WhatsApp, or both when runtime readiness and approval gates allow it;
- show the complete interaction in the contact timeline.

The latest public assistant identity is:

- `Robot Scheller`
- `Rabbi Scheller's digital assistant`

The public assistant should be concise, use a recognizable Rabbi Scheller face
or avatar treatment, include a WhatsApp affordance, use One Time black/yellow
visual language, and avoid BNA Helper branding on One Time routes.

The landing page should not show public-facing protocol, review, test, setup,
or implementation language. Technical restrictions belong in support/admin
diagnostics, tests, or role-gated drawers. Missing final images should not block
implementation; use approved repo assets or intentional replaceable slots with
an asset manifest.

The CRM must become a real first-party workspace with searchable/filterable
contacts, clickable contact detail, timeline, lifecycle/source, last activity,
email/WhatsApp interactions, class/trial/access context, notes, and next
actions. API counts and marker-only smokes are not completion proof.

The uploaded/imported historical email/contact source of roughly 2,600 records
must be reconciled. The earlier small mailbox backfill is not proof that the
complete imported history is visible.

Transactional follow-up is authorized as specification and first-party
implementation only. It does not authorize bulk campaigns, live charges,
access grants, credential changes, DNS, external provider mutation, or real
sends without the normal exact approval/readiness gates.

The Rabbi/provider backend is not launch-ready while normal pages expose
irrelevant `not scoped`, `test`, `review`, `configured/not configured`,
diagnostics, placeholder controls, dead buttons, or internal implementation
noise.

## Atomic Source Statements

| Source ID | Statement |
|---|---|
| SRC-20260710-002-001 | Preserve and register the launch-priority handoff as new raw intake with redacted private runtime values. |
| SRC-20260710-002-002 | The public One Time landing page must become a polished launch funnel, not a review/placeholder page. |
| SRC-20260710-002-003 | Landing copy must remove normal-visitor-facing TODO, review, test, setup, protocol, and no-write language. |
| SRC-20260710-002-004 | Landing media must use approved One Time assets or intentional replaceable slots documented in an asset manifest. |
| SRC-20260710-002-005 | The public assistant identity must be `Robot Scheller` with subtitle `Rabbi Scheller's digital assistant`. |
| SRC-20260710-002-006 | One Time helper branding should remain recognizable across public, member, parent, student, classroom, and provider surfaces while preserving role scope. |
| SRC-20260710-002-007 | The public page needs a WhatsApp affordance wired through runtime config, not a hardcoded private number in Git. |
| SRC-20260710-002-008 | The public form must create/update first-party One Time CRM records and log the interaction. |
| SRC-20260710-002-009 | A submitted lead must be searchable and openable in a useful CRM contact profile/detail view. |
| SRC-20260710-002-010 | Contact detail must show identity, lifecycle/source, last activity, emails, WhatsApp, class/trial/access context, notes, and next actions. |
| SRC-20260710-002-011 | The roughly 2,600-record historical email/contact import truth must be reconciled before mailbox completion is claimed. |
| SRC-20260710-002-012 | Immediate free-class email/WhatsApp follow-up must be implemented or precisely blocked by runtime readiness and approval gates. |
| SRC-20260710-002-013 | Normal Rabbi/provider backend pages must hide irrelevant test/review/scoping/protocol/support noise. |
| SRC-20260710-002-014 | Normal Rabbi/provider visible controls must work, be intentionally disabled with concise user-facing reason, or be hidden. |
| SRC-20260710-002-015 | Toolbar, card, grid, and mobile consistency require manual source-level review, not only zero automated findings. |
| SRC-20260710-002-016 | Generate only real unresolved ChatGPT code-package lanes; prompts/audits alone do not close product requirements. |

## Related Sources To Reconcile

- `raw-input/RAW-20260705-006-onetime-landing-signup-funnel.md`
- `raw-input/RAW-20260706-909-onetime-crm-mailbox-goal.md`
- `raw-input/RAW-20260708-010-onetime-resend-wapi-rabbi-login-crm.md`
- `raw-input/RAW-20260708-014-onetime-rabbi-public-assistant-isolation.md`
- `raw-input/RAW-20260709-011-onetime-parallel-frontend-audit.md`
- `raw-input/RAW-20260709-013-onetime-app-lag-ui-followup.md`
- `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md`
- `tasks-pending/2026-07-10-onetime-ramble-to-terminal-ui-gap-audit.md`
- GitHub issue `#128` comment material materialized in the local dropoff packet.

## Initial Current-State Findings

- `public/one-time/index.html` had a source TODO before the hero media, used
  generic gradient/image placeholders despite approved One Time assets, and
  displayed normal-visitor-facing review/setup/no-portal/no-spam/no-send
  language.
- `config/service-provider-sites/one-time.json` and `config/brands/one-time.json`
  already point to approved logo, hero portrait, social image, press logos,
  and teaching still assets.
- `public/js/bna-bot-widget.js` used `Rabbi Scheller Assistant`, `One Time
  Helper`, `One Time Parent Helper`, `One Time Student Helper`, and `Rabbi
  Scheller Admin Helper`, not the newest `Robot Scheller` identity.
- `server.js` already has One Time WAPI/class-link readiness concepts, but no
  public WhatsApp redirect using a One Time public runtime number.
- `gh issue view 128 --comments` could not run locally because the GitHub CLI
  token is missing `read:project`; the local repo packet is the available
  trusted issue-comment material for this turn.
