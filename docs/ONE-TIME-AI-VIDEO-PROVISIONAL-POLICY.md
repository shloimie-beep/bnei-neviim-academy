# One Time AI Video Provisional Policy

Source: `RAW-20260706-909`, `RAW-20260706-910`

Requirement: `REQ-20260706-941`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Status: provisional no-live policy

## Provisional Defaults

| Field | Value |
|---|---|
| Policy version | `2026-07-06-provisional-no-live` |
| Model provider | `openart_mcp_pending_oauth` |
| Model | `openart-video-provisional-manual-export-v1` |
| Monthly budget cap | USD 25 |
| Per-render cap | USD 2 |
| Max render attempts | 10 per month |
| Live spend | Disabled |

These values are placeholders so the worker handoff has a concrete operating
policy. They do not authorize any live OpenArt call, reference upload,
generation, credit spend, publishing, external send, or member access change.

## Worker May Do

- Review One Time Studio source, storyboard, prompt pack, character continuity,
  Jewish guardrails, and visual realism notes.
- Prepare no-live OpenArt-ready prompt text and MCP request plans.
- Record Studio sidekick prompt-patch requests for render defects, source
  fidelity problems, or continuity issues.

## Worker May Not Do

- Run live generation, upload reference images, spend credits, publish, send,
  grant access, or mutate vendor workspaces.
- Use private student, family, contact, payment, raw-message, or staff-only
  material as model input.
- Raise the budget, switch vendor/model, or enable spend without a new recorded
  approval and smoke evidence.

## Privacy And Retention Defaults

- Source material must stay scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`.
- Student/family/private-contact/payment material is not model input.
- Reference uploads are blocked until vendor credentials, ownership/release,
  retention terms, and delete/rollback path are approved.
- Generated media is review-draft material until rights, source fidelity,
  Jewish guardrails, and Rabbi/admin approval are recorded.

## Upgrade Blockers

- OpenArt or replacement vendor credentials must be configured and read back
  without exposing secrets.
- Actual model, pricing, monthly cap, per-render cap, and kill/stop rules must
  replace these placeholders.
- Reference upload policy, privacy/retention terms, and rollback/delete path
  must be approved.
- One supervised no-live readiness smoke must pass before any credit-consuming
  render.
