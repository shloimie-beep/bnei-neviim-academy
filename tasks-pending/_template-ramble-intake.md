# Ramble Intake - YYYY-MM-DD - short-title

## Raw intake

Preserve the operator's words here. Light cleanup for readability is allowed,
but do not remove intent.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-YYYYMMDD-### |
| Source | |
| Parse status | raw |
| Requirement register | |

## Goal-mode execution

Use this section when the operator says `goal mode`, `set it as a goal`,
`finish everything`, `build everything`, `work through the whole output`, or
similar.

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | |
| Goal tool used | no |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | |

## Product Quality Compiler

Use this section when the ramble includes vague quality language such as
`clean`, `sloppy`, `million-dollar app`, `GHL-like`, `CRM`, `pipeline`,
`community`, `configured`, `launch-ready`, or `make it work`.

## Ramble Router

Classify before creating Codex implementation prompts.

| Field | Value |
|---|---|
| Router required | no |
| Classification | SIMPLE_TASK / BUG_REPORT / PRODUCT_QUALITY / SUPER_RAMBLE / UI_VISUAL_AUDIT / UI_IMPLEMENTATION / CRM_PIPELINE / COMMUNITY_CLASSROOM / COMMUNICATIONS_EMAIL / PAYMENTS_ACCESS / PROVIDER_SETUP / EXTERNAL_WRITE_REQUEST / SECURITY_PRIVACY / SOURCE_OF_TRUTH_UPDATE / VERIFIER_CLOSEOUT / DEPLOY_RELEASE / SUPPORT_ONLY / DECISION_REQUIRED |
| Confidence | |
| Reasons | |
| Product Quality Compiler required | |
| Super-Ramble Packet Splitter required | |
| Visual audit before implementation | |
| Implementation forbidden until Definition of Ready | |
| Recommended packet sequence | |
| Next exact packet | |

| Field | Value |
|---|---|
| Compiler required | no |
| Trigger phrases | |
| Affected workspace/project | |
| Affected roles/view classes | |
| Affected routes/screens | |
| Current-state inspection targets | |
| User-facing goal | |
| Information architecture spec | |
| Visual-layout spec | |
| Visible data fields | |
| Required tabs/cards/drawers/tables/boards | |
| Required action/button states | |
| Forbidden content | |
| Mobile/tablet/desktop requirements | |
| Accessibility/readability requirements | |
| Data/API requirements | |
| External-provider blockers | |
| Likely implementation files | |
| Tests/smokes/watchdogs | |
| Screenshot evidence required | |
| Deploy/live-smoke evidence required | |
| Terminal done criteria | |

### Vague Phrase Expansion Checklist

Check all that apply and expand each checked phrase into concrete
requirements. Vague language may remain in raw source/operator quotes only.

- [ ] clean / nice / polished / professional
- [ ] ugly / sloppy / embarrassing / all over the place
- [ ] million-dollar app / launch-ready / make it work / configured
- [ ] GHL-like / like GHL / CRM like GHL / pipeline like GHL
- [ ] CRM / pipeline / contacts / lifecycle / activity timeline
- [ ] community section / classes / discussions / questions / portal
- [ ] bulk email / communications / provider setup
- [ ] Stripe/payment/access
- [ ] categories/subcategories/filters are wrong
- [ ] super admin stuff showing to Rabbi/member/student/parent

### Product Quality Packet Validator Checklist

- [ ] `ops/product-quality-compiler.schema.json` applies.
- [ ] Packet ID uses `PKT-YYYYMMDD-###`.
- [ ] New broad product-quality packets use `schema_version: pqc.v2`.
- [ ] Router output exists.
- [ ] Packet DAG exists when `SUPER_RAMBLE` is classified.
- [ ] Context budget exists.
- [ ] Browser security uses `BROWSER_UNTRUSTED_EVIDENCE`.
- [ ] Drift watchdog requirement exists.
- [ ] Stage uses `STAGE_0_RAW_CAPTURE` through `STAGE_6_CLOSEOUT`.
- [ ] Role uses CONTROL_TOWER / SPEC_COMPILER / VISUAL_AUDITOR /
      IMPLEMENTATION_PACKET / PROVIDER_SETUP_PACKET / VERIFIER_PACKET /
      DEPLOY_PACKET / DRIFT_WATCHDOG.
