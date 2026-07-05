# ChatGPT To Codex Dropoff Workflow - 2026-07-03

## Raw intake

Source: `RAW-20260703-005`

Operator wants ChatGPT to be able to write implementation packets to a place
Codex can pick up without the operator manually pasting large outputs. The
preferred mental model is ChatGPT leaving repo/GitHub-visible comments or
packets, and Codex treating those packets as task input.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260703-005 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-03-chatgpt-to-codex-dropoff-workflow.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260703-501 | Preserve the operator request as raw intake and register the handoff workflow. | RAW-20260703-005 | app_wide / agent_ops | Codex | workflow | P1 | 1 | none | Raw file and requirement register exist with clear parsed intent. | `raw-input/RAW-20260703-005-chatgpt-to-codex-dropoff-workflow.md`, this file | no | Done |
| REQ-20260703-502 | Create a repo-visible ChatGPT dropoff inbox and packet templates. | RAW-20260703-005 | app_wide / agent_ops | Codex | workflow | P1 | 1 | none | `ops/chatgpt-ramble-dropoff/` documents the workflow and includes required packet templates. | `ops/chatgpt-ramble-dropoff/**` | no | Done |
| REQ-20260703-503 | Define how GitHub comments fit into the workflow without turning free-form comments into blind auto-apply instructions. | RAW-20260703-005 | app_wide / agent_ops | Codex | workflow | P1 | 1 | existing `scripts/intake-github.mjs` | GitHub comment template exists and explains trusted source, dry-run intake, and status posting boundaries. | `ops/chatgpt-ramble-dropoff/github-comment-template.md`, `ops/chatgpt-ramble-dropoff/README.md` | no | Done |
| REQ-20260703-504 | Record the remaining external write-channel gap. | RAW-20260703-005 | app_wide / agent_ops | Codex | automation | P2 | future | operator must choose where ChatGPT can write if it cannot create repo files | Register records that GitHub comment pickup is collectable after REQ-20260703-508, while Drive-only pickup still requires a separate watcher/connector. | this file | no | Done for GitHub comments; Drive remains future |
| REQ-20260703-505 | Clarify that repo-visible packet files are preferred over comments when ChatGPT can write to the repo. | RAW-20260703-006 | app_wide / agent_ops | Codex | workflow | P1 | 1 | REQ-20260703-502 | A short directive tells ChatGPT to use repo-file mode first, GitHub comment mode second, and chat output only as last resort. | `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`, `ops/chatgpt-ramble-dropoff/README.md` | no | Done |
| REQ-20260703-506 | Make repo-visible ChatGPT packet pickup automatic through the existing agent fleet. | RAW-20260703-007 | app_wide / agent_ops | Codex | automation | P1 | 1 | REQ-20260703-502, REQ-20260703-505 | Agent fleet scans ready packet folders, validates/dedupes them, creates Codex-owned observable tasks/jobs, starts in watch mode with dropoff ingest enabled, and registers a Windows login startup fallback when Task Scheduler is denied. | `scripts/chatgpt-dropoff-ingestor.mjs`, `scripts/agent-fleet-supervisor.mjs`, `scripts/register-agent-fleet-startup.ps1`, `scripts/run-agent-fleet-startup.vbs`, `package.json`, `.env.example`, `tests/chatgpt-dropoff-ingestor.test.js`, `tests/agent-fleet-hardening.test.js`, `ops/chatgpt-ramble-dropoff/README.md` | no | Done |
| REQ-20260703-507 | Make the automatic ChatGPT dropoff workflow canonical in the agent read-order docs. | RAW-20260703-008 | app_wide / agent_ops | Codex | workflow | P1 | 1 | REQ-20260703-502, REQ-20260703-506 | `AGENTS.md`, `BNA-START-HERE.md`, and the dropoff docs all point to the same read order and packet workflow without promising ordinary ChatGPT access to local files. | `AGENTS.md`, `BNA-START-HERE.md`, `ops/chatgpt-ramble-dropoff/README.md`, `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`, `raw-input/RAW-20260703-008-chatgpt-dropoff-canonical-agent-md.md` | no | Done |
| REQ-20260703-508 | Add a GitHub-comment fallback collector for ChatGPT connectors that cannot write repo files. | RAW-20260703-010 | app_wide / agent_ops | Codex | automation | P1 | 1 | REQ-20260703-506, REQ-20260703-507 | ChatGPT can post a marked issue/PR comment with full packet file blocks; Codex collector materializes trusted comments into `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/`; the normal ingestor then validates and queues. | `scripts/chatgpt-dropoff-comment-collector.mjs`, `package.json`, `scripts/agent-fleet-supervisor.mjs`, `.env.example`, `ops/chatgpt-ramble-dropoff/github-comment-template.md`, `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`, `ops/chatgpt-ramble-dropoff/README.md`, `tests/chatgpt-dropoff-comment-collector.test.js`, `tests/agent-fleet-hardening.test.js` | no | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260703-501 | Which external write channel should ChatGPT use when it cannot write repo files? | Whether ChatGPT has permission to create repo files/PRs, GitHub issue comments, or Drive files. | Operator | Prefer repo-file/PR packet writes into `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/`; if repo writes fail with 403, use marked GitHub comment mode with full packet file blocks. | Google Drive folder; manual file drop into repo. | Repo-file packet pickup is automatic once files appear. Marked trusted GitHub comments are now collectable into packet folders. Drive-only pickup still needs a connector/watcher. | Use repo-file mode when available; otherwise post a marked GitHub issue/PR comment with complete file blocks. | REQ-20260703-504 | Decided for GitHub comments; Drive remains future decision |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260703-501 | Raw/register files | Create raw intake and register. | File inspection. | pending | pending | not required |
| REQ-20260703-502 | `ops/chatgpt-ramble-dropoff/` | Add README, incoming inbox, templates, and pickup checklist. | File inspection. | pending | pending | not required |
| REQ-20260703-503 | GitHub comment template | Add a structured comment marker and explain use with existing GitHub intake dry-run. | File inspection. | pending | pending | not required |
| REQ-20260703-504 | Decision row | Keep auto-pickup blocked until a real external write channel is authorized. | Register decision. | pending | pending | not required |
| REQ-20260703-505 | ChatGPT directive | Add a direct instruction file with repo-file, comment, and chat-output modes. | File inspection. | pending | pending | not required |
| REQ-20260703-506 | Dropoff ingestor, fleet hook, and login startup | Add ingestor script, npm commands, env switches, tests, supervisor pre-claim hook, and Windows login launcher; start agent fleet watcher. | Syntax checks, focused tests, dry scan, fleet status/readback, log inspection, startup fallback readback. | pending | pending | not required |
| REQ-20260703-507 | Canonical docs/read order | Add the dropoff docs to `AGENTS.md` source-of-truth, add explicit read order, update `BNA-START-HERE.md`, and make the directive/README self-contained. | File inspection, grep readback, diff check. | pending | pending | not required |
| REQ-20260703-508 | GitHub comment collector | Add collector script, npm commands, fleet pre-ingest hook, trusted author settings, full-file comment template, and tests. | Syntax checks, focused tests, dry comment scan, fleet status/readback. | pending | pending | not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260703-501 | Done | Raw file and this register exist. | `raw-input/RAW-20260703-005-chatgpt-to-codex-dropoff-workflow.md`, this file | File inspection | none |
| REQ-20260703-502 | Done | Dropoff folder and templates created. | `ops/chatgpt-ramble-dropoff/**` | File inspection | none |
| REQ-20260703-503 | Done | GitHub comment template created and README explains comment-vs-packet boundary. | `ops/chatgpt-ramble-dropoff/github-comment-template.md`, `ops/chatgpt-ramble-dropoff/README.md` | File inspection | none |
| REQ-20260703-504 | Done for GitHub comments; Drive future | Decision `DEC-20260703-501` records repo-file mode first and marked GitHub comment mode second. | this file | Register inspection | Drive-only pickup still needs a separate watcher/connector if used. |
| REQ-20260703-505 | Done | `CHATGPT-DIRECTIVE.md` states repo-file mode is preferred, comments are fallback, and chat output is last resort. | `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`, `ops/chatgpt-ramble-dropoff/README.md`, `raw-input/RAW-20260703-006-chatgpt-repo-write-preferred.md` | File inspection | none |
| REQ-20260703-506 | Done | Ingestor validates ready packets, blocks unsafe packets, queues Codex-owned tasks/jobs through `/api/bna/tasks/create-from-text`, and is called by `agent:fleet` before queue claim. Fleet watcher started as PID 21636. `npm run agent:fleet:register-startup` installed the current-user Startup fallback at `C:\Users\User\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\BNA-Agent-Fleet.vbs` after Windows denied scheduled-task creation. | `scripts/chatgpt-dropoff-ingestor.mjs`, `scripts/agent-fleet-supervisor.mjs`, `scripts/register-agent-fleet-startup.ps1`, `scripts/run-agent-fleet-startup.vbs`, `package.json`, `.env.example`, `tests/chatgpt-dropoff-ingestor.test.js`, `tests/agent-fleet-hardening.test.js`, `ops/chatgpt-ramble-dropoff/README.md`, `raw-input/RAW-20260703-007-chatgpt-dropoff-fully-automatic.md` | `node --check scripts/chatgpt-dropoff-ingestor.mjs`; `node --check scripts/agent-fleet-supervisor.mjs`; `node --test tests/chatgpt-dropoff-ingestor.test.js tests/agent-fleet-hardening.test.js`; `npm run chatgpt:dropoff:scan`; `npm run agent:fleet:status`; `npm run agent:fleet:register-startup`; Startup runner readback; agent-fleet logs clean; `npm test` 1498/1498 passed | Repo-visible packet-file pickup is automatic. Marked trusted GitHub comments are collected by REQ-20260703-508. Drive-only pickup remains future watcher work if needed. |
| REQ-20260703-507 | Done | `AGENTS.md` lists the dropoff README/directive as source-of-truth files, defines the BNA read order, and names repo-file packet mode as the canonical automatic workflow. `BNA-START-HERE.md`, `CHATGPT-DIRECTIVE.md`, and the dropoff README now point to the same workflow. | `AGENTS.md`, `BNA-START-HERE.md`, `ops/chatgpt-ramble-dropoff/README.md`, `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`, `raw-input/RAW-20260703-008-chatgpt-dropoff-canonical-agent-md.md` | File inspection; `rg` readback; `git diff --check` on touched docs | Ordinary ChatGPT still needs repo/GitHub access or the directive pasted/provided before it can see these files. |
| REQ-20260703-508 | Done | GitHub comment collector can parse marked full-file comments, materialize trusted comments into local packet folders, and runs before the file ingestor in the agent fleet. Template/directive now explicitly reject local ChatGPT ZIP links as the only handoff. | `scripts/chatgpt-dropoff-comment-collector.mjs`, `tests/chatgpt-dropoff-comment-collector.test.js`, `scripts/agent-fleet-supervisor.mjs`, `tests/agent-fleet-hardening.test.js`, `package.json`, `.env.example`, `ops/chatgpt-ramble-dropoff/github-comment-template.md`, `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`, `ops/chatgpt-ramble-dropoff/README.md`, `raw-input/RAW-20260703-010-chatgpt-github-comment-dropoff-fallback.md` | `node --check scripts/chatgpt-dropoff-comment-collector.mjs`; `node --check scripts/chatgpt-dropoff-ingestor.mjs`; `node --check scripts/agent-fleet-supervisor.mjs`; `node --test tests/chatgpt-dropoff-comment-collector.test.js tests/chatgpt-dropoff-ingestor.test.js tests/agent-fleet-hardening.test.js` 13/13; `npm run chatgpt:dropoff:comments:scan` checked 35 comments and found 0 marked comments; `npm run chatgpt:dropoff:scan` packet_count=0 queued_count=0; `npm run agent:fleet:status` reports comment collect enabled; `npm test` 1502/1502 | Drive-only dropoff still needs a separate watcher if used. |
