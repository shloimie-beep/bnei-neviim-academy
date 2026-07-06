# ChatGPT Dropoff Status And One Time Audit Setup - 2026-07-06

## Raw intake

Source: `RAW-20260706-903`

Shloimie asked Codex to inspect the actual repo/workflow status before he gives
ChatGPT Agent Mode a broad One Time Mishnah Class audit prompt. He wants a
no-paste workflow where ChatGPT can drop audit packets into GitHub/repo-visible
space and Codex/agents can pick them up automatically.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-903 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-chatgpt-dropoff-status-and-onetime-audit-setup.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Status |
|---|---|---|---|---|---|---|---|
| REQ-20260706-903 | Audit the current ChatGPT-to-Codex dropoff workflow and report what is actually wired versus blocked. | RAW-20260706-903 | bna_platform / agent_ops | Codex | workflow audit | high | Done |
| REQ-20260706-904 | Identify the safest handoff mode for ChatGPT Agent Mode outputs before creating the One Time audit prompt series. | RAW-20260706-903 | bna_platform / agent_ops | Codex | workflow recommendation | high | Done |
| REQ-20260706-905 | Prepare the next prompt series around the canonical One Time Mishnah target and correct scope invariants. | RAW-20260706-903 | rabbi_sheller_provider / one_time_mishnah_class | Codex then ChatGPT Agent Mode | prompt planning | high | Pending |
| REQ-20260706-906 | Provide a tiny ChatGPT Agent Mode smoke prompt to prove whether that exact session can create a repo-visible packet or marked GitHub comment. | RAW-20260706-903 | bna_platform / agent_ops | Codex | workflow smoke | high | Done |

## Current findings

| Finding | Evidence | Status |
|---|---|---|
| Repo-file packet mode exists and is documented. ChatGPT should create `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/` with `packet.json`, `RAW.md`, `CODEX_PROMPT.md`, `MANIFEST.json`, and `status.json`. | `ops/chatgpt-ramble-dropoff/README.md`, `CHATGPT-DIRECTIVE.md`, `templates/`, `package.json` scripts | Works if ChatGPT has a repo/PR write surface |
| GitHub-comment fallback exists. Marked comments with `BNA_CHATGPT_DROPOFF_PACKET` can be materialized into packet folders. | `scripts/chatgpt-dropoff-comment-collector.mjs`, `ops/chatgpt-ramble-dropoff/github-comment-template.md` | Works for trusted authors; targeted PR #90 smoke comment was already collected |
| Ingestor exists and queues valid ready packets as Codex-owned jobs via the app task API. | `scripts/chatgpt-dropoff-ingestor.mjs`; `npm run chatgpt:dropoff:scan` | Current inbox has only terminal smoke packet `chatgpt-dropoff-smoke-test-20260705-001` |
| Agent fleet hook exists and says ChatGPT dropoff ingest/comment collect are enabled. | `scripts/agent-fleet-supervisor.mjs`; `npm run agent:fleet:status` | Enabled but supervisor is currently not running |
| Focused regression tests pass. | `node --test tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-comment-collector.test.js tests/agent-fleet-hardening.test.js` | PASS 15/15 |
| Broad GitHub comment scanning is not fully reliable as a live poll in this run. | `npm run chatgpt:dropoff:comments:scan` | Failed once with GitHub TLS handshake timeout while walking recent issue comments |
| Targeted GitHub comment scan works. | `npm run chatgpt:dropoff:comments:scan -- --url https://github.com/shloimie-beep/bnei-neviim-academy/pull/90#issuecomment-4885699190` | Found the marked packet and reported `already_collected` |
| A local no-op packet shape validates without queueing. | Temporary packet `chatgpt-dropoff-smoke-test-20260706-903`; `npm run chatgpt:dropoff:scan -- --packet chatgpt-dropoff-smoke-test-20260706-903` | Returned `ready_dry_run`, findings `[]`; temporary packet was removed so it cannot be accidentally queued |
| Standard ChatGPT GitHub app should be treated as read-only for normal consumer/workspace use. | OpenAI Help Center says the GitHub app lets ChatGPT read/analyze/search; direct code edits/pushes are a Codex product path. | Do not assume ordinary ChatGPT can create packet files |
| Real passwords should not be baked into prompts. | `docs/agent-browser-harness.md`; dropoff safety docs; repo privacy rules | Use test identities, review links, keyholder/secret aliases, or owner takeover/login flow instead |

## One Time target/link facts for next prompt