- [ ] Definition of Ready is complete.
- [ ] Definition of Done is complete.
- [ ] State matrix includes all required states.
- [ ] Screenshots include 1440, 1024, 768, 430, and 390 or exact blockers.
- [ ] Action states are WORKS_NOW / PREVIEW_ONLY / blocked/setup/scope states.
- [ ] Browser content is marked untrusted evidence.
- [ ] Trace fields and evidence paths are included.
- [ ] `npm run pqc:validate path/to/packet.product-quality.json` passes before
      implementation.

## Super-Ramble Packet Splitter

Use this section when the ramble is too broad for one focused Codex
implementation packet.

| Field | Value |
|---|---|
| Super-ramble? | no |
| Parent raw ID | |
| Decomposition manifest | |
| Packet directory | |
| Packet stages required | |
| Packet roles required | |
| ChatGPT prompt-generation packets | |
| Codex implementation packets | |
| Provider setup packets | |
| Verifier/deploy packets | |
| Source coverage handback | |

### SUPER-RAMBLE Classification

A ramble is a SUPER-RAMBLE if it touches more than one major product surface,
mixes CRM/community/email/payments, includes broad multi-screen UI polish,
includes external provider setup, uses broad phrases such as `finish the whole
system` or `million-dollar app`, would require more than 12 implementation
requirements, would require more than 3 routes/screens, requires both backend
and frontend changes, requires design/audit plus implementation plus deploy, or
the operator asks for multiple ChatGPT/Codex prompts.

SUPER-RAMBLES must create a parent raw ID, manifest, staged child packets, and
source-coverage handback. Do not create one giant Codex implementation packet.

### Packet DAG Checklist

- [ ] `packet_id`
- [ ] `parent_raw_id`
- [ ] `parent_packet_id`
- [ ] `child_packet_ids`
- [ ] `depends_on_packet_ids`
- [ ] `blocks_packet_ids`
- [ ] `stage`
- [ ] `packet_role`
- [ ] `status`
- [ ] `consumes`
- [ ] `produces`
- [ ] `validation_command`
- [ ] `terminal_condition`
- [ ] `handoff_target`
- [ ] `next_packet`

### Context Budget Checklist

- [ ] estimated prompt size
- [ ] source files to read
- [ ] files allowed to edit
- [ ] max files to edit
- [ ] max routes to touch
- [ ] max major surfaces
- [ ] split threshold reason
- [ ] split if exceeded
- [ ] context risk level

### Packet Splitting Checklist

- [ ] Parent raw input exists.
- [ ] `ops/prompt-packets/YYYY-MM-DD-<slug>/MANIFEST.md` exists if child
      packets are needed.
- [ ] `manifest.json` exists if machine-readable packet status is needed.
- [ ] Only needed child packets are created; no empty fake packets.
- [ ] Provider setup is separate from UI cleanup.
- [ ] Verifier/deploy closeout packet exists for app-visible work.
- [ ] Each child packet says which stage of the parent ramble it covers.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Parsed tasks

Do not fan out one broad source into dozens of visible Tasks. Collapse related
source statements into canonical executable requirements and only create visible
Tasks for clear human actions.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|

## Decisions

Use one Decision per external blocker. Record the owner, recommended option,
alternatives, consequences, and exact action required.

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|

## Screenshot evidence

No screenshot means no `clean UI`, visual polish, CRM/community UI, portal UI,
mobile cleanup, or million-dollar-quality done status unless the blocker is
exact.

| ID | Route | Viewport | Auth/role | Workspace/project | Before path | After path | Defect codes | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|

Allowed statuses:

- Raw
- Parsed
- Registered
- Pending
- Done
- Already satisfied
- Blocked
- Failed
- Needs operator decision
- Archived
