# Communications Screening / Imports Audit

Date: 2026-06-17

Requirements: `REQ-20260616-053` through `REQ-20260616-060`

## What Changed

- Communications overview now surfaces `Top News`, `Screening Pipeline`, and a dry-run `Contact Imports` panel.
- Communication cards now use stronger readable styling and show subject/title, channel/direction, source/status, associated contact/student/workspace context, tags, and follow-up/action status.
- Manual communication creation and WAPI webhook import both run through the same first-party screening classifier.
- Screening metadata is stored in communication metadata/source context and includes pipeline categories, priority, follow-up/action hints, parent-coaching categories, and explicit non-clinical guardrails.
- Important inbound messages create local attention artifacts only: an in-app notification and a follow-up task where appropriate. No external send is performed.
- Contact import preview accepts CSV, vCard, and email-export-like rows, infers mapping/classification, checks local dedupe candidates, and blocks commit until a future explicit approval path.
- WhatsApp/WAPI view shows live-pull readiness, local Phonebook Workspace, read-only grouping/report controls, and no-send copy.

## Verification

- `node --check server.js`
- Operations inline-script syntax check
- Focused communications/WAPI/notification tests
- Full suite: `npm test` passed 696/696
- Local targeted smoke:
  `ops/live-smokes/2026-06-17T10-43-26-830Z-communications-screening-live-smoke.md`
- Local browser proof:
  `ops/playwright-smokes/2026-06-17-communications-screening-local/report.md`
- Railway production deployment:
  `3991f132-9207-4386-a9fd-b6148db5944f`
- Railway doctor: `SUCCESS`
- Live app smoke:
  `ops/live-smokes/2026-06-17T10-45-20-615Z-live-app-smoke.md`
- Live public/privacy smoke:
  `ops/live-smokes/2026-06-17T10-46-28-607Z-public-route-privacy-smoke.md`
- Targeted live communications smoke:
  `ops/live-smokes/2026-06-17T10-46-34-893Z-communications-screening-live-smoke.md`

## Guardrails

- No email, WhatsApp, Telegram, portal message, social post, payment, account grant, Google/Classroom, Buffer, DNS, credential copy, public/member publishing, or external connector write was added or performed.
- Parent coaching/self-regulation parsing is non-clinical only. It creates no medical, diagnostic, or treatment labels.
- WAPI/Whapi remains a connector. Group/contact visibility and diagnostics are local/admin-only unless a later approved sync/send path is explicitly invoked.
- Contact imports are preview-only in this batch. The UI and API return commit blocked/no-send status.

## Remaining

- The full correction register remains active. After this batch, 60 requirements are done, 1 requirement is blocked, and 9 requirements remain pending.
