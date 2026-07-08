# OneTime Resend, WAPI, Rabbi Login, CRM, and Agent Loop - 2026-07-08

Raw input: `raw-input/RAW-20260708-010-onetime-resend-wapi-rabbi-login-crm.md`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260708-047 | Needs operator decision | Resend the full OneTime parent email flow to the redacted operator Gmail address using the live launch-ready flow, no test labels, no BNA/Academy leakage, and a real live student display name. | Blocked by `DEC-20260708-009`. Live OneTime route is deployed and no-send dry run passed in `ops/watchdog-audits/2026-07-08-onetime-parent-student-auth-deploy-live-smoke.md`. |
| REQ-20260708-048 | Deployed / Needs operator input | Ingest Rabbi WAPI/WhatsApp credential folder into safe local secret/config handling without committing secrets, then verify sender/account readiness. | Deployed code supports OneTime/Rabbi-scoped WAPI env/local-secret names and scoped diagnostics. Live readback after deployment still showed WAPI outbound/sync not configured. Waiting for operator to paste/provide the WAPI folder/path; see `DEC-20260708-010`. |
| REQ-20260708-049 | Pending | Prepare a concise OneTime WhatsApp welcome/class-link message and send one approved test to the redacted operator phone from the Rabbi / OneTime sender after WAPI readiness and copy/link are verified. | Blocked by WAPI setup and send approval details; see `DEC-20260708-010` and `DEC-20260708-011`. |
| REQ-20260708-050 | Deployed / WAPI credential and class-link blocked | Build/verify the OneTime WhatsApp bot MVP: immediate response, phone/contact capture, interest question, current class link send, and CRM communication log. | Deployed in commit `8fc92f71` to OneTime deployment `b38765d5-7386-4f0d-ad9d-befe4005bee8`; live OneTime smoke passed. Code evaluates OneTime WAPI inbound webhook scope, logs inbound messages into `bna_contact_communications`, stamps an auto-reply plan onto the inbound CRM record, and sends only when `ONE_TIME_WAPI_AUTO_REPLY_ENABLED=true`, `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM=APPROVE_ONE_TIME_WAPI_AUTO_REPLY`, `ONE_TIME_WHATSAPP_CLASS_LINK` is configured, and the sender uses `one_time_scoped` WAPI credentials. No WhatsApp was sent. Tests: `node --check server.js`; focused WAPI/prompt/provider tests passed. |
| REQ-20260708-051 | Done / Email sent | Create a safe Rabbi Scheller scoped-login/password-setup flow so Shloimie can log in as Rabbi Scheller and inspect the Rabbi view without using the super-admin account. | Live readback showed Rabbi provider session and view-as routes work. Deployed OneTime-branded provider setup email with guarded admin recipient override. Setup email sent to redacted operator Gmail through Resend after deployment `6d74a813-235b-41f6-81ea-777f6a2183e8`; readback status `sent`, provider `resend`, subject OneTime-branded and not BNA-branded. |
| REQ-20260708-052 | Deployed / live smoke passed | Polish Rabbi scoped UI: OneTime brand, no pictures, no BNA branding in user-visible Rabbi surfaces, no random diagnostic/configuration cards without actions, consistent side panel/top filter/button layout. | Implemented signed Rabbi provider sessions on the OneTime section model, sanitized review/test links in signed mode, replaced generic provider diagnostics with OneTime CRM/action content, and fixed OneTime sidebar row sizing so nav buttons do not overlap. Commit `62d82621` pushed and deployed to OneTime Railway deployment `07a373a0-9598-4887-88bc-d60e92b5625f`, status `SUCCESS`. Live smoke passed for `https://join.onetimeonetime.com`; deployed provider page readback confirmed `isSignedOneTimeProviderSession`, `Provider login active`, `RABBI ACCOUNT`, `/parent/login`, `/student/login`, and `signedOneTimeSession`. Evidence: PQC packet `ops/prompt-packets/2026-07-08-onetime-rabbi-provider-session-ui/00-rabbi-provider-session-ui.product-quality.json`; visual proof `ops/ui-audits/2026-07-08-onetime-rabbi-provider-session-ui/report.md`; tests 15/15; watchdog/action/secrets/diff gates passed. |
| REQ-20260708-053 | Deployed / live prompt readback passed | Verify and harden Agent Mode autonomous loop for this workstream: navigation-first prompts, Start/Drop-off/Readback path, failure/blocker reporting, and safe parallel execution. | Updated `src/lib/bna/agent-review-hub.js`, regenerated `public/agent-review-prompts/*.md`, and refreshed `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/` so agents must start/drop off through Operations, navigate exact Super Admin -> Rabbi -> real live parent/student login/setup/classroom paths, inspect Communications > Email and Communications > WhatsApp, and save BLOCKED/FAIL even when navigation breaks. Commits `8fc92f71` and `86e050f3` pushed; OneTime deployments `b38765d5-7386-4f0d-ad9d-befe4005bee8` and `7a499173-cb63-4c62-a651-d9197ce6218f` reached `SUCCESS`. Live readback of `https://join.onetimeonetime.com/agent-review-prompts/rabbi-provider-admin.md` confirmed `Communications > WhatsApp`, WAPI readiness, `parent/login`, `student/login`, `one-time-parent`, and the WhatsApp no-send guard. |
| REQ-20260708-054 | Deployed / WAPI credential blocked | Ensure OneTime CRM is built out for WAPI/WhatsApp contacts, communications, follow-up state, provider/Rabbi scope, and readback in Operations. | Deployed WAPI send path stamps project scope into outbound attempts/results and chooses OneTime-scoped WAPI credentials. Follow-up scopes inbound webhook records by OneTime workspace/project when supplied, records auto-reply readiness into CRM metadata/source context, exposes `auto_reply_configured` / `auto_reply_readiness` in WAPI diagnostics, and keeps live sends blocked without scoped WAPI token + class-link env + approval gate. Live WAPI setup remains not configured until `DEC-20260708-010` is resolved. |
| REQ-20260708-070 | Deployed / live smoke passed | Make the public Rabbi / OneTime landing aliases and helper bubble fully OneTime scoped: `/rabbi` must not serve the old BNA provider-preview page, and the public helper must present as Rabbi Scheller's digital assistant with schedule/program/speak-to-Rabbi lead capture and no BNA helper knowledge bleed. | Implemented route/helper/server scope fixes, pushed commit `cff35ec7`, and deployed OneTime Railway deployment `554814f1-6ed1-4319-ad43-dee32f71c00e` (`SUCCESS`). Standard live smoke passed for `https://join.onetimeonetime.com`. Rendered Playwright live smoke passed for `/`, `/one-time`, `/rabbi`, `/rabbi.html`, `/rabbi-preview`, and `/one-time-mishnayos`: each route served the OneTime landing, body scope was `bna-assistant-surface-one-time-public`, helper launcher read `Rabbi Scheller Assistant`, and old BNA preview/helper bad hits were absent. Evidence: raw intake `raw-input/RAW-20260708-014-onetime-rabbi-public-assistant-isolation.md`; PQC packet `ops/prompt-packets/2026-07-08-onetime-rabbi-public-assistant-isolation/00-onetime-rabbi-public-assistant-isolation.product-quality.json`; local proof `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/report.md`; live proof `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/live-report.md`; mobile screenshot `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/live-rabbi-helper-mobile.png`. WhatsApp send and transcript knowledge promotion remain blocked by `DEC-20260708-010`, `DEC-20260708-011`, and Vimeo transcript decisions. |
| REQ-20260708-071 | Local verified / deploy pending | Make the OneTime public landing signup workflow and Agent Mode audit workflow launch-ready: black/yellow header with black-on-white logo, yellow bottom-of-hero email-only Sign Up Now strip, safe first-party lead capture, focused WhatsApp/readiness prompt, and copied prompt lane tracking. | Raw input: `raw-input/RAW-20260708-015-onetime-public-signup-agent-workflow.md`. PQC packet passed validation: `ops/prompt-packets/2026-07-08-onetime-public-signup-agent-workflow/00-onetime-public-signup-agent-workflow.product-quality.json`. Implemented in `public/one-time/index.html`, `src/lib/bna/agent-review-hub.js`, `public/agent-review.html`, generated `public/agent-review-prompts/*.md`, tests, action registry, and `.gitignore` security cleanup. Local Playwright smoke passed at 1440/1024/768/430/390 with no old form fields/no overflow, mocked no-send synthetic signup, and Agent Review prompt-copy lane move. Evidence: `ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/local-report.md`. Verification passed: focused tests 30/30, `node --check server.js`, PQC validation, action watchdog, protocol-drift watchdog, secrets audit after removing tracked provider diagnostics JSON from git, and `git diff --check`. No WhatsApp/email/payment/access/external send was performed. |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-20260708-009 | Exact live OneTime student display name for the parent invite resend. | The previous record still had old test/walkthrough labels. The cleaned route correctly requires a real `student_name` for live sends. | Shloimie | Reply with the exact student display name to show in the email. | Explicitly approve using an existing real student name from the operator family; do not resend. | Guessing risks creating/sending another wrong live record or mixing BNA student data into OneTime. | Provide the exact OneTime student display name for the resend. | `REQ-20260708-047` | Needs operator decision |
| DEC-20260708-010 | Rabbi WAPI credential/source configuration. | The WAPI folder/path/credential values have not been provided in this turn yet. | Shloimie | Paste/provide the folder or files, then Codex stores usable secrets only in `.secrets`/environment and records redacted proof. | Use the existing generic WAPI token if it is actually Rabbi-scoped; postpone WhatsApp. | Wrong WAPI account could send from the wrong brand/number or leak BNA identity. | Provide the Rabbi WAPI folder/path and identify the intended sender account/number. | `REQ-20260708-048`, `REQ-20260708-049`, `REQ-20260708-050` | Needs operator input |
| DEC-20260708-011 | WhatsApp test send payload approval. | Exact final copy and whether to use the current Zoom/class link from the latest approved OneTime invite are not yet confirmed after WAPI setup. | Shloimie/Codex | Codex drafts concise copy, sets the class link through environment/secret config (`ONE_TIME_WHATSAPP_CLASS_LINK`) rather than committing it, runs a no-send preview/readiness check, then sends one test only to the redacted operator phone after approval is clear. | Send the rough ramble copy; do no WhatsApp send. | Sending too early can produce a fluffy/incorrect live message, expose wrong link/sender, or leak a Zoom password into source control. | Approve the final copy/link/sender after WAPI readiness and configure the current class link outside the repo. | `REQ-20260708-049` | Pending |
| DEC-20260708-012 | Rabbi login credential policy. | User requested an easy password, but weak shared passwords should not be stored or sent in repo-visible evidence. | Codex/Shloimie | Use a password setup/reset link or a temporary secret kept outside repo, not a committed weak password. | Set an easy password; do not create login. | Weak credentials can expose the Rabbi workspace and private CRM. | Setup-link path used; no weak shared password stored or returned. | `REQ-20260708-051` | Resolved |

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

