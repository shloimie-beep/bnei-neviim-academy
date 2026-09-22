# One Time Email Contacts Import Handoff - 2026-06-16

## Status

- State: `blocked_needs_human_decision`
- Owner: Codex for deploy; Shloimie for campaign approval gates
- Source channel: Codex + Downloads
- Source file: `C:\Users\User\Downloads\subscribers.csv`

## Raw Capture

- Raw text saved in: `memory/2026-06-16.md`
- Raw wording preserved only as provenance.
- Redactions performed: no email list contents pasted into this handoff.

## Distilled Intent

- Add Rabbi/One Time email contacts to the Rabbi side of Operations.
- Tag/source them for future campaigns.
- Do not send anything yet.
- Do not import them as general BNA contacts.

## Visible Records

- `TASKS.md` row: deploy One Time Email Contacts Operations section after a
  clean deploy window.
- Ledger record: `ops/agent-task-ledger.jsonl`
- Changelog record: `ops/agent-changelog.md`
- Proof: `ops/imports/2026-06-16-one-time-email-contacts-import.md`

## Implementation Brief

- Imported 88 contacts to `bna_parent_leads`, scoped to
  `one_time_mishnah_class`.
- Created 88 internal-only `bna_contact_communications` import notes.
- Primary tags include:
  - `one-time-list:rabbi-email-contacts`
  - `one-time-campaign-staging`
  - `one-time-no-send-until-approved`
  - source-status and source-plan tags
- Local UI mapping in `public/operations.html` adds
  `Contacts > Email Contacts` for `rabbi_sheller_provider`.

## Decisions And Blockers

- Deployment blocker: unrelated local edits were present before this task, so
  the UI change was not deployed in this turn.
- Campaign blocker: no campaign can be sent until Shloimie approves exact copy,
  sender, suppression rules, test recipients, and rollout timing.

## Proof And Closeout

- Local verification:
  - `node --check scripts/import-one-time-subscribers.mjs`
  - `node --test tests/one-time-external-user-portal.test.js --test-reporter=spec`
  - `node --test tests/operations-saas-crm-redesign.test.js tests/local-classroom-buffer-draft-policy.test.js --test-reporter=spec`
  - Local browser smoke confirmed the Email Contacts section and no-send guard.
- Live database verification:
  - 88 imported contacts.
  - 88/88 no-send metadata.
  - 88/88 not-sent campaign status.
  - 88/88 external-write false.
- Live UI verification:
  - Pending deploy.
