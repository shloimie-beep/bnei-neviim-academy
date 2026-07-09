# RAW-20260709-001 - OneTime scope, UI, agent loop, and contact corrections

## Metadata

- Source: `codex_chat`
- Captured at: `2026-07-09T00:58:00+03:00`
- Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
- Privacy: `private_contact_details_redacted`
- Parse status: `registered`
- Requirement register:
  `tasks-pending/2026-07-09-onetime-scope-ui-agent-contact-corrections.md`

## Redaction note

The operator provided two email addresses and one phone number for boys already
attending the Zoom class. Those raw contact details are not committed to the
repo. They remain available from the Codex chat source for approved first-party
CRM/contact entry. Tracked files use redacted stable contact refs only.

## Raw intake, redacted

The operator reported that three boys usually come every day to the Zoom class
and gave the currently known contact details. They are not "local boys"; they
are boys already coming to the Zoom class. Payment status and geography are
unknown. They should be put in the system and tagged accordingly after first
testing sends to the operator-owned number.

The operator objected that the password reset link expired before he could use
it and asked why the reset password flow expires. He asked why WAPI did not
work and whether that status was sent to his Telegram bot. He wants ongoing
Telegram progress updates about what is going on.

The operator observed that the OneTime bot on `join.onetime...` still goes to
BNA Academy and said that this is problematic. OneTime must be completely
separated and scoped differently.

The operator shared provider view-as URLs for Rabbi Scheller and said the
Rabbi/admin preview layout is drastically different from the super-admin
layout. He wants the same high-level shell pattern as the BNA admin platform:
consistent side panel, categories, horizontal subcategories, top filters, and
workspace structure, with OneTime brand colors. The Rabbi view must not show
super-admin-only random diagnostics or "return to super admin" chrome in the
actual Rabbi login. CRM should feel like a real connected CRM: clicking a
person should open that person's card, notes, and conversation context.

The operator also reported that the student view still has major desktop
layout problems: off-centered layout, uneven horizontal cards, bad padding,
text too far left, options dropping lower, inconsistent rectangles, and
unprofessional spacing. He specifically asked Codex to use Playwright and
screen-level inspection before claiming UI work is done.

The operator provided an Agent Mode / Browser QA audit result where the agent
reached a blocked state but asked whether it should submit and seal. The
operator said the agent should obviously submit/seal blocked results
autonomously and report the blocker inside BNA Operations, not ask the operator
to do the autonomous loop's job.
