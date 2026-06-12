# Scoped Bot Contexts

These files define what each assistant context may read, say, and do.

Runtime records may later move to the database, but the repo templates stay as
the source-of-truth policy for exports and audits.

## Types

- `super_admin.md`
- `workspace_admin_template.md`
- `parent_template.md`
- `student_template.md`
- `provider_admin_template.md`
- `provider_member_template.md`

## Log Fields

Every bot run should log user, role, prompt, retrieved context summary,
proposed actions, executed actions, blocked/safety flags, timestamp, and audit
link.
