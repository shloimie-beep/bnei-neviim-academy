# OneTime Resend, WAPI, Rabbi Login, CRM, and Agent Loop - 2026-07-08

Raw input: `raw-input/RAW-20260708-010-onetime-resend-wapi-rabbi-login-crm.md`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260708-047 | Preflight deployed / needs operator decision | Resend the full OneTime parent email flow to the redacted operator Gmail address using the live launch-ready flow, no test labels, no BNA/Academy leakage, and a real live student display name. | Blocked by `DEC-20260708-009` for the actual resend. Live OneTime route is deployed and no-send dry run passed in `ops/watchdog-audits/2026-07-08-onetime-parent-student-auth-deploy-live-smoke.md`. Additional hardening deployed in commit `c471afb8` to OneTime Railway deployment `c378f14c-e42c-4f59-bae7-b0dd602415ab` (`SUCCESS`): the parent invite route now returns structured no-send preflight blockers, requires a real parent name, real live student name, and valid live shiur / Zoom URL before production sending, and accepts OneTime live-class URL aliases (`ONE_TIME_LIVE_CLASS_URL`, `ONE_TIME_ZOOM_JOIN_URL`, `ONE_TIME_TONIGHT_CLASS_LINK`). Verification passed: `node --check server.js`, focused parent/WAPI/provider/portal tests 35/35, `npm run watchdog:workspace-scope`, `npm run watchdog:actions`, `npm run watchdog:protocol-drift`, `npm run secrets:audit`, `git diff --check`, deploy success, and live OneTime smoke. Evidence: `ops/watchdog-audits/2026-07-08-onetime-parent-invite-preflight-live-smoke.md`. No parent invite email or WhatsApp was sent. |
| REQ-20260708-048 | Deployed / Needs operator input | Ingest Rabbi WAPI/WhatsApp credential folder into safe local secret/config handling without committing secrets, then verify sender/account readiness. | Deployed code supports OneTime/Rabbi-scoped WAPI env/local-secret names and scoped diagnostics. Live readback after deployment still showed WAPI outbound/sync not configured. Waiting for operator to paste/provide the WAPI folder/path; see `DEC-20260708-010`. |
| REQ-20260708-049 | Partial / one safe WhatsApp sent | Prepare a concise OneTime WhatsApp welcome/class-link message and send one approved test to the redacted operator phone from the Rabbi / OneTime sender after WAPI readiness and copy/link are verified. | Current class link is configured in OneTime Railway runtime. For the setup-email follow-up, Shloimie provided the Rabbi WAPI token and approved one WhatsApp to the operator number ending `2631`; Codex saved the token in gitignored `.secrets`, verified Whapi health, and sent one safe notice without the setup link. Broader auto-reply/class-link WhatsApp remains blocked until Railway runtime env and approval gates are intentionally configured. Evidence: `ops/access/2026-07-08-onetime-rabbi-wapi-token-and-whatsapp-send.md`. |
| REQ-20260708-050 | Deployed / WAPI credential blocked | Build/verify the OneTime WhatsApp bot MVP: immediate response, phone/contact capture, interest question, current class link send, and CRM communication log. | Deployed in commit `8fc92f71` to OneTime deployment `b38765d5-7386-4f0d-ad9d-befe4005bee8`; live OneTime smoke passed. Code evaluates OneTime WAPI inbound webhook scope, logs inbound messages into `bna_contact_communications`, stamps an auto-reply plan onto the inbound CRM record, and sends only when `ONE_TIME_WAPI_AUTO_REPLY_ENABLED=true`, `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM=APPROVE_ONE_TIME_WAPI_AUTO_REPLY`, `ONE_TIME_WHATSAPP_CLASS_LINK` is configured, and the sender uses `one_time_scoped` WAPI credentials. Runtime class-link readiness was fixed by `REQ-20260708-077`; live diagnostics now show `auto_reply_class_link_configured=true`, while WAPI remains blocked by missing token/disabled approval gates. No WhatsApp was sent. Evidence: `ops/watchdog-audits/2026-07-08-onetime-wapi-class-link-readiness.md`. |
| REQ-20260708-051 | Done / Email sent | Create a safe Rabbi Scheller scoped-login/password-setup flow so Shloimie can log in as Rabbi Scheller and inspect the Rabbi view without using the super-admin account. | Live readback showed Rabbi provider session and view-as routes work. Deployed OneTime-branded provider setup email with guarded admin recipient override. Setup email sent to redacted operator Gmail through Resend after deployment `6d74a813-235b-41f6-81ea-777f6a2183e8`; readback status `sent`, provider `resend`, subject OneTime-branded and not BNA-branded. |
| REQ-20260708-087 | Done / Email resent | Send a fresh audited OneTime/Rabbi provider setup email to the operator Gmail after the prior setup link expired, without exposing the raw token or changing the Rabbi provider contact record. | Raw input: `raw-input/RAW-20260708-025-onetime-rabbi-setup-email-resend.md`. Live `POST /api/bna/service-providers/1/setup-email` used confirmation gate `SEND_PROVIDER_SETUP_EMAIL_TO_OVERRIDE` and returned `success=true`, `email_sent=true`, `recipient_override=true`, provider `Rabbi Elie Scheller`, login username `one_time_admin`, and one-hour expiry. Provider-message readback found message `#3` with source `provider_setup`, `email_sent=true`, and `recipient_override=true`. Evidence: `ops/access/2026-07-08-onetime-rabbi-setup-email-resend.md`. No raw setup token, setup URL, session cookie, password, full recipient email, WhatsApp/WAPI send, payment/access grant, DNS, Zoom, Vimeo, Drive, Stripe, or external CRM mutation was committed. |
| REQ-20260708-052 | Deployed / live smoke passed | Polish Rabbi scoped UI: OneTime brand, no pictures, no BNA branding in user-visible Rabbi surfaces, no random diagnostic/configuration cards without actions, consistent side panel/top filter/button layout. | Implemented signed Rabbi provider sessions on the OneTime section model, sanitized review/test links in signed mode, replaced generic provider diagnostics with OneTime CRM/action content, and fixed OneTime sidebar row sizing so nav buttons do not overlap. Commit `62d82621` pushed and deployed to OneTime Railway deployment `07a373a0-9598-4887-88bc-d60e92b5625f`, status `SUCCESS`. Live smoke passed for `https://join.onetimeonetime.com`; deployed provider page readback confirmed `isSignedOneTimeProviderSession`, `Provider login active`, `RABBI ACCOUNT`, `/parent/login`, `/student/login`, and `signedOneTimeSession`. Evidence: PQC packet `ops/prompt-packets/2026-07-08-onetime-rabbi-provider-session-ui/00-rabbi-provider-session-ui.product-quality.json`; visual proof `ops/ui-audits/2026-07-08-onetime-rabbi-provider-session-ui/report.md`; tests 15/15; watchdog/action/secrets/diff gates passed. |
| REQ-20260708-053 | Deployed / live prompt readback passed | Verify and harden Agent Mode autonomous loop for this workstream: navigation-first prompts, Start/Drop-off/Readback path, failure/blocker reporting, and safe parallel execution. | Updated `src/lib/bna/agent-review-hub.js`, regenerated `public/agent-review-prompts/*.md`, and refreshed `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/` so agents must start/drop off through Operations, navigate exact Super Admin -> Rabbi -> real live parent/student login/setup/classroom paths, inspect Communications > Email and Communications > WhatsApp, and save BLOCKED/FAIL even when navigation breaks. Commits `8fc92f71` and `86e050f3` pushed; OneTime deployments `b38765d5-7386-4f0d-ad9d-befe4005bee8` and `7a499173-cb63-4c62-a651-d9197ce6218f` reached `SUCCESS`. Live readback of `https://join.onetimeonetime.com/agent-review-prompts/rabbi-provider-admin.md` confirmed `Communications > WhatsApp`, WAPI readiness, `parent/login`, `student/login`, `one-time-parent`, and the WhatsApp no-send guard. |
| REQ-20260708-054 | Deployed / WAPI credential blocked | Ensure OneTime CRM is built out for WAPI/WhatsApp contacts, communications, follow-up state, provider/Rabbi scope, and readback in Operations. | Deployed WAPI send path stamps project scope into outbound attempts/results and chooses OneTime-scoped WAPI credentials. Follow-up scopes inbound webhook records by OneTime workspace/project when supplied, records auto-reply readiness into CRM metadata/source context, exposes `auto_reply_configured` / `auto_reply_readiness` in WAPI diagnostics, and keeps live sends blocked without scoped WAPI token + class-link env + approval gate. Live WAPI setup remains not configured until `DEC-20260708-010` is resolved. |
| REQ-20260708-070 | Deployed / live smoke passed | Make the public Rabbi / OneTime landing aliases and helper bubble fully OneTime scoped: `/rabbi` must not serve the old BNA provider-preview page, and the public helper must present as Rabbi Scheller's digital assistant with schedule/program/speak-to-Rabbi lead capture and no BNA helper knowledge bleed. | Implemented route/helper/server scope fixes, pushed commit `cff35ec7`, and deployed OneTime Railway deployment `554814f1-6ed1-4319-ad43-dee32f71c00e` (`SUCCESS`). Standard live smoke passed for `https://join.onetimeonetime.com`. Rendered Playwright live smoke passed for `/`, `/one-time`, `/rabbi`, `/rabbi.html`, `/rabbi-preview`, and `/one-time-mishnayos`: each route served the OneTime landing, body scope was `bna-assistant-surface-one-time-public`, helper launcher read `Rabbi Scheller Assistant`, and old BNA preview/helper bad hits were absent. Evidence: raw intake `raw-input/RAW-20260708-014-onetime-rabbi-public-assistant-isolation.md`; PQC packet `ops/prompt-packets/2026-07-08-onetime-rabbi-public-assistant-isolation/00-onetime-rabbi-public-assistant-isolation.product-quality.json`; local proof `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/report.md`; live proof `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/live-report.md`; mobile screenshot `ops/ui-audits/2026-07-08-onetime-rabbi-public-assistant-isolation/live-rabbi-helper-mobile.png`. WhatsApp send and transcript knowledge promotion remain blocked by `DEC-20260708-010`, `DEC-20260708-011`, and Vimeo transcript decisions. |
| REQ-20260708-071 | Deployed / live smoke passed | Make the OneTime public landing signup workflow and Agent Mode audit workflow launch-ready: black/yellow header with black-on-white logo, yellow bottom-of-hero email-only Sign Up Now strip, safe first-party lead capture, focused WhatsApp/readiness prompt, and copied prompt lane tracking. | Raw input: `raw-input/RAW-20260708-015-onetime-public-signup-agent-workflow.md`. PQC packet passed validation: `ops/prompt-packets/2026-07-08-onetime-public-signup-agent-workflow/00-onetime-public-signup-agent-workflow.product-quality.json`. Implemented in `public/one-time/index.html`, `src/lib/bna/agent-review-hub.js`, `public/agent-review.html`, generated `public/agent-review-prompts/*.md`, tests, action registry, and `.gitignore` security cleanup. Commit `7c0de2ad` was pushed and deployed to OneTime Railway deployment `b14edf6d-eb9f-42f8-aafe-aea74c91d294` (`SUCCESS`). Local Playwright smoke passed at 1440/1024/768/430/390 with no old form fields/no overflow, mocked no-send synthetic signup, and Agent Review prompt-copy lane move. Live OneTime smoke passed for `https://join.onetimeonetime.com`; rendered live Playwright smoke passed at 1440/1024/768/430/390 with one visible email input, no retired fields, no horizontal overflow, black/yellow header, black-on-white logo mark, and live prompt readback for `one-time-public-signup-whatsapp-workflow.md`. Evidence: `ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/local-report.md`; `ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/live-report.md`; live screenshots in the same folder. Verification passed: focused tests 30/30, `node --check server.js`, PQC validation, action watchdog, protocol-drift watchdog, secrets audit after removing tracked provider diagnostics JSON from git, `git diff --check`, and updated live smoke contract. No WhatsApp/email/payment/access/external send was performed. |
| REQ-20260708-072 | Deployed / live smoke passed | Send Shloimie an internal Telegram bot reminder when someone signs up through the OneTime public signup form. | Raw input: `raw-input/RAW-20260708-016-onetime-signup-telegram-reminder.md`. Implemented in `server.js` for `/api/one-time/interest` and `/api/bna/product-leads` after the lead is saved. Runtime commit `fbabe124` pushed and deployed to OneTime Railway deployment `85b1f0f0-b3ae-49b1-8b00-9932a1cd7631` (`SUCCESS`). Production OneTime Railway variables now have `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_BNA`, and `TELEGRAM_CHAT_ID_SHLOIMIE` present by key-readback only, and env-enabled redeploy `14e74ce9-cc29-49a3-aed1-21ab0dfe1af3` reached `SUCCESS`. Verification passed: `node --check server.js`, focused OneTime tests 18/18, `npm run watchdog:actions`, `npm run watchdog:protocol-drift`, `npm run secrets:audit`, `git diff --check`, and live OneTime smoke. Evidence: `ops/watchdog-audits/2026-07-08-onetime-signup-telegram-reminder-live-smoke.md`. No live signup was submitted during smoke testing, and no parent email, WhatsApp, checkout, payment, access, Zoom, Vimeo, Drive, DNS, Stripe, or external CRM mutation was performed. |
| REQ-20260708-073 | Deployed / live timed smoke passed | Make the public OneTime landing helper concise and timed: first nudge after 10 seconds asks whether the visitor wants his son to love Torah; follow-up 20 seconds later says where the class is holding by masechta and that now is a great time to join. | Raw input: `raw-input/RAW-20260708-017-onetime-landing-helper-concise-timed.md`. Implemented for the OneTime public helper only in `public/js/bna-bot-widget.js` and `public/one-time/index.html`; internal action registry/tests updated. Runtime commit `27f55f6e` pushed and deployed to OneTime Railway deployment `76610b3c-3cfa-44d3-80f8-76a43f744a2b` (`SUCCESS`). Local and live Playwright timed smokes at `390x844` confirmed first nudge `Hi. Do you want your son to love Torah?` and second nudge `We are up to Maseches Berachos now. It is a great time to join.` Evidence: `ops/ui-audits/2026-07-08-onetime-concise-helper/local-report.md` and `ops/ui-audits/2026-07-08-onetime-concise-helper/live-report.md`. Verification passed: `node --check server.js`, focused tests 11/11, `npm run watchdog:actions`, `npm run watchdog:protocol-drift`, `npm run secrets:audit`, `git diff --check`, deployment success, standard live smoke, and live timed helper smoke. No signup/email/WhatsApp/payment/access/Zoom/Vimeo/Drive/DNS/Stripe/external CRM mutation was performed. |
| REQ-20260708-074 | Done / Emails sent | Urgently send the current OneTime Mishnah live-class link to CRM contacts tagged as local students / local class attendees. | Raw input: `raw-input/RAW-20260708-018-onetime-local-student-current-link-resend.md`. Live OneTime CRM resolved 3 local-tagged contacts, not 2; because the operator named the tag segment explicitly, Codex sent to the exact local-tagged segment. Three individual OneTime Resend emails were sent with the current Zoom link, drafts #4-#6, provider messages fingerprinted, CRM notes #9-#11 created, and Rabbi provider mailbox readback found 3 matching current-link threads. Evidence: `ops/live-smokes/2026-07-08T17-12-00-033Z-one-time-local-student-current-link-resend.md`. Guardrails held: OneTime/Rabbi scope only, one-recipient drafts only, no raw recipient emails or raw Zoom password link in repo evidence, and no WAPI/WhatsApp/payment/access/DNS/Zoom meeting/Vimeo/Drive/external CRM mutation. |
| REQ-20260708-075 | Done / Email sent | Send a one-off OneTime Mishnayos Zoom-link-only email to the operator-specified recipient, with no portal/login/setup links. | Raw input: `raw-input/RAW-20260708-019-onetime-direct-zoom-link-email.md`. Sent one individual OneTime Resend email, draft #7, with only minimal class context and the Zoom link in the email body. Provider message ID is stored only as a fingerprint and provider mailbox readback found 4 matching Zoom-link threads. Evidence: `ops/live-smokes/2026-07-08T17-17-31-400Z-one-time-direct-zoom-link-only-email.md`. Guardrails held: no parent/student portal, login, password reset, classroom code, billing, trial, WhatsApp/WAPI, payment/access, account grant, DNS, Zoom meeting creation, Vimeo, Drive, or external CRM mutation. Raw recipient email and raw Zoom URL are not committed. |
| REQ-20260708-076 | Done / Telegram updates sent | Send brief bullet-point Telegram updates when Codex completes work, including done, verified, blocked, and next-step lines. | Raw input: `raw-input/RAW-20260708-020-codex-telegram-done-updates.md`. Updated existing `npm run telegram:codex-progress` path to output short bullets for Done, Verified, optional Blocked, Next, and task/packet reference. Verification passed 3/3 and two live Telegram progress updates were sent with token/chat id hidden: one for the formatter/WAPI blocker summary and one for the OneTime runtime class-link readiness result. Evidence: `ops/watchdog-audits/2026-07-08-codex-progress-telegram-update.md`. |
| REQ-20260708-077 | Done / Runtime class-link configured | Configure the current OneTime class link in runtime environment variables so WAPI/WhatsApp and parent-invite readiness checks no longer fail on a missing class link, while keeping live WhatsApp sends disabled until Rabbi-scoped WAPI credentials and approval gates are present. | Raw input: `raw-input/RAW-20260708-021-onetime-runtime-class-link-wapi-readiness.md`. Set `ONE_TIME_WHATSAPP_CLASS_LINK`, `ONE_TIME_LIVE_CLASS_URL`, `ONE_TIME_CURRENT_CLASS_LINK`, and `ONE_TIME_ZOOM_JOIN_URL` on OneTime Railway production with `--skip-deploys`, redeployed OneTime deployment `e724304b-671b-4ea8-8514-5ed2ed9acc72` to `SUCCESS`, and live WAPI diagnostics now show `auto_reply_class_link_configured=true`. WAPI remains safely blocked by disabled auto-reply approval gates and missing OneTime/Rabbi WAPI token. Evidence: `ops/watchdog-audits/2026-07-08-onetime-wapi-class-link-readiness.md`. |
| REQ-20260708-088 | Done / WhatsApp sent | Send one WhatsApp from the Rabbi/OneTime sender to the operator WhatsApp number as a setup-email follow-up. | Raw input: `raw-input/RAW-20260708-026-onetime-rabbi-whatsapp-setup-notice.md`. Initial live diagnostics were blocked by missing WAPI token. Shloimie then identified the provided secret as the Rabbi token. Codex saved it in gitignored `.secrets`, verified Whapi health `status=AUTH`, then sent one safe WhatsApp notice to the operator number ending `2631`: "Hi, this is OneTimeOneTime Mishnah. I just resent the secure Rabbi workspace setup email. Please use the email link to log in. For safety, I am not sending the login link over WhatsApp." Provider result: `status_code=200`, message id present, fingerprint `02b1625c5735`. Evidence: `ops/access/2026-07-08-onetime-rabbi-wapi-token-and-whatsapp-send.md`. |
| REQ-20260708-089 | Done / Secret saved locally | Store the provided Rabbi/OneTime WAPI token in a safe local secret location and verify without exposing it. | Raw input: `raw-input/RAW-20260708-027-rabbi-wapi-token-save.md`. Stored in gitignored `.secrets/one-time-wapi-api-token.txt` and `.secrets/rabbi-sheller-wapi-api-token.txt`. Token length `32`, fingerprint `1bf76f7c0a3a`. No token value was committed or printed in evidence. Railway/runtime env was not mutated by this save step. |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-20260708-009 | Exact live OneTime student display name for the parent invite resend. | The previous record still had old test/walkthrough labels. The cleaned route correctly requires a real `student_name` for live sends. | Shloimie | Reply with the exact student display name to show in the email. | Explicitly approve using an existing real student name from the operator family; do not resend. | Guessing risks creating/sending another wrong live record or mixing BNA student data into OneTime. | Provide the exact OneTime student display name for the resend. | `REQ-20260708-047` | Needs operator decision |
| DEC-20260708-010 | Rabbi WAPI credential/source configuration. | Rabbi WAPI token was provided and saved locally, but has not been propagated into Railway/runtime env. | Shloimie/Codex | Keep the token in gitignored `.secrets`; propagate to Railway only in a separate explicit runtime-config step with redacted proof. | Use token only for direct one-off sends; postpone auto-reply. | Wrong persistence or broad runtime enablement could send from the wrong sender or activate automation too early. | If app/runtime sends are needed, intentionally set `ONE_TIME_WAPI_API_TOKEN` / `RABBI_SHELLER_WAPI_API_TOKEN` in OneTime Railway and live-smoke diagnostics without printing the token. | `REQ-20260708-048`, `REQ-20260708-049`, `REQ-20260708-050` | Partially resolved; runtime env pending |
| DEC-20260708-011 | WhatsApp test send payload approval. | Shloimie approved one setup-email follow-up WhatsApp to the operator number ending `2631`; broader WhatsApp bot/auto-reply still needs runtime env and gates. | Shloimie/Codex | For one-off sends, use explicit recipient/copy approval and no setup/login links. For automation, keep WAPI sends disabled until runtime token/account and approval gates are configured. | Send rough ramble copy; do no WhatsApp send. | Sending too early can produce an incorrect live message, expose the wrong sender, or message from a non-Rabbi WhatsApp account. | Completed one safe setup-email notice. Future class-link/auto-reply sends require separate approval and runtime readiness. | `REQ-20260708-049`, `REQ-20260708-088` | Resolved for setup notice; auto-reply pending |
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

