# One Time Local Class Welcome Send - 2026-07-06T15:23:44.976Z

Result: passed
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Raw ID: RAW-20260706-960
Zoom URL: [redacted zoom url]

## Sends
- s***@g***.com (sha256:568337a3e3098ac0): lead #4, draft #1, provider sha256:09b7762e106c7921, note #3
- b***@g***.com (sha256:7e497ffd61328c3c): lead #5, draft #2, provider sha256:f88e69cbfd2737d6, note #4
- e***@g***.com (sha256:f91ab3e2862f48aa): lead #6, draft #3, provider sha256:682654e8e5d1eef0, note #5

## Checks
- PASS Operations login: session established
- PASS Upsert local class CRM record s***@g***.com: lead #4 merged
- PASS Create email draft s***@g***.com: draft #1
- PASS Send email s***@g***.com: provider message sha256:09b7762e106c7921
- PASS Log CRM note s***@g***.com: note #3
- PASS Upsert local class CRM record b***@g***.com: lead #5 created
- PASS Create email draft b***@g***.com: draft #2
- PASS Send email b***@g***.com: provider message sha256:f88e69cbfd2737d6
- PASS Log CRM note b***@g***.com: note #4
- PASS Upsert local class CRM record e***@g***.com: lead #6 created
- PASS Create email draft e***@g***.com: draft #3
- PASS Send email e***@g***.com: provider message sha256:682654e8e5d1eef0
- PASS Log CRM note e***@g***.com: note #5
- PASS Scoped parent-lead readback: 3 recipients present in scoped parent leads
- PASS Provider mailbox readback: 3 welcome threads visible

## Provider Mailbox
- Matching welcome threads: 3
- Inbox address: i***@o***.com

## Guardrails
- Sent three individual emails; no shared recipient list or bulk campaign endpoint was used.
- Full Zoom URL, raw recipient emails, credentials, cookies, and message body were not written to this report.
- No payment, access grant, WhatsApp send, DNS change, external CRM write, or member/library entitlement change was performed.
