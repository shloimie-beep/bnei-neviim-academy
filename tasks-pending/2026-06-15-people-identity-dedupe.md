# WS09 People Identity Dedupe Handoff

## Status

- Local implementation is complete and verified.
- Production Menachem inspection/merge/review is blocked because the configured
  `DATABASE_URL` host did not resolve from the Codex environment.

## Source

- Spec: `C:\Users\User\Downloads\WS09-people-identity-dedupe-codex-spec (1).md`
- Workstream: WS09
- Cycle: `2026-06-15-cycle-ops-queue-helper-integrations`

## Implemented Locally

- Added `src/lib/bna/student-identity-dedupe.js` with pure normalization,
  Menachem Hebrew-English alias expansion, contact masking, evidence labels, and
  conservative match scoring.
- Extended the server identity schema path with canonical student name fields,
  aliases, normalized names, source records, merge history, review status,
  archived duplicate links, alias rows, review tasks, and merge event audits.
- Updated signup ingestion and Operations student create/update to reuse
  high-confidence contact-backed matches and create review tasks for ambiguous
  Hebrew/English name-only candidates.
- Updated accountability intake to resolve student names conservatively.
- Updated Torah seed handling so Menachem aliases and source records are synced
  into the identity fields.
- Added admin APIs for duplicate scanning, identity detail, merge approval,
  rejection, and blocking.
- Added a safe merge function that preserves signups, aliases, source records,
  Torah learning, accountability, parent/device/access, assignment/member,
  provider, assistant thread, Google connection, and Green Invoice webhook links
  where those relationships exist. Source students are archived/inactivated, not
  deleted.
- Added the Operations Students Identity Review panel with masked evidence and
  explicit merge/reject/block actions.
- Disabled legacy `public/api/submit.js` with HTTP 410.

## Verification Completed

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- `node --check scripts/smoke-people-identity-dedupe.mjs`
- `node --test tests/people-identity-dedupe.test.js`
- `node scripts/smoke-people-identity-dedupe.mjs`
- `npm test` passed 611/611

## Remaining Production Steps

1. Provide a reachable Railway/Postgres `DATABASE_URL` or run these steps from a
   Railway shell with production DB access.
2. Deploy the updated app bundle.
3. Run the live database compatibility migration/readback through app startup.
4. Trigger Operations > Students > Identity Review > Scan for duplicates, or
   call `POST /api/bna/identity/scan` as an admin.
5. Inspect the Menachem candidate in Operations using masked evidence only.
6. If it is the same student, approve the merge from the review panel. If not,
   reject/block the review.
7. Run Railway doctor/live app smoke and report the final Menachem outcome back
   to Telegram/Operations.

## Guardrails

- Do not paste raw parent email, phone, student private data, API keys, or DB
  connection strings in chat, task titles, logs, screenshots, or handoffs.
- Public signup/parent/student portals must expose only
  `identityReviewRequired` at most; never expose review internals, source
  records, aliases, or merge history.
- Name-only Hebrew/English matches should remain review-only unless a human
  approves the merge.