## Evidence - 2026-07-08 Local Student Current-Link Resend

- Requirement: `REQ-20260708-074`.
- Raw input: `raw-input/RAW-20260708-018-onetime-local-student-current-link-resend.md`.
- Live recipient resolution:
  - OneTime CRM scope: `rabbi_sheller_provider` / `one_time_mishnah_class`.
  - Filter: `local_class_attendee`, `zoom_mishnayos_class`, `local_student`, or matching metadata flags.
  - Result: 3 local-tagged contacts resolved. The operator said "two students" but also explicitly named the CRM local-student tag segment; Codex sent to the exact tag segment.
- External send performed:
  - 3 individual one-recipient OneTime Resend emails sent.
  - Draft ids: #4, #5, #6.
  - CRM notes: #9, #10, #11.
  - Provider mailbox readback found 3 matching current-link threads.
- Evidence:
  - `ops/live-smokes/2026-07-08T17-12-00-033Z-one-time-local-student-current-link-resend.md`
  - `ops/live-smokes/2026-07-08T17-12-00-033Z-one-time-local-student-current-link-resend.json`
- Verification passed:
  - `node --check scripts/send-onetime-local-class-link-update.mjs`
  - `node --test tests/onetime-local-class-link-update-script.test.js`
  - leak scan over scoped files found no raw Zoom password URL and no raw Gmail addresses
