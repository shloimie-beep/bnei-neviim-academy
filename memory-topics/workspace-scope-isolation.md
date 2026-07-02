# Workspace Scope Isolation Memory

- Public pages and public helper context are anonymous-safe.
- Rabbi/provider scope cannot read unrelated BNA, global, family, parent,
  student, provider, WhatsApp, WAPI phonebook, or super-admin data.
- Student scope cannot expose admin/provider/parent/private cross-student data.
- Parent scope can show only approved parent-visible data for linked students.
- Support/admin diagnostics belong behind a support drawer or role gate, not in
  normal Rabbi/member/student/parent views.
- Scope contamination findings for One Time UI cleanup must check contacts,
  communications, tasks/decisions, classroom/content records, payments/access,
  questions/responses, and integration diagnostics.
