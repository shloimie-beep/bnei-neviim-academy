# BNA Dashboard Restructure Brief For Kimi

## Goal

Rebuild the operations dashboard around the real BNA workflow:

- Telegram is the conversational input surface.
- Google Drive is the raw media input surface.
- The dashboard is a monitor/control-tower, not a manual data-entry screen.
- Every raw input should visibly land somewhere so Shloimie knows it did not disappear.

## Top-Level Navigation

Use only these top-level sections:

- Tasks
- Students
- Content
- Contacts
- Accounting

Remove or retire the old top-level concepts:

- Pipeline
- Signups
- Billing
- Ramble

## Tasks

Purpose: Shloimie rambles into Telegram. The system parses the ramble into tasks, decisions, prompts, and machine work.

Stages:

- Raw Input
- Needs Decision
- Assigned
- In Progress
- Done
- Archive

Rules:

- If the request is clear, capture it and act without asking.
- If it needs a decision, reply in Telegram with 2-3 crisp button options.
- Use "Needs Decision", not "Clarify".
- Owners are only `Shloimie` and `Kimi`.
- Priority buttons should be available in Telegram: urgent, today, this week, low.
- The dashboard should show what got captured and where it went.
- Do not add dashboard buttons for creating tasks. Input happens through Telegram.

## Students

Purpose: Track student accountability and private meeting growth.

Track:

- Student name
- Private meeting date
- Whether the student showed up
- Goals set
- Goals checked from prior meeting
- Struggles
- Interests
- Decisions and commitments
- Next check-in
- Discussion notes, including whether the student was talkative, stuck, hesitant, or had trouble making decisions

Rules:

- If a recording or ramble clearly names the student, match it automatically.
- If student match is uncertain, ask Shloimie in Telegram with buttons.
- Do not use this as a raw ramble dump.
- The dashboard should show student accountability state after parsing, not random unprocessed rambles.

## Content

Purpose: Track raw video/audio/text from intake through transcript, parsing, drafts, approvals, and publishing.

Stages/concepts:

- Raw intake
- Ingesting
- Transcribed
- Parsed
- WhatsApp ready
- Facebook ready
- YouTube branch
- Blog branch
- Newsletter branch
- Needs approval
- Approved
- Published

Current priority:

- WhatsApp first
- Facebook second

Later branches:

- YouTube
- Blog
- Weekly newsletter
- Google Business Profile

Rules:

- Uploads should not go straight to GHL.
- First ingest, store, transcribe, parse, and create drafts.
- Ask for approval in Telegram before publishing.
- For long WhatsApp videos, split as needed and return downloadable files plus copy.

## Contacts

Purpose: Parent/student anchor.

Track:

- Parent name, phone, email
- Student name
- Signup form status
- GHL sync state
- Tags
- Payment status summary

Do not call this "Signups" in the main navigation.

## Accounting

Purpose: Track parent payments, including cash and credit.

Rules:

- Default monthly charge is ILS 1000.
- Payments can be cash or credit.
- Green Invoice credit payments should reconcile into the same parent/contact system.
- If a parent paid before filling the form, capture it as payment intake and match it after the form is submitted.
- Accounting can be its own top-level view, but parent payment history should also be visible from Contacts later.

## Dashboard UX Rules

- Remove manual creation buttons from the dashboard.
- Do not show "New Task", "New Signup", "Add Entry", "Add Content Job", or "Log Payment" buttons.
- The dashboard is for visibility, review, and debugging the pipeline.
- Approvals and decisions should happen in Telegram.
- Keep language clean and BNA-specific.

## Immediate Cleanup

- Re-ingest old raw rambles that were stored in the wrong places.
- Map old task stages:
  - inbox -> Raw Input
  - clarify/plan/review -> Needs Decision
  - execute -> In Progress
  - complete -> Done
  - archive -> Archive
- Replace old labels everywhere users see them.