- Guardrails:
  - The report redacts recipient emails and the Zoom password URL.
  - No WhatsApp/WAPI send was attempted because the live OneTime WAPI credentials remain blocked.
  - No payment/access, DNS, Zoom meeting creation, Vimeo, Drive, Stripe, or external CRM mutation was performed.

## Evidence - 2026-07-08 Direct Zoom-Link-Only Email

- Requirement: `REQ-20260708-075`.
- Raw input: `raw-input/RAW-20260708-019-onetime-direct-zoom-link-email.md`.
- External send performed:
  - 1 individual OneTime Resend email sent.
  - Draft id: #7.
  - Provider message id stored only as a fingerprint in evidence.
  - Provider mailbox readback found 4 matching Zoom-link threads.
- Evidence:
  - `ops/live-smokes/2026-07-08T17-17-31-400Z-one-time-direct-zoom-link-only-email.md`
  - `ops/live-smokes/2026-07-08T17-17-31-400Z-one-time-direct-zoom-link-only-email.json`
- Guardrails:
  - The email body was Zoom-link-only with minimal class context.
  - No portal, login, password reset, parent setup, student setup, classroom code, billing, or trial links were included.
  - Repo evidence redacts the recipient email and the entire Zoom URL.
  - No WhatsApp/WAPI, payment/access, account grant, DNS, Zoom meeting creation, Vimeo, Drive, Stripe, or external CRM mutation was performed.

