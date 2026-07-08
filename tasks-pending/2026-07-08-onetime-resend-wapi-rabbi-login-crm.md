# OneTime Resend, WAPI, Rabbi Login, CRM, and Agent Loop - 2026-07-08

Raw input: `raw-input/RAW-20260708-010-onetime-resend-wapi-rabbi-login-crm.md`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260708-047 | Needs operator decision | Resend the full OneTime parent email flow to the redacted operator Gmail address using the live launch-ready flow, no test labels, no BNA/Academy leakage, and a real live student display name. | Blocked by `DEC-20260708-009`. Live OneTime route is deployed and no-send dry run passed in `ops/watchdog-audits/2026-07-08-onetime-parent-student-auth-deploy-live-smoke.md`. |
| REQ-20260708-048 | Partially implemented / Needs operator input | Ingest Rabbi WAPI/WhatsApp credential folder into safe local secret/config handling without committing secrets, then verify sender/account readiness. | Local code now supports OneTime/Rabbi-scoped WAPI env/local-secret names and scoped diagnostics. Live readback on 2026-07-08 still showed WAPI outbound/sync not configured. Waiting for operator to paste/provide the WAPI folder/path; see `DEC-20260708-010`. |
| REQ-20260708-049 | Pending | Prepare a concise OneTime WhatsApp welcome/class-link message and send one approved test to the redacted operator phone from the Rabbi / OneTime sender after WAPI readiness and copy/link are verified. | Blocked by WAPI setup and send approval details; see `DEC-20260708-010` and `DEC-20260708-011`. |
| REQ-20260708-050 | Pending | Build/verify the OneTime WhatsApp bot MVP: immediate response, phone/contact capture, interest question, current class link send, and CRM communication log. | Pending WAPI/CRM audit. |
| REQ-20260708-051 | Implemented locally / Pending deploy+send | Create a safe Rabbi Scheller scoped-login/password-setup flow so Shloimie can log in as Rabbi Scheller and inspect the Rabbi view without using the super-admin account. | Live readback showed Rabbi provider session and view-as routes work. Local code now makes OneTime provider setup email OneTime-branded and allows a guarded admin recipient override without changing provider contact email. Tests: `tests/one-time-provider-setup-email-contract.test.js`, `tests/one-time-admin-mailbox-access.test.js`. |
| REQ-20260708-052 | Pending | Polish Rabbi scoped UI: OneTime brand, no pictures, no BNA branding in user-visible Rabbi surfaces, no random diagnostic/configuration cards without actions, consistent side panel/top filter/button layout. | Requires current-state UI audit/PQC packet before product UI implementation. |
| REQ-20260708-053 | Audited / Still needs prompt refresh | Verify and harden Agent Mode autonomous loop for this workstream: navigation-first prompts, Start/Drop-off/Readback path, failure/blocker reporting, and safe parallel execution. | Existing `public/agent-review-prompts/one-time-parent-trial-journey.md` includes start state, exact drop-off URL, emergency paste fallback, API fallback, and saved-result final contract. Needs refresh so current OneTime/Rabbi/parent prompts use live OneTime routes and role flow. |
| REQ-20260708-054 | Implemented locally / Pending deploy | Ensure OneTime CRM is built out for WAPI/WhatsApp contacts, communications, follow-up state, provider/Rabbi scope, and readback in Operations. | Local WAPI send path now stamps project scope into outbound attempts/results and chooses OneTime-scoped WAPI credentials when workspace/project is OneTime. Tests: `tests/one-time-wapi-scope-contract.test.js`, `tests/provider-wapi-setup-portal.test.js`, `tests/parent-student-portal-contract.test.js`. |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-20260708-009 | Exact live OneTime student display name for the parent invite resend. | The previous record still had old test/walkthrough labels. The cleaned route correctly requires a real `student_name` for live sends. | Shloimie | Reply with the exact student display name to show in the email. | Explicitly approve using an existing real student name from the operator family; do not resend. | Guessing risks creating/sending another wrong live record or mixing BNA student data into OneTime. | Provide the exact OneTime student display name for the resend. | `REQ-20260708-047` | Needs operator decision |
| DEC-20260708-010 | Rabbi WAPI credential/source configuration. | The WAPI folder/path/credential values have not been provided in this turn yet. | Shloimie | Paste/provide the folder or files, then Codex stores usable secrets only in `.secrets`/environment and records redacted proof. | Use the existing generic WAPI token if it is actually Rabbi-scoped; postpone WhatsApp. | Wrong WAPI account could send from the wrong brand/number or leak BNA identity. | Provide the Rabbi WAPI folder/path and identify the intended sender account/number. | `REQ-20260708-048`, `REQ-20260708-049`, `REQ-20260708-050` | Needs operator input |
| DEC-20260708-011 | WhatsApp test send payload approval. | Exact final copy and whether to use the current Zoom/class link from the latest approved OneTime invite are not yet confirmed after WAPI setup. | Shloimie/Codex | Codex drafts concise copy, runs a no-send preview/readiness check, then sends one test only to the redacted operator phone after approval is clear. | Send the rough ramble copy; do no WhatsApp send. | Sending too early can produce a fluffy/incorrect live message or expose wrong link/sender. | Approve the final copy/link/sender after WAPI readiness. | `REQ-20260708-049` | Pending |
| DEC-20260708-012 | Rabbi login credential policy. | User requested an easy password, but weak shared passwords should not be stored or sent in repo-visible evidence. | Codex/Shloimie | Use a password setup/reset link or a temporary secret kept outside repo, not a committed weak password. | Set an easy password; do not create login. | Weak credentials can expose the Rabbi workspace and private CRM. | Approve setup-link path or provide a secure temporary password through a non-repo secret channel. | `REQ-20260708-051` | Pending |

