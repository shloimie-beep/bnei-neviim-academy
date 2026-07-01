# Run Rabbi / One Time Visual Audit + Resend Send-Enabled Smoke

Raw input: `RAW-20260701-004`
Source attachment: `C:\Users\User\.codex\attachments\4d24169c-4f81-45f0-8bcf-9559a63d7754\pasted-text.txt`
Branch: `codex/run-rabbi-audit-resend-smoke-20260701`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Scope

Execute the runnable packets from PR #59/#60:

- `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/01-current-state-visual-audit.md`
- `ops/prompt-packets/2026-07-01-provider-config-readback/09-resend-send-enabled-smoke.md`

Also resolve or precisely record the Railway target/deploy blocker.

## Out Of Scope

- No Rabbi UI implementation or redesign.
- No GHL runtime, LeadConnector, external CRM writes, or GHL documentation.
- No bulk email campaign.
- No Stripe run in this packet.
- No DNS mutation.
- No hard delete or production CRM/contact mutation.
- No secret exposure in chat, logs, screenshots, reports, or committed files.

## Requirements

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| `REQ-20260701-401` | Read required source-of-truth files and run preflight commands. | Done | Source files read; preflight/status commands recorded in trace and final closeout. |
| `REQ-20260701-402` | Record runnable packet rule: runnable packets must be executed immediately when authorized and unblocked. | Done | Runnable packet rule recorded in this register and trace. |
| `REQ-20260701-403` | Run Railway target doctor and resolve or precisely record project/service target blocker. | Blocked with target identified | `ops/deploy-readbacks/2026-07-01-railway-target-readback.md`; default env blocked, explicit `skillful-motivation` target probe passes. |
| `REQ-20260701-404` | Execute `01-current-state-visual-audit` without implementing UI fixes. | Done | `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/`; 75 screenshots, 107 automated findings. |
| `REQ-20260701-405` | Verify Resend env/readiness, inbound route, webhook logic, and focused tests by redacted status only. | Done with setup blockers | `ops/provider-config-readbacks/2026-07-01-resend-smoke-readback.*`; webhook secret and persistent sender config remain setup blockers. |
| `REQ-20260701-406` | Run Resend dry-run smoke and one guarded send smoke only if readiness/safe recipient allow it. | Done | Dry-run smoke passed; one guarded Resend test send to official redacted test recipient delivered. |
| `REQ-20260701-407` | Update trace, ledger, changelog, memory-topic, memory, and NEXT-SESSION/handoff records. | Done | `ops/agent-traces/2026-07-01-RAW-20260701-004-rabbi-audit-resend-smoke.*`, ledger/changelog/memory/NEXT-SESSION updated. |
| `REQ-20260701-408` | Run validation, commit, push, PR/merge/deploy where permitted, or record exact blockers. | Validation passed; Git publish pending | `npm run pqc:all`, BNA run validators, secrets audit, JSON/JSONL parse, and `git diff --check` passed. Deploy/live smoke not run because persistent Railway target values are not configured by default. |

## Runnable Packet Rule

When a packet is generated and marked runnable/ready, Codex must execute it immediately if it is within current authorization, does not require a missing credential, does not require a forbidden external write, and does not require unresolved product/legal/privacy/DNS/payment decisions.

If a packet cannot be run, Codex must record the exact blocker, owner, next action, and whether dependent packets can continue. Do not stop at "packet created" when the next packet is explicitly runnable.

## Acceptance Criteria

- Visual audit captures required routes and the 1440, 1024, 768, 430, and 390 viewport set, or records exact route/auth/server blockers.
- Audit report includes VQ-coded findings, route inventory, state-matrix evidence, role/scope checks, brand/pipeline mismatch checks, and recommended next packets.
- Resend report includes redacted env readiness, inbound route status, focused test status, dry-run status, guarded send status, event/readback status, and exact next action.
- Railway target status is either resolved with deploy/live-smoke evidence or blocked with exact missing project/service target.
- No forbidden external action occurs.
- Final status is evidence-backed.