## Evidence - 2026-07-08 Telegram Codex Done Updates

- Requirement: `REQ-20260708-076`.
- Raw input: `raw-input/RAW-20260708-020-codex-telegram-done-updates.md`.
- Implementation files:
  - `scripts/send-codex-progress-telegram.mjs`
  - `tests/codex-progress-telegram.test.js`
- Verification:
  - `node --test tests/codex-progress-telegram.test.js` passed 3/3.
  - Dry-run preview rendered the expected bullet format.
  - Two live Telegram progress updates were sent: both `sent=true`,
    `message_id_present=true`; message sizes were 397 and 486 characters.
- Evidence:
  - `ops/watchdog-audits/2026-07-08-codex-progress-telegram-update.md`

## Evidence - 2026-07-08 WAPI Class-Link Runtime Readiness

- Requirement: `REQ-20260708-077`.
- Raw input: `raw-input/RAW-20260708-021-onetime-runtime-class-link-wapi-readiness.md`.
- Runtime changes:
  - Set `ONE_TIME_WHATSAPP_CLASS_LINK`, `ONE_TIME_LIVE_CLASS_URL`, `ONE_TIME_CURRENT_CLASS_LINK`, and `ONE_TIME_ZOOM_JOIN_URL` on OneTime Railway production with `--skip-deploys`.
  - Redeployed OneTime deployment `e724304b-671b-4ea8-8514-5ed2ed9acc72`; status `SUCCESS`.