## Evidence - 2026-07-08 Local Batch

- Local backend changes: `server.js`.
- Tests added: `tests/one-time-wapi-scope-contract.test.js`, `tests/one-time-provider-setup-email-contract.test.js`.
- Verification passed:
  - `node --check server.js`
  - `node --test tests/one-time-wapi-scope-contract.test.js tests/one-time-provider-setup-email-contract.test.js tests/provider-wapi-setup-portal.test.js tests/one-time-admin-mailbox-access.test.js tests/parent-student-portal-contract.test.js`
  - `npm run watchdog:protocol-drift`
- Live readback before deploy:
  - OneTime WAPI diagnostics returned outbound/sync not configured.
  - Rabbi provider record exists, approved, login username `one_time_admin`.
  - Super-admin provider session start returned `/provider.html?admin_provider=one-time&section=mailbox`.
  - View-as Rabbi start returned a signed token and `/provider.html?review=one-time&view_as_rabbi=...`.
  - Redacted operator parent lead still has stale `Dratler Student` and test tags; do not resend parent invite until `DEC-20260708-009` is resolved.

## Suggested WhatsApp Draft

Status: draft only, not sent.

> Hi, welcome to the OneTimeOneTime Mishnah class. Here is the link for
> today's shiur: [class link]
>
> Thank you for your patience while we tune the Zoom setup and sound. The class
> is free while we finish the technology setup and make the experience smoother.
> We are building this carefully, with the goal of making a serious Mishnah
> class accessible at a very high level.
>
> Reply here if you are interested in joining and we will keep you posted.

## Implementation Batches

| Batch | Scope | Requirements | Status |
| --- | --- | --- | --- |
| B1 | Parent invite resend readiness | `REQ-20260708-047` | Blocked on exact student display name |
| B2 | WAPI/CRM audit and safe config | `REQ-20260708-048`, `REQ-20260708-054` | Pending |
| B3 | WhatsApp no-send preview and single test send | `REQ-20260708-049` | Pending WAPI/copy/link approval |
| B4 | WhatsApp bot MVP | `REQ-20260708-050` | Pending audit |
| B5 | Rabbi login/view-as and UI audit | `REQ-20260708-051`, `REQ-20260708-052` | Pending |
| B6 | Agent Mode autonomous loop prompts/drop-off hardening | `REQ-20260708-053` | Pending |
