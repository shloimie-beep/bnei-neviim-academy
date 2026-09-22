# PKT-20260712-108 - One Time Portal Shell And Preview Boundaries

Parent raw ID: `RAW-20260712-004`
Requirement: `REQ-20260712-108`
Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`

## Scope

Implement only the One Time portal shell and preview-boundary layer:

- Rename `/rabbi-member` user-facing labels to `Family Portal`.
- Clarify `/one-time-parent` as parent account setup/reset.
- Add shared One Time portal shell CSS/JS for Family, Student review, Classroom, Library, parent setup/reset, and parent review surfaces.
- Replace pseudo-element mobile hamburger affordances with a real accessible menu button.
- Add visible `TEST PREVIEW / SAMPLE DATA / NO WRITES` review banner and `Exit Preview`.
- Preserve review links across Family, Student, Classroom, and Library preview flows where preview routes exist.
- Prove preview fixtures remain `TEST-*` / `@example.test` and no external write occurs.

## Out Of Scope

- No landing WhatsApp launcher, performance/bundle delivery, deploy, live smoke, payments, access grants, Zoom/Drive/Vimeo/provider writes, GHL, LeadConnector, external sends, or production-data mutation.
- Do not solve the whole parent ramble. Complete only this packet's scope and record the next packet or blocker.

## Acceptance

- Family, Student, Classroom, Library, and parent setup/reset labels are role-appropriate.
- Mobile menu is a real focusable button with `aria-controls`, `aria-expanded`, Escape/backdrop close, focus trap, and focus return.
- Review mode clearly says TEST preview/sample data/no writes and can exit preview.
- Local smoke captures desktop/tablet/mobile proof and asserts no production fixture or external-write path.
