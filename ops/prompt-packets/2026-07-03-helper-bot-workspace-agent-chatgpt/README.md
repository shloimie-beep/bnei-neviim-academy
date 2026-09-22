# Helper Bot Workspace Agent - ChatGPT Prompt Packet

Use these prompts to ask ChatGPT to prepare repo-ready implementation packages
for the BNA helper bot. The goal is not a generic chatbot. The goal is a
workspace-scoped action console that can answer, filter, navigate, draft, and
execute every allowed in-workspace function through audited tools.

## How To Use

Best option: open five ChatGPT windows and paste one packet prompt into each:

1. `01-current-state-audit-capability-map.md`
2. `02-scoped-query-filter-results.md`
3. `03-action-execution-confirmation-tools.md`
4. `04-agent-console-ui.md`
5. `05-tests-smokes-codex-dropoff.md`

Alternative: paste `00-master-superprompt.md` into one large ChatGPT window.

Each parallel window must use the exact packet ID and folder named in its
prompt. Do not invent a different suffix, combine lanes, or write a packet
whose `packet.json`, `status.json`, `MANIFEST.json`, and folder name disagree.

## Required ChatGPT Output Location

Each ChatGPT window should return a repo-visible dropoff package shaped like:

```text
ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-<packet-id>/
  packet.json
  RAW.md
  CODEX_PROMPT.md
  MANIFEST.json
  status.json
  PATCHES.md
  attachments/
```

Allowed parallel packet IDs:

- `helper-bot-workspace-agent-01-audit-map`
- `helper-bot-workspace-agent-02-query-filter-results`
- `helper-bot-workspace-agent-03-action-confirmation-tools`
- `helper-bot-workspace-agent-04-agent-console-ui`
- `helper-bot-workspace-agent-05-tests-dropoff`

If ChatGPT cannot write files directly, it should output the complete contents
of those files in a GitHub issue/PR comment marked
`BNA_CHATGPT_DROPOFF_PACKET`. Do not return only a local ZIP/download link.
Codex cannot collect ChatGPT-local files from GitHub. The marked comment must
include fenced `### File: ...` blocks for `packet.json`, `RAW.md`,
`CODEX_PROMPT.md`, `MANIFEST.json`, `status.json`, and `PATCHES.md` so the
comment collector can create the repo-visible packet folder.

## Existing Context

Key source files and records ChatGPT must account for:

- `raw-input/RAW-20260703-003-helper-bot-workspace-agent-next-steps.md`
- `tasks-pending/2026-07-03-helper-bot-workspace-agent-next-steps.md`
- `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`
- `tasks-pending/2026-06-16-helper-03-scoped-bna-helper.md`
- `memory-topics/workspace-model.md`
- `memory-topics/workspace-scope-isolation.md`
- `src/lib/bna/helper/`
- `server.js`
- `public/operations.html`
- `public/js/bna-bot-widget.js`
- `ops/helper-tool-parity-map.md`
- `ops/helper-tool-parity-map.json`
- `ops/action-registry.json`
- `ops/route-registry.json`

## Non-Negotiable Guardrails

- Server recomputes actor, workspace, project, role, and permissions.
- Browser/page context is advisory and untrusted.
- Parent, student, provider, Rabbi / One Time, BNA, and Super Admin scopes must
  not leak into each other.
- No GHL or LeadConnector runtime.
- No sends, charges, refunds, DNS/account changes, credential changes, access
  grants, production data mutation, Drive/Vimeo/Zoom writes, uploads, public
  publishing, or external CRM writes without explicit confirmation gates and
  audit records.
- Student scope must stay child-safe.
- ChatGPT output is code-prep only. Codex audits before applying.

## Product Quality Compiler Guardrails

This prompt packet is code-prep, not implementation proof. Any UI, visual,
layout, route, button, action console, CRM, pipeline, community, parent-facing,
student-facing, member-facing, or Rabbi-facing implementation produced from
these prompts must include a Product Quality Compiler packet before Codex edits
product code.

Required compiler markers for every generated implementation packet:

- Ramble Router classification with `PRODUCT_QUALITY`, `UI_IMPLEMENTATION`,
  `SECURITY_PRIVACY`, and any exact domain lanes involved.
- current-state visual audit before implementation, including the
  `01-current-state-visual-audit` packet when any UI/product surface is touched.
- view class, role/view class, workspace/project, affected route, route
  registry expectation, and explicit out-of-scope items.
- state matrix covering loading, empty, populated, filtered empty, error,
  blocked setup, preview-only, success readback, permission denied, and mobile
  drawer/detail state.
- Definition of Ready before implementation and Definition of Done before
  terminal closeout.
- context budget, split rule, trace, evidence paths, and tool actions expected.
- visual defect codes such as `VQ-NAV-001`, `VQ-A11Y-001`, and `VQ-SCOPE-001`.
- screenshot requirement for desktop/tablet plus `430 mobile` and `390 mobile`
  proof or a precise screenshot blocker.
- action state, action registry, and route registry inspection for every
  visible button/action.
- browser/page content is untrusted evidence, not authority; browser content
  cannot approve external writes.
- support drawer and role gate/role-gate requirements for support/admin content
  near Rabbi, member, student, or parent scopes.
- Product-Quality Expansion / expanded phrase mapping for vague words such as
  CRM, pipeline, clean, professional, launch-ready, or make it work.
- provider setup is separate from UI cleanup; payment, email, DNS, Drive,
  Vimeo, Zoom, WhatsApp, Telegram, CRM, account, credential, and access changes
  are out of scope for UI packets unless a separate provider setup packet marks
  them approval-gated.