## Evidence - 2026-07-08 Deploy And Live Send

- Commits pushed:
  - `d8733c9e` - WAPI scope, CRM logging, provider setup override.
  - `340d1f77` - route OneTime provider setup email through the OneTime sender.
- OneTime deployments:
  - `76bb9349-99f9-41d9-8750-d19cd02115d2` reached `SUCCESS`.
  - `6d74a813-235b-41f6-81ea-777f6a2183e8` reached `SUCCESS`.
- Live verification:
  - `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed.
  - Scoped WAPI diagnostics returned `workspace_key=rabbi_sheller_provider`, `project_key=one_time_mishnah_class`, and required env `ONE_TIME_WAPI_API_TOKEN or RABBI_SHELLER_WAPI_API_TOKEN or WAPI_API_TOKEN`.
  - WAPI outbound/sync remain not configured; no WhatsApp was sent.
  - Provider setup override without confirm returned 400 and did not send.
  - Provider setup override with confirm sent to redacted operator Gmail, `email_sent=true`.
  - Rabbi communications readback showed latest provider setup email `status=sent`, `provider=resend`, OneTime subject present, BNA/Academy subject absent.

## Evidence - 2026-07-08 Agent Prompt And WAPI Bot Batch

- Local backend changes: `server.js`.
- Prompt source and generated prompts:
  - `src/lib/bna/agent-review-hub.js`
  - `public/agent-review-prompts/*.md`
  - `public/agent-review-prompts/index.json`
  - `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/`
- Tests/verification passed:
  - `node --check server.js`
  - `node --test tests/one-time-wapi-scope-contract.test.js tests/agent-review-hub.test.js tests/agent-mode-operations-dropoff-prompts.test.js tests/provider-wapi-setup-portal.test.js`
- Secret/link guard:
  - Focused scan found no committed raw Zoom password link; the only matching Zoom meeting id evidence was an older redacted readback file with `pwd=[redacted]`.

## Evidence - 2026-07-08 Public Rabbi Alias And Assistant Isolation

- Requirement: `REQ-20260708-070`.
- Raw input: `raw-input/RAW-20260708-014-onetime-rabbi-public-assistant-isolation.md`.
- PQC packet:
  `ops/prompt-packets/2026-07-08-onetime-rabbi-public-assistant-isolation/00-onetime-rabbi-public-assistant-isolation.product-quality.json`.
- Code changes:
  - `/rabbi`, `/rabbi.html`, `/rabbi-preview`, and `/one-time-mishnayos` route to the focused OneTime landing instead of the old BNA provider-preview page.
  - OneTime public helper detection now uses OneTime route aliases and OneTime page data attributes, so join-domain `/` and aliases stay on `one_time_public`.
  - OneTime public helper visible copy now says `Rabbi Scheller Assistant` / Rabbi Scheller digital assistant with schedule/program/speak-to-Rabbi lead capture.
  - OneTime public helper data bypasses the generic BNA helper knowledge bundle.
  - Server one_time_public assistant context now starts from OneTime/Rabbi public knowledge and blocks generic BNA helper knowledge, raw transcripts, private portal data, and WhatsApp send claims.
- Verification passed:
  - `node --check server.js`
  - `node --test tests/one-time-brand-helper-isolation.test.js tests/rabbi-checkout-access.test.js` with 14/14 passing
  - `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-rabbi-public-assistant-isolation/00-onetime-rabbi-public-assistant-isolation.product-quality.json`
  - `npm run watchdog:protocol-drift`
  - `npm run watchdog:actions`
  - `npm run secrets:audit`
  - `git diff --check`
  - Local Playwright smoke report:
    `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/report.md`
- Guardrails: no WhatsApp sent, no WAPI credential stored, no transcript/Vimeo/Drive promotion, no parent invite resend, no payment/access/DNS/Zoom/email mutation.
- Deploy/live proof:
  - Pushed commit `cff35ec7` to `origin/master` and release branch `codex/deploy-onetime-rabbi-assistant-20260708`.
  - Deployed OneTime Railway deployment `554814f1-6ed1-4319-ad43-dee32f71c00e`; status reached `SUCCESS`.
  - `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed.
  - Live rendered Playwright smoke passed for `/`, `/one-time`, `/rabbi`, `/rabbi.html`, `/rabbi-preview`, and `/one-time-mishnayos`.
  - Live screenshot saved at `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/live-rabbi-helper-mobile.png`.
  - OneTime WhatsApp class link is now read from `ONE_TIME_WHATSAPP_CLASS_LINK` / related env names and is not committed in source.
- External-send status:
  - No WhatsApp was sent.
  - No parent invite resend was performed.
  - No payment/access/DNS/Zoom/Vimeo/Drive mutation was performed.

## Evidence - 2026-07-08 Agent Prompt Deploy And Live Readback

- Commits pushed:
  - `8fc92f71` - WAPI auto-reply gate and Agent Review prompt hardening.
  - `86e050f3` - Rabbi prompt correction requiring `Communications > WhatsApp`, WAPI readiness, real live parent/student login, and OneTime parent setup checks.
- OneTime deployments:
  - `b38765d5-7386-4f0d-ad9d-befe4005bee8` reached `SUCCESS`.
  - `7a499173-cb63-4c62-a651-d9197ce6218f` reached `SUCCESS`.
- Live verification:
  - `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed after each deploy.
  - Live prompt readback returned 200 for `https://join.onetimeonetime.com/agent-review-prompts/rabbi-provider-admin.md`.
  - Live prompt readback confirmed `Communications > WhatsApp`, `WAPI readiness`, `join.onetimeonetime.com/parent/login`, `join.onetimeonetime.com/student/login`, `join.onetimeonetime.com/one-time-parent`, and `Do not send a WhatsApp message`.
- Guardrails:
  - The final `one-time:target:guard` live route checks passed, but the release-gate wrapper reported unrelated dirty files in `memory/2026-07-08.md`, `tasks-pending/2026-07-08-onetime-vimeo-folder-v1-studio-workflow.md`, and `raw-input/RAW-20260708-012-onetime-vimeo-desktop-setup-test-continuation.md`; those files were not part of this deploy scope and were not staged.
  - No WhatsApp was sent.
  - No parent invite resend was performed.
  - No payment/access/DNS/Zoom/Vimeo/Drive mutation was performed.

## Evidence - 2026-07-08 Rabbi Provider Session UI Cleanup

- Product Quality Compiler packet:
  - `ops/prompt-packets/2026-07-08-onetime-rabbi-provider-session-ui/00-rabbi-provider-session-ui.product-quality.json`
- Implementation files:
  - `public/provider.html`
  - `public/css/one-time-shared-review.css`
  - `tests/one-time-provider-review-navigation.test.js`
- Local UI behavior:
  - Signed OneTime provider sessions now use the same Rabbi-facing section model as review/view-as.
  - Signed mode strips `review=one-time` and `TEST-ONETIME-REVIEW-ACCESS` role links from Parent, Student, Member, and Classroom shortcuts.
  - Signed CRM content uses OneTime action cards and count-based empty states instead of TEST parent/student fallback labels.
  - Generic provider setup/admin sections such as Commercial Model, External Apps, Access Checklist, API Usage, and Settings are no longer in the signed Rabbi section navigation.
  - OneTime sidebar rows now auto-size, preventing adjacent nav buttons from overlapping/intercepting clicks.
- Verification passed:
  - `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-rabbi-provider-session-ui/00-rabbi-provider-session-ui.product-quality.json`
  - `node --test tests/one-time-provider-review-navigation.test.js tests/provider-wapi-setup-portal.test.js tests/one-time-admin-mailbox-access.test.js` passed 15/15.
  - Targeted visual proof passed for desktop CRM, mobile CRM, and mobile WhatsApp setup: `ops/ui-audits/2026-07-08-onetime-rabbi-provider-session-ui/report.md`.
  - `npm run watchdog:protocol-drift`
  - `npm run watchdog:actions`
  - `npm run secrets:audit`
  - `git diff --check`
- External-send status:
  - No WhatsApp was sent.
  - No parent invite resend was performed.
  - No payment/access/DNS/Zoom/Vimeo/Drive mutation was performed.
- Deploy/live verification:
  - Commit `62d82621` pushed to `origin/master`.
  - Railway OneTime deployment `07a373a0-9598-4887-88bc-d60e92b5625f` reached `SUCCESS`.
  - `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed.
  - Live `https://join.onetimeonetime.com/provider.html` readback confirmed the signed-session code and live parent/student fallbacks.
- Closeout records:
  - `ops/agent-changelog.md`
  - `ops/agent-task-ledger.jsonl`

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
| B4 | WhatsApp bot MVP | `REQ-20260708-050` | Deployed; live send blocked on WAPI credentials, class-link env, and approval |
| B5 | Rabbi login/view-as and UI audit | `REQ-20260708-051`, `REQ-20260708-052` | Deployed/live smoke passed for `REQ-20260708-052` |
| B6 | Agent Mode autonomous loop prompts/drop-off hardening | `REQ-20260708-053` | Deployed and live prompt readback passed |
| B7 | Public signup strip and Agent Mode workflow prompt | `REQ-20260708-071` | In progress |
