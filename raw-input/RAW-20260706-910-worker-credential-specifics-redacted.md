# RAW-20260706-910 - Worker Credential Specifics (Secret Redacted)

Source: codex_chat
Captured at: 2026-07-06
Related task: TASK-20260702-010, TASK-20260706-940
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Parse status: registered

## Raw source

The operator replaced the earlier generated temporary worker login with a
specific Ben Levy username and a simple temporary password.

The password is intentionally redacted from this repo record because it is a
live credential. It is stored only in the local untracked secret handoff file:

`C:\Users\User\BNA v2.0\.secrets\one-time-ai-video-worker-login-20260706.txt`

## Credential interpretation

- Username configured for Operations login: `BenLevy`
- Password: redacted from tracked files
- Required handoff note: tell the worker this is temporary and must be changed
  or replaced with a permanent owner-managed credential after handoff.

## Parsed impact

- Updates `REQ-20260706-940`.
- Does not approve OpenArt, vendor uploads, credit spend, publishing, external
  sends, payment/access changes, DNS, or provider-account mutation.
