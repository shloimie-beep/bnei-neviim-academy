# Agent Browser Harness

This is the local Codex/Playwright browser profile harness for BNA QA.

It is not ChatGPT Agent, not a connector, and not a credential manager.

## Storage

Default profile root:

`%LOCALAPPDATA%\BNA\agent-browser-profiles`

The root must stay outside the repository. Profile directories can contain
browser cookies and session data, so they must never be copied into tracked
files, screenshots, task titles, logs, or chat.

On Windows, `init` attempts to disable inherited ACLs and grant access to the
current user, SYSTEM, and Administrators. If ACL repair fails, the command
reports it in profile metadata and `health`.

## Profiles

- `operations_owner`
- `parent_portal`
- `student_portal`
- `provider_portal`
- `one_time_review`
- `github_status`

Manual-login profiles are for browser QA only. They do not authorize sends,
charges, access grants, production writes, DNS changes, Drive writes, social
publishing, or GitHub posting by clicking around in a browser.

## Local Setup Status

On 2026-06-24, the six named profile directories were initialized on this
Windows account under:

`C:\Users\User\AppData\Local\BNA\agent-browser-profiles`

The initialization created local profile folders and metadata only. Manual
login state is still the operator's responsibility for profiles that require
account access. Run `npm run agent:browser:health -- --json` to confirm that
metadata exists and Windows ACL hardening is still intact.

## Commands

```powershell
npm run agent:browser:list
npm run agent:browser:init
npm run agent:browser:health
npm run agent:browser -- open operations_owner
npm run agent:browser -- reauth-required operations_owner
npm run agent:browser -- smoke one_time_review
npm run agent:browser -- close operations_owner
npm run agent:browser -- reopen operations_owner
npm run agent:browser -- clear operations_owner --confirm
npm run agent:browser -- revoke operations_owner --confirm
```

Use `--base-url=http://127.0.0.1:PORT` for local app testing. Use
`--url=...` only when the target URL is already approved for that role.

## Manual Login Rules

- Login bootstrap is headed and manual.
- Do not bypass MFA, CAPTCHA, account-security challenges, or provider policies.
- Do not paste credentials into Codex chat, task records, screenshots, or logs.
- If a profile reaches a login page during smoke, mark it
  `reauth-required`; do not treat that as a failed implementation.
- If a profile might contain private data, do not save screenshots from it to
  the repo.

## ChatGPT Agent And Connectors

Local Playwright profiles do not share cookies with ChatGPT Agent. ChatGPT
Agent has its own browser state and must be set up separately by the operator
when needed.

Connectors and MCP apps are separate authorization paths. A browser profile
does not grant connector access, and a connector token does not authorize a
browser-click substitute for a typed action.

## Verification

Focused test:

```powershell
node --test tests\agent-browser-profile-harness.test.js
```

Safe health readback:

```powershell
npm run agent:browser:health -- --json
```

Credential-free One Time smoke:

```powershell
npm run agent:browser -- smoke one_time_review --json --base-url=https://bneineviimacademy.org
```