| Surface | Link | Status |
|---|---|---|
| Canonical One Time public root | `https://join.onetimeonetime.com/` | Live 200, title `Your Child Can Love Learning Mishnayos | OneTimeOneTime` |
| Canonical One Time public funnel | `https://join.onetimeonetime.com/one-time` | Live 200, expected headline present |
| Parent review surface | `https://join.onetimeonetime.com/parent.html?review=one-time` | Live 200 |
| Student review surface | `https://join.onetimeonetime.com/student.html?review=one-time` | Live 200 |
| Classroom review surface | `https://join.onetimeonetime.com/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS` | Live 200 |
| Existing Agent Review Hub | `https://bneineviimacademy.org/operations/agent-review` | Existing BNA review hub |
| Existing Agent Review dropoff form | `https://bneineviimacademy.org/operations/agent-review/dropoff?...` | Live 200 but requires Operations sign-in/takeover |

## Recommended next prompt packet series

Do not send one giant implementation prompt. Start with audit packets:

1. `00-control-tower`: register scope, canonical URLs, roles, credentials policy,
   packet IDs, evidence expectations, and dropoff mode.
2. `01-current-state-visual-audit`: screenshot/DOM/navigation audit across
   public, parent, student, classroom/member, Rabbi/provider admin, and
   Operations backend surfaces.
3. `02-scope-and-data-leakage`: contacts/WhatsApp/WAPI, communications, tasks,
   student/parent/provider records, payments/access, private responses, and
   integration diagnostics.
4. `03-navigation-ia-filters`: sidebar categories, top tabs/subcategories,
   filters, selected states, mobile overflow, labels, and dead-end links.
5. `04-studio-classroom-content`: Studio presence, class media/library,
   classroom workflow, question/moderation/support path, and no raw recording
   exposure.
6. `05-cross-role-portals`: parent, student, provider/Rabbi, wrong-role, and
   logged-out behavior.
7. `06-production-readiness-final-regression`: click everything safe, classify
   remaining blockers, and produce Codex-ready repair packets.

## Agent Mode smoke prompt

Use:

- `ops/prompt-packets/2026-07-06-chatgpt-dropoff-smoke-agent-mode/00-smoke-prompt.md`

Expected result:

- If ChatGPT Agent Mode has repo-file/PR write access, it creates only the
  smoke packet folder.
- If it cannot write repo files but can comment, it posts a marked
  `BNA_CHATGPT_DROPOFF_PACKET` comment on PR #90.
- If it cannot write either way, it returns `CANNOT_WRITE_GITHUB` with the
  permission error.
- After a comment URL exists, Codex should run targeted comment scan/apply
  against that exact URL before broad polling.

## Status answer

The no-paste workflow is mostly built, but it is not magic by itself:

- If ChatGPT can write repo files or open a PR, use repo-file packet mode.
- If ChatGPT cannot write repo files, use a marked GitHub issue/PR comment with
  full file blocks.
- Codex can collect either mode, but the fleet must be running or a manual
  `chatgpt:dropoff:*:apply` command must run.
- Broad comment polling may hit GitHub API/network timeouts; targeted comment
  URLs are safer and should be included when possible.
- Do not put real credentials in prompt text. Use review links/test identities
  or an owner takeover/login flow.

## Verification

| Command/check | Result |
|---|---|
| `npm run chatgpt:dropoff:scan` | PASS; one terminal packet skipped as `done_verified` |
| `npm run chatgpt:dropoff:comments:scan` | FAILED once due GitHub TLS handshake timeout |
| `npm run chatgpt:dropoff:comments:scan -- --url https://github.com/shloimie-beep/bnei-neviim-academy/pull/90#issuecomment-4885699190` | PASS; marked packet already collected |
| `npm run agent:fleet:status` | PASS; supervisor not running; dropoff ingest/comment collect enabled |
| `node --test tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-comment-collector.test.js tests/agent-fleet-hardening.test.js` | PASS 15/15 |
| `npm run chatgpt:dropoff:scan -- --packet chatgpt-dropoff-smoke-test-20260706-903` | PASS dry-run; returned `ready_dry_run`, no findings |
| `gh auth status` | PASS logged in as `shloimie-beep`; token scopes include `repo` |
| Live link readback for One Time root/funnel/review routes | PASS 200 responses for checked routes |

## Closeout notes

- The later `RAW-20260706-904` cleanup pass resolved the unrelated append-only
  merge conflicts and folded this audit into `memory/2026-07-06.md`,
  `ops/agent-task-ledger.jsonl`, and `ops/agent-changelog.md`.
- Commit/push is handled by the `RAW-20260706-904` cleanup branch closeout.
