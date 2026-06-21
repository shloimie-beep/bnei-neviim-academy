# Student Detail Scope Local Smoke - 2026-06-18

Result: passed

Checked local Operations on http://127.0.0.1:8095 with throwaway local Operations credentials.
Selected student ID used for detail-scope assertions: 999999 (synthetic fallback because the local BNA roster was empty).

## Assertions
- BNA Students roster requests students with project_key=bna.
- BNA Students roster was empty locally; using synthetic student_id=999999 to verify request scoping only.
- Selected student profile still requests the BNA-scoped student roster.
- Selected student profile requests assignments with project_key=bna and student_id.
- Selected student profile requests devices with project_key=bna and student_id.
- Selected student profile requests device rules with project_key=bna and student_id.
- Selected student profile requests accountability with project_key=bna and student_id.
- Selected student detail made no unscoped detail-data requests.
- Provider Students roster requests project_key=one_time_mishnah_class.
- Provider Students view makes no unscoped BNA Torah summary request.
- No body/document horizontal overflow on final desktop viewport.

## Screenshots
- ops/playwright-smokes/2026-06-18-student-detail-scope-local/bna-students-list-mobile.png
- ops/playwright-smokes/2026-06-18-student-detail-scope-local/bna-student-profile-mobile.png
- ops/playwright-smokes/2026-06-18-student-detail-scope-local/provider-students-scope-desktop.png
