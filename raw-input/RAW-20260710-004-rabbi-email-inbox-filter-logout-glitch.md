# RAW-20260710-004 - Rabbi email inbox filter logout glitch

- Source channel: `codex_chat`
- Captured at: `2026-07-10T15:01:36+03:00`
- Parse status: `implemented`
- Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
- Requirement IDs: `REQ-20260710-030`
- Task IDs: `TASK-20260710-001`
- Privacy classification: operational bug report; no raw email bodies, contacts, secrets, or message content included

## Raw Operator Wording

> There's a glitch when I'm trying to see the emails. I'm trying to see the emails from my super admin and filter to see the rabbi, and it like logs me out. It's some sort of glitch. I need you to fix that now so I could see the rabbi inbox and the emails.

## Parsed Requirement

| ID | Title | Owner | Status | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| `REQ-20260710-030` | Fix Operations Rabbi email inbox switching so Super Admin can view the scoped Rabbi inbox without being redirected to login. | Codex | Done | From Operations Super Admin, selecting the Rabbi / One Time email inbox keeps the operator authenticated, scopes email/readiness data to `rabbi_sheller_provider` / `one_time_mishnah_class`, preserves the correct URL, and performs no external sends or provider mutations. |

## Closeout Evidence

- Code commits: `5ab17053`, `e9c91724`, `a60b4e12`
- Deployment: Railway BNA production `skillful-motivation`, deployment `bd86c313-3987-4b8e-b90d-5baee483659e`, status `SUCCESS`
- Live smoke: `ops/live-smokes/2026-07-10T12-22-36-118Z-email-resend-ux-live-smoke.md`
- Verification: focused tests 24/24 passed; `npm run watchdog:actions` passed with 0 findings; `npm run watchdog:protocol-drift` passed with 0 findings
- External actions: no email send, WhatsApp/WAPI send, payment/access mutation, provider mutation, DNS change, credential change, or raw private email/contact export

## Guardrails

- No email send.
- No WhatsApp/WAPI send.
- No payment/access mutation.
- No DNS/credential/provider-account mutation.
- No raw private email bodies or contact exports committed.