- Live WAPI diagnostics after redeploy:
  - `auto_reply_class_link_configured=true`
  - `auto_reply_credentials_configured=false`
  - `auto_reply_ready=false`
  - blockers: `ONE_TIME_WAPI_AUTO_REPLY_ENABLED not enabled`, `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM must equal APPROVE_ONE_TIME_WAPI_AUTO_REPLY`, `OneTime WAPI token missing`
  - `external_write_performed=false`
- Verification:
  - `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed.
- Evidence:
  - `ops/watchdog-audits/2026-07-08-onetime-wapi-class-link-readiness.md`
- Guardrails:
  - No raw Zoom URL committed.
  - No WAPI auto-reply or approval gate was enabled.
  - No WhatsApp/WAPI message was sent.

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
| B1 | Parent invite resend readiness | `REQ-20260708-047` | Preflight deployed; actual resend blocked on exact student display name |
| B2 | WAPI/CRM audit and safe config | `REQ-20260708-048`, `REQ-20260708-054` | Pending |
| B3 | WhatsApp no-send preview and single test send | `REQ-20260708-049` | Pending WAPI credentials/sender approval |
| B4 | WhatsApp bot MVP | `REQ-20260708-050` | Deployed; class-link env configured; live send blocked on WAPI credentials and approval |
| B5 | Rabbi login/view-as and UI audit | `REQ-20260708-051`, `REQ-20260708-052` | Deployed/live smoke passed for `REQ-20260708-052` |
| B6 | Agent Mode autonomous loop prompts/drop-off hardening | `REQ-20260708-053` | Deployed and live prompt readback passed |
| B7 | Public signup strip and Agent Mode workflow prompt | `REQ-20260708-071` | Deployed/live smoke passed |
| B8 | OneTime signup Telegram reminder | `REQ-20260708-072` | Deployed/live smoke passed |
| B9 | Concise OneTime landing helper nudges | `REQ-20260708-073` | Deployed/live timed smoke passed |
| B10 | Urgent local-student current class-link resend | `REQ-20260708-074` | Done / 3 individual emails sent |
| B11 | One-off Zoom-link-only email | `REQ-20260708-075` | Done / 1 individual email sent |
| B12 | Telegram Codex done updates | `REQ-20260708-076` | Done / live updates sent |
| B13 | OneTime runtime class-link readiness | `REQ-20260708-077` | Done / WAPI class-link blocker cleared |
