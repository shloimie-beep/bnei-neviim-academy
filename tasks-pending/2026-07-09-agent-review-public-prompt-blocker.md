# Ramble Intake - 2026-07-09 - Agent Review Public Prompt Blocker

## Raw Intake

Agent Mode was asked to run the Rabbi helper tool scope map audit. It opened
`https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-helper-tool-scope-map`,
the protected Operations hub remained blank or inaccessible, and the run ended
without auditing.

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-006 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-09-agent-review-public-prompt-blocker.md` |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-027 | Preserve the failed Agent Mode run as raw intake and a dated requirement register before implementation closeout. | RAW-20260709-006 | BNA operations / Rabbi One Time | Codex | protocol | P0 | 1 | none | Raw input file, memory entry, and this register exist with source provenance. | `raw-input/RAW-20260709-006-agent-review-public-prompt-blocker.md`, `memory/2026-07-09.md`, this file | no | Done / local verified |
| REQ-20260709-028 | Update generated Agent Review prompts so Agent Mode starts from the public prompt URL and treats protected hub blank/401/sign-in failures as `hub_unavailable_401` evidence, not as a reason to stop before testing. | RAW-20260709-006 | BNA operations / Rabbi One Time | Codex | agent-review | P0 | 1 | REQ-20260709-027 | Generated prompts include public-first instructions, `hub_unavailable_401`, and result payload fields for hub auth state. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/*.md`, `docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md` | yes | Done / local verified / deploy pending |
| REQ-20260709-029 | Expose only the required read-only Rabbi helper scope artifacts publicly for Agent Mode runs without repo filesystem access. | RAW-20260709-006 | BNA operations / Rabbi One Time | Codex | agent-review | P0 | 1 | REQ-20260709-028 | Public artifact URLs exist for the generated scope map JSON/markdown and account-scope template; tests check existence and obvious secret-like strings. | `scripts/generate-agent-review-prompts.cjs`, `public/agent-review-artifacts/*` | yes | Done / local verified / deploy pending |
| REQ-20260709-030 | Verify, push, deploy, and live-smoke the corrected public prompt path so Shloimie can paste the working URL into Agent Mode. | RAW-20260709-006 | BNA operations / Rabbi One Time | Codex | verification | P0 | 1 | REQ-20260709-028, REQ-20260709-029 | Focused tests pass, prompt/artifact URLs return 200 live, and the exact working Agent Mode link is reported. | tests, live curl/readback, changelog/ledger | yes | Open / local verified / deploy pending |

## Parsed Tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260709-008 | agent-review-public-prompt-mode | Fix Agent Review prompt launch path for browser-only Agent Mode | Codex | BNA operations / Rabbi One Time | RAW-20260709-006 | REQ-20260709-028, REQ-20260709-029, REQ-20260709-030 | Commit/push the local fix, deploy to OneTime Railway, live-readback the public prompt/artifact URLs, and provide the working public prompt link. | repo/process | Open / local verified / deploy pending |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260709-027 | Done / local verified | Raw/register created and memory entry added. | `raw-input/RAW-20260709-006-agent-review-public-prompt-blocker.md`, `memory/2026-07-09.md`, this file | File readback completed. | none |
| REQ-20260709-028 | Done / local verified / deploy pending | Generated prompts now open public prompt first, preserve `Click Start Audit / I started this agent mode`, include `hub_unavailable_401`, and include `hub_auth_state` in the result payload. | `src/lib/bna/agent-review-hub.js`, `docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md`, generated prompt files | PASS `npm run agent-review:prompts`; PASS `node --test tests/agent-review-hub.test.js`; PASS full `npm test` 1687/1687. | Deploy/live readback pending. |
| REQ-20260709-029 | Done / local verified / deploy pending | Generated public artifacts exist for Rabbi scope map JSON/markdown and account-bot scope template. | `scripts/generate-agent-review-prompts.cjs`, `public/agent-review-artifacts/*`, `ops/route-registry.json` | PASS artifact secret-like scan for token/key/cookie/bearer patterns; PASS `npm run secrets:audit`. | Deploy/live readback pending. |
| REQ-20260709-030 | Open / local verified / deploy pending | OneTime deployment `36874255-af07-47a8-a41a-0f8919af801b` succeeded for the prior account-scope batch before this prompt-fix batch; public prompt batch still needs its own push/deploy/readback. | tests, live curl/readback, changelog/ledger | PASS local tests and checks; live readback pending. | Commit/push/deploy/live smoke still required. |

## Local Verification

- Regenerated 18 Agent Review prompts and 3 public artifacts with
  `npm run agent-review:prompts`.
- Public-first prompt instructions now tell Agent Mode to open
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md`
  before trying the protected Operations hub.
- Protected hub blank/401/sign-in failures are recorded as
  `hub_unavailable_401` instead of stopping the audit before route checks.
- The Rabbi helper scope prompt now includes public artifact URLs for:
  `rabbi-one-time-tool-scope-map.json`,
  `rabbi-one-time-tool-scope-map.md`, and
  `account-bot-scope-template.json`.
- Verification passed:
  `node --check scripts/generate-agent-review-prompts.cjs`;
  `node --check src/lib/bna/agent-review-hub.js`;
  `npm run agent-review:prompts`;
  `node --test tests/agent-review-hub.test.js`;
  `node --test tests/rabbi-helper-tool-scope-map.test.js`;
  full `npm test` 1687/1687;
  `npm run secrets:audit`;
  `npm run watchdog:protocol-drift`;
  `git diff --check` with line-ending warnings only.
