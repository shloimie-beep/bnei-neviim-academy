# Rabbi Scheller / One Time White-Label Onboarding, Google, Content, CRM Follow-Up

Date: 2026-06-14
Source brief: `C:\Users\User\Downloads\BNA_Codex_Rabbi_Sheller_WhiteLabel_Onboarding_Google_Content_Superprompt_2026-06-14 (1).md`

## Current Status

The superprompt has been imported as an active Codex build brief. Treat this as
continuation work on the existing BNA/One Time goal-mode branch, not as a new
greenfield project.

Current branch:

`cleanup/onboarding-helper-crm-workspace-rabbi`

Preflight snapshot:

`ops/worktree-snapshots/2026-06-14T18-50-41-pre-rabbi-whitelabel-onboarding.md`

Safety archives:

- `.runtime/pre-rabbi-whitelabel-onboarding-20260614-185041.patch`
- `.runtime/pre-rabbi-whitelabel-onboarding-status-20260614-185041.txt`

## Already Completed / Verified In Existing 2026-06-14 Work

- Public/portal privacy hardening was deployed and live-smoked. Public pages,
  parent onboarding, and student login should not leak private parent/student
  records from stale browser state.
- Preview-only One Time Mishnah funnel exists at `/preview/one-time-mishnah`
  and `/one-time-preview`; checkout remains inactive and the live Rabbi site
  was not replaced.
- Official Rabbi/One Time audit docs exist under `ops/rabbi-scheller/` and
  related audit docs exist under `ops/audits/`.
- Operations Settings > Google Workspace is deployed with Drive, Calendar,
  Classroom, and Google Business Profile readiness cards.
- Drive actions are preview-only dry-runs until Google scope policy/test-user
  OAuth and explicit external-write approval are ready.
- Manual provider Google Business/Profile link capture is deployed as an
  approval-gated action without live Google Business Profile API calls.
- WAPI phonebook grouping and manual correction apply UI are deployed. The
  correction flow previews local CRM writes first, requires
  `APPLY_WAPI_CORRECTION`, can update first-party `bna_contacts` and linked
  `bna_parent_leads`, and skips student/signup/provider record mutation.
- Telegram note-to-CRM matching is deployed and live-smoked as a no-send local
  CRM note capture path.
- Parent announcement approved-draft persistence/readback is deployed and
  live-smoked. It reuses local `bna_weekly_updates`, requires
  `APPROVE_PARENT_ANNOUNCEMENT`, and sends nothing during approval/readback.
- Local keyholder workflow exists at `C:\Users\User\BNA-Keyholder`; no secret
  values should be pasted into chat or committed.
- Registration toolbar/parent-permission notice deploy gate is closed.

## Completed In This Pass

- Created worktree snapshot and safety archives before new implementation.
- Promoted the superprompt into `MEMORY.md`, `TASKS.md`,
  `SYSTEM-STATE.md`, daily memory, changelog, ledger, and this handoff.
- Re-ran route privacy checks locally. The first browser pass found public
  provider routes did not clear stale `bnaStudentAccessCode` values.
- Fixed stale student-code clearing on:
  - `public/service-providers.html`
  - `public/providers-join.html`
  - `public/provider-profile.html`
- Added regression coverage in `tests/universal-assistant-contract.test.js`.
- Verified locally with focused tests 36/36, full `npm test` 357/357, and
  local Playwright route audit 17/17.
- Deployed Railway bundle `f2595077-6c36-4a04-a5b8-a69452d3dfa5`.
- Post-deploy Railway doctor, app smoke, and live provider/privacy browser
  smoke passed.
- Follow-up WAPI manual correction work was deployed in Railway deployment
  `4c152697-dbd0-4dd7-8834-83b483999459`: Operations now previews local CRM
  contact/lead tag writes before confirmed correction apply, and the live
  endpoint/browser smokes passed without sending WhatsApp or saving a smoke
  correction.

Reports:

- `ops/qa-runs/2026-06-14T19-00-38-rabbi-whitelabel-onboarding-qa.md`
- `ops/playwright-smokes/2026-06-14-rabbi-whitelabel-provider-privacy-live/report.md`
- `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`
- `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`

## Immediate Next Actions

1. Keep the dirty worktree preserved and classify changes into commit groups
   before staging anything.
2. Build the Rabbi Mishnayos parent/member onboarding flow as a guided chat
   lead capture that creates a scoped lead/contact, ticket/task, transcript,
   and safe next-step preview.
3. Add task natural-language cleanup dry-run script so vague ramble-derived
   titles can become actionable scoped tasks without losing provenance.
4. Continue One Time content-library skeleton work: video/content job records,
   thumbnails/transcripts/worksheets/social/newsletter draft states, and
   workspace-scoped access.
5. Continue the full WAPI phonebook-first conversation workspace: contact list,
   conversation pane, notes, tickets, tasks, and linked-record timeline.

## Hard Gates

- Do not replace Rabbi Scheller's live production site until Shloimie reviews
  and approves a preview.
- Do not activate checkout, final pricing, or live payment links without
  Shloimie approval.
- Do not perform live Google Calendar/Classroom/Drive/Business Profile writes
  from natural language without draft preview and explicit confirmation.
- Do not expose BNA private students/accounting/family accountability data to
  Rabbi, One Time parents/students, service providers, or public pages.
- Do not run live email/WhatsApp/SMS sends during testing unless explicitly
  approved.
- Do not introduce GHL/LeadConnector runtime paths; active CRM/provider/contact
  work stays first-party BNA plus approved connectors such as Buffer/WAPI.

## Product Direction To Preserve

- Rabbi Scheller / One Time is the first real service-provider workspace under
  a broader BNA white-label/workspace model.
- Shloimie is platform super admin/admin manager; Rabbi Scheller is a scoped
  provider/teacher admin.
- One Time parents/students/members are separate from BNA school
  parents/students and separate from family accountability workspaces.
- The main One Time offer is live Mishnayos/community membership, with video
  library as support/fallback rather than the only CTA.
- Pricing must stay config-driven until approved.
- Content intake should support Drive/upload -> transcript -> library ->
  worksheet/source sheet -> newsletter/social drafts -> approval queue.
- Google work is layered: manual/no-OAuth now, test-user OAuth next,
  verification package later.

## Verification To Run Next

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs` if touched
- `node --test tests/parent-student-portal-contract.test.js tests/universal-assistant-contract.test.js`
- `npm test`
- Browser privacy audit for:
  `/`, `/index.html`, `/parent`, `/parent.html`, `/parent/login`,
  `/student`, `/student.html`, `/student/login`, `/provider/login`,
  `/service-providers`, `/providers`, `/become-service-provider`,
  `/operations`, including `?onboard=accountability`, `?source=pwa`, and
  `?public` variants where relevant.

## Remaining Operator Decisions

- Approve final One Time landing page copy/offer/pricing/payment path.
- Confirm Rabbi Scheller social destinations and Buffer/social scheduler setup.
- Provide or confirm any needed Gemini/Vimeo/Zoom/Google/Resend/payment secrets
  through the local keyholder workflow, not chat.
- Confirm whether and when Rabbi should receive scoped login instructions.
