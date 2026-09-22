# Route Registry Expectations

| id | surface | view_class | auth | route | route_registry |
| --- | --- | --- | --- | --- | --- |
| operations-onetime-workspace | Super Admin Operations One Time workspace | SHLOIMIE_PLATFORM_SUPPORT | operations | /operations?workspace=rabbi_sheller_provider | /operations |
| operations-rabbi-email-inbox | Operations Communications / Rabbi email inbox | SHLOIMIE_PLATFORM_SUPPORT | operations | /operations?workspace=platform&view=communications&section=email&inbox=rabbi | /operations |
| provider-admin-mailbox | Admin-on-provider portal mailbox | RABBI_PROVIDER_ADMIN | admin_provider_session | /provider.html?admin_provider=one-time&section=mailbox | /provider.html?admin_provider=one-time&section=mailbox |
| provider-normal-entry | Normal provider portal entry | RABBI_PROVIDER_ADMIN | none | /provider.html | /provider.html |
| rabbi-member | One Time member route | MEMBER_PARENT_PORTAL | none | /rabbi-member | /rabbi-member |
| student-login | Student-facing login route | STUDENT_PORTAL | none | /student/login | /student/login |
| student-portal | Student-facing portal route | STUDENT_PORTAL | none | /student.html | /student.html |
