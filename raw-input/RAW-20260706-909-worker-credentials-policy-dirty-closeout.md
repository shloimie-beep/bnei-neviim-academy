# RAW-20260706-909 - Worker Credentials, Provisional AI Video Policy, Dirty Closeout

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-909 |
| Source channel | codex_chat |
| Created at | 2026-07-06T16:13:00+03:00 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-worker-credentials-policy-and-dirty-closeout.md |
| Related IDs | RAW-20260702-010, TASK-20260702-010, RAW-20260706-907, RAW-20260706-908 |

## Raw operator wording

> So, the worker, just use some sort of email for now. Use some sort of username and password, and I'll just send it to that guy later, and I'll tell him to change it. And whatever, just make up a policy, a model, a budget. Make that stuff up for now. There's a lot of dirty stuff and a lot of stuff that hasn't been pushed, so just clean up everything and push all the other jobs that need to be pushed out.

## Parsed intent

- Configure a temporary One Time AI video worker login so the new worker role can be used.
- Create provisional AI-video policy/model/budget defaults so the Studio worker handoff is not blocked on unspecified policy language.
- Audit the dirty workspace and push safe completed scoped jobs without reverting unrelated work or committing secrets/private raw data.
- Leave only exact vendor, credential, privacy, account, or incomplete-work blockers.

## Safety notes

- Generated or configured passwords must not be committed to tracked files.
- Credential values should not be printed in logs, final messages, or proof artifacts.
- Provisional policy/model/budget defaults cannot invent real OpenArt/API credentials or approve vendor generation, uploads, credit spend, external sends, DNS, payment, access grants, or provider-account mutations.
