# Rabbi Scheller Closeout Preservation Audit

| Field | Value |
|---|---|
| Generated | 2026-06-24 |
| Source worktree | `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` |
| Source branch | `codex/service-provider-studio-integration-20260623` |
| Source HEAD before preservation | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| Preservation branch | `codex/preserve-rabbi-closeout-20260624` |
| Raw source | `RAW-20260623-002` |
| Control source | `RAW-20260624-002` / `REQ-20260624-013` |
| External writes | None |
| Production deploy | Not attempted |

## Summary

The dirty `service-provider-studio-integration` worktree contains unique local
Rabbi Scheller / One Time closeout work that is not fully represented by PR
#14 or PR #15. PR #15 covers Rabbi auth/navigation/deployment evidence. This
local closeout covers the provider workspace review surface, One Time
student/parent/classroom/email review copy, badge and reward scope, test
contracts, and closeout evidence.

The preservation decision is to commit the local bundle unchanged, after
validation, to `codex/preserve-rabbi-closeout-20260624` so the clean
integration branch can merge and resolve it deliberately.

## Files To Preserve

| Path | Status | Reason |
|---|---|---|
| `config/service-provider-sites/one-time.json` | Preserve | Normalizes Rabbi Scheller/One Time provider copy and login-facing metadata. |
| `ops/agent-changelog.md` | Preserve | Records local QA and closeout evidence for the Rabbi workspace/badge work. |
| `ops/agent-task-ledger.jsonl` | Preserve | Adds machine-readable task trail records `1304` and `1305`. |
| `public/css/one-time-shared-review.css` | Preserve | Adds provider workspace/sidebar/review styling needed by the local closeout. |
| `public/one-time-classroom.html` | Preserve | Updates classroom review copy/scope for Rabbi Scheller. |
| `public/one-time-email-review.html` | Preserve | Updates email review copy/scope for Rabbi Scheller. |
| `public/one-time/index.html` | Preserve | Updates public funnel copy and review-safe messaging. |
| `public/parent.html` | Preserve | Updates parent review copy and One Time scope boundaries. |
| `public/provider.html` | Preserve | Adds provider workspace modules for Users, CRM, Content, Automations, Badges, Settings, and read-only Rabbi view copy. |
| `public/student.html` | Preserve | Adds One Time student boundary copy, badges/rewards scope, and `No bot / no BNA goals` guardrail. |
| `server.js` | Preserve | Wires shared review data response fields used by the updated review surfaces. |
| `src/platform/instances/one-time-shared-review-data.js` | Preserve | Adds workspace users, login access, CRM, content, automations, settings, student boundary, and badge system data. |
| `tasks-pending/2026-06-22-one-time-assets-funnel-vimeo-email-stripe-view-as-rabbi.md` | Preserve | Carries the final evidence/continuation state for the local closeout. |
| `tests/one-time-focused-landing.test.js` | Preserve | Updates landing test expectations for current One Time copy. |
| `tests/one-time-product-system.test.js` | Preserve | Updates product contract expectations for current Rabbi/One Time model. |
| `tests/one-time-shared-review-branding.test.js` | Preserve | Adds coverage for workspace/badge/student-boundary review data. |
| `raw-input/RAW-20260623-002-one-time-rabbi-workspace-student-scope-badges.md` | Preserve | Raw provenance for the local closeout bundle. |
| `ops/worktree-reconciliation/2026-06-24-rabbi-closeout-preservation.md` | Preserve | This preservation audit. |
| `ops/worktree-reconciliation/2026-06-24-rabbi-closeout-preservation.json` | Preserve | Machine-readable preservation audit. |

## Duplicate Or Superseded Review

| Source | Finding | Decision |
|---|---|---|
| PR #14 `f9625e8c15e0a63a272582e839bf42b100cd6714` | Includes PR #12/#13 history and owner-review/navigation integration work. | Not a duplicate of this local closeout; merge later in clean integration branch. |
| PR #15 `1ab57eac802ef172a5e96651dabc203d3420cbd9` | Covers Rabbi Scheller auth/navigation and deployment evidence; Railway metadata only proves deploy of `8f8b0b45`. | Not a duplicate of this local closeout; merge later and keep PR #15 deploy evidence distinct from local UI/data/test work. |
| Local generated assets | No unrelated binary/render output staged for this preservation branch. | Preserve only tracked implementation/evidence files plus the raw intake file and this audit. |
| Secrets/API keys | No secret file paths identified in the local file list. | Run staged leak scan and `npm run secrets:audit` before commit. |

## Validation Already Run Before Preservation

| Check | Result |
|---|---|
| `node --test tests/one-time-focused-landing.test.js tests/one-time-shared-review-branding.test.js tests/one-time-product-system.test.js tests/parent-student-polish-contract.test.js tests/portal-toolbar-overview-ux.test.js` | Passed, 20/20 tests. |
| `node --test tests/one-time-review-only-server.test.js tests/one-time-external-user-portal.test.js` | Passed, 37/37 tests. |
| `git diff --check` | Passed; only Windows LF-to-CRLF warnings reported. |
| `npm run secrets:audit` | Passed; 4097 tracked paths, 0 tracked secret-risk files. |
| JSON parse for `config/service-provider-sites/one-time.json` | Passed. |
| JSONL parse for `ops/agent-task-ledger.jsonl` | Passed, 1305 records. |

## Required Before Commit

- Switch to `codex/preserve-rabbi-closeout-20260624`.
- Stage only the listed preservation files.
- Run `git diff --cached --check`.
- Run JSON/JSONL validation against the staged tree.
- Run a staged path leak scan.
- Run `npm run secrets:audit`.
- Commit and push the preservation branch.
