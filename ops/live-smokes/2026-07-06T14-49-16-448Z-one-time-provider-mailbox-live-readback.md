# One Time Provider Mailbox Live Readback

Checked: 2026-07-06T14:49:16.448Z

Base URL: `https://join.onetimeonetime.com`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

PR: <https://github.com/shloimie-beep/bnei-neviim-academy/pull/117>

Merge commit: `61d1da3e3ea683358685350dd2f9af79ba39f478`

Railway deployment: `one-time-web` production
`733aee09-bd85-4b97-9256-0d7ba5837a08` reached `SUCCESS`.

## Result

PASS. Rabbi Elie Scheller now has a provider-portal mailbox login and the
deployed mailbox can read the live `info@onetimeonetime.com` inbox.

## Safe Public Probes

| Check | Result |
|---|---|
| `GET /provider.html` | 200; page contains the mailbox section, provider mailbox endpoint, and public sender address. |
| Anonymous `GET /api/provider-portal/mailbox` | 401 `Provider session is required`. |
| Invalid-signature `POST /api/resend/inbound` | 401 `Unauthorized Resend webhook`; no processing occurred. |

## Provider Login Unlock

| Field | Result |
|---|---|
| Provider | Rabbi Elie Scheller, id `1` |
| Login username | `one_time_admin` |
| Credential storage | `C:/Users/User/BNA v2.0/.secrets/one-time-provider-mailbox-login-20260706.txt` |
| Setup email sent | no |
| Password printed or committed | no |
| Provider login | 200, session cookie issued |

## Authenticated Mailbox Readback

| Check | Result |
|---|---|
| `GET /api/provider-portal/mailbox` | 200 |
| Thread count | 4 |
| First thread detail | 200 |
| First thread message count | 1 |
| Inbox address | `info@onetimeonetime.com` |
| Scope | `rabbi_sheller_provider` / `one_time_mishnah_class` |
| Sender/reply-to readiness | present |
| Mailing address readiness | configured |

Thread keys and message bodies were not recorded; the evidence stores only
counts and a hash for the first thread key.

## One Time Instance Smoke

`npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
passed:

| Path | Status |
|---|---|
| `/api/health` | 200 |
| `/api/one-time/instance-config` | 200 |
| `/` | 200 |
| `/one-time` | 200 |
| `/one-time/` | 200 |
| `/operations-login.html` | 200 |
| `/parent.html` | 200 |
| `/student.html` | 200 |
| `/provider.html` | 200 |
| `/one-time-classroom.html` | 200 |

## Guardrails

- No physical mailing address value was committed or printed.
- No external email was sent.
- No bulk campaign endpoint or broadcast send was added.
- No fake inbound email was inserted during live smoke.
- Invalid Resend webhook signature was rejected before processing.
- The provider credential value is only in the local keyholder file.
- Live thread evidence records counts and hashes only, not message bodies.
