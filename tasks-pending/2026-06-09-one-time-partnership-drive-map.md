# One Time Partnership Drive Map

Captured: 2026-06-09

## Intent

Create a separate Google Drive workspace and project/task map for the Rabbi
Elie One Time Mishnah Class partnership proposal, distinct from the BNA Academy
media pipeline.

The operator uploaded:

- `Rabbi_Sheller_Shloimie_50_50_Partnership_Proposal_2026-06-09.docx`

## Proposal Summary

The proposal describes a 50/50 partnership to build a paid online Mishnayos
platform around Rabbi Elie's audience, daily classes, videos, worksheets/source
sheets, and Shloimie's GHL/business system.

Initial product focus:

- Video Library at `$67/month`
- Live Membership at `$149/month`
- Premium Cohort at `$3,000 / 12 weeks` as a later/future offer only after both
  sides agree

Core responsibility split:

- Rabbi Elie: Torah product, teaching, content, educational direction, parent
  trust, student fit, and Torah/education responses.
- Shloimie: GHL, landing pages, automations, billing/admin, ad tracking,
  reporting, content workflows, Drive workflows, and technical operations.

## Drive Structure To Maintain

Drive root:

- `My Drive / One Time Mishnah Class - Rabbi Elie Scheller`
- Folder:
  `https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`

Non-canonical draft folder:

- `BNA V2 / 50 One Time Mishnah Class - Partnership Project`
- This was created by the first draft of the setup script and should not be the
  folder Shloimie uses unless he explicitly asks to merge or clean up Drive.

Subfolders:

- `00 Start Here - Proposal and Project Map`
- `01 Agreement and Values`
- `02 Offer, Pricing, and Policies`
- `03 GHL and Community Setup`
- `04 Content and Media Intake`
- `05 Marketing and Launch`
- `06 Bot and Agent Loop`
- `07 Finance, Reporting, and Admin`
- `08 Shiur and Source Materials`
- `09 Claude Drafting Tasks`
- `90 Completed and Approved`
- `99 Needs Shloimie Decision`

The original proposal upload should be preserved. A project copy should live in
`00 Start Here - Proposal and Project Map`.

Current verified Start Here contents after the 2026-06-10 final-proposal refresh:

- Canonical project copy of
  `Rabbi_Sheller_Shloimie_50_50_Full_Workflow_Proposal_2026-06-10.docx`:
  `https://docs.google.com/document/d/1fOqY1fgje49rD9gW9xWmW2RZ3hRQ8Whq/edit`
- `00 One Time Partnership Project Map`:
  `https://docs.google.com/document/d/1r67dYC-fXNIc8_Gv7WqPq0ud-4sdgN_2QIv6fSRYjTE/edit`
- `01 Task Map - Codex Claude Shloimie Rabbi Elie`:
  `https://docs.google.com/document/d/1g2qW8n_D_nH9hrFdaItQXy-c0u6r29PKV-mQd4aER7Q/edit`
- `02 Drive Folder Rules`:
  `https://docs.google.com/document/d/1sWzJe8bY9PVk7C-atvUyTH6WtpOcYqTsUqE8HO43jC8/edit`

Archived historical/superseded proposal copies:

- June 9 draft:
  `https://docs.google.com/document/d/1egcDUVYcP5oAW4-h-JWfF1vhZmUzul7N/edit`
- Superseded generic copy:
  `https://docs.google.com/document/d/1TfOILYcMgPytKFI0d0IxuuIvFXySUcS8/edit`

## Project Task Map

### Shloimie Decisions

- Approve the partnership values that must be explicit before building:
  punctuality, quality bar, no shortcuts, transparency, responsibility, and
  clean business conduct.
- Decide the One Time agent-loop runtime:
  - Railway worker for `npm run telegram:rabbi`
  - local Windows service for bridge plus Chrome/GHL work
  - API-only planning before live Rabbi bot
- Confirm initial offer order: Live Membership first, Library support tier
  second, Premium Cohort later.
- Confirm what counts as shared platform revenue vs Rabbi Elie private work.
- Confirm hard expense approval rules.
- Confirm refund/cancellation, family/device, Zoom/access, and payment
  processor policies before public launch.

### Codex Work

- Keep the One Time Drive section organized.
- Map GHL API support before any writes.
- Design One Time content/media intake from Drive drops into content packages,
  source sheets, recordings, clips, and approval flows.
- Configure Rabbi bot runtime only after scoped credentials and runtime choice
  are known.
- Convert each GHL automation into one workflow card, observe current state
  first, get approval, execute, then smoke-test.
- Build/report lead, customer, revenue, expense, ad performance, churn, failed
  payment, refund, and partner-distribution tracking.

### Claude Or Drafting Assistant Work

- Rewrite the uploaded proposal into a cleaner final partnership agreement
  draft.
- Extract a values checklist and plain-language operating rules.
- Draft policy wording for refund/cancellation, family/device access, question
  submission, and community boundaries.
- Draft Library and Live Membership landing-page copy variants.
- Draft warm-launch email sequences for the 1,500 interested emails and
  reactivation copy for past `$9` and `$30` customers.
- Turn videos/source sheets into summaries, worksheet drafts, ad angles,
  testimonial request copy, and FAQ drafts.

Claude/drafting-agent work is text drafting only. Codex owns repo, Drive, app,
GHL API/browser automation, tests, deploys, and verification.

## Guardrails

- Do not mix BNA private Students, Accounting, Devices, or parent/student
  accountability into the One Time workspace.
- Do not perform automatic GHL writes without a current-state audit and explicit
  approval for the specific write plan.
- Do not expose secrets, credentials, student access codes, payment tokens, or
  private BNA data in the Rabbi bot or Drive docs.
- Keep live tasks scoped to the existing `One Time Mishnah Class` project, not a
  new database or a new dashboard lane.

## Verification Target

- Canonical top-level Drive section exists.
- Uploaded proposal original is preserved, and a project copy is filed into the
  project Start Here folder.
- Drive contains starter docs for project map, task map, and folder rules.
- Repo report exists under `ops/one-time-mishnah-class/`.
- Local Drive API verification confirms the canonical folder tree and Start Here
  contents.

## 2026-06-10 Refresh

- Re-ran `npm run drive:setup-one-time`.
- Confirmed the canonical separate Drive workspace still exists:
  `https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`.
- Confirmed the exact final/later proposal upload exists and is the canonical
  source:
  `https://docs.google.com/document/d/1ZHr8ZNg6q_YDTvg4vG-T3jdK0P6GrPIn/edit`.
- Copied that final proposal into `00 Start Here`:
  `https://docs.google.com/document/d/1fOqY1fgje49rD9gW9xWmW2RZ3hRQ8Whq/edit`.
- Archived the June 9 draft and superseded generic Start Here copy under
  `90 Completed and Approved / Historical Drafts`.
- Updated starter docs and local report:
  `ops/one-time-mishnah-class/partnership-drive-map.md`.
