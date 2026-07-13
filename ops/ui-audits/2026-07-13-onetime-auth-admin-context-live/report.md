# One Time Auth/Admin Context Live Smoke

Status: PASS
Generated: 2026-07-13T20:07:08.882Z
Base URL: https://join.onetimeonetime.com
Expected SHA: e973ce50b86e7566034faf8a604133a4870e4d7b
Deployed SHA: e973ce50b86e7566034faf8a604133a4870e4d7b
Target app: one-time

Read-only live proof for One Time Operations auth, admin-on-provider session context, scoped CRM readback, and provider/student console/request cleanliness.

## Guardrails

- No email, WhatsApp, payment, access grant, provider mutation, DNS change, or production data write was attempted.
- Private provider screenshot is DOM-redacted and includes a redaction overlay.
- Direct unauthenticated student session 401 is recorded only as expected API policy; /student/login must not emit it during first paint.

## Checks

| check | status | detail |
| --- | --- | --- |
| deploy_info_ok | PASS | {"status":200,"target_app":"one-time","commit_sha":"e973ce50b86e7566034faf8a604133a4870e4d7b"} |
| deploy_info_exact_sha | PASS | {"expected_sha":"e973ce50b86e7566034faf8a604133a4870e4d7b","actual_sha":"e973ce50b86e7566034faf8a604133a4870e4d7b"} |
| deploy_info_one_time_target | PASS | {"target_app":"one-time"} |
| operations_login_railway_auth | PASS | {"source":"railway","role":"super_admin","cookie_name":"bna_ops_session"} |
| provider_session_start_scoped | PASS | {"status":200,"mode":"admin_on_provider_account","view_url":"/provider.html?admin_provider=one-time&section=mailbox","provider":{"provider_name":"Rabbi Elie Scheller","login_username":"one_time_admin","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","status":"approved"},"provider_cookie_name":"bna_provider_session","password_returned":false,"secrets_included":false,"external_write_performed":false} |
| provider_session_readback_scoped | PASS | {"status":200,"provider":{"provider_name":"Rabbi Elie Scheller","login_username":"one_time_admin","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","status":"approved"},"external_write_performed":false} |
| operations_crm_contacts_readonly_scoped | PASS | {"status":200,"cards_count":3,"filtered_total":6,"external_write_performed":false,"no_send":true} |
| student_session_denial_classified_expected | PASS | {"status":401,"body_preview":"{\"error\":\"Student session is required\"}"} |
| provider_admin_crm_route_clean | PASS | {"status":200,"failed":0,"bad":0,"console":0,"screenshot":"ops/ui-audits/2026-07-13-onetime-auth-admin-context-live/provider-admin-crm-redacted.png"} |
| student_login_route_clean_without_session_probe | PASS | {"status":200,"failed":0,"bad":0,"console":0,"preview_banner_visible":false,"screenshot":"ops/ui-audits/2026-07-13-onetime-auth-admin-context-live/student-login.png"} |

## Browser Captures

| route | status | state | failed_bad_console | overflow | screenshot |
| --- | --- | --- | --- | --- | --- |
| /provider.html?admin_provider=one-time&section=crm | 200 | loaded | 0/0/0 | no | ops/ui-audits/2026-07-13-onetime-auth-admin-context-live/provider-admin-crm-redacted.png |
| /student/login | 200 | loaded | 0/0/0 | no | ops/ui-audits/2026-07-13-onetime-auth-admin-context-live/student-login.png |

No external send or production mutation was attempted.
