# OneTime Parent Setup Fix Live Send Readback - 2026-07-08

Raw input: `RAW-20260708-008`

Requirements: `REQ-20260708-036`, `REQ-20260708-037`, `REQ-20260708-038`

## Summary

The follow-up OneTime parent invite correction was deployed and verified on
both production surfaces:

- Main BNA service deployment for the code fix: `198ae4df-d25a-4920-a850-c4552a04d175`
- OneTime service deployment for `join.onetimeonetime.com`: `2b4af747-513f-440f-b532-a06695c4f80c`
- App fix commit: `85613771f16dd9d2ed8947a50e2b0b48b9952f3e`

## Live Route Smoke

- `https://join.onetimeonetime.com/one-time-parent?reset=TESTTOKEN`
- Status: `200`
- Title: `OneTimeOneTime Parent Setup`
- OneTime copy present: yes
- BNA/Academy copy present: no
- Reset form target present: `/api/parent-portal/password/reset`

## OneTime API Dry Run

- Host: `https://join.onetimeonetime.com`
- Endpoint: `POST /api/bna/one-time/parent-trial-invite`
- Dry run only: yes
- Email sent: no
- Parent setup path: `/one-time-parent`
- Classroom path: `/one-time-classroom`
- Member library path: `/member-library`
- Live class URL included: yes, redacted
- Scoped workspace/project:
  `rabbi_sheller_provider` / `one_time_mishnah_class`
- Sender readiness: configured and send-allowed with
  `info@onetimeonetime.com`

## Live Send Readback

- Host: `https://join.onetimeonetime.com`
- Single approved recipient: `sd***@gmail.com`
- Email sent: yes
- Provider: `resend`
- Communications readback ID: `4`
- Email type: `one_time_parent_trial_invite`
- Template key: `parent_trial_invite`
- Status: `sent`
- Subject contains Academy/BNA: no
- Member access expires at: `2026-08-07T11:48:30.944Z`
- Parent password setup expires at: `2026-07-15T11:48:30.964Z`

## Guardrails

- No setup token committed.
- No member access code committed.
- No full recipient address committed.
- No full Zoom URL or Zoom password committed.
- No payment or checkout created.
- No Zoom mutation performed.
- The resend was sent from the OneTime service API, not the Academy service API,
  so the parent setup token is stored in the same OneTime backend that serves
  `/one-time-parent`.
