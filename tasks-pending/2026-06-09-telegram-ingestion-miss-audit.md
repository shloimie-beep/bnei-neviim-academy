# Telegram Ingestion Miss Audit

## Request

The operator says a large Telegram bot message never got ingested. This current
Codex session should not perform the full audit/backfill; it should queue the
work for the autonomous agent fleet.

## Known Evidence

Likely missed messages:
- `memory/2026-06-09.md`, message `645`, chat `8202155026`,
  timestamp `2026-06-09T06:59:42.641Z`.
- `memory/2026-06-09.md`, message `646`, chat `8202155026`,
  timestamp `2026-06-09T06:59:42.997Z`.

Bridge log evidence:
- `.runtime/telegram-kimi-bridge.log` lines around messages `645` and `646`
  show both messages were received and classified as `publish_send` with
  `approval=yes`.
- There is no `Capture summary for chat 8202155026 message 645` or
  `Capture summary for chat 8202155026 message 646` in the bridge log.
- The daily memory has `Telegram Action` entries for both messages, but no
  corresponding structured task capture result after them.

The message content includes several internal/system tasks that should not have
been blocked as external publish/send approval work, including:
- student and parent portal/accountability login structure
- parent meeting recording upload and AI parsing into accountability
- parent chat-window equivalent to the Telegram bot for accountability updates
- internal vs external user filtering and adding Esty Dratler
- deleting a Codex test parent
- DNS/www certificate issue
- Google Workspace sender display name issue
- daily content/prompt work for Shloimie
- kid-to-parent notifications with approve/deny controls
- trimming the black fade/first frame from the Facebook/YouTube admissions video

## Agent-Fleet Scope

1. Confirm whether messages `645` and `646` are the missed ingestion target, and
   scan nearby Telegram logs/memory for any other un-ingested actionable message
   in the same incident window.
2. Audit root cause in `scripts/telegram-kimi-bridge.mjs` and related intent
   helpers. Preliminary hypothesis: the intent planner treated messages with
   words like WhatsApp/Facebook/transcript as external `publish_send` work and
   skipped the normal capture path.
3. Backfill the missed message into clean records:
   - Create concise visible tasks with polished titles.
   - Preserve raw text only as provenance in memory/task metadata.
   - Split Shloimie-owned tasks vs Codex-owned machine tasks correctly.
   - Avoid exposing raw ramble wording in visible titles.
4. Fix the ingestion/routing gap if code changes are needed so mixed internal
   work is still captured even when a message also mentions publish/send terms.
5. Add focused tests for this failure mode.
6. If app-visible/server-visible behavior changes, deploy to Railway, run doctor
   and live smoke, then mark the live task done only after verification.
7. Send a concise Telegram completion report with what was missed, why, what was
   backfilled, and what was fixed/verified.

## Acceptance Criteria

- The agent produces an audit note/report with exact message IDs, timestamps,
  and root cause.
- All actionable items from the missed message are represented as clean live
  tasks or explicitly marked as already covered by existing tasks.
- The bridge no longer drops internal task capture just because the same message
  mentions WhatsApp, Facebook, transcript, publish, send, or approval-sensitive
  words.
- Tests cover the `publish_send` false-positive path for large mixed internal
  rambles.
- The operator receives a Telegram summary after completion.
