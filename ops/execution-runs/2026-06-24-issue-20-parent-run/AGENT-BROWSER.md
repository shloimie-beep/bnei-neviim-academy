# Agent Browser Batch B

Requirement: `REQ-20260624-042`

Status: done.

## Implementation

- Added `scripts/agent-browser-profile.mjs`.
- Added npm lifecycle commands:
  - `agent:browser`
  - `agent:browser:list`
  - `agent:browser:init`
  - `agent:browser:health`
  - `agent:browser:smoke`
- Added focused lifecycle tests in
  `tests/agent-browser-profile-harness.test.js`.
- Added operator documentation in `docs/agent-browser-harness.md`.

## Current Design

The harness keeps persistent Playwright user-data directories outside the repo
under `%LOCALAPPDATA%\BNA\agent-browser-profiles` by default. It refuses a
profile root inside the repo and records metadata in each external profile
directory.

Named profiles:

- `operations_owner`
- `parent_portal`
- `student_portal`
- `provider_portal`
- `one_time_review`
- `github_status`

Lifecycle commands cover list, init, health, open, close, reopen,
reauth-required, smoke, clear, and revoke.

## Guardrails

- Profile data is outside Git and outside the repo by default.
- The script attempts Windows current-user ACL hardening unless explicitly
  skipped by `BNA_AGENT_BROWSER_SKIP_ACL=1` for tests.
- Manual login is headed; the harness does not bypass MFA, CAPTCHA, or provider
  account policy.
- Smokes do not write screenshots because authenticated profiles may contain
  private data.
- Local browser profiles are not ChatGPT Agent browser cookies.
- Browser profiles are not connector tokens and do not authorize typed-action
  bypasses.

## Verification

- `node --check scripts\agent-browser-profile.mjs` passed.
- `node --test tests\agent-browser-profile-harness.test.js` passed 3/3.
- `npm run agent:browser:list -- --json` passed and read the safe default
  external root without opening a browser.
- `npm run agent:browser:health -- --json` passed before initialization with
  `root_exists=false`, proving the command is safe when no profiles exist.
- Credential-free smoke against a temporary external root passed for
  `one_time_review` at `https://bneineviimacademy.org/provider.html?review=one-time`.
  The smoke wrote no screenshot, captured no private data, saw body text, and
  reported no horizontal overflow.
- `npm run agent:browser:init -- --json` initialized the six named profile
  directories under the default non-repo root.
- Final `npm run agent:browser:health -- --json` passed with
  `root_exists=true`, metadata present for all six profiles, current-user ACL
  present, and inheritance disabled.

## Initialized Local Root

Default root initialized on this Windows account:

`C:\Users\User\AppData\Local\BNA\agent-browser-profiles`

Only profile metadata and empty/reusable Playwright profile directories were
created during this batch. No credentials, cookies, screenshots, private page
content, account exports, or connector tokens were copied into the repository.
