# One Time Local Class Welcome Send - 2026-07-06

Raw ID: RAW-20260706-960
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Status: Done

## Requirements

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| REQ-20260706-960 | Add the three operator-provided local class attendee emails into the One Time CRM and tag them as local class / Zoom Mishnayos attendees with names still unknown. | Done | Leads #4-#6 in scoped One Time parent-leads readback; evidence redacted in `ops/live-smokes/2026-07-06T15-23-44-976Z-one-time-local-class-welcome-send.md`. |
| REQ-20260706-961 | Send each attendee an individual welcome email with the current Zoom Mishnayos link and request for feedback. | Done | Drafts #1-#3 sent through `SEND_RESEND_EMAIL`; provider message ids stored only as fingerprints in evidence. |
| REQ-20260706-962 | Make sure Rabbi's provider mailbox can see the sent emails and that the CRM timeline records why they were sent. | Done | Provider mailbox search found 3 matching welcome threads; CRM notes #3-#5 created. |
| REQ-20260706-963 | Repair any live backend issue that prevents the One Time draft/send path from being safely auditable. | Done | Commits `ddae56cb` and `52b10418`; one-time-web deployments `05f259e2-19fd-4efd-a385-955c3e3f4a72` and `edea316e-1831-4679-af1e-c861714839d4`; live smoke passed. |

## Implementation Notes

- First run stopped before any send because `source=one_time_local_class` violated the existing lead source check. Runner was corrected to use `source=event` with local-class meaning preserved in tags/source_detail/metadata.
- Second run created/merged the first lead, then stopped before any send because the draft recipient conflict check queried the nonexistent `bna_workspace_settings.project_key`.
- Backend hotfix now maps `bna_workspace_settings.workspace_key` to the project scope for conflict checks.
- Generic Resend draft sends now carry draft metadata plus project/workspace ids into `bna_communications`, so outbound sends appear in the scoped provider mailbox.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/provider-mailbox-portal.test.js` (6/6)
- PASS `node --check scripts/send-onetime-local-class-welcome.mjs`
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
- PASS live One Time local class welcome send runner: 3 sent, 3 scoped leads present, 3 provider mailbox threads visible

## Guardrails

- Emails were sent individually, not as a shared-recipient or bulk campaign.
- Evidence is redacted: no raw emails, no Zoom password URL, no credentials/cookies, and no raw email body.
- No WhatsApp, payment/access, DNS, member/library entitlement, provider-account, or external CRM write was performed.
