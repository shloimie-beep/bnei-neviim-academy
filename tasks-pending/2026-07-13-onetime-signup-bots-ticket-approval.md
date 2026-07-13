# One Time signup, bots, and ticket approval launch packet

- Raw input: `raw-input/RAW-20260713-002-onetime-signup-bots-ticket-approval.md`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Status: `in_progress`

## Requirements

| ID | Wave | Title | Status | Evidence |
| --- | --- | --- | --- | --- |
| REQ-20260713-901 | 1 | Reproduce, repair, deploy, and live-verify the One Time production signup form | Local verified; deploy pending | Production diagnosis reproduced on deployed SHA `3712308731910a6e77fb9a18ce18b57ae35f22dd`; local matrix and focused One Time tests passed |
| REQ-20260713-902 | 2 | Public One Time WhatsApp lead agent and approved public knowledge/class-link runtime | Pending | Blocked behind Wave 1 launch blocker |
| REQ-20260713-903 | 3 | Private Rabbi Telegram workspace agent separated from public WhatsApp | Pending | Blocked behind Wave 1 launch blocker |
| REQ-20260713-904 | 4 | Rabbi ticket to Super Admin approval to Codex job flow | Pending | Blocked behind Wave 1 launch blocker |
| REQ-20260713-905 | 5 | Action-registry parity, full matrices, final deploy/proof | Pending | Blocked behind Waves 1-4 |

## Wave 1 Acceptance Criteria

- Production route and CTA/form behavior are reproduced with full DOM, validation, focus, console, request, and response diagnostics.
- The current canonical signup form uses a single frontend validation schema and one matching server schema.
- Family and School are real radio inputs or equivalently accessible radio controls that update `audience_type` immediately and keyboard/touch/mouse correctly.
- Reminder choices have no preselected value and use conditional validation.
- `No reminders` does not require phone or reminder consent.
- `Email` does not require phone.
- WhatsApp/Both require phone and consent.
- Hidden conditional controls are disabled and not validated.
- Submit creates exactly one request and is idempotent.
- Server resolves One Time workspace/project, upserts the canonical CRM contact, links signup interest, stores location/timezone/reminder/consent, creates zero automatic CRM tasks, writes timeline/audit evidence, and queues approved confirmation when configured.
- Success copy says "You're signed up." and avoids billing, portal, internal, or debug language.
- The tested SHA is deployed to production and live-smoked on `https://join.onetimeonetime.com`.

## Guardrails

- No payment, checkout, member access, password setup, portal login, classroom grant, credential mutation, DNS change, or destructive production write.
- No WhatsApp/WAPI, Telegram, email, or other external send without a separate explicit send approval. Delivery-outbox behavior may be verified by queued/draft/no-send proof where configured.
- Synthetic production records must be clearly tagged and idempotent, or dry-run/no-write proof must be used until an approved cleanup path exists.

## Wave 1 Local Proof

- Starting live SHA: `3712308731910a6e77fb9a18ce18b57ae35f22dd`.
- Production diagnostic report: `ops/live-smokes/2026-07-13T00-36-03-104Z-one-time-signup-production-diagnostic.md` (ignored local evidence).
- Reproduced failure: `Family + No reminders + no phone + no consent` triggered no POST and focused `signup_acknowledgement` with `Check the box to confirm your class-time and reminder preferences.`
- Root cause: frontend and backend required acknowledgement/consent even when `No reminders` was selected; the form also depended on custom Family/School buttons instead of canonical accessible `audience_type` radio inputs.
- Repair files: `public/one-time/signup.html`, `src/lib/bna/one-time-signup-workflow.js`, `server.js`, `ops/action-registry.json`.
- Test files: `tests/one-time-signup-form-matrix.test.js`, `tests/one-time-direct-signup-page.test.js`, `tests/one-time-signup-reminder-workflow.test.js`.
- PASS `node --test tests/one-time-signup-form-matrix.test.js tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js` (17/17).
- PASS `npm run test:onetime:focused` (76/76).
- PASS `npm run watchdog:actions` with `finding_count=0`.
- PASS `npm run secrets:audit`.
- PASS `npm run bna:run:validate`; broader addendum work remains open.
- PASS `node --check server.js`, `node --check src/lib/bna/one-time-signup-workflow.js`, and `node --check scripts/diagnose-onetime-signup-production.mjs`.
- Pending: commit, push, deploy the exact tested SHA, then live-smoke the canonical production form.
