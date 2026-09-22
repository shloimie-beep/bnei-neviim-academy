# Prompt Ingestion / Execution Audit Handoff

Status: diagnosis complete; process/tooling fix recommended.

Source request: operator asked why prompts, Markdown files, and rambles are not
getting fully done, including files dropped into Downloads.

Primary report:

- `ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md`

## Findings

- Codex can read Downloads and attachments when asked, but there is no automatic
  Downloads watcher or canonical prompt intake register.
- The earlier Downloads prompt audit classified the then-current top-level
  Markdown pile, but newer prompt sources arrived afterward and were handled by
  separate tasks/attachments.
- The 2026-06-16 parallel ChatGPT prompt zip maps to the already-tracked
  `UI-01`, `OPS-02`, `HELPER-03`, `RABBI-04`, `INT-05`, `COMMUNITY-06`, and
  `MASTER-07` workstreams.
- Most of those workstreams are locally verified, not fully done, because live
  deploy/smoke, credentials, account setup, product/legal decisions, or source
  artifacts are still needed.
- Queue audits show many stale ledger-only records. Those need terminal
  closeout states.

## Recommended Implementation

Build a prompt-intake scanner/register:

- Scan `C:\Users\User\Downloads` for `.md`, `.markdown`, `.txt`, and relevant
  zip entries without reading or logging secret values.
- Scan recent `C:\Users\User\.codex\attachments\*/pasted-text.txt`.
- Hash prompt-like files and dedupe by hash.
- Classify as `current_prompt`, `duplicate`, `legacy_excluded`,
  `reference_only`, `secret_risk`, or `unrelated`.
- Write `ops/prompt-intake/prompt-register.jsonl`.
- Emit a Markdown report with unmapped/new prompt sources.
- For every current prompt, require or infer `cycle_id`, `workstream_id`,
  status, handoff path, task link, blocker, and proof path.
- Add `npm run prompts:audit`.

## Guardrails

- Do not store raw secret values, access codes, credentials, or private keys in
  the register.
- Secret-looking files should be routed to the BNA keyholder workflow.
- Do not reactivate GHL/LeadConnector runtime from legacy prompt files.
- Do not mark app-visible work done until deploy and live Railway smoke pass.
