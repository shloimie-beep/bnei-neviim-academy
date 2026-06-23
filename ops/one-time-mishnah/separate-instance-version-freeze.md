# Separate One Time Instance Version Freeze

Date: 2026-06-21T21:13:00+03:00
Requirement: REQ-20260619-313
Authorization source: `raw-input/RAW-20260621-003-one-time-separate-instance-authorization.md`

## Branch And Source

- Branch: `codex/agent-control-center-20260619`
- Starting local HEAD: `85e2faf8253a2fd6bd8eade9949231d0b52456c2`
- Starting remote HEAD: `85e2faf8253a2fd6bd8eade9949231d0b52456c2`
- PR: #5, open draft, head branch `codex/agent-control-center-20260619`
- Prior stable shared Railway app commit: `34c74f22145a4422777515b740b8e33eef3f539d`
- Prior successful shared Railway deployment: `48cf7b0e-5623-43a3-9c5a-278e4d8b7997`

## Selected Deployable Version

Deploy the current canonical branch checkpoint for the One Time separate
instance. This checkpoint includes the stable app bundle from PR #5 plus the
single-tenant identity correction that keeps:

- workspace key: `rabbi_sheller_provider`
- project key: `one_time_mishnah_class`

Version marker to create after committing this checkpoint:
`onetime-pilot-review-2026-06-21`.

## Baseline Verification

- `node --test tests/instances/w4-onetime-instance.test.js tests/one-time-deployment-readiness.test.js`: 11/11 pass
- `npm test`: 1018/1018 pass
- `npm run bna:run:validate`: pass
- `npm run watchdog:actions`: pass, 0 findings, report `ops/watchdog-audits/2026-06-21T18-13-watchdog-action-audit.md`
- `npm run watchdog:security`: pass, 0 findings, report `ops/watchdog-audits/2026-06-21T18-13-watchdog-security-routes.md`
- `node scripts/audit-secrets.mjs`: pass, 3953 tracked paths checked, 0 tracked secret-risk files found
- `git diff --check`: pass with line-ending warnings only

## Dirty Worktree Notes

The worktree had pre-existing unrelated generated/content artifacts before this
requirement resumed. They are intentionally not part of the One Time separate
instance checkpoint.

## Guardrails

No Railway provisioning, Railway variable write, DNS write, database clone,
email/WhatsApp send, billing charge, Zoom meeting creation, Vimeo upload, GHL
runtime introduction, BNA private data copy, or secret print occurred during
this freeze.
