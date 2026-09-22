# RAW-20260626-004 - Transcript Drive Digest Rebuild Goal Packet

- Source channel: codex_chat
- Source file/message: Codex attachment `pasted-text.txt`
- Raw text path: `raw-input/RAW-20260626-004-transcript-drive-digest-rebuild-source.txt`
- Created at: 2026-06-26
- Parse status: registered
- Privacy classification: internal goal-mode correction packet
- Requirement register: `tasks-pending/2026-06-26-transcript-drive-digest-rebuild.md`
- Execution run: `ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild`
- Related prior raw source: `RAW-20260626-002`
- Related decision: `DEC-20260626-101`

## Raw Operator Intent

Shloimie provided a goal-mode packet requiring the class/transcript/Drive
intake workflow to be rebuilt around Drive/app private raw transcript storage
and GitHub repo-side structured digest memory.

The packet says recordings dropped into Drive must be discovered, titled,
transcribed or linked to existing transcript text, sectioned, labeled,
classified, routed into the correct lanes, and represented in GitHub through
sanitized digests/manifests/indexes rather than raw transcript bodies.

## Parsed Result

- Created active run `2026-06-26-transcript-drive-digest-rebuild`.
- Continued the existing two-week audit evidence under
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/`.
- Kept `DEC-20260626-101` as the blocker for raw transcript-body GitHub export.
- Added a privacy-safe digest exporter and section classifier.
- Generated repo-safe digest memory under `content-memory/transcript-digests/`.

## Guardrails

- No `npm run content:export-transcripts` default raw export.
- No raw transcript bodies committed.
- No stale transcript deletion.
- No production DB mutation.
- No Drive create/update/delete or source-file move.
- No paid retranscription.
- No worker retry.
- No class backfill apply.
- No sends, publishing, charges, DNS, credential rotation, or deployment.
