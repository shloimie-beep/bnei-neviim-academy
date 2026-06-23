# Implemented - Parent Login / Navigation / Weekly Update / Rabbi Audit

Completed locally: 2026-06-12

Source prompt:

- `ops/pro-codex/inbox/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md`

Implemented:

- Parent weekly update first on home.
- Parent/student localized naming and helper wording.
- Parent report-problem review-ticket path with no automatic Codex task.
- Weekly meeting fallback at 09:40-10:00 Sunday-Thursday.
- Portal hiding for the known bad coastal transcript correction.
- Action registry support for `create_report_problem_ticket`.
- Operations decision cards with visible options/pros/cons.
- Rabbi Sheller provider intake scaffold.

Verification:

- `npm test` passed 276/276.
- `npm run screenshot` passed.
- `npm run app:smoke` passed against `http://127.0.0.1:8102`.
- `npm run railway:doctor` passed.
- `npm run openai:smoke` failed because the local OpenAI key is invalid.

No deployment was run.
