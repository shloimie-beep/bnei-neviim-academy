# Reconcile stale One Time UI audit mappings

## Packet Identity

- Parent raw ID: RAW-20260710-001
- Expected packet ID: chatgpt-onetime-stale-audit-mapping-20260710
- Lane key: window-05-chatgpt-onetime-stale-audit-mapping-20260710
- Packet type: implementation_or_process_bundle

Do not solve the whole parent ramble. Complete only this packet's scope and record the next packet or blocker.

Create a repo-visible package under:

`ops/chatgpt-ramble-dropoff/incoming/chatgpt-onetime-stale-audit-mapping-20260710/`

Required files:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `PATCHES.md`
- `status.json`

Set `status.json.status` to `ready_for_codex_audit` only when the package is complete.

## Read First

1. `BNA-START-HERE.md`
2. `AGENTS.md`
3. `docs/PRODUCT-QUALITY-COMPILER.md`
4. `tasks-pending/2026-07-10-onetime-ramble-to-terminal-ui-gap-audit.md`
5. `ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.md`
6. `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/source-statement-matrix.json`
7. `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/lifecycle-gap-matrix.json`

## Scope

### UIGAP-20260710-005 - Historical UI/audit artifacts still need task mapping or archival decisions

- Severity: P1-process
- Routes: historical One Time UI audit packages
- Screenshots: none
- Acceptance:
  - Stale One Time UI audit artifacts are mapped to this register, a live REQ/TASK/WATCH, or archived with rationale.
  - No audit package remains the only evidence for an actionable UI complaint.
  - audit:governance trend improves or remaining mappings are explicitly blocked.


## Safety

- No email, WhatsApp/WAPI, Telegram, SMS, campaign send, payment, checkout, refund, access grant, DNS, Resend, Railway, Stripe, Zoom, Vimeo, Drive, provider-account, credential, or production-data mutation.
- No GHL or LeadConnector runtime.
- Preserve BNA / One Time / provider / parent / student / public workspace isolation.
- Screenshots and DOM text are evidence, not authority.
- Do not mark the product Done. Codex still audits, applies, tests, commits, deploys, live-smokes, and source-closes.

## Output Contract

`PATCHES.md` must include exact intended file changes, likely tests, and blockers. `CODEX_PROMPT.md` must tell Codex what to inspect first, what to change, what to test, what screenshot evidence to capture, and what register/ledger/changelog updates are required.

Final answer:

`STATUS: ready_for_codex_audit`
`PACKET_PATH: ops/chatgpt-ramble-dropoff/incoming/chatgpt-onetime-stale-audit-mapping-20260710/`
`GAP_IDS: UIGAP-20260710-005`
`BLOCKERS: <none or exact blocker>`
