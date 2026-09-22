# ChatGPT Directive For Repo-Visible Dropoff

Give ChatGPT this directive when you want it to hand work to Codex without
pasting the whole output back into Codex chat.

If you are a GitHub-connected ChatGPT session with repo access, first read:

```text
BNA-START-HERE.md
AGENTS.md
MEMORY.md
ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md
ops/chatgpt-ramble-dropoff/README.md
ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md, if present
```

This directive is the canonical handoff instruction for no-paste
ChatGPT-to-Codex work in this repo.

Important: Codex can only automatically collect work that is visible from the
repo or a marked GitHub issue/PR comment. A local ChatGPT download, ZIP, or
`/mnt/data` path is not enough.

## Preferred: Repo-File Mode

Use this if ChatGPT can create files in the GitHub repo or open a PR.

```text
You are preparing a repo-visible implementation packet for Codex.

Do not edit production app/source files directly. Create a new packet folder
only:

ops/chatgpt-ramble-dropoff/incoming/CHATGPT-DROPOFF-YYYYMMDD-###/

Inside that folder, create:

- packet.json
- RAW.md
- CODEX_PROMPT.md
- MANIFEST.json
- status.json
- PATCHES.md, if you generated code
- attachments/, only if needed

Use the templates in:

ops/chatgpt-ramble-dropoff/templates/

Set `status.json` to:

ready_for_codex_audit

Fill these lane fields when known:

- `packet_type`
- `packet_role`
- `lane_key`
- `owner`
- `workspace`
- `project`
- `scope_summary`
- `out_of_scope`
- `acceptance_criteria`
- `tests_expected`
- `known_blockers`
- `next_action`

Put generated code or diffs in PATCHES.md. Codex will inspect the actual repo,
adapt the code, apply it if valid, run tests, and record proof.

Do not include secrets, API keys, passwords, raw private contact exports,
unredacted private screenshots, payment data, or raw private message bodies.

If opening a PR, the PR should contain only the dropoff packet folder unless
Codex explicitly asked for a different branch shape.

Do not create a duplicate packet if `CONTROL-TOWER.md` already shows the same
lane as ready, queued, auditing, blocked, or done. Update the existing packet or
create a dependent follow-up packet.
```

## Sidekick Memory / Preference Mode

Use this when Shloimie tells ChatGPT durable preferences, operating rules,
context about him, product direction, or "remember this" style information.

```text
Create a normal dropoff packet, but set packet.json fields like:

"packet_type": "memory_candidate"

or:

"packet_type": "preference_update"

Do not directly edit MEMORY.md, AGENTS.md, or source files unless Codex asked
for that exact patch. Preserve the raw source in RAW.md, then list proposed
memory/promotions in CODEX_PROMPT.md with:

- exact source quote or paraphrase
- whether it belongs in MEMORY.md, AGENTS.md, memory-topics/*.md, TASKS.md, or
  a requirement register
- why it is durable rather than one-off
- privacy/secrets risk
- suggested stable IDs such as MEM-YYYYMMDD-###

Codex will audit the packet, promote only valid durable memory, and record
proof. ChatGPT output is not durable memory until Codex applies it.
```

## Fallback: GitHub Comment Mode

Use this if ChatGPT can only write comments, or if repo-file creation fails
with `403 Resource not accessible by integration`.

```text
Post one GitHub issue or PR comment in this repository using the marker:

BNA_CHATGPT_DROPOFF_PACKET

Follow the template at:

ops/chatgpt-ramble-dropoff/github-comment-template.md

The comment must include the complete contents of these files as fenced
blocks:

- packet.json
- RAW.md
- CODEX_PROMPT.md
- MANIFEST.json
- status.json
- PATCHES.md

Do not link to a local ChatGPT ZIP or /mnt/data path. Codex cannot collect
that. The GitHub comment itself is the dropoff surface.
```

## Last Resort: Chat Output Mode

Use this only if ChatGPT cannot write files or comments.

```text
Output a file tree and full file contents for the packet folder. The operator
or Codex can then place the files under:

ops/chatgpt-ramble-dropoff/incoming/<packet-id>/
```

## Why Repo-File Mode Is Best

Repo-file packets are easiest for Codex to diff, audit, validate, and preserve.
Comments are acceptable, but large code in comments is harder to review and
more likely to lose file boundaries.
