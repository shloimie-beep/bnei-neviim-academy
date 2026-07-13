# One Time Signup Form Matrix Live Smoke

- Base URL: https://join.onetimeonetime.com
- Started: 2026-07-13T09:15:12.884Z
- Deployed SHA: e0dd3d48543740efb32b35f64ad27cf0cc6e676b
- Status: FAILED
- Visible Sign Up Now CTAs: 5

## Scenarios

| ID | Status | POSTs | Detail |
| --- | --- | ---: | --- |
| success-family-email | PASS | 1 | Family + Email reminders + no phone |
| success-school-email | PASS | 1 | School + Email reminders + no phone |
| success-family-none | PASS | 1 | Family + No reminders + no phone |
| success-school-none | PASS | 1 | School + No reminders + no phone |
| success-whatsapp-phone | PASS | 1 | WhatsApp reminders + valid phone + consent |
| success-both-phone | PASS | 1 | Both reminders + valid phone + consent |
| error-whatsapp-no-phone | PASS | 0 | WhatsApp reminders + no phone |
| error-both-no-phone | PASS | 0 | Both reminders + no phone |
| error-missing-audience | PASS | 0 | Missing audience |
| error-missing-location | PASS | 0 | Missing location |
| error-missing-reminder | PASS | 0 | Missing reminder choice |
| error-invalid-email | PASS | 0 | Invalid email |
| switch-whatsapp-to-email | PASS | 1 | Switch WhatsApp to Email after phone error |
| switch-email-to-none | PASS | 1 | Switch Email to No reminders |
| family-school-family | PASS | 0 | Family to School and back |
| double-click | PASS | 1 | Double-click submit |
| server-validation-refresh | PASS | 1 | Refresh after a server validation failure |
| mobile-widths | PASS | 0 | Mobile widths 430px and 390px |
| keyboard-only | FAIL | 0 | Keyboard-only completion |

## Files

- JSON: C:\Users\User\BNA v2.0\ops\live-smokes\2026-07-13T09-15-12-884Z-one-time-signup-form-matrix-live.json
